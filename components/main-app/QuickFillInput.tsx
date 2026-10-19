'use client';

import { useEffect, useRef, useState } from 'react';
import { Mic, Square } from 'lucide-react';
import { HugeIcon } from '@/lib/huge-icon-map';
import { QuickFillVoice, type VoiceStatus } from '@/lib/quick-fill-voice';

export function VoiceWaveform({ analyser }: { analyser: AnalyserNode }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');
    if (!canvas || !context) return;

    const samples = new Uint8Array(analyser.fftSize);
    let frame = 0;

    // Rolling history of recent speech volume levels (Apple Voice Memos style)
    const history: number[] = [];
    let currentLiveLevel = 0;
    let lastSampleTime = performance.now();

    const barWidth = 3;
    const barGap = 2.5;
    const step = barWidth + barGap; // 5.5px per slot
    const timeWindowMs = 2000; // 2 seconds history window

    const draw = (timestamp: number) => {
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      const ratio = window.devicePixelRatio || 1;

      if (
        canvas.width !== Math.round(width * ratio) ||
        canvas.height !== Math.round(height * ratio)
      ) {
        canvas.width = Math.round(width * ratio);
        canvas.height = Math.round(height * ratio);
      }

      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      context.clearRect(0, 0, width, height);

      // Measure current audio peak from time-domain data
      analyser.getByteTimeDomainData(samples);
      let peak = 0;
      for (let i = 0; i < samples.length; i++) {
        const val = Math.abs(samples[i] - 128) / 128;
        if (val > peak) peak = val;
      }

      // Smooth the live instantaneous level so speech peaks are distinct yet organic
      currentLiveLevel = currentLiveLevel * 0.55 + peak * 0.45;

      // Calculate how many bars fit in the visible width and calculate sample rate for 2s total duration
      const totalBars = Math.max(10, Math.floor(width / step));
      const sampleIntervalMs = timeWindowMs / totalBars; // e.g. ~45-50ms per bar

      if (timestamp - lastSampleTime >= sampleIntervalMs) {
        history.unshift(currentLiveLevel); // newest audio at index 0
        if (history.length > totalBars + 2) {
          history.pop();
        }
        lastSampleTime = timestamp;
      }

      // Smooth horizontal offset for steady continuous scrolling between bar intervals
      const progress = Math.min(1, Math.max(0, (timestamp - lastSampleTime) / sampleIntervalMs));
      const smoothOffset = progress * step;

      const baseColor = getComputedStyle(canvas).color || '#0284c7';
      context.lineWidth = barWidth;
      context.lineCap = 'round';

      const centerY = height / 2;
      const minHalfHeight = 1.5; // 3px minimal pill when quiet
      const maxHalfHeight = Math.max(2, centerY - 2);

      // Draw historical bars scrolling from right to left
      for (let i = 0; i < history.length; i++) {
        const x = width - barWidth - i * step - smoothOffset;
        if (x < -step || x > width + step) continue;

        const level = history[i];
        const halfH = Math.min(maxHalfHeight, minHalfHeight + level * (maxHalfHeight - minHalfHeight));

        context.strokeStyle = baseColor;
        context.globalAlpha = 0.82;
        context.beginPath();
        context.moveTo(x, centerY - halfH);
        context.lineTo(x, centerY + halfH);
        context.stroke();
      }

      // Draw current "what you're saying at the moment" live bar on the right edge
      const liveX = width - barWidth / 2 - 1;
      const liveHalfH = Math.min(maxHalfHeight, minHalfHeight + currentLiveLevel * (maxHalfHeight - minHalfHeight));
      context.strokeStyle = baseColor;
      context.globalAlpha = 1.0;
      context.beginPath();
      context.moveTo(liveX, centerY - liveHalfH);
      context.lineTo(liveX, centerY + liveHalfH);
      context.stroke();

      context.globalAlpha = 1.0;
      frame = requestAnimationFrame(draw);
    };

    frame = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(frame);
  }, [analyser]);

  return (
    <canvas
      ref={canvasRef}
      className="h-7 w-full text-sky-500 dark:text-sky-400"
      aria-label="Live microphone waveform"
      role="img"
    />
  );
}

interface QuickFillInputProps {
  value: string;
  onChange(value: string): void;
  onFill(value: string): Promise<void>;
  isFilling: boolean;
}

