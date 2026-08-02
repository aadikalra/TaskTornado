import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { authorizeAiAction } from '@/lib/ai/http';
import {
  checkTeenSafety,
  completeWithFallback,
  normalizeGroqMessages,
} from '@/lib/ai/groq';
import { recordAiUsage } from '@/lib/ai/quota';

export async function POST(req: NextRequest) {
  const access = await authorizeAiAction(req, 'copilot');
  if (!access.ok) return access.response;

  try {
    const { prompt, system } = await req.json();
    if (typeof prompt !== 'string' || !prompt.trim()) {
      return NextResponse.json({ error: 'Prompt required.' }, { status: 400 });
    }

    const safety = await checkTeenSafety(prompt, 'input', req.signal);
    if (!safety.safe) {
      return NextResponse.json(
        { error: 'This request is not available in the student writing tool.' },
        { status: 400 }
      );
    }

    const messages = normalizeGroqMessages([
      {
        role: 'system',
        content:
          'You are an age-appropriate writing assistant. Continue or revise text without creating harmful content or impersonating the student.',
      },
      ...(typeof system === 'string'
        ? [{ role: 'system', content: system }]
        : []),
      { role: 'user', content: prompt },
    ]);
    const result = await completeWithFallback({
      action: 'copilot',
      messages,
      temperature: 0.4,
      signal: req.signal,
    });

    const outputSafety = await checkTeenSafety(
      result.content,
      'output',
      req.signal
    );
    if (!outputSafety.safe) {
      return NextResponse.json(
        { error: 'The generated text did not pass the safety check.' },
        { status: 502 }
      );
    }

    await recordAiUsage(
      'copilot',
      result.model,
      result.usage.prompt_tokens,
      result.usage.completion_tokens
    );
    return NextResponse.json({ text: result.content });
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      return NextResponse.json(null, { status: 408 });
    }
    console.error('Copilot AI request failed.');
    return NextResponse.json(
      { error: 'Failed to process AI request.' },
      { status: 500 }
    );
  }
}
