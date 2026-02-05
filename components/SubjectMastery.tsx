'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { Award, BookOpen, ChevronRight, BarChart2 } from 'lucide-react';
import { useGamification } from '@/context/GamificationContext';
import { useClassContext } from '@/context/ClassContext';
import { cn } from '@/lib/utils';

export const SubjectMastery = ({ className }: { className?: string }) => {
  const { data } = useGamification();
  const { classes } = useClassContext();

  // Exact color palette from MainApp.tsx to ensure perfect matching
  const mainAppColors = [
    '#E53E3E', // red
    '#3182CE', // blue
    '#D69E2E', // yellow
    '#38A169', // green
    '#805AD5', // purple
    '#D53F8C', // pink
    '#2E7774', // teal
    '#4A5568'  // gray
  ];

  const allSubjects = React.useMemo(() => {
    return Object.values(data.subjectMastery)
      .map(subject => {
        // Find the index of this class in the global classes list
        const classIndex = classes.findIndex(c => c.id === subject.classId);

        // Use the same modulo logic as MainApp
        const color = classIndex !== -1
          ? mainAppColors[classIndex % mainAppColors.length]
          : '#4A5568'; // Default to gray if not found

        return {
          ...subject,
          color
        };
      })
      .sort((a, b) => b.masteryLevel - a.masteryLevel);
  }, [data.subjectMastery, classes]);

  const topThree = allSubjects.slice(0, 3);
  const remaining = allSubjects.slice(3);

  // Podium order: [2nd, 1st, 3rd]
  const podiumOrder = React.useMemo(() => {
    if (topThree.length === 0) return [];
    if (topThree.length === 1) return [topThree[0]];
    if (topThree.length === 2) return [topThree[1], topThree[0]];
    return [topThree[1], topThree[0], topThree[2]];
  }, [topThree]);

  if (allSubjects.length === 0) {
    return (
      <div className={cn("w-full bg-white dark:bg-gray-900 p-4 rounded-lg border border-gray-200 dark:border-gray-800", className)}>
        <h2 className="text-[10px] font-medium text-gray-400 uppercase tracking-widest mb-4">Subject Mastery</h2>
        <div className="text-center py-12 border border-dashed border-gray-100 dark:border-gray-800 rounded-lg">
          <p className="text-xs text-gray-500">No data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("w-full bg-white dark:bg-gray-900 p-4 rounded-lg border border-gray-200 dark:border-gray-800 flex flex-col justify-between", className)}>
      <div className="flex-1 flex flex-col">
        <h2 className="text-[10px] font-medium text-gray-400 uppercase tracking-widest mb-4">Subject Mastery</h2>

        {/* Podium Section */}
        <div className="flex items-end justify-center gap-6 mt-4 mb-8">
          {podiumOrder.map((subject, idx) => {
            const isFirst = (topThree.length > 1 && idx === 1) || (topThree.length === 1 && idx === 0);
            const size = isFirst ? 80 : 64;
            const radius = isFirst ? 36 : 28;
            const circumference = 2 * Math.PI * radius;
            const offset = circumference - (subject.masteryLevel / 100) * circumference;

            return (
              <motion.div
                key={subject.classId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className={cn(
                  "flex flex-col items-center group cursor-default",
                  isFirst ? "order-2 pb-6" : idx === 0 ? "order-1" : "order-3"
                )}
              >
                <div
                  className="relative flex items-center justify-center mb-2"
                  style={{ width: size, height: size }}
                >
                  <svg className="w-full h-full -rotate-90 transform">
                    <circle
                      cx={size / 2}
                      cy={size / 2}
                      r={radius}
                      stroke="currentColor"
                      strokeWidth="2.5"
                      fill="transparent"
                      className="text-gray-50 dark:text-gray-800/50"
                    />
                    <motion.circle
                      cx={size / 2}
                      cy={size / 2}
                      r={radius}
                      stroke={subject.color}
                      strokeWidth="2.5"
                      strokeDasharray={circumference}
                      initial={{ strokeDashoffset: circumference }}
                      animate={{ strokeDashoffset: offset }}
                      transition={{ duration: 1.5, delay: 0.5 + (idx * 0.1), ease: [0.16, 1, 0.3, 1] }}
                      strokeLinecap="round"
                      fill="transparent"
                    />
                  </svg>
                  <div className="absolute flex flex-col items-center">
                    <span className={cn(
                      "font-bold tabular-nums text-gray-900 dark:text-gray-100",
                      isFirst ? "text-lg" : "text-sm"
                    )}>
                      {Math.round(subject.masteryLevel)}%
                    </span>
                    {isFirst && <Award className="w-3 h-3 text-amber-400 -mt-0.5" />}
                  </div>
                </div>
                <span className="text-[10px] font-medium text-gray-500 dark:text-gray-400 text-center line-clamp-1 max-w-[80px]">
                  {subject.className}
                </span>
              </motion.div>
            );
          })}
        </div>

        {/* Scrollable Row for others */}
        {remaining.length > 0 && (
          <div className="relative mt-auto">
            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x">
              {remaining.map((subject, idx) => {
                const radius = 20;
                const circumference = 2 * Math.PI * radius;
                const offset = circumference - (subject.masteryLevel / 100) * circumference;

                return (
                  <motion.div
                    key={subject.classId}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + (idx * 0.05) }}
                    className="flex flex-col items-center shrink-0 snap-center"
                  >
                    <div className="relative w-12 h-12 flex items-center justify-center mb-1">
                      <svg className="w-full h-full -rotate-90 transform">
                        <circle
                          cx="24"
                          cy="24"
                          r={radius}
                          stroke="currentColor"
                          strokeWidth="1.5"
                          fill="transparent"
                          className="text-gray-50 dark:text-gray-800/30"
                        />
                        <motion.circle
                          cx="24"
                          cy="24"
                          r={radius}
                          stroke={subject.color}
                          strokeWidth="1.5"
                          strokeDasharray={circumference}
                          initial={{ strokeDashoffset: circumference }}
                          animate={{ strokeDashoffset: offset }}
                          transition={{ duration: 1, delay: 0.8 + (idx * 0.05), ease: "easeOut" }}
                          strokeLinecap="round"
                          fill="transparent"
                        />
                      </svg>
                      <span className="absolute text-[8px] font-medium tabular-nums text-gray-400">
                        {Math.round(subject.masteryLevel)}%
                      </span>
                    </div>
                    <span className="text-[9px] text-gray-400 truncate max-w-[50px] text-center">
                      {subject.className}
                    </span>
                  </motion.div>
                );
              })}
            </div>
            {/* Subtle fade edges for scroll */}
            <div className="absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-white dark:from-gray-900 to-transparent pointer-events-none opacity-50" />
            <div className="absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-white dark:from-gray-900 to-transparent pointer-events-none opacity-50" />
          </div>
        )}
      </div>
    </div>
  );
};