export type VoiceStatus = 'idle' | 'starting' | 'listening' | 'stopping' | 'transcribing';

interface VoiceEnvironment {
  getMicrophone(): Promise<MediaStream>;
  createAudioContext(): AudioContext;
  createRecorder(stream: MediaStream): MediaRecorder;
  transcribe(audio: Blob, signal: AbortSignal): Promise<string>;
}

interface VoiceCallbacks {
  onText(text: string): void;
  onStatus(status: VoiceStatus): void;
  onAnalyser(analyser: AnalyserNode | null): void;
  onError(message: string): void;
  onRecording?(hasRecording: boolean): void;
}

export function browserVoiceEnvironment(): VoiceEnvironment {
  if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === 'undefined') {
    throw new Error('Audio recording isn’t supported in this browser. You can still type your homework.');
  }
  return {
    getMicrophone: () => navigator.mediaDevices.getUserMedia({ audio: true }),
    createAudioContext: () => new AudioContext(),
    createRecorder: stream => {
      const mimeType = ['audio/webm;codecs=opus', 'audio/mp4', 'audio/ogg;codecs=opus']
        .find(type => MediaRecorder.isTypeSupported(type));
      return new MediaRecorder(stream, { ...(mimeType ? { mimeType } : {}), audioBitsPerSecond: 64_000 });
    },
    transcribe: async (audio, signal) => {
      const form = new FormData();
      const extension = audio.type.includes('mp4') ? 'mp4' : audio.type.includes('ogg') ? 'ogg' : 'webm';
      form.append('audio', audio, `ramble.${extension}`);
      const response = await fetch('/api/ai/transcribe', { method: 'POST', body: form, signal });
      const data = await response.json().catch(() => null);
      if (!response.ok) throw new Error(response.status === 401
        ? 'Sign in again to transcribe your ramble.'
        : data?.error || 'Couldn’t transcribe your ramble. Try again.');
      if (typeof data?.text !== 'string' || !data.text.trim()) throw new Error('No speech heard. Try another ramble.');
      return data.text.trim();
    },
  };
}

// Record locally; only upload after Stop or Fill details. No browser speech service.
export class QuickFillVoice {
  private recorder: MediaRecorder | null = null;
  private stream: MediaStream | null = null;
  private audio: AudioContext | null = null;
  private source: MediaStreamAudioSourceNode | null = null;
  private environment: VoiceEnvironment | null = null;
  private generation = 0;
  private starting = false;
  private disposed = false;
  private text = '';
  private prefix = '';
  private chunks: Blob[] = [];
  private recording: Blob | null = null;
  private transcription: AbortController | null = null;
  private pendingStop: Promise<string> | null = null;
  private resolveStop: ((text: string) => void) | null = null;
  private rejectStop: ((error: Error) => void) | null = null;
  private limitTimer: ReturnType<typeof setTimeout> | null = null;
  private stopTimer: ReturnType<typeof setTimeout> | null = null;
  private callbacks: VoiceCallbacks;
  private stopTimeoutMs: number;

  constructor(callbacks: VoiceCallbacks, stopTimeoutMs = 3000) {
    this.callbacks = callbacks;
    this.stopTimeoutMs = stopTimeoutMs;
  }

  async start(prefix: string, getEnvironment = browserVoiceEnvironment) {
    if (this.disposed || this.starting || this.recorder || this.transcription) return;
    this.starting = true;
    const generation = ++this.generation;
    this.text = this.prefix = prefix;
    this.chunks = [];
    this.recording = null;
    this.callbacks.onRecording?.(false);
    this.callbacks.onError('');
    this.callbacks.onStatus('starting');
    try {
      const environment = getEnvironment();
      this.environment = environment;
      const stream = await environment.getMicrophone();
      if (this.disposed || generation !== this.generation) {
        stream.getTracks().forEach(track => track.stop());
        return;
      }
      this.stream = stream;
      const audio = environment.createAudioContext();
      this.audio = audio;
      await audio.resume();
      if (this.disposed || generation !== this.generation) return;
      const analyser = audio.createAnalyser();
      analyser.fftSize = 1024;
      this.source = audio.createMediaStreamSource(stream);
      this.source.connect(analyser);
      this.callbacks.onAnalyser(analyser);
      const recorder = environment.createRecorder(stream);
      this.recorder = recorder;
      recorder.ondataavailable = event => {
        if (!this.disposed && generation === this.generation && event.data.size) this.chunks.push(event.data);
      };
      recorder.onerror = () => this.fail(new Error('The microphone stopped recording. Check it and try again.'));
      recorder.onstop = () => {
        if (this.disposed || generation !== this.generation) return;
        this.recording = new Blob(this.chunks, { type: recorder.mimeType || this.chunks[0]?.type || 'audio/webm' });
        this.chunks = [];
        this.releaseMicrophone();
        this.callbacks.onRecording?.(this.recording.size > 0);
        void this.transcribe();
      };
      recorder.start(1000);
      this.starting = false;
      this.callbacks.onStatus('listening');
      this.limitTimer = setTimeout(() => { void this.stop().catch(() => {}); }, 120_000);
    } catch (error) {
      if (this.disposed || generation !== this.generation) return;
      this.fail(new Error(error instanceof Error && error.name === 'NotAllowedError'
        ? 'Allow microphone access to start rambling.'
        : error instanceof Error && error.name === 'NotFoundError'
          ? 'No microphone found. Connect one and try again.'
          : error instanceof Error ? error.message : 'Couldn’t start the microphone. Try again.'));
    }
  }

