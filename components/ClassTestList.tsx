'use client';

import React, { useState, useMemo, useCallback, useEffect, memo } from 'react';
import { motion } from "framer-motion";
import type { Class as ClassType, Test as TestType, TestStatus } from "@/context/ClassContext";
import { getDueDateStatus, getDueDateLabel, getDueDateIcon } from "@/lib/dateUtils";
import {
  AlertCircle,
  AlertTriangle,
  Clock,
  Calendar,
  Trash2,
  BookOpen,
  Calculator,
  BookText,
  BookMarkedIcon,
  Video,
  TestTube2,
  BookType,
  Film,
  Microscope,
  GraduationCap,
  FileText,
  Presentation
} from "lucide-react";
import { Button } from "@/components/ui/button";
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
} from "@/components/ui/alert-dialog";

// Map of icon names to their corresponding Lucide components
type LucideIcon = React.ComponentType<React.SVGProps<SVGSVGElement>>;
const iconMap: Record<string, LucideIcon> = {
  BookOpen,
  BookText,
  BookMarked: BookMarkedIcon,
  BookType,
  AlertCircle,
  AlertTriangle,
  Clock,
  Calendar,
  Trash2,
  Calculator,
  Video,
  Film, // For Media Team
  TestTube2, // For Science 8
  Microscope, // Alternative for Science 8
  GraduationCap, // For tests
  FileText, // For quizzes
  Presentation, // For presentations
  // Add more icons here as they are used in your application
};

// Define a type for the test item to be used by the list
type TestItem = {
  id: string;
  text: string;
  completed: boolean;
  subtext: string;
  testType?: string;
  testDate: string;
  priority: string;
  status: TestStatus;
  score?: number | null;
  maxScore?: number | null;
  grade?: string | null;
  studyMaterials?: string[];
  onDelete?: () => void;
  testDateIcon: React.ReactNode;
  statusIcon: React.ReactNode;
};

type ClassTestListProps = {
  classItem: ClassType;
  tests: TestType[];
  onToggle: (id: string) => Promise<void>;
  onDeleteTest: (id: string) => Promise<void>;
  onDeleteClass: (id: string) => Promise<void>;
};

// Array of nice pastel hex colors, now including dark versions
const pastelColorPairs = [
  { light: '#FFD1DC', dark: '#8c7379' }, // Pastel Pink
  { light: '#B0E0E6', dark: '#6b888c' }, // Powder Blue
  { light: '#98FB98', dark: '#578f57' }, // Pale Green
  { light: '#F0E68C', dark: '#9c955a' }, // Khaki
  { light: '#E6E6FA', dark: '#8a8a96' }, // Lavender
  { light: '#ADD8E6', dark: '#6e8991' }, // Light Blue
  { light: '#F08080', dark: '#a15555' }, // Light Coral
  { light: '#FFA07A', dark: '#a1654d' }, // Light Salmon
  { light: '#FFB6C1', dark: '#a6777e' }, // Light Pink
  { light: '#AFEEEE', dark: '#6d9191' }, // Pale Turquoise
];

