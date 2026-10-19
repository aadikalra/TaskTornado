import assert from 'node:assert/strict';
import test from 'node:test';
// @ts-expect-error Node's type-stripping runner needs the source extension.
import { QuickFillVoice } from './quick-fill-voice.ts';
import type { VoiceStatus } from './quick-fill-voice';

function setup(timeout = 20) {
  let tracksStopped = 0;
  let audioClosed = 0;
  let stopped = 0;
  let transcriptions = 0;
  const statuses: VoiceStatus[] = [];
  const texts: string[] = [];
  const errors: string[] = [];
  const recordings: boolean[] = [];
  const recorder = {
    state: 'inactive', mimeType: 'audio/webm',
    ondataavailable: null as MediaRecorder['ondataavailable'],
    onerror: null as MediaRecorder['onerror'],
    onstop: null as MediaRecorder['onstop'],
    start() { this.state = 'recording'; },
    stop() { stopped++; this.state = 'inactive'; },
  };
  const stream = { getTracks: () => [{ stop: () => { tracksStopped++; } }] } as unknown as MediaStream;
  const audio = {
    resume: async () => {}, close: async () => { audioClosed++; },
    createAnalyser: () => ({}) as AnalyserNode,
    createMediaStreamSource: () => ({ connect() {}, disconnect() {} }),
  } as unknown as AudioContext;
  const environment = {
    getMicrophone: async () => stream,
    createAudioContext: () => audio,
    createRecorder: () => recorder as unknown as MediaRecorder,
    transcribe: async (audio: Blob, signal: AbortSignal) => { assert.ok(audio.size > 0); assert.equal(signal.aborted, false); transcriptions++; return 'chapter five due Friday'; },
  };
  const voice = new QuickFillVoice({
    onText: text => texts.push(text), onStatus: status => statuses.push(status),
    onError: error => errors.push(error), onAnalyser() {}, onRecording: value => recordings.push(value),
  }, timeout);
  const finish = (content = 'encoded audio') => {
    recorder.ondataavailable?.call(recorder as unknown as MediaRecorder, { data: new Blob([content], { type: 'audio/webm' }) } as BlobEvent);
    recorder.onstop?.call(recorder as unknown as MediaRecorder, new Event('stop'));
  };
  return { voice, recorder, environment, stream, statuses, texts, errors, recordings, finish,
    counts: () => ({ tracksStopped, audioClosed, stopped, transcriptions }) };
}

test('records independently of browser speech services and waits for final audio before filling', async () => {
  const s = setup();
  await s.voice.start('Math homework:', () => s.environment);
  assert.equal(s.counts().transcriptions, 0);
  const pending = s.voice.stop();
  s.finish();
  assert.equal(await pending, 'Math homework: chapter five due Friday');
  assert.deepEqual(s.counts(), { tracksStopped: 1, audioClosed: 1, stopped: 1, transcriptions: 1 });
  assert.deepEqual(s.statuses, ['starting', 'listening', 'stopping', 'transcribing', 'idle']);
});

test('closing during permission releases the late stream without starting recording', async () => {
  const s = setup();
  let allow!: (stream: MediaStream) => void;
  const pending = s.voice.start('', () => ({ ...s.environment,
    getMicrophone: () => new Promise(resolve => { allow = resolve; }),
  }));
  s.voice.dispose();
  allow(s.stream);
  await pending;
  assert.equal(s.counts().tracksStopped, 1);
  assert.equal(s.counts().transcriptions, 0);
});

test('permission denial leaves typing available and reports an actionable error', async () => {
  const s = setup();
  await s.voice.start('', () => ({ ...s.environment, getMicrophone: async () => {
    throw new DOMException('Permission denied', 'NotAllowedError');
  } }));
  assert.match(s.errors.at(-1) || '', /Allow microphone access/);
  assert.equal(s.statuses.at(-1), 'idle');
});

test('canceling during permission stops a late stream', async () => {
  const s = setup();
  let allow!: (stream: MediaStream) => void;
  const pending = s.voice.start('Already typed', () => ({ ...s.environment,
    getMicrophone: () => new Promise(resolve => { allow = resolve; }),
  }));
  assert.equal(await s.voice.stop(), 'Already typed');
  allow(s.stream);
  await pending;
  assert.equal(s.counts().tracksStopped, 1);
});

test('failed transcription keeps audio for retry without reopening the microphone', async () => {
  const s = setup();
  let attempts = 0;
  const received: Blob[] = [];
  await s.voice.start('', () => ({ ...s.environment, transcribe: async audio => {
    received.push(audio);
    if (++attempts === 1) throw new Error('Server unavailable.');
    return 'Biology worksheet';
  } }));
  const pending = s.voice.stop();
  s.finish();
  await assert.rejects(pending, /recording is saved/);
  assert.equal(s.recordings.at(-1), true);
  assert.equal(await s.voice.stop(), 'Biology worksheet');
  assert.equal(received[0], received[1]);
  assert.equal(s.counts().tracksStopped, 1);
});

test('closing cancels an in-flight upload without applying late words', async () => {
  const s = setup();
  let signal!: AbortSignal;
  let respond!: (text: string) => void;
  await s.voice.start('', () => ({ ...s.environment, transcribe: async (_audio, uploadSignal) => {
    signal = uploadSignal;
    return new Promise(resolve => { respond = resolve; });
  } }));
  const pending = s.voice.stop();
  s.finish();
  s.voice.dispose();
  assert.equal(signal.aborted, true);
  assert.equal(await pending, '');
  respond('late speech');
  await Promise.resolve();
  assert.equal(s.texts.length, 0);
});

test('switching modes releases capture once and never uploads discarded audio', async () => {
  const s = setup();
  await s.voice.start('', () => s.environment);
  s.voice.dispose();
  s.voice.dispose();
  s.finish();
  assert.deepEqual(s.counts(), { tracksStopped: 1, audioClosed: 1, stopped: 1, transcriptions: 0 });
});

test('a stalled recorder releases the microphone and reports failure', async () => {
  const s = setup(5);
  await s.voice.start('', () => s.environment);
  await assert.rejects(s.voice.stop(), /couldn’t finish/);
  assert.equal(s.counts().tracksStopped, 1);
  assert.equal(s.statuses.at(-1), 'idle');
});
