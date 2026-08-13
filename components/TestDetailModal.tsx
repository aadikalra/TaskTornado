'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { HugeIcon } from '@/lib/huge-icon-map';
import { getClassIcon } from '@/lib/icon-map';
import { Test, Class } from '@/context/ClassContext';
import { getDueDateLabel, parseCalendarDate } from '@/lib/dateUtils';
import Link from 'next/link';
import { LinkCard } from './LinkCard';

interface TestDetailModalProps {
    test: Test | null;
    isOpen: boolean;
    onClose: () => void;
    onDelete: (id: string | string) => Promise<void>;
    classInfo?: Class;
    layoutId?: string;
    readOnly?: boolean;
}

export const TestDetailModal = ({
    test,
    isOpen,
    onClose,
    onDelete,
    classInfo,
    layoutId,
    readOnly,
}: TestDetailModalProps) => {
    const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!test || !mounted) return null;

    const testTypeInfo = {
        alpha: { icon: 'Target01', label: 'ALPHA' },
        beta: { icon: 'Zap', label: 'BETA' },
        exam: { icon: 'GraduationCap', label: 'EXAM' },
        final: { icon: 'GraduationCap', label: 'FINAL' },
        midterm: { icon: 'GraduationCap', label: 'MIDTERM' },
        quiz: { icon: 'FilePen', label: 'QUIZ' },
        project: { icon: 'BoardMath', label: 'PROJECT' },
        default: { icon: 'BookOpen', label: 'TEST' }
    };

    const type = (test.testType?.toLowerCase() || 'default') as keyof typeof testTypeInfo;
    const config = testTypeInfo[type] || testTypeInfo.default;
    const TypeIcon = config.icon;
    const classIconName = classInfo ? getClassIcon(classInfo.icon) : 'BookOpen';

    const dueDateLabel = getDueDateLabel(parseCalendarDate(test.testDate), true);
    const hasScore = test.grade || (test.score !== null && test.maxScore !== null);
    const displayScore = test.grade || (test.score !== null ? `${test.score}/${test.maxScore}` : '');

    const modalContent = (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 bg-[#fffaf4]/80 dark:bg-gray-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-[100] text-base" onClick={onClose}>
                    <motion.div
                        layoutId={layoutId}
                        initial={{ opacity: 0, scale: 0.96, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.96, y: 10 }}
                        transition={{ type: 'spring', damping: 28, stiffness: 300 }}
                        onClick={(e) => e.stopPropagation()}
                        className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-[28px] shadow-2xl shadow-sky-500/5 w-full max-w-md overflow-hidden border border-sky-100 dark:border-gray-800"
                    >
                        <div className="p-7">
                            {/* Top row: type pill + close */}
                            <div className="flex items-center justify-between mb-5">
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-100/60 dark:bg-sky-500/10 text-[11px] font-bold tracking-wider text-sky-600 dark:text-sky-400 uppercase">
                                    <HugeIcon name={TypeIcon} size={12} className="h-3 w-3" />
                                    {config.label}
                                </span>
                                <button
                                    onClick={onClose}
                                    className="h-8 w-8 flex items-center justify-center rounded-full text-sky-400/30 hover:text-sky-900 dark:hover:text-white hover:bg-sky-500/[0.06] transition-colors"
                                >
                                    <HugeIcon name="Cancel01" size={16} className="h-4 w-4" />
                                </button>
                            </div>

                            {/* Title */}
                            <h2 className="text-2xl font-bold text-sky-900 dark:text-white mb-6 leading-tight">
                                {test.title}
                            </h2>

                            {/* Info pills row */}
                            <div className="flex flex-wrap gap-2 mb-6">
                                <div className="inline-flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-white/60 dark:bg-gray-800/40 border border-sky-100 dark:border-gray-700">
                                    <HugeIcon name="Calendar02" size={18} className="h-4.5 w-4.5 text-sky-500" />
                                    <div>
                                        <p className="text-[10px] font-semibold text-sky-600/40 dark:text-sky-400/40 uppercase tracking-wider leading-none mb-0.5">Date</p>
                                        <p className="text-sm font-semibold text-sky-900 dark:text-white leading-tight">{dueDateLabel}</p>
                                    </div>
                                </div>

                                {test.testTime && (
                                    <div className="inline-flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-white/60 dark:bg-gray-800/40 border border-sky-100 dark:border-gray-700">
                                        <HugeIcon name="Timer01" size={18} className="h-4.5 w-4.5 text-sky-500" />
                                        <div>
                                            <p className="text-[10px] font-semibold text-sky-600/40 dark:text-sky-400/40 uppercase tracking-wider leading-none mb-0.5">Time</p>
                                            <p className="text-sm font-semibold text-sky-900 dark:text-white leading-tight">{test.testTime}</p>
                                        </div>
                                    </div>
                                )}

                                {classInfo && (
                                    <div className="inline-flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-white/60 dark:bg-gray-800/40 border border-sky-100 dark:border-gray-700">
                                        <HugeIcon name={classIconName} size={18} className="h-4.5 w-4.5 text-sky-500" />
                                        <div>
                                            <p className="text-[10px] font-semibold text-sky-600/40 dark:text-sky-400/40 uppercase tracking-wider leading-none mb-0.5">Class</p>
                                            <p className="text-sm font-semibold text-sky-900 dark:text-white leading-tight">{classInfo.name}</p>
                                        </div>
                                    </div>
                                )}

                                {hasScore && (
                                    <div className="inline-flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-[#ebf6b5]/30 dark:bg-[#ebf6b5]/5 border border-[#d4e88e]/30 dark:border-[#d4e88e]/10">
                                        <HugeIcon name="CheckmarkCircle02" size={18} className="h-4.5 w-4.5 text-sky-600" />
                                        <div>
                                            <p className="text-[10px] font-semibold text-sky-600/40 dark:text-sky-400/40 uppercase tracking-wider leading-none mb-0.5">Grade</p>
                                            <p className="text-sm font-bold text-sky-900 dark:text-white leading-tight">{displayScore}</p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Description */}
                            {test.description && (
                                <div className="mb-6">
                                    <p className="text-[10px] font-semibold text-sky-600/30 dark:text-sky-400/30 uppercase tracking-widest mb-2 px-1">Description</p>
                                    <div className="px-5 py-4 rounded-2xl bg-white/60 dark:bg-gray-800/40 border border-sky-100 dark:border-gray-700">
                                        <p className="text-sm text-sky-800 dark:text-sky-200 leading-relaxed">
                                            {test.description}
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Study Materials */}
                            {test.studyMaterials && test.studyMaterials.length > 0 && (
                                <div className="mb-6">
                                    <p className="text-[10px] font-semibold text-sky-600/30 dark:text-sky-400/30 uppercase tracking-widest mb-2 px-1">Study Materials</p>
                                    <div className="flex flex-wrap gap-2">
                                        {(test.studyMaterials as any[]).map((material, idx) => {
                                            const url = typeof material === 'string' ? material : material.url;
                                            const title = typeof material === 'string' ? `Material ${idx + 1}` : (material.title || `Material ${idx + 1}`);
                                            return (
                                                <LinkCard key={idx} url={url} title={title} className="bg-white/60 dark:bg-gray-800/40 border-sky-100 dark:border-gray-700" />
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Actions */}
                            {!readOnly && (
                                <div className="flex gap-2.5 pt-5 border-t border-sky-100/60 dark:border-gray-800">
                                    <Link href={`/tests/edit/${test.id}`} className="flex-1">
                                        <button className="w-full h-11 rounded-full flex items-center justify-center gap-2 text-[13px] font-semibold text-sky-700 dark:text-sky-300 bg-[#ebf6b5]/50 dark:bg-[#ebf6b5]/10 hover:bg-[#ebf6b5] border border-[#d4e88e]/40 dark:border-[#d4e88e]/15 transition-colors">
                                            <HugeIcon name="Pen02" size={14} className="h-3.5 w-3.5" />
                                            Edit Details
                                        </button>
                                    </Link>

                                    {!confirmDeleteOpen ? (
                                        <button
                                            className="flex-1 h-11 rounded-full flex items-center justify-center gap-2 text-[13px] font-semibold text-red-500 hover:text-white bg-red-50 dark:bg-red-500/10 hover:bg-red-500 border border-red-200/60 dark:border-red-500/20 hover:border-red-500 transition-all"
                                            onClick={() => setConfirmDeleteOpen(true)}
                                        >
                                            <HugeIcon name="Delete02" size={14} className="h-3.5 w-3.5" />
                                            Delete Test
                                        </button>
                                    ) : (
                                        <div className="flex-1 flex gap-1.5">
                                            <button
                                                onClick={() => setConfirmDeleteOpen(false)}
                                                className="flex-1 h-11 rounded-full flex items-center justify-center text-[13px] font-semibold text-sky-600 dark:text-sky-400 hover:bg-sky-50 dark:hover:bg-gray-800 border border-sky-200 dark:border-gray-700 transition-colors"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                disabled={deleting}
                                                className="flex-1 h-11 rounded-full flex items-center justify-center gap-1.5 text-[13px] font-semibold text-white bg-red-500 hover:bg-red-600 border border-red-500 disabled:opacity-50 transition-colors"
                                                onClick={async () => {
                                                    setDeleting(true);
                                                    await onDelete(test.id);
                                                    setDeleting(false);
                                                    setConfirmDeleteOpen(false);
                                                    onClose();
                                                }}
                                            >
                                                <HugeIcon name="Delete02" size={14} className="h-3.5 w-3.5" />
                                                {deleting ? 'Deleting...' : 'Confirm'}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );

    return createPortal(modalContent, document.body);
};
