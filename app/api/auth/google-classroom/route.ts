import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';
import { cookies } from 'next/headers';
import { supabase } from '@/lib/supabase/client';

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID!;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET!;
const REDIRECT_URI = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/auth/google-classroom`;

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const state = searchParams.get('state');

  // Check if this is a sign-in request (no state parameter) or classroom integration (has state)
  const isSignInRequest = !state || state === 'signin';

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

    if (isSignInRequest) {
      // Handle user sign-in - check if user already exists with fromGoogle=true
      try {
        // First check if user already exists with fromGoogle=true
        const { data: existingGoogleUser, error: queryError } = await supabase
          .from('profiles')
          .select('id, from_google')
          .eq('email', userInfo.data.email)
          .maybeSingle();

        if (existingGoogleUser && existingGoogleUser.from_google === true) {
          // User exists and was created via Google, create a session for them
          const sessionToken = Buffer.from(JSON.stringify({
            user_id: existingGoogleUser.id,
            email: userInfo.data.email,
            name: userInfo.data.name || userInfo.data.email,
            picture: userInfo.data.picture,
            provider: 'google',
            expires_at: Math.floor(Date.now() / 1000) + (24 * 60 * 60), // 24 hours
          })).toString('base64');

          // Also store the Google Classroom tokens for API access
          const authData = {
            access_token: tokens.access_token,
            refresh_token: tokens.refresh_token,
            user: {
              id: userInfo.data.id,
              email: userInfo.data.email,
              name: userInfo.data.name,
              picture: userInfo.data.picture,
            },
            expires_at: tokens.expiry_date,
          };

          // Set secure HTTP-only cookie for Google Classroom data
          const cookieStore = await cookies();
          cookieStore.set('classroom-auth', JSON.stringify(authData), {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 7, // 7 days
            path: '/',
          });

          // Return HTML that redirects to dashboard with session info
          const htmlResponse = `
            <!DOCTYPE html>
            <html>
              <head>
                <title>Welcome Back</title>
                <script>
                  // Set session cookie and redirect to dashboard
                  document.cookie = "google-auth-session=${sessionToken}; path=/; max-age=86400; samesite=lax";
                  window.location.href = '/dashboard';
                </script>
              </head>
              <body>
                <p>Welcome back! Redirecting to dashboard...</p>
              </body>
            </html>
          `;

          return new NextResponse(htmlResponse, {
            status: 200,
            headers: {
              'Content-Type': 'text/html',
            },
          });
        }
      } catch (error) {
        // User doesn't exist or query failed, continue to password setup
        console.log('No existing Google user found, proceeding to password setup');
      }

      // Redirect to password setup page for new users
      const userData = {
        email: userInfo.data.email,
        name: userInfo.data.name || userInfo.data.email,
        picture: userInfo.data.picture,
        google_id: userInfo.data.id,
      };

      // Store user data in sessionStorage for the password setup page
      const userDataToken = Buffer.from(JSON.stringify(userData)).toString('base64');

      // Also store the OAuth tokens for Google Classroom API access
      const tokensData = {
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        expiry_date: tokens.expiry_date,
      };
      const tokensToken = Buffer.from(JSON.stringify(tokensData)).toString('base64');

      // Return HTML that redirects to password setup page
      const htmlResponse = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Complete Sign Up</title>
            <script>
              // Store user data and tokens, then redirect to password setup
              sessionStorage.setItem('googleUserData', '${userDataToken}');
              sessionStorage.setItem('classroomTokens', '${tokensToken}');
              window.location.href = '/complete-signup';
            </script>
          </head>
          <body>
            <p>Completing sign up...</p>
          </body>
        </html>
      `;

      return new NextResponse(htmlResponse, {
        status: 200,
        headers: {
          'Content-Type': 'text/html',
        },
      });
    }

    // Handle Google Classroom integration (existing logic)
    const mockSession = {
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      expires_in: 3600,
      token_type: 'bearer',
      user: {
        id: userInfo.data.id,
        email: userInfo.data.email!,
        user_metadata: {
          full_name: userInfo.data.name,
          picture: userInfo.data.picture,
          provider: 'google',
        },
      },
      expires_at: Math.floor(Date.now() / 1000) + 3600,
    };

    const clientSessionData = {
      session: mockSession,
      user: mockSession.user,
    };

    // Prepare auth data for cookie storage
    const authData = {
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      user: {
        id: userInfo.data.id,
        email: userInfo.data.email,
        name: userInfo.data.name,
        picture: userInfo.data.picture,
      },
      expires_at: tokens.expiry_date,
    };

    // Set secure HTTP-only cookie for Google Classroom data
    const cookieStore = await cookies();
    cookieStore.set('classroom-auth', JSON.stringify(authData), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    // Set Supabase session cookie (this will be picked up by AuthProvider)
    cookieStore.set('supabase-auth-token', JSON.stringify(clientSessionData), {
      httpOnly: false, // Client needs to read this
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    });

    // Return HTML that redirects to dashboard
    const htmlResponse = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Redirecting to Dashboard...</title>
          <script>
            // Redirect to dashboard
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
    console.error('Error in Google OAuth:', error);

    // Return error HTML that redirects back to login for sign-in, or home for classroom
    const redirectPath = isSignInRequest ? '/login' : '/';
    const errorHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Authentication Error</title>
          <script>
            alert('Authentication failed: ${error.message}');
            window.location.href = '${redirectPath}';
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
