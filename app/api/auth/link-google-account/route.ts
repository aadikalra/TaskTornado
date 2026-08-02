import { NextResponse } from 'next/server';

export async function POST() {
  return NextResponse.json(
    {
      error:
        'Google account creation is disabled. Create an eligible TaskTornado account before connecting Google services.',
    },
    { status: 410 }
  );
}
