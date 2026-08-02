import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useHomeworkContext } from '@/context/HomeworkContext';
import { useTestContext } from '@/context/TestContext';
import { HugeIcon } from '@/lib/huge-icon-map';

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
        prompt: 'Give me a quick summary of my current workload and tell me what I should prioritize today.',
        icon: 'Sparkles'
      });
    }

    const nextHw = homeworks
      .filter(hw => !hw.completed && new Date(hw.dueDate) >= new Date(new Date().setHours(0, 0, 0, 0)))
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())[0];

    if (nextHw) {
      priorityChips.push({
        label: `Plan: ${nextHw.title}`,
        prompt: `I need to work on "${nextHw.title}". Can you help me break this assignment into small, manageable steps?`,
        icon: 'FilePen'
      });
    }

    const nextTest = tests
      .filter(t => t.status !== 'taken' && new Date(t.testDate) >= new Date(new Date().setHours(0, 0, 0, 0)))
      .sort((a, b) => new Date(a.testDate).getTime() - new Date(b.testDate).getTime())[0];

    if (nextTest) {
      priorityChips.push({
        label: `Quiz: ${nextTest.title}`,
        prompt: `I have a test on "${nextTest.title}" coming up. Can you generate a quick 5-question practice quiz for me?`,
        icon: 'Quiz04'
      });
    }

    // 2. Utility Pool: Varied actions
    const utilityPool = [
      { label: 'Study Resources', prompt: 'Help me find study materials and helpful links for my classes.', icon: 'Internet' },
      { label: 'Generate Flashcards', prompt: 'Help me create a set of flashcards for my upcoming topics.', icon: 'Cards01' },
      { label: 'Grade Draft', prompt: 'Can you evaluate my current assignment draft and give me feedback?', icon: 'FilePen' },
      { label: 'Study Tip', prompt: 'Tell me a scientifically proven study technique to improve memory.', icon: 'Lightbulb' },
      { label: 'Focus Boost', prompt: 'I am struggling to focus. What are some quick tips to get back into deep work?', icon: 'Zap' },
      { label: 'Practice Quiz', prompt: 'Generate a surprise interactive quiz to test my general knowledge.', icon: 'Quiz04' },
      { label: 'Review Progress', prompt: 'Show me my recent academic progress and subject mastery.', icon: 'ChartAnalysis' },
      { label: 'Explain Concept', prompt: 'I found a difficult concept today. Can you explain it to me in simple terms.', icon: 'AiMagic' }
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
    <div className={`relative px-1 py-1 flex items-center gap-1.5 overflow-x-auto scrollbar-none [ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden snap-x ${className}`}>
      <AnimatePresence mode="popLayout">
        {contextChips.map((chip, idx) => (
          <motion.button
            key={`${chip.label}-${chipRotation}`}
            initial={{ opacity: 0, y: 8, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            whileHover={{ scale: 1.03, y: -1 }}
            whileTap={{ scale: 0.97 }}
            transition={{ duration: 0.2, delay: idx * 0.04 }}
            onClick={() => onChipClick(chip.prompt)}
            className="flex-shrink-0 snap-center h-7 px-3 rounded-xl bg-white/70 dark:bg-gray-900/70 border border-sky-100/70 dark:border-white/10 text-xs text-zinc-700 dark:text-zinc-200 font-medium hover:bg-white dark:hover:bg-gray-800 hover:border-sky-300 dark:hover:border-sky-500 hover:text-sky-950 dark:hover:text-white shadow-xs backdrop-blur-md transition-all flex items-center gap-1.5 whitespace-nowrap outline-none select-none"
          >
            {chip.icon && (
              <HugeIcon name={chip.icon} className="h-3.5 w-3.5 text-sky-500" size={14} />
            )}
            <span>{chip.label}</span>
          </motion.button>
        ))}
      </AnimatePresence>
    </div>
  );
};
