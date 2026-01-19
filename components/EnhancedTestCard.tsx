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
  Clock,
  CheckCircle2
} from 'lucide-react';
import { Button } from '@/components/animate-ui/components/buttons/button';
import Link from 'next/link';

type EnhancedTestCardProps = {
  test: Test;
  classInfo?: Class;
  classIcon: any;
  variant?: 'default' | 'compact' | 'list-item';
  layoutId?: string;
  onClick?: () => void;
  className?: string;
};

const EnhancedTestCard = ({
  test,
  classInfo,
  classIcon: ClassIconComponent,
  variant = 'default',
  layoutId,
  onClick,
  className,
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

  if (variant === 'list-item') {
    return (
      <motion.div
        layoutId={layoutId}
        onClick={onClick}
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        className={`group flex items-center gap-3 py-1 cursor-pointer ${className || ''}`}
      >
        <div className={`
          shrink-0 flex items-center justify-center rounded-lg h-5 w-5
          ${testTypeConfig.bg}
          border border-transparent group-hover:border-gray-200 dark:group-hover:border-gray-700
          transition-colors duration-200
        `}>
          <TestTypeIcon className={`h-3 w-3 ${testTypeConfig.color}`} />
        </div>

        <div className="flex-1 min-w-0 flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-200 truncate group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
            {test.title}
          </span>

          <div className="flex items-center gap-2">
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${testTypeConfig.badge}`}>
              {testTypeConfig.label}
            </span>
            <span className={`text-xs ${dueDateLabel.includes('Today') ? 'text-amber-600 dark:text-amber-500 font-medium' : 'text-gray-400 dark:text-gray-500'}`}>
              {dueDateLabel}
            </span>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      layoutId={layoutId}
      onClick={onClick}
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -5 }}
      transition={{ duration: 0.2 }}
      className={`group relative bg-white/95 dark:bg-zinc-900/80 backdrop-blur-md rounded-[24px] border border-gray-200/80 dark:border-white/5 shadow-sm hover:shadow-xl transition-all duration-300 ${className || ''}`}
    >
      {/* Background decoration */}
      <div className={`flex ${isCompact ? 'p-3 gap-3' : 'p-4 gap-4'} items-start relative`}>
        {/* Left Icon Section */}
        <div className={`
          shrink-0 flex items-center justify-center rounded-xl
          ${isCompact ? 'h-10 w-10' : 'h-12 w-12'}
          ${testTypeConfig.bg}
          border border-black/5 dark:border-white/5
        `}>
          <ClassIconComponent className={`
            ${isCompact ? 'h-5 w-5' : 'h-6 w-6'}
            ${testTypeConfig.color}
          `} />
        </div>

        {/* Main Content Area */}
        <div className="flex-1 min-w-0 flex flex-col justify-between">
          {/* Header: Title Only */}
          <div>
            <h3 className={`font-semibold text-gray-900 dark:text-gray-100 truncate ${isCompact ? 'text-sm' : 'text-base'}`}>
              {test.title}
            </h3>
          </div>

          {/* Metadata Row */}
          <div className={`flex flex-wrap items-center gap-x-3 gap-y-1 text-gray-500 dark:text-gray-400 ${isCompact ? 'mt-1 text-xs' : 'mt-3 text-sm'}`}>
            {/* Date Info */}
            <div className={`flex items-center gap-1.5 ${dueDateLabel.includes('Today') || dueDateLabel.includes('Tomorrow') ? 'text-amber-600 dark:text-amber-500 font-medium' : ''}`}>
              <DueIcon className="h-3.5 w-3.5" />
              <span>{dueDateLabel}</span>
            </div>
          </div>
        </div>

        {/* Right Side: Type Badge and Score */}
        <div className="shrink-0 flex flex-col items-end justify-start gap-2">
          {/* Type Badge */}
          <span className={`
            shrink-0 inline-flex items-center justify-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide
            ${testTypeConfig.badge}
          `}>
            {testTypeConfig.label}
          </span>

          {/* Score Display */}
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
        </div>
      </div>
    </motion.div>
  );
};

export default EnhancedTestCard;