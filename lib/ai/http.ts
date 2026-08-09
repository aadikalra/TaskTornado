import { NextResponse } from 'next/server';

import type { AiAction, ServerPlanTier } from '@/lib/ai/config';
import { reserveAiBurst, reserveAiQuota } from '@/lib/ai/quota';
import { guardAiRequest } from '@/lib/api/request-guard';

function getServerPlanTier(value: unknown): ServerPlanTier {
  return value === 'pro' || value === 'family' ? value : 'free';
}

export async function authorizeAiAction(
  request: Request,
  action: AiAction,
  requiredTier?: ServerPlanTier
) {
  const access = await guardAiRequest(request);
  if (!access.ok) return access;

  // Paid access is read only from server-managed auth metadata. The temporary
  // client plan cookie may change the preview UI, but cannot raise API quotas.
  const tier = getServerPlanTier(access.user.app_metadata?.plan_tier);
  if (requiredTier && tier !== requiredTier) {
    return {
      ok: false as const,
      response: NextResponse.json(
        { error: `${requiredTier} plan required.` },
        { status: 403 }
      ),
    };
  }

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

  const quota = await reserveAiQuota(
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

  return { ...access, quota, tier };
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
