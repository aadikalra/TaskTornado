import { NextResponse } from 'next/server';

import type { AiAction } from '@/lib/ai/config';
import { recordAiUsage, reserveAiBurst, reserveAiQuota } from '@/lib/ai/quota';
import { guardAiRequest } from '@/lib/api/request-guard';

import { getAiConnection } from '@/lib/ai/byok';
import type { AiCredentials } from '@/lib/ai/providers';
import { ProviderRequestError } from '@/lib/ai/provider-client';

export function aiProviderErrorResponse(error: unknown) {
  return error instanceof ProviderRequestError
    ? NextResponse.json({ error: error.message, code: 'personal_provider_error' }, { status: error.status })
    : null;
}

export async function recordRequestAiUsage(
  access: { accessToken?: string; credentials?: AiCredentials },
  action: AiAction, model: string, promptTokens = 0, completionTokens = 0
) {
  if (!access.credentials) await recordAiUsage(action, model, promptTokens, completionTokens, access.accessToken);
}

export async function authorizeAiAction(
  request: Request,
  action: AiAction,
  purpose: 'chat' | 'transcription' = 'chat'
) {
  const access = await guardAiRequest(request);
  if (!access.ok) return access;

  let credentials: AiCredentials | undefined;
  try {
    ({ credentials } = await getAiConnection(access.user.id, purpose));
  } catch (error) {
    return { ok: false as const, response: NextResponse.json({ error: (error as Error).message }, { status: 503 }) };
  }
  const tier = 'free' as const;

  const burst = await reserveAiBurst(access.user.id, access.accessToken);
  if (!burst.allowed) {
    return {
      ok: false as const,
      response: NextResponse.json(
        {
          error:
            burst.source === 'unavailable'
              ? 'AI temporarily unavailable'
              : 'Too many AI requests',
          details: burst.reason,
        },
        {
          status: burst.source === 'unavailable' ? 503 : 429,
          headers:
            burst.source === 'database' ? { 'Retry-After': '60' } : undefined,
        }
      ),
    };
  }

  const quota = credentials ? { allowed: true as const, remaining: null, source: 'personal-key' as const } : await reserveAiQuota(
    access.user.id,
    action,
    tier,
    access.accessToken
  );
  if (!quota.allowed) {
    return {
      ok: false as const,
      response: NextResponse.json(
        {
          error: 'AI limit reached',
          details: quota.reason,
        },
        { status: quota.source === 'unavailable' ? 503 : 429 }
      ),
    };
  }

  return { ...access, quota, tier, credentials };
}

export function createSseResponse(
  events: Array<Record<string, unknown>>
) {
  const encoder = new TextEncoder();
  return new Response(
    new ReadableStream({
      start(controller) {
        for (const event of events) {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify(event)}\n\n`)
          );
        }
        controller.close();
      },
    }),
    {
      headers: {
        'Content-Type': 'text/event-stream; charset=utf-8',
        'Cache-Control': 'no-cache, no-transform',
        Connection: 'keep-alive',
        'X-Content-Type-Options': 'nosniff',
      },
    }
  );
}

export function textEvents(
  text: string,
  field: 'response' | 'translation' = 'response'
) {
  const chunks = text.match(/[\s\S]{1,120}/g) || [];
  return [
    ...chunks.map((chunk) => ({ [field]: chunk, done: false })),
    { [field]: '', done: true },
  ];
}
