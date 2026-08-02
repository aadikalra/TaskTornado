import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { guardAuthenticatedRequest } from '@/lib/api/request-guard';

export async function GET(request: NextRequest) {
  const access = await guardAuthenticatedRequest(request, {
    limit: 120,
    windowMs: 60_000,
    requireAiEnabled: true,
    rateLimitKey: 'ai-suite-status',
  });
  if (!access.ok) return access.response;

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
