'use client';

import React, { useState, useMemo, useCallback, memo } from 'react';
import { motion } from "framer-motion";
import type { Class as ClassType, Test as TestType } from "@/context/ClassContext";
import { getDueDateStatus, getDueDateLabel, getDueDateIcon } from "@/lib/dateUtils";
import {
  AlertCircle,
  AlertTriangle,
  Clock,
  Calendar,
  Trash2,
  BookOpen,
  GraduationCap,
  FileText,
  BookMarkedIcon,
  Presentation
} from "lucide-react";
import { Button } from "@/components/ui/button";

type CompactTestListProps = {
  tests: TestType[];
  classes: ClassType[];
  onToggle: (id: string) => Promise<void>;
  onDeleteTest: (id: string) => Promise<void>;
};

const CompactTestList = ({
  tests,
  classes,
  onToggle,
  onDeleteTest,
}: CompactTestListProps) => {
  // Get icon for test type
  const getTestTypeIcon = useCallback((testType?: string) => {
    if (!testType) return BookOpen;

    switch (testType.toLowerCase()) {
      case 'exam':
      case 'final':
      case 'beta':
        return GraduationCap;
      case 'quiz':
      case 'alpha':
        return FileText;
      case 'midterm':
        return BookMarkedIcon;
      case 'project':
        return FileText;
      case 'presentation':
        return Presentation;
      default:
        return BookOpen;
    }
  }, []);

  // Get color for test status
  const getStatusConfig = useCallback((status: string) => {
    switch (status) {
      case 'taken':
        return {
          icon: Clock,
          color: 'text-green-500',
          bgColor: 'bg-green-100 dark:bg-green-900/20',
          borderColor: 'border-green-200 dark:border-green-800/50',
          textColor: 'text-green-900 dark:text-green-100',
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

  // Icon mapping for class icons
  const iconMap: Record<string, any> = {
    BookOpen, GraduationCap, FileText, BookMarkedIcon, Presentation,
    AlertCircle, AlertTriangle, Clock, Calendar, Trash2,
    Calculator: BookOpen, Code: BookOpen, Atom: BookOpen, Award: BookOpen,
    Brain: BookOpen, Briefcase: BookOpen, Compass: BookOpen, Cpu: BookOpen,
    Database: BookOpen, Film: BookOpen, Gamepad2: BookOpen, GitBranch: BookOpen,
    Globe2: BookOpen, History: BookOpen, Image: BookOpen, Laptop: BookOpen,
    Lightbulb: BookOpen, Map: BookOpen, Mic2: BookOpen, Music: BookOpen,
    Palette: BookOpen, Pen: BookOpen, PieChart: BookOpen, Rocket: BookOpen,
    Search: BookOpen, Settings: BookOpen, Shield: BookOpen, Smartphone: BookOpen,
    Speaker: BookOpen, Target: BookOpen, Terminal: BookOpen, TrendingUp: BookOpen,
    Type: BookOpen, Video: BookOpen, Wifi: BookOpen, Zap: BookOpen,
    BookKey: BookOpen, BookLock: BookOpen, BookPlus: BookOpen, BookType: BookOpen,
    BookUp2: BookOpen, BookUser: BookOpen, BookX: BookOpen, BrainCircuit: BookOpen,
    BrainCog: BookOpen, CalendarCheck: Calendar, CalendarDays: Calendar,
    CalendarHeart: Calendar, CalendarPlus: Calendar, Camera: BookOpen,
    Cast: BookOpen, CheckSquare: BookOpen, Cloud: BookOpen, Code2: BookOpen,
    CreditCard: BookOpen, Crop: BookOpen, Crosshair: BookOpen, DollarSign: BookOpen,
    Download: BookOpen, Edit: BookOpen, FileArchive: FileText, FileAudio: BookOpen,
    FileCode: BookOpen, FileJson: BookOpen, FileVideo: BookOpen, FileVolume2: BookOpen,
    FileWarning: FileText, Filter: BookOpen, Flag: BookOpen, Folder: BookOpen,
    FolderOpen: BookOpen, Gift: BookOpen, GitCommit: BookOpen, Github: BookOpen,
    Gitlab: BookOpen, GitPullRequest: BookOpen, GitCompare: BookOpen, GitFork: BookOpen,
    GitMerge: BookOpen, GitPullRequestClosed: BookOpen, Gavel: BookOpen,
    GitGraph: BookOpen, GitCommitVertical: BookOpen, GitCompareArrows: BookOpen,
    GitBranchPlus: BookOpen
  };

  // Convert test to compact format
  const testToCompactItem = useCallback((test: TestType) => {
    const testDate = new Date(test.testDate);
    const IconComponent = getDueDateIcon(testDate);
    const statusConfig = getStatusConfig(test.status);
    const classInfo = classes.find(c => c.id === test.classId);

    const TestTypeIcon = getTestTypeIcon(test.testType);
    const StatusIcon = statusConfig.icon;

    return {
      id: test.id,
      title: test.title,
      className: classInfo?.name || 'Unknown Class',
      classIcon: classInfo?.icon || 'BookOpen',
      testType: test.testType || 'Test',
      testDate: test.testDate,
      status: test.status,
      priority: test.priority || 'medium',
      score: test.score,
      maxScore: test.maxScore,
      grade: test.grade,
      studyMaterials: test.studyMaterials,
      formattedDate: getDueDateLabel(testDate),
      testDateIcon: IconComponent,
      testDateColor: 'text-gray-500',
      statusConfig,
      TestTypeIcon: IconComponent,
      StatusIcon,
      onDelete: () => onDeleteTest(test.id),
    };
  }, [classes, getTestTypeIcon, getStatusConfig, onDeleteTest]);

  // Memoize the converted test items
  const allTestItems = useMemo(() => tests.map(testToCompactItem), [tests, testToCompactItem]);

  // Color mapping for class icons
  const classColors = [
    '#FFD1DC', '#B0E0E6', '#98FB98', '#F0E68C', '#E6E6FA',
    '#ADD8E6', '#F08080', '#FFA07A', '#FFB6C1', '#AFEEEE'
  ];

  const getClassColor = useCallback((index: number) => {
    return classColors[index % classColors.length];
  }, []);

  return (
    <div className="space-y-2">
      {allTestItems.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-8 text-center shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-50 dark:bg-blue-900/20 mb-4">
            <Calendar className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No tests scheduled</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">
            Start by adding your first test to keep track of your exam schedule
          </p>
        </div>
      ) : (
        <div className="grid gap-2">
          {allTestItems.map((testItem, index) => {
            const ClassIconComponent = iconMap[testItem.classIcon] || BookOpen;
            const classColor = getClassColor(classes.findIndex(c => c.id === tests[index]?.classId) || 0);

            return (
              <CompactTestCard
                key={testItem.id}
                testItem={testItem}
                classIcon={ClassIconComponent}
                classColor={classColor}
                onToggle={() => onToggle(testItem.id)}
                onDelete={testItem.onDelete}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};

// Individual compact test card component
const CompactTestCard = ({
  testItem,
  classIcon: ClassIconComponent,
  classColor,
  onToggle,
  onDelete
}: {
  testItem: any;
  classIcon: any;
  classColor: string;
  onToggle: () => void;
  onDelete: () => void;
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const getScoreDisplay = () => {
    if (testItem.score !== null && testItem.score !== undefined && testItem.maxScore) {
      return `${testItem.score}/${testItem.maxScore}${testItem.grade ? ` (${testItem.grade})` : ''}`;
    } else if (testItem.grade) {
      return testItem.grade;
    }
    return '';
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      case 'medium': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'low': return 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400';
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  return (
    <motion.div
      className={`p-3 rounded-lg border transition-all duration-200 cursor-pointer ${
        testItem.status === 'completed'
          ? 'bg-green-50 border-green-200 dark:bg-green-900/10 dark:border-green-800/50'
          : testItem.status === 'missed'
          ? 'bg-red-50 border-red-200 dark:bg-red-900/10 dark:border-red-800/50'
          : 'bg-white border-gray-200 dark:bg-gray-800 dark:border-gray-700'
      }`}
      whileHover={{ scale: 1.01, y: -1 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onToggle}
    >
      <div className="flex items-center gap-3">
        {/* Class Icon */}
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: classColor }}
        >
          <ClassIconComponent className="h-4 w-4 text-white" strokeWidth={1.5} />
        </div>

        {/* Test Type Icon */}
        <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
          <testItem.TestTypeIcon className="w-3 h-3 text-blue-600 dark:text-blue-400" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-medium text-gray-900 dark:text-white text-sm truncate">
              {testItem.title}
            </h4>
            <testItem.StatusIcon className={`w-3 h-3 ${testItem.statusConfig.color} flex-shrink-0`} />
            <span className={`px-1.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(testItem.priority)}`}>
              {testItem.priority}
            </span>
          </div>

          <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
            <span className="font-medium">{testItem.className}</span>
            <span>•</span>
            <span>{testItem.testType}</span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Calendar className={`w-3 h-3 ${testItem.testDateColor}`} />
              {testItem.formattedDate}
            </span>
            {testItem.status === 'completed' && getScoreDisplay() && (
              <>
                <span>•</span>
                <span className="font-medium text-green-600 dark:text-green-400">
                  {getScoreDisplay()}
                </span>
              </>
            )}
          </div>

          {/* Study materials */}
          {testItem.studyMaterials && testItem.studyMaterials.length > 0 && (
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              📚 {testItem.studyMaterials.slice(0, 2).join(', ')}
              {testItem.studyMaterials.length > 2 && ` +${testItem.studyMaterials.length - 2} more`}
            </div>
          )}
        </div>

        {/* Delete button */}
        {isHovered && (
          <Button
            variant="ghost"
            size="icon"
            className="text-gray-400 hover:text-red-500 hover:bg-red-50 dark:text-gray-500 dark:hover:text-red-400 dark:hover:bg-red-900/20 h-7 w-7"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        )}
      </div>
    </motion.div>
  );
};

export default CompactTestList;
