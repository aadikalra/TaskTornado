import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';
import { cookies } from 'next/headers';

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID!;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET!;
const REDIRECT_URI = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/auth/google-gmail`;

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');
    const error = searchParams.get('error');

    // Handle authorization error
    if (error) {
      console.error('Gmail authorization error:', error);
      return NextResponse.redirect(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/mail?error=gmail_auth_failed&reason=${error}`);
    }

    if (!code) {
      console.error('No authorization code received from Google');
      return NextResponse.redirect(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/mail?error=gmail_auth_failed&reason=no_code`);
    }

    // Exchange authorization code for access token
    const oauth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);
    
    const { tokens } = await oauth2Client.getToken(code);
    
    if (!tokens.access_token) {
      throw new Error('No access token received from Google');
    }

    // Get user info from Google
    const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
    oauth2Client.setCredentials(tokens);
    
    const { data: userInfo } = await oauth2.userinfo.get();
    
    if (!userInfo.email) {
      throw new Error('No email received from Google');
    }

    // Store the Gmail authentication data in a cookie
    const gmailAuth = {
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      expiry_date: tokens.expiry_date,
      token_type: tokens.token_type,
      scope: tokens.scope,
      user: {
        id: userInfo.id,
        email: userInfo.email,
        name: userInfo.name,
        picture: userInfo.picture,
      },
      created_at: new Date().toISOString()
    };

    // Set the gmail-auth cookie
    const cookieStore = await cookies();
    cookieStore.set('gmail-auth', JSON.stringify(gmailAuth), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: '/'
    });

    console.log('✅ Gmail authorization successful for:', userInfo.email);

    // Redirect to mail page with success
    return NextResponse.redirect(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/mail?success=gmail_authorized`);

  } catch (error: any) {
    console.error('Error in Gmail callback:', error);
    const errorMessage = error.message || 'unknown_error';
    return NextResponse.redirect(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/mail?error=gmail_auth_failed&reason=${encodeURIComponent(errorMessage)}`);
  }
}
