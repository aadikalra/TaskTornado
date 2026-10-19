import { NextResponse } from 'next/server';
import { authorizeAiAction } from '@/lib/ai/http';
import { recordAiUsage } from '@/lib/ai/quota';
import { MAX_RAMBLE_BYTES, RAMBLR_MODEL, TranscriptionError, transcribeRambleAudio } from '@/lib/ai/transcription';

export const runtime = 'nodejs';
export const maxDuration = 60;

export async function POST(request: Request) {
  const access = await authorizeAiAction(request, 'quick');
  if (!access.ok) return access.response;
  if (Number(request.headers.get('content-length')) > MAX_RAMBLE_BYTES + 16_384) {
    return NextResponse.json({ error: 'This ramble is too long. Try a shorter recording.' }, { status: 413 });
  }
  try {
    const form = await request.formData();
    const audio = form.get('audio');
    if (!(audio instanceof File)) return NextResponse.json({ error: 'An audio recording is required.' }, { status: 400 });
    const text = await transcribeRambleAudio(audio, request.signal);
    await recordAiUsage('quick', RAMBLR_MODEL, 0, 0, access.accessToken);
    return NextResponse.json({ text }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    if (error instanceof TranscriptionError) return NextResponse.json({ error: error.message }, { status: error.status });
    return NextResponse.json({ error: 'Couldn’t transcribe your audio. Try again.' }, { status: 502 });
  }
}
