'use client';

import React from 'react';
import BulkAddHomeworkDisplay from '@/components/BulkAddHomeworkDisplay';
import type { Homework, Class } from '@/context/ClassContext';

// Sample data for testing the bulk add display
const sampleHomeworks = [
  {
    id: 'hw-1',
    title: 'Math Chapter 5 Review',
    description: 'Complete all odd-numbered problems from sections 5.1-5.3',
    dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days from now
    priority: 'high' as const,
    completed: false,
    classId: 'class-1',
    links: [
      { id: 'link-1', url: 'https://khanacademy.org', title: 'Khan Academy' },
      { id: 'link-2', url: 'https://desmos.com', title: 'Desmos Calculator' }
    ],
    pinned: false,
  },
  {
    id: 'hw-2',
    title: 'History Essay Draft',
    description: 'Write first draft of World War II essay, minimum 500 words',
    dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days from now
    priority: 'medium' as const,
    completed: false,
    classId: 'class-2',
    links: [
      { id: 'link-3', url: 'https://jstor.org', title: 'JSTOR Research' }
    ],
    pinned: false,
  },
  {
    id: 'hw-3',
    title: 'Science Lab Report',
    description: 'Complete lab report for photosynthesis experiment',
    dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day from now
    priority: 'high' as const,
    completed: false,
    classId: 'class-3',
    links: [],
    pinned: false,
  },
  {
    id: 'hw-4',
    title: 'Spanish Vocabulary Practice',
    description: 'Practice Chapter 4 vocabulary - 20 sentences using new words',
    dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days from now
    priority: 'low' as const,
    completed: false,
    classId: 'class-4',
    links: [
      { id: 'link-4', url: 'https://quizlet.com', title: 'Quizlet Flashcards' }
    ],
    pinned: false,
  },
] as unknown as Homework[];

const sampleClasses = [
  {
    id: 'class-1',
    name: 'Algebra II',
    icon: 'Calculator',
    color: '#3182CE',
    userId: 'user-1',
    created_at: new Date().toISOString(),
  },
  {
    id: 'class-2',
    name: 'World History',
    icon: 'BookOpen',
    color: '#D69E2E',
    userId: 'user-1',
    created_at: new Date().toISOString(),
  },
  {
    id: 'class-3',
    name: 'Biology',
    icon: 'Microscope',
    color: '#38A169',
    userId: 'user-1',
    created_at: new Date().toISOString(),
  },
  {
    id: 'class-4',
    name: 'Spanish II',
    icon: 'Globe',
    color: '#D53F8C',
    userId: 'user-1',
    created_at: new Date().toISOString(),
  },
] as unknown as Class[];

export default function BulkAddTestPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900/20">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-sky-900 dark:text-sky-100 mb-2">
              Bulk Add Display Test
            </h1>
            <p className="text-sky-600 dark:text-sky-400">
              This is a test page to showcase the bulk add homework display component
            </p>
          </div>

          {/* Test Container */}
          <div className="bg-white/60 dark:bg-gray-900/40 backdrop-blur-md rounded-2xl border border-sky-100 dark:border-sky-500/10 shadow-lg p-6">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-sky-900 dark:text-sky-100 mb-2">
                Sample Bulk Add Result
              </h2>
              <p className="text-sm text-sky-600 dark:text-sky-400">
                This demonstrates how the bulk add command would display newly added homework assignments.
              </p>
            </div>

            {/* Bulk Add Display Component */}
            <BulkAddHomeworkDisplay
              homeworks={sampleHomeworks}
              classes={sampleClasses}
            />
          </div>

          {/* Additional Test Variants */}
          <div className="mt-8 space-y-6">
            {/* Single Assignment Test */}
            <div className="bg-white/60 dark:bg-gray-900/40 backdrop-blur-md rounded-2xl border border-sky-100 dark:border-sky-500/10 shadow-lg p-6">
              <h3 className="text-lg font-semibold text-sky-900 dark:text-sky-100 mb-4">
                Single Assignment Test
              </h3>
              <BulkAddHomeworkDisplay
                homeworks={[sampleHomeworks[0]]}
                classes={[sampleClasses[0]]}
              />
            </div>

            {/* Empty State Test */}
            <div className="bg-white/60 dark:bg-gray-900/40 backdrop-blur-md rounded-2xl border border-sky-100 dark:border-sky-500/10 shadow-lg p-6">
              <h3 className="text-lg font-semibold text-sky-900 dark:text-sky-100 mb-4">
                Empty State Test
              </h3>
              <BulkAddHomeworkDisplay
                homeworks={[]}
                classes={sampleClasses}
              />
            </div>
          </div>

          {/* Design Notes */}
          <div className="mt-8 bg-sky-50 dark:bg-sky-500/10 rounded-xl p-6 border border-sky-200 dark:border-sky-500/20">
            <h3 className="text-lg font-semibold text-sky-900 dark:text-sky-100 mb-3">
              Design Features
            </h3>
            <ul className="space-y-2 text-sm text-sky-700 dark:text-sky-300">
              <li>• <strong>Priority Indicators:</strong> Visual badges with icons (Flame, AlertTriangle, Minus)</li>
              <li>• <strong>Class Integration:</strong> Shows class icons and names for context</li>
              <li>• <strong>Smart Dates:</strong> Relative date formatting (Today, Tomorrow, etc.)</li>
              <li>• <strong>Link Support:</strong> Displays attached resources with external link icons</li>
              <li>• <strong>Animations:</strong> Staggered entry animations for visual appeal</li>
              <li>• <strong>Glass Morphism:</strong> Modern frosted glass effect with backdrop blur</li>
              <li>• <strong>Responsive:</strong> Works well on both mobile and desktop</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
