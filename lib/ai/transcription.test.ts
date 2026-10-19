import assert from 'node:assert/strict';
import test from 'node:test';
// @ts-expect-error Node's type-stripping runner needs the source extension.
import { MAX_RAMBLE_BYTES, transcribeRambleAudio, validateRambleAudio } from './transcription.ts';

const audio = () => new File(['audio'], 'ramble.webm', { type: 'audio/webm;codecs=opus' });

test('sends recorded audio to Whisper using multipart form data', async () => {
  const text = await transcribeRambleAudio(audio(), undefined, { apiKey: 'test-key', fetch: async (url, request) => {
    assert.equal(url, 'https://api.groq.com/openai/v1/audio/transcriptions');
    const form = request?.body as FormData;
    assert.equal(form.get('model'), 'whisper-large-v3-turbo');
    assert.equal(form.get('response_format'), 'verbose_json');
    assert.ok(form.get('file') instanceof File);
    return Response.json({ text: ' Math chapter five, Friday. ', duration: 4, segments: [{ no_speech_prob: 0.01 }] });
  } });
  assert.equal(text, 'Math chapter five, Friday.');
});

test('rejects empty, unsupported, and oversized uploads before calling the provider', () => {
  assert.throws(() => validateRambleAudio(new File([], 'empty.webm', { type: 'audio/webm' })), /No audio/);
  assert.throws(() => validateRambleAudio(new File(['x'], 'x.txt', { type: 'text/plain' })), /format/);
  assert.throws(() => validateRambleAudio(new File([new Uint8Array(MAX_RAMBLE_BYTES + 1)], 'large.webm', { type: 'audio/webm' })), /too long/);
});

test('does not turn a silent recording into hallucinated homework', async () => {
  await assert.rejects(transcribeRambleAudio(audio(), undefined, { apiKey: 'test-key', fetch: async () =>
    Response.json({ text: 'Thank you for watching!', segments: [{ no_speech_prob: 0.99 }] }),
  }), /No speech/);
});

test('returns a useful rate limit error without exposing provider details', async () => {
  await assert.rejects(transcribeRambleAudio(audio(), undefined, { apiKey: 'test-key', fetch: async () =>
    Response.json({ error: { message: 'Provider internals' } }, { status: 429 }),
  }), /busy/);
});
