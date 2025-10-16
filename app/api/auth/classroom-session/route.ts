// app/api/auth/classroom-session/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const authCookie = cookieStore.get('classroom-auth');

    if (!authCookie) {
      return NextResponse.json({ authenticated: false });
    }

    const authData = JSON.parse(authCookie.value);

    // Check if token is expired
    if (authData.expires_at && Date.now() > authData.expires_at) {
      // Clear expired cookie
      cookieStore.set('classroom-auth', '', { maxAge: 0, path: '/' });
      return NextResponse.json({ authenticated: false });
    }

    return NextResponse.json({
      authenticated: true,
      ...authData
    });

  } catch (error) {
    console.error('Error reading classroom auth:', error);
    return NextResponse.json({ authenticated: false });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    cookieStore.set('classroom-auth', '', { maxAge: 0, path: '/' });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error clearing classroom auth:', error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
