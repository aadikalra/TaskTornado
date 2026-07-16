'use client';

import { useParams } from 'next/navigation';
import { useClassContext, type Class } from '@/context/ClassContext';
import { useHomeworkContext, type Homework } from '@/context/HomeworkContext';
import { useEffect, useState } from 'react';
import { ArrowLeft, Calendar, Edit, BookOpen, Link as LinkIcon, Repeat, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { iconMap } from '@/lib/icon-map';
import { motion } from 'framer-motion';

const CLASS_COLORS = ['#DC2626', '#2563EB', '#D97706', '#16A34A', '#7C3AED', '#DB2777', '#0D9488', '#475569'];

export default function HomeworkDetailPage() {
  const { id } = useParams() as { id: string };
  const { classes } = useClassContext();
  const { homeworks } = useHomeworkContext();
  const [homework, setHomework] = useState<Homework | null>(null);
  const [classItem, setClassItem] = useState<Class | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const hw = homeworks.find(h => h.id === id);
    setHomework(hw || null);

    if (hw) {
      const cls = classes.find(c => c.id === hw.classId);
      setClassItem(cls || null);
    } else {
      setClassItem(null);
    }
    setLoading(false);
  }, [id, homeworks, classes]);

  const classIndex = classItem ? classes.findIndex(c => c.id === classItem.id) : -1;
  const accentColor = classIndex >= 0 ? CLASS_COLORS[classIndex % CLASS_COLORS.length] : '#0ea5e9';

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fffaf4] dark:bg-gray-950 flex items-center justify-center">
        <div className="h-6 w-6 rounded-full border-2 border-sky-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!homework) {
    return (
      <div className="min-h-screen bg-[#fffaf4] dark:bg-gray-950 flex flex-col items-center justify-center p-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-sky-50 dark:bg-gray-900 rounded-2xl mb-5 border border-sky-100 dark:border-gray-800">
          <BookOpen className="h-7 w-7 text-sky-400 dark:text-sky-500" />
        </div>
        <h1 className="text-2xl font-bold text-sky-900 dark:text-white mb-2 tracking-tight">Homework not found</h1>
        <p className="text-sky-600/60 dark:text-gray-400 text-sm mb-6">This assignment may have been deleted or doesn't exist.</p>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 h-10 px-5 text-[13px] font-semibold text-sky-600 dark:text-sky-400 hover:text-sky-900 dark:hover:text-white hover:bg-sky-50 dark:hover:bg-gray-800 border border-sky-200 dark:border-gray-700 rounded-full transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Dashboard
        </Link>
      </div>
    );
  }

  const ClassIcon = classItem ? (iconMap[classItem.icon as keyof typeof iconMap] ?? BookOpen) : BookOpen;

  const priorityConfig = {
    high: { label: 'High Priority', classes: 'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400 border-red-200 dark:border-red-500/20' },
    medium: { label: 'Medium Priority', classes: 'bg-sky-50 text-sky-600 dark:bg-sky-500/10 dark:text-sky-400 border-sky-200 dark:border-sky-500/20' },
    low: { label: 'Low Priority', classes: 'bg-[#ebf6b5]/60 text-sky-700 dark:bg-[#ebf6b5]/10 dark:text-sky-300 border-[#d4e88e]/50 dark:border-[#d4e88e]/20' },
  };

  const priority = priorityConfig[homework.priority || 'medium'];
  const dueDate = new Date(homework.dueDate);
  const formattedDate = dueDate.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="min-h-screen bg-[#fffaf4] dark:bg-gray-950 font-sans text-[#111827] dark:text-gray-100">
      <main className="w-full max-w-2xl mx-auto px-4 sm:px-6 pt-28 pb-12">
        {/* Back link */}
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-sm text-sky-500 hover:text-sky-700 dark:text-sky-400 dark:hover:text-sky-300 transition-colors mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
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
                  {homework.title}
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
            {/* Status chips row */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Completion status */}
              <span className={`inline-flex items-center text-[11px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-full border ${homework.completed
                  ? 'bg-[#ebf6b5]/60 text-sky-700 dark:bg-[#ebf6b5]/10 dark:text-sky-300 border-[#d4e88e]/50 dark:border-[#d4e88e]/20'
                  : 'bg-sky-50 text-sky-600 dark:bg-sky-500/10 dark:text-sky-400 border-sky-200 dark:border-sky-500/20'
                }`}>
                {homework.completed ? '✅ Completed' : '📌 In Progress'}
              </span>

              {/* Priority */}
              <span className={`inline-flex items-center text-[11px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-full border ${priority.classes}`}>
                {priority.label}
              </span>
            </div>

            <div className="flex items-center gap-2 text-sm text-sky-600/60 dark:text-sky-400/50">
              <Calendar className="h-4 w-4" />
              <span className="font-medium">{formattedDate}</span>
            </div>

            {/* Recurring Info */}
            {homework.recurring && (
              <div className="flex items-center gap-2 text-sm text-sky-600/60 dark:text-sky-400/50">
                <Repeat className="h-4 w-4 text-sky-500" />
                <span className="font-medium text-[11px] uppercase tracking-wider font-bold">Recurring: {homework.recurring.frequency}</span>
              </div>
            )}

            {/* Divider */}
            <div className="flex items-center gap-3">
              <div className="h-px bg-sky-100 dark:bg-gray-800 flex-1" />
              <span className="text-[10px] uppercase font-semibold text-sky-600/30 dark:text-sky-400/30 tracking-wider">Description</span>
              <div className="h-px bg-sky-100 dark:bg-gray-800 flex-1" />
            </div>

            {/* Description */}
            {homework.description ? (
              <p className="text-sm text-sky-800/70 dark:text-sky-200/60 whitespace-pre-line leading-relaxed">
                {homework.description}
              </p>
            ) : (
              <p className="text-sm text-sky-500/40 dark:text-sky-400/30 italic">No description provided.</p>
            )}

            {/* Links section */}
            {homework.links && homework.links.length > 0 && (
              <div className="pt-2 space-y-4">
                {/* Divider */}
                <div className="flex items-center gap-3">
                  <div className="h-px bg-sky-100 dark:bg-gray-800 flex-1" />
                  <span className="text-[10px] uppercase font-semibold text-sky-600/30 dark:text-sky-400/30 tracking-wider">Links & Resources</span>
                  <div className="h-px bg-sky-100 dark:bg-gray-800 flex-1" />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {homework.links.map((link) => (
                    <a
                      key={link.id}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-center justify-between p-3 bg-sky-50/50 dark:bg-gray-800/40 border border-sky-100 dark:border-gray-700/50 rounded-2xl hover:border-sky-300 dark:hover:border-sky-500 hover:bg-white dark:hover:bg-gray-800 transition-all"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 flex items-center justify-center group-hover:scale-110 transition-transform">
                          <LinkIcon className="h-3.5 w-3.5 text-sky-500" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-sky-900 dark:text-white truncate">
                            {link.title || 'Attached Link'}
                          </p>
                          <p className="text-[10px] text-sky-500/60 dark:text-sky-400/40 truncate">
                            {link.url.replace(/^https?:\/\/(www\.)?/, '')}
                          </p>
                        </div>
                      </div>
                      <ExternalLink className="h-3 w-3 text-sky-300 group-hover:text-sky-500 transition-colors shrink-0" />
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Footer with actions */}
          <div className="flex items-center justify-end gap-2.5 px-6 sm:px-8 py-4 border-t border-sky-100/60 dark:border-gray-800">
            <Link href="/dashboard">
              <button
                type="button"
                className="h-10 px-5 text-[13px] font-semibold text-sky-600 dark:text-sky-400 hover:text-sky-900 dark:hover:text-white hover:bg-sky-50 dark:hover:bg-gray-800 border border-sky-200 dark:border-gray-700 rounded-full transition-colors"
              >
                <span className="flex items-center gap-2">
                  <ArrowLeft className="h-3.5 w-3.5" />
                  Dashboard
                </span>
              </button>
            </Link>
            <Link href={`/homework/edit/${homework.id}`}>
              <button
                type="button"
                className="h-10 px-6 text-[13px] font-semibold text-sky-700 dark:text-sky-300 bg-[#ebf6b5]/60 dark:bg-[#ebf6b5]/10 hover:bg-[#ebf6b5] border border-[#d4e88e]/50 dark:border-[#d4e88e]/20 rounded-full transition-colors inline-flex items-center gap-2"
              >
                <Edit className="h-3.5 w-3.5" />
                Edit Homework
              </button>
            </Link>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
