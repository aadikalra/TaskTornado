'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Target, Trophy } from 'lucide-react';
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

  if (sortedSubjects.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn('bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4', className)}
      >
        <div className="flex items-center space-x-2 mb-3">
          <BookOpen className="h-5 w-5 text-gray-400 dark:text-gray-500" />
          <span className="font-semibold text-gray-900 dark:text-gray-100">Subject Mastery</span>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
          Complete assignments to see your subject progress!
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn('bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4', className)}
    >
      <div className="flex items-center space-x-2 mb-3">
        <BookOpen className="h-5 w-5 text-gray-400 dark:text-gray-500" />
        <span className="font-semibold text-gray-900 dark:text-gray-100">Subject Mastery</span>
      </div>

      <div className="space-y-3">
        {sortedSubjects.map((subject, index) => {
          const isTopSubject = index === 0 && subject.masteryLevel >= 80;
          const isWellProgressed = subject.masteryLevel >= 50;

          return (
            <motion.div
              key={subject.classId}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="space-y-2"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                    {subject.className}
                  </span>
                  {isTopSubject && <Trophy className="h-4 w-4 text-yellow-500" />}
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {Math.round(subject.masteryLevel)}%
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {subject.completedAssignments}/{subject.totalAssignments}
                  </span>
                </div>
              </div>

              <div className="relative">
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${subject.masteryLevel}%` }}
                    transition={{ duration: 1, delay: index * 0.1, ease: 'easeOut' }}
                    className={cn(
                      'h-2 rounded-full transition-colors',
                      isTopSubject ? 'bg-gradient-to-r from-yellow-400 to-yellow-600' :
                      isWellProgressed ? 'bg-gradient-to-r from-green-400 to-green-600' :
                      'bg-gradient-to-r from-blue-400 to-blue-600'
                    )}
                  />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {Object.keys(data.subjectMastery).length > maxItems && (
        <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-3">
          +{Object.keys(data.subjectMastery).length - maxItems} more subjects
        </p>
      )}
    </motion.div>
  );
};
