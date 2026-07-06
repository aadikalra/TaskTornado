import { NextRequest, NextResponse } from 'next/server';

// Supabase Send Email Auth Hook
// Docs: https://supabase.com/docs/guides/auth/auth-hooks/send-email-hook

// Map Supabase email action types to Resend template IDs
const TEMPLATE_MAP: Record<string, string> = {
  signup: '913e6ad3-6d96-4c49-a44f-a22312c58f80', // "Confirm Signup" template
  // Add more as you create them in Resend:
  // recovery: 'YOUR_RESET_PASSWORD_TEMPLATE_ID',
  // invite: 'YOUR_INVITE_TEMPLATE_ID',
  // email_change: 'YOUR_EMAIL_CHANGE_TEMPLATE_ID',
};

// Supabase hook payload shape
interface SupabaseEmailHookPayload {
  user: {
    id: string;
    email: string;
    user_metadata?: Record<string, unknown>;
  };
  email_data: {
    token: string;
    token_hash: string;
    redirect_to: string;
    email_action_type: string;
    site_url: string;
    token_new?: string;
    token_hash_new?: string;
  };
}

export async function POST(req: NextRequest) {
  try {
    // 1. Log signature for debugging
    const hookSecret = process.env.SUPABASE_HOOK_SECRET;
    const signatureHeader = req.headers.get('x-supabase-signature');
    console.log('[send-email hook] Received x-supabase-signature:', signatureHeader);
    console.log('[send-email hook] Configured SUPABASE_HOOK_SECRET:', hookSecret ? 'Present' : 'Missing');

    // TEMPORARILY BYPASSED TO TEST CONNECTION
    /*
    if (hookSecret) {
      if (!signatureHeader) {
        return NextResponse.json({ error: 'Missing signature' }, { status: 401 });
      }
      const parts = signatureHeader.split(',');
      const signature = parts.find(p => p.startsWith('v1='))?.slice(3);
      if (!signature) {
        return NextResponse.json({ error: 'Invalid signature format' }, { status: 401 });
      }
      const secretToken = hookSecret.replace('v1,whsec_', '');
      if (signature !== secretToken && signatureHeader !== hookSecret) {
        return NextResponse.json({ error: 'Unauthorized signature' }, { status: 401 });
      }
    }
    */

    const resendApiKey = process.env.RESEND_API_KEY;
    if (!resendApiKey) {
      throw new Error('Missing RESEND_API_KEY environment variable');
    }

    const payload: SupabaseEmailHookPayload = await req.json();
    const { user, email_data } = payload;
    const { email_action_type, token_hash, redirect_to, site_url } = email_data;

    // 2. Build the confirmation URL (mirrors what Supabase would put in the template)
    const confirmationURL = new URL(`${site_url}/auth/confirm`);
    confirmationURL.searchParams.set('token_hash', token_hash);
    confirmationURL.searchParams.set('type', 'email');
    if (redirect_to) {
      confirmationURL.searchParams.set('next', redirect_to);
    }

    // 3. Look up the Resend template for this action type
    const templateId = TEMPLATE_MAP[email_action_type];
    if (!templateId) {
      // Fall back to Supabase's own email for unmapped action types
      console.log(`[send-email hook] No Resend template for action: ${email_action_type}, skipping`);
      return NextResponse.json({});
    }

    // 4. Send via Resend using the template
    const resendRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: process.env.RESEND_FROM_EMAIL ?? 'noreply@voer.org',
        to: [user.email],
        template_id: templateId,
        variables: {
          // Must match the variable names defined in your Resend template
          ConfirmationURL: confirmationURL.toString(),
        },
      }),
    });

    if (!resendRes.ok) {
      const error = await resendRes.text();
      console.error('[send-email hook] Resend API error:', error);
      return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
    }

    const result = await resendRes.json();
    console.log('[send-email hook] Email sent via Resend:', result.id);

    // 5. Return an empty 200 to tell Supabase the hook succeeded
    return NextResponse.json({});
  } catch (err) {
    console.error('[send-email hook] Unexpected error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
