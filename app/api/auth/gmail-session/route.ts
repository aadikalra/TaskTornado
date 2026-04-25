import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const authCookie = cookieStore.get('gmail-auth');

    if (!authCookie) {
      return NextResponse.json({ authenticated: false });
    }

    const authData = JSON.parse(authCookie.value);

    // Check if token is expired
    if (authData.expiry_date && Date.now() > authData.expiry_date) {
      // Clear expired cookie
      cookieStore.set('gmail-auth', '', { maxAge: 0, path: '/' });
      return NextResponse.json({ authenticated: false, reason: 'token_expired' });
    }

    return NextResponse.json({
      authenticated: true,
      user: authData.user,
    });

  } catch (error) {
    console.error('Error reading gmail auth:', error);
    return NextResponse.json({ authenticated: false });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    cookieStore.set('gmail-auth', '', { maxAge: 0, path: '/' });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error clearing gmail auth:', error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
