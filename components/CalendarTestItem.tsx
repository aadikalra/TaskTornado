'use client';

import React from 'react';
import { motion } from 'framer-motion';
import type { Test, Class } from '@/context/ClassContext';
import { getDueDateLabel } from '@/lib/dateUtils';
import {
  Target,
  Zap,
  GraduationCap,
  FileText,
  Presentation,
  BookOpen,
  GripVertical,
  Calendar,
  Clock,
  AlertTriangle,
} from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

type CalendarTestItemProps = {
  test: Test;
  classInfo?: Class;
  classIcon: any;
  onClick?: () => void;
  handleDragStart?: (e: React.DragEvent | React.TouchEvent, itemId: string, itemType: 'homework' | 'test', sourceDate: Date) => void;
  handleDragEnd?: () => void;
};

const CalendarTestItem = ({
  test,
  classInfo,
  classIcon: ClassIconComponent,
  onClick,
  handleDragStart,
  handleDragEnd,
}: CalendarTestItemProps) => {
  // Test status styling (matching homework pattern)
  const getTestStatusStyling = () => {
    if (test.status === 'taken') {
      return {
        bgColor: 'bg-green-100 dark:bg-green-900/20',
        textColor: 'text-green-800 dark:text-green-300',
        lineThrough: 'line-through',
      };
    }
    // Default for 'upcoming' tests
    return {
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      textColor: 'text-blue-800 dark:text-blue-300',
      lineThrough: '',
    };
  };

  const statusStyle = getTestStatusStyling();

  // Test type configuration for icon only (no background colors since we're using status-based colors)
  const getTestTypeConfig = (testType: string | undefined) => {
    const type = testType?.toLowerCase() || '';

    switch (type) {
      case 'alpha':
        return {
          icon: Target,
          color: 'text-purple-600 dark:text-purple-400',
        };
      case 'beta':
        return {
          icon: Zap,
          color: 'text-orange-600 dark:text-orange-400',
        };
      case 'exam':
      case 'final':
      case 'midterm':
        return {
          icon: GraduationCap,
          color: 'text-red-600 dark:text-red-400',
        };
      case 'quiz':
        return {
          icon: FileText,
          color: 'text-blue-600 dark:text-blue-400',
        };
      case 'project':
        return {
          icon: Presentation,
          color: 'text-green-600 dark:text-green-400',
        };
      default:
        return {
          icon: BookOpen,
          color: 'text-gray-600 dark:text-gray-400',
        };
    }
  };

  const testTypeConfig = getTestTypeConfig(test.testType);
  const TestTypeIcon = testTypeConfig.icon;

  const formatTime = (testTime: string | null) => {
    if (!testTime) return '';
    return new Date(`2000-01-01T${testTime}`).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <motion.div
            className={`text-xs p-1 mb-1 rounded truncate cursor-pointer ${statusStyle.bgColor} ${statusStyle.textColor} ${statusStyle.lineThrough} hover:shadow-sm transition-all duration-150`}
            onClick={onClick}
            draggable={!!handleDragStart}
            onDragStart={handleDragStart ? (e) => {
              if ('dataTransfer' in e) {
                const dataTransfer = (e as any).dataTransfer;
                dataTransfer.effectAllowed = 'move';
                dataTransfer.setData('text/plain', test.id);
                // Create a proper drag event for handleDragStart
                const dragEvent = e as unknown as React.DragEvent;
                // Normalize the source date to start of day
                const normalizedSourceDate = new Date(new Date(test.testDate).getFullYear(), new Date(test.testDate).getMonth(), new Date(test.testDate).getDate());
                handleDragStart(dragEvent, test.id, 'test', normalizedSourceDate);
              }
            } : undefined}
            onDragEnd={handleDragEnd}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-center">
              <GripVertical className="w-2.5 h-2.5 mr-1 opacity-50 flex-shrink-0" />
              <span className="truncate flex-1">
                {classInfo?.name ? `${classInfo.name}: ` : ''}{test.title}
              </span>
              <TestTypeIcon className={`h-2.5 w-2.5 ${testTypeConfig.color} flex-shrink-0 ml-1`} />
            </div>
          </motion.div>
        </TooltipTrigger>
        <TooltipContent className="w-64 p-2">
          <div className="space-y-1">
            <h4 className="font-medium">{test.title}</h4>
            {classInfo && (
              <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                <ClassIconComponent className="h-3.5 w-3.5 mr-1.5 flex-shrink-0 text-blue-500 dark:text-blue-400" />
                <span className="truncate">{classInfo.name}</span>
              </div>
            )}
            <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
              <Calendar className="h-3.5 w-3.5 mr-1.5 flex-shrink-0 text-blue-500 dark:text-blue-400" />
              <span>{getDueDateLabel(new Date(test.testDate))}</span>
            </div>
            {test.testTime && (
              <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                <Clock className="h-3.5 w-3.5 mr-1.5 flex-shrink-0 text-gray-500 dark:text-gray-400" />
                <span>{formatTime(test.testTime)}</span>
              </div>
            )}
            {test.testType && (
              <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                <TestTypeIcon className={`h-3.5 w-3.5 mr-1.5 flex-shrink-0 ${testTypeConfig.color}`} />
                <span className="capitalize">{test.testType}</span>
              </div>
            )}
            {test.location && (
              <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                <AlertTriangle className="h-3.5 w-3.5 mr-1.5 flex-shrink-0 text-amber-500 dark:text-amber-400" />
                <span className="truncate">{test.location}</span>
              </div>
            )}
            {test.description && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{test.description}</p>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default CalendarTestItem;
