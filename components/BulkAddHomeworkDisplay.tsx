'use client';

import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Homework, Class } from '@/context/ClassContext';
import { getDueDateLabel, getDueDateIcon } from '@/lib/dateUtils';
import { getClassIcon } from '@/lib/icon-map';
import { HugeIcon } from '@/lib/huge-icon-map';
type BulkAddHomeworkDisplayProps = {
  homeworks: Homework[];
  classes: Class[];
  onClose?: () => void;
};

const BulkAddHomeworkDisplay = ({ 
  homeworks, 
  classes, 
  onClose 
}: BulkAddHomeworkDisplayProps) => {
  const [selectedHomework, setSelectedHomework] = useState<any>(null);

  const classesById = useMemo(() => {
    const map = new Map<string, Class>();
    classes.forEach((c) => map.set(c.id, c));
    return map;
  }, [classes]);

  const classColors = {
    red: { bg: 'bg-[#FCA5A5]/25 dark:bg-[#FCA5A5]/10', text: 'text-[#EF4444]', border: 'border-[#FCA5A5]/30' },
    blue: { bg: 'bg-[#93C5FD]/25 dark:bg-[#93C5FD]/10', text: 'text-[#3B82F6]', border: 'border-[#93C5FD]/30' },
    yellow: { bg: 'bg-[#FCD39D]/25 dark:bg-[#FCD39D]/10', text: 'text-[#F59E0B]', border: 'border-[#FCD39D]/30' },
    green: { bg: 'bg-[#86EFAC]/25 dark:bg-[#86EFAC]/10', text: 'text-[#10B981]', border: 'border-[#86EFAC]/30' },
    purple: { bg: 'bg-[#C4B5FD]/25 dark:bg-[#C4B5FD]/10', text: 'text-[#8B5CF6]', border: 'border-[#C4B5FD]/30' },
    pink: { bg: 'bg-[#F9A8D4]/25 dark:bg-[#F9A8D4]/10', text: 'text-[#EC4899]', border: 'border-[#F9A8D4]/30' },
    teal: { bg: 'bg-[#99F6E4]/25 dark:bg-[#99F6E4]/10', text: 'text-[#14B8A6]', border: 'border-[#99F6E4]/30' },
    gray: { bg: 'bg-[#CBD5E1]/25 dark:bg-[#CBD5E1]/10', text: 'text-[#64748B]', border: 'border-[#CBD5E1]/30' }
  };

  const getClassColorConfig = (colorName?: string) => {
    const normalized = (colorName || 'gray').toLowerCase() as keyof typeof classColors;
    return classColors[normalized] || classColors.gray;
  };

  const getPriorityIndicator = (priority: 'high' | 'medium' | 'low') => {
    switch (priority) {
      case 'high':
        return {
          iconName: 'Zap',
          color: 'text-red-500 dark:text-red-400',
          bg: 'bg-red-100 dark:bg-red-500/15',
          border: 'border-l-red-500',
          badge: 'bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-300'
        };
      case 'medium':
        return {
          iconName: 'AlertCircle',
          color: 'text-orange-500 dark:text-orange-400',
          bg: 'bg-orange-100 dark:bg-orange-500/12',
          border: 'border-l-orange-500',
          badge: 'bg-orange-100 text-orange-700 dark:bg-orange-500/12 dark:text-orange-300'
        };
      case 'low':
      default:
        return {
          iconName: 'MinusSignCircle',
          color: 'text-green-500/60 dark:text-green-400/50',
          bg: 'bg-green-100 dark:bg-green-500/10',
          border: 'border-l-green-500',
          badge: 'bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-300'
        };
    }
  };

  const HomeworkCard = ({ homework, index }: { homework: Homework; index: number }) => {
    const classInfo = classesById.get(homework.classId);
    const classIconName = classInfo ? getClassIcon(classInfo.icon) : 'BookOpen';
    const priorityConfig = getPriorityIndicator(homework.priority || 'medium');
    const cleanDateLabel = homework.dueDate
      ? new Date(homework.dueDate).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          timeZone: 'UTC'
        })
      : 'No date';
    const colorConfig = getClassColorConfig(classInfo?.color || undefined);

    return (
      <div
        className="group py-2 flex items-center justify-between cursor-pointer hover:bg-sky-500/[0.02] dark:hover:bg-sky-500/[0.02] px-1 transition-all duration-200 w-full"
        onClick={() => setSelectedHomework(homework)}
      >
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {/* Class Icon Squircle */}
          <div className={`
            shrink-0 flex items-center justify-center rounded-xl
            h-8.5 w-8.5
            ${colorConfig.bg}
            border ${colorConfig.border}
            transition-transform group-hover:scale-102 duration-200
          `}>
            <HugeIcon name={classIconName} className={`h-4 w-4 ${colorConfig.text}`} size={16} />
          </div>

          {/* Title */}
          <div className="flex-1 min-w-0">
            <h3 className="text-[13px] font-semibold text-sky-900 dark:text-sky-100 truncate group-hover:text-sky-600 dark:group-hover:text-sky-300 transition-colors leading-snug">
              {homework.title}
            </h3>
          </div>
        </div>

        {/* Right Side Metadata */}
        <div className="flex items-center gap-2 shrink-0 ml-3">
          {/* Date Pill */}
          <div className="flex items-center gap-1 px-2.5 py-1 text-[10px] text-sky-600/60 dark:text-sky-400/60 font-semibold bg-sky-50/50 dark:bg-gray-800/40 border border-sky-100/50 dark:border-sky-500/10 rounded-full leading-none">
            <HugeIcon name="Calendar02" className="h-3 w-3 text-sky-500/80" size={12} />
            <span>{cleanDateLabel}</span>
          </div>

          {/* Priority Pill */}
          <span className={`
            inline-flex items-center justify-center rounded-full px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider leading-none
            ${priorityConfig.badge}
          `}>
            {homework.priority || 'medium'}
          </span>
        </div>
      </div>
    );
  };

  if (homeworks.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4 w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-green-100 dark:bg-green-500/15">
            <HugeIcon name="CheckmarkCircle02" className="h-4 w-4 text-green-600 dark:text-green-400" size={16} />
          </div>
          <div>
            <h3 className="font-semibold text-sky-900 dark:text-sky-100">
              {homeworks.length} Assignment{homeworks.length > 1 ? 's' : ''} Added
            </h3>
            <p className="text-xs text-sky-600/50 dark:text-sky-400/50">
              Successfully added to your dashboard
            </p>
          </div>
        </div>
      </div>

      <div className="w-full divide-y divide-sky-100/50 dark:divide-sky-500/10 space-y-0">
        {homeworks.map((homework, index) => (
          <HomeworkCard key={homework.id} homework={homework} index={index} />
        ))}
      </div>

        {/* Detail Modal */}
        <AnimatePresence>
          {selectedHomework && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => setSelectedHomework(null)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ type: "spring", damping: 20 }}
                className="bg-white dark:bg-gray-900 rounded-2xl border border-sky-100 dark:border-sky-500/10 shadow-2xl max-w-lg w-full max-h-[80vh] overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Modal Header */}
                <div className="flex items-center justify-between p-6 border-b border-sky-100 dark:border-sky-500/10">
                  <div className="flex items-center gap-3">
                    {(() => {
                      const classInfo = classesById.get(selectedHomework.classId);
                      const classIconName = classInfo ? getClassIcon(classInfo.icon) : 'BookOpen';
                      const colorConfig = getClassColorConfig(classInfo?.color || undefined);
                      
                      return (
                        <>
                          <div className={`
                            flex items-center justify-center rounded-lg
                            h-10 w-10
                            ${colorConfig.bg}
                            border ${colorConfig.border}
                          `}>
                            <HugeIcon name={classIconName} className={`h-5 w-5 ${colorConfig.text}`} size={20} />
                          </div>
                          <div>
                            <h2 className="text-lg font-semibold text-sky-900 dark:text-sky-100">
                              {selectedHomework.title}
                            </h2>
                            {classInfo && (
                              <p className="text-sm text-sky-600/50 dark:text-sky-400/50">
                                {classInfo.name}
                              </p>
                            )}
                          </div>
                        </>
                      );
                    })()}
                  </div>
                  <button
                    onClick={() => setSelectedHomework(null)}
                    className="text-sky-600/50 hover:text-sky-600 dark:text-sky-400/50 dark:hover:text-sky-400 transition-colors"
                  >
                    <HugeIcon name="Cancel01" className="h-5 w-5" size={20} />
                  </button>
                </div>

                {/* Modal Content */}
                <div className="p-6 space-y-4">
                  {/* Description */}
                  {selectedHomework.description && (
                    <div>
                      <h3 className="text-sm font-semibold text-sky-900 dark:text-sky-100 mb-2">Description</h3>
                      <p className="text-sm text-sky-700 dark:text-sky-300">
                        {selectedHomework.description}
                      </p>
                    </div>
                  )}

                  {/* Details Grid */}
                  <div className="grid grid-cols-2 gap-4">
                    {/* Due Date */}
                    <div>
                      <h3 className="text-sm font-semibold text-sky-900 dark:text-sky-100 mb-2">Due Date</h3>
                      <div className="flex items-center gap-2 text-sm text-sky-700 dark:text-sky-300">
                        <HugeIcon name="Calendar02" className="h-4 w-4" size={16} />
                        {(() => {
                          const dueDate = new Date(selectedHomework.dueDate);
                          return dueDate.toLocaleDateString('en-US', {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric',
                            year: dueDate.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined,
                            timeZone: 'UTC'
                          });
                        })()}
                      </div>
                    </div>

                    {/* Priority */}
                    <div>
                      <h3 className="text-sm font-semibold text-sky-900 dark:text-sky-100 mb-2">Priority</h3>
                      <div className="flex items-center gap-2">
                        {(() => {
                          const priorityConfig = getPriorityIndicator(selectedHomework.priority || 'medium');
                          return (
                            <span className={`
                              inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide
                              ${priorityConfig.badge}
                            `}>
                              <HugeIcon name={priorityConfig.iconName} size={12} className={priorityConfig.color} />
                              {selectedHomework.priority || 'medium'}
                            </span>
                          );
                        })()}
                      </div>
                    </div>
                  </div>

                  {/* Links */}
                  {selectedHomework.links && selectedHomework.links.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold text-sky-900 dark:text-sky-100 mb-2 flex items-center gap-2">
                        <HugeIcon name="Link01" className="h-4 w-4" size={16} />
                        Links ({selectedHomework.links.length})
                      </h3>
                      <div className="space-y-2">
                        {selectedHomework.links.map((link: any, linkIndex: number) => (
                          <a
                            key={linkIndex}
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 p-2 rounded-lg bg-sky-50 dark:bg-sky-500/10 hover:bg-sky-100 dark:hover:bg-sky-500/20 transition-colors"
                          >
                            <HugeIcon name="Share03" className="h-4 w-4 text-sky-600 dark:text-sky-400" size={16} />
                            <span className="text-sm text-sky-700 dark:text-sky-300 truncate">
                              {link.title || link.url}
                            </span>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Status */}
                  <div className="flex items-center justify-between pt-4 border-t border-sky-100 dark:border-sky-500/10">
                    <div className="flex items-center gap-2 text-sm text-sky-600 dark:text-sky-400">
                      <HugeIcon name="CheckmarkCircle02" className="h-4 w-4" size={16} />
                      Status: {selectedHomework.completed ? 'Completed' : 'Pending'}
                    </div>
                    <div className="text-xs text-sky-500/50 dark:text-sky-400/50">
                      ID: {selectedHomework.id}
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
  );
};

export default BulkAddHomeworkDisplay;
