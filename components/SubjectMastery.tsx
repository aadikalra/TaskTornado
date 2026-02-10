'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { useGamification } from '@/context/GamificationContext';
import { useClassContext } from '@/context/ClassContext';
import { cn } from '@/lib/utils';

export const SubjectMastery = ({ className }: { className?: string }) => {
  const { data } = useGamification();
  const { classes } = useClassContext();

  const mainAppColors = [
    '#E53E3E', '#3182CE', '#D69E2E', '#38A169',
    '#805AD5', '#D53F8C', '#2E7774', '#4A5568'
  ];

  const allSubjects = React.useMemo(() => {
    return Object.values(data.subjectMastery)
      .map(subject => {
        const classIndex = classes.findIndex(c => c.id === subject.classId);
        const color = classIndex !== -1
          ? mainAppColors[classIndex % mainAppColors.length]
          : '#4A5568';
        return { ...subject, color };
      })
      .sort((a, b) => b.masteryLevel - a.masteryLevel);
  }, [data.subjectMastery, classes]);

  if (allSubjects.length === 0) {
    return (
      <div className={cn("w-full bg-white dark:bg-gray-900 p-4 rounded-lg border border-gray-200 dark:border-gray-800", className)}>
        <h2 className="text-[10px] font-medium text-gray-400 uppercase tracking-widest mb-3">Subject Mastery</h2>
        <div className="text-center py-8 border border-dashed border-gray-100 dark:border-gray-800 rounded-lg">
          <p className="text-xs text-gray-500">No data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("w-full bg-white dark:bg-gray-900 p-5 rounded-lg border border-gray-200 dark:border-gray-800", className)}>
      <h2 className="text-[10px] font-medium text-gray-400 uppercase tracking-widest mb-4">Subject Mastery</h2>

      <div className="space-y-3.5">
        {allSubjects.map((subject, idx) => (
          <motion.div
            key={subject.classId}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.04, duration: 0.3 }}
            className="flex items-center gap-3"
          >
            {/* Color dot */}
            <div
              className="w-2 h-2 rounded-full shrink-0"
              style={{ backgroundColor: subject.color }}
            />

            {/* Name */}
            <span className="text-[12px] font-medium text-gray-700 dark:text-gray-300 truncate min-w-[80px] max-w-[120px]">
              {subject.className}
            </span>

            {/* Progress bar */}
            <div className="flex-1 h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{ backgroundColor: subject.color }}
                initial={{ width: 0 }}
                animate={{ width: `${Math.max(subject.masteryLevel, 2)}%` }}
                transition={{ duration: 0.8, delay: 0.2 + idx * 0.04, ease: [0.16, 1, 0.3, 1] }}
              />
            </div>

            {/* Percentage */}
            <span className="text-[11px] font-medium tabular-nums text-gray-400 dark:text-gray-500 w-8 text-right shrink-0">
              {Math.round(subject.masteryLevel)}%
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
