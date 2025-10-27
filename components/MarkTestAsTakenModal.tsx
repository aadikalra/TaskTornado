'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { X } from 'lucide-react';

interface MarkTestAsTakenModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (score: number, maxScore: number, grade?: string) => Promise<void>;
  testTitle: string;
}

export const MarkTestAsTakenModal = ({
  isOpen,
  onClose,
  onSubmit,
  testTitle,
}: MarkTestAsTakenModalProps) => {
  const [score, setScore] = useState('');
  const [maxScore, setMaxScore] = useState('');
  const [grade, setGrade] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const scoreNum = parseFloat(score);
    const maxScoreNum = parseFloat(maxScore);

    if (isNaN(scoreNum) || isNaN(maxScoreNum) || scoreNum < 0 || maxScoreNum <= 0 || scoreNum > maxScoreNum) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(scoreNum, maxScoreNum, grade || undefined);
      onClose();
      // Reset form
      setScore('');
      setMaxScore('');
      setGrade('');
    } catch (error) {
      console.error('Error marking test as taken:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md p-6 relative border border-gray-200 dark:border-gray-700"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400"
        >
          <X className="h-5 w-5" />
        </button>

        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">
          Mark Test as Taken
        </h2>

        <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <p className="text-sm text-blue-800 dark:text-blue-200 font-medium">
            {testTitle}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="score" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Score
              </Label>
              <Input
                id="score"
                type="number"
                value={score}
                onChange={(e) => setScore(e.target.value)}
                placeholder="87"
                min="0"
                step="0.1"
                required
                className="w-full bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <Label htmlFor="maxScore" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Max Score
              </Label>
              <Input
                id="maxScore"
                type="number"
                value={maxScore}
                onChange={(e) => setMaxScore(e.target.value)}
                placeholder="100"
                min="0.1"
                step="0.1"
                required
                className="w-full bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="grade" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Grade (Optional)
            </Label>
            <Input
              id="grade"
              type="text"
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
              placeholder="B+, A-, etc."
              className="w-full bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="pt-2 flex justify-end space-x-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="px-4 h-9 text-sm border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!score || !maxScore || isSubmitting}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 h-9 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Marking...' : 'Mark as Taken'}
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
