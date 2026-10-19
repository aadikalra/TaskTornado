export const MAX_RAMBLE_BYTES = 3 * 1024 * 1024;
export const RAMBLR_MODEL = 'whisper-large-v3-turbo';

export class TranscriptionError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

export function validateRambleAudio(audio: File) {
  if (!audio.size) throw new TranscriptionError('No audio captured. Try another ramble.', 400);
  if (audio.size > MAX_RAMBLE_BYTES) throw new TranscriptionError('This ramble is too long. Try a shorter recording.', 413);
  if (!/^(audio\/(webm|mp4|ogg|wav|x-wav|mpeg)|video\/(webm|mp4))(;|$)/i.test(audio.type)) {
    throw new TranscriptionError('This audio format isn’t supported. Try another browser.', 415);
  }
}

export async function transcribeRambleAudio(
  audio: File,
  signal?: AbortSignal,
  options: { apiKey?: string; fetch?: typeof fetch } = {}
): Promise<string> {
  validateRambleAudio(audio);
  const apiKey = options.apiKey ?? process.env.GROQ_API_KEY;
  if (!apiKey) throw new TranscriptionError('Audio transcription isn’t configured for this environment.', 503);
  const form = new FormData();
  form.append('file', audio);
  form.append('model', RAMBLR_MODEL);
  form.append('response_format', 'verbose_json');
  form.append('temperature', '0');
  const response = await (options.fetch || fetch)('https://api.groq.com/openai/v1/audio/transcriptions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}` },
    body: form,
    signal: signal ? AbortSignal.any([signal, AbortSignal.timeout(45_000)]) : AbortSignal.timeout(45_000),
    cache: 'no-store',
  });
  if (!response.ok) {
    throw new TranscriptionError(response.status === 429
      ? 'Audio transcription is busy. Try again shortly.'
      : 'Couldn’t transcribe your audio. Try again.', response.status === 429 ? 429 : 502);
  }
  const result = await response.json() as { text?: unknown; duration?: number; segments?: { no_speech_prob?: number }[] };
  if (result.duration && result.duration > 125) throw new TranscriptionError('Keep your ramble under two minutes.', 400);
  const silent = result.segments?.length && result.segments.every(segment => (segment.no_speech_prob ?? 0) > 0.8);
  if (typeof result.text !== 'string' || !result.text.trim() || silent) {
    throw new TranscriptionError('No speech heard. Try another ramble.', 422);
  }
  return result.text.trim();
}
