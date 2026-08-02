import { createHash } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';

import { supabaseAdmin } from '@/lib/supabase/admin';

export async function POST(request: NextRequest) {
  try {
    const { token, guardianName, consent } = await request.json();

    if (!token || !guardianName?.trim() || consent !== true) {
      return NextResponse.json(
        { error: 'Guardian name and affirmative consent are required.' },
        { status: 400 }
      );
    }

    const tokenHash = createHash('sha256').update(token).digest('hex');
    const approvalIp =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      request.headers.get('x-real-ip') ||
      null;
    const { data: approvalRows, error } = await supabaseAdmin.rpc(
      'approve_parental_consent',
      {
        p_token_hash: tokenHash,
        p_guardian_name: guardianName.trim(),
        p_approval_ip: approvalIp || '',
        p_approval_user_agent: request.headers.get('user-agent') || '',
      }
    );
    const approval = approvalRows?.[0];

    if (error || !approval) {
      return NextResponse.json(
        { error: 'This approval link is invalid or has expired.' },
        { status: 410 }
      );
    }

    const approvedAt = new Date().toISOString();

    const {
      data: { user },
    } = await supabaseAdmin.auth.admin.getUserById(approval.student_id);

    if (user) {
      const { error: metadataError } =
        await supabaseAdmin.auth.admin.updateUserById(user.id, {
          app_metadata: {
            ...user.app_metadata,
            parental_consent_status: 'approved',
            parental_consent_version: approval.consent_version,
            parental_consent_approved_at: approvedAt,
          },
        });
      if (metadataError) {
        console.warn('Consent approved but auth metadata was not updated:', metadataError);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Parental consent approval failed:', error);
    return NextResponse.json({ error: 'Approval could not be recorded.' }, { status: 500 });
  }
}
