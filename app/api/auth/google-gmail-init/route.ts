import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID!;
const REDIRECT_URI = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/auth/google-gmail`;

export async function GET(request: NextRequest) {
  try {
    const oauth2Client = new google.auth.OAuth2(CLIENT_ID, '', REDIRECT_URI);

    // Only request gmail.readonly — minimal scope for view-only access
    const scopes = [
      'https://www.googleapis.com/auth/gmail.readonly',
      'https://www.googleapis.com/auth/userinfo.profile',
      'https://www.googleapis.com/auth/userinfo.email'
    ];

    const authUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
      prompt: 'consent',
      state: 'gmail-integration',
    });

    return NextResponse.json({ authUrl });

  } catch (error: any) {
    console.error('Error generating Gmail auth URL:', error);
    return NextResponse.json({
      message: 'Failed to generate Gmail auth URL',
      error: error.message
    }, { status: 500 });
  }
}
