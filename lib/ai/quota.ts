import {
  AI_PLAN_LIMITS,
  type AiAction,
  type ServerPlanTier,
} from '@/lib/ai/config';
import { createClient } from '@/lib/supabase/server';

type FallbackEntry = {
  combined: number;
  actions: Partial<Record<AiAction, number>>;
  resetAt: number;
};

const fallbackQuota = new Map<string, FallbackEntry>();
const fallbackBurst = new Map<string, { count: number; resetAt: number }>();

export function getFallbackAiUsage(userId: string) {
  const key = `${userId}:${new Date().toISOString().slice(0, 10)}`;
  const entry = fallbackQuota.get(key);
  return {
    combined: entry?.combined || 0,
    actions: { ...(entry?.actions || {}) },
  };
}

export type QuotaResult =
  | { allowed: true; remaining: number | null; source: 'database' | 'fallback' }
  | {
      allowed: false;
      remaining: 0;
      source: 'database' | 'fallback' | 'unavailable';
      reason: string;
    };

export async function reserveAiBurst(userId: string): Promise<QuotaResult> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc('reserve_ai_burst' as never);

  if (!error && data && typeof data === 'object') {
    const result = data as {
      allowed?: boolean;
      remaining?: number;
      reason?: string;
    };
    return result.allowed
      ? {
          allowed: true,
          remaining:
            typeof result.remaining === 'number' ? result.remaining : null,
          source: 'database',
        }
      : {
          allowed: false,
          remaining: 0,
          source: 'database',
          reason: result.reason || 'Too many AI requests. Try again shortly.',
        };
  }

  if (process.env.NODE_ENV === 'production') {
    console.error('AI burst limiter database function unavailable.');
    return {
      allowed: false,
      remaining: 0,
      source: 'unavailable',
      reason: 'AI usage controls are temporarily unavailable.',
    };
  }

  const now = Date.now();
  const current = fallbackBurst.get(userId);
  const entry =
    !current || current.resetAt <= now
      ? { count: 0, resetAt: now + 60_000 }
      : current;

  if (entry.count >= 4) {
    return {
      allowed: false,
      remaining: 0,
      source: 'fallback',
      reason: 'Four AI requests per minute are allowed. Try again shortly.',
    };
  }

  entry.count += 1;
  fallbackBurst.set(userId, entry);
  return {
    allowed: true,
    remaining: 4 - entry.count,
    source: 'fallback',
  };
}

function reserveFallback(
  userId: string,
  action: AiAction,
  tier: ServerPlanTier
): QuotaResult {
  const now = Date.now();
  const limits = AI_PLAN_LIMITS[tier];
  const key = `${userId}:${new Date().toISOString().slice(0, 10)}`;
  const current = fallbackQuota.get(key);
  const entry =
    !current || current.resetAt <= now
      ? {
          combined: 0,
          actions: {},
          resetAt: now + 24 * 60 * 60 * 1000,
        }
      : current;
  const actionCount = entry.actions[action] || 0;
  const actionLimit = limits[action];

  if (actionCount >= actionLimit || entry.combined >= limits.combined) {
    return {
      allowed: false,
      remaining: 0,
      source: 'fallback',
      reason: 'Your AI allowance for today has been used.',
    };
  }

  entry.actions[action] = actionCount + 1;
  entry.combined += 1;
  fallbackQuota.set(key, entry);
  return {
    allowed: true,
    remaining: Math.min(
      actionLimit - actionCount - 1,
      limits.combined - entry.combined
    ),
    source: 'fallback',
  };
}

export async function reserveAiQuota(
  userId: string,
  action: AiAction,
  tier: ServerPlanTier = 'free'
): Promise<QuotaResult> {
  const limits = AI_PLAN_LIMITS[tier];
  const supabase = await createClient();
  const { data, error } = await supabase.rpc('reserve_ai_quota' as never, {
    p_action: action,
    p_action_limit: limits[action],
    p_combined_limit: limits.combined,
  } as never);

  if (!error && data && typeof data === 'object') {
    const result = data as {
      allowed?: boolean;
      remaining?: number;
      reason?: string;
    };
    return result.allowed
      ? {
          allowed: true,
          remaining:
            typeof result.remaining === 'number' ? result.remaining : null,
          source: 'database',
        }
      : {
          allowed: false,
          remaining: 0,
          source: 'database',
          reason: result.reason || 'Your AI allowance for today has been used.',
        };
  }

  if (process.env.NODE_ENV === 'production') {
    console.error('AI daily quota database function unavailable.');
    return {
      allowed: false,
      remaining: 0,
      source: 'unavailable',
      reason: 'AI usage controls are temporarily unavailable.',
    };
  }

  // Keep local/pre-migration development usable without weakening production.
  console.warn('AI quota database function unavailable; using safe fallback.');
  return reserveFallback(userId, action, tier);
}

export async function recordAiUsage(
  action: AiAction,
  model: string,
  promptTokens = 0,
  completionTokens = 0
) {
  const supabase = await createClient();
  const { error } = await supabase.rpc('record_ai_usage' as never, {
    p_action: action,
    p_model: model.slice(0, 100),
    p_prompt_tokens: Math.max(0, promptTokens),
    p_completion_tokens: Math.max(0, completionTokens),
  } as never);

  if (error) {
    console.warn('AI usage metrics could not be recorded.');
  }
}
