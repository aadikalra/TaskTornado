'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useHomeworkContext } from '@/context/HomeworkContext';
import { useTestContext } from '@/context/TestContext';

interface ContextChipProps {
  onChipClick: (prompt: string) => void;
  className?: string;
}

export const ContextChips = ({ onChipClick, className = '' }: ContextChipProps) => {
  const { homeworks = [] } = useHomeworkContext() || {};
  const { tests = [] } = useTestContext() || {};
  const [chipRotation, setChipRotation] = useState(0);

  const contextChips = useMemo(() => {
    const priorityChips = [];

    // 1. High Priority: Data-Driven Actions
    if (homeworks.length > 0 || tests.length > 0) {
      priorityChips.push({
        label: 'Workload Overview',
        prompt: 'Give me a quick summary of my current workload and tell me what I should prioritize today.'
      });
    }

    const nextHw = homeworks
      .filter(hw => !hw.completed && new Date(hw.dueDate) >= new Date(new Date().setHours(0, 0, 0, 0)))
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())[0];

    if (nextHw) {
      priorityChips.push({
        label: `Plan: ${nextHw.title}`,
        prompt: `I need to work on "${nextHw.title}". Can you help me break this assignment into small, manageable steps?`
      });
    }

    const nextTest = tests
      .filter(t => t.status !== 'taken' && new Date(t.testDate) >= new Date(new Date().setHours(0, 0, 0, 0)))
      .sort((a, b) => new Date(a.testDate).getTime() - new Date(b.testDate).getTime())[0];

    if (nextTest) {
      priorityChips.push({
        label: `Quiz me: ${nextTest.title}`,
        prompt: `I have a test on "${nextTest.title}" coming up. Can you generate a quick 5-question practice quiz for me?`
      });
    }

    // 2. Utility Pool: Varied actions
    const utilityPool = [
      { label: 'Study Resources', prompt: 'Help me find study materials and helpful links for my classes.' },
      { label: 'Generate Flashcards', prompt: 'Help me create a set of flashcards for my upcoming topics.' },
      { label: 'Grade my draft', prompt: 'Can you evaluate my current assignment draft and give me feedback?' },
      { label: 'Mental Support', prompt: 'I am feeling a bit stressed with school lately. Can we talk?' },
      { label: 'Study Tip', prompt: 'Tell me a scientifically proven study technique to improve memory.' },
      { label: 'Focus Boost', prompt: 'I am struggling to focus. What are some quick tips to get back into deep work?' },
      { label: 'Practice Quiz', prompt: 'Generate a surprise interactive quiz to test my general knowledge.' },
      { label: 'Review Progress', prompt: 'Show me my recent academic progress and subject mastery.' },
      { label: 'Explain Concept', prompt: 'I found a difficult concept today. Can you explain it to me in simple terms.' }
    ];

    // Shuffle utility pool using rotation seed
    const shuffledUtility = [...utilityPool].sort(() => 0.5 - (chipRotation % 1 || 0.5));

    // Mix priority and utility
    const combined = [...priorityChips];
    shuffledUtility.forEach(u => {
      if (!combined.find(p => p.label === u.label)) {
        combined.push(u);
      }
    });

    return combined.slice(0, 4);
  }, [homeworks, tests, chipRotation]);

  return (
    <div className={`relative px-4 pb-2 pt-1 flex gap-2 overflow-x-auto scrollbar-hide snap-x ${className}`}>
      <AnimatePresence mode="popLayout">
        {contextChips.map((chip, idx) => (
          <motion.button
            key={`${chip.label}-${chipRotation}`}
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.2, delay: idx * 0.05 }}
            onClick={() => onChipClick(chip.prompt)}
            className="flex-shrink-0 snap-center h-8 px-3 rounded-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-[13px] text-zinc-600 dark:text-zinc-300 font-medium hover:bg-zinc-200 dark:hover:bg-zinc-700 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors whitespace-nowrap outline-none select-none"
          >
            {chip.label}
          </motion.button>
        ))}
      </AnimatePresence>
      <motion.button
        whileHover={{ rotate: 180 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setChipRotation(prev => prev + 1)}
        className="flex-shrink-0 snap-center h-8 w-8 rounded-full flex items-center justify-center bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors outline-none"
      >
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      </motion.button>
    </div>
  );
};
