import { NextRequest, NextResponse } from 'next/server';

import { guardAuthenticatedRequest } from '@/lib/api/request-guard';
import {
  disconnectGoogleService,
  getGoogleConnection,
  googleIntegrationsEnabled,
} from '@/lib/google-oauth';

export async function GET(request: NextRequest) {
  const access = await guardAuthenticatedRequest(request);
  if (!access.ok) return access.response;
  if (!googleIntegrationsEnabled()) {
    return NextResponse.json({
      authenticated: false,
      enabled: false,
      user: null,
    });
  }

  try {
    const connection = await getGoogleConnection(access.user.id, 'gmail');
    return NextResponse.json({
      authenticated: Boolean(connection),
      enabled: true,
      user: connection?.user || null,
    });
  } catch (error) {
    console.error('Error reading Gmail connection:', error);
    return NextResponse.json({ authenticated: false });
  }
}
export async function DELETE(request: NextRequest) {
  const access = await guardAuthenticatedRequest(request, {
    limit: 10,
    windowMs: 60_000,
  });
  if (!access.ok) return access.response;

  try {
    await disconnectGoogleService(access.user.id, 'gmail');
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error disconnecting Gmail:', error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
