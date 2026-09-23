'use client';

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  differenceInCalendarDays,
  format,
  startOfDay,
} from 'date-fns';
import { ChevronDown, ChevronUp } from 'lucide-react';

import { HugeIcon } from '@/lib/huge-icon-map';
import { parseCalendarDate } from '@/lib/dateUtils';
import { useClassContext } from '@/context/ClassContext';
import { useHomeworkContext, type Homework } from '@/context/HomeworkContext';
import { useTestContext, type Test } from '@/context/TestContext';
import { useMainApp } from '@/context/MainAppContext';
import { triggerCompletionConfetti } from '@/lib/confetti';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const CLASS_PALETTE = [
  { background: '#e0f2fe', accent: '#0284c7' }, // Sky
  { background: '#ede9fe', accent: '#7c3aed' }, // Purple
  { background: '#fef3c7', accent: '#d97706' }, // Amber
  { background: '#dcfce7', accent: '#16a34a' }, // Emerald
  { background: '#fce7f3', accent: '#db2777' }, // Pink
  { background: '#ffedd5', accent: '#ea580c' }, // Orange
  { background: '#e0e7ff', accent: '#4f46e5' }, // Indigo
  { background: '#ccfbf1', accent: '#0d9488' }, // Teal
];

const hexToRgba = (hex: string, alpha: number) => {
  const clean = hex.replace('#', '').trim();
  if (clean.length !== 6) return hex;
  const red = parseInt(clean.slice(0, 2), 16);
  const green = parseInt(clean.slice(2, 4), 16);
  const blue = parseInt(clean.slice(4, 6), 16);
  return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
};

const parseHomeworkDate = (value: string) => {
  if (value.length <= 10) return parseCalendarDate(value);
  return new Date(value);
};

const formatHomeworkDueLabel = (dueDate: Date, today: Date) => {
  const diff = differenceInCalendarDays(dueDate, today);
  if (diff < 0) return 'Overdue';
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Tomorrow';
  if (diff < 7) return `In ${diff} days`;
  return format(dueDate, 'MMM d');
};

export interface NewHomeClassesSectionProps {
  isExpandedView: boolean;
  onToggleExpandView: () => void;
  loading: boolean;
  user: boolean;
  onAddHomework: (classId?: string) => void;
  onAddClass: () => void;
}

