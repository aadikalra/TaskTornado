import { NextRequest, NextResponse } from 'next/server';

import { guardAuthenticatedRequest } from '@/lib/api/request-guard';

export async function GET(request: NextRequest) {
  const access = await guardAuthenticatedRequest(request, {
    limit: 20,
    windowMs: 60_000,
  });
  if (!access.ok) return access.response;

  return NextResponse.json({ eligible: true });
}

