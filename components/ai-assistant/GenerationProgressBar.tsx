'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export const GenerationProgressBar = () => {
  const [progress, setProgress] = useState(0);
  const [label, setLabel] = useState('Preparing...');

  useEffect(() => {
    const stages = [
      { at: 5, label: 'Analyzing topic...' },
      { at: 20, label: 'Crafting questions...' },
      { at: 45, label: 'Building answer options...' },
      { at: 65, label: 'Adding explanations...' },
      { at: 80, label: 'Finalizing...' },
    ];

    // Fast initial ramp, then slow crawl
    let frame: number;
    let start: number | null = null;

    const tick = (ts: number) => {
      if (!start) start = ts;
      const elapsed = (ts - start) / 1000; // seconds

      // ease-out curve: fast start → slow finish, caps at 88%
      const p = Math.min(88, 88 * (1 - Math.exp(-elapsed / 5)));
      setProgress(p);

      // Update label based on progress
      for (let i = stages.length - 1; i >= 0; i--) {
        if (p >= stages[i].at) { setLabel(stages[i].label); break; }
      }

      frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <div className="mt-3 w-full max-w-[260px]">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[10px] font-semibold text-white/40 uppercase tracking-wider">{label}</span>
        <span className="text-[10px] font-bold text-white/30 tabular-nums">{Math.round(progress)}%</span>
      </div>
      <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-sky-400 rounded-full"
          style={{ width: `${progress}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>
    </div>
  );
};
