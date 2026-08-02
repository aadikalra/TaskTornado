import { NextResponse } from 'next/server';
import { z } from 'zod';

import { authorizeAiAction } from '@/lib/ai/http';
import {
  checkTeenSafety,
  completeWithFallback,
  normalizeGroqMessages,
} from '@/lib/ai/groq';
import { recordAiUsage } from '@/lib/ai/quota';

const actionsSchema = z.array(
  z.discriminatedUnion('action', [
    z.object({
      action: z.literal('message'),
      text: z.string().max(4000),
    }),
    z.object({
      action: z.literal('highlight_text'),
      text: z.string().max(1000),
    }),
    z.object({
      action: z.literal('add_comment'),
      text: z.string().max(1000),
      comment: z.string().max(2000),
      suggestedReplacement: z.string().max(2000).optional(),
    }),
  ])
);

function parseJson(text: string) {
  const start = text.indexOf('[');
  const end = text.lastIndexOf(']');
  if (start < 0 || end <= start) throw new Error('Invalid grader response.');
  return JSON.parse(text.slice(start, end + 1));
}
export async function POST(req: Request) {
  const access = await authorizeAiAction(req, 'grader');
  if (!access.ok) return access.response;

  try {
    const { messages, documentContent } = await req.json();
    const document =
      typeof documentContent === 'string'
        ? documentContent.slice(0, 16_000)
        : '';
    const userMessages = normalizeGroqMessages(messages);
    const lastUser = [...userMessages]
      .reverse()
      .find((message) => message.role === 'user')?.content;
    if (!lastUser || !document) {
      return NextResponse.json(
        { error: 'Document content and a message are required.' },
        { status: 400 }
      );
    }

    const inputSafety = await checkTeenSafety(
      `${lastUser}\n${document}`,
      'input',
      req.signal
    );
    if (!inputSafety.safe) {
      return NextResponse.json(
        { error: 'This document request cannot be processed.' },
        { status: 400 }
      );
    }

    const result = await completeWithFallback({
      action: 'grader',
      messages: [
        {
          role: 'system',
          content: `You are a student-safe writing coach. Give feedback rather
than writing a submission for the student. Return only a JSON array. Allowed
actions are {"action":"message","text":"..."}, {"action":"highlight_text",
"text":"exact document text"}, and {"action":"add_comment","text":"exact
document text","comment":"feedback","suggestedReplacement":"short example"}.
Start with one message action. Use exact excerpts for comments.`,
        },
        {
          role: 'user',
          content: `DOCUMENT:\n${document}\n\nREQUEST:\n${lastUser}`,
        },
      ],
      temperature: 0.3,
      maxTokens: 1500,
      signal: req.signal,
    });

    const actions = actionsSchema.parse(parseJson(result.content));
    const outputSafety = await checkTeenSafety(
      JSON.stringify(actions),
      'output',
      req.signal
    );
    if (!outputSafety.safe) {
      return NextResponse.json(
        { error: 'The feedback did not pass the safety check.' },
        { status: 502 }
      );
    }

    await recordAiUsage(
      'grader',
      result.model,
      result.usage.prompt_tokens,
      result.usage.completion_tokens
    );
    return NextResponse.json({ actions });
  } catch {
    console.error('Grader AI request failed.');
    return NextResponse.json(
      { error: 'Failed to generate writing feedback.' },
      { status: 500 }
    );
  }
}
