import { createHash, randomBytes } from 'crypto';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { CodeChallengeMethod } from 'google-auth-library';

import { guardAuthenticatedRequest } from '@/lib/api/request-guard';
import {
  createGoogleOAuthClient,
  googleIntegrationsEnabled,
} from '@/lib/google-oauth';

const FLOW_COOKIE = 'google-oauth-classroom';

export async function GET(request: NextRequest) {
  const access = await guardAuthenticatedRequest(request, {
    limit: 5,
    windowMs: 60_000,
  });
  if (!access.ok) return access.response;
  if (!googleIntegrationsEnabled()) {
    return NextResponse.json(
      {
        error:
          'Google integrations are unavailable until OAuth review is complete.',
      },
      { status: 503 }
    );
  }

  try {
    const state = randomBytes(32).toString('base64url');
    const verifier = randomBytes(64).toString('base64url');
    const challenge = createHash('sha256')
      .update(verifier)
      .digest('base64url');

    const cookieStore = await cookies();
    cookieStore.set(
      FLOW_COOKIE,
      JSON.stringify({ state, verifier, userId: access.user.id }),
      {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 10 * 60,
        path: '/',
      }
    );

    const authUrl = createGoogleOAuthClient('classroom').generateAuthUrl({
      access_type: 'offline',
      scope: [
        'https://www.googleapis.com/auth/classroom.courses.readonly',
        'https://www.googleapis.com/auth/classroom.coursework.me.readonly',
        'https://www.googleapis.com/auth/classroom.student-submissions.me.readonly',
        'https://www.googleapis.com/auth/userinfo.profile',
        'https://www.googleapis.com/auth/userinfo.email',
      ],
      prompt: 'consent',
      state,
      code_challenge: challenge,
      code_challenge_method: CodeChallengeMethod.S256,
      include_granted_scopes: true,
    });

    return NextResponse.json({ authUrl });
  } catch (error) {
    console.error('Error generating Classroom authorization URL:', error);
    return NextResponse.json(
      { error: 'Google authorization is not configured.' },
      { status: 503 }
    );
  }
}
