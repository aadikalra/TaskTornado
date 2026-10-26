import { supabaseAdmin } from '@/lib/supabase/admin';
import { decryptAiKey, hasAiKeyEncryption } from '@/lib/ai/key-encryption';
import { isAiProvider, type AiConnectionSummary, type AiCredentials } from '@/lib/ai/providers';

export type AiSettingsRow = {
  user_id: string;
  provider: string;
  model: string;
  encrypted_key: string;
  key_hint: string;
  enabled: boolean;
};

export async function readAiSettings(userId: string) {
  const { data, error } = await supabaseAdmin.from('ai_provider_settings' as never)
    .select('user_id,provider,model,encrypted_key,key_hint,enabled').eq('user_id', userId).maybeSingle();
  if (error) {
    if (error.code === '42P01' || error.code === 'PGRST205') return { available: false, row: null };
    throw new Error('AI settings could not be loaded.');
  }
  return { available: hasAiKeyEncryption(), row: data as AiSettingsRow | null };
}

export function summarizeAiSettings(available: boolean, row: AiSettingsRow | null): AiConnectionSummary {
  return {
    available,
    configured: Boolean(row),
    enabled: Boolean(row?.enabled),
    provider: row && isAiProvider(row.provider) ? row.provider : null,
    model: row?.model || '',
    keyHint: row?.key_hint || '',
  };
}

export async function getAiConnection(userId: string, purpose: 'chat' | 'transcription' = 'chat') {
  const { available, row } = await readAiSettings(userId);
  const summary = summarizeAiSettings(available, row);
  if (!row?.enabled) return { summary, credentials: undefined };
  // Ramblr's speech service uses Groq. Other routers use the hosted speech allowance.
  if (purpose === 'transcription' && row.provider !== 'groq') return { summary, credentials: undefined };
  if (!available || !isAiProvider(row.provider)) throw new Error('Your personal AI connection needs attention in AI settings.');
  let apiKey: string;
  try {
    apiKey = decryptAiKey(row.encrypted_key, `${userId}:${row.provider}`);
  } catch {
    throw new Error('Your personal API key could not be read. Save it again in AI settings.');
  }
  const credentials: AiCredentials = { provider: row.provider, model: row.model, apiKey };
  return { summary, credentials };
}
