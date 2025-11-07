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
  Scale,
  Edit2,
  ExternalLink,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
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
  const [isHovered, setIsHovered] = useState(false);

  const formatTime = (testTime: string | null) => {
    if (!testTime) return '';
    return new Date(`2000-01-01T${testTime}`).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const dueDateLabel = getDueDateLabel(new Date(test.testDate), true);
  const DueIcon = getDueDateIcon(new Date(test.testDate), true);

  // Enhanced test type configuration with ALPHA/BETA support
  const testTypeConfig = useMemo(() => {
    const type = test.testType?.toLowerCase() || '';

    switch (type) {
      case 'alpha':
        return {
          icon: Target,
          label: 'ALPHA',
          color: 'text-purple-600 dark:text-purple-400',
          bgColor: 'bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/20',
          borderColor: 'border-purple-300 dark:border-purple-700',
          pillColor: 'bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-sm',
          iconBg: 'bg-purple-100 dark:bg-purple-900/40',
          cardGradient: 'from-purple-50/50 via-white to-white dark:from-purple-900/10 dark:via-gray-800 dark:to-gray-850',
          hoverBorder: 'hover:border-purple-400 dark:hover:border-purple-500',
        };
      case 'beta':
        return {
          icon: Zap,
          label: 'BETA',
          color: 'text-orange-600 dark:text-orange-400',
          bgColor: 'bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/30 dark:to-orange-800/20',
          borderColor: 'border-orange-300 dark:border-orange-700',
          pillColor: 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-sm',
          iconBg: 'bg-orange-100 dark:bg-orange-900/40',
          cardGradient: 'from-orange-50/50 via-white to-white dark:from-orange-900/10 dark:via-gray-800 dark:to-gray-850',
          hoverBorder: 'hover:border-orange-400 dark:hover:border-orange-500',
        };
      case 'final':
        return {
          icon: GraduationCap,
          label: 'FINAL',
          color: 'text-red-600 dark:text-red-400',
          bgColor: 'bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/30 dark:to-red-800/20',
          borderColor: 'border-red-300 dark:border-red-700',
          pillColor: 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-sm',
          iconBg: 'bg-red-100 dark:bg-red-900/40',
          cardGradient: 'from-red-50/50 via-white to-white dark:from-red-900/10 dark:via-gray-800 dark:to-gray-850',
          hoverBorder: 'hover:border-red-400 dark:hover:border-red-500',
        };
      case 'exam':
      case 'midterm':
        return {
          icon: GraduationCap,
          label: 'EXAM',
          color: 'text-red-600 dark:text-red-400',
          bgColor: 'bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/30 dark:to-red-800/20',
          borderColor: 'border-red-300 dark:border-red-700',
          pillColor: 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-sm',
          iconBg: 'bg-red-100 dark:bg-red-900/40',
          cardGradient: 'from-red-50/50 via-white to-white dark:from-red-900/10 dark:via-gray-800 dark:to-gray-850',
          hoverBorder: 'hover:border-red-400 dark:hover:border-red-500',
        };
      case 'quiz':
        return {
          icon: FileText,
          label: 'QUIZ',
          color: 'text-blue-600 dark:text-blue-400',
          bgColor: 'bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/20',
          borderColor: 'border-blue-300 dark:border-blue-700',
          pillColor: 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-sm',
          iconBg: 'bg-blue-100 dark:bg-blue-900/40',
          cardGradient: 'from-blue-50/50 via-white to-white dark:from-blue-900/10 dark:via-gray-800 dark:to-gray-850',
          hoverBorder: 'hover:border-blue-400 dark:hover:border-blue-500',
        };
      case 'project':
        return {
          icon: Presentation,
          label: 'PROJECT',
          color: 'text-green-600 dark:text-green-400',
          bgColor: 'bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/20',
          borderColor: 'border-green-300 dark:border-green-700',
          pillColor: 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-sm',
          iconBg: 'bg-green-100 dark:bg-green-900/40',
          cardGradient: 'from-green-50/50 via-white to-white dark:from-green-900/10 dark:via-gray-800 dark:to-gray-850',
          hoverBorder: 'hover:border-green-400 dark:hover:border-green-500',
        };
      default:
        return {
          icon: BookOpen,
          label: 'TEST',
          color: 'text-gray-600 dark:text-gray-400',
          bgColor: 'bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900/30 dark:to-gray-800/20',
          borderColor: 'border-gray-300 dark:border-gray-700',
          pillColor: 'bg-gradient-to-r from-gray-500 to-gray-600 text-white shadow-sm',
          iconBg: 'bg-gray-100 dark:bg-gray-900/40',
          cardGradient: 'from-gray-50/50 via-white to-white dark:from-gray-900/10 dark:via-gray-800 dark:to-gray-850',
          hoverBorder: 'hover:border-gray-400 dark:hover:border-gray-500',
        };
    }
  }, [test.testType]);

  const TestTypeIcon = testTypeConfig.icon;

  if (variant === 'compact') {
    return (
      <motion.div
        className={`group relative rounded-xl border-2 transition-all duration-300 bg-gradient-to-br ${testTypeConfig.cardGradient} ${testTypeConfig.borderColor} ${testTypeConfig.hoverBorder} hover:shadow-lg overflow-hidden`}
        whileHover={{ scale: 1.03, y: -2 }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Accent bar */}
        <div className={`absolute top-0 left-0 right-0 h-1 ${testTypeConfig.pillColor.split(' ')[0]}`} />
        
        <div className="flex items-start gap-2.5 p-3 pt-4">
          {/* Icon */}
          <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${testTypeConfig.iconBg} border ${testTypeConfig.borderColor} flex-shrink-0 shadow-sm`}>
            <TestTypeIcon className={`h-4 w-4 ${testTypeConfig.color}`} />
          </div>

          {/* Content */}
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2 mb-1.5">
              <h4 className="text-sm font-bold text-gray-900 dark:text-gray-100 line-clamp-2">
                {test.title}
              </h4>
              <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wide ${testTypeConfig.pillColor} whitespace-nowrap`}>
                {testTypeConfig.label}
              </span>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5 text-xs">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 font-medium text-gray-700 dark:text-gray-300">
                  <DueIcon className="h-3 w-3" />
                  {getDueDateLabel(new Date(test.testDate))}
                </span>
              </div>

              {classInfo && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-xs font-medium text-gray-700 dark:text-gray-300">
                  <ClassIconComponent className="h-3 w-3" />
                  {classInfo.name}
                </span>
              )}

              {(test.grade || test.score) && (
                <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/20 border border-green-200 dark:border-green-700 text-xs font-bold text-green-700 dark:text-green-300">
                  <Target className="h-3 w-3" />
                  {test.grade || `${test.score}/${test.maxScore}`}
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex-shrink-0 flex flex-col gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
            <Link href={`/tests/edit/${test.id}`} onClick={(e) => e.stopPropagation()}>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 rounded-lg text-gray-400 hover:text-[#264f84] dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                title="Edit test"
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
              title="Delete test"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </motion.div>
    );
  }

  // Default variant (enhanced version)
  return (
    <motion.div
      className={`group relative rounded-xl border-2 transition-all duration-300 bg-gradient-to-br ${testTypeConfig.cardGradient} ${testTypeConfig.borderColor} ${testTypeConfig.hoverBorder} hover:shadow-xl overflow-hidden`}
      whileHover={{ scale: 1.01, y: -4 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Accent bar */}
      <div className={`absolute top-0 left-0 right-0 h-1 ${testTypeConfig.pillColor.split(' ')[0]}`} />
      
      <div className="flex items-start gap-3 p-4 pt-5">
        {/* Left: Icons */}
        <div className="flex flex-col items-center gap-2">
          {/* Class Icon */}
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 shadow-sm">
            <ClassIconComponent className="h-5 w-5 text-gray-700 dark:text-gray-300" />
          </div>

          {/* Test Type Badge */}
          <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${testTypeConfig.iconBg} border-2 ${testTypeConfig.borderColor} shadow-sm`}>
            <TestTypeIcon className={`h-5 w-5 ${testTypeConfig.color}`} />
          </div>
        </div>

        {/* Middle: Content */}
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h4 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                  {test.title}
                </h4>
                <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wide ${testTypeConfig.pillColor}`}>
                  {testTypeConfig.label}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-1.5 mb-3">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 font-semibold text-xs text-gray-700 dark:text-gray-300 shadow-sm">
                  <ClassIconComponent className="h-3.5 w-3.5" />
                  {classInfo?.name || 'Unknown Class'}
                </span>

                <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 font-semibold text-xs text-gray-700 dark:text-gray-300 shadow-sm">
                  <DueIcon className="h-3.5 w-3.5" />
                  {getDueDateLabel(new Date(test.testDate))}
                </span>

                {test.duration && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 font-semibold text-xs text-gray-700 dark:text-gray-300 shadow-sm">
                    <Clock className="h-3.5 w-3.5" />
                    {test.duration} min
                  </span>
                )}

                {test.weight && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-900/30 dark:to-yellow-900/20 border-2 border-amber-200 dark:border-amber-700 font-bold text-xs text-amber-700 dark:text-amber-300 shadow-sm">
                    <Scale className="h-3.5 w-3.5" />
                    {test.weight}%
                  </span>
                )}

                {(test.grade || test.score) && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/20 border-2 border-green-200 dark:border-green-700 font-bold text-xs text-green-700 dark:text-green-300 shadow-sm">
                    <Target className="h-3.5 w-3.5" />
                    {test.grade ? `${test.grade}` : `${test.score}/${test.maxScore}`}
                    {test.grade && test.score && ` (${test.score}/${test.maxScore})`}
                  </span>
                )}
              </div>

              {test.studyMaterials && test.studyMaterials.length > 0 && (
                <div className="rounded-lg border-2 border-blue-200 dark:border-blue-700 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/10 px-3 py-2 text-xs mb-3 shadow-sm">
                  <div className="flex items-start gap-1.5">
                    <BookOpen className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="font-bold text-blue-900 dark:text-blue-100">Study Materials: </span>
                      <span className="text-blue-700 dark:text-blue-300">
                        {test.studyMaterials.slice(0, 3).join(', ')}
                        {test.studyMaterials.length > 3 && ` +${test.studyMaterials.length - 3} more`}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {test.description && (
                <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed bg-gray-50 dark:bg-gray-800/50 rounded-lg px-3 py-2 border border-gray-200 dark:border-gray-700">
                  {test.description}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="self-start flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Link href={`/tests/edit/${test.id}`} onClick={(e) => e.stopPropagation()}>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-lg text-gray-400 hover:text-[#264f84] dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors shadow-sm hover:shadow"
              title="Edit test"
            >
              <Edit2 className="h-3.5 w-3.5" />
            </Button>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors shadow-sm hover:shadow"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            title="Delete test"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export default EnhancedTestCard;