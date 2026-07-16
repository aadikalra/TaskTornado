'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

import { useClassContext } from '@/context/ClassContext';
import { useHomeworkContext } from '@/context/HomeworkContext';
import { useMainApp } from '@/context/MainAppContext';

export const DeleteConfirmModal = () => {
  const { deleteConfirm, setDeleteConfirm, classToDelete, setClassToDelete } = useMainApp();
  const { deleteClass } = useClassContext();
  const { deleteRecurringSeries, deleteHomework } = useHomeworkContext();

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

      {/* Delete Class Confirmation Dialog */}
      <AlertDialog open={!!classToDelete} onOpenChange={(open) => { if (!open) setClassToDelete(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete &quot;{classToDelete?.name}&quot;?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this class and all of its homework and tests. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (classToDelete) {
                  deleteClass(classToDelete.id);
                  setClassToDelete(null);
                }
              }}
            >
              Delete Class
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
