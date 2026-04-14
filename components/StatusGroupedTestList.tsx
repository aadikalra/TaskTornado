'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useClassContext } from '@/context/ClassContext';
import type { Test as TestType } from '@/context/ClassContext';
import { LinkCard } from './LinkCard';


import { getClassIcon } from '@/lib/icon-map';
import { HugeIcon } from '@/lib/huge-icon-map';
import { TestDetailModal } from './TestDetailModal';

type StatusGroupedTestListProps = {
  tests: TestType[];
  onDeleteTest: (id: string) => Promise<void>;
};


// Class color palette (same order as MainApp)
const CLASS_COLORS = [
  { bg: '#F9A8A8', header: '#DC2626' },
  { bg: '#93C5FD', header: '#2563EB' },
  { bg: '#FCD39D', header: '#D97706' },
  { bg: '#86EFAC', header: '#16A34A' },
  { bg: '#C4B5FD', header: '#7C3AED' },
  { bg: '#F9A8D4', header: '#DB2777' },
  { bg: '#99F6E4', header: '#0D9488' },
  { bg: '#CBD5E1', header: '#475569' },
];

const StatusGroupedTestList = ({
  tests,
  onDeleteTest,
}: StatusGroupedTestListProps) => {
  const { classes } = useClassContext();
  const [selectedTest, setSelectedTest] = useState<TestType | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleTestClick = (test: TestType) => {
    setSelectedTest(test);
    setIsModalOpen(true);
  };

  const classesById = useMemo(() => {
    const map = new Map<string, any>();
    classes?.forEach((c) => map.set(c.id, c));
    return map;
  }, [classes]);

  const classIndexMap = useMemo(() => {
    const map = new Map<string, number>();
    classes.forEach((c, i) => map.set(c.id, i));
    return map;
  }, [classes]);

  const getColorForClass = useCallback((classId: string) => {
    const idx = classIndexMap.get(classId) ?? 0;
    return CLASS_COLORS[idx % CLASS_COLORS.length];
  }, [classIndexMap]);

  const sortedTests = useMemo(() => {
    return [...tests].sort((a, b) => new Date(a.testDate).getTime() - new Date(b.testDate).getTime());
  }, [tests]);

  const groupedTests = useMemo(() => {
    const groups: Record<'upcoming' | 'taken', TestType[]> = { upcoming: [], taken: [] };
    const now = new Date();
    // Use local midnight for comparison to match how testDate strings are usually generated
    const localToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    sortedTests.forEach(test => {
      // Parse ISO date string (YYYY-MM-DD) precisely to avoid UTC shifts
      const tDate = new Date(test.testDate + 'T00:00:00');
      
      if (tDate < localToday || test.status?.toLowerCase() === 'completed') {
        groups.taken.push(test);
      } else {
        groups.upcoming.push(test);
      }
    });

    return groups;
  }, [sortedTests]);

  const getTestTypeIcon = useCallback((testType?: string) => {
    if (!testType) return 'BookOpen';
    switch (testType.toLowerCase()) {
      case 'exam': case 'final': case 'midterm': return 'GraduationCap';
      case 'quiz': return 'FileText';
      case 'project': return 'BoardMath';
      case 'alpha': return 'Target01';
      case 'beta': return 'Zap';
      default: return 'BookOpen';
    }
  }, []);

  const getTestTypeBadgeClasses = useCallback((testType?: string) => {
    const type = testType?.toLowerCase() || '';
    switch (type) {
      case 'alpha': return 'bg-sky-100/70 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300';
      case 'beta': return 'bg-[#ebf6b5]/70 text-sky-800 dark:bg-[#ebf6b5]/15 dark:text-sky-200';
      case 'exam': case 'final': case 'midterm': return 'bg-sky-200/60 text-sky-800 dark:bg-sky-500/20 dark:text-sky-200';
      case 'quiz': return 'bg-sky-100/50 text-sky-600 dark:bg-sky-500/10 dark:text-sky-300';
      case 'project': return 'bg-[#ebf6b5]/50 text-sky-700 dark:bg-[#ebf6b5]/10 dark:text-sky-200';
      default: return 'bg-sky-50 text-sky-500 dark:bg-sky-500/5 dark:text-sky-400';
    }
  }, []);

  const formatTime = (timeString?: string | null) => {
    if (!timeString) return '';
    try {
      const [hours, minutes] = timeString.split(':');
      const date = new Date();
      date.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return timeString;
    }
  };

  const getDueDateLabel = useCallback((testDate: Date) => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const test = new Date(testDate);
    test.setHours(0, 0, 0, 0);
    const diffDays = Math.round((test.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return `${Math.abs(diffDays)}d ago`;
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays <= 7) return `${diffDays}d`;
    return test.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }, []);

  // Render a single test as a premium square card
  const renderTestCard = useCallback((test: TestType, index: number) => {
    const classInfo = classesById.get(test.classId);
    const color = getColorForClass(test.classId);
    const TypeIcon = getTestTypeIcon(test.testType);
    const dueDate = new Date(test.testDate);
    const dueDateLabel = getDueDateLabel(dueDate);
    const badgeClasses = getTestTypeBadgeClasses(test.testType);
    const isPast = new Date(test.testDate + 'T00:00:00') < new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate()) || test.status?.toLowerCase() === 'completed';

    const isToday = dueDateLabel === 'Today';
    const isTomorrow = dueDateLabel === 'Tomorrow';

    return (
      <motion.div
        key={test.id}
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.3, delay: index * 0.04, ease: [0.23, 1, 0.32, 1] }}
        onClick={() => handleTestClick(test)}
        className={`group relative flex flex-col justify-between p-4 w-[160px] h-[160px] rounded-[24px] cursor-pointer transition-all duration-300 overflow-hidden shrink-0 border ${
          isPast 
            ? 'bg-[#f8fafc]/50 dark:bg-gray-900/40 border-slate-100 dark:border-slate-800 grayscale-[0.6] opacity-60 hover:grayscale-0 hover:opacity-100 hover:bg-white dark:hover:bg-gray-900' 
            : 'bg-white dark:bg-gray-900 border-sky-100 dark:border-gray-800 hover:shadow-2xl hover:shadow-sky-500/10 hover:border-[#d4e88e]'
        }`}
      >
        {/* Background Highlight Decor */}
        <div 
          className="absolute -top-4 -right-4 w-12 h-12 rounded-full blur-2xl opacity-0 group-hover:opacity-40 transition-opacity duration-500"
          style={{ backgroundColor: color.header }}
        />

        <div className="flex items-center justify-between mb-auto">
          <div
            className="flex items-center justify-center w-10 h-10 rounded-2xl shadow-sm transition-transform group-hover:scale-110 duration-500"
            style={{ backgroundColor: `${color.bg}40` }}
          >
            <HugeIcon name={TypeIcon} size={18} className="w-4.5 h-4.5" style={{ color: color.header }} />
          </div>
          
          {test.grade ? (
            <div 
              className="flex items-center justify-center min-w-[28px] h-7 px-2 rounded-lg text-[12px] font-extrabold shadow-sm transition-all group-hover:scale-110 duration-500"
              style={{ backgroundColor: `${color.header}15`, color: color.header, border: `1px solid ${color.header}25` }}
            >
              {test.grade}
            </div>
          ) : (
            <div
              className="w-2.5 h-2.5 rounded-full shadow-[0_0_12px_rgba(0,0,0,0.1)] transition-all group-hover:scale-125 duration-500"
              style={{ backgroundColor: color.header }}
            />
          )}
        </div>

        {/* Middle Section: Title & Class */}
        <div className="mt-4 mb-3">
          <h3 className="text-[13px] font-bold text-sky-900 dark:text-sky-100 leading-tight line-clamp-2 group-hover:text-sky-700 dark:group-hover:text-white transition-colors">
            {test.title}
          </h3>
          {classInfo && (
            <p className="text-[10px] font-semibold text-sky-600/40 dark:text-sky-400/30 mt-1 truncate uppercase tracking-wider">
              {classInfo.name}
            </p>
          )}
        </div>

        {/* Bottom Section: Date & Type Badge */}
        <div className="flex items-center justify-between mt-auto pt-2 border-t border-sky-50/50 dark:border-gray-800/50">
          <span className={`text-[10px] font-bold uppercase tracking-widest ${badgeClasses.split(' ').filter(c => !c.startsWith('bg')).join(' ')}`}>
            {test.testType || 'Quiz'}
          </span>
          <div className="flex items-center gap-1.5">
            <span className={`text-[10px] font-bold tabular-nums ${
              isToday ? 'text-sky-600 dark:text-sky-400' : 'text-sky-400/50'
            }`}>
              {dueDateLabel}
            </span>
          </div>
        </div>
      </motion.div>
    );
  }, [classesById, getColorForClass, getTestTypeIcon, getTestTypeBadgeClasses, getDueDateLabel]);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-4 justify-start">
        {/* Upcoming Tests */}
        {groupedTests.upcoming.map((test, index) => renderTestCard(test, index))}

        {/* Vertical Separator if both exist */}
        {groupedTests.upcoming.length > 0 && groupedTests.taken.length > 0 && (
          <div className="w-px h-28 bg-[#d4e88e] dark:bg-[#d4e88e]/40 mx-2 self-center shrink-0" />
        )}

        {/* Taken Tests */}
        {groupedTests.taken.map((test, index) => renderTestCard(test, index + groupedTests.upcoming.length))}
      </div>

      {/* Empty State */}
      {tests.length === 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-[#f5f9fc] dark:bg-sky-500/[0.03] backdrop-blur-md rounded-[32px] border border-sky-100 dark:border-sky-500/10 p-12 sm:p-20 text-center shadow-sm relative overflow-hidden group mt-4"
        >
          <div className="absolute inset-0 bg-gradient-to-b from-sky-500/[0.02] to-transparent pointer-events-none" />
          <div className="relative z-10">
            <div className="w-16 h-16 rounded-3xl bg-white dark:bg-gray-900 flex items-center justify-center mx-auto mb-6 border border-sky-100 dark:border-sky-500/20 shadow-sm group-hover:scale-110 transition-transform duration-500">
              <HugeIcon name="Calendar02" size={32} className="h-8 w-8 text-sky-500/40 dark:text-sky-400/40" />
            </div>
            <h3 className="text-2xl font-bold text-sky-900 dark:text-white mb-2 tracking-tight">
              No tests scheduled
            </h3>
            <p className="text-sky-600/50 dark:text-sky-400/40 max-w-xs mx-auto text-sm font-medium leading-relaxed">
              Start by adding your first test to keep track of your exam schedule and academic performance.
            </p>
            <p className="mt-8 text-[11px] font-bold text-sky-500/40 uppercase tracking-widest">
              Use the Test button to get started
            </p>
          </div>
        </motion.div>
      )}

      <TestDetailModal
        test={selectedTest}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onDelete={onDeleteTest}
        classInfo={selectedTest ? classesById.get(selectedTest.classId) : undefined}
        layoutId={selectedTest ? `test-card-${selectedTest.id}` : undefined}
      />
    </div>
  );
};

export default StatusGroupedTestList;