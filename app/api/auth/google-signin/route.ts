import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';
import { supabase } from '@/lib/supabase/client';

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID!;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET!;
const REDIRECT_URI = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/auth/google-classroom`;

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const state = searchParams.get('state');

  if (!code) {
    return NextResponse.json({ message: 'Authorization code is required' }, { status: 400 });
  }

  try {
    const oauth2Client = new google.auth.OAuth2(
      CLIENT_ID,
      CLIENT_SECRET,
      REDIRECT_URI
    );

    // Exchange authorization code for access token
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    // Get user profile information
    const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
    const userInfo = await oauth2.userinfo.get();

    if (!userInfo.data.email || !userInfo.data.id) {
      throw new Error('Missing required user information from Google');
    }

    // Instead of creating user with admin API, we'll use a simpler approach
    // Create a session token that can be validated by the client
    const sessionToken = Buffer.from(JSON.stringify({
      user_id: userInfo.data.id,
      email: userInfo.data.email,
      name: userInfo.data.name,
      picture: userInfo.data.picture,
      provider: 'google',
      expires_at: Math.floor(Date.now() / 1000) + (24 * 60 * 60), // 24 hours
    })).toString('base64');

    // Return HTML that redirects to dashboard with session info
    const htmlResponse = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Redirecting to Dashboard...</title>
          <script>
            // Set session cookie and redirect to dashboard
            document.cookie = "google-auth-session=${sessionToken}; path=/; max-age=86400; samesite=lax";
            window.location.href = '/dashboard';
          </script>
        </head>
        <body>
          <p>Logging you in and redirecting to dashboard...</p>
        </body>
      </html>
    `;

    return new NextResponse(htmlResponse, {
      status: 200,
      headers: {
        'Content-Type': 'text/html',
      },
    });

  } catch (error: any) {
    console.error('Error in Google sign-in OAuth:', error);

    // Return error HTML that redirects back to login
    const errorHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Authentication Error</title>
          <script>
            alert('Authentication failed: ${error.message}');
            window.location.href = '/login';
          </script>
        </head>
        <body>
          <p>Authentication failed. Redirecting...</p>
        </body>
      </html>
    `;

    return new NextResponse(errorHtml, {
      status: 200,
      headers: {
        'Content-Type': 'text/html',
      },
    });
  }
}
