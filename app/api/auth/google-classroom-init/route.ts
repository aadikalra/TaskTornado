import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID!;
const REDIRECT_URI = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/auth/google-classroom`;

export async function GET(request: NextRequest) {
  try {
    const oauth2Client = new google.auth.OAuth2(CLIENT_ID, '', REDIRECT_URI);

    // Define the scopes needed for Classroom API
    const scopes = [
      'https://www.googleapis.com/auth/classroom.courses.readonly',
      'https://www.googleapis.com/auth/classroom.coursework.students.readonly',
      'https://www.googleapis.com/auth/classroom.coursework.me.readonly',
      'https://www.googleapis.com/auth/classroom.student-submissions.students.readonly',
      'https://www.googleapis.com/auth/classroom.student-submissions.me.readonly',
      'https://www.googleapis.com/auth/userinfo.profile',
      'https://www.googleapis.com/auth/userinfo.email'
    ];

    // Generate the authorization URL
    const authUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
      prompt: 'consent', // Force consent to get refresh token
      state: 'classroom-integration', // Optional state parameter
    });

    return NextResponse.json({ authUrl });

  } catch (error: any) {
    console.error('Error generating auth URL:', error);
    return NextResponse.json({
      message: 'Failed to generate Google Classroom auth URL',
      error: error.message
    }, { status: 500 });
  }
}
