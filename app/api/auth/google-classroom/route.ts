import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';

import {
  createGoogleOAuthClient,
  googleIntegrationsEnabled,
  saveGoogleConnection,
} from '@/lib/google-oauth';
import { createClient } from '@/lib/supabase/server';

const FLOW_COOKIE = 'google-oauth-classroom';

function redirect(request: NextRequest, result: 'success' | 'error') {
  const url = new URL('/settings', request.nextUrl.origin);
  url.searchParams.set(
    result,
    result === 'success' ? 'classroom_authorized' : 'classroom_auth_failed'
  );
  return NextResponse.redirect(url);
}

export async function GET(request: NextRequest) {
  const cookieStore = await cookies();

  try {
    if (!googleIntegrationsEnabled('classroom')) {
      cookieStore.delete(FLOW_COOKIE);
      return redirect(request, 'error');
    }

    const code = request.nextUrl.searchParams.get('code');
    const state = request.nextUrl.searchParams.get('state');
    const providerError = request.nextUrl.searchParams.get('error');
    const flowCookie = cookieStore.get(FLOW_COOKIE);
    cookieStore.delete(FLOW_COOKIE);

    if (providerError || !code || !state || !flowCookie?.value) {
      return redirect(request, 'error');
    }

    const flow = JSON.parse(flowCookie.value);
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (
      !user ||
      user.id !== flow.userId ||
      state !== flow.state ||
      typeof flow.verifier !== 'string'
    ) {
      return redirect(request, 'error');
    }

    const oauth2Client = createGoogleOAuthClient('classroom');
    const { tokens } = await oauth2Client.getToken({
      code,
      codeVerifier: flow.verifier,
    });
    oauth2Client.setCredentials(tokens);

    if (!tokens.access_token) {
      return redirect(request, 'error');
    }

    const { data: account } = await google
      .oauth2({ version: 'v2', auth: oauth2Client })
      .userinfo.get();

    if (!account.email) {
      return redirect(request, 'error');
    }

    await saveGoogleConnection(user.id, 'classroom', tokens, account);
    return redirect(request, 'success');
  } catch (error) {
    console.error('Classroom OAuth callback failed:', error);
    return redirect(request, 'error');
  }
}
