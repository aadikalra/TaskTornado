'use client';

import { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, X, Copy, Check, Link2 } from 'lucide-react';
import { IconMail, IconBrandWhatsapp, IconDeviceMobileMessage, IconBrandFacebook, IconBrandMessenger, IconBrandInstagram } from '@tabler/icons-react';
import Image from 'next/image';

const SHARE_URL = 'https://tasktornado.com';
const SHARE_TEXT = 'Check out TaskTornado — a pre-launch student organizer for homework, grades, and study schedules. AI tools are planned after a provider and safety review.';

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
                    `mailto:?subject=${encodeURIComponent('Check out TaskTornado for our kid!')}&body=${encodeURIComponent(SHARE_TEXT + '\n\n' + SHARE_URL)}`,
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
            label: 'Messenger',
            icon: () => <IconBrandMessenger size={20} stroke={1.5} />,
            onClick: () => {
                window.open(
                    `https://www.facebook.com/dialog/send?link=${encodeURIComponent(SHARE_URL)}&app_id=0&redirect_uri=${encodeURIComponent(SHARE_URL)}`,
                    '_blank',
                    'width=600,height=500'
                );
            },
        },
        {
            label: 'Facebook',
            icon: () => <IconBrandFacebook size={20} stroke={1.5} />,
            onClick: () => {
                window.open(
                    `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(SHARE_URL)}`,
                    '_blank',
                    'width=600,height=500'
                );
            },
        },
        {
            label: 'Instagram',
            icon: () => <IconBrandInstagram size={20} stroke={1.5} />,
            onClick: () => {
                window.open('https://www.instagram.com/', '_blank');
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
                                    Share it with your child or other parents
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

export default function GuardiansFinalCTA() {
    const [showShareSheet, setShowShareSheet] = useState(false);

    return (
        <section className="relative py-20 md:py-32 bg-pink-50 dark:bg-gray-950 overflow-hidden">
            <div className="max-w-6xl mx-auto px-5 md:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-[1.3fr_1fr] lg:gap-0 items-center">

                    {/* Left side: Illustration */}
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="relative w-[115%] -ml-[7.5%] lg:w-[120%] lg:-ml-[15%] aspect-[4/3] z-0"
                    >
                        <Image
                            src="/guardians-final-cta.png"
                            alt="Father and son using TaskTornado on a tablet"
                            fill
                            className="object-contain"
                            sizes="(max-width: 1024px) 100vw, 50vw"
                            priority
                        />
                    </motion.div>

                    {/* Right side: Content */}
                    <div className="flex flex-col items-center lg:items-start text-center lg:text-left relative z-10 lg:-ml-12 mt-8 lg:mt-0">
                        <motion.h2
                            initial={{ opacity: 0, y: 16 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.1, duration: 0.5 }}
                            className="text-3xl md:text-5xl font-semibold text-pink-500 dark:text-pink-400 tracking-tight leading-[1.15] mb-6"
                        >
                            Show them tonight.
                        </motion.h2>

                        <motion.p
                            initial={{ opacity: 0, y: 16 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.2, duration: 0.5 }}
                            className="text-base md:text-lg text-pink-500/70 dark:text-pink-400/70 max-w-lg leading-relaxed mb-8"
                        >
                            It takes 30 seconds to sign up. No credit card. No commitment. Just a better way for your child to stay organized, learn smarter, and feel supported.
                        </motion.p>

                        <motion.div
                            initial={{ opacity: 0, y: 16 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.3, duration: 0.5 }}
                        >
                            <button
                                onClick={() => setShowShareSheet(true)}
                                className="
                                    group inline-flex items-center gap-2.5 px-8 py-4
                                    bg-pink-500 hover:bg-pink-600
                                    text-white font-medium text-base
                                    rounded-full transition-all duration-200
                                    shadow-md hover:shadow-lg
                                    active:scale-95
                                "
                            >
                                Share TaskTornado with your child
                                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                            </button>
                        </motion.div>
                    </div>

                </div>
            </div>

            {/* Share Sheet Modal */}
            <ShareSheet isOpen={showShareSheet} onClose={() => setShowShareSheet(false)} />
        </section>
    );
}
