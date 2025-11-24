'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { Award, BookOpen, ChevronRight, BarChart2 } from 'lucide-react';
import { useGamification } from '@/context/GamificationContext';
import { cn } from '@/lib/utils';

interface SubjectMasteryProps {
  className?: string;
  maxItems?: number;
}

export const SubjectMastery = ({ className, maxItems = 5 }: SubjectMasteryProps) => {
  const { data } = useGamification();

  const sortedSubjects = React.useMemo(() => {
    return Object.values(data.subjectMastery)
      .sort((a, b) => b.masteryLevel - a.masteryLevel)
      .slice(0, maxItems);
  }, [data.subjectMastery, maxItems]);

  const getProgressColor = (level: number) => {
    if (level >= 80) return 'bg-gradient-to-r from-[#264f84] to-blue-600 dark:from-blue-500 dark:to-blue-400';
    if (level >= 50) return 'bg-gradient-to-r from-[#264f84]/70 to-blue-600/70 dark:from-blue-500/70 dark:to-blue-400/70';
    return 'bg-gradient-to-r from-[#264f84]/50 to-blue-600/50 dark:from-blue-500/50 dark:to-blue-400/50';
  };

  if (sortedSubjects.length === 0) {
    return (
      <div className={cn("w-full bg-white dark:bg-gray-900 p-4 rounded-lg border border-gray-200 dark:border-gray-800", className)}>
         <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-light text-gray-900 dark:text-white tracking-tight">
              Subject Mastery
            </h2>
          </div>
        <div className="text-center py-8 border border-dashed border-gray-200 dark:border-gray-800 rounded-lg">
          <div className="inline-flex items-center justify-center w-10 h-10 bg-gray-50 dark:bg-gray-900 rounded-full mb-3">
            <BarChart2 className="h-4 w-4 text-gray-400" />
          </div>
          <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">
            No data available
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Complete assignments to see your stats.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("w-full bg-white dark:bg-gray-900 p-4 rounded-lg border border-gray-200 dark:border-gray-800", className)}>
      <div className="space-y-1">
        {sortedSubjects.map((subject, index) => (
          <motion.div
            key={subject.classId}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="group py-2 border-b border-gray-100 dark:border-gray-900 last:border-0"
          >
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-gray-400 dark:text-gray-600 w-4">
                  {index + 1}
                </span>
                <h3 className="text-sm font-medium text-gray-900 dark:text-white group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors truncate">
                  {subject.className}
                </h3>
              </div>
              <div className="text-right">
                <span className="text-xs font-medium text-gray-900 dark:text-white">
                  {Math.round(subject.masteryLevel)}%
                </span>
              </div>
            </div>
            
            <div className="pl-6">
               <div className="h-1 w-full bg-gray-100 dark:bg-gray-900 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${subject.masteryLevel}%` }}
                  transition={{ duration: 0.8, delay: 0.2 + (index * 0.1), ease: [0.22, 1, 0.36, 1] }}
                  className={cn("h-full rounded-full", getProgressColor(subject.masteryLevel))}
                />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {Object.keys(data.subjectMastery).length > maxItems && (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-3 pt-2 border-t border-gray-100 dark:border-gray-900 flex justify-center"
        >
            <button className="text-xs text-gray-500 hover:text-gray-900 dark:text-gray-500 dark:hover:text-white transition-colors flex items-center gap-1">
                View all <ChevronRight className="w-3 h-3" />
            </button>
        </motion.div>
      )}
    </div>
  );
}