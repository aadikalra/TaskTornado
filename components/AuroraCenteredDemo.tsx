'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'framer-motion';
import { AuraVideoIcon } from '@/components/ai-assistant/AuraVideoIcon';

// Dynamically import AIAssistant with SSR disabled to guarantee smooth client hydration
const AIAssistant = dynamic(
  () => import('@/components/AIAssistant').then((m) => m.AIAssistant),
  { ssr: false }
);

export function AuroraCenteredDemo() {
  const [isOpen, setIsOpen] = useState(true);

  // Keyboard shortcut listener to re-open or toggle
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="min-h-screen w-full bg-[#fffaf4] dark:bg-gray-950 flex items-center justify-center relative overflow-hidden font-sans text-sky-950 dark:text-sky-50 transition-colors duration-300">
      {/* Subtle ambient gradient mesh for depth */}
      <div
        className="absolute inset-0 pointer-events-none opacity-40 dark:opacity-20 transition-opacity duration-500"
        aria-hidden="true"
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-sky-200/40 via-teal-100/30 to-amber-100/20 dark:from-sky-900/30 dark:via-teal-900/20 dark:to-transparent rounded-full blur-3xl" />
      </div>

      {/* Centered Aurora Assistant Pop-up */}
      <AIAssistant
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        isCentered={true}
      />

      {/* Re-open Trigger Pill (Visible when Aurora is closed) */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 12 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col items-center gap-3 z-30"
          >
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              type="button"
              onClick={() => setIsOpen(true)}
              className="flex items-center gap-3 px-6 py-3.5 rounded-full bg-white/90 dark:bg-gray-900/90 border border-sky-200/80 dark:border-gray-700 shadow-2xl shadow-sky-950/10 dark:shadow-black/50 text-sky-900 dark:text-sky-100 font-semibold text-sm backdrop-blur-md hover:border-sky-300 dark:hover:border-sky-500 transition-all cursor-pointer"
            >
              <AuraVideoIcon isLoading={false} selectedModel="quick" />
              <span>Open Aurora AI</span>
              <kbd className="hidden sm:inline-block ml-1 px-2 py-0.5 text-[10px] font-mono font-medium rounded-md bg-sky-50 dark:bg-gray-800 text-sky-600 dark:text-sky-400 border border-sky-100 dark:border-gray-700">
                ⌘K
              </kbd>
            </motion.button>
            <p className="text-xs text-sky-600/60 dark:text-sky-400/60">
              Click to summon Aurora in center view
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
