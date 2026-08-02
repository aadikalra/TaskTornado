import { NextRequest, NextResponse } from 'next/server';

import { guardAuthenticatedRequest } from '@/lib/api/request-guard';
import {
  AI_PLAN_LIMITS,
  type AiAction,
  type ServerPlanTier,
} from '@/lib/ai/config';
import { getFallbackAiUsage } from '@/lib/ai/quota';
import { supabaseAdmin } from '@/lib/supabase/admin';

const ACTIONS: AiAction[] = [
  'quick',
  'tutor',
  'bulk_generation',
  'guardian',
  'translation',
  'grader',
  'copilot',
];

function getServerPlanTier(value: unknown): ServerPlanTier {
  return value === 'pro' || value === 'family' ? value : 'free';
}

function getNextUtcMidnight() {
  const reset = new Date();
  reset.setUTCHours(24, 0, 0, 0);
  return reset.toISOString();
}

export async function GET(request: NextRequest) {
  const access = await guardAuthenticatedRequest(request, {
    limit: 60,
    windowMs: 60_000,
    requireAiEnabled: true,
    rateLimitKey: 'ai-usage',
  });
  if (!access.ok) return access.response;

  const tier = getServerPlanTier(access.user.app_metadata?.plan_tier);
  const limits = AI_PLAN_LIMITS[tier];
  const today = new Date().toISOString().slice(0, 10);

  const { data, error } = await supabaseAdmin
    .from('ai_usage_daily' as never)
    .select('combined_actions,action_counts')
    .eq('user_id', access.user.id)
    .eq('usage_date', today)
    .maybeSingle();

  const missingMigration =
    error?.code === '42P01' ||
    error?.code === 'PGRST205' ||
    error?.message?.includes('ai_usage_daily');

  if (error && !missingMigration) {
    console.error('AI usage summary lookup failed:', error);
    return NextResponse.json(
      { error: 'AI usage could not be loaded.' },
      { status: 500 }
    );
  }

  const row = data as
    | { combined_actions?: number; action_counts?: Record<string, number> }
    | null;
  const fallbackUsage = missingMigration
    ? getFallbackAiUsage(access.user.id)
    : null;
  const actionCounts = ACTIONS.reduce<Record<AiAction, number>>(
    (counts, action) => {
      counts[action] = Math.max(
        0,
        Number(
          fallbackUsage?.actions[action] ||
          row?.action_counts?.[action] ||
          0
        )
      );
      return counts;
    },
    {} as Record<AiAction, number>
  );

  return NextResponse.json({
    tier,
    limits,
    usage: {
      combined: Math.max(
        0,
        Number(fallbackUsage?.combined || row?.combined_actions || 0)
      ),
      actions: actionCounts,
    },
    burst: {
      limit: 4,
      windowSeconds: 60,
    },
    resetAt: getNextUtcMidnight(),
    source: missingMigration ? 'local-fallback' : 'database',
  });
}
