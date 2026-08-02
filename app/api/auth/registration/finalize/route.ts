import { NextRequest, NextResponse } from 'next/server';

import {
  CONSENT_VERSION,
  getAgeGroup,
  normalizeEmail,
  SUPPORTED_COUNTRY_CODE,
} from '@/lib/legal/eligibility';
import { supabaseAdmin } from '@/lib/supabase/admin';

export async function POST(request: NextRequest) {
  try {
    const { userId, email } = await request.json();

    if (!userId || !email) {
      return NextResponse.json({ error: 'Missing registration data.' }, { status: 400 });
    }

    const {
      data: { user },
      error,
    } = await supabaseAdmin.auth.admin.getUserById(userId);

    if (error || !user || normalizeEmail(user.email || '') !== normalizeEmail(email)) {
      return NextResponse.json({ error: 'Registration could not be verified.' }, { status: 403 });
    }
    const verifiedEmail = user.email!;

    const dateOfBirth = user.user_metadata?.date_of_birth;
    const countryCode = user.user_metadata?.country_code;
    const accountType = user.user_metadata?.account_type || 'student';
    const guardianEmail = user.user_metadata?.guardian_email || null;
    const ageGroup = dateOfBirth ? getAgeGroup(dateOfBirth) : null;

    if (countryCode !== SUPPORTED_COUNTRY_CODE || !ageGroup || ageGroup === 'under_13') {
      await supabaseAdmin.auth.admin.deleteUser(user.id);
      return NextResponse.json(
        { error: 'This registration is not eligible for TaskTornado.' },
        { status: 403 }
      );
    }

    if (accountType === 'guardian' && ageGroup !== 'adult') {
      await supabaseAdmin.auth.admin.deleteUser(user.id);
      return NextResponse.json(
        { error: 'Guardian accounts must be created by an adult.' },
        { status: 403 }
      );
    }

    if (ageGroup === 'minor' && !guardianEmail) {
      await supabaseAdmin.auth.admin.deleteUser(user.id);
      return NextResponse.json(
        { error: 'A parent or guardian email is required.' },
        { status: 400 }
      );
    }

    const parentalConsentStatus = ageGroup === 'minor' ? 'pending' : 'not_required';
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .upsert(
        {
          id: user.id,
          email: verifiedEmail,
          full_name: user.user_metadata?.full_name || null,
          account_type: accountType,
          date_of_birth: dateOfBirth,
          country_code: countryCode,
          age_group: ageGroup,
          guardian_email: guardianEmail,
          parental_consent_status: parentalConsentStatus,
        },
        { onConflict: 'id' }
      );

    if (profileError) {
      throw profileError;
    }

    await supabaseAdmin.auth.admin.updateUserById(user.id, {
      app_metadata: {
        ...user.app_metadata,
        eligibility_version: CONSENT_VERSION,
        age_group: ageGroup,
      },
    });

    return NextResponse.json({
      success: true,
      requiresParentalConsent: ageGroup === 'minor',
    });
  } catch (error) {
    console.error('Registration finalization failed:', error);
    return NextResponse.json({ error: 'Registration could not be finalized.' }, { status: 500 });
  }
}
