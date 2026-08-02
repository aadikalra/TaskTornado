import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import crypto from 'crypto';
import { guardAuthenticatedRequest } from '@/lib/api/request-guard';

export async function POST(request: NextRequest) {
  const access = await guardAuthenticatedRequest(request, {
    limit: 5,
    windowMs: 60_000,
    requireAiEnabled: true,
    rateLimitKey: 'ai-suite-unlock',
  });
  if (!access.ok) return access.response;

  try {
    const { password } = await request.json();

    if (typeof password !== 'string') {
      return NextResponse.json({ success: false, error: 'Invalid password format' }, { status: 400 });
    }

    const expectedPassword = process.env.AI_SUITE_GATE_PASSWORD;
    if (!expectedPassword) {
      return NextResponse.json(
        { success: false, error: 'AI suite is not configured' },
        { status: 503 }
      );
    }

    // Hash both strings to prevent timing leakage on length comparison
    // timingSafeEqual requires buffers of identical length, which hashing guarantees (32 bytes for SHA-256)
    const inputBuffer = Buffer.from(password);
    const expectedBuffer = Buffer.from(expectedPassword);

    const inputHash = crypto.createHash('sha256').update(inputBuffer).digest();
    const expectedHash = crypto.createHash('sha256').update(expectedBuffer).digest();

    const isValid = crypto.timingSafeEqual(inputHash, expectedHash);

    if (!isValid) {
      return NextResponse.json({ success: false, error: 'Incorrect password' }, { status: 401 });
    }

    // Set HTTP-only session cookie
    const cookieStore = await cookies();
    cookieStore.set('ai-suite-unlocked', 'true', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 2, // 2 hours session
      path: '/',
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error unlocking AI Suite:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
