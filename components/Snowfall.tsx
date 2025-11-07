
'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { Snowflake as SnowflakeIcon } from 'lucide-react';
import { useDarkMode } from '@/context/DarkModeContext';

const Snowflake = ({ isDark }: { isDark: boolean }) => {
  const x = Math.random() * 100;
  const size = Math.random() * 15 + 8; // Larger size for snowflake icon
  const duration = Math.random() * 10 + 10;
  const delay = Math.random() * 5;

  return (
    <motion.div
      style={{
        position: 'fixed',
        top: `-${size}px`,
        left: `${x}vw`,
        pointerEvents: 'none',
        opacity: Math.random() * 0.5 + 0.3,
        zIndex: 9999, // Ensure snowflakes are on top
      }}
      animate={{
        y: '100vh',
        x: [`${x}vw`, `${x + Math.random() * 10 - 5}vw`, `${x}vw`],
        rotate: [0, 360],
      }}
      transition={{
        duration,
        delay,
        repeat: Infinity,
        repeatType: 'loop',
        ease: 'linear',
      }}
    >
      <SnowflakeIcon size={size} color={isDark ? "white" : "#ADD8E6"} />
    </motion.div>
  );
};

export const Snowfall = ({ count = 100 }: { count?: number }) => {
  const { isDark } = useDarkMode();

  return (
    <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-50">
      {Array.from({ length: count }).map((_, i) => (
        <Snowflake key={i} isDark={isDark} />
      ))}
    </div>
  );
};
