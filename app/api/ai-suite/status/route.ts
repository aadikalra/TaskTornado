import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const unlockedCookie = cookieStore.get('ai-suite-unlocked');
    const unlocked = unlockedCookie?.value === 'true';

    return NextResponse.json({ unlocked });
  } catch (error) {
    console.error('Error checking AI unlock status:', error);
    return NextResponse.json({ unlocked: false });
  }
}
