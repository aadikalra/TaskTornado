import { NextRequest, NextResponse } from 'next/server';

import { SUPPORTED_LANGUAGES } from '@/config/languages';
import { authorizeAiAction, createSseResponse, textEvents } from '@/lib/ai/http';
import {
  checkTeenSafety,
  completeWithFallback,
  GroqRequestError,
} from '@/lib/ai/groq';
import { recordRequestAiUsage, aiProviderErrorResponse } from '@/lib/ai/http';

export async function POST(req: NextRequest) {
  try {
    const access = await authorizeAiAction(req, 'translation');
    if (!access.ok) return access.response;
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
      credentials: access.credentials,
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

    if (!result.content.trim()) {
      return NextResponse.json(
        { error: 'The translation service returned an empty result. Please try again.' },
        { status: 502 }
      );
    }

    await recordRequestAiUsage(
      access,
      'translation',
      result.model,
      result.usage.prompt_tokens,
      result.usage.completion_tokens
    );
    return createSseResponse(textEvents(result.content, 'translation'));
  } catch (error) {
    const providerError = aiProviderErrorResponse(error);
    if (providerError) return providerError;
    if (error instanceof GroqRequestError) {
      return NextResponse.json(
        { error: error.status === 429
          ? 'The translation service is busy. Please try again shortly.'
          : error.status === 401 || error.status === 403
            ? 'The translation service’s AI connection needs attention.'
            : error.status === 503
              ? 'The translation service is not available right now. Please try again shortly.'
              : 'The translation model is temporarily unavailable. Please try again.' },
        { status: error.status === 429 ? 429 : 503,
          headers: error.retryAfter ? { 'Retry-After': error.retryAfter } : undefined }
      );
    }
    console.error('Translation request failed.');
    return NextResponse.json(
      { error: 'Translation service unavailable.' },
      { status: 500 }
    );
  }
}
