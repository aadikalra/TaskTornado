'use client';

import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Homework, Class } from '@/context/ClassContext';
import { getDueDateLabel, getDueDateIcon } from '@/lib/dateUtils';
import { getClassIcon } from '@/lib/icon-map';
import {
  BookOpen,
  Calendar,
  Clock,
  ExternalLink,
  CheckCircle2,
  Flame,
  AlertTriangle,
  Minus,
  X,
  Link,
} from 'lucide-react';

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

  const getPriorityIndicator = (priority: 'high' | 'medium' | 'low') => {
    switch (priority) {
      case 'high':
        return {
          icon: Flame,
          color: 'text-red-500 dark:text-red-400',
          bg: 'bg-red-100 dark:bg-red-500/15',
          border: 'border-l-red-500',
          badge: 'bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-300'
        };
      case 'medium':
        return {
          icon: AlertTriangle,
          color: 'text-orange-500 dark:text-orange-400',
          bg: 'bg-orange-100 dark:bg-orange-500/12',
          border: 'border-l-orange-500',
          badge: 'bg-orange-100 text-orange-700 dark:bg-orange-500/12 dark:text-orange-300'
        };
      case 'low':
      default:
        return {
          icon: Minus,
          color: 'text-green-500/60 dark:text-green-400/50',
          bg: 'bg-green-100 dark:bg-green-500/10',
          border: 'border-l-green-500',
          badge: 'bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-300'
        };
    }
  };

  const HomeworkCard = ({ homework, index }: { homework: Homework; index: number }) => {
    const classInfo = classesById.get(homework.classId);
    const ClassIconComponent = classInfo ? getClassIcon(classInfo.icon) : BookOpen;
    const priorityConfig = getPriorityIndicator(homework.priority || 'medium');
    const PriorityIcon = priorityConfig.icon;
    const DueIcon = getDueDateIcon(new Date(homework.dueDate), true);
    const dueDateLabel = getDueDateLabel(new Date(homework.dueDate), true);

    return (
      <div
        className="group bg-white/60 dark:bg-gray-900/40 backdrop-blur-md rounded-full border border-sky-100 dark:border-sky-500/10 shadow-sm hover:shadow-lg hover:shadow-sky-500/5 transition-all duration-300 overflow-hidden cursor-pointer hover:scale-[1.02]"
        onClick={() => setSelectedHomework(homework)}
      >
        <div className="flex items-center gap-3 p-3">
          {/* Class Icon */}
          <div className={`
            shrink-0 flex items-center justify-center rounded-full
            h-8 w-8
            ${priorityConfig.bg}
            border border-sky-100/50 dark:border-sky-500/10
          `}>
            <ClassIconComponent className={`h-4 w-4 ${priorityConfig.color}`} />
          </div>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              {/* Title and Description */}
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold text-sky-900 dark:text-sky-100 truncate text-sm">
                  {homework.title}
                </h3>
                <div className="flex items-center gap-2 mt-0.5">
                  {classInfo && (
                    <span className="text-xs text-sky-600/50 dark:text-sky-400/50">
                      {classInfo.name}
                    </span>
                  )}
                  {homework.description && (
                    <span className="text-xs text-sky-600/40 dark:text-sky-400/40 truncate">
                      {homework.description}
                    </span>
                  )}
                </div>
              </div>

              {/* Right Side Info */}
              <div className="flex items-center gap-2 shrink-0">
                {/* Date */}
                <div className={`flex items-center gap-1 text-xs ${dueDateLabel.includes('Today') || dueDateLabel.includes('Tomorrow') ? 'text-sky-600 dark:text-sky-400 font-medium' : 'text-sky-600/50 dark:text-sky-400/50'}`}>
                  <DueIcon className="h-3 w-3" />
                  <span>{dueDateLabel}</span>
                </div>

                {/* Priority Badge */}
                <span className={`
                  shrink-0 inline-flex items-center justify-center rounded-full px-2 py-1 text-[10px] font-bold uppercase tracking-wide
                  ${priorityConfig.badge}
                `}>
                  {homework.priority || 'medium'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (homeworks.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-green-100 dark:bg-green-500/15">
              <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
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
          
          {onClose && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onClose}
              className="text-sky-600/50 hover:text-sky-600 dark:text-sky-400/50 dark:hover:text-sky-400 transition-colors"
            >
              ×
            </motion.button>
          )}
        </div>

        {/* Homework List */}
        <div className="space-y-3 max-h-96 overflow-y-auto">
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
                      const ClassIconComponent = classInfo ? getClassIcon(classInfo.icon) : BookOpen;
                      const priorityConfig = getPriorityIndicator(selectedHomework.priority || 'medium');
                      
                      return (
                        <>
                          <div className={`
                            flex items-center justify-center rounded-lg
                            h-10 w-10
                            ${priorityConfig.bg}
                            border border-sky-100/50 dark:border-sky-500/10
                          `}>
                            <ClassIconComponent className={`h-5 w-5 ${priorityConfig.color}`} />
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
                    <X className="h-5 w-5" />
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
                        <Calendar className="h-4 w-4" />
                        {(() => {
                          const dueDate = new Date(selectedHomework.dueDate);
                          return dueDate.toLocaleDateString('en-US', {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric',
                            year: dueDate.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
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
                          const PriorityIcon = priorityConfig.icon;
                          return (
                            <span className={`
                              inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide
                              ${priorityConfig.badge}
                            `}>
                              <PriorityIcon className="h-3 w-3" />
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
                        <Link className="h-4 w-4" />
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
                            <ExternalLink className="h-4 w-4 text-sky-600 dark:text-sky-400" />
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
                      <CheckCircle2 className="h-4 w-4" />
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
