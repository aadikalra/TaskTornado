'use client';

import React, { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useDarkMode } from '@/context/DarkModeContext';
import { cn } from '@/lib/utils';

interface AuraVideoIconProps {
  isLoading?: boolean;
  selectedModel: string;
  layoutId?: string;
}

export const AuraVideoIcon = ({ isLoading, selectedModel, layoutId }: AuraVideoIconProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const { isDark } = useDarkMode();

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isLoading) {
      video.playbackRate = 3.0; // Speed up during output
      video.play().catch(() => { });
    } else {
      video.pause(); // Pause where it is when finished
    }
  }, [isLoading]);

  return (
    <motion.div
      layoutId={layoutId}
      initial={!layoutId ? { scale: 0.8, opacity: 0 } : undefined}
      animate={!layoutId ? { scale: 1, opacity: 1 } : undefined}
      className="relative h-8 w-8 rounded-full flex items-center justify-center overflow-hidden"
    >
      <video
        ref={videoRef}
        src={isDark ? "/AI SphereDark2.mp4" : "/AI SphereNew.mp4"}
        muted
        playsInline
        loop
        className="w-full h-full object-cover scale-110 opacity-90"
      />
      <div className={cn(
        "absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full border border-white dark:border-zinc-900 z-10 shadow-sm",
        selectedModel === 'quick' ? "bg-teal-500" : "bg-purple-500"
      )} />
    </motion.div>
  );
};
