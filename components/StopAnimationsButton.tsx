
'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { Pause, Play } from 'lucide-react';

interface StopAnimationsButtonProps {
  areAnimationsPaused: boolean;
  onToggle: () => void;
}

export const StopAnimationsButton: React.FC<StopAnimationsButtonProps> = ({ areAnimationsPaused, onToggle }) => {
  return (
    <motion.button
      onClick={onToggle}
      className="fixed bottom-4 right-4 z-50 p-3 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-full shadow-lg border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
    >
      {areAnimationsPaused ? <Play className="w-6 h-6" /> : <Pause className="w-6 h-6" />}
    </motion.button>
  );
};