export function QuickFillInput({ value, onChange, onFill, isFilling }: QuickFillInputProps) {
  const [status, setStatus] = useState<VoiceStatus>('idle');
  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null);
  const [error, setError] = useState('');
  const [hasRecording, setHasRecording] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const voiceRef = useRef<QuickFillVoice | null>(null);
  const onChangeRef = useRef(onChange);
  useEffect(() => { onChangeRef.current = onChange; }, [onChange]);
  useEffect(() => {
    const voice = new QuickFillVoice({
      onText: text => onChangeRef.current(text),
      onStatus: setStatus,
      onAnalyser: setAnalyser,
      onError: setError,
      onRecording: setHasRecording,
    });
    voiceRef.current = voice;
    return () => { voice.dispose(); voiceRef.current = null; };
  }, []);

  const isActive = status !== 'idle';
  const isBusy = isFilling || isSubmitting;
  const isTranscribing = status === 'transcribing';
  const submit = async () => {
    if (isBusy || status === 'starting' || status === 'stopping' || isTranscribing) return;
    setIsSubmitting(true);
    setError('');
    try {
      const voice = voiceRef.current;
      const text = isActive || hasRecording ? await voice?.stop() : value;
      if (voiceRef.current !== voice) return;
      if (text?.trim()) await onFill(text);
      else setError('No words captured yet. Try again or type your homework.');
    } catch (error) {
      if (voiceRef.current) setError(error instanceof Error ? error.message : 'Couldn’t fill the details. Try again.');
    } finally {
      if (voiceRef.current) setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="rounded-xl border border-sky-100 dark:border-gray-700 bg-white dark:bg-gray-900 overflow-hidden focus-within:border-[#d4e88e] focus-within:ring-2 focus-within:ring-[#ebf6b5]/40">
        <textarea
          value={value}
          onChange={event => onChange(event.target.value)}
          onKeyDown={event => {
            if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) {
              event.preventDefault();
              void submit();
            }
          }}
          placeholder="Math chapter 5, Friday, high priority"
          rows={3}
          autoFocus
          readOnly={isActive || isBusy}
          aria-label="Describe homework for Quick Fill"
          className="block w-full px-3 py-2.5 bg-transparent text-sm leading-relaxed text-sky-800 dark:text-sky-100 placeholder:text-sky-400/50 dark:placeholder:text-sky-500/50 outline-none resize-none focus-visible:!shadow-none"
        />
        <div className="flex min-h-10 items-center gap-3 px-3 pb-2">
          <button
            type="button"
            onClick={() => {
              if (isActive) void voiceRef.current?.stop().catch(() => {});
              else void voiceRef.current?.start(value);
            }}
            disabled={isBusy || status === 'stopping' || isTranscribing}
            aria-pressed={isActive}
            aria-label={isActive ? 'Stop microphone' : 'Start ramblr microphone'}
            className={`inline-flex h-8 shrink-0 items-center gap-1.5 rounded-lg px-2 text-xs font-medium transition-colors disabled:opacity-40 ${isActive ? 'bg-sky-50 dark:bg-sky-500/10 text-sky-700 dark:text-sky-300' : 'text-sky-500 dark:text-sky-400 hover:bg-sky-50 dark:hover:bg-sky-500/10'}`}
          >
            {isActive ? <Square className="size-3" aria-hidden="true" /> : <Mic className="size-3.5" aria-hidden="true" />}
            {status === 'starting' ? 'Connecting...' : isTranscribing ? 'Transcribing...' : status === 'stopping' ? 'Finishing...' : isActive ? 'Stop' : 'Ramblr'}
          </button>
          <div className="min-w-0 flex-1">
            {analyser ? <VoiceWaveform analyser={analyser} /> : (
              <span className="text-xs text-sky-500/60 dark:text-sky-400/60">{isTranscribing ? 'Turning speech into text' : 'Or talk it out'}</span>
            )}
          </div>
          <span className="sr-only" role="status">{status === 'listening' ? 'Recording. Stop or fill details when you’re done.' : status === 'idle' ? 'Microphone off.' : status === 'starting' ? 'Connecting microphone.' : isTranscribing ? 'Transcribing your recording.' : 'Finishing recording.'}</span>
        </div>
      </div>
      {error && <p role="alert" className="text-xs leading-5 text-red-600 dark:text-red-400">{error}</p>}
      <button
        type="button"
        onClick={() => void submit()}
        disabled={isBusy || status === 'starting' || status === 'stopping' || isTranscribing || (!value.trim() && !isActive && !hasRecording)}
        className="w-full h-9 inline-flex items-center justify-center gap-2 text-[11px] font-bold text-sky-700 dark:text-sky-300 bg-[#ebf6b5]/70 dark:bg-[#ebf6b5]/15 hover:bg-[#ebf6b5] dark:hover:bg-[#ebf6b5]/20 border border-[#d4e88e]/50 dark:border-[#d4e88e]/20 rounded-xl disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        <HugeIcon name={isBusy ? 'LoaderPinwheel' : 'Zap'} size={14} className={`size-3.5 ${isBusy ? 'animate-spin' : ''}`} />
        {isTranscribing ? 'Transcribing...' : isBusy ? 'Filling details...' : 'Fill details'}
      </button>
    </div>
  );
}
