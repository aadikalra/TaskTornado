import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { authorizeAiAction } from '@/lib/ai/http';
import { completeWithFallback } from '@/lib/ai/groq';
import { recordAiUsage } from '@/lib/ai/quota';

const resultSchema = z.object({
  worthy: z.boolean(),
  reason: z.string().max(300),
});

function extractObject(text: string) {
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start < 0 || end <= start) throw new Error('Invalid response.');
  return JSON.parse(text.slice(start, end + 1));
}
export async function POST(request: NextRequest) {
  const access = await authorizeAiAction(request, 'quick');
  if (!access.ok) return access.response;

  try {
    const { reason, gameTitle } = await request.json();
    if (typeof reason !== 'string' || typeof gameTitle !== 'string') {
      return NextResponse.json(
        { error: 'Missing required fields.' },
        { status: 400 }
      );
    }

    const result = await completeWithFallback({
      action: 'quick',
      messages: [
        {
          role: 'system',
          content: `Return JSON only: {"worthy":boolean,"reason":"brief"}.
This is a playful, low-stakes game-break check, not a judgment of the student.
Approve a reasonable study break or reward; gently deny obvious procrastination.`,
        },
        {
          role: 'user',
          content: `Game: ${gameTitle.slice(0, 100)}\nReason: ${reason.slice(0, 500)}`,
        },
      ],
      temperature: 0.2,
      maxTokens: 120,
      jsonMode: true,
      signal: request.signal,
    });
    const parsed = resultSchema.parse(extractObject(result.content));
    await recordAiUsage(
      'quick',
      result.model,
      result.usage.prompt_tokens,
      result.usage.completion_tokens
    );
    return NextResponse.json(parsed);
  } catch {
    return NextResponse.json(
      { worthy: false, reason: 'AI service unavailable.' },
      { status: 500 }
    );
  }
}