const ClassTestListComponent = ({
  classItem,
  tests,
  onToggle,
  onDeleteTest,
  onDeleteClass,
}: ClassTestListProps) => {
  // Use a state hook with a lazy initializer to pick a random color pair only once
  const [randomColorPair] = useState(() => {
    const randomIndex = Math.floor(Math.random() * pastelColorPairs.length);
    return pastelColorPairs[randomIndex];
  });

  // Use local state for optimistic UI updates
  const [localTests, setLocalTests] = useState(tests);

  // Sync local state with prop changes from the parent component
  useEffect(() => {
    setLocalTests(tests);
  }, [tests]);

  // Local handler for deleting test with optimistic update
  const onDeleteTestLocal = useCallback(async (id: string) => {
    const prevLocalTests = localTests;
    setLocalTests(prev => prev.filter(test => test.id !== id));

    try {
      await onDeleteTest(id);
    } catch (error) {
      console.error("Failed to delete test, reverting UI:", error);
      setLocalTests(prevLocalTests);
    }
  }, [localTests, onDeleteTest]);

  // Memoize the sorting and filtering of local tests
  const allTests = useMemo(() => {
    return [...localTests].sort((a, b) => {
      const dateA = new Date(a.testDate);
      const dateB = new Date(b.testDate);
      return dateA.getTime() - dateB.getTime();
    });
  }, [localTests]);

  // Get icon for test type
  const getTestTypeIcon = useCallback((testType?: string) => {
    // Handle undefined or null testType
    if (!testType) {
      return BookOpen;
    }

    switch (testType.toLowerCase()) {
      case 'exam':
        return GraduationCap;
      case 'quiz':
      case 'alpha':
        return FileText;
      case 'midterm':
        return BookMarkedIcon;
      case 'final':
      case 'beta':
        return GraduationCap;
      case 'project':
        return FileText;
      case 'presentation':
        return Presentation;
      default:
        return BookOpen;
    }
  }, []);

  // Get color for test status
  const getStatusConfig = useCallback((status: TestStatus) => {
    switch (status) {
      case 'completed':
        return {
          icon: Clock,
          color: 'text-green-500',
          bgColor: 'bg-green-100 dark:bg-green-900/20',
          borderColor: 'border-green-200 dark:border-green-800/50',
          textColor: 'text-green-900 dark:text-green-100',
        };
      case 'missed':
        return {
          icon: AlertTriangle,
          color: 'text-red-500',
          bgColor: 'bg-red-100 dark:bg-red-900/20',
          borderColor: 'border-red-200 dark:border-red-800/50',
          textColor: 'text-red-900 dark:text-red-100',
        };
      default: // upcoming
        return {
          icon: Calendar,
          color: 'text-blue-500',
          bgColor: 'bg-blue-100 dark:bg-blue-900/20',
          borderColor: 'border-blue-200 dark:border-blue-800/50',
          textColor: 'text-blue-900 dark:text-blue-100',
        };
    }
  }, []);

  // Handler for deleting a class
  const handleDeleteClass = useCallback(async () => {
    try {
      await onDeleteClass(classItem.id);
    } catch (error) {
      console.error("Failed to delete class:", error);
    }
  }, [classItem.id, onDeleteClass]);

  // Convert test to TestItem format
  const testToTestItem = useCallback((test: TestType): TestItem => {
    const testDate = new Date(test.testDate);
    const { icon: iconName, color: testDateColor } = getDueDateIcon(testDate);
    const statusConfig = getStatusConfig(test.status as TestStatus);

    const IconComponent = iconMap[iconName as keyof typeof iconMap] || iconMap.Calendar;
    const TestTypeIcon = getTestTypeIcon(test.testType);
    const StatusIcon = statusConfig.icon;

    return {
      id: test.id,
      text: test.title,
      completed: test.status === 'completed',
      subtext: `${getDueDateLabel(testDate)} • ${test.testType || 'Test'}`,
      testType: test.testType || 'Test',
      testDate: test.testDate,
      priority: test.priority || 'medium',
      status: test.status as TestStatus,
      score: test.score,
      maxScore: test.maxScore,
      grade: test.grade,
      studyMaterials: test.studyMaterials,
      testDateIcon: (
        <IconComponent
          className={`w-4 h-4 ${testDateColor} flex-shrink-0`}
          aria-label={test.status}
        />
      ),
      statusIcon: (
        <StatusIcon
          className={`w-4 h-4 ${statusConfig.color} flex-shrink-0`}
          aria-label={test.status}
        />
      ),
      onDelete: () => onDeleteTestLocal(test.id),
    };
  }, [onDeleteTestLocal, getTestTypeIcon, getStatusConfig]);

  // Memoize the converted test items
  const allTestItems = useMemo(() => allTests.map(testToTestItem), [allTests, testToTestItem]);

  // Use the icon from classItem, fallback to BookOpen if not found
  const ClassIconComponent = (iconMap[classItem.icon] as LucideIcon) || BookOpen;

  // Use the assigned class color from the DB, otherwise use a memoized random color
  const classColor =  randomColorPair.light;

  // Use the dark version of the random color for the icon, or a default dark color if no random pair is used
  const iconColor = randomColorPair.dark;

  return (
    <motion.div
      className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden border border-gray-100 dark:border-gray-700"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
    >
      <div className="px-5 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center shadow-sm"
              style={{
                backgroundColor: `${classColor}`,
              }}
            >
              <ClassIconComponent
                className="h-4 w-4"
                style={{ color: `${iconColor}` }}
                strokeWidth={1.5}
              />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">{classItem.name}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">{allTests.length} {allTests.length === 1 ? 'test' : 'tests'}</p>
            </div>
          </div>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="text-gray-400 hover:text-red-500 hover:bg-red-50 dark:text-gray-500 dark:hover:text-red-400 dark:hover:bg-red-900/20"
                onClick={(e) => e.stopPropagation()}
              >
                <Trash2 className="h-4 w-4" />
                <span className="sr-only">Delete class</span>
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-gray-900 dark:text-gray-100">Are you sure?</AlertDialogTitle>
                <AlertDialogDescription className="text-gray-600 dark:text-gray-400">
                  This will permanently delete the class &quot;{classItem.name}&quot; and all its tests.
                  This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700">Cancel</AlertDialogCancel>
                <AlertDialogAction
                  className="bg-red-600 hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700"
                  onClick={handleDeleteClass}
                >
                  Delete Class
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>

        <div className="p-4 space-y-3">
          {allTestItems.length > 0 ? (
            allTestItems.map((testItem) => (
              <TestCard key={testItem.id} testItem={testItem} />
            ))
          ) : (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <Calendar className="w-8 h-8 mx-auto mb-2 text-gray-300 dark:text-gray-600" />
              <p>No tests scheduled for this class</p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

// Individual test card component
const TestCard = ({ testItem }: { testItem: TestItem }) => {
  const [isHovered, setIsHovered] = useState(false);

  const getScoreDisplay = () => {
    if (testItem.score !== null && testItem.score !== undefined && testItem.maxScore) {
      return `${testItem.score}/${testItem.maxScore}${testItem.grade ? ` (${testItem.grade})` : ''}`;
    } else if (testItem.grade) {
      return testItem.grade;
    }
    return '';
  };

  return (
    <motion.div
      className={`p-4 rounded-lg border transition-all duration-200 ${
        testItem.completed
          ? 'bg-green-50 border-green-200 dark:bg-green-900/10 dark:border-green-800/50'
          : testItem.status === 'missed'
          ? 'bg-red-50 border-red-200 dark:bg-red-900/10 dark:border-red-800/50'
          : 'bg-gray-50 border-gray-200 dark:bg-gray-800/50 dark:border-gray-700/50'
      }`}
      whileHover={{ scale: 1.01 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          {/* Test type icon */}
          <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
            <GraduationCap className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-medium text-gray-900 dark:text-white truncate">
                {testItem.text}
              </h4>
              {testItem.statusIcon}
            </div>

            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-2">
              {testItem.testDateIcon}
              <span>{testItem.subtext}</span>
              {testItem.priority && (
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                  testItem.priority === 'high'
                    ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                    : testItem.priority === 'medium'
                    ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                    : 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400'
                }`}>
                  {testItem.priority}
                </span>
              )}
            </div>

            {/* Score display for completed tests */}
            {testItem.completed && getScoreDisplay() && (
              <div className="text-sm font-medium text-green-600 dark:text-green-400">
                Score: {getScoreDisplay()}
              </div>
            )}

            {/* Study materials preview */}
            {testItem.studyMaterials && testItem.studyMaterials.length > 0 && (
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                📚 {testItem.studyMaterials.slice(0, 2).join(', ')}
                {testItem.studyMaterials.length > 2 && ` +${testItem.studyMaterials.length - 2} more`}
              </div>
            )}
          </div>
        </div>

        {/* Delete button */}
        {isHovered && testItem.onDelete && (
          <Button
            variant="ghost"
            size="icon"
            className="text-gray-400 hover:text-red-500 hover:bg-red-50 dark:text-gray-500 dark:hover:text-red-400 dark:hover:bg-red-900/20 h-8 w-8"
            onClick={(e) => {
              e.stopPropagation();
              testItem.onDelete?.();
            }}
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        )}
      </div>
    </motion.div>
  );
};

export const ClassTestList = memo(ClassTestListComponent);
ClassTestList.displayName = 'ClassTestList';
