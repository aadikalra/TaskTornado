'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Target, Trophy, Sparkles, Award, Plus } from 'lucide-react';
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

  const getMasteryColor = (level: number) => {
    if (level >= 80) return {
      gradient: 'from-amber-400 via-yellow-500 to-orange-500',
      text: 'text-amber-400',
      glow: 'shadow-amber-500/30',
      bg: 'bg-amber-500/10'
    };
    if (level >= 50) return {
      gradient: 'from-emerald-400 via-green-500 to-teal-500',
      text: 'text-emerald-400',
      glow: 'shadow-green-500/30',
      bg: 'bg-emerald-500/10'
    };
    return {
      gradient: 'from-cyan-400 via-blue-500 to-indigo-500',
      text: 'text-blue-400',
      glow: 'shadow-blue-500/30',
      bg: 'bg-blue-500/10'
    };
  };

  if (sortedSubjects.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className={cn(
          'relative overflow-hidden rounded-2xl p-4',
          'bg-white/80 dark:bg-[#1e2938] backdrop-blur-md',
          'border border-gray-200 dark:border-white/10',
          'shadow-sm dark:shadow-none',
          className
        )}
      >
        <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full blur-3xl opacity-20 bg-gradient-to-br from-blue-400 to-purple-500" />
        
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-3">
<BookOpen className="w-5 h-5 text-white" strokeWidth={2.5} />
            <div>
              <p className="text-[10px] text-gray-500 dark:text-white mt-0.5">Top {sortedSubjects.length} performing</p>            </div>
          </div>
          
          <div className="flex flex-col items-center justify-center py-4">
            <Target className="w-12 h-12 text-gray-300 dark:text-green-500/40 mb-2" />
            <p className="text-xs text-gray-500 dark:text-green-500/70 text-center">
              Complete assignments to track your mastery!
            </p>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn(
        'relative overflow-hidden rounded-2xl p-4',
        'bg-white/90 dark:bg-[#1e2938] backdrop-blur-md',
        'border border-gray-200 dark:border-white/10',
        'shadow-sm dark:shadow-none',
        className
      )}
    >
      <motion.div
        className="absolute -top-10 -right-10 w-32 h-32 rounded-full blur-3xl opacity-20 bg-gradient-to-br from-purple-400 to-pink-500"
        animate={{
          scale: [1, 1.2, 1],
          rotate: [0, 90, 0]
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: 'easeInOut'
        }}
      />

      <div className="relative z-10">
        <motion.div 
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="flex items-center justify-between mb-4"
        >
          <div className="flex items-center gap-2">
            <motion.div 
              className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 via-violet-600 to-fuchsia-600 dark:from-purple-400 dark:via-violet-500 dark:to-fuchsia-500 flex items-center justify-center shadow-lg shadow-purple-500/30"
              whileHover={{ scale: 1.05, rotate: 5 }}
              transition={{ type: 'spring', stiffness: 400 }}
            >
              <BookOpen className="w-5 h-5 text-white" strokeWidth={2.5} />
            </motion.div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white leading-none">Subject Mastery</h3>
              <p className="text-[10px] text-gray-500 dark:text-white mt-0.5">Top {sortedSubjects.length} performing</p>
            </div>
          </div>
          
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.4, type: 'spring' }}
            className="px-4 py-2 rounded-full bg-white/80 dark:bg-white/10 backdrop-blur-sm border border-gray-200 dark:border-white/20 shadow-sm"
          >
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-gray-900 dark:text-white">{Object.keys(data.subjectMastery).length} Total</span>
            </div>
          </motion.div>
        </motion.div>

        <div className="space-y-2">
          {sortedSubjects.map((subject, index) => {
            const isTopSubject = index === 0 && subject.masteryLevel >= 80;
            const colors = getMasteryColor(subject.masteryLevel);

            return (
              <motion.div
                key={subject.classId}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ x: 4 }}
                className="group"
              >
                <div className={cn(
                  'p-2.5 rounded-xl backdrop-blur-sm border transition-all duration-300',
                  'bg-white/90 dark:bg-white/5 border-gray-200 dark:border-white/10',
                  'hover:bg-gray-50 dark:hover:bg-white/10 hover:border-gray-300 dark:hover:border-white/20',
                  'shadow-sm'
                )}>
                  <div className="flex items-center gap-2">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: index * 0.1 + 0.2 }}
                      className={cn(
                        'flex-shrink-0 w-6 h-6 rounded-lg flex items-center justify-center font-bold text-xs',
                        isTopSubject ? 'bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-lg shadow-amber-500/30' :
                        'bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-white/80'
                      )}
                    >
                      {index + 1}
                    </motion.div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="text-xs font-semibold text-gray-900 dark:text-white truncate">
                          {subject.className}
                        </span>
                        {isTopSubject && (
                          <Trophy className="w-3 h-3 text-amber-400 flex-shrink-0" fill="currentColor" />
                        )}
                        {subject.masteryLevel >= 90 && (
                          <Award className="w-3 h-3 text-amber-400 flex-shrink-0" />
                        )}
                      </div>
                      <div className="relative h-1.5 bg-gray-200 dark:bg-black/20 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${subject.masteryLevel}%` }}
                          transition={{ duration: 1, delay: index * 0.1 + 0.3, ease: 'easeOut' }}
                          className={cn('h-full rounded-full bg-gradient-to-r', colors.gradient)}
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-[10px] text-gray-500 dark:text-white/50">
                        {subject.completedAssignments}/{subject.totalAssignments}
                      </span>
                      <div className={cn('px-2 py-0.5 rounded-md', colors.bg)}>
                        <span className={cn('text-xs font-bold', colors.text)}>
                          {Math.round(subject.masteryLevel)}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {Object.keys(data.subjectMastery).length > maxItems && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="mt-3 text-center"
          >
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/90 dark:bg-white/10 backdrop-blur-sm border border-gray-200 dark:border-white/10 shadow-sm">
              <Plus className="w-3 h-3 text-gray-500 dark:text-white/60" />
              <span className="text-[10px] text-gray-600 dark:text-white/60">
                {Object.keys(data.subjectMastery).length - maxItems} more subjects
              </span>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};