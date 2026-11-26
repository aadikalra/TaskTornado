'use client';

import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import {
  AURORA_PALETTES,
  useAuroraAppearance,
  type AuroraAppearance,
  type AuroraExpression,
} from './aurora-appearance';
import styles from './AuroraAvatar.module.css';

interface AuroraAvatarProps {
  expression?: AuroraExpression;
  appearance?: AuroraAppearance;
  motionEnabled?: boolean;
  celebrateCompletion?: boolean;
  layoutId?: string;
  className?: string;
}

export function AuroraAvatar({
  expression = 'idle',
  appearance,
  motionEnabled = true,
  celebrateCompletion = false,
  layoutId,
  className = 'size-8',
}: AuroraAvatarProps) {
  const savedAppearance = useAuroraAppearance();
  const { shape, palette, eyes, blink } = appearance ?? savedAppearance;
  const colors = AURORA_PALETTES.find(option => option.id === palette) ?? AURORA_PALETTES[0];
  const reduceMotion = useReducedMotion();
  const animateEntry = motionEnabled && !layoutId && !reduceMotion;
  const previousExpression = useRef(expression);
  const [justFinished, setJustFinished] = useState(false);

  useEffect(() => {
    const wasWorking = previousExpression.current === 'working' || previousExpression.current === 'thinking';
    previousExpression.current = expression;
    if (!celebrateCompletion || !wasWorking || expression !== 'idle') {
      setJustFinished(false);
      return;
    }
    setJustFinished(true);
    const timeout = window.setTimeout(() => setJustFinished(false), 1800);
    return () => window.clearTimeout(timeout);
  }, [celebrateCompletion, expression]);

  return (
    <motion.span
      aria-hidden="true"
      data-slot="aurora-avatar"
      data-shape={shape}
      data-palette={palette}
      data-eyes={eyes}
      data-expression={justFinished && expression === 'idle' ? 'done' : expression}
      data-motion={motionEnabled}
      data-blink={motionEnabled && blink}
      layoutId={reduceMotion ? undefined : layoutId}
      initial={animateEntry ? { scale: 0.86, opacity: 0 } : false}
      animate={animateEntry ? { scale: 1, opacity: 1 } : undefined}
      className={`${styles.avatar} ${className}`}
      style={{ '--aurora-body': colors.body, '--aurora-eye': colors.eyes } as CSSProperties}
    >
      <span className={styles.shell}>
        <span className={styles.body}>
          <span className={styles.face}>
            <span className={styles.lid}><span className={styles.eye} /></span>
            <span className={styles.lid}><span className={styles.eye} /></span>
          </span>
        </span>
      </span>
    </motion.span>
  );
}
