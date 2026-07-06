'use client';

import { useParams } from 'next/navigation';
import { useClassContext } from '@/context/ClassContext';
import type { Test as TestType } from '@/context/ClassContext';
import { useEffect, useState } from 'react';
import { ArrowLeft, Calendar, Clock, Edit, BookOpen, GraduationCap, ExternalLink, Link as LinkIcon } from 'lucide-react';
import Link from 'next/link';
import { iconMap } from '@/lib/icon-map';
import { motion } from 'framer-motion';

const CLASS_COLORS = ['#DC2626', '#2563EB', '#D97706', '#16A34A', '#7C3AED', '#DB2777', '#0D9488', '#475569'];

type Test = TestType;

export default function TestDetailPage() {
  const { id } = useParams() as { id: string };
  const { tests, classes } = useClassContext();
  const [test, setTest] = useState<Test | null>(null);
  const [classItem, setClassItem] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const testItem = tests.find(t => t.id === id);
    setTest(testItem || null);

    if (testItem) {
      const cls = classes.find(c => c.id === testItem.classId);
      setClassItem(cls || null);
    } else {
      setClassItem(null);
    }
    setLoading(false);
  }, [id, tests, classes]);

  const classIndex = classItem ? classes.findIndex((c: any) => c.id === classItem.id) : -1;
  const accentColor = classIndex >= 0 ? CLASS_COLORS[classIndex % CLASS_COLORS.length] : '#0ea5e9';

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fffaf4] dark:bg-gray-950 flex items-center justify-center">
        <div className="h-6 w-6 rounded-full border-2 border-sky-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!test) {
    return (
      <div className="min-h-screen bg-[#fffaf4] dark:bg-gray-950 flex flex-col items-center justify-center p-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-sky-50 dark:bg-gray-900 rounded-2xl mb-5 border border-sky-100 dark:border-gray-800">
          <GraduationCap className="h-7 w-7 text-sky-400 dark:text-sky-500" />
        </div>
        <h1 className="text-2xl font-bold text-sky-900 dark:text-white mb-2 tracking-tight">Test not found</h1>
        <p className="text-sky-600/60 dark:text-gray-400 text-sm mb-6">This test may have been deleted or doesn&apos;t exist.</p>
        <Link
          href="/tests"
          className="inline-flex items-center gap-2 h-10 px-5 text-[13px] font-semibold text-sky-600 dark:text-sky-400 hover:text-sky-900 dark:hover:text-white hover:bg-sky-50 dark:hover:bg-gray-800 border border-sky-200 dark:border-gray-700 rounded-full transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Tests
        </Link>
      </div>
    );
  }

  const ClassIcon = classItem ? (iconMap[classItem.icon as keyof typeof iconMap] ?? GraduationCap) : GraduationCap;

  const testDate = new Date(test.testDate);
  const formattedDate = testDate.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const statusConfig: Record<string, { label: string; emoji: string; classes: string }> = {
    not_started: { label: 'Not Started', emoji: '📋', classes: 'bg-sky-50 text-sky-600 dark:bg-sky-500/10 dark:text-sky-400 border-sky-200 dark:border-sky-500/20' },
    in_progress: { label: 'In Progress', emoji: '📌', classes: 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400 border-amber-200 dark:border-amber-500/20' },
    completed: { label: 'Completed', emoji: '✅', classes: 'bg-[#ebf6b5]/60 text-sky-700 dark:bg-[#ebf6b5]/10 dark:text-sky-300 border-[#d4e88e]/50 dark:border-[#d4e88e]/20' },
    postponed: { label: 'Postponed', emoji: '⏸', classes: 'bg-purple-50 text-purple-600 dark:bg-purple-500/10 dark:text-purple-400 border-purple-200 dark:border-purple-500/20' },
    cancelled: { label: 'Cancelled', emoji: '❌', classes: 'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400 border-red-200 dark:border-red-500/20' },
  };

  const currentStatus = statusConfig[test.status || 'not_started'] || statusConfig.not_started;

  // Calculate grade percentage for the visual indicator
  const hasScore = test.score !== null && test.score !== undefined && test.maxScore;
  const scorePercentage = hasScore ? ((test.score as number) / (test.maxScore as number)) * 100 : null;
  const gradeColor = scorePercentage !== null
    ? scorePercentage >= 90 ? '#16A34A'
      : scorePercentage >= 80 ? '#2563EB'
        : scorePercentage >= 70 ? '#D97706'
          : scorePercentage >= 60 ? '#DC2626'
            : '#DC2626'
    : accentColor;

  return (
    <div className="min-h-screen bg-[#fffaf4] dark:bg-gray-950 font-sans text-[#111827] dark:text-gray-100">
      <main className="w-full max-w-2xl mx-auto px-4 sm:px-6 pt-28 pb-12">
        {/* Back link */}
        <Link
          href="/tests"
          className="inline-flex items-center gap-2 text-sm text-sky-500 hover:text-sky-700 dark:text-sky-400 dark:hover:text-sky-300 transition-colors mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Tests
        </Link>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div
                className="shrink-0 w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: `${accentColor}20` }}
              >
                <ClassIcon className="w-6 h-6" style={{ color: accentColor }} />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-sky-900 dark:text-white">
                  {test.title}
                </h1>
                {classItem && (
                  <p className="text-sm text-sky-600/50 dark:text-sky-400/40 font-medium mt-0.5">{classItem.name}</p>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Detail card */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="bg-white dark:bg-gray-900 rounded-[28px] shadow-2xl shadow-sky-500/5 border border-sky-100 dark:border-gray-800 overflow-hidden mb-6"
        >
          <div className="p-6 sm:p-8 space-y-5">
            {/* Status + Test Type chips */}
            <div className="flex flex-wrap items-center gap-2">
              <span className={`inline-flex items-center text-[11px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-full border ${currentStatus.classes}`}>
                {currentStatus.emoji} {currentStatus.label}
              </span>
              {test.testType && (
                <span className="inline-flex items-center text-[11px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-full border bg-sky-50 text-sky-600 dark:bg-sky-500/10 dark:text-sky-400 border-sky-200 dark:border-sky-500/20">
                  {test.testType}
                </span>
              )}
            </div>

            {/* Date + Time row */}
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-sky-600/60 dark:text-sky-400/50">
                <Calendar className="h-4 w-4" />
                <span className="font-medium">{formattedDate}</span>
              </div>
              {test.testTime && (
                <div className="flex items-center gap-2 text-sm text-sky-600/60 dark:text-sky-400/50">
                  <Clock className="h-4 w-4" />
                  <span className="font-medium">{test.testTime}</span>
                </div>
              )}
            </div>

            {/* Score card — only when completed with score */}
            {hasScore && (
              <>
                <div className="flex items-center gap-3">
                  <div className="h-px bg-sky-100 dark:bg-gray-800 flex-1" />
                  <span className="text-[10px] uppercase font-semibold text-sky-600/30 dark:text-sky-400/30 tracking-wider">Score</span>
                  <div className="h-px bg-sky-100 dark:bg-gray-800 flex-1" />
                </div>

                <div className="flex items-center gap-4 p-4 rounded-2xl border border-sky-100/60 dark:border-gray-700/40 bg-sky-50/40 dark:bg-gray-800/30">
                  {/* Grade circle */}
                  <div
                    className="shrink-0 w-16 h-16 rounded-2xl flex flex-col items-center justify-center"
                    style={{ backgroundColor: `${gradeColor}15` }}
                  >
                    <span className="text-2xl font-bold" style={{ color: gradeColor }}>
                      {test.grade || '—'}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-2xl font-bold text-sky-900 dark:text-white">{test.score}</span>
                      <span className="text-sm text-sky-600/40 dark:text-sky-400/30 font-medium">/ {test.maxScore}</span>
                    </div>
                    {scorePercentage !== null && (
                      <div className="mt-2 flex items-center gap-3">
                        <div className="flex-1 h-2 bg-sky-100 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{ width: `${Math.min(scorePercentage, 100)}%`, backgroundColor: gradeColor }}
                          />
                        </div>
                        <span className="text-xs font-semibold text-sky-600/60 dark:text-sky-400/40 tabular-nums">
                          {scorePercentage.toFixed(1)}%
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}

            {/* Description */}
            {(test.description || test.notes) && (
              <>
                <div className="flex items-center gap-3">
                  <div className="h-px bg-sky-100 dark:bg-gray-800 flex-1" />
                  <span className="text-[10px] uppercase font-semibold text-sky-600/30 dark:text-sky-400/30 tracking-wider">Details</span>
                  <div className="h-px bg-sky-100 dark:bg-gray-800 flex-1" />
                </div>

                {test.description && (
                  <div>
                    <span className="block text-[10px] font-semibold text-sky-600/40 dark:text-sky-400/30 uppercase tracking-wider mb-1.5">Description</span>
                    <p className="text-sm text-sky-800/70 dark:text-sky-200/60 whitespace-pre-line leading-relaxed">
                      {test.description}
                    </p>
                  </div>
                )}

                {test.notes && (
                  <div>
                    <span className="block text-[10px] font-semibold text-sky-600/40 dark:text-sky-400/30 uppercase tracking-wider mb-1.5">Notes</span>
                    <p className="text-sm text-sky-800/70 dark:text-sky-200/60 whitespace-pre-line leading-relaxed">
                      {test.notes}
                    </p>
                  </div>
                )}
              </>
            )}

            {/* Study Materials */}
            {test.studyMaterials && test.studyMaterials.length > 0 && (
              <>
                <div className="flex items-center gap-3">
                  <div className="h-px bg-sky-100 dark:bg-gray-800 flex-1" />
                  <span className="text-[10px] uppercase font-semibold text-sky-600/30 dark:text-sky-400/30 tracking-wider">Study Materials</span>
                  <div className="h-px bg-sky-100 dark:bg-gray-800 flex-1" />
                </div>

                <div className="space-y-2">
                  {test.studyMaterials.map((material, index) => {
                    const url = typeof material === 'string' ? material : material.url;
                    const title = (typeof material === 'object' && material.title)
                      ? material.title
                      : `Study Material ${index + 1}`;

                    return (
                      <a
                        key={index}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-3 rounded-xl bg-sky-50/50 dark:bg-gray-800/30 border border-sky-100/60 dark:border-gray-700/40 hover:border-sky-300 dark:hover:border-sky-700 transition-colors group"
                      >
                        <div className="shrink-0 w-8 h-8 bg-sky-100/60 dark:bg-sky-500/10 rounded-lg flex items-center justify-center">
                          <LinkIcon className="h-3.5 w-3.5 text-sky-500/60 dark:text-sky-400/50" />
                        </div>
                        <span className="flex-1 text-sm font-medium text-sky-700 dark:text-sky-300 truncate">
                          {title}
                        </span>
                        <ExternalLink className="h-3.5 w-3.5 text-sky-400/40 group-hover:text-sky-500 transition-colors shrink-0" />
                      </a>
                    );
                  })}
                </div>
              </>
            )}
          </div>

          {/* Footer with actions */}
          <div className="flex items-center justify-end gap-2.5 px-6 sm:px-8 py-4 border-t border-sky-100/60 dark:border-gray-800">
            <Link href="/tests">
              <button
                type="button"
                className="h-10 px-5 text-[13px] font-semibold text-sky-600 dark:text-sky-400 hover:text-sky-900 dark:hover:text-white hover:bg-sky-50 dark:hover:bg-gray-800 border border-sky-200 dark:border-gray-700 rounded-full transition-colors"
              >
                <span className="flex items-center gap-2">
                  <ArrowLeft className="h-3.5 w-3.5" />
                  Tests
                </span>
              </button>
            </Link>
            <Link href={`/tests/edit/${test.id}`}>
              <button
                type="button"
                className="h-10 px-6 text-[13px] font-semibold text-sky-700 dark:text-sky-300 bg-[#ebf6b5]/60 dark:bg-[#ebf6b5]/10 hover:bg-[#ebf6b5] border border-[#d4e88e]/50 dark:border-[#d4e88e]/20 rounded-full transition-colors inline-flex items-center gap-2"
              >
                <Edit className="h-3.5 w-3.5" />
                Edit Test
              </button>
            </Link>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
