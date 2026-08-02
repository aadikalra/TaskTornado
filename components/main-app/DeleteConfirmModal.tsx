'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HugeIcon } from '@/lib/huge-icon-map';

import { useClassContext } from '@/context/ClassContext';
import { useHomeworkContext } from '@/context/HomeworkContext';
import { useMainApp } from '@/context/MainAppContext';

export const DeleteConfirmModal = () => {
  const { deleteConfirm, setDeleteConfirm, classToDelete, setClassToDelete } = useMainApp();
  const { deleteClass } = useClassContext();
  const { deleteRecurringSeries, deleteHomework, homeworks = [] } = useHomeworkContext() || {};

  const isHomeworkArchived = (hw: any): boolean => {
    if (!hw.completed) return false;
    if (!hw.dueDate) return true;
    const dueDate = new Date(hw.dueDate);
    const now = new Date();
    const daysSinceDue = Math.floor((now.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
    return daysSinceDue >= 7;
  };

  const classHomeworks = classToDelete
    ? homeworks.filter(hw => hw.classId === classToDelete.id)
    : [];
  const archivedHomeworks = classHomeworks.filter(isHomeworkArchived);

  const handleDeleteConfirm = async (deleteSeries: boolean) => {
    if (!deleteConfirm) return;

    try {
      if (deleteSeries && deleteConfirm.recurringId) {
        // Delete entire recurring series
        await deleteRecurringSeries(deleteConfirm.recurringId);
      } else {
        // Delete just this instance
        await deleteHomework(deleteConfirm.id);
      }
    } catch (error) {
      console.error('Error deleting homework:', error);
    } finally {
      setDeleteConfirm(null);
    }
  };

  return (
    <>
      {/* Delete Recurring Homework Confirmation */}
      <AnimatePresence>
        {deleteConfirm && (
          <div className="fixed inset-0 bg-[#fffaf4]/80 dark:bg-gray-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 10 }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-[28px] p-7 max-w-md w-full border border-sky-100 dark:border-gray-800 shadow-2xl shadow-sky-500/5"
            >
              <h3 className="text-lg font-bold text-sky-900 dark:text-white mb-2">
                Delete Recurring Homework
              </h3>
              <p className="text-sm text-sky-600/50 dark:text-sky-400/50 mb-6">
                How would you like to delete &quot;<span className="font-semibold text-sky-800 dark:text-sky-200">{deleteConfirm.title}</span>&quot;?
              </p>

              <div className="space-y-2.5 mb-6">
                <button
                  onClick={() => handleDeleteConfirm(false)}
                  className="w-full h-11 flex items-center justify-center text-[13px] font-semibold text-sky-700 dark:text-sky-300 bg-sky-50 dark:bg-sky-500/10 hover:bg-sky-100 dark:hover:bg-sky-500/15 border border-sky-200 dark:border-sky-500/20 rounded-full transition-colors"
                >
                  Delete only this instance
                </button>
                <button
                  onClick={() => handleDeleteConfirm(true)}
                  className="w-full h-11 flex items-center justify-center text-[13px] font-semibold text-white bg-red-500 hover:bg-red-600 border border-red-500 hover:border-red-600 rounded-full transition-colors"
                >
                  Delete entire recurring series
                </button>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="h-10 px-5 text-[13px] font-semibold text-sky-600 dark:text-sky-400 hover:text-sky-900 dark:hover:text-white hover:bg-sky-50 dark:hover:bg-gray-800 border border-sky-200 dark:border-gray-700 rounded-full transition-colors"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Class Options Dialog */}
      <AnimatePresence>
        {classToDelete && (
          <div className="fixed inset-0 bg-[#fffaf4]/80 dark:bg-gray-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 10 }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-[28px] p-7 max-w-md w-full border border-sky-100 dark:border-gray-800 shadow-2xl shadow-sky-500/5"
            >
              <h3 className="text-lg font-bold text-sky-900 dark:text-white mb-1">
                Delete &quot;{classToDelete.name}&quot;?
              </h3>
              <p className="text-xs text-sky-600/60 dark:text-sky-400/60 mb-6">
                Choose an action below for this class and its assignments.
              </p>

              <div className="space-y-2.5 mb-6">
                {/* 1. Delete all archived homeworks */}
                <button
                  onClick={async () => {
                    const toDelete = archivedHomeworks;
                    setClassToDelete(null);
                    for (const hw of toDelete) {
                      await deleteHomework(hw.id);
                    }
                  }}
                  className="w-full h-12 px-4 flex items-center justify-between text-left text-[13px] font-semibold text-sky-700 dark:text-sky-300 bg-sky-50 dark:bg-sky-500/10 hover:bg-sky-100 dark:hover:bg-sky-500/15 border border-sky-200 dark:border-sky-500/20 rounded-2xl transition-colors cursor-pointer"
                >
                  <span>Delete Archived Assignments</span>
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-sky-200/60 dark:bg-sky-500/20 text-sky-800 dark:text-sky-200 shrink-0">
                    {archivedHomeworks.length}
                  </span>
                </button>

                {/* 2. Delete all homeworks */}
                <button
                  onClick={async () => {
                    const toDelete = classHomeworks;
                    setClassToDelete(null);
                    for (const hw of toDelete) {
                      await deleteHomework(hw.id);
                    }
                  }}
                  className="w-full h-12 px-4 flex items-center justify-between text-left text-[13px] font-semibold text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-500/10 hover:bg-amber-100 dark:hover:bg-amber-500/15 border border-amber-200 dark:border-amber-500/20 rounded-2xl transition-colors cursor-pointer"
                >
                  <span>Delete All Assignments</span>
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-200/60 dark:bg-amber-500/20 text-amber-900 dark:text-amber-200 shrink-0">
                    {classHomeworks.length}
                  </span>
                </button>

                {/* 3. Delete class */}
                <button
                  onClick={async () => {
                    const targetId = classToDelete.id;
                    setClassToDelete(null);
                    await deleteClass(targetId);
                  }}
                  className="w-full h-12 px-4 flex items-center justify-between text-left text-[13px] font-semibold text-white bg-red-500 hover:bg-red-600 border border-red-500 hover:border-red-600 rounded-2xl transition-colors cursor-pointer shadow-xs"
                >
                  <span>Delete Class</span>
                  <HugeIcon name="Delete02" size={16} className="w-4 h-4 text-white shrink-0" />
                </button>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={() => setClassToDelete(null)}
                  className="h-10 px-5 text-[13px] font-semibold text-sky-600 dark:text-sky-400 hover:text-sky-900 dark:hover:text-white hover:bg-sky-50 dark:hover:bg-gray-800 border border-sky-200 dark:border-gray-700 rounded-full transition-colors cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
