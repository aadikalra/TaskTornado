'use client';

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import type { Test, Class } from '@/context/ClassContext';
import { getDueDateLabel, getDueDateIcon } from '@/lib/dateUtils';
import {
  BookOpen,
  GraduationCap,
  FileText,
  Presentation,
  Target,
  Zap,
  Edit2,
  Trash2,
  Clock,
  CheckCircle2
} from 'lucide-react';
import { Button } from '@/components/animate-ui/components/buttons/button';
import Link from 'next/link';

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
  
  const isCompact = variant === 'compact';

  const testTypeConfig = useMemo(() => {
    const type = test.testType?.toLowerCase() || '';
    
    const configs = {
      alpha: {
        icon: Target,
        label: 'ALPHA',
        color: 'text-purple-600 dark:text-purple-400',
        border: 'border-l-purple-500',
        bg: 'bg-purple-50/50 dark:bg-purple-900/10',
        badge: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300'
      },
      beta: {
        icon: Zap,
        label: 'BETA',
        color: 'text-orange-600 dark:text-orange-400',
        border: 'border-l-orange-500',
        bg: 'bg-orange-50/50 dark:bg-orange-900/10',
        badge: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300'
      },
      final: {
        icon: GraduationCap,
        label: 'FINAL',
        color: 'text-red-600 dark:text-red-400',
        border: 'border-l-red-500',
        bg: 'bg-red-50/50 dark:bg-red-900/10',
        badge: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
      },
      exam: {
        icon: GraduationCap,
        label: 'EXAM',
        color: 'text-red-600 dark:text-red-400',
        border: 'border-l-red-500',
        bg: 'bg-red-50/50 dark:bg-red-900/10',
        badge: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
      },
      quiz: {
        icon: FileText,
        label: 'QUIZ',
        color: 'text-blue-600 dark:text-blue-400',
        border: 'border-l-blue-500',
        bg: 'bg-blue-50/50 dark:bg-blue-900/10',
        badge: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
      },
      project: {
        icon: Presentation,
        label: 'PROJECT',
        color: 'text-emerald-600 dark:text-emerald-400',
        border: 'border-l-emerald-500',
        bg: 'bg-emerald-50/50 dark:bg-emerald-900/10',
        badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
      },
      default: {
        icon: BookOpen,
        label: 'TEST',
        color: 'text-gray-600 dark:text-gray-400',
        border: 'border-l-gray-500',
        bg: 'bg-gray-50/50 dark:bg-gray-800/50',
        badge: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
      }
    };

    // @ts-ignore - Dynamic access
    return configs[type] || configs.default;
  }, [test.testType]);

  const TestTypeIcon = testTypeConfig.icon;
  const DueIcon = getDueDateIcon(new Date(test.testDate), true);
  const dueDateLabel = getDueDateLabel(new Date(test.testDate), true);

  // Render logic for grade/score
  const hasScore = test.grade || (test.score !== null && test.maxScore !== null);
  const displayScore = test.grade || (test.score !== null ? `${test.score}/${test.maxScore}` : '');

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -2, scale: 1.005 }}
      className={`
        group relative w-full overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-all
        dark:border-gray-800 dark:bg-gray-900 dark:shadow-none hover:shadow-md
      `}
    >
      <div className={`flex ${isCompact ? 'p-3 gap-3' : 'p-5 gap-4'} items-start`}>
        {/* Left Icon Section */}
        <div className={`
          shrink-0 flex items-center justify-center rounded-lg
          ${isCompact ? 'h-10 w-10' : 'h-12 w-12'}
          ${testTypeConfig.bg}
        `}>
          <TestTypeIcon className={`
            ${isCompact ? 'h-5 w-5' : 'h-6 w-6'}
            ${testTypeConfig.color}
          `} />
        </div>

        {/* Main Content Area */}
        <div className="flex-1 min-w-0 flex flex-col justify-between">
          {/* Header: Title & Type */}
          <div className="flex items-start justify-between gap-2">
            <h3 className={`font-semibold text-gray-900 dark:text-gray-100 truncate ${isCompact ? 'text-sm' : 'text-base'}`}>
              {test.title}
            </h3>
            <span className={`
              shrink-0 inline-flex items-center justify-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide
              ${testTypeConfig.badge}
            `}>
              {testTypeConfig.label}
            </span>
          </div>

          {/* Metadata Row */}
          <div className={`flex flex-wrap items-center gap-x-3 gap-y-1 text-gray-500 dark:text-gray-400 ${isCompact ? 'mt-1 text-xs' : 'mt-3 text-sm'}`}>
            
            {/* Class Info */}
            {classInfo && (
              <div className="flex items-center gap-1.5 transition-colors hover:text-gray-700 dark:hover:text-gray-200">
                <ClassIconComponent className="h-3.5 w-3.5" />
                <span className="font-medium truncate max-w-[100px]">{classInfo.name}</span>
              </div>
            )}

            <div className="h-1 w-1 rounded-full bg-gray-300 dark:bg-gray-700" />

            {/* Date Info */}
            <div className={`flex items-center gap-1.5 ${dueDateLabel.includes('Today') || dueDateLabel.includes('Tomorrow') ? 'text-amber-600 dark:text-amber-500 font-medium' : ''}`}>
              <DueIcon className="h-3.5 w-3.5" />
              <span>{dueDateLabel}</span>
            </div>
          </div>
        </div>

        {/* Right Side: Score or Hover Actions */}
        <div className="shrink-0 flex flex-col items-end justify-start gap-2">
          
          {/* Score Display (Visible always if exists) */}
          {hasScore ? (
            <div className={`
              flex items-center gap-1.5 rounded-md px-2 py-1 font-mono font-medium
              ${isCompact ? 'text-xs' : 'text-sm'}
              bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400 border border-green-100 dark:border-green-900/30
            `}>
              <CheckCircle2 className="h-3 w-3" />
              {displayScore}
            </div>
          ) : null}

          {/* Action Buttons (Absolute on mobile, hover on desktop) */}
          <div className={`
            flex items-center gap-1 transition-all duration-200
            lg:opacity-0 lg:translate-x-2 group-hover:opacity-100 group-hover:translate-x-0
          `}>
            <Link href={`/tests/edit/${test.id}`} onClick={(e) => e.stopPropagation()}>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 rounded-lg text-gray-400 hover:text-[#264f84] dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <Edit2 className="h-3.5 w-3.5" />
              </Button>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default EnhancedTestCard;