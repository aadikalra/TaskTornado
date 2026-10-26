import { NextResponse } from 'next/server';
import { z } from 'zod';

import { authorizeAiAction } from '@/lib/ai/http';
import {
  checkTeenSafety,
  completeWithFallback,
  normalizeGroqMessages,
} from '@/lib/ai/groq';
import { recordRequestAiUsage, aiProviderErrorResponse } from '@/lib/ai/http';

const actionsSchema = z.array(
  z.discriminatedUnion('action', [
    z.object({
      action: z.literal('message'),
      text: z.string().max(4000),
    }),
    z.object({
      action: z.literal('highlight_text'),
      text: z.string().trim().min(1).max(1000),
    }),
    z.object({
      action: z.literal('add_comment'),
      text: z.string().trim().min(1).max(1000),
      comment: z.string().trim().min(1).max(2000),
      suggestedReplacement: z.string().max(2000).optional(),
    }),
  ])
).min(1).max(16);

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

    const requiresComments = /\b(comments?|feedback|review|critique|grade|suggest(?:ions?)?|improv(?:e|ements?))\b/i.test(lastUser) &&
      !/\b(?:no|without)\s+comments?\b|\bonly\s+highlight\b|\bhighlights?\s+only\b|\b(?:don't|do not)\s+(?:add\s+|leave\s+)?comments?\b/i.test(lastUser);
    const wantsHighlights = /\bhighlights?|highlighting\b/i.test(lastUser);
    const normalizeQuote = (text: string) => text.replace(/[‘’]/g, "'").replace(/[“”]/g, '"').replace(/\s+/g, ' ').trim();
    const documentForMatching = normalizeQuote(document);
    const needsRepair = (actions: z.infer<typeof actionsSchema>) =>
      (requiresComments && !actions.some(action => action.action === 'add_comment')) ||
      actions.some(action => action.action !== 'message' && !documentForMatching.includes(normalizeQuote(action.text)));

    const systemPrompt = `You are a student-safe writing coach. Give feedback rather
than writing a submission for the student. Return only a JSON array. Allowed
actions are {"action":"message","text":"..."}, {"action":"highlight_text",
"text":"exact document text"}, and {"action":"add_comment","text":"exact
document text","comment":"specific actionable feedback","suggestedReplacement":"optional short example"}.
Start with one short message action. When asked for comments, feedback, a review,
or improvements, use add_comment actions, not highlight_text. A highlight without
a comment is not feedback. Use highlight_text only when highlighting itself is
explicitly requested. Quote a short exact passage from DOCUMENT for every
annotation, preserving its wording and punctuation; never invent or paraphrase
the quoted text. Give 3-6 focused comments for an essay (fewer for a short text).
Each comment should explain the issue and how the student can improve it.
Do not rewrite the whole submission. ${requiresComments ? 'This request REQUIRES at least one add_comment action.' : ''}
${requiresComments && !wantsHighlights ? 'Do not return standalone highlight_text actions for this comment request.' : ''}`;
    const requestMessages = [
      { role: 'system' as const, content: systemPrompt },
      { role: 'user' as const, content: `DOCUMENT:\n${document}\n\nREQUEST:\n${lastUser}` },
    ];
    let result = await completeWithFallback({
      credentials: access.credentials,
      action: 'grader',
      messages: requestMessages,
      temperature: 0.3,
      maxTokens: 3500,
      signal: req.signal,
    });

    let actions = actionsSchema.safeParse((() => {
      try { return parseJson(result.content); } catch { return null; }
    })());
    let promptTokens = result.usage.prompt_tokens ?? 0;
    let completionTokens = result.usage.completion_tokens ?? 0;
    if (!actions.success || needsRepair(actions.data)) {
      result = await completeWithFallback({
        credentials: access.credentials,
        action: 'grader',
        messages: [...requestMessages, {
          role: 'user',
          content: 'Return the requested JSON actions again. The previous response did not provide valid feedback anchored to exact document passages. For a comment request, include add_comment actions with nonempty feedback, not highlights alone. Copy each quoted passage verbatim from DOCUMENT.',
        }],
        temperature: 0.1,
        maxTokens: 3500,
        signal: req.signal,
      });
      promptTokens += result.usage.prompt_tokens ?? 0;
      completionTokens += result.usage.completion_tokens ?? 0;
      actions = actionsSchema.safeParse((() => {
        try { return parseJson(result.content); } catch { return null; }
      })());
    }
    if (!actions.success || needsRepair(actions.data)) {
      return NextResponse.json(
        { error: 'Aurora could not produce comments tied to the exact document passages. Please try again.' },
        { status: 502 }
      );
    }
    const feedback = requiresComments && !wantsHighlights
      ? actions.data.filter(action => action.action !== 'highlight_text')
      : actions.data;
    const outputSafety = await checkTeenSafety(
      JSON.stringify(feedback),
      'output',
      req.signal
    );
    if (!outputSafety.safe) {
      return NextResponse.json(
        { error: 'The feedback did not pass the safety check.' },
        { status: 502 }
      );
    }

    await recordRequestAiUsage(
      access,
      'grader',
      result.model,
      promptTokens,
      completionTokens
    );
    return NextResponse.json({ actions: feedback });
  } catch (error) {
    const providerError = aiProviderErrorResponse(error);
    if (providerError) return providerError;
    console.error('Grader AI request failed.');
    return NextResponse.json(
      { error: 'Failed to generate writing feedback.' },
      { status: 500 }
    );
  }
}
