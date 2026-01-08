'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, Clock, BookOpen, Target, Zap, GraduationCap, FileText, Presentation, Trash2, Edit2, Link as LinkIcon, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Test, Class } from '@/context/ClassContext';
import { getDueDateLabel } from '@/lib/dateUtils';
import Link from 'next/link';
import { LinkCard } from './LinkCard';

interface TestDetailModalProps {
    test: Test | null;
    isOpen: boolean;
    onClose: () => void;
    onDelete: (id: string | string) => Promise<void>;
    classInfo?: Class;
    layoutId?: string;
}

export const TestDetailModal = ({
    test,
    isOpen,
    onClose,
    onDelete,
    classInfo,
    layoutId,
}: TestDetailModalProps) => {
    if (!test) return null;

    const testTypeInfo = {
        alpha: { icon: Target, label: 'ALPHA', color: 'text-purple-600', bg: 'bg-purple-100', darkColor: 'dark:text-purple-400', darkBg: 'dark:bg-purple-900/30' },
        beta: { icon: Zap, label: 'BETA', color: 'text-orange-600', bg: 'bg-orange-100', darkColor: 'dark:text-orange-400', darkBg: 'dark:bg-orange-900/30' },
        exam: { icon: GraduationCap, label: 'EXAM', color: 'text-red-600', bg: 'bg-red-100', darkColor: 'dark:text-red-400', darkBg: 'dark:bg-red-900/30' },
        final: { icon: GraduationCap, label: 'FINAL', color: 'text-red-600', bg: 'bg-red-100', darkColor: 'dark:text-red-400', darkBg: 'dark:bg-red-900/30' },
        midterm: { icon: GraduationCap, label: 'MIDTERM', color: 'text-red-600', bg: 'bg-red-100', darkColor: 'dark:text-red-400', darkBg: 'dark:bg-red-900/30' },
        quiz: { icon: FileText, label: 'QUIZ', color: 'text-blue-600', bg: 'bg-blue-100', darkColor: 'dark:text-blue-400', darkBg: 'dark:bg-blue-900/30' },
        project: { icon: Presentation, label: 'PROJECT', color: 'text-emerald-600', bg: 'bg-emerald-100', darkColor: 'dark:text-emerald-400', darkBg: 'dark:bg-emerald-900/30' },
        default: { icon: BookOpen, label: 'TEST', color: 'text-gray-600', bg: 'bg-gray-100', darkColor: 'dark:text-gray-400', darkBg: 'dark:bg-gray-800' }
    };

    const type = (test.testType?.toLowerCase() || 'default') as keyof typeof testTypeInfo;
    const config = testTypeInfo[type] || testTypeInfo.default;
    const TypeIcon = config.icon;

    const dueDateLabel = getDueDateLabel(new Date(test.testDate), true);

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[100]" onClick={onClose}>
                    <motion.div
                        layoutId={layoutId}
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        onClick={(e) => e.stopPropagation()}
                        className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border border-gray-200 dark:border-gray-700"
                    >
                        {/* Header / Banner */}
                        <div className={`h-24 px-8 flex items-center justify-between ${config.bg} ${config.darkBg}`}>
                            <div className="flex items-center gap-4">
                                <div className="h-14 w-14 rounded-2xl bg-white dark:bg-gray-900 flex items-center justify-center shadow-sm">
                                    <TypeIcon className={`h-8 w-8 ${config.color} ${config.darkColor}`} />
                                </div>
                                <div>
                                    <span className={`text-[10px] font-bold uppercase tracking-widest ${config.color} ${config.darkColor}`}>
                                        {config.label}
                                    </span>
                                    <h2 className="text-xl font-bold text-gray-900 dark:text-white truncate max-w-[280px]">
                                        {test.title}
                                    </h2>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-white/50 dark:hover:bg-gray-700 rounded-full transition-colors"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="p-8 space-y-6">
                            {/* Info Grid */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex items-center gap-3 p-4 rounded-2xl bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-700">
                                    <Calendar className="h-5 w-5 text-gray-400" />
                                    <div>
                                        <p className="text-[10px] text-gray-500 dark:text-gray-400 uppercase font-bold tracking-tight">Date</p>
                                        <p className="text-sm font-medium text-gray-900 dark:text-white">{dueDateLabel}</p>
                                    </div>
                                </div>
                                {test.testTime && (
                                    <div className="flex items-center gap-3 p-4 rounded-2xl bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-700">
                                        <Clock className="h-5 w-5 text-gray-400" />
                                        <div>
                                            <p className="text-[10px] text-gray-500 dark:text-gray-400 uppercase font-bold tracking-tight">Time</p>
                                            <p className="text-sm font-medium text-gray-900 dark:text-white">{test.testTime}</p>
                                        </div>
                                    </div>
                                )}
                                {classInfo && (
                                    <div className="flex items-center gap-3 p-4 rounded-2xl bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-700">
                                        <BookOpen className="h-5 w-5 text-gray-400" />
                                        <div>
                                            <p className="text-[10px] text-gray-500 dark:text-gray-400 uppercase font-bold tracking-tight">Class</p>
                                            <p className="text-sm font-medium text-gray-900 dark:text-white">{classInfo.name}</p>
                                        </div>
                                    </div>
                                )}
                                {(test.grade || (test.score !== null && test.maxScore !== null)) && (
                                    <div className="flex items-center gap-3 p-4 rounded-2xl bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800">
                                        <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                                        <div>
                                            <p className="text-[10px] text-green-600 dark:text-green-400 uppercase font-bold tracking-tight">Grade</p>
                                            <p className="text-sm font-bold text-green-700 dark:text-green-400">
                                                {test.grade || (test.score !== null ? `${test.score}/${test.maxScore}` : '')}
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Description */}
                            {test.description && (
                                <div className="space-y-2">
                                    <h3 className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest px-1">Description</h3>
                                    <div className="p-5 rounded-2xl bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-700">
                                        <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                                            {test.description}
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Study Materials */}
                            {test.studyMaterials && test.studyMaterials.length > 0 && (
                                <div className="space-y-2">
                                    <h3 className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest px-1">Study Materials</h3>
                                    <div className="flex flex-wrap gap-2 pt-1">
                                        {(test.studyMaterials as any[]).map((material, idx) => {
                                            const url = typeof material === 'string' ? material : material.url;
                                            const title = typeof material === 'string' ? `Material ${idx + 1}` : (material.title || `Material ${idx + 1}`);
                                            return (
                                                <LinkCard key={idx} url={url} title={title} className="bg-gray-50 dark:bg-gray-900/50 border-gray-100 dark:border-gray-700" />
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Actions */}
                            <div className="flex gap-3 pt-6 border-t border-gray-100 dark:border-gray-700">
                                <Link href={`/tests/edit/${test.id}`} className="flex-1">
                                    <Button variant="outline" className="w-full h-12 rounded-xl border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
                                        <Edit2 className="h-4 w-4 mr-2" />
                                        Edit Details
                                    </Button>
                                </Link>
                                <Button
                                    variant="destructive"
                                    className="flex-1 h-12 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30 border-none shadow-none"
                                    onClick={async () => {
                                        await onDelete(test.id);
                                        onClose();
                                    }}
                                >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete Test
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
