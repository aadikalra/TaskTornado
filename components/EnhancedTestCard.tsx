'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Test, Class } from '@/context/ClassContext';
import { getDueDateLabel, getDueDateIcon } from '@/lib/dateUtils';
import {
  Calendar,
  Clock,
  Trash2,
  BookOpen,
  Calculator,
  GraduationCap,
  FileText,
  Presentation,
  AlertTriangle,
  Target,
  Star,
  Circle,
  Zap,
  Brain,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

type EnhancedTestCardProps = {
  test: Test;
  classInfo?: Class;
  classIcon: any;
  onDelete: () => void;
  variant?: 'default' | 'compact';
};

const EnhancedTestCard = ({
  test,
  classInfo,
  classIcon: ClassIconComponent,
  onDelete,
  variant = 'default',
}: EnhancedTestCardProps) => {
  const [isHovered, setIsHovered] = useState(false);

  const formatTime = (testTime: string | null) => {
    if (!testTime) return '';
    return new Date(`2000-01-01T${testTime}`).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const DueIcon = getDueDateIcon(new Date(test.testDate));

  // Enhanced test type configuration with ALPHA/BETA support
  const testTypeConfig = useMemo(() => {
    const type = test.testType?.toLowerCase() || '';

    switch (type) {
      case 'alpha':
        return {
          icon: Target,
          label: 'ALPHA',
          color: 'text-purple-600 dark:text-purple-400',
          bgColor: 'bg-purple-50 dark:bg-purple-900/20',
          borderColor: 'border-purple-200 dark:border-purple-800/50',
          pillColor: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
        };
      case 'beta':
        return {
          icon: Zap,
          label: 'BETA',
          color: 'text-orange-600 dark:text-orange-400',
          bgColor: 'bg-orange-50 dark:bg-orange-900/20',
          borderColor: 'border-orange-200 dark:border-orange-800/50',
          pillColor: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
        };
      case 'exam':
      case 'final':
      case 'midterm':
        return {
          icon: GraduationCap,
          label: 'EXAM',
          color: 'text-red-600 dark:text-red-400',
          bgColor: 'bg-red-50 dark:bg-red-900/20',
          borderColor: 'border-red-200 dark:border-red-800/50',
          pillColor: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
        };
      case 'quiz':
        return {
          icon: FileText,
          label: 'QUIZ',
          color: 'text-blue-600 dark:text-blue-400',
          bgColor: 'bg-blue-50 dark:bg-blue-900/20',
          borderColor: 'border-blue-200 dark:border-blue-800/50',
          pillColor: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
        };
      case 'project':
        return {
          icon: Presentation,
          label: 'PROJECT',
          color: 'text-green-600 dark:text-green-400',
          bgColor: 'bg-green-50 dark:bg-green-900/20',
          borderColor: 'border-green-200 dark:border-green-800/50',
          pillColor: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
        };
      default:
        return {
          icon: BookOpen,
          label: 'TEST',
          color: 'text-gray-600 dark:text-gray-400',
          bgColor: 'bg-gray-50 dark:bg-gray-900/20',
          borderColor: 'border-gray-200 dark:border-gray-800/50',
          pillColor: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400',
        };
    }
  }, [test.testType]);

  const priorityConfig = useMemo(() => {
    // Just return basic styling since we're showing test type directly
    return {
      dot: 'bg-transparent',
      pill: 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700',
      icon: BookOpen,
      level: '',
    };
  }, []);

  const TestTypeIcon = testTypeConfig.icon;

  if (variant === 'compact') {
    return (
      <motion.div
        className="group relative rounded-xl border transition-all duration-200 bg-white/70 dark:bg-gray-900/40 border-gray-200/70 dark:border-gray-800/70 hover:ring-1 hover:ring-gray-200 dark:hover:ring-gray-700 hover:shadow-md"
        whileHover={{ scale: 1.02 }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="flex items-center gap-3 p-3">
          {/* Class Icon */}
          <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200/70 dark:border-gray-800/70 bg-gray-50/80 dark:bg-gray-800/40 flex-shrink-0">
            <ClassIconComponent className="h-4 w-4 text-gray-700 dark:text-gray-300" />
          </div>

          {/* Content */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-1">
              <TestTypeIcon className={`h-4 w-4 ${testTypeConfig.color}`} />
              <h4 className="truncate text-sm font-semibold text-gray-900 dark:text-gray-100">
                {test.title}
              </h4>
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${testTypeConfig.pillColor}`}>
                {test.testType}
              </span>
            </div>

            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
              <span className="inline-flex items-center gap-1">
                <DueIcon className="h-3 w-3" />
                {getDueDateLabel(new Date(test.testDate))}
              </span>

              {test.testTime && (
                <span className="inline-flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {formatTime(test.testTime)}
                </span>
              )}

              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${testTypeConfig.pillColor}`}>
                {test.testType}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 rounded-full text-gray-400 hover:text-red-500 hover:bg-red-500/10"
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </motion.div>
    );
  }

  // Default variant (enhanced version of the original)
  return (
    <motion.div
      className="group relative rounded-xl border transition-all duration-200 bg-white/70 dark:bg-gray-900/40 backdrop-blur border-gray-200/70 dark:border-gray-800/70 hover:ring-1 hover:ring-gray-200 dark:hover:ring-gray-700 hover:shadow-lg"
      whileHover={{ scale: 1.01 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-start gap-4 p-5">
        {/* Left: Icons */}
        <div className="flex flex-col items-center gap-3 pt-1">
          {/* Class Icon */}
          <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200/70 dark:border-gray-800/70 bg-gray-50/80 dark:bg-gray-800/40">
            <ClassIconComponent className="h-5 w-5 text-gray-700 dark:text-gray-300" />
          </div>

          {/* Test Type Badge */}
          <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${testTypeConfig.bgColor} ${testTypeConfig.borderColor}`}>
            <TestTypeIcon className={`h-4 w-4 ${testTypeConfig.color}`} />
          </div>
        </div>

        {/* Middle: Content */}
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="min-w-0">
              <div className="flex items-center gap-3 mb-2">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  {test.title}
                </h4>
                <span className={`px-2 py-1 rounded-full text-sm font-medium ${testTypeConfig.pillColor}`}>
                  {testTypeConfig.label}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2 text-sm mb-3">
                <span className="inline-flex items-center gap-1 rounded-full border border-gray-200/60 dark:border-gray-700/60 bg-white/60 dark:bg-gray-800/50 px-3 py-1 text-gray-700 dark:text-gray-300">
                  <ClassIconComponent className="h-4 w-4" />
                  {classInfo?.name || 'Unknown Class'}
                </span>

                <span className="inline-flex items-center gap-1 rounded-full border border-gray-200/60 dark:border-gray-700/60 bg-white/60 dark:bg-gray-800/50 px-3 py-1 text-gray-700 dark:text-gray-300">
                  <DueIcon className="h-4 w-4" />
                  {getDueDateLabel(new Date(test.testDate))}
                </span>

                {test.testTime && (
                  <span className="inline-flex items-center gap-1 rounded-full border border-gray-200/60 dark:border-gray-700/60 bg-white/60 dark:bg-gray-800/50 px-3 py-1 text-gray-700 dark:text-gray-300">
                    <Clock className="h-4 w-4" />
                    {formatTime(test.testTime)}
                  </span>
                )}

                {test.duration && (
                  <span className="inline-flex items-center gap-1 rounded-full border border-gray-200/60 dark:border-gray-700/60 bg-white/60 dark:bg-gray-800/50 px-3 py-1 text-gray-700 dark:text-gray-300">
                    <Clock className="h-4 w-4" />
                    {test.duration} min
                  </span>
                )}

                {typeof test.weight !== 'undefined' && test.weight !== null && (
                  <span className="inline-flex items-center gap-1 rounded-full border border-gray-200/60 dark:border-gray-700/60 bg-white/60 dark:bg-gray-800/50 px-3 py-1 text-gray-700 dark:text-gray-300">
                    <Brain className="h-4 w-4" />
                    {test.weight}% weight
                  </span>
                )}

                <span className={`px-2 py-1 rounded-full text-sm font-medium ${testTypeConfig.pillColor}`}>
                  {test.testType}
                </span>
              </div>

              {test.studyMaterials && test.studyMaterials.length > 0 && (
                <div className="rounded-lg border border-gray-200/50 dark:border-gray-700/50 bg-white/50 dark:bg-gray-800/40 px-3 py-2 text-sm text-gray-600 dark:text-gray-400 mb-3">
                  📚 <span className="font-medium">Study Materials:</span> {test.studyMaterials.slice(0, 3).join(', ')}
                  {test.studyMaterials.length > 3 && ` +${test.studyMaterials.length - 3} more`}
                </div>
              )}

              {test.description && (
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                  {test.description}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Right: actions */}
        <div className="self-start">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-full text-gray-400 hover:text-red-500 hover:bg-red-500/10 dark:text-gray-500 dark:hover:text-red-400 dark:hover:bg-red-500/15 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export default EnhancedTestCard;