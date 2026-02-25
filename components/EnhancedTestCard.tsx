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
  
  CheckCircle2
} from 'lucide-react';

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
        color: 'text-sky-600 dark:text-sky-400',
        border: 'border-l-sky-500',
        bg: 'bg-sky-100/40 dark:bg-sky-500/10',
        badge: 'bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300'
      },
      beta: {
        icon: Zap,
        label: 'BETA',
        color: 'text-sky-500 dark:text-sky-400',
        border: 'border-l-sky-400',
        bg: 'bg-sky-100/30 dark:bg-sky-500/[0.07]',
        badge: 'bg-[#ebf6b5]/60 text-sky-800 dark:bg-[#ebf6b5]/10 dark:text-sky-200'
      },
      final: {
        icon: GraduationCap,
        label: 'FINAL',
        color: 'text-sky-700 dark:text-sky-300',
        border: 'border-l-sky-600',
        bg: 'bg-sky-100/50 dark:bg-sky-500/15',
        badge: 'bg-sky-200/60 text-sky-800 dark:bg-sky-500/20 dark:text-sky-200'
      },
      exam: {
        icon: GraduationCap,
        label: 'EXAM',
        color: 'text-sky-700 dark:text-sky-300',
        border: 'border-l-sky-600',
        bg: 'bg-sky-100/50 dark:bg-sky-500/15',
        badge: 'bg-sky-200/60 text-sky-800 dark:bg-sky-500/20 dark:text-sky-200'
      },
      quiz: {
        icon: FileText,
        label: 'QUIZ',
        color: 'text-sky-500 dark:text-sky-400',
        border: 'border-l-sky-400',
        bg: 'bg-sky-100/30 dark:bg-sky-500/[0.07]',
        badge: 'bg-sky-100/60 text-sky-700 dark:bg-sky-500/10 dark:text-sky-300'
      },
      project: {
        icon: Presentation,
        label: 'PROJECT',
        color: 'text-sky-500 dark:text-sky-400',
        border: 'border-l-sky-400',
        bg: 'bg-[#ebf6b5]/20 dark:bg-[#ebf6b5]/5',
        badge: 'bg-[#ebf6b5]/50 text-sky-800 dark:bg-[#ebf6b5]/10 dark:text-sky-200'
      },
      default: {
        icon: BookOpen,
        label: 'TEST',
        color: 'text-sky-500/70 dark:text-sky-400/50',
        border: 'border-l-sky-300',
        bg: 'bg-sky-50/50 dark:bg-sky-500/5',
        badge: 'bg-sky-100/40 text-sky-600 dark:bg-sky-500/10 dark:text-sky-400'
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
        className={`group flex items-center gap-3 py-2 cursor-pointer transition-colors ${className || ''}`}
      >
        <div className={`
          shrink-0 flex items-center justify-center rounded-lg h-5 w-5
          ${testTypeConfig.bg}
          transition-colors duration-200
        `}>
          <TestTypeIcon className={`h-3 w-3 ${testTypeConfig.color}`} />
        </div>

        <div className="flex-1 min-w-0 flex items-center justify-between">
          <span className="text-sm font-medium text-sky-900 dark:text-sky-100 truncate group-hover:text-sky-700 dark:group-hover:text-white transition-colors">
            {test.title}
          </span>

          <div className="flex items-center gap-2 shrink-0 ml-3">
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold ${testTypeConfig.badge}`}>
              {testTypeConfig.label}
            </span>
            <span className={`text-xs tabular-nums ${dueDateLabel.includes('Today') ? 'text-sky-600 dark:text-sky-400 font-medium' : 'text-sky-600/35 dark:text-sky-400/35'}`}>
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
      className={`group relative bg-white/60 dark:bg-gray-900/40 backdrop-blur-md rounded-2xl border border-sky-100 dark:border-sky-500/10 shadow-sm hover:shadow-xl hover:shadow-sky-500/5 transition-all duration-300 ${className || ''}`}
    >
      {/* Background decoration */}
      <div className={`flex ${isCompact ? 'p-3 gap-3' : 'p-4 gap-4'} items-start relative`}>
        {/* Left Icon Section */}
        <div className={`
          shrink-0 flex items-center justify-center rounded-xl
          ${isCompact ? 'h-10 w-10' : 'h-12 w-12'}
          ${testTypeConfig.bg}
          border border-sky-100/50 dark:border-sky-500/10
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
            <h3 className={`font-semibold text-sky-900 dark:text-sky-100 truncate ${isCompact ? 'text-sm' : 'text-base'}`}>
              {test.title}
            </h3>
          </div>

          {/* Metadata Row */}
          <div className={`flex flex-wrap items-center gap-x-3 gap-y-1 text-sky-600/40 dark:text-sky-400/40 ${isCompact ? 'mt-1 text-xs' : 'mt-3 text-sm'}`}>
            {/* Date Info */}
            <div className={`flex items-center gap-1.5 ${dueDateLabel.includes('Today') || dueDateLabel.includes('Tomorrow') ? 'text-sky-600 dark:text-sky-400 font-medium' : ''}`}>
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
              flex items-center gap-1.5 rounded-lg px-2 py-1 font-mono font-medium
              ${isCompact ? 'text-xs' : 'text-sm'}
              bg-[#ebf6b5]/30 text-sky-800 dark:bg-[#ebf6b5]/10 dark:text-sky-200 border border-[#d4e88e]/30 dark:border-[#d4e88e]/10
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