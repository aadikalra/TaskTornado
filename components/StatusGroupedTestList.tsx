'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useClassContext } from '@/context/ClassContext';
import type { Test as TestType } from '@/context/ClassContext';
import { HugeIcon } from '@/lib/huge-icon-map';
import { TestDetailModal } from './TestDetailModal';

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

  // A compact horizontal card keeps the important information scannable without
  // turning the dashboard into a wall of equally weighted square tiles.
  const renderTestCard = useCallback((test: TestType, index: number) => {
    const classInfo = classesById.get(test.classId);
    const color = getColorForClass(test.classId);
    const TypeIcon = getTestTypeIcon(test.testType);
    const dueDate = new Date(`${test.testDate}T00:00:00`);
    const dueDateLabel = getDueDateLabel(dueDate);
    const badgeClasses = getTestTypeBadgeClasses(test.testType);
    const isPast = new Date(test.testDate + 'T00:00:00') < new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate()) || test.status?.toLowerCase() === 'completed';
    const isToday = dueDateLabel === 'Today';
    const isTomorrow = dueDateLabel === 'Tomorrow';
    const exactDateLabel = dueDate.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
    const hasScore = Boolean(test.grade) || (test.score !== null && test.score !== undefined);
    const resultLabel = test.grade || (test.score !== null && test.score !== undefined
      ? `${test.score}${test.maxScore ? `/${test.maxScore}` : ''}`
      : 'Completed');

    return (
      <motion.button
        type="button"
        key={test.id}
        layoutId={`test-card-${test.id}`}
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        whileHover={{ y: -3 }}
        transition={{ duration: 0.3, delay: index * 0.04, ease: [0.23, 1, 0.32, 1] }}
        onClick={() => handleTestClick(test)}
        aria-label={`Open ${test.title}, ${exactDateLabel}`}
        className={`group relative h-[154px] min-w-[272px] lg:min-w-0 lg:w-full overflow-hidden rounded-[22px] text-left snap-start transition-[box-shadow,background-color,opacity] duration-300 ${
          isPast
            ? 'bg-slate-100/55 dark:bg-white/[0.035] opacity-60 hover:bg-slate-100/80 dark:hover:bg-white/[0.055] hover:opacity-100'
            : 'bg-sky-50/70 dark:bg-white/[0.05] shadow-[0_8px_28px_rgba(3,105,161,0.04)] hover:bg-white dark:hover:bg-white/[0.075] hover:shadow-[0_16px_38px_rgba(3,105,161,0.09)]'
        }`}
      >
        <div
          className="pointer-events-none absolute -left-10 -top-12 h-32 w-32 rounded-full blur-3xl opacity-[0.12] transition-all duration-500 group-hover:scale-125 group-hover:opacity-20"
          style={{ backgroundColor: color.header }}
        />

        <div className="relative z-10 flex h-full flex-col p-4">
          <div className="flex min-w-0 items-center justify-between gap-2">
            <div className="flex min-w-0 items-center gap-2">
              <span
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl"
                style={{ backgroundColor: `${color.bg}28`, color: color.header }}
              >
                <HugeIcon name={TypeIcon} size={15} />
              </span>
              <span className="truncate text-[11px] font-medium text-sky-700/50 dark:text-sky-300/45">
                {classInfo?.name || 'Unassigned'}
              </span>
            </div>
            <span className={`shrink-0 rounded-full px-2 py-1 text-[10px] font-semibold capitalize ${badgeClasses}`}>
              {test.testType || 'Test'}
            </span>
          </div>

          <h3 className="mt-3 line-clamp-2 text-[14px] font-bold leading-[1.25] text-sky-950 transition-colors group-hover:text-sky-700 dark:text-sky-50 dark:group-hover:text-sky-200">
            {test.title}
          </h3>

          <div className="mt-auto flex items-center justify-between gap-2 pt-2.5">
            <span className="flex min-w-0 items-center gap-1.5 truncate text-[10px] font-semibold text-sky-700/45 dark:text-sky-300/40">
              <HugeIcon name="Calendar03" size={12} className="shrink-0" />
              <span className="truncate">{exactDateLabel}</span>
            </span>
            <span className={`shrink-0 rounded-full px-2 py-1 text-[10px] font-extrabold tabular-nums ${
              isPast
                ? 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-300'
                : isToday
                  ? 'bg-rose-500/10 text-rose-500'
                  : isTomorrow
                    ? 'bg-amber-500/10 text-amber-500'
                    : 'bg-sky-500/10 text-sky-600 dark:text-sky-300'
            }`}>
              {isPast ? (hasScore ? resultLabel : 'Completed') : dueDateLabel}
            </span>
          </div>
        </div>
      </motion.button>
    );
  }, [classesById, getColorForClass, getTestTypeIcon, getTestTypeBadgeClasses, getDueDateLabel]);

  return (
    <div className="space-y-3">
      {groupedTests.upcoming.length > 0 && (
        <div className={`flex snap-x snap-mandatory gap-3 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden lg:grid lg:grid-cols-3 lg:overflow-visible lg:pb-0 ${dashboardPreview ? 'xl:grid-cols-4' : 'xl:grid-cols-6'}`}>
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
          <div className={`flex snap-x snap-mandatory gap-3 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden lg:grid lg:grid-cols-3 lg:overflow-visible lg:pb-0 ${dashboardPreview ? 'xl:grid-cols-4' : 'xl:grid-cols-6'}`}>
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
