// app/api/auth/link-google-account/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { supabase } from '@/lib/supabase/client';

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const authCookie = cookieStore.get('classroom-auth');

    if (!authCookie) {
      return NextResponse.json({ message: 'No Google auth found' }, { status: 401 });
    }

    const googleAuth = JSON.parse(authCookie.value);

    // Check if user already exists in Supabase Auth by trying to get user by email
    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
    
    if (listError) {
      console.error('Error listing users:', listError);
      return NextResponse.json({ message: 'Failed to check existing users' }, { status: 500 });
    }

    const existingUser = users?.find(user => user.email === googleAuth.user.email);

    if (existingUser) {
      // User already exists, just return success
      return NextResponse.json({
        message: 'Account already linked',
        userId: existingUser.id,
        email: googleAuth.user.email
      });
    }

    // Create new user in Supabase using Google profile data
    const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
      email: googleAuth.user.email,
      email_confirm: true,
      user_metadata: {
        name: googleAuth.user.name,
        picture: googleAuth.user.picture,
        provider: 'google',
        google_id: googleAuth.user.id,
        full_name: googleAuth.user.name,
      },
      app_metadata: {
        provider: 'google',
      },
    });

    if (createError) {
      console.error('Error creating user:', createError);
      return NextResponse.json({
        message: 'Failed to create Supabase account',
        error: createError.message
      }, { status: 500 });
    }

    // Sign in the user to create a session
    const { data: sessionData, error: sessionError } = await supabase.auth.signInWithPassword({
      email: googleAuth.user.email,
      password: `google_${googleAuth.user.id}`, // Temporary password for Google users
    });

    if (sessionError) {
      console.error('Error creating session:', sessionError);
      // Continue anyway - the account is created
    }

    return NextResponse.json({
      message: 'Successfully linked Google account to Supabase',
      userId: newUser.user.id,
      email: googleAuth.user.email,
      session: sessionData?.session || null,
    });

  } catch (error: any) {
    console.error('Error linking Google account:', error);
    return NextResponse.json({
      message: 'Failed to link account',
      error: error.message
    }, { status: 500 });
  }
}
