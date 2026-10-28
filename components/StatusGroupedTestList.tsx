'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { differenceInCalendarDays, format } from 'date-fns';
import { useClassContext } from '@/context/ClassContext';
import type { Test as TestType } from '@/context/ClassContext';
import { HugeIcon } from '@/lib/huge-icon-map';
import { TestDetailModal } from './TestDetailModal';
import { parseCalendarDate } from '@/lib/dateUtils';

type StatusGroupedTestListProps = {
  tests: TestType[];
  onDeleteTest: (id: string) => Promise<void>;
  dashboardPreview?: boolean;
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
  dashboardPreview = false,
}: StatusGroupedTestListProps) => {
  const { classes } = useClassContext();
  const [selectedTest, setSelectedTest] = useState<TestType | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleTestClick = (test: TestType) => {
    setSelectedTest(test);
    setIsModalOpen(true);
  };

  const classesById = useMemo(() => {
    const map = new Map<string, (typeof classes)[number]>();
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
    return [...tests].sort((a, b) => parseCalendarDate(a.testDate).getTime() - parseCalendarDate(b.testDate).getTime());
  }, [tests]);

  const groupedTests = useMemo(() => {
    const groups: Record<'upcoming' | 'taken', TestType[]> = { upcoming: [], taken: [] };
    const now = new Date();
    // Use local midnight for comparison to match how testDate strings are usually generated
    const localToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    sortedTests.forEach(test => {
      const tDate = parseCalendarDate(test.testDate);
      
      if (tDate < localToday || ['taken', 'completed'].includes(test.status?.toLowerCase())) {
        groups.taken.push(test);
      } else {
        groups.upcoming.push(test);
      }
    });

    return groups;
  }, [sortedTests]);

  const renderTestCard = (test: TestType, index: number) => {
    const classInfo = classesById.get(test.classId);
    const color = getColorForClass(test.classId);
    const dueDate = parseCalendarDate(test.testDate);
    const daysUntil = differenceInCalendarDays(dueDate, new Date());
    const isPast = daysUntil < 0 || ['taken', 'completed'].includes(test.status?.toLowerCase());
    const isPreparing = ['preparing', 'in_progress'].includes(test.status);
    const exactDateLabel = format(dueDate, 'EEEE, MMMM d, yyyy');
    const dueLabel = daysUntil === 0 ? 'Today' : daysUntil === 1 ? 'Tomorrow' : `In ${daysUntil} days`;
    const resultLabel = test.grade || (test.score !== null && test.score !== undefined
      ? `${test.score}${test.maxScore ? `/${test.maxScore}` : ''}`
      : 'Completed');

    return (
      <motion.button
        type="button"
        key={test.id}
        layoutId={`test-card-${test.id}`}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, delay: Math.min(index, 8) * 0.025 }}
        onClick={() => handleTestClick(test)}
        aria-label={`Open ${test.title}, ${classInfo?.name || 'Unassigned'}, ${exactDateLabel}`}
        title={test.title}
        className="group flex w-full min-w-0 items-stretch gap-4 rounded-2xl border border-sky-100 bg-[#f5f9fc] p-4 text-left transition-colors hover:border-sky-300 hover:bg-sky-50 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sky-500 dark:border-sky-500/15 dark:bg-sky-500/[0.03] dark:hover:border-sky-500/35 dark:hover:bg-sky-500/[0.06]"
      >
        <time
          dateTime={format(dueDate, 'yyyy-MM-dd')}
          aria-label={exactDateLabel}
          className="flex w-12 shrink-0 flex-col items-center justify-center border-r border-sky-100 pr-4 dark:border-sky-500/15"
        >
          <span className="text-[10px] font-semibold uppercase tracking-wider text-sky-600/70 dark:text-sky-300/60">{format(dueDate, 'MMM')}</span>
          <span className="mt-0.5 text-2xl font-semibold leading-none tracking-tight text-sky-950 dark:text-sky-50">{format(dueDate, 'd')}</span>
          <span className="mt-1.5 text-[10px] text-slate-500 dark:text-slate-400">{format(dueDate, 'EEE')}</span>
        </time>

        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <div className="flex min-w-0 flex-wrap items-center justify-between gap-x-3 gap-y-1">
            <span className="flex min-w-0 items-center gap-1.5 text-[11px] font-medium text-slate-500 dark:text-slate-400">
              <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: color.header }} />
              <span className="truncate">{classInfo?.name || 'Unassigned'}</span>
            </span>
            <span className={`shrink-0 text-[10px] font-medium ${
              !isPast && daysUntil === 0
                ? 'text-rose-600 dark:text-rose-300'
                : !isPast && daysUntil === 1
                  ? 'text-amber-700 dark:text-amber-300'
                  : 'text-slate-500 dark:text-slate-400'
            }`}>
              {isPast ? resultLabel : dueLabel}
            </span>
          </div>

          <h3 className="line-clamp-2 text-[15px] font-semibold leading-snug tracking-tight text-sky-950 group-hover:text-sky-700 dark:text-sky-50 dark:group-hover:text-sky-200">
            {test.title}
          </h3>

          <div className="mt-auto flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-slate-500 dark:text-slate-400">
            <span className="capitalize">{test.testType?.toLowerCase() || 'Test'}</span>
            {isPreparing && !isPast && <>
              <span aria-hidden="true">·</span>
              <span className="text-sky-600 dark:text-sky-300">Preparing</span>
            </>}
            {test.location && <>
              <span aria-hidden="true">·</span>
              <span className="truncate">{test.location}</span>
            </>}
          </div>
        </div>
      </motion.button>
    );
  };

  const gridClassName = dashboardPreview
    ? 'grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3'
    : 'grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4';

  return (
    <div className="space-y-3">
      {groupedTests.upcoming.length > 0 && (
        <div className={gridClassName}>
          {groupedTests.upcoming.map((test, index) => renderTestCard(test, index))}
        </div>
      )}

      {groupedTests.taken.length > 0 && (
        <div className="space-y-3 pt-2">
          {groupedTests.upcoming.length > 0 && (
            <div className="flex items-center gap-3">
              <span className="text-xs font-medium text-sky-700/40 dark:text-sky-300/35">
                Completed
              </span>
              <span className="h-px flex-1 bg-sky-100 dark:bg-sky-500/10" />
            </div>
          )}
          <div className={gridClassName}>
            {groupedTests.taken.map((test, index) => renderTestCard(test, index + groupedTests.upcoming.length))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {tests.length === 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-[22px] sm:rounded-[28px] bg-[#f5f9fc] dark:bg-sky-500/[0.03] border border-sky-100 dark:border-sky-500/10 shadow-2xs hover:shadow-md hover:shadow-sky-500/[0.04] p-5 sm:p-12 text-center transition-all duration-500 relative overflow-hidden group mt-4"
        >
          <div className="relative z-10 flex flex-col items-center">
            <div className="w-12 h-12 rounded-2xl bg-sky-500/10 dark:bg-sky-400/15 flex items-center justify-center mb-3.5 border border-sky-200/50 dark:border-sky-500/20 shadow-xs group-hover:scale-110 transition-transform duration-500">
              <HugeIcon name="Quiz04" size={24} className="text-sky-600 dark:text-sky-400" />
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-sky-800 dark:text-sky-200 mb-1.5 tracking-tight">
              No tests scheduled
            </h3>
            <p className="text-xs sm:text-sm text-sky-700/60 dark:text-sky-300/50 max-w-xs mx-auto font-medium leading-relaxed">
              Start by adding your first test to keep track of your exam schedule and academic performance.
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
