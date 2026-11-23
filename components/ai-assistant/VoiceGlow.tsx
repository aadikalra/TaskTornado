'use client';

import { useMemo, type ReactNode } from 'react';
import { VoiceBeam, type VoiceBeamMotion } from 'voice-glow';
import { useDarkMode } from '@/context/DarkModeContext';

interface VoiceGlowProps {
  children: ReactNode;
  analyser: AnalyserNode | null;
  active: boolean;
  processing: boolean;
}

export function VoiceGlow({ children, analyser, active, processing }: VoiceGlowProps) {
  const { isDark } = useDarkMode();
  const level = useMemo(() => {
    if (!analyser) return () => 0;
    const samples = new Float32Array(analyser.fftSize);

    // Reuse dictation's analyser without opening another microphone or audio context.
    return () => {
      analyser.getFloatTimeDomainData(samples);
      let energy = 0;
      for (const sample of samples) {
        energy += sample ** 2;
      }
      // Match VoiceBeam's default microphone gain when supplying a manual level.
      return Math.min(1, Math.sqrt(energy / samples.length) * 5 * 3.1);
    };
  }, [analyser]);

  // The npm package exposes motion rather than the website's processing prop.
  const processingMotion = (): VoiceBeamMotion => ({
    gather: 1,
    offset: Math.sin(performance.now() / 900) * 0.8,
    stretch: 0.15,
    heldLevel: 0.55,
  });

  return (
    <VoiceBeam
      active={active}
      level={level}
      motion={processing ? processingMotion : null}
      theme={isDark ? 'dark' : 'light'}
      colorVariant="colorful"
      borderRadius={20}
      className="w-full"
    >
      {children}
    </VoiceBeam>
  );
}
