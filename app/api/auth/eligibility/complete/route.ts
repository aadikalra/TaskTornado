import { NextRequest, NextResponse } from 'next/server';

import {
  CONSENT_VERSION,
  getAgeGroup,
  normalizeEmail,
  SUPPORTED_COUNTRY_CODE,
} from '@/lib/legal/eligibility';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';

function isValidDateOnly(value: unknown): value is string {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const parsed = new Date(`${value}T00:00:00.000Z`);
  return (
    !Number.isNaN(parsed.getTime()) &&
    parsed.toISOString().slice(0, 10) === value
  );
}

function isEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user || !user.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const dateOfBirth = body.dateOfBirth;
    const countryCode = body.countryCode;
    const termsAccepted = body.termsAccepted === true;
    const guardianEmail =
      typeof body.guardianEmail === 'string'
        ? normalizeEmail(body.guardianEmail)
        : '';

    if (!isValidDateOnly(dateOfBirth)) {
      return NextResponse.json(
        { error: 'Enter a valid date of birth.' },
        { status: 400 }
      );
    }

    if (countryCode !== SUPPORTED_COUNTRY_CODE) {
      return NextResponse.json(
        { error: 'TaskTornado is currently available only in the United States.' },
        { status: 403 }
      );
    }

    if (!termsAccepted) {
      return NextResponse.json(
        { error: 'Review and accept the Privacy Policy and Terms to continue.' },
        { status: 400 }
      );
    }

    const ageGroup = getAgeGroup(dateOfBirth);
    if (!ageGroup) {
      return NextResponse.json(
        { error: 'Enter a valid date of birth.' },
        { status: 400 }
      );
    }

    if (ageGroup === 'under_13') {
      return NextResponse.json(
        { error: 'TaskTornado is not available to children under 13.' },
        { status: 403 }
      );
    }

    const { data: existingProfile, error: profileLookupError } =
      await supabaseAdmin
        .from('profiles')
        .select('account_type')
        .eq('id', user.id)
        .maybeSingle();

    if (profileLookupError) throw profileLookupError;

    const accountType =
      existingProfile?.account_type === 'guardian' ||
      user.user_metadata?.account_type === 'guardian'
        ? 'guardian'
        : 'student';

    if (accountType === 'guardian' && ageGroup !== 'adult') {
      return NextResponse.json(
        { error: 'Guardian accounts must belong to an adult.' },
        { status: 403 }
      );
    }

    if (
      ageGroup === 'minor' &&
      (
        !isEmail(guardianEmail) ||
        guardianEmail === normalizeEmail(user.email)
      )
    ) {
      return NextResponse.json(
        {
          error:
            'Enter a valid parent or guardian email that is different from your own.',
        },
        { status: 400 }
      );
    }

    const parentalConsentStatus =
      ageGroup === 'minor' ? 'pending' : 'not_required';
    const acceptedAt = new Date().toISOString();

    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .upsert(
        {
          id: user.id,
          email: user.email,
          full_name: user.user_metadata?.full_name || null,
          account_type: accountType,
          date_of_birth: dateOfBirth,
          country_code: SUPPORTED_COUNTRY_CODE,
          age_group: ageGroup,
          guardian_email: ageGroup === 'minor' ? guardianEmail : null,
          parental_consent_status: parentalConsentStatus,
        },
        { onConflict: 'id' }
      );

    if (profileError) throw profileError;

    const { error: metadataError } =
      await supabaseAdmin.auth.admin.updateUserById(user.id, {
        user_metadata: {
          ...user.user_metadata,
          date_of_birth: dateOfBirth,
          country_code: SUPPORTED_COUNTRY_CODE,
          guardian_email: ageGroup === 'minor' ? guardianEmail : null,
        },
        app_metadata: {
          ...user.app_metadata,
          eligibility_version: CONSENT_VERSION,
          age_group: ageGroup,
          legal_terms_accepted_at: acceptedAt,
          legal_terms_version: CONSENT_VERSION,
        },
      });

    if (metadataError) throw metadataError;

    return NextResponse.json({
      success: true,
      requiresParentalConsent: ageGroup === 'minor',
    });
  } catch (error) {
    console.error('Legacy account eligibility completion failed:', error);
    return NextResponse.json(
      { error: 'Account eligibility could not be saved.' },
      { status: 500 }
    );
  }
}
