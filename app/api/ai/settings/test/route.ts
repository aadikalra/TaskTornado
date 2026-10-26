import { NextResponse } from 'next/server';
import { guardAuthenticatedRequest } from '@/lib/api/request-guard';
import { getAiConnection } from '@/lib/ai/byok';
import { completeWithPersonalKey, ProviderRequestError } from '@/lib/ai/provider-client';
import { reserveAiBurst } from '@/lib/ai/quota';

export async function POST(request: Request) {
  const origin = request.headers.get('origin');
  if (origin && origin !== new URL(request.url).origin) return NextResponse.json({ error: 'Invalid request origin.' }, { status: 403 });
  const access = await guardAuthenticatedRequest(request, { limit: 4, rateLimitKey: 'ai-connection-test', requireAiEnabled: true });
  if (!access.ok) return access.response;
  try {
    const { credentials } = await getAiConnection(access.user.id);
    if (!credentials) return NextResponse.json({ error: 'Save and enable your own key first.' }, { status: 400 });
    const burst = await reserveAiBurst(access.user.id, access.accessToken);
    if (!burst.allowed) return NextResponse.json({ error: burst.reason }, { status: burst.source === 'unavailable' ? 503 : 429 });
    await completeWithPersonalKey({
      credentials,
      messages: [{ role: 'user', content: 'Reply with OK.' }],
      maxTokens: 32,
      signal: request.signal,
    });
    return NextResponse.json({ ok: true }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    return NextResponse.json({ error: error instanceof ProviderRequestError ? error.message : 'Could not test your AI connection.' },
      { status: error instanceof ProviderRequestError ? error.status : 503 });
  }
}
