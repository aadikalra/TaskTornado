import { NextResponse } from 'next/server';
import { guardAuthenticatedRequest } from '@/lib/api/request-guard';
import { readAiSettings, summarizeAiSettings } from '@/lib/ai/byok';
import { encryptAiKey } from '@/lib/ai/key-encryption';
import { validateAiConnection, isAiProvider } from '@/lib/ai/providers';
import { supabaseAdmin } from '@/lib/supabase/admin';

export const runtime = 'nodejs';
const headers = { 'Cache-Control': 'no-store' };

function hasForeignOrigin(request: Request) {
  const origin = request.headers.get('origin');
  return origin !== null && origin !== new URL(request.url).origin;
}

export async function GET(request: Request) {
  const access = await guardAuthenticatedRequest(request, { rateLimitKey: 'ai-settings' });
  if (!access.ok) return access.response;
  try {
    const { available, row } = await readAiSettings(access.user.id);
    return NextResponse.json(summarizeAiSettings(available, row), { headers });
  } catch {
    return NextResponse.json({ error: 'AI settings could not be loaded.' }, { status: 503, headers });
  }
}

export async function PUT(request: Request) {
  if (hasForeignOrigin(request)) return NextResponse.json({ error: 'Invalid request origin.' }, { status: 403, headers });
  const access = await guardAuthenticatedRequest(request, { limit: 10, rateLimitKey: 'ai-settings-write' });
  if (!access.ok) return access.response;
  try {
    if (Number(request.headers.get('content-length')) > 4096) {
      return NextResponse.json({ error: 'Settings request is too large.' }, { status: 413, headers });
    }
    const rawBody = await request.text();
    if (Buffer.byteLength(rawBody) > 4096) return NextResponse.json({ error: 'Settings request is too large.' }, { status: 413, headers });
    let body;
    try { body = JSON.parse(rawBody); } catch { return NextResponse.json({ error: 'Invalid settings request.' }, { status: 400, headers }); }
    if (!body || typeof body !== 'object' || Array.isArray(body)) return NextResponse.json({ error: 'Invalid settings request.' }, { status: 400, headers });
    const { available, row } = await readAiSettings(access.user.id);
    if (typeof body.enabled !== 'boolean') return NextResponse.json({ error: 'Choose free AI or your own key.' }, { status: 400, headers });

    // A source toggle preserves the existing provider and encrypted key.
    if (body.provider === undefined) {
      if (body.enabled && !available) return NextResponse.json({ error: 'Personal AI keys are not configured on this server yet.' }, { status: 503, headers });
      if (body.enabled && !row) return NextResponse.json({ error: 'Save an API key first.' }, { status: 400, headers });
      if (!row) return NextResponse.json(summarizeAiSettings(available, null), { headers });
      const { error } = await supabaseAdmin.from('ai_provider_settings' as never)
        .update({ enabled: body.enabled, updated_at: new Date().toISOString() } as never).eq('user_id', access.user.id);
      if (error) throw error;
      return NextResponse.json(summarizeAiSettings(available, { ...row, enabled: body.enabled }), { headers });
    }
    if (!available) return NextResponse.json({ error: 'Personal AI keys are not configured on this server yet.' }, { status: 503, headers });
    const provider = body.provider;
    const model = typeof body.model === 'string' ? body.model.trim() : body.model;
    const apiKey = typeof body.apiKey === 'string' ? body.apiKey.trim() : undefined;
    try {
      validateAiConnection(provider, model, apiKey || undefined);
    } catch (error) {
      return NextResponse.json({ error: (error as Error).message }, { status: 400, headers });
    }
    if (!isAiProvider(provider) || typeof model !== 'string') return NextResponse.json({ error: 'Invalid provider settings.' }, { status: 400, headers });
    if (!apiKey && (!row || row.provider !== provider)) {
      return NextResponse.json({ error: 'Enter an API key for this provider.' }, { status: 400, headers });
    }
    const saved = {
      user_id: access.user.id,
      provider,
      model,
      encrypted_key: apiKey ? encryptAiKey(apiKey, `${access.user.id}:${provider}`) : row!.encrypted_key,
      key_hint: apiKey ? apiKey.slice(-4) : row!.key_hint,
      enabled: body.enabled,
    };
    const { error } = await supabaseAdmin.from('ai_provider_settings' as never)
      .upsert({ ...saved, updated_at: new Date().toISOString() } as never, { onConflict: 'user_id' });
    if (error) throw error;
    return NextResponse.json(summarizeAiSettings(available, saved), { headers });
  } catch {
    return NextResponse.json({ error: 'Your AI connection could not be saved.' }, { status: 503, headers });
  }
}

export async function DELETE(request: Request) {
  if (hasForeignOrigin(request)) return NextResponse.json({ error: 'Invalid request origin.' }, { status: 403, headers });
  const access = await guardAuthenticatedRequest(request, { limit: 10, rateLimitKey: 'ai-settings-write' });
  if (!access.ok) return access.response;
  const { error } = await supabaseAdmin.from('ai_provider_settings' as never).delete().eq('user_id', access.user.id);
  if (error) return NextResponse.json({ error: 'Your key could not be removed.' }, { status: 503, headers });
  return NextResponse.json(summarizeAiSettings(true, null), { headers });
}
