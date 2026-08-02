import { NextRequest } from 'next/server';
import { z } from 'zod';

import { authorizeAiAction } from '@/lib/ai/http';
import { completeWithFallback } from '@/lib/ai/groq';
import { recordAiUsage } from '@/lib/ai/quota';

export const dynamic = 'force-dynamic';

const gradeDataSchema = z.object({
  assignments: z
    .array(
      z.object({
        name: z.string().max(300),
        category: z.enum(['practice', 'assessment']),
        pointsEarned: z.number().finite(),
        pointsPossible: z.number().positive().finite(),
      })
    )
    .max(150),
});

function extractObject(text: string) {
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start < 0 || end <= start) throw new Error('Invalid grade response.');
  return JSON.parse(text.slice(start, end + 1));
}
export async function POST(req: NextRequest) {
  const access = await authorizeAiAction(req, 'quick');
  if (!access.ok) return access.response;

  try {
    const { rawText } = await req.json();
    if (typeof rawText !== 'string' || !rawText.trim()) {
      return Response.json({ error: 'No grade data provided.' }, { status: 400 });
    }

    const result = await completeWithFallback({
      action: 'quick',
      messages: [
        {
          role: 'system',
          content: `Extract gradebook assignments as JSON only:
{"assignments":[{"name":"...","category":"practice|assessment",
"pointsEarned":0,"pointsPossible":100}]}. Tests, exams, quizzes, finals,
midterms and summatives are assessment; other work is practice. Convert
percentages to points out of 100. Skip exempt/excluded/-- items.`,
        },
        {
          role: 'user',
          content: rawText.slice(0, 18_000),
        },
      ],
      temperature: 0,
      maxTokens: 1500,
      jsonMode: true,
      signal: req.signal,
    });

    const parsed = gradeDataSchema.parse(extractObject(result.content));
    await recordAiUsage(
      'quick',
      result.model,
      result.usage.prompt_tokens,
      result.usage.completion_tokens
    );
    return new Response(JSON.stringify(parsed), {
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
    });
  } catch {
    console.error('Grade parser request failed.');
    return Response.json(
      { error: 'Failed to parse grade data.' },
      { status: 500 }
    );
  }
}
