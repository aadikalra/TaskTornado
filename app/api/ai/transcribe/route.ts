import { NextResponse } from 'next/server';
import { authorizeAiAction } from '@/lib/ai/http';
import { recordRequestAiUsage, aiProviderErrorResponse } from '@/lib/ai/http';
import { MAX_RAMBLE_BYTES, RAMBLR_MODEL, TranscriptionError, transcribeRambleAudio } from '@/lib/ai/transcription';

export const runtime = 'nodejs';
export const maxDuration = 60;

export async function POST(request: Request) {
  const access = await authorizeAiAction(request, 'quick', 'transcription');
  if (!access.ok) return access.response;
  if (Number(request.headers.get('content-length')) > MAX_RAMBLE_BYTES + 16_384) {
    return NextResponse.json({ error: 'This ramble is too long. Try a shorter recording.' }, { status: 413 });
  }
  try {
    const form = await request.formData();
    const audio = form.get('audio');
    if (!(audio instanceof File)) return NextResponse.json({ error: 'An audio recording is required.' }, { status: 400 });
    const text = await transcribeRambleAudio(audio, request.signal, { apiKey: access.credentials?.apiKey });
    await recordRequestAiUsage(access, 'quick', RAMBLR_MODEL, 0, 0);
    return NextResponse.json({ text }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    const providerError = aiProviderErrorResponse(error);
    if (providerError) return providerError;
    if (error instanceof TranscriptionError) return NextResponse.json({ error: error.message }, { status: error.status });
    return NextResponse.json({ error: 'Couldn’t transcribe your audio. Try again.' }, { status: 502 });
  }
}
