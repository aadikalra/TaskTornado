import { createHash, randomBytes } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';

import { CONSENT_VERSION, normalizeEmail } from '@/lib/legal/eligibility';
import { supabaseAdmin } from '@/lib/supabase/admin';

const REQUEST_TTL_MS = 7 * 24 * 60 * 60 * 1000;

function getBaseUrl(request: NextRequest) {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL;
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  }
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return request.nextUrl.origin;
}

function escapeHtml(value: string) {
  const entities: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  };
  return value.replace(/[&<>"']/g, (character) => entities[character] || character);
}

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

    if (
      error ||
      !user ||
      normalizeEmail(user.email || '') !== normalizeEmail(email)
    ) {
      return NextResponse.json({ error: 'Registration could not be verified.' }, { status: 403 });
    }
    const verifiedEmail = user.email!;

    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('age_group,guardian_email,parental_consent_status')
      .eq('id', user.id)
      .single();

    if (profile?.age_group !== 'minor' || !profile?.guardian_email) {
      return NextResponse.json({ error: 'Parental approval is not pending.' }, { status: 409 });
    }

    const { data: currentApproval, error: currentApprovalError } =
      await supabaseAdmin
        .from('parental_consent_requests')
        .select('id')
        .eq('student_id', user.id)
        .eq('consent_version', CONSENT_VERSION)
        .not('approved_at', 'is', null)
        .is('revoked_at', null)
        .limit(1)
        .maybeSingle();

    if (currentApprovalError) throw currentApprovalError;

    // Repair a split state if the durable approval record is current but the
    // profile or Auth metadata update previously failed.
    if (currentApproval) {
      const approvedAt = new Date().toISOString();
      const { error: profileRepairError } = await supabaseAdmin
        .from('profiles')
        .update({ parental_consent_status: 'approved' })
        .eq('id', user.id);
      if (profileRepairError) throw profileRepairError;

      const { error: metadataRepairError } =
        await supabaseAdmin.auth.admin.updateUserById(user.id, {
          app_metadata: {
            ...user.app_metadata,
            parental_consent_status: 'approved',
            parental_consent_version: CONSENT_VERSION,
            parental_consent_approved_at: approvedAt,
          },
        });
      if (metadataRepairError) throw metadataRepairError;

      return NextResponse.json({ success: true, alreadyApproved: true });
    }

    // An older approval does not cover the current AI terms. Move the profile
    // back to pending before creating the replacement approval request.
    if (profile.parental_consent_status !== 'pending') {
      const { error: pendingError } = await supabaseAdmin
        .from('profiles')
        .update({ parental_consent_status: 'pending' })
        .eq('id', user.id);
      if (pendingError) throw pendingError;
    }

    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString();
    const { data: recentRequest } = await supabaseAdmin
      .from('parental_consent_requests')
      .select('id')
      .eq('student_id', user.id)
      .eq('consent_version', CONSENT_VERSION)
      .gte('created_at', tenMinutesAgo)
      .limit(1)
      .maybeSingle();

    if (recentRequest) {
      return NextResponse.json(
        { error: 'An approval email was sent recently. Please wait before trying again.' },
        { status: 429 }
      );
    }

    const token = randomBytes(32).toString('base64url');
    const tokenHash = createHash('sha256').update(token).digest('hex');
    const expiresAt = new Date(Date.now() + REQUEST_TTL_MS).toISOString();

    await supabaseAdmin
      .from('parental_consent_requests')
      .delete()
      .eq('student_id', user.id)
      .is('approved_at', null);

    const { data: insertedRequest, error: insertError } = await supabaseAdmin
      .from('parental_consent_requests')
      .insert({
        student_id: user.id,
        student_email: verifiedEmail,
        guardian_email: normalizeEmail(profile.guardian_email),
        token_hash: tokenHash,
        consent_version: CONSENT_VERSION,
        expires_at: expiresAt,
      })
      .select('id')
      .single();

    if (insertError || !insertedRequest) {
      throw insertError || new Error('Approval request was not created.');
    }

    const approvalUrl = new URL('/parental-consent', getBaseUrl(request));
    approvalUrl.searchParams.set('token', token);
    const approvalUrlText = approvalUrl.toString();
    const approvalUrlHtml = escapeHtml(approvalUrlText);
    const isLocalApprovalUrl = ['localhost', '127.0.0.1'].includes(
      approvalUrl.hostname
    );
    const localLinkHtml = isLocalApprovalUrl
      ? '<p style="font-size:13px;color:#9a5b00;background:#fff6df;padding:10px 12px;border-radius:8px">This is a local development link. Open it on the same computer that is running TaskTornado.</p>'
      : '';

    const resendApiKey = process.env.RESEND_API_KEY;
    if (!resendApiKey) {
      throw new Error('Missing RESEND_API_KEY');
    }

    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: process.env.RESEND_FROM_EMAIL ?? 'noreply@voer.org',
        to: [profile.guardian_email],
        subject: 'Approve your student’s TaskTornado account',
        html: `
          <div style="font-family:Arial,sans-serif;line-height:1.6;color:#17365d;max-width:620px;margin:0 auto;padding:24px">
            <h1 style="font-size:24px;margin:0 0 16px">Parent or guardian approval required</h1>
            <p>A student using ${escapeHtml(verifiedEmail)} asked to use TaskTornado.</p>
            <p>TaskTornado is currently offered only in the United States to people age 13 or older. Aurora can send a student's prompts, recent chat context, and limited relevant school-organizer information to Groq for educational AI responses. Web search is not enabled.</p>
            <p style="margin:28px 0">
              <a href="${approvalUrlHtml}" target="_blank" style="display:inline-block;background:#275085;color:#ffffff;text-decoration:none;font-weight:700;padding:13px 20px;border-radius:10px">
                Review and approve the account
              </a>
            </p>
            <p style="font-size:13px;color:#52677f;margin-bottom:6px">If the button is not clickable, copy and paste this complete address into your browser:</p>
            <p style="font-size:13px;word-break:break-all;margin-top:0">
              <a href="${approvalUrlHtml}" target="_blank" style="color:#165df9">${approvalUrlHtml}</a>
            </p>
            ${localLinkHtml}
            <p style="font-size:13px;color:#52677f">This link expires in seven days and only the newest approval email will work. If you did not expect this request, you can ignore this email.</p>
          </div>
        `,
        text: [
          'Parent or guardian approval required',
          '',
          `A student using ${verifiedEmail} asked to use TaskTornado.`,
          '',
          "TaskTornado is currently offered only in the United States to people age 13 or older. Aurora can send a student's prompts, recent chat context, and limited relevant school-organizer information to Groq for educational AI responses. Web search is not enabled.",
          '',
          'Review and approve the account by opening this address:',
          approvalUrlText,
          ...(isLocalApprovalUrl
            ? [
                '',
                'This is a local development link. Open it on the same computer that is running TaskTornado.',
              ]
            : []),
          '',
          'This link expires in seven days and only the newest approval email will work. If you did not expect this request, you can ignore this email.',
        ].join('\n'),
      }),
    });

    if (!emailResponse.ok) {
      await supabaseAdmin
        .from('parental_consent_requests')
        .delete()
        .eq('id', insertedRequest.id);
      throw new Error(`Resend returned ${emailResponse.status}`);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Parental consent request failed:', error);
    return NextResponse.json({ error: 'Approval email could not be sent.' }, { status: 500 });
  }
}
