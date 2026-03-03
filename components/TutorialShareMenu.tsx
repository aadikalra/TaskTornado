'use client';

import React, { useState } from 'react';
import {
    Share2,
    Twitter,
    Linkedin,
    Link as LinkIcon,
    Mail,
    Check,
    X,
} from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useToast } from '@/context/ToastContext';

interface TutorialShareMenuProps {
    title: string;
    className?: string;
}

const shareOptions = [
    { id: 'copy', label: 'Copy Link', icon: LinkIcon, color: 'text-sky-500 dark:text-sky-400' },
    { id: 'twitter', label: 'X / Twitter', icon: Twitter, color: 'text-sky-500 dark:text-sky-400' },
    { id: 'linkedin', label: 'LinkedIn', icon: Linkedin, color: 'text-sky-600 dark:text-sky-400' },
    { id: 'email', label: 'Gmail', icon: Mail, color: 'text-sky-500 dark:text-sky-400' },
] as const;

export function TutorialShareMenu({ title, className }: TutorialShareMenuProps) {
    const [open, setOpen] = useState(false);
    const [copied, setCopied] = useState(false);
    const { success, error: toastError } = useToast();

    const getUrl = () => {
        if (typeof window !== 'undefined') {
            return window.location.href;
        }
        return '';
    };

    const shareData = {
        title: `TaskTornado Tutorial: ${title}`,
        text: `Check out this guide on TaskTornado: ${title}`,
        url: getUrl(),
    };

    const handleAction = async (id: string) => {
        switch (id) {
            case 'copy':
                try {
                    await navigator.clipboard.writeText(getUrl());
                    setCopied(true);
                    success('Link copied!', 'Share it with your friends.');
                    setTimeout(() => setCopied(false), 2000);
                } catch {
                    toastError('Failed to copy link', 'Please try again.');
                }
                break;
            case 'twitter':
                window.open(
                    `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareData.text)}&url=${encodeURIComponent(shareData.url)}`,
                    '_blank',
                    'width=550,height=420'
                );
                setOpen(false);
                break;
            case 'linkedin':
                window.open(
                    `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareData.url)}`,
                    '_blank',
                    'width=550,height=600'
                );
                setOpen(false);
                break;
            case 'email':
                window.open(
                    `https://mail.google.com/mail/?view=cm&su=${encodeURIComponent(shareData.title)}&body=${encodeURIComponent(shareData.text + '\n\n' + shareData.url)}`,
                    '_blank'
                );
                setOpen(false);
                break;
        }
    };

    return (
        <div className="relative">
            {/* Trigger */}
            <button
                onClick={() => setOpen(!open)}
                className={`
                    relative flex items-center gap-2 px-3.5 py-2 rounded-full
                    text-sm font-semibold tracking-wide
                    bg-[#ebf6b5]/50 dark:bg-sky-500/10
                    text-sky-600 dark:text-sky-400
                    hover:bg-[#ebf6b5]/80 dark:hover:bg-sky-500/20
                    active:scale-[0.97]
                    transition-all duration-200
                    ${className ?? ''}
                `}
            >
                <Share2 className="w-3.5 h-3.5" />
                <span className="text-xs font-bold uppercase tracking-widest">Share</span>
            </button>

            {/* Dropdown */}
            <AnimatePresence>
                {open && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.15 }}
                            className="fixed inset-0 z-40"
                            onClick={() => setOpen(false)}
                        />

                        {/* Panel */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.92, y: -4 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.92, y: -4 }}
                            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                            className="
                                absolute right-0 top-full mt-2.5 z-50
                                w-[240px] p-1.5
                                bg-white/95 dark:bg-zinc-900/95
                                backdrop-blur-2xl
                                border border-sky-100/60 dark:border-sky-800/30
                                rounded-2xl
                                shadow-2xl shadow-sky-500/[0.08]
                            "
                        >
                            {/* Header */}
                            <div className="flex items-center justify-between px-3 py-2.5 mb-1">
                                <span className="text-[10px] font-bold text-sky-500 dark:text-sky-400 uppercase tracking-[0.2em]">
                                    Share Guide
                                </span>
                                <button
                                    onClick={() => setOpen(false)}
                                    className="p-1 rounded-lg text-sky-400/40 hover:text-sky-500 hover:bg-sky-500/[0.06] transition-colors"
                                >
                                    <X className="w-3 h-3" />
                                </button>
                            </div>

                            {/* Options */}
                            <div className="space-y-0.5">
                                {shareOptions.map((option) => {
                                    const Icon = option.id === 'copy' && copied ? Check : option.icon;
                                    return (
                                        <button
                                            key={option.id}
                                            onClick={() => handleAction(option.id)}
                                            className="
                                                w-full flex items-center gap-3 px-3 py-2.5
                                                rounded-xl
                                                text-sky-800/80 dark:text-sky-200/80
                                                hover:bg-[#ebf6b5]/30 dark:hover:bg-sky-500/10
                                                active:scale-[0.98]
                                                transition-all duration-150
                                                group
                                            "
                                        >
                                            <span className={`
                                                flex items-center justify-center w-8 h-8 rounded-xl
                                                bg-sky-50 dark:bg-sky-500/10
                                                group-hover:bg-[#ebf6b5]/60 dark:group-hover:bg-sky-500/20
                                                transition-colors duration-200
                                            `}>
                                                <Icon className={`w-4 h-4 ${option.color} ${option.id === 'copy' && copied ? 'text-green-500 dark:text-green-400' : ''}`} />
                                            </span>
                                            <span className="text-[13px] font-medium">
                                                {option.id === 'copy' && copied ? 'Copied!' : option.label}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Native share (mobile) */}
                            {typeof navigator !== 'undefined' && (navigator as any).share && (
                                <>
                                    <div className="mx-3 my-2 h-px bg-sky-100/60 dark:bg-sky-800/20" />
                                    <button
                                        onClick={async () => {
                                            try {
                                                await navigator.share(shareData);
                                                success('Shared successfully!');
                                                setOpen(false);
                                            } catch (err) {
                                                if ((err as Error).name !== 'AbortError') {
                                                    console.error('Error sharing:', err);
                                                }
                                            }
                                        }}
                                        className="
                                            w-full flex items-center gap-3 px-3 py-2.5
                                            rounded-xl
                                            text-sky-800/80 dark:text-sky-200/80
                                            hover:bg-[#ebf6b5]/30 dark:hover:bg-sky-500/10
                                            active:scale-[0.98]
                                            transition-all duration-150
                                            group
                                        "
                                    >
                                        <span className="flex items-center justify-center w-8 h-8 rounded-xl bg-sky-50 dark:bg-sky-500/10 group-hover:bg-[#ebf6b5]/60 dark:group-hover:bg-sky-500/20 transition-colors">
                                            <Share2 className="w-4 h-4 text-sky-500 dark:text-sky-400" />
                                        </span>
                                        <span className="text-[13px] font-medium">More Options…</span>
                                    </button>
                                </>
                            )}
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}
