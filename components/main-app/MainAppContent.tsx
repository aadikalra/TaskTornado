import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import Link from 'next/link';
import { Facehash } from 'facehash';
import { format, addDays } from 'date-fns';
import { Button } from '@/components/animate-ui/components/buttons/button';
import { useWideLayout } from '@/hooks/use-wide-layout';
import { useDarkMode } from '@/context/DarkModeContext';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

// Cookie utilities for persisting UI state
const setCookie = (name: string, value: string, days: number = 365) => {
  const expires = new Date();
  expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`;
};

const getCookie = (name: string): string | null => {
  const nameEQ = name + "=";
  const ca = document.cookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
  }
  return null;
};

const deleteCookie = (name: string) => {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
};

type HomeworkLink = {
  id: string;
  url: string;
  title?: string;
};

import { motion, AnimatePresence, useAnimationControls } from 'framer-motion';

import { HomeworkLinkInput } from '../HomeworkLinkInput';
import { RecurringOptions } from '../RecurringOptions';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup,
  SelectLabel,
  SelectSeparator,
} from "@/components/ui/select";
import { Checkbox } from '@/components/animate-ui/components/radix/checkbox';
import { PlayfulHomeworkList, PlayfulHomeworkListRef } from '@/components/PlayfulHomeworkList';
import { HugeIcon, hugeIconMap } from '@/lib/huge-icon-map';
import { iconMap, IconName } from '@/lib/icon-map';

// Helper component to render class icon with HugeIcon fallback
const ClassIconRenderer: React.FC<{ iconName: string; className?: string; style?: React.CSSProperties }> = ({ iconName, className, style }) => {
  return (
    <HugeIcon
      name={iconName}
      size={24}
      className={className}
      style={style}
    />
  );
};

import { RecurringHomework, Class, Homework, Test } from '@/context/ClassContext';
import { useToast } from '@/context/ToastContext';
import { useUpgrade } from '@/context/UpgradeContext';
import { useGamification } from '@/context/GamificationContext';
import { useClassContext } from '@/context/ClassContext';
import { useHomeworkContext } from '@/context/HomeworkContext';
import { useTestContext } from '@/context/TestContext';
import { useAuth } from '@/context/AuthContext';
import StatusGroupedTestList from '@/components/StatusGroupedTestList';


import { useMainApp } from '@/context/MainAppContext';
type Priority = 'low' | 'medium' | 'high';

export const MainAppContent = () => {
  const { user, full_name } = useAuth();
  const { success, error: toastError, warning, info } = useToast();
  const { handlePlanLimitError } = useUpgrade();
  const { data: gamificationData, addXP } = useGamification();
  const { getContainerClass } = useWideLayout();
  const { classes, addClass, updateClass, deleteClass, loading, error } = useClassContext();
  const { homeworks, addHomework, addRecurringHomework, toggleHomework, togglePinHomework, deleteHomework, deleteRecurringSeries, updateHomeworkDueDate, updateHomework } = useHomeworkContext();
  const { tests, addTest, deleteTest, updateTestDueDate, markTestComplete } = useTestContext();


  const {
    showAddClass, setShowAddClass,
    showAddHomework, setShowAddHomework,
    showAddTest, setShowAddTest,
    classIdForAddTest, setClassIdForAddTest,
    selectedTest, setSelectedTest,
    isTestDetailModalOpen, setIsTestDetailModalOpen,
    classToDelete, setClassToDelete,
    deleteConfirm, setDeleteConfirm,

    searchQuery, setSearchQuery,
    homeworkSearch, setHomeworkSearch,
    isHomeworkSearchExpanded, setIsHomeworkSearchExpanded,
    homeworkFilter, setHomeworkFilter,

    showPinnedHomeworks, toggleShowPinnedHomeworks,
    showClasses, setShowClasses, toggleShowClasses,
    showTests, setShowTests, toggleShowTests,
    showTestsInClassCards, toggleShowTestsInClassCards,
    expandedClasses, setExpandedClasses, toggleExpandedClass,
    showArchivedForClass, setShowArchivedForClass, toggleShowArchivedForClass,
    isSelectionMode, setIsSelectionMode,
  } = useMainApp();

  const { isDark } = useDarkMode();

  const [showPinHomeworkModal, setShowPinHomeworkModal] = useState(false);
  const [isAddMenuExpanded, setIsAddMenuExpanded] = useState(false);
  const [isAddTestExpanded, setIsAddTestExpanded] = useState(false);
  const [hasShownInitialNotifications, setHasShownInitialNotifications] = useState(false);

  // Grade Goals State per Class (Persisted in localStorage)
  const [classGradeGoals, setClassGradeGoals] = useState<Record<string, string>>({});
  const [savedClassGrades, setSavedClassGrades] = useState<Record<string, { finalGrade?: number }>>({});

  useEffect(() => {
    const loadSavedClassGrades = () => {
      try {
        const saved = localStorage.getItem('classGrades');
        setSavedClassGrades(saved ? JSON.parse(saved) : {});
      } catch {
        setSavedClassGrades({});
      }
    };

    try {
      const saved = localStorage.getItem('class_grade_goals');
      if (saved) setClassGradeGoals(JSON.parse(saved));
    } catch (e) {
      // fallback ignore
    }

    loadSavedClassGrades();
    window.addEventListener('focus', loadSavedClassGrades);
    window.addEventListener('storage', loadSavedClassGrades);

    return () => {
      window.removeEventListener('focus', loadSavedClassGrades);
      window.removeEventListener('storage', loadSavedClassGrades);
    };
  }, []);

  const handleCycleGradeGoal = useCallback(async (classId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const gradeOptions = ['A+', 'A', 'A-', 'B+', 'B', 'Pass'];
    const currentCls = classes.find(c => c.id === classId);
    const current = currentCls?.target_grade || classGradeGoals[classId] || 'A';
    const nextIdx = (gradeOptions.indexOf(current) + 1) % gradeOptions.length;
    const nextGrade = gradeOptions[nextIdx];
    const updated = { ...classGradeGoals, [classId]: nextGrade };
    setClassGradeGoals(updated);
    try {
      localStorage.setItem('class_grade_goals', JSON.stringify(updated));
      if (updateClass) {
        await updateClass(classId, { target_grade: nextGrade });
      }
    } catch (e) {}
  }, [classGradeGoals, classes, updateClass]);

  const [isClearingAll, setIsClearingAll] = useState(false);

  const handleClearAllHWsAndTests = useCallback(async () => {
    if (homeworks.length === 0 && tests.length === 0) {
      info('Empty', 'No homeworks or tests to delete.');
      return;
    }
    if (!window.confirm(`Are you sure you want to delete ALL ${homeworks.length} homeworks and ${tests.length} tests? This cannot be undone.`)) {
      return;
    }

    setIsClearingAll(true);
    try {
      for (const hw of homeworks) {
        await deleteHomework(hw.id);
      }
      for (const t of tests) {
        await deleteTest(t.id);
      }
      success('Cleared', 'Successfully deleted all homeworks and tests 🧹');
    } catch (err: any) {
      console.error('Error clearing all tasks:', err);
      toastError('Error', err.message || 'Failed to clear all tasks');
    } finally {
      setIsClearingAll(false);
    }
  }, [homeworks, tests, deleteHomework, deleteTest, info, success, toastError]);



  // Refs for PlayfulHomeworkList instances to clear selection
  const pinnedListRef = useRef<PlayfulHomeworkListRef>(null);
  const homeworkListRefs = useRef<Map<string, PlayfulHomeworkListRef | null>>(new Map());

  // Helper function to determine if homework is archived (completed and due date was more than 7 days ago)
  const isHomeworkArchived = useCallback((hw: any): boolean => {
    if (!hw.completed) return false;
    const dueDate = new Date(hw.dueDate);
    const now = new Date();
    const daysSinceDue = Math.floor((now.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
    return daysSinceDue >= 7;
  }, []);

  // Section order state - Reordering disabled
  type SectionId = 'pinned' | 'classes' | 'tests';
  const sectionOrder: SectionId[] = ['pinned', 'classes', 'tests'];

  const handleTogglePinnedHomeworks = (newState: boolean) => toggleShowPinnedHomeworks();
  const handleToggleClasses = (newState: boolean) => toggleShowClasses();
  const handleToggleTests = (newState: boolean) => toggleShowTests();

  const handleToggleSelectionMode = () => {
    if (isSelectionMode) {
      homeworkListRefs.current.forEach(ref => ref?.clearSelection());
      setTimeout(() => setIsSelectionMode(false), 50);
      return;
    }
    setIsSelectionMode(true);
  };

  const handleExpandedClassesChange = (newState: Record<string, boolean>) => {
    setExpandedClasses(newState);
    setCookie('expandedClasses', JSON.stringify(newState));
  };

  // Show toast notifications for overdue assignments - ONLY ON FIRST LOAD
  React.useEffect(() => {
    // Only run this effect once on initial load, not every time homeworks changes
    if (loading || homeworks.length === 0 || hasShownInitialNotifications) return;

    // Delay toast notifications so the page UI can settle first (dock, animations, etc.)
    const delayTimer = setTimeout(() => {
      const overdueAssignments = homeworks.filter((hw: Homework) => {
        const dueDate = new Date(hw.dueDate);
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0); // Start of today (midnight)
        return !hw.completed && dueDate < todayStart;
      });

      if (overdueAssignments.length > 0) {
        // Group by class for better messaging
        const overdueByClass = overdueAssignments.reduce((acc: Record<string, any[]>, hw: Homework) => {
          const className = classes.find((cls: Class) => cls.id === hw.classId)?.name || 'Unknown Class';
          if (!acc[className]) acc[className] = [];
          acc[className].push(hw);
          return acc;
        }, {} as Record<string, any[]>);

        Object.entries(overdueByClass).forEach(([className, assignments]: [string, any]) => {
          if (assignments.length === 1) {
            warning(
              `${assignments[0].title} is overdue!`,
              `Due date was ${new Date(assignments[0].dueDate).toLocaleDateString()}`
            );
          } else {
            warning(
              `${assignments.length} assignments overdue in ${className}`,
              `Check your ${className} assignments`
            );
          }
        });

        // Mark that we've shown initial notifications
        setHasShownInitialNotifications(true);
      }
    }, 1500);

    return () => clearTimeout(delayTimer);
  }, [loading, homeworks.length, classes, hasShownInitialNotifications, warning]); // Only run once on initial load

  // Show toast notifications for assignments due soon - ONLY ON FIRST LOAD
  React.useEffect(() => {
    // Only run this effect once on initial load, not every time homeworks changes
    if (loading || homeworks.length === 0 || hasShownInitialNotifications) return;

    // Delay toast notifications so the page UI can settle first
    const delayTimer = setTimeout(() => {
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);

      const tomorrowStart = new Date(todayStart);
      tomorrowStart.setDate(tomorrowStart.getDate() + 1);

      const threeDaysFromNow = new Date(todayStart);
      threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);

      const dueSoonAssignments = homeworks.filter((hw: Homework) => {
        const dueDate = new Date(hw.dueDate);
        return !hw.completed && dueDate >= todayStart && dueDate <= threeDaysFromNow;
      });

      if (dueSoonAssignments.length > 0) {
        // Group by class for better messaging
        const dueSoonByClass = dueSoonAssignments.reduce((acc: Record<string, any[]>, hw: Homework) => {
          const className = classes.find((cls: Class) => cls.id === hw.classId)?.name || 'Unknown Class';
          if (!acc[className]) acc[className] = [];
          acc[className].push(hw);
          return acc;
        }, {} as Record<string, any[]>);

        Object.entries(dueSoonByClass).forEach(([className, assignments]: [string, any]) => {
          if (assignments.length === 1) {
            const hw = assignments[0];
            const dueDate = new Date(hw.dueDate);
            const todayStart = new Date();
            todayStart.setHours(0, 0, 0, 0);

            const tomorrowStart = new Date(todayStart);
            tomorrowStart.setDate(tomorrowStart.getDate() + 1);

            let timePhrase = '';
            if (dueDate >= todayStart && dueDate < tomorrowStart) {
              timePhrase = 'today';
            } else if (dueDate >= tomorrowStart && dueDate < new Date(tomorrowStart.getTime() + 24 * 60 * 60 * 1000)) {
              timePhrase = 'tomorrow';
            } else {
              const daysUntilDue = Math.ceil((dueDate.getTime() - todayStart.getTime()) / (1000 * 60 * 60 * 24));
              timePhrase = `in ${daysUntilDue} days`;
            }

            warning(
              `${hw.title} is due ${timePhrase}!`,
              `Due on ${dueDate.toLocaleDateString()}`
            );
          } else {
            warning(
              `${assignments.length} assignments due soon in ${className}`,
              `Check your ${className} assignments`
            );
          }
        });

        // Mark that we've shown initial notifications
        setHasShownInitialNotifications(true);
      }
    }, 1500);

    return () => clearTimeout(delayTimer);
  }, [loading, homeworks.length, classes, hasShownInitialNotifications, warning]); // Only run once on initial load

  // Show success toast when completing homework
  const handleHomeworkToggle = useCallback(async (homeworkId: string) => {
    const homework = homeworks.find((hw: Homework) => hw.id === homeworkId);
    if (!homework) return;

    const wasCompleted = homework.completed;
    const oldLevel = gamificationData.currentLevel;

    await toggleHomework(homeworkId);

    // Show success toast if item was just completed
    if (!wasCompleted) {
      const className = classes.find((cls: Class) => cls.id === homework.classId)?.name || 'Unknown Class';

      success(
        `✅ ${homework.title} completed!`,
        `Great job on your ${className} assignment!`
      );
    }
  }, [homeworks, classes, toggleHomework, gamificationData, success]);

  // Handle delete confirmation for recurring homework
  const handleDeleteClick = (homeworkId: string, title: string, isRecurring: boolean, recurringId?: string) => {
    if (isRecurring || recurringId) {
      setDeleteConfirm({
        id: homeworkId,
        title,
        isRecurring: true,
        recurringId
      });
    } else {
      // Regular homework - delete immediately
      deleteHomework(homeworkId);
    }
  };

  const handleDeleteConfirm = async (deleteSeries: boolean) => {
    if (!deleteConfirm) return;

    try {
      if (deleteSeries && deleteConfirm.recurringId) {
        // Delete entire recurring series
        await deleteRecurringSeries(deleteConfirm.recurringId);
      } else {
        // Delete just this instance
        await deleteHomework(deleteConfirm.id);
      }
    } catch (error) {
      console.error('Error deleting homework:', error);
    } finally {
      setDeleteConfirm(null);
    }
  };



  // Award XP for existing completed tests on component mount
  useEffect(() => {
    const awardXpForCompletedTests = () => {
      const completedTests = tests.filter(test =>
        test.status?.toLowerCase() === 'completed' ||
        test.status?.toLowerCase() === 'taken' ||
        (test.score !== null && test.score !== undefined)
      );

      completedTests.forEach(test => {
        if (test.score && test.maxScore) {
          const percentageScore = (test.score / test.maxScore) * 100;
          let xpEarned = 50; // Base XP for completing any test

          // Bonus XP for good performance
          if (percentageScore >= 90) {
            xpEarned += 30; // Excellent performance
          } else if (percentageScore >= 80) {
            xpEarned += 20; // Great performance
          } else if (percentageScore >= 70) {
            xpEarned += 10; // Good performance
          } else if (percentageScore >= 60) {
            xpEarned += 5; // Passing performance
          }

          // Extra bonus for perfect scores
          if (test.score === test.maxScore) {
            xpEarned += 15;
          }

          // Bonus XP for high-stakes tests
          if (test.testType?.toLowerCase() === 'exam') {
            xpEarned += 10;
          } else if (test.testType?.toLowerCase() === 'alpha') {
            xpEarned += 5;
          }

          // Award the XP
          const testClass = classes.find(c => c.id === test.classId);
          addXP(xpEarned, test.classId, testClass?.name);
        }
      });
    };

    // Only run if we have tests and classes loaded
    if (tests.length > 0 && classes.length > 0 && !loading) {
      awardXpForCompletedTests();
    }
  }, [tests, classes, loading, addXP]);

  // Color mapping for class icons
  const classColors = {
    red: '#F9A8A8',     // pastel red
    blue: '#93C5FD',    // pastel blue
    yellow: '#FCD39D',  // pastel amber
    green: '#86EFAC',   // pastel green
    purple: '#C4B5FD',  // pastel purple
    pink: '#F9A8D4',    // pastel pink
    teal: '#99F6E4',    // pastel teal
    gray: '#CBD5E1'     // pastel slate
  };

  const headerColors = {
    red: '#DC2626',     // red-600
    blue: '#2563EB',    // blue-600
    yellow: '#D97706',  // amber-600
    green: '#16A34A',   // green-600
    purple: '#7C3AED',  // purple-600
    pink: '#DB2777',    // pink-600
    teal: '#0D9488',    // teal-600
    gray: '#475569'     // slate-600
  };

  const darkHeaderColors = {
    red: '#F87171',     // red-400 (vibrant high-contrast on dark)
    blue: '#60A5FA',    // blue-400
    yellow: '#FBBF24',  // amber-400
    green: '#34D399',   // emerald-400
    purple: '#C084FC',  // purple-400
    pink: '#F472B6',    // pink-400
    teal: '#2DD4BF',    // teal-400
    gray: '#CBD5E1'     // slate-300
  };

  // Get initials from class name
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  // Get a consistent color for each class
  const getClassColor = useCallback((index: number) => {
    const colors = Object.values(classColors);
    return colors[index % colors.length];
  }, []);

  const getHeaderColor = useCallback((index: number) => {
    const colors = Object.values(isDark ? darkHeaderColors : headerColors);
    return colors[index % colors.length];
  }, [isDark]);

  // Memoized: homework filtering logic
  const filteredHomeworks = useMemo(() => {
    return homeworks.filter(hw => {
      // First apply status filter
      let matches = true;
      switch (homeworkFilter) {
        case 'completed':
          matches = hw.completed;
          break;
        case 'incomplete':
          matches = !hw.completed;
          break;
        case 'pinned':
          matches = hw.pinned;
          break;
        default:
          matches = true;
      }

      if (!matches) return false;

      // Then apply search filter
      if (homeworkSearch.trim()) {
        const searchLower = homeworkSearch.toLowerCase();
        return (
          hw.title.toLowerCase().includes(searchLower) ||
          hw.description?.toLowerCase().includes(searchLower) ||
          classes.find(c => c.id === hw.classId)?.name.toLowerCase().includes(searchLower)
        );
      }

      return true;
    });
  }, [homeworks, homeworkFilter, homeworkSearch, classes]);

  // Memoize the processed class data to prevent re-renders
  const processedClasses = useMemo(() => {
    return classes.map((cls: any, index: number) => {
      const classTests = tests.filter((t: any) => {
        const testDate = new Date(t.testDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return t.classId === cls.id && t.status !== 'taken' && t.status !== 'completed' && testDate >= today;
      });

      // Get all homeworks for this class
      const allClassHomeworks = filteredHomeworks
        .filter((hw: any) => hw.classId === cls.id)
        .filter((hw: any) => hw.is_recurring_instance === true || hw.recurring_id == null);

      // Separate active and archived homeworks
      const activeHomeworks = allClassHomeworks.filter((hw: any) => !isHomeworkArchived(hw));
      const archivedHomeworks = allClassHomeworks.filter((hw: any) => isHomeworkArchived(hw));

      const mapHomework = (hw: any) => ({
        id: hw.id,
        text: hw.title,
        completed: hw.completed,
        subtext: new Date(hw.dueDate),
        priority: hw.priority || 'medium',
        classId: cls.id,
        classColor: getClassColor(index),
        dueDateIcon: <HugeIcon name="Calendar02" size={12} className="h-3 w-3 text-sky-400 dark:text-sky-500" />,
        links: hw.links,
        onDelete: () => deleteHomework(hw.id),
        onDeleteSeries: (hw.recurring_id || hw.parent_recurring_id) ? () => deleteRecurringSeries(hw.recurring_id || hw.parent_recurring_id) : undefined,
        className: cls.name,
        pinned: hw.pinned || false,
        recurring: hw.recurring_frequency ? true : undefined as any,
        isRecurringInstance: hw.is_recurring_instance || false,
        parentRecurringId: hw.parent_recurring_id || undefined,
        recurringFrequency: hw.recurring_frequency || undefined,
        isArchived: isHomeworkArchived(hw),
      });

      const classHomeworks = activeHomeworks
        .sort((a: any, b: any) => {
          if (a.completed !== b.completed) return a.completed ? 1 : -1;
          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        })
        .map(mapHomework);

      const classArchivedHomeworks = archivedHomeworks
        .sort((a: any, b: any) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime())
        .map(mapHomework);

      return {
        ...cls,
        classTests,
        classHomeworks,
        classArchivedHomeworks,
        index
      };
    });
  }, [classes, filteredHomeworks, tests, getClassColor, isHomeworkArchived]);

  // Memoized: overdue homework count (used in stats section)
  const overdueCount = useMemo(() => {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    return homeworks.filter((hw: any) => !hw.completed && new Date(hw.dueDate) < todayStart).length;
  }, [homeworks]);

  // Memoized: next due homework and days until due
  const { nextDueHomework, daysUntilNextDue } = useMemo(() => {
    if (homeworks.length === 0) return { nextDueHomework: null, daysUntilNextDue: null };
    const now = new Date();
    const next = homeworks
      .filter((hw: any) => !hw.completed && new Date(hw.dueDate) > now)
      .sort((a: any, b: any) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())[0] || null;
    const days = next
      ? Math.ceil((new Date(next.dueDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      : null;
    return { nextDueHomework: next, daysUntilNextDue: days };
  }, [homeworks]);

  // Memoized: next upcoming test and days until test
  const { nextUpcomingTest, daysUntilNextTest } = useMemo(() => {
    if (tests.length === 0) return { nextUpcomingTest: null, daysUntilNextTest: null };
    const now = new Date();
    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);
    const next = tests
      .filter((test: Test) => test.status !== 'taken' && new Date(test.testDate) >= todayStart)
      .sort((a: Test, b: Test) => new Date(a.testDate).getTime() - new Date(b.testDate).getTime())[0] || null;
    const days = next
      ? Math.ceil((new Date(next.testDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      : null;
    return { nextUpcomingTest: next, daysUntilNextTest: days };
  }, [tests]);

  const dashboardUpcomingTests = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return [...tests]
      .filter((test: Test) => {
        const testDate = new Date(`${test.testDate}T00:00:00`);
        const status = test.status?.toLowerCase();
        return testDate >= today && status !== 'taken' && status !== 'completed';
      })
      .sort((left: Test, right: Test) =>
        new Date(left.testDate).getTime() - new Date(right.testDate).getTime()
      )
      .slice(0, 4);
  }, [tests]);


  const handleTestClick = (test: Test) => {
    setSelectedTest(test);
    setIsTestDetailModalOpen(true);
  };

  // Function to render each section based on ID
  const renderSection = (sectionId: SectionId) => {
    switch (sectionId) {


      case 'classes':
        const effectivelyShowClasses = showTestsInClassCards || showClasses;
        return (
          <div key="classes" className="order-3 mt-5 mb-6 sm:mt-8 sm:mb-10" data-tour="classes">
            <div>
              <div
                className={`mb-3 group ${!showTestsInClassCards ? 'cursor-pointer' : 'cursor-default'}`}
                onClick={!showTestsInClassCards ? () => handleToggleClasses(!showClasses) : undefined}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex justify-between items-center md:justify-start">
                    <div>
                      <h2 className="text-xl sm:text-3xl font-bold tracking-tight text-sky-500 dark:text-sky-400">
                        My Classes
                      </h2>
                    </div>
                    {!showTestsInClassCards && (
                      <div
                        className="hidden"
                      >
                        <HugeIcon name="ArrowRight01" size={20} className={`h-5 w-5 text-sky-700 dark:text-sky-300 transition-transform duration-500 ${showClasses ? 'rotate-90' : 'rotate-0'}`} />
                      </div>
                    )}
                  </div>
                  <div
                    className="flex lg:hidden items-center gap-1.5"
                    onClick={(event) => event.stopPropagation()}
                  >
                    <button
                      type="button"
                      onClick={() => setShowAddHomework(true)}
                      className="h-9 px-3 rounded-full bg-sky-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm active:scale-95 transition-transform"
                    >
                      <HugeIcon name="PlusSign" size={13} />
                      Homework
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowAddClass(true)}
                      className="h-9 w-9 rounded-full bg-sky-500/10 dark:bg-sky-400/15 text-sky-700 dark:text-sky-300 border border-sky-500/15 flex items-center justify-center"
                      aria-label="Add class"
                    >
                      <HugeIcon name="Course" size={15} />
                    </button>
                    {!showTestsInClassCards && (
                      <button
                        type="button"
                        onClick={() => handleToggleClasses(!showClasses)}
                        className="h-9 w-9 rounded-full bg-[#ebf6b5]/60 dark:bg-[#ebf6b5]/10 border border-[#d4e88e]/50 dark:border-[#d4e88e]/20 flex items-center justify-center"
                        aria-label={showClasses ? 'Collapse classes' : 'Expand classes'}
                      >
                        <HugeIcon name="ArrowRight01" size={16} className={`text-sky-700 dark:text-sky-300 transition-transform ${showClasses ? 'rotate-90' : ''}`} />
                      </button>
                    )}
                  </div>
                  <div className="hidden">
                    {/* Nav-pill style action buttons */}
                    <div 
                      className="flex items-center gap-0 p-1 bg-[#dbeafe]/60 dark:bg-[#dbeafe]/10 backdrop-blur-md rounded-full shadow-sm border border-[#93c5fd]/50 dark:border-[#93c5fd]/20"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {homeworks.length > 0 && (
                        <>
                          <div
                            className="relative flex items-center h-10 sm:h-8"
                            onClick={(e) => {
                              if (!isHomeworkSearchExpanded) {
                                setIsHomeworkSearchExpanded(true);
                                // Auto-focus the input after animation or immediately
                                setTimeout(() => {
                                  const input = document.getElementById('homework-search-input');
                                  input?.focus();
                                }, 10);
                              }
                            }}
                          >
                            <motion.div
                              initial={false}
                              animate={{
                                width: isHomeworkSearchExpanded || homeworkSearch ? (window.innerWidth < 400 ? 110 : (window.innerWidth < 640 ? 128 : 160)) : (window.innerWidth < 640 ? 40 : 32)
                              }}
                              className="relative h-full flex items-center bg-sky-500/25 hover:bg-sky-500/35 dark:bg-sky-400/20 dark:hover:bg-sky-400/30 rounded-l-full border-r border-sky-500/20 dark:border-sky-400/20 transition-all overflow-hidden"
                              style={{ minWidth: isHomeworkSearchExpanded || homeworkSearch ? undefined : '32px' }}
                            >
                              <HugeIcon
                                name="Search01"
                                size={14}
                                className={`absolute left-[9px] h-3.5 w-3.5 text-sky-700 dark:text-sky-300 transition-colors ${isHomeworkSearchExpanded || homeworkSearch ? 'opacity-90' : 'opacity-100'}`}
                              />
                              <motion.input
                                id="homework-search-input"
                                type="text"
                                placeholder="Search homework..."
                                value={homeworkSearch}
                                onChange={(e) => setHomeworkSearch(e.target.value)}
                                onBlur={() => {
                                  if (!homeworkSearch) setIsHomeworkSearchExpanded(false);
                                }}
                                animate={{ opacity: isHomeworkSearchExpanded || homeworkSearch ? 1 : 0 }}
                                className="w-full h-full pl-8 pr-3 text-[12px] font-semibold bg-transparent text-sky-700 dark:text-sky-300 placeholder-sky-700/40 dark:placeholder-sky-300/40 border-0 focus:ring-0 outline-none"
                              />
                            </motion.div>
                          </div>

                          <Select value={homeworkFilter} onValueChange={(value: string) => setHomeworkFilter(value)}>
                            <SelectTrigger size="sm" hideIcon className="w-10 h-10 sm:w-8 sm:h-8 p-0 flex items-center justify-center text-sky-700 dark:text-sky-300 rounded-r-full bg-sky-500/25 hover:bg-sky-500/35 dark:bg-sky-400/20 dark:hover:bg-sky-400/30 transition-all border-0 focus:ring-0 shadow-none shrink-0">
                              <HugeIcon name="Filter" size={14} className="h-3.5 w-3.5 text-sky-700 dark:text-sky-300" />
                            </SelectTrigger>
                            <SelectContent className="w-56 bg-[#f5f9fc] dark:bg-gray-900 border border-sky-100 dark:border-gray-700 rounded-2xl shadow-xl p-1.5" position="popper" sideOffset={4}>
                              <SelectGroup>
                                <SelectLabel className="px-3 py-2 text-[10px] font-bold text-sky-500/50 uppercase tracking-widest">Status</SelectLabel>
                                <SelectItem value="all" className="text-sky-900 dark:text-sky-100 hover:bg-sky-100 dark:hover:bg-sky-500/10 focus:bg-sky-200 dark:focus:bg-sky-500/15 text-sm rounded-lg transition-colors">All Homework</SelectItem>
                                <SelectItem value="completed" className="text-sky-900 dark:text-sky-100 hover:bg-sky-100 dark:hover:bg-sky-500/10 focus:bg-sky-200 dark:focus:bg-sky-500/15 text-sm rounded-lg transition-colors">Completed</SelectItem>
                                <SelectItem value="incomplete" className="text-sky-900 dark:text-sky-100 hover:bg-sky-100 dark:hover:bg-sky-500/10 focus:bg-sky-200 dark:focus:bg-sky-500/15 text-sm rounded-lg transition-colors">Incomplete</SelectItem>
                                <SelectItem value="pinned" className="text-sky-900 dark:text-sky-100 hover:bg-sky-100 dark:hover:bg-sky-500/10 focus:bg-sky-200 dark:focus:bg-sky-500/15 text-sm rounded-lg transition-colors">Pinned</SelectItem>
                              </SelectGroup>
                            </SelectContent>
                          </Select>
                          <div className="w-px h-4 bg-sky-500/30 dark:bg-sky-400/20 ml-1.5 mr-1.5" />
                          <motion.button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (isSelectionMode) {
                                // First clear all selections
                                homeworkListRefs.current.forEach(ref => {
                                  ref?.clearSelection();
                                });
                                // Then exit selection mode after a short delay
                                setTimeout(() => {
                                  setIsSelectionMode(false);
                                }, 50);
                              } else {
                                setIsSelectionMode(true);
                              }
                            }}
                            whileHover="hover"
                            initial="initial"
                            className={`group relative flex items-center h-10 sm:h-8 rounded-full transition-all active:scale-95 overflow-hidden border-0 ${isSelectionMode
                                ? 'text-white bg-sky-500 dark:bg-sky-600'
                                : 'text-sky-700 dark:text-sky-300 bg-sky-500/25 dark:bg-sky-400/20'
                              }`}
                          >
                            <div className="flex items-center justify-center w-10 h-10 sm:w-8 sm:h-8 shrink-0">
                              {isSelectionMode ? (
                                <HugeIcon name="CheckmarkCircle02" size={14} className="h-3.5 w-3.5" />
                              ) : (
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  viewBox="0 0 24 24"
                                  className="h-3.5 w-3.5"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="1.5"
                                  strokeLinecap="round"
                                >
                                  <path d="M15 2.5H12C7.52166 2.5 5.28249 2.5 3.89124 3.89124C2.5 5.28249 2.5 7.52166 2.5 12C2.5 16.4783 2.5 18.7175 3.89124 20.1088C5.28249 21.5 7.52166 21.5 12 21.5C16.4783 21.5 18.7175 21.5 20.1088 20.1088C21.5 18.7175 21.5 16.4783 21.5 12V10" />
                                  <path d="M8.5 10L12 13.5L21.0002 3.5" />
                                </svg>
                              )}
                            </div>
                            <motion.span 
                              variants={{
                                initial: { width: isSelectionMode ? 'auto' : 0, opacity: isSelectionMode ? 1 : 0, marginRight: isSelectionMode ? 12 : 0 },
                                hover: { width: 'auto', opacity: 1, marginRight: 12 }
                              }}
                              transition={{ duration: 0.25, ease: "easeInOut" }}
                              className="text-[13px] font-semibold whitespace-nowrap overflow-hidden"
                            >
                              {isSelectionMode ? 'Done' : 'Select'}
                            </motion.span>
                          </motion.button>
                          <button
                            onClick={handleClearAllHWsAndTests}
                            disabled={isClearingAll}
                            className="h-8 px-2.5 rounded-full bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/30 text-[12px] font-semibold flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50 shrink-0"
                            title="Delete all homeworks and tests"
                          >
                            <HugeIcon name="Delete02" size={14} className="text-red-500" />
                            <span className="hidden sm:inline">Delete All HWs & Tests</span>
                            <span className="sm:hidden">Clear</span>
                          </button>
                          <div className="w-px h-4 bg-sky-500/30 dark:bg-sky-400/20 ml-1 mr-1" />
                        </>
                      )}
                      <div className="relative flex items-center h-8">
                        <motion.div
                          initial={false}
                          animate={{ width: isAddMenuExpanded ? 165 : 32 }}
                          transition={{ type: "spring", stiffness: 400, damping: 22 }}
                          className="relative h-full flex items-center bg-sky-500/25 hover:bg-sky-500/35 dark:bg-sky-400/20 dark:hover:bg-sky-400/30 rounded-full overflow-hidden"
                          onMouseEnter={() => setIsAddMenuExpanded(true)}
                          onMouseLeave={() => setIsAddMenuExpanded(false)}
                        >
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowAddClass(true);
                            }}
                            className="flex items-center px-3 h-full text-[13px] font-semibold text-sky-700 dark:text-sky-300 transition-opacity duration-200 whitespace-nowrap"
                            style={{ opacity: isAddMenuExpanded ? 1 : 0 }}
                          >
                            Class
                          </button>
                          <div
                            className="w-px h-4 bg-sky-500/30 dark:bg-sky-400/20 shrink-0 transition-opacity duration-200" 
                            style={{ opacity: isAddMenuExpanded ? 1 : 0 }} 
                          />
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowAddHomework(true);
                            }}
                            className="flex items-center pl-3 pr-7 h-full text-[13px] font-semibold text-sky-700 dark:text-sky-300 transition-opacity duration-200 whitespace-nowrap"
                            style={{ opacity: isAddMenuExpanded ? 1 : 0 }}
                          >
                            Homework
                          </button>
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            className="absolute h-3.5 w-3.5 text-sky-700 dark:text-sky-300 pointer-events-none transition-all duration-200"
                            style={{ right: isAddMenuExpanded ? '12px' : '9px', top: '50%', transform: 'translateY(-50%)' }}
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M12 4V20M20 12H4" />
                          </svg>
                        </motion.div>
                      </div>
                      {showTestsInClassCards && (
                        <motion.div
                          initial={false}
                          animate={{ width: isAddTestExpanded ? 72 : 32 }}
                          transition={{ type: "spring", stiffness: 400, damping: 22 }}
                          className="relative h-8 flex items-center bg-sky-500/25 hover:bg-sky-500/35 dark:bg-sky-400/20 dark:hover:bg-sky-400/30 rounded-full overflow-hidden cursor-pointer shrink-0"
                          onMouseEnter={() => setIsAddTestExpanded(true)}
                          onMouseLeave={() => setIsAddTestExpanded(false)}
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowAddTest(true);
                          }}
                        >
                          <span
                            className="flex items-center pl-3 h-full text-[13px] font-semibold text-sky-700 dark:text-sky-300 transition-opacity duration-200 whitespace-nowrap"
                            style={{ opacity: isAddTestExpanded ? 1 : 0 }}
                          >
                            Test
                          </span>
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            className="absolute h-3.5 w-3.5 text-sky-700 dark:text-sky-300 pointer-events-none transition-all duration-200"
                            style={{ right: isAddTestExpanded ? '10px' : '9px', top: '50%', transform: 'translateY(-50%)' }}
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M12 4V20M20 12H4" />
                          </svg>
                        </motion.div>
                      )}
                    </div>
                    {!showTestsInClassCards && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowClasses(!showClasses);
                        }}
                        className="p-2.5 rounded-full bg-[#ebf6b5]/60 dark:bg-[#ebf6b5]/10 hover:bg-[#ebf6b5] dark:hover:bg-[#ebf6b5]/20 border border-[#d4e88e]/50 dark:border-[#d4e88e]/20 hidden md:flex items-center justify-center transition-all duration-300"
                      >
                        <HugeIcon name="ArrowRight01" size={20} className={`h-5 w-5 text-sky-700 dark:text-sky-300 transition-transform duration-500 ${showClasses ? 'rotate-90' : 'rotate-0'}`} />
                      </button>
                    )}
                  </div>
                  <div
                    className="hidden lg:flex items-center gap-2"
                    onClick={(event) => event.stopPropagation()}
                  >
                    {homeworks.length > 0 && (
                      <div className="relative">
                        <HugeIcon
                          name="Search01"
                          size={14}
                          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sky-600/45 dark:text-sky-300/40"
                        />
                        <input
                          type="search"
                          aria-label="Search homework"
                          placeholder="Search homework"
                          value={homeworkSearch}
                          onChange={(event) => setHomeworkSearch(event.target.value)}
                          className="h-9 w-40 rounded-full bg-sky-500/[0.07] pl-9 pr-3 text-xs font-semibold text-sky-900 outline-none transition-all placeholder:text-sky-600/35 focus:w-52 focus:bg-sky-500/10 dark:bg-white/[0.05] dark:text-sky-100 dark:placeholder:text-sky-300/30 dark:focus:bg-white/[0.075]"
                        />
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={() => setShowAddHomework(true)}
                      className="flex h-9 items-center gap-1.5 rounded-full bg-sky-500 px-4 text-xs font-bold text-white shadow-sm transition-colors hover:bg-sky-600"
                    >
                      <HugeIcon name="PlusSign" size={13} />
                      Homework
                    </button>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button
                          type="button"
                          className="flex h-9 w-9 items-center justify-center rounded-full bg-sky-500/[0.08] text-sky-700 transition-colors hover:bg-sky-500/[0.13] dark:bg-white/[0.05] dark:text-sky-300 dark:hover:bg-white/[0.08]"
                          aria-label="More class actions"
                        >
                          <HugeIcon name="MoreVertical" size={16} />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="end"
                        className="w-56 rounded-2xl border-sky-100 bg-white/95 p-1.5 shadow-xl backdrop-blur-xl dark:border-sky-500/10 dark:bg-gray-900/95"
                      >
                        <DropdownMenuItem onSelect={() => setShowAddClass(true)} className="rounded-xl py-2">
                          <HugeIcon name="Course" size={15} />
                          Add class
                        </DropdownMenuItem>
                        {homeworks.length > 0 && (
                          <DropdownMenuItem onSelect={handleToggleSelectionMode} className="rounded-xl py-2">
                            <HugeIcon name="CheckmarkCircle02" size={15} />
                            {isSelectionMode ? 'Finish selecting' : 'Select assignments'}
                          </DropdownMenuItem>
                        )}

                        {homeworks.length > 0 && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuLabel className="text-xs font-medium text-sky-700/45 dark:text-sky-300/40">
                              Show homework
                            </DropdownMenuLabel>
                            <DropdownMenuRadioGroup value={homeworkFilter} onValueChange={setHomeworkFilter}>
                              <DropdownMenuRadioItem value="all" className="rounded-xl">All</DropdownMenuRadioItem>
                              <DropdownMenuRadioItem value="incomplete" className="rounded-xl">Incomplete</DropdownMenuRadioItem>
                              <DropdownMenuRadioItem value="completed" className="rounded-xl">Completed</DropdownMenuRadioItem>
                              <DropdownMenuRadioItem value="pinned" className="rounded-xl">Pinned</DropdownMenuRadioItem>
                            </DropdownMenuRadioGroup>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              variant="destructive"
                              disabled={isClearingAll}
                              onSelect={handleClearAllHWsAndTests}
                              className="rounded-xl py-2"
                            >
                              <HugeIcon name="Delete02" size={15} />
                              Clear homework and tests
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>

                    {!showTestsInClassCards && (
                      <button
                        type="button"
                        onClick={() => setShowClasses(!showClasses)}
                        className="flex h-9 w-9 items-center justify-center rounded-full bg-[#ebf6b5]/60 text-sky-700 transition-colors hover:bg-[#ebf6b5] dark:bg-[#ebf6b5]/10 dark:text-sky-300 dark:hover:bg-[#ebf6b5]/20"
                        aria-label={showClasses ? 'Collapse classes' : 'Expand classes'}
                      >
                        <HugeIcon name="ArrowRight01" size={16} className={`transition-transform ${showClasses ? 'rotate-90' : ''}`} />
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div
                className={`overflow-hidden transition-all duration-400 ease-in-out ${effectivelyShowClasses
                  ? 'max-h-[1000px] opacity-100'
                  : 'max-h-0 opacity-0'
                  }`}
              >
              </div>
            </div>

            <div
              className={`overflow-hidden transition-all duration-400 ease-in-out ${effectivelyShowClasses
                ? 'max-h-[5000px] opacity-100'
                : 'max-h-0 opacity-0'
                }`}
            >
              {classes.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="rounded-[28px] bg-[#f5f9fc] dark:bg-sky-500/[0.03] border border-sky-100 dark:border-sky-500/10 shadow-2xs hover:shadow-md hover:shadow-sky-500/[0.04] p-8 sm:p-12 text-center transition-all duration-500 relative overflow-hidden group"
                >
                  <div className="relative z-10 flex flex-col items-center">
                    <div className="w-12 h-12 rounded-2xl bg-sky-500/10 dark:bg-sky-400/15 flex items-center justify-center mb-3.5 border border-sky-200/50 dark:border-sky-500/20 shadow-xs group-hover:scale-110 transition-transform duration-500">
                      <HugeIcon name="Course" size={24} className="text-sky-600 dark:text-sky-400" />
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold text-sky-800 dark:text-sky-200 mb-1.5 tracking-tight">No classes yet</h3>
                    <p className="text-xs sm:text-sm text-sky-700/60 dark:text-sky-300/50 max-w-xs mx-auto font-medium leading-relaxed">
                      Get started by adding your first class to organize your schoolwork and track your progress.
                    </p>
                    <button
                      onClick={() => setShowAddClass(true)}
                      className="mt-6 inline-flex items-center gap-2 px-6 py-2.5 bg-[#ebf6b5] hover:bg-[#e0efa0] dark:bg-[#ebf6b5]/20 dark:hover:bg-[#ebf6b5]/30 text-sky-950 dark:text-[#ebf6b5] font-bold text-xs sm:text-sm rounded-xl border border-[#d4e88e] dark:border-[#d4e88e]/40 transition-all active:scale-95 shadow-xs cursor-pointer"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M12 4V20M20 12H4" />
                      </svg>
                      Add Your First Class
                    </button>
                  </div>
                </motion.div>
              ) : (
                <div className="flex gap-3 overflow-x-auto snap-x snap-mandatory scroll-px-1 px-1 pb-2 sm:px-0 sm:pb-0 sm:grid sm:grid-cols-2 lg:grid-cols-3 sm:gap-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">




                  {processedClasses.map((cls: any) => {
                    const { classHomeworks, classArchivedHomeworks, classTests, index } = cls;
                    const nextClassTest = classTests[0] || null;
                    const hasTests = Boolean(nextClassTest);
                    const hasHomework = classHomeworks.length > 0;
                    const hasArchivedHomework = classArchivedHomeworks.length > 0;
                    const isShowingArchived = showArchivedForClass[cls.id] || false;
                    const isEmptyClass = !hasHomework && !hasTests && (!hasArchivedHomework || !isShowingArchived);

                    // Check if this class has overdue homework
                    const todayStart = new Date();
                    todayStart.setHours(0, 0, 0, 0);
                    const hasOverdueHomework = classHomeworks.some((hw: any) => !hw.completed && new Date(hw.subtext) < todayStart);
                    const gradeFromClassData = typeof cls.grade_data?.finalGrade === 'number'
                      ? cls.grade_data.finalGrade
                      : null;
                    const gradeFromLocalStorage = typeof savedClassGrades[cls.id]?.finalGrade === 'number'
                      ? savedClassGrades[cls.id].finalGrade!
                      : null;
                    const savedGrade = typeof cls.grade === 'number'
                      ? cls.grade
                      : gradeFromClassData ?? gradeFromLocalStorage;
                    const savedGradeLetter = savedGrade === null
                      ? null
                      : savedGrade >= 90
                        ? 'A'
                        : savedGrade >= 80
                          ? 'B'
                          : savedGrade >= 70
                            ? 'C'
                            : 'I';
                    const savedGradeColor = savedGrade === null
                      ? ''
                      : savedGrade >= 90
                        ? 'border-emerald-400/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
                        : savedGrade >= 80
                          ? 'border-blue-400/30 bg-blue-500/10 text-blue-700 dark:text-blue-300'
                          : savedGrade >= 70
                            ? 'border-amber-400/30 bg-amber-500/10 text-amber-700 dark:text-amber-300'
                            : 'border-red-400/30 bg-red-500/10 text-red-700 dark:text-red-300';

                    return (
                      <motion.div
                        key={cls.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                          duration: 0.3,
                          delay: index * 0.05,
                        }}
                        className={`w-[86vw] max-w-[360px] shrink-0 snap-start sm:w-auto sm:max-w-none sm:shrink rounded-[22px] sm:rounded-[28px] ${isEmptyClass ? 'p-3 sm:p-4' : 'p-3 sm:p-5'} shadow-2xs hover:shadow-md hover:shadow-sky-500/[0.04] transition-all duration-500 border bg-[#f5f9fc] dark:bg-sky-500/[0.03] ${showFrowny && hasOverdueHomework
                          ? 'border-red-300 dark:border-red-500/40 shadow-red-100 dark:shadow-red-900/20 shadow-xs'
                          : 'border-sky-100 dark:border-sky-500/10'
                          }`}

                      >
                        <div
                          className={`group/header p-3 sm:p-3.5 ${isEmptyClass ? 'mb-0' : 'mb-2.5 sm:mb-3'} rounded-[18px] sm:rounded-[20px] transition-colors duration-500 border`}
                          style={{
                            backgroundColor: isDark ? `${getHeaderColor(index)}1F` : `${getClassColor(index)}40`,
                            borderColor: isDark ? `${getHeaderColor(index)}40` : 'transparent'
                          }}
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex items-center w-full gap-3">
                              <div className="shrink-0 transition-transform group-hover/header:scale-110 duration-500">
                                <ClassIconRenderer
                                  iconName={cls.icon}
                                  className="w-6 h-6"
                                  style={{ color: getHeaderColor(index) }}
                                />
                              </div>

                              <div className="flex-1 min-w-0 flex items-center gap-2">
                                <h3
                                  className="text-sm sm:text-base font-bold truncate tracking-tight uppercase"
                                  style={{ color: getHeaderColor(index) }}
                                >
                                  {cls.name}
                                </h3>
                                {savedGrade !== null ? (
                                  <span
                                    className={`shrink-0 px-2 py-0.5 rounded-full text-[10px] font-extrabold border tabular-nums ${savedGradeColor}`}
                                    title={`Saved grade: ${savedGrade.toFixed(1)}% (${savedGradeLetter})`}
                                  >
                                    {savedGrade.toFixed(1)}%
                                    <span className="hidden sm:inline"> · {savedGradeLetter}</span>
                                  </span>
                                ) : (
                                  <button
                                    onClick={(e) => handleCycleGradeGoal(cls.id, e)}
                                    className="shrink-0 px-2 py-0.5 rounded-full text-[10px] font-bold border border-sky-300/40 dark:border-sky-500/30 bg-white/40 dark:bg-black/20 text-sky-800 dark:text-sky-200 hover:bg-white/70 dark:hover:bg-black/40 transition-all cursor-pointer flex items-center gap-1"
                                    title="Click to cycle target grade goal"
                                  >
                                    <span>Goal: {cls.target_grade || classGradeGoals[cls.id] || 'A'}</span>
                                  </button>
                                )}
                              </div>



                              <div className="flex flex-row items-center gap-1">
                                <Link
                                  href={`/classes/edit/${cls.id}`}
                                  className="opacity-100 sm:opacity-0 sm:group-hover/header:opacity-100 p-1.5 rounded-md text-gray-400 hover:text-sky-500 dark:text-gray-500 dark:hover:text-sky-400 hover:bg-sky-500/10 dark:hover:bg-sky-500/20 transition-all shrink-0"
                                  onClick={(e) => e.stopPropagation()}
                                  aria-label="Edit class"
                                >
                                  <HugeIcon name="Pen02" size={16} className="w-4 h-4" />
                                </Link>

                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setClassToDelete({ id: cls.id, name: cls.name });
                                  }}
                                  className="hidden sm:inline-flex sm:opacity-0 sm:group-hover/header:opacity-100 p-1.5 rounded-md text-gray-400 hover:text-red-500 dark:text-gray-500 dark:hover:text-red-400 hover:bg-red-500/10 dark:hover:bg-red-500/20 transition-all shrink-0"
                                  aria-label="Delete class"
                                >
                                  <HugeIcon name="Delete02" size={16} className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>



                        <div className="space-y-1 mt-1">
                          <PlayfulHomeworkList
                            ref={ref => {
                              if (ref) {
                                homeworkListRefs.current.set(`${cls.id}-main`, ref);
                              } else {
                                homeworkListRefs.current.delete(`${cls.id}-main`);
                              }
                            }}
                            items={classHomeworks.slice(0, 2)}
                            onItemToggle={handleHomeworkToggle}
                            onPinToggle={togglePinHomework}
                            onBulkDelete={handleBulkDelete}
                            onBulkMove={handleBulkMove}
                            availableClasses={classes.map((c, idx) => ({
                              id: c.id,
                              name: c.name,
                              icon: c.icon || 'BookOpen',
                              color: getHeaderColor(idx),
                              bgColor: getClassColor(idx)
                            }))}
                            isSelectionMode={isSelectionMode}
                            className={`transition-all duration-300 ${isSelectionMode ? 'opacity-60' : ''}`}
                          />

                          <AnimatePresence>
                            {expandedClasses[cls.id] && classHomeworks.length > 2 && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.3, ease: "easeInOut" }}
                                style={{ overflow: 'hidden' }}
                              >
                                <PlayfulHomeworkList
                                  ref={ref => {
                                    if (ref) {
                                      homeworkListRefs.current.set(`${cls.id}-expanded`, ref);
                                    } else {
                                      homeworkListRefs.current.delete(`${cls.id}-expanded`);
                                    }
                                  }}
                                  items={classHomeworks.slice(2)}
                                  onItemToggle={handleHomeworkToggle}
                                  onPinToggle={togglePinHomework}
                                  className="space-y-1.5 pt-1.5"
                                />
                              </motion.div>
                            )}
                          </AnimatePresence>

                          {nextClassTest && (
                            <button
                              type="button"
                              onClick={() => handleTestClick(nextClassTest)}
                              className="flex w-full items-center gap-2.5 mt-3 px-2.5 py-2 rounded-2xl bg-sky-500/[0.045] dark:bg-white/[0.035] text-left group/test lg:rounded-none lg:bg-transparent lg:dark:bg-transparent lg:px-0 lg:pt-3 lg:pb-0 lg:border-t lg:border-sky-100 lg:dark:border-sky-500/10"
                            >
                              <span className="h-8 w-8 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center shrink-0">
                                <HugeIcon name="Quiz04" size={15} />
                              </span>
                              <span className="min-w-0 flex-1">
                                <span className="block text-[10px] font-medium text-sky-500/55">
                                  Next test
                                </span>
                                <span className="block truncate text-xs font-bold text-sky-900 dark:text-sky-100 group-hover/test:text-sky-600 dark:group-hover/test:text-sky-300">
                                  {nextClassTest.title}
                                </span>
                              </span>
                              <span className="text-[10px] font-bold text-sky-500/50 shrink-0">
                                {new Date(`${nextClassTest.testDate}T00:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                              </span>
                            </button>
                          )}

                          {classHomeworks.length > 2 && (
                            <div className="text-xs text-center text-sky-600/30 dark:text-sky-400/30 pt-1">
                              {expandedClasses[cls.id] ? (
                                <button
                                  onClick={() => handleExpandedClassesChange({ ...expandedClasses, [cls.id]: false })}
                                  className="hover:text-sky-600 dark:hover:text-sky-300 transition-colors"
                                >
                                  Hide
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleExpandedClassesChange({ ...expandedClasses, [cls.id]: true })}
                                  className="hover:text-sky-600 dark:hover:text-sky-300 transition-colors"
                                >
                                  +{classHomeworks.length - 2} more assignments
                                </button>
                              )}
                            </div>
                          )}



                          {/* Show archived homework option when no active homework but has archived */}
                          {!hasHomework && hasArchivedHomework && !isShowingArchived && (
                            <div className="text-center py-2">
                              <button
                                onClick={() => setShowArchivedForClass(prev => ({ ...prev, [cls.id]: true }))}
                                className="text-xs text-sky-600/40 hover:text-sky-600 dark:text-sky-400/40 dark:hover:text-sky-300 transition-colors flex items-center justify-center gap-1.5 mx-auto"
                              >
                                <HugeIcon name="Archive" size={14} className="w-3.5 h-3.5" />
                                View {classArchivedHomeworks.length} archived assignment{classArchivedHomeworks.length > 1 ? 's' : ''}
                              </button>
                            </div>
                          )}

                          {/* Archived homework section */}
                          <AnimatePresence>
                            {isShowingArchived && hasArchivedHomework && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.3, ease: "easeInOut" }}
                                style={{ overflow: 'hidden' }}
                              >
                                <div className="flex items-center gap-3 my-3">
                                  <div className="h-px bg-sky-100 dark:bg-gray-800 flex-1"></div>
                                  <span className="text-[11px] uppercase font-semibold text-sky-600/30 dark:text-sky-400/30 tracking-wider flex items-center gap-1.5">
                                    <HugeIcon name="Archive" size={12} className="w-3 h-3" />
                                    Archived
                                  </span>
                                  <div className="h-px bg-sky-100 dark:bg-gray-800 flex-1"></div>
                                </div>
                                <PlayfulHomeworkList
                                  ref={ref => {
                                    if (ref) {
                                      homeworkListRefs.current.set(`${cls.id}-archived`, ref);
                                    } else {
                                      homeworkListRefs.current.delete(`${cls.id}-archived`);
                                    }
                                  }}
                                  items={classArchivedHomeworks}
                                  onItemToggle={handleHomeworkToggle}
                                  onPinToggle={togglePinHomework}
                                  className="space-y-2 opacity-50"
                                />
                                <div className="flex items-center justify-center gap-3 pt-3">
                                  <button
                                    onClick={() => setShowArchivedForClass(prev => ({ ...prev, [cls.id]: false }))}
                                    className="text-xs text-sky-600/30 hover:text-sky-600 dark:hover:text-sky-300 transition-colors"
                                  >
                                    Hide archived
                                  </button>
                                  <span className="text-sky-200 dark:text-gray-700">·</span>
                                  <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                      <button
                                        className="text-xs text-red-400/60 hover:text-red-500 transition-colors"
                                      >
                                        Delete all archived
                                      </button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                      <AlertDialogHeader>
                                        <AlertDialogTitle>Delete all archived?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                          This will permanently delete {classArchivedHomeworks.length} archived assignment{classArchivedHomeworks.length > 1 ? 's' : ''} from this class. This action cannot be undone.
                                        </AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction
                                          onClick={async () => {
                                            for (const hw of classArchivedHomeworks) {
                                              await deleteHomework(hw.id);
                                            }
                                            setShowArchivedForClass(prev => ({ ...prev, [cls.id]: false }));
                                          }}
                                        >
                                          Delete All
                                        </AlertDialogAction>
                                      </AlertDialogFooter>
                                    </AlertDialogContent>
                                  </AlertDialog>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        );

      case 'tests':
        return (
          <div key="tests" className="order-2 mt-5 mb-6 sm:mt-8 sm:mb-10" data-tour="tests">
            <div>
              <div
                className={`mb-3 group cursor-pointer`}
                onClick={() => handleToggleTests(!showTests)}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex justify-between items-center md:justify-start">
                    <div>
                      <h2 className="text-xl sm:text-3xl font-bold tracking-tight text-sky-500 dark:text-sky-400">
                        Upcoming Tests
                      </h2>
                    </div>
                    <div
                      className="hidden"
                    >
                      <HugeIcon name="ArrowRight01" size={20} className={`h-5 w-5 text-sky-700 dark:text-sky-300 transition-transform duration-500 ${showTests ? 'rotate-90' : 'rotate-0'}`} />
                    </div>
                  </div>
                  <div
                    className="flex lg:hidden items-center gap-1.5"
                    onClick={(event) => event.stopPropagation()}
                  >
                    <button
                      type="button"
                      onClick={() => setShowAddTest(true)}
                      className="h-9 px-3 rounded-full bg-sky-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm active:scale-95 transition-transform"
                    >
                      <HugeIcon name="PlusSign" size={13} />
                      Test
                    </button>
                    <button
                      type="button"
                      onClick={() => handleToggleTests(!showTests)}
                      className="h-9 w-9 rounded-full bg-[#ebf6b5]/60 dark:bg-[#ebf6b5]/10 border border-[#d4e88e]/50 dark:border-[#d4e88e]/20 flex items-center justify-center"
                      aria-label={showTests ? 'Collapse tests' : 'Expand tests'}
                    >
                      <HugeIcon name="ArrowRight01" size={16} className={`text-sky-700 dark:text-sky-300 transition-transform ${showTests ? 'rotate-90' : ''}`} />
                    </button>
                  </div>
                  <div className="hidden lg:flex items-center gap-1.5">
                    <Link
                      href="/tests"
                      onClick={(event) => event.stopPropagation()}
                      className="h-9 px-4 rounded-full bg-sky-500/10 hover:bg-sky-500/15 text-sky-700 dark:text-sky-300 text-xs font-bold flex items-center gap-1.5 transition-colors"
                    >
                      All tests
                      <HugeIcon name="ArrowRight01" size={12} />
                    </Link>
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        setShowAddTest(true);
                      }}
                      className="h-9 px-4 rounded-full bg-sky-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm hover:bg-sky-600 transition-colors"
                    >
                      <HugeIcon name="PlusSign" size={13} />
                      Add test
                    </button>
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        setShowTests(!showTests);
                      }}
                      className="h-9 w-9 rounded-full bg-[#ebf6b5]/60 dark:bg-[#ebf6b5]/10 hover:bg-[#ebf6b5] dark:hover:bg-[#ebf6b5]/20 border border-[#d4e88e]/50 dark:border-[#d4e88e]/20 flex items-center justify-center transition-all"
                      aria-label={showTests ? 'Collapse upcoming tests' : 'Expand upcoming tests'}
                    >
                      <HugeIcon
                        name="ArrowRight01"
                        size={16}
                        className={`text-sky-700 dark:text-sky-300 transition-transform ${showTests ? 'rotate-90' : ''}`}
                      />
                    </button>
                  </div>
                </div>
              </div>

              <div
                className={`overflow-hidden transition-all duration-400 ease-in-out ${showTests
                  ? 'max-h-[5000px] opacity-100'
                  : 'max-h-0 opacity-0'
                  }`}
              >
                {dashboardUpcomingTests.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.97 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="rounded-[28px] bg-[#f5f9fc] dark:bg-sky-500/[0.03] border border-sky-100 dark:border-sky-500/10 shadow-2xs hover:shadow-md hover:shadow-sky-500/[0.04] p-8 sm:p-12 text-center transition-all duration-500 relative overflow-hidden group"
                  >
                    <div className="relative z-10 flex flex-col items-center">
                      <div className="w-12 h-12 rounded-2xl bg-sky-500/10 dark:bg-sky-400/15 flex items-center justify-center mb-3.5 border border-sky-200/50 dark:border-sky-500/20 shadow-xs group-hover:scale-110 transition-transform duration-500">
                        <HugeIcon name="Quiz04" size={24} className="text-sky-600 dark:text-sky-400" />
                      </div>
                      <h3 className="text-lg sm:text-xl font-bold text-sky-800 dark:text-sky-200 mb-1.5 tracking-tight">
                        No upcoming tests
                      </h3>
                      <p className="text-xs sm:text-sm text-sky-700/60 dark:text-sky-300/50 max-w-xs mx-auto font-medium leading-relaxed">
                        You’re clear for now. Add a test whenever a new date lands on your calendar.
                      </p>
                      <button
                        onClick={() => setShowAddTest(true)}
                        className="mt-6 inline-flex items-center gap-2 px-6 py-2.5 bg-[#ebf6b5] hover:bg-[#e0efa0] dark:bg-[#ebf6b5]/20 dark:hover:bg-[#ebf6b5]/30 text-sky-950 dark:text-[#ebf6b5] font-bold text-xs sm:text-sm rounded-xl border border-[#d4e88e] dark:border-[#d4e88e]/40 transition-all active:scale-95 shadow-xs cursor-pointer"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M12 4V20M20 12H4" />
                        </svg>
                        Add a Test
                      </button>
                    </div>
                  </motion.div>
                ) : (
                  <StatusGroupedTestList
                    tests={dashboardUpcomingTests}
                    onDeleteTest={deleteTest}
                    dashboardPreview
                  />
                )}
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const timeGreeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 6) return { text: 'Burning the Midnight Oil' };
    if (hour < 12) return { text: 'Good Morning' };
    if (hour < 17) return { text: 'Good Afternoon' };
    if (hour < 21) return { text: 'Good Evening' };
    return { text: 'Late Night Grind' };
  }, []);

  // ─── Facehash Joke Feature ──────────────────────────────────────────────────
  const [joke, setJoke] = useState<string | null>(null);
  const [jokeLoading, setJokeLoading] = useState(false);
  const jokeTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  // Bulk action handlers
  const handleBulkDelete = useCallback((ids: string[]) => {
    ids.forEach(id => {
      const homework = homeworks.find(hw => hw.id === id);
      if (homework) {
        deleteHomework(homework.id);
      }
    });
  }, [homeworks, deleteHomework]);

  const handleBulkMove = useCallback((ids: string[], targetClassId: string) => {
    ids.forEach(id => {
      const homework = homeworks.find(hw => hw.id === id);
      if (homework && homework.classId !== targetClassId) {
        // Update the homework class directly in the database
        updateHomework(id, { classId: targetClassId });
      }
    });
  }, [homeworks, updateHomework]);

  const fetchJoke = useCallback(async () => {
    if (jokeLoading) return;
    setJokeLoading(true);
    try {
      const res = await fetch('https://icanhazdadjoke.com/', {
        headers: { 'Accept': 'application/json' },
      });
      const data = await res.json();
      setJoke(data.joke);
      // Auto-dismiss after 8 seconds
      if (jokeTimeoutRef.current) clearTimeout(jokeTimeoutRef.current);
      jokeTimeoutRef.current = setTimeout(() => setJoke(null), 8000);
    } catch {
      setJoke("Why did the student eat their homework? Because their teacher said it was a piece of cake!");
      if (jokeTimeoutRef.current) clearTimeout(jokeTimeoutRef.current);
      jokeTimeoutRef.current = setTimeout(() => setJoke(null), 8000);
    } finally {
      setJokeLoading(false);
    }
  }, [jokeLoading]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (jokeTimeoutRef.current) clearTimeout(jokeTimeoutRef.current);
    };
  }, []);

  // ─── Facehash "Overdue Peek" Animation ──────────────────────────────────────
  const facehashRef = React.useRef<HTMLDivElement>(null);
  const overdueCardRef = React.useRef<HTMLDivElement>(null);
  const facehashControls = useAnimationControls();
  const [hasPlayedOverduePeek, setHasPlayedOverduePeek] = useState(false);
  const [showFrowny, setShowFrowny] = useState(false);
  const [showSleepy, setShowSleepy] = useState(false);
  const [showParty, setShowParty] = useState(false);
  const [showVictory, setShowVictory] = useState(false);
  const prevCompletionCountRef = React.useRef(0);
  const victoryAnimatingRef = React.useRef(false);

  // Initial appear animation (since we use controls instead of declarative animate)
  useEffect(() => {
    facehashControls.start({
      scale: 1,
      opacity: 1,
      transition: { delay: 0.1, type: 'spring', stiffness: 300, damping: 20 },
    });
  }, [facehashControls]);

  useEffect(() => {
    if (overdueCount <= 0 || hasPlayedOverduePeek) return;

    const timer = setTimeout(() => {
      if (!facehashRef.current || !overdueCardRef.current) return;
      // Don't interrupt if joke bubble is showing
      if (joke) return;

      const avatarRect = facehashRef.current.getBoundingClientRect();
      const cardRect = overdueCardRef.current.getBoundingClientRect();

      // Calculate where to move: center the avatar over the overdue card
      const deltaX = cardRect.left + cardRect.width / 2 - (avatarRect.left + avatarRect.width / 2);
      const deltaY = cardRect.top - avatarRect.top - 8; // hover just above the card

      setHasPlayedOverduePeek(true);

      // Animate: slide over slowly, show frowny, pause, slide back
      facehashControls.start({
        x: deltaX,
        y: deltaY,
        rotate: -8,
        transition: { type: 'spring', stiffness: 60, damping: 16 },
      }).then(() => {
        setShowFrowny(true);
        return new Promise(resolve => setTimeout(resolve, 4000));
      }).then(() => {
        setShowFrowny(false);
        return facehashControls.start({
          x: 0,
          y: 0,
          rotate: 0,
          transition: { type: 'spring', stiffness: 80, damping: 18 },
        });
      });
    }, 5000);

    return () => clearTimeout(timer);
  }, [overdueCount, hasPlayedOverduePeek, joke, facehashControls]);

  // ─── Facehash "Sleepy Head" — Persistent from 10:30 PM to 5 AM ─────────────
  const isLateNight = useMemo(() => {
    const now = new Date();
    const hour = now.getHours();
    const minutes = now.getMinutes();
    // 10:30 PM (22:30) through 4:59 AM
    return (hour === 22 && minutes >= 30) || hour >= 23 || hour < 5;
  }, []);

  // Settle into sleep on mount if late night
  useEffect(() => {
    if (!isLateNight) return;

    // If overdue homework exists, wait for overdue peek to finish first
    const delay = overdueCount > 0 ? 8000 : 500;
    const timer = setTimeout(() => {
      if (showFrowny || joke) return;
      setShowSleepy(true);

      // Settle into sleeping position and stay
      facehashControls.start({
        rotate: 20,
        y: 6,
        transition: { type: 'spring', stiffness: 30, damping: 12 },
      });
    }, delay);

    return () => clearTimeout(timer);
  }, [isLateNight, overdueCount, showFrowny, joke, facehashControls]);

  // ─── Facehash "Celebration Dance" Animation ───────────────────────────────────
  const playPartyAnimation = useCallback(() => {
    // Override other animations
    setShowParty(true);

    // Phase 1: Anticipation — crouch/squish down
    facehashControls.start({
      scaleX: 1.12,
      scaleY: 0.88,
      y: 4,
      rotate: 0,
      transition: { duration: 0.15, ease: 'easeIn' },
    }).then(() => {
      // Phase 2: Launch up with backflip!
      return facehashControls.start({
        scaleX: 0.9,
        scaleY: 1.1,
        y: -30,
        rotate: -360,
        transition: { duration: 0.5, ease: [0.2, 0.8, 0.2, 1] },
      });
    }).then(() => {
      // Phase 3: Hang at the top for a beat
      return new Promise(resolve => setTimeout(resolve, 80));
    }).then(() => {
      // Phase 4: Fall and land — overshoot squish
      return facehashControls.start({
        scaleX: 1.15,
        scaleY: 0.85,
        y: 3,
        rotate: 0,
        transition: { duration: 0.25, ease: 'easeIn' },
      });
    }).then(() => {
      // Phase 5: Settle bounce
      return facehashControls.start({
        scaleX: 1,
        scaleY: 1,
        y: -6,
        transition: { duration: 0.2, type: 'spring', stiffness: 400, damping: 12 },
      });
    }).then(() => {
      // Phase 6: Final settle
      return facehashControls.start({
        y: 0,
        transition: { duration: 0.3, type: 'spring', stiffness: 300, damping: 15 },
      });
    }).then(() => {
      setShowParty(false);
    });
  }, [facehashControls]);

  // ─── Facehash "100% Victory Lap" Animation ──────────────────────────────────
  const playVictoryAnimation = useCallback(() => {
    if (victoryAnimatingRef.current) return;
    victoryAnimatingRef.current = true;
    setShowVictory(true);
    setShowParty(false);

    // Phase 1: Majestic rise — slow float upward
    facehashControls.start({
      y: -10,
      scale: 1.06,
      rotate: 0,
      transition: { duration: 0.8, ease: [0.2, 0.8, 0.3, 1] },
    }).then(() => {
      // Phase 2: Hover with gentle bob — bask in glory
      return facehashControls.start({
        y: [-10, -13, -10, -12, -10],
        transition: { duration: 2.5, ease: 'easeInOut' },
      });
    }).then(() => {
      // Phase 3: Graceful descent
      setShowVictory(false);
      return facehashControls.start({
        y: 0,
        scale: 1,
        transition: { duration: 0.6, type: 'spring', stiffness: 100, damping: 14 },
      });
    }).then(() => {
      victoryAnimatingRef.current = false;
    });
  }, [facehashControls]);

  // Detect completion increase
  const completionCount = useMemo(() => homeworks.filter((hw: any) => hw.completed).length, [homeworks]);
  const totalHomeworkCount = homeworks.length;

  useEffect(() => {
    if (completionCount > prevCompletionCountRef.current && prevCompletionCountRef.current > 0) {
      // Check if this completion made it 100%
      if (totalHomeworkCount > 0 && completionCount === totalHomeworkCount) {
        playVictoryAnimation();
      } else {
        playPartyAnimation();
      }
    }
    prevCompletionCountRef.current = completionCount;
  }, [completionCount, totalHomeworkCount, playPartyAnimation, playVictoryAnimation]);

  // Completion rate for emoji reaction
  const completionRate = useMemo(() => {
    if (homeworks.length === 0) return 0;
    return Math.round((homeworks.filter((hw: any) => hw.completed).length / homeworks.length) * 100);
  }, [homeworks]);

  const completionEmoji = completionRate === 100 ? '🏆' : completionRate >= 80 ? '🔥' : completionRate >= 50 ? '💪' : completionRate > 0 ? '🌱' : '📝';
  const overdueEmoji = overdueCount === 0 ? '✅' : overdueCount <= 2 ? '😬' : '😰';

  // Compute the Facehash background color to use on the heading
  const FACEHASH_COLORS = [
    '#3b82f6', '#6366f1', '#8b5cf6', '#ec4899',
    '#f43f5e', '#f59e0b', '#10b981', '#14b8a6',
    '#06b6d4', '#0ea5e9', '#f97316', '#64748b',
  ];
  const facehashColor = useMemo(() => {
    const name = (full_name?.split(' ')[0]) || user?.email || 'Student';
    // Exact replica of facehash's stringHash
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      const char = name.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash &= hash;
    }
    hash = Math.abs(hash);
    return FACEHASH_COLORS[hash % FACEHASH_COLORS.length];
  }, [full_name, user?.email]);

  return (
    <div className="w-full flex-1 flex flex-col">
        {/* Render sections in user-defined order */}
        {sectionOrder.map(sectionId => renderSection(sectionId))}
    </div>
  );
}

export default MainAppContent;
