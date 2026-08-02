'use client';

import { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, X, Copy, Check, Link2 } from 'lucide-react';
import { IconSchool, IconBrandTeams, IconBell, IconBrandWhatsapp, IconDeviceMobileMessage, IconMail } from '@tabler/icons-react';
import Link from 'next/link';
import Image from 'next/image';

const SHARE_URL = 'https://tasktornado.com';
const SHARE_TEXT = 'Check out TaskTornado — a pre-launch student organizer for homework, grades, and study schedules. AI and Google Classroom integrations are planned.';

function ShareSheet({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
    const [copied, setCopied] = useState(false);

    const handleCopyLink = async () => {
        try {
            await navigator.clipboard.writeText(SHARE_URL);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            const input = document.createElement('input');
            input.value = SHARE_URL;
            document.body.appendChild(input);
            input.select();
            document.execCommand('copy');
            document.body.removeChild(input);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const shareOptions = [
        {
            label: 'Email',
            icon: () => <IconMail size={20} stroke={1.5} />,
            onClick: () => {
                window.open(
                    `mailto:?subject=${encodeURIComponent('Check out TaskTornado!')}&body=${encodeURIComponent(SHARE_TEXT + '\n\n' + SHARE_URL)}`,
                    '_blank'
                );
            },
        },
        {
            label: 'Classroom',
            icon: () => <IconSchool size={20} stroke={1.5} />,
            onClick: () => {
                window.open(
                    `https://classroom.google.com/share?url=${encodeURIComponent(SHARE_URL)}&title=${encodeURIComponent('TaskTornado - AI Student Organizer')}`,
                    '_blank',
                    'width=600,height=500'
                );
            },
        },
        {
            label: 'Teams',
            icon: () => <IconBrandTeams size={20} stroke={1.5} />,
            onClick: () => {
                window.open(
                    `https://teams.microsoft.com/share?href=${encodeURIComponent(SHARE_URL)}&msgText=${encodeURIComponent(SHARE_TEXT)}`,
                    '_blank',
                    'width=600,height=500'
                );
            },
        },
        {
            label: 'Remind',
            icon: () => <IconBell size={20} stroke={1.5} />,
            onClick: () => {
                window.open('https://www.remind.com/', '_blank');
            },
        },
        {
            label: 'WhatsApp',
            icon: () => <IconBrandWhatsapp size={20} stroke={1.5} />,
            onClick: () => {
                window.open(
                    `https://wa.me/?text=${encodeURIComponent(SHARE_TEXT + ' ' + SHARE_URL)}`,
                    '_blank'
                );
            },
        },
        {
            label: 'Text / SMS',
            icon: () => <IconDeviceMobileMessage size={20} stroke={1.5} />,
            onClick: () => {
                window.open(
                    `sms:?&body=${encodeURIComponent(SHARE_TEXT + ' ' + SHARE_URL)}`,
                    '_self'
                );
            },
        },
    ];

    if (typeof window === 'undefined') return null;

    return createPortal(
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 z-[9998] bg-black/40 backdrop-blur-sm"
                    />

                    {/* Sheet */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ type: 'spring', bounce: 0.2, duration: 0.5 }}
                        className="fixed z-[9999] inset-0 flex items-center justify-center px-4"
                    >
                        <div className="w-full max-w-[400px] bg-[#f8fbfd] dark:bg-zinc-900 rounded-[24px] shadow-2xl shadow-black/20 overflow-hidden border border-sky-100 dark:border-zinc-800">

                            {/* Header */}
                            <div className="relative px-6 pt-6 pb-2">
                                <button
                                    onClick={onClose}
                                    className="absolute top-5 right-5 w-8 h-8 flex items-center justify-center rounded-full bg-sky-100 dark:bg-zinc-800 text-sky-500 dark:text-sky-400 hover:bg-sky-200 dark:hover:bg-zinc-700 transition-colors"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                                <h3 className="text-xl font-bold text-sky-500 dark:text-sky-400 tracking-tight">
                                    Share TaskTornado
                                </h3>
                                <p className="text-xs text-sky-600/40 dark:text-sky-400/40 mt-1 font-medium">
                                    Help your students get organized
                                </p>
                            </div>

                            {/* Share options */}
                            <div className="px-5 py-4">
                                <div className="grid grid-cols-3 gap-2">
                                    {shareOptions.map((option, i) => {
                                        const Icon = option.icon;
                                        return (
                                            <motion.button
                                                key={option.label}
                                                initial={{ opacity: 0, y: 8 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: i * 0.04 }}
                                                onClick={option.onClick}
                                                className="group flex flex-col items-center gap-2.5 py-4 px-2 rounded-2xl bg-white/60 dark:bg-zinc-800/50 border border-sky-100 dark:border-zinc-700 hover:border-sky-200 dark:hover:border-zinc-600 transition-all active:scale-95"
                                            >
                                                <div className="w-11 h-11 bg-sky-100 dark:bg-sky-500/15 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110">
                                                    <span className="text-sky-500 dark:text-sky-400">
                                                        <Icon />
                                                    </span>
                                                </div>
                                                <span className="text-[11px] font-bold text-sky-900/60 dark:text-zinc-400 leading-tight text-center">
                                                    {option.label}
                                                </span>
                                            </motion.button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Copy link bar */}
                            <div className="px-5 pb-5">
                                <div className="flex items-center gap-2 bg-[#ebf6b5]/30 dark:bg-sky-500/5 rounded-2xl p-2 border border-[#d4e88e]/40 dark:border-sky-500/10">
                                    <div className="flex items-center gap-2 flex-1 min-w-0 px-3">
                                        <Link2 className="w-3.5 h-3.5 text-sky-500 dark:text-sky-400 shrink-0" />
                                        <span className="text-sm text-sky-900/70 dark:text-sky-300 truncate font-medium">
                                            tasktornado.com
                                        </span>
                                    </div>
                                    <button
                                        onClick={handleCopyLink}
                                        className={`shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all active:scale-95 ${copied
                                            ? 'bg-emerald-500 text-white'
                                            : 'bg-[#275085] dark:bg-sky-500 hover:opacity-90 text-white'
                                            }`}
                                    >
                                        {copied ? (
                                            <>
                                                <Check className="w-3.5 h-3.5" />
                                                Copied!
                                            </>
                                        ) : (
                                            <>
                                                <Copy className="w-3.5 h-3.5" />
                                                Copy Link
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>,
        document.body
    );
}

export default function TeachersFinalCTA() {
    const [showShareSheet, setShowShareSheet] = useState(false);

    return (
        <section className="relative py-24 md:py-32 bg-orange-50 dark:bg-gray-950 overflow-hidden">

            {/* Ambient glow */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-orange-500/[0.04] rounded-full blur-[120px]" />
                <div className="absolute bottom-0 right-1/4 w-[300px] h-[300px] bg-amber-400/[0.05] rounded-full blur-[100px]" />
            </div>

            <div className="relative z-10 max-w-7xl mx-auto px-5 md:px-8">

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 items-center">

                    {/* Left — Content */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                    >
                        <span className="inline-block px-3 py-1 text-[10px] font-bold uppercase tracking-[0.15em] text-orange-900/70 dark:text-orange-400 bg-orange-900/5 dark:bg-orange-400/5 border border-orange-900/10 dark:border-orange-400/10 rounded-full mb-6">
                            Get Started
                        </span>

                        <h2 className="text-3xl md:text-4xl lg:text-5xl font-semibold text-orange-500 dark:text-orange-400 tracking-tight leading-[1.1] mb-5">
                            Share it with your class.
                        </h2>

                        <p className="text-base md:text-lg text-orange-900/60 dark:text-orange-400/60 max-w-lg leading-relaxed font-medium mb-8">
                            Students can use TaskTornado&apos;s core organization
                            tools today. Google Classroom and AI integrations
                            will launch only after their respective reviews are
                            complete.
                        </p>

                        {/* CTAs */}
                        <div className="flex flex-col sm:flex-row items-start gap-3 mb-8">
                            <button
                                onClick={() => setShowShareSheet(true)}
                                className="
                                    group inline-flex items-center gap-2 px-8 py-3.5
                                    bg-orange-600 hover:bg-orange-700
                                    text-white font-bold text-sm
                                    rounded-full transition-all duration-200
                                    shadow-lg shadow-orange-600/20 hover:shadow-xl hover:shadow-orange-600/30
                                    active:scale-95
                                "
                            >
                                Recommend TaskTornado
                                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                            </button>
                            <Link
                                href="/guardians"
                                className="
                                    inline-flex items-center gap-2 px-7 py-3.5
                                    text-orange-900/60 dark:text-orange-400/60 font-medium text-sm
                                    rounded-full border border-orange-900/15 dark:border-orange-400/15
                                    hover:text-orange-900 dark:hover:text-orange-400
                                    hover:border-orange-900/30 dark:hover:border-orange-400/30
                                    transition-all duration-200
                                "
                            >
                                See the parent view
                            </Link>
                        </div>

                        {/* Trust badges */}
                        <div className="flex flex-wrap items-start gap-x-5 gap-y-2">
                            {[
                                'Google sync planned',
                                'Free core access',
                                'No data selling',
                                'AI currently paused',
                            ].map((badge, i) => (
                                <span key={i} className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-orange-900/40 dark:text-orange-400/40">
                                    <svg className="w-3 h-3 text-[#8bc34a]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                    </svg>
                                    {badge}
                                </span>
                            ))}
                        </div>
                    </motion.div>

                    {/* Right — Illustration */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1, duration: 0.6 }}
                        className="flex justify-center"
                    >
                        <div className="relative w-72 h-72 md:w-96 md:h-96 lg:w-[480px] lg:h-[480px] pointer-events-none">
                            <Image
                                src="/teachers-share.png"
                                alt="Share TaskTornado with your class"
                                fill
                                className="object-contain drop-shadow-2xl"
                            />
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Share Sheet Modal */}
            <ShareSheet isOpen={showShareSheet} onClose={() => setShowShareSheet(false)} />
        </section>
    );
}
