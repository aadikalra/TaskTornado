'use client';

import { createContext, useContext, useEffect, useState, type CSSProperties, type HTMLAttributes, type ReactNode } from 'react';
import styles from './DashboardIntro.module.css';

// Temporary entrance for the app intro recording. Flip this off to remove it.
const DASHBOARD_INTRO_ENABLED = false;
const IntroStarted = createContext(true);

export function DashboardIntroProvider({ ready, children }: { ready: boolean; children: ReactNode }) {
  const [started, setStarted] = useState(false);

  useEffect(() => {
    if (!ready || started || !DASHBOARD_INTRO_ENABLED) return;
    let secondFrame = 0;
    // Begin together after the loaded dashboard has its final layout.
    const firstFrame = requestAnimationFrame(() => {
      secondFrame = requestAnimationFrame(() => setStarted(true));
    });
    return () => {
      cancelAnimationFrame(firstFrame);
      cancelAnimationFrame(secondFrame);
    };
  }, [ready, started]);

  return <IntroStarted.Provider value={started}>{children}</IntroStarted.Provider>;
}

interface DashboardFloatProps extends HTMLAttributes<HTMLDivElement> {
  delayMs?: number;
  tilt?: number;
  kind?: 'heading' | 'panel' | 'card';
}

export function DashboardFloat({
  delayMs = 0, tilt = 0, kind = 'panel', className = '', style, onAnimationEnd, ...props
}: DashboardFloatProps) {
  const started = useContext(IntroStarted);
  const [landed, setLanded] = useState(false);
  const isHeading = kind === 'heading';
  return (
    <div
      {...props}
      className={`${DASHBOARD_INTRO_ENABLED && !landed ? styles.float : ''} ${className}`}
      data-intro-started={started}
      onAnimationEnd={event => {
        if (event.target === event.currentTarget) setLanded(true);
        onAnimationEnd?.(event);
      }}
      style={{
        '--float-delay': `${Math.min(Math.max(delayMs, 0), 850)}ms`,
        '--float-x': `${tilt * (isHeading ? 14 : 38)}px`,
        '--float-y': isHeading ? '28px' : kind === 'card' ? '76px' : '56px',
        '--float-depth': isHeading ? '-90px' : '-180px',
        '--float-rotate-x': isHeading ? '8deg' : '14deg',
        '--float-rotate-y': `${tilt * 9}deg`,
        '--float-rotate-z': `${tilt * 1.2}deg`,
        ...style,
      } as CSSProperties}
    />
  );
}