  stop(): Promise<string> {
    if (this.pendingStop) return this.pendingStop;
    if (this.starting) {
      ++this.generation;
      this.releaseMicrophone();
      this.callbacks.onStatus('idle');
      return Promise.resolve(this.text);
    }
    if (!this.recorder && !this.recording && !this.transcription) return Promise.resolve(this.text);
    this.pendingStop = new Promise((resolve, reject) => {
      this.resolveStop = resolve;
      this.rejectStop = reject;
    });
    const pending = this.pendingStop;
    if (this.recorder) {
      this.callbacks.onStatus('stopping');
      this.stopTimer = setTimeout(() => this.fail(new Error('The microphone couldn’t finish recording. Please try again.')), this.stopTimeoutMs);
      try { this.recorder.stop(); } catch { this.fail(new Error('Couldn’t finish recording. Please try again.')); }
    } else if (!this.transcription) {
      void this.transcribe();
    }
    return pending;
  }

  private async transcribe() {
    if (!this.recording?.size || !this.environment) {
      this.fail(new Error('No audio captured. Try another ramble.'));
      return;
    }
    const generation = this.generation;
    const controller = new AbortController();
    this.transcription = controller;
    this.callbacks.onStatus('transcribing');
    try {
      const spoken = await this.environment.transcribe(this.recording, controller.signal);
      if (this.disposed || generation !== this.generation) return;
      this.text = [this.prefix.trim(), spoken.trim()].filter(Boolean).join(' ');
      this.recording = null;
      this.callbacks.onRecording?.(false);
      this.callbacks.onText(this.text);
      this.callbacks.onError('');
      this.callbacks.onStatus('idle');
      this.resolveStop?.(this.text);
      this.clearPendingStop();
    } catch (error) {
      if (this.disposed || generation !== this.generation) return;
      this.fail(new Error(`${error instanceof Error ? error.message : 'Couldn’t transcribe your ramble.'} Your recording is saved; press Fill details to retry.`));
    } finally {
      if (this.transcription === controller) this.transcription = null;
    }
  }

  private clearPendingStop() {
    this.resolveStop = this.rejectStop = null;
    this.pendingStop = null;
  }

  private releaseMicrophone() {
    this.starting = false;
    if (this.limitTimer) clearTimeout(this.limitTimer);
    if (this.stopTimer) clearTimeout(this.stopTimer);
    this.limitTimer = this.stopTimer = null;
    const recorder = this.recorder;
    this.recorder = null;
    if (recorder) {
      recorder.ondataavailable = recorder.onerror = recorder.onstop = null;
      if (recorder.state !== 'inactive') { try { recorder.stop(); } catch {} }
    }
    this.source?.disconnect();
    this.source = null;
    this.stream?.getTracks().forEach(track => track.stop());
    this.stream = null;
    if (this.audio) void this.audio.close().catch(() => {});
    this.audio = null;
    if (!this.disposed) this.callbacks.onAnalyser(null);
  }

  private fail(error: Error) {
    this.releaseMicrophone();
    if (!this.disposed) {
      this.callbacks.onError(error.message);
      this.callbacks.onStatus('idle');
    }
    this.rejectStop?.(error);
    this.clearPendingStop();
  }

  dispose() {
    this.disposed = true;
    ++this.generation;
    this.transcription?.abort();
    this.transcription = null;
    this.releaseMicrophone();
    this.resolveStop?.(this.text);
    this.clearPendingStop();
    this.recording = null;
    this.chunks = [];
  }
}
