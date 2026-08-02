import { NextRequest, NextResponse } from 'next/server';

import { SUPPORTED_LANGUAGES } from '@/config/languages';
import { authorizeAiAction, createSseResponse, textEvents } from '@/lib/ai/http';
import {
  checkTeenSafety,
  completeWithFallback,
} from '@/lib/ai/groq';
import { recordAiUsage } from '@/lib/ai/quota';

export async function POST(req: NextRequest) {
  const access = await authorizeAiAction(req, 'translation');
  if (!access.ok) return access.response;

  try {
    const { text, sourceLanguage, targetLanguage } = await req.json();
    if (
      typeof text !== 'string' ||
      !text.trim() ||
      typeof sourceLanguage !== 'string' ||
      typeof targetLanguage !== 'string'
    ) {
      return NextResponse.json(
        { error: 'Text and both languages are required.' },
        { status: 400 }
      );
    }

    const source = SUPPORTED_LANGUAGES.find(
      (language) => language.code === sourceLanguage
    );
    const target = SUPPORTED_LANGUAGES.find(
      (language) => language.code === targetLanguage
    );
    if (!source || !target) {
      return NextResponse.json(
        { error: 'Unsupported language.' },
        { status: 400 }
      );
    }

    const safeInput = await checkTeenSafety(text, 'input', req.signal);
    if (!safeInput.safe) {
      return NextResponse.json(
        { error: 'This text cannot be processed by the student translator.' },
        { status: 400 }
      );
    }

    const result = await completeWithFallback({
      action: 'translation',
      messages: [
        {
          role: 'system',
          content: `Translate accurately from ${source.name} to ${target.name}.
Return exactly:
[TRANSLATION]
translation

[PRONUNCIATION]
short pronunciation guide

[EXPLANATION]
brief English explanation of important nuance.`,
        },
        { role: 'user', content: text.slice(0, 10_000) },
      ],
      temperature: 0.2,
      maxTokens: 1500,
      signal: req.signal,
    });

    const safeOutput = await checkTeenSafety(
      result.content,
      'output',
      req.signal
    );
    if (!safeOutput.safe) {
      return NextResponse.json(
        { error: 'The translation did not pass the safety check.' },
        { status: 502 }
      );
    }

    await recordAiUsage(
      'translation',
      result.model,
      result.usage.prompt_tokens,
      result.usage.completion_tokens
    );
    return createSseResponse(textEvents(result.content, 'translation'));
  } catch {
    console.error('Translation request failed.');
    return NextResponse.json(
      { error: 'Translation service unavailable.' },
      { status: 500 }
    );
  }
}