export default function NewHomeClassesSection({
  isExpandedView,
  onToggleExpandView,
  loading,
  user,
  onAddHomework,
  onAddClass,
}: NewHomeClassesSectionProps) {
  const { classes } = useClassContext();
  const {
    homeworks,
    toggleHomework,
    deleteHomework,
    togglePinHomework,
  } = useHomeworkContext();
  const { tests } = useTestContext();
  const {
    setClassToDelete,
    expandedClasses,
    toggleExpandedClass,
    showArchivedForClass,
    toggleShowArchivedForClass,
    setSelectedTest,
    setIsTestDetailModalOpen,
  } = useMainApp();

  const [filter, setFilter] = useState<'all' | 'with-homework' | 'with-tests' | 'archived'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [classGradeGoals, setClassGradeGoals] = useState<Record<string, string>>({});
  const [savedClassGrades, setSavedClassGrades] = useState<Record<string, { finalGrade?: number }>>({});
  const [deleteArchivedClassId, setDeleteArchivedClassId] = useState<string | null>(null);

  const today = useMemo(() => startOfDay(new Date()), []);

  // Helper function to check if homework is archived (completed and due date was > 7 days ago)
  const isHomeworkArchived = useCallback((hw: Homework): boolean => {
    if (!hw.completed) return false;
    if (!hw.dueDate) return true;
    const dueDate = parseHomeworkDate(hw.dueDate);
    const daysSinceDue = Math.floor((new Date().getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
    return daysSinceDue >= 7;
  }, []);

  // Load saved grades and goals
  useEffect(() => {
    const loadGrades = () => {
      try {
        const saved = localStorage.getItem('classGrades');
        setSavedClassGrades(saved ? JSON.parse(saved) : {});
      } catch {
        setSavedClassGrades({});
      }
      try {
        const savedGoals = localStorage.getItem('class_grade_goals');
        if (savedGoals) setClassGradeGoals(JSON.parse(savedGoals));
      } catch {
        // ignore
      }
    };

    loadGrades();
    window.addEventListener('storage', loadGrades);
    window.addEventListener('focus', loadGrades);
    return () => {
      window.removeEventListener('storage', loadGrades);
      window.removeEventListener('focus', loadGrades);
    };
  }, []);

  // Cycle target grade goal
  const handleCycleGradeGoal = (classId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const gradeOptions = ['A+', 'A', 'A-', 'B+', 'B', 'Pass'];
    const current = classGradeGoals[classId] || 'A';
    const nextIndex = (gradeOptions.indexOf(current) + 1) % gradeOptions.length;
    const nextGoal = gradeOptions[nextIndex];

    const updated = { ...classGradeGoals, [classId]: nextGoal };
    setClassGradeGoals(updated);
    try {
      localStorage.setItem('class_grade_goals', JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  // Handle homework toggle with confetti
  const handleToggleHomework = async (hw: Homework, classColor: string, e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    if (!hw.completed) {
      triggerCompletionConfetti(classColor);
    }
    await toggleHomework(hw.id);
  };

  // Process and filter classes
  const processedClasses = useMemo(() => {
    return classes.map((cls, index) => {
      const palette = CLASS_PALETTE[index % CLASS_PALETTE.length];
      const classColor = cls.color || palette.accent;

      // Filter homeworks for this class
      const classAllHw = homeworks.filter(
        (hw) => hw.classId === cls.id && (hw.is_recurring_instance === true || hw.recurring_id == null),
      );

      const activeHomeworks = classAllHw
        .filter((hw) => !isHomeworkArchived(hw))
        .sort((a, b) => {
          if (a.completed !== b.completed) return a.completed ? 1 : -1;
          const aDate = parseHomeworkDate(a.dueDate).getTime();
          const bDate = parseHomeworkDate(b.dueDate).getTime();
          return aDate - bDate;
        });

      const archivedHomeworks = classAllHw
        .filter((hw) => isHomeworkArchived(hw))
        .sort((a, b) => {
          const aDate = parseHomeworkDate(a.dueDate).getTime();
          const bDate = parseHomeworkDate(b.dueDate).getTime();
          return bDate - aDate;
        });

      // Filter upcoming tests for this class
      const upcomingTests = tests.filter((t) => {
        if (t.classId !== cls.id) return false;
        if (t.status === 'taken' || t.status === 'completed' || t.status === 'cancelled') return false;
        const testDate = parseCalendarDate(t.testDate);
        return testDate >= today;
      }).sort((a, b) => {
        return parseCalendarDate(a.testDate).getTime() - parseCalendarDate(b.testDate).getTime();
      });

      // Grade calculation
      const gradeData = cls.grade_data as { finalGrade?: number } | null | undefined;
      const gradeFromClassData = typeof gradeData?.finalGrade === 'number'
        ? gradeData.finalGrade
        : null;
      const gradeFromStorage = typeof savedClassGrades[cls.id]?.finalGrade === 'number'
        ? savedClassGrades[cls.id].finalGrade
        : null;
      const savedGrade = typeof cls.grade === 'number' ? cls.grade : (gradeFromClassData ?? gradeFromStorage);

      let savedGradeLetter = null;
      let savedGradeColor = '';
      if (typeof savedGrade === 'number') {
        if (savedGrade >= 90) {
          savedGradeLetter = 'A';
          savedGradeColor = 'border-emerald-400/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300';
        } else if (savedGrade >= 80) {
          savedGradeLetter = 'B';
          savedGradeColor = 'border-blue-400/40 bg-blue-500/10 text-blue-700 dark:text-blue-300';
        } else if (savedGrade >= 70) {
          savedGradeLetter = 'C';
          savedGradeColor = 'border-amber-400/40 bg-amber-500/10 text-amber-700 dark:text-amber-300';
        } else {
          savedGradeLetter = 'I';
          savedGradeColor = 'border-red-400/40 bg-red-500/10 text-red-700 dark:text-red-300';
        }
      }

      const gradeGoal = cls.target_grade || classGradeGoals[cls.id] || null;

      return {
        cls,
        index,
        classColor,
        activeHomeworks,
        archivedHomeworks,
        nextTest: upcomingTests[0] || null,
        totalHomeworkCount: classAllHw.length,
        savedGrade,
        savedGradeLetter,
        savedGradeColor,
        gradeGoal,
      };
    });
  }, [classes, homeworks, tests, savedClassGrades, classGradeGoals, isHomeworkArchived, today]);

  // Apply tab filter & search query
  const filteredClasses = useMemo(() => {
    return processedClasses.filter((item) => {
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchName = item.cls.name.toLowerCase().includes(query);
        const matchHw = item.activeHomeworks.some((hw) => hw.title.toLowerCase().includes(query));
        if (!matchName && !matchHw) return false;
      }

      if (filter === 'with-homework') {
        return item.activeHomeworks.length > 0;
      }
      if (filter === 'with-tests') {
        return Boolean(item.nextTest);
      }
      if (filter === 'archived') {
        return item.archivedHomeworks.length > 0;
      }
      return true;
    });
  }, [processedClasses, filter, searchQuery]);

  // Counts for filter pills
  const counts = useMemo(() => {
    return {
      all: processedClasses.length,
      withHomework: processedClasses.filter((i) => i.activeHomeworks.length > 0).length,
      withTests: processedClasses.filter((i) => Boolean(i.nextTest)).length,
      archived: processedClasses.filter((i) => i.archivedHomeworks.length > 0).length,
    };
  }, [processedClasses]);

  // Handle deleting all archived homework for a class
  const handleDeleteAllArchived = async () => {
    if (!deleteArchivedClassId) return;
    const target = processedClasses.find((c) => c.cls.id === deleteArchivedClassId);
    if (!target) return;

    for (const hw of target.archivedHomeworks) {
      await deleteHomework(hw.id);
    }
    setDeleteArchivedClassId(null);
  };

  const handleOpenTestModal = (test: Test, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedTest(test);
    setIsTestDetailModalOpen(true);
  };

  return (
    <section
      className="min-w-0 rounded-[1.85rem] border border-[#e8eff5] dark:border-gray-800 bg-white dark:bg-gray-900 p-5 sm:p-6 shadow-[0_12px_34px_rgba(84,78,123,0.05)] dark:shadow-[0_12px_34px_rgba(0,0,0,0.3)] transition-all"
      aria-labelledby="my-classes-title"
    >
      {/* ─────────────────────────────────────────────────────────────
          SECTION HEADER
          ───────────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <h2 id="my-classes-title" className="text-[1.4rem] font-medium tracking-[-0.04em] text-[#292a33] dark:text-gray-100">
            My Classes
          </h2>
          <span className="rounded-full bg-[#eaf2fb] dark:bg-sky-500/20 px-2.5 py-0.5 text-xs font-semibold text-[#275085] dark:text-sky-300">
            {classes.length}
          </span>
        </div>

        {/* Actions: Full Overview toggle + Add class */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onToggleExpandView}
            title={isExpandedView ? 'Switch to side-by-side view' : 'Expand classes to full width'}
            className="inline-flex items-center gap-1.5 rounded-full border border-[#dce8f2] dark:border-gray-700 bg-white/90 dark:bg-gray-800 px-3 py-1.5 text-xs font-semibold text-[#275085] dark:text-sky-300 shadow-xs hover:bg-[#f0f6fc] dark:hover:bg-gray-700 transition-all cursor-pointer"
          >
            <HugeIcon name={isExpandedView ? 'Minimize02' : 'Maximize02'} size={14} className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{isExpandedView ? 'Side-by-side' : 'Full overview'}</span>
          </button>

          <button
            type="button"
            onClick={onAddClass}
            className="inline-flex items-center gap-1.5 rounded-full bg-[#275085] dark:bg-sky-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-[#1f3f6b] dark:hover:bg-sky-500 transition-all cursor-pointer"
          >
            <HugeIcon name="PlusSign" size={13} className="h-3.5 w-3.5" />
            <span>Add class</span>
          </button>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          FILTER TABS & SEARCH (When classes exist)
          ───────────────────────────────────────────────────────────── */}
      {classes.length > 0 && (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-2.5 border-b border-[#edf1f4] dark:border-gray-800 pb-3">
          {/* Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            <button
              type="button"
              onClick={() => setFilter('all')}
              className={`rounded-full px-2.5 py-1 font-medium transition-all ${
                filter === 'all'
                  ? 'bg-[#275085] dark:bg-sky-600 text-white shadow-xs'
                  : 'text-[#6f7480] dark:text-gray-400 hover:bg-black/5 dark:hover:bg-white/5'
              }`}
            >
              All ({counts.all})
            </button>
            <button
              type="button"
              onClick={() => setFilter('with-homework')}
              className={`rounded-full px-2.5 py-1 font-medium transition-all ${
                filter === 'with-homework'
                  ? 'bg-[#275085] dark:bg-sky-600 text-white shadow-xs'
                  : 'text-[#6f7480] dark:text-gray-400 hover:bg-black/5 dark:hover:bg-white/5'
              }`}
            >
              With Homework ({counts.withHomework})
            </button>
            <button
              type="button"
              onClick={() => setFilter('with-tests')}
              className={`rounded-full px-2.5 py-1 font-medium transition-all ${
                filter === 'with-tests'
                  ? 'bg-[#275085] dark:bg-sky-600 text-white shadow-xs'
                  : 'text-[#6f7480] dark:text-gray-400 hover:bg-black/5 dark:hover:bg-white/5'
              }`}
            >
              Tests Ahead ({counts.withTests})
            </button>
            {counts.archived > 0 && (
              <button
                type="button"
                onClick={() => setFilter('archived')}
                className={`rounded-full px-2.5 py-1 font-medium transition-all ${
                  filter === 'archived'
                    ? 'bg-[#275085] dark:bg-sky-600 text-white shadow-xs'
                    : 'text-[#6f7480] dark:text-gray-400 hover:bg-black/5 dark:hover:bg-white/5'
                }`}
              >
                Archived ({counts.archived})
              </button>
            )}
          </div>

          {/* Quick search input if >= 3 classes */}
          {classes.length >= 3 && (
            <div className="relative flex items-center min-w-[160px] sm:min-w-[200px]">
              <span className="pointer-events-none absolute left-2.5 text-gray-400">
                <HugeIcon name="Search01" size={13} className="h-3.5 w-3.5" />
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter classes..."
                className="w-full rounded-xl border border-[#e2eaf0] dark:border-gray-700 bg-[#f9fbfd] dark:bg-gray-800/80 pl-8 pr-3 py-1 text-xs text-[#292a33] dark:text-gray-100 placeholder-gray-400 focus:border-[#275085] focus:outline-none transition-colors"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-xs"
                >
                  ✕
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          CLASS CARDS GRID
          ───────────────────────────────────────────────────────────── */}
      <div className="mt-5">
        {user && loading ? (
          <div className="flex min-h-[190px] items-center justify-center text-[13px] text-[#8a929e] dark:text-gray-400">
            <HugeIcon name="LoaderPinwheel" size={20} className="mr-2 h-5 w-5 animate-spin text-[#275085] dark:text-sky-400" />
            Loading classes & homework…
          </div>
        ) : filteredClasses.length > 0 ? (
          <div
            className={`grid gap-4 ${
              isExpandedView
                ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
                : 'grid-cols-1 sm:grid-cols-2'
            }`}
          >
            {filteredClasses.map((item) => {
              const {
                cls,
                classColor,
                activeHomeworks,
                archivedHomeworks,
                nextTest,
                savedGrade,
                savedGradeLetter,
                savedGradeColor,
                gradeGoal,
              } = item;

              const isExpanded = expandedClasses[cls.id] || false;
              const isShowingArchived = showArchivedForClass[cls.id] || false;
              const isEmptyClass = activeHomeworks.length === 0
                && !nextTest
                && (!archivedHomeworks.length || !isShowingArchived);
              const visibleHomeworks = isExpanded ? activeHomeworks : activeHomeworks.slice(0, 2);

              return (
                <div
                  key={cls.id}
                  className={`group/card flex flex-col justify-between rounded-[22px] sm:rounded-[28px] border border-sky-100 bg-[#f5f9fc] dark:border-sky-500/10 dark:bg-sky-500/[0.03] ${isEmptyClass ? 'p-3 sm:p-4' : 'p-3 sm:p-5'} shadow-2xs transition-all duration-500 hover:border-[#cbdceb] dark:hover:border-sky-500/20 hover:shadow-md hover:shadow-sky-500/[0.04]`}
                >
                  {/* CARD TOP CONTENT */}
                  <div>
                    {/* Class Header Banner */}
                    <div
                      className={`group/header rounded-[18px] sm:rounded-[20px] border p-3 sm:p-3.5 transition-colors duration-500 ${isEmptyClass ? 'mb-0' : 'mb-2.5 sm:mb-3'}`}
                      style={{
                        backgroundColor: hexToRgba(classColor, 0.16),
                        borderColor: 'transparent',
                      }}
                    >
                      <div className="flex items-start justify-between gap-2">
                        {/* Class Icon & Name */}
                        <div className="flex w-full min-w-0 items-center gap-3">
                          <span
                            className="shrink-0 transition-transform duration-500 group-hover/header:scale-110"
                            style={{ color: classColor }}
                          >
                            <HugeIcon name={cls.icon || 'School'} size={24} className="h-6 w-6" />
                          </span>
                          <div className="flex min-w-0 flex-1 items-center gap-2">
                            <h3
                              className="truncate text-sm font-bold uppercase tracking-tight sm:text-base"
                              style={{ color: classColor }}
                              title={cls.name}
                            >
                              {cls.name}
                            </h3>
                          </div>
                        </div>

                        {/* Right header actions: Grade badge + Quick add + Edit + Delete */}
                        <div className="flex shrink-0 items-center gap-1">
                          {typeof savedGrade === 'number' ? (
                            <span
                              className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-extrabold border tabular-nums ${savedGradeColor}`}
                              title={`Saved grade: ${savedGrade.toFixed(1)}% (${savedGradeLetter})`}
                            >
                              {savedGrade.toFixed(1)}%
                              <span className="hidden xl:inline"> · {savedGradeLetter}</span>
                            </span>
                          ) : gradeGoal ? (
                            <button
                              type="button"
                              onClick={(e) => handleCycleGradeGoal(cls.id, e)}
                              className="shrink-0 rounded-full border border-sky-300/50 dark:border-sky-500/30 bg-white/60 dark:bg-black/20 px-2 py-0.5 text-[10px] font-bold text-sky-800 dark:text-sky-200 hover:bg-white dark:hover:bg-black/40 transition-colors cursor-pointer"
                              title="Click to cycle target grade goal"
                            >
                              Goal: {gradeGoal}
                            </button>
                          ) : null}

                          {/* Quick Add Homework for this class */}
                          <button
                            type="button"
                            onClick={() => onAddHomework(cls.id)}
                            title={`Add homework to ${cls.name}`}
                            aria-label={`Add homework to ${cls.name}`}
                            className="grid h-7 w-7 place-items-center rounded-lg text-gray-500 hover:text-[#275085] dark:text-gray-400 dark:hover:text-sky-300 hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer"
                          >
                            <HugeIcon name="PlusSign" size={14} className="h-3.5 w-3.5" />
                          </button>

                          {/* Edit class link */}
                          <Link
                            href={`/classes/edit/${cls.id}`}
                            title="Edit class"
                            aria-label="Edit class"
                            className="hidden sm:grid h-7 w-7 place-items-center rounded-lg text-gray-400 hover:text-sky-600 dark:hover:text-sky-300 hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                          >
                            <HugeIcon name="Pen02" size={13} className="h-3.5 w-3.5" />
                          </Link>

                          {/* Delete class button */}
                          <button
                            type="button"
                            onClick={() => setClassToDelete({ id: cls.id, name: cls.name })}
                            title="Delete class"
                            aria-label="Delete class"
                            className="hidden sm:grid h-7 w-7 place-items-center rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer"
                          >
                            <HugeIcon name="Delete02" size={13} className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Active Homework Items List */}
                    <div className="space-y-1">
                      {visibleHomeworks.length > 0 ? (
                        visibleHomeworks.map((hw) => {
                          const dueDate = parseHomeworkDate(hw.dueDate);
                          const isOverdue = !hw.completed && dueDate < today;
                          const isToday = !hw.completed && differenceInCalendarDays(dueDate, today) === 0;
                          const dueLabel = formatHomeworkDueLabel(dueDate, today);

                          const dateStyle = isOverdue
                            ? 'text-red-500 font-bold dark:text-red-400'
                            : isToday
                              ? 'text-emerald-600 font-bold dark:text-emerald-400'
                              : 'text-gray-400 dark:text-gray-500';

                          return (
                            <div
                              key={hw.id}
                              className={`group/item flex items-center gap-2 rounded-xl px-2 py-1.5 transition-colors hover:bg-white dark:hover:bg-gray-700/50 ${
                                hw.completed ? 'opacity-55' : ''
                              }`}
                            >
                              {/* Interactive Checkbox */}
                              <button
                                type="button"
                                onClick={(e) => handleToggleHomework(hw, classColor, e)}
                                title={hw.completed ? 'Mark uncompleted' : 'Mark completed'}
                                aria-label={hw.completed ? 'Mark uncompleted' : 'Mark completed'}
                                className={`grid h-5 w-5 shrink-0 place-items-center rounded-md border transition-all cursor-pointer ${
                                  hw.completed
                                    ? 'border-transparent text-white'
                                    : 'border-[#cbdceb] dark:border-gray-600 bg-white dark:bg-gray-800 hover:border-emerald-500'
                                }`}
                                style={hw.completed ? { backgroundColor: classColor } : undefined}
                              >
                                {hw.completed && (
                                  <HugeIcon name="CheckmarkCircle01" size={13} className="h-3.5 w-3.5 text-white" />
                                )}
                              </button>

                              {/* Priority dot indicator if high */}
                              {hw.priority === 'high' && !hw.completed && (
                                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-red-500" title="High priority" />
                              )}

                              {/* Homework Title (links to detail) */}
                              <Link
                                href={`/homework/${hw.id}`}
                                title={hw.title}
                                className="min-w-0 flex-1 block"
                              >
                                <span
                                  className={`block truncate text-xs font-medium ${
                                    hw.completed
                                      ? 'line-through text-gray-400 dark:text-gray-500'
                                      : 'text-[#2a2d37] dark:text-gray-100 group-hover/item:text-[#275085] dark:group-hover/item:text-sky-300'
                                  }`}
                                >
                                  {hw.title}
                                </span>
                              </Link>

                              {/* Due Date Label */}
                              <span className={`shrink-0 text-[10px] tabular-nums ${dateStyle}`}>
                                {dueLabel}
                              </span>

                              {/* Pin Toggle Button */}
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  togglePinHomework(hw.id, !hw.pinned);
                                }}
                                title={hw.pinned ? 'Unpin assignment' : 'Pin assignment'}
                                aria-label={hw.pinned ? 'Unpin assignment' : 'Pin assignment'}
                                className={`grid h-5 w-5 shrink-0 place-items-center rounded transition-opacity cursor-pointer ${
                                  hw.pinned
                                    ? 'opacity-100 text-amber-500'
                                    : 'opacity-0 group-hover/item:opacity-100 text-gray-300 hover:text-amber-500'
                                }`}
                              >
                                <HugeIcon name="Star" size={13} className={hw.pinned ? 'fill-amber-400 text-amber-500' : ''} />
                              </button>

                              {/* Delete button on hover */}
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  deleteHomework(hw.id);
                                }}
                                title="Delete assignment"
                                aria-label="Delete assignment"
                                className="grid h-5 w-5 shrink-0 place-items-center rounded text-gray-300 hover:text-red-500 opacity-0 group-hover/item:opacity-100 transition-opacity cursor-pointer"
                              >
                                <HugeIcon name="Delete02" size={13} />
                              </button>
                            </div>
                          );
                        })
                      ) : (
                        <div className="py-2.5 text-center text-xs text-gray-400 dark:text-gray-500 flex flex-col items-center justify-center gap-1">
                          <span>No active homework 🎉</span>
                          <button
                            type="button"
                            onClick={() => onAddHomework(cls.id)}
                            className="text-[11px] font-semibold text-[#275085] dark:text-sky-300 hover:underline cursor-pointer"
                          >
                            + Add homework
                          </button>
                        </div>
                      )}

                      {/* Expand / Collapse for >2 assignments */}
                      {activeHomeworks.length > 2 && (
                        <button
                          type="button"
                          onClick={() => toggleExpandedClass(cls.id)}
                          className="mt-1 flex w-full items-center justify-center gap-1 py-1 text-center text-xs font-semibold text-[#275085] dark:text-sky-300 hover:text-[#1c3a60] dark:hover:text-sky-200 transition-colors cursor-pointer"
                        >
                          <span>{isExpanded ? 'Hide' : `+${activeHomeworks.length - 2} more assignments`}</span>
                          {isExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                        </button>
                      )}

                      {/* Archived Homework Toggle & Section */}
                      {archivedHomeworks.length > 0 && (
                        <div className="pt-1.5">
                          {!isShowingArchived ? (
                            <button
                              type="button"
                              onClick={() => toggleShowArchivedForClass(cls.id)}
                              className="flex w-full items-center justify-center gap-1.5 py-1 text-xs font-medium text-gray-400 dark:text-gray-500 hover:text-[#275085] dark:hover:text-sky-300 transition-colors cursor-pointer"
                            >
                              <HugeIcon name="Archive" size={13} />
                              <span>View {archivedHomeworks.length} archived assignment{archivedHomeworks.length > 1 ? 's' : ''}</span>
                            </button>
                          ) : (
                            <div className="mt-2 rounded-xl border border-dashed border-[#dce8f2] dark:border-gray-800 bg-[#f8fafc]/50 dark:bg-gray-900/40 p-2.5">
                              <div className="flex items-center justify-between border-b border-[#edf1f4] dark:border-gray-800 pb-1.5 mb-1.5 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                                <span className="flex items-center gap-1 text-[#275085] dark:text-sky-300">
                                  <HugeIcon name="Archive" size={12} /> Archived ({archivedHomeworks.length})
                                </span>
                                <div className="flex items-center gap-2">
                                  <button
                                    type="button"
                                    onClick={() => toggleShowArchivedForClass(cls.id)}
                                    className="hover:text-gray-600 dark:hover:text-gray-200 cursor-pointer"
                                  >
                                    Hide
                                  </button>
                                  <span>·</span>
                                  <button
                                    type="button"
                                    onClick={() => setDeleteArchivedClassId(cls.id)}
                                    className="text-red-400 hover:text-red-600 cursor-pointer"
                                  >
                                    Delete all
                                  </button>
                                </div>
                              </div>

                              <div className="space-y-1">
                                {archivedHomeworks.map((hw) => (
                                  <div
                                    key={hw.id}
                                    className="group/archived flex items-center gap-2 rounded-lg px-1.5 py-1 text-xs opacity-60 hover:opacity-100 transition-opacity"
                                  >
                                    <button
                                      type="button"
                                      onClick={(e) => handleToggleHomework(hw, classColor, e)}
                                      title="Uncomplete and restore to active"
                                      aria-label="Restore assignment"
                                      className="grid h-4 w-4 shrink-0 place-items-center rounded bg-gray-400 dark:bg-gray-600 text-white cursor-pointer"
                                    >
                                      <HugeIcon name="CheckmarkCircle01" size={11} className="h-3 w-3" />
                                    </button>
                                    <Link
                                      href={`/homework/${hw.id}`}
                                      className="min-w-0 flex-1 truncate line-through text-gray-500 dark:text-gray-400 hover:text-[#275085]"
                                    >
                                      {hw.title}
                                    </Link>
                                    <button
                                      type="button"
                                      onClick={() => deleteHomework(hw.id)}
                                      className="grid h-4 w-4 shrink-0 place-items-center text-gray-300 hover:text-red-500 opacity-0 group-hover/archived:opacity-100 transition-opacity cursor-pointer"
                                      title="Delete permanently"
                                    >
                                      <HugeIcon name="Delete02" size={11} />
                                    </button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* CARD BOTTOM: Next Test row if available */}
                  {nextTest && (
                    <button
                      type="button"
                      onClick={(e) => handleOpenTestModal(nextTest, e)}
                      className="mt-3 flex w-full items-center gap-2 rounded-xl bg-emerald-500/[0.06] dark:bg-emerald-500/10 px-2.5 py-1.5 text-left transition-colors hover:bg-emerald-500/[0.12] cursor-pointer"
                    >
                      <span className="grid h-6 w-6 shrink-0 place-items-center rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                        <HugeIcon name="TestTube" size={13} />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-[9px] uppercase font-bold text-emerald-700 dark:text-emerald-300">
                          Next Test
                        </span>
                        <span className="block truncate text-xs font-semibold text-[#1e2027] dark:text-emerald-100">
                          {nextTest.title}
                        </span>
                      </span>
                      <span className="shrink-0 text-[10px] font-semibold text-emerald-700 dark:text-emerald-400 tabular-nums">
                        {format(parseCalendarDate(nextTest.testDate), 'MMM d')}
                      </span>
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        ) : classes.length > 0 ? (
          <div className="flex min-h-[170px] flex-col items-center justify-center rounded-[1.35rem] border border-dashed border-[#dce8f2] dark:border-gray-800 bg-[#f8fbfd] dark:bg-gray-800/30 px-5 text-center">
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-[#eaf2fb] dark:bg-sky-500/20 text-[#275085] dark:text-sky-300">
              <HugeIcon name="Filter" size={20} className="h-5 w-5" />
            </span>
            <p className="mt-2 text-[14px] font-medium text-[#303542] dark:text-gray-200">No classes match this filter</p>
            <button
              type="button"
              onClick={() => {
                setFilter('all');
                setSearchQuery('');
              }}
              className="mt-3 rounded-full bg-[#275085] dark:bg-sky-600 px-3.5 py-1 text-xs font-semibold text-white"
            >
              Reset filters
            </button>
          </div>
        ) : (
          <div className="flex min-h-[190px] flex-col items-center justify-center rounded-[1.35rem] border border-dashed border-[#dce8f2] dark:border-gray-800 bg-[#f8fbfd] dark:bg-gray-800/30 px-5 text-center">
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-[#eaf2fb] dark:bg-sky-500/20 text-[#275085] dark:text-sky-300">
              <HugeIcon name="School" size={22} className="h-[22px] w-[22px]" />
            </span>
            <p className="mt-3 text-[15px] font-medium text-[#303542] dark:text-gray-200">No classes yet</p>
            <p className="mt-1 max-w-[320px] text-[13px] leading-5 text-[#7b808c] dark:text-gray-400">
              Add your classes to track homework assignments, upcoming tests, and grades.
            </p>
            <button
              type="button"
              onClick={onAddClass}
              className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-[#275085] dark:bg-sky-600 px-4 py-2 text-[12px] font-medium text-white transition-all hover:bg-[#1d3d66] dark:hover:bg-sky-500 cursor-pointer shadow-xs"
            >
              <HugeIcon name="PlusSign" size={14} className="h-3.5 w-3.5" />
              <span>Add Your First Class</span>
            </button>
          </div>
        )}
      </div>

      {/* Delete All Archived Dialog */}
      <AlertDialog open={Boolean(deleteArchivedClassId)} onOpenChange={(open) => !open && setDeleteArchivedClassId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete all archived assignments?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete all archived assignments for this class. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAllArchived}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Delete All
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
}
