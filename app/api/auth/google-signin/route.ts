import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json(
    {
      error:
        'Google sign-in is disabled. Use email registration so age and consent requirements can be completed.',
    },
    { status: 410 }
  );
}
