import { NextResponse } from 'next/server';

import {
  CONSENT_VERSION,
  getAgeGroup,
  SUPPORTED_COUNTRY_CODE,
} from '@/lib/legal/eligibility';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';

type GuardOptions = {
  limit?: number;
  windowMs?: number;
  requireAiEnabled?: boolean;
  rateLimitKey?: string;
};

type RateLimitEntry = {
  count: number;
  resetAt: number;
};

const rateLimits = new Map<string, RateLimitEntry>();

function getClientIp(request: Request): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown'
  );
}

function getBearerToken(request: Request): string | null {
  const authorization = request.headers.get('authorization')?.trim();
  if (!authorization) return null;

  const [scheme, token, ...rest] = authorization.split(/\s+/);
  if (scheme?.toLowerCase() !== 'bearer' || !token || rest.length > 0) {
    return null;
  }

  return token;
}

function consumeRateLimit(key: string, limit: number, windowMs: number) {
  const now = Date.now();
  const existing = rateLimits.get(key);

  if (!existing || now >= existing.resetAt) {
    rateLimits.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, retryAfter: 0 };
  }

  if (existing.count >= limit) {
    return {
      allowed: false,
      retryAfter: Math.max(1, Math.ceil((existing.resetAt - now) / 1000)),
    };
  }

  existing.count += 1;
  return { allowed: true, retryAfter: 0 };
}

export async function guardAuthenticatedRequest(
  request: Request,
  options: GuardOptions = {}
) {
  const {
    limit = 60,
    windowMs = 60_000,
    requireAiEnabled = false,
    rateLimitKey,
  } = options;

  const accessToken = getBearerToken(request);
  const supabase = await createClient(accessToken || undefined);
  const {
    data: { user },
    error,
  } = accessToken
    ? await supabase.auth.getUser(accessToken)
    : await supabase.auth.getUser();

  if (error || !user) {
    return {
      ok: false as const,
      response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
    };
  }

  // Eligibility must be readable even when the account has not completed the
  // eligibility migration yet. The normal user client is intentionally blocked
  // by the launch-eligibility RLS policy in that state, so read only this user's
  // profile with the server-side admin client after authenticating the session.
  const { data: profile, error: profileError } = await supabaseAdmin
    .from('profiles')
    .select(
      'date_of_birth,country_code,age_group,parental_consent_status,account_type'
    )
    .eq('id', user.id)
    .maybeSingle();

  if (profileError) {
    console.error('Eligibility profile lookup failed:', profileError);
    return {
      ok: false as const,
      response: NextResponse.json(
        { error: 'Account eligibility could not be checked.' },
        { status: 500 }
      ),
    };
  }

  const dateOfBirth =
    profile?.date_of_birth || user.user_metadata?.date_of_birth;
  const countryCode =
    profile?.country_code || user.user_metadata?.country_code;
  const ageGroup = dateOfBirth ? getAgeGroup(dateOfBirth) : null;

  if (!profile?.date_of_birth || !profile?.country_code) {
    return {
      ok: false as const,
      response: NextResponse.json(
        {
          error: 'Complete your account eligibility information to continue.',
          code: 'eligibility_setup_required',
        },
        { status: 428 }
      ),
    };
  }

  if (
    countryCode !== SUPPORTED_COUNTRY_CODE ||
    !ageGroup ||
    ageGroup === 'under_13'
  ) {
    return {
      ok: false as const,
      response: NextResponse.json(
        {
          error: 'This account is not eligible to use TaskTornado.',
          code: 'account_not_eligible',
        },
        { status: 403 }
      ),
    };
  }

  if (ageGroup === 'minor') {
    const { data: currentConsent, error: consentError } = await supabaseAdmin
      .from('parental_consent_requests')
      .select('id')
      .eq('student_id', user.id)
      .eq('consent_version', CONSENT_VERSION)
      .not('approved_at', 'is', null)
      .is('revoked_at', null)
      .limit(1)
      .maybeSingle();

    if (consentError) {
      console.error('Parental consent lookup failed:', consentError);
      return {
        ok: false as const,
        response: NextResponse.json(
          { error: 'Account eligibility could not be checked.' },
          { status: 500 }
        ),
      };
    }

    // The consent record is the durable audit source of truth. Auth metadata
    // can remain stale until the user's token is refreshed, so it must not be
    // the deciding factor for access.
    if (
      profile?.parental_consent_status !== 'approved' ||
      !currentConsent
    ) {
      return {
        ok: false as const,
        response: NextResponse.json(
          {
            error: 'Parent or guardian approval is required.',
            code: 'parental_consent_required',
          },
          { status: 403 }
        ),
      };
    }
  }

  const requestPath = new URL(request.url).pathname;
  const rateLimit = consumeRateLimit(
    `${rateLimitKey || requestPath}:${user.id}:${getClientIp(request)}`,
    limit,
    windowMs
  );

  if (!rateLimit.allowed) {
    return {
      ok: false as const,
      response: NextResponse.json(
        { error: 'Too many requests. Please try again shortly.' },
        {
          status: 429,
          headers: { 'Retry-After': String(rateLimit.retryAfter) },
        }
      ),
    };
  }

  if (
    requireAiEnabled &&
    process.env.AI_FEATURES_ENABLED !== 'true'
  ) {
    return {
      ok: false as const,
      response: NextResponse.json(
        {
          error: 'AI features are not enabled for this environment.',
        },
        { status: 503 }
      ),
    };
  }

  return {
    ok: true as const,
    user,
    profile,
    accessToken: accessToken || undefined,
  };
}

export function guardAiRequest(request: Request) {
  return guardAuthenticatedRequest(request, {
    // This is a transport-abuse ceiling. Actual per-minute provider usage is
    // enforced atomically by reserve_ai_burst, and daily use by
    // reserve_ai_quota. Keeping this separate prevents harmless status checks
    // from consuming chat capacity.
    limit: 30,
    windowMs: 60_000,
    requireAiEnabled: true,
    rateLimitKey: 'ai-provider',
  });
}
