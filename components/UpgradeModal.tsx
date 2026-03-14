'use client';

import { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Crown, Zap, ArrowRight, Lock } from 'lucide-react';
import Link from 'next/link';
import { getPlanTier, getTierLabel } from '@/lib/planTier';

interface UpgradeModalProps {
    isOpen: boolean;
    onClose: () => void;
    /** Short reason like "add more homework" or "use AI Deep" */
    featureLabel?: string;
    /** The raw limit message */
    limitMessage?: string;
}

const PERKS = [
    { icon: '📝', text: 'Unlimited homework & tests' },
    { icon: '🧠', text: 'More powerful AI models' },
    { icon: '🌐', text: 'Unlimited translations' },
    { icon: '🃏', text: 'Unlimited flashcards' },
    { icon: '💬', text: 'Unlimited study groups' },
    { icon: '🚫', text: 'No ads, ever' },
];

export default function UpgradeModal({ isOpen, onClose, featureLabel, limitMessage }: UpgradeModalProps) {
    const tier = getPlanTier();
    const nextTier = tier === 'free' ? 'Pro' : 'Family';

    // Stable headline — pick once per open, not every render
    const headline = useMemo(() => {
        if (!isOpen) return '';
        // Simple, direct headline
        return "You're out of space";
    }, [isOpen]);

    // Build a clean subtitle from the limit message
    const subtitle = useMemo(() => {
        if (limitMessage) return limitMessage;
        if (featureLabel) return `Upgrade to ${nextTier} to ${featureLabel}.`;
        return `You've maxed out what the ${getTierLabel(tier)} plan includes.`;
    }, [limitMessage, featureLabel, nextTier, tier]);

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="absolute inset-0 bg-sky-950/40 dark:bg-black/60 backdrop-blur-sm"
                        onClick={onClose}
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.88, y: 30 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.92, y: 20 }}
                        transition={{ type: 'spring', stiffness: 380, damping: 28 }}
                        className="relative w-full max-w-[420px] bg-white dark:bg-gray-900 rounded-[28px] shadow-2xl shadow-sky-500/10 dark:shadow-black/30 border border-sky-100 dark:border-gray-800 overflow-hidden"
                    >
                        {/* Glow top accent */}
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[200px] h-[120px] bg-gradient-to-b from-sky-400/20 via-sky-400/5 to-transparent rounded-full blur-3xl pointer-events-none" />

                        {/* Close button */}
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 z-10 p-1.5 rounded-full text-sky-400/50 hover:text-sky-600 dark:text-sky-500/40 dark:hover:text-sky-300 hover:bg-sky-100/50 dark:hover:bg-gray-800 transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>

                        {/* Content */}
                        <div className="px-7 pt-8 pb-2">
                            {/* Lock icon badge */}
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: 'spring', stiffness: 500, damping: 20, delay: 0.1 }}
                                className="w-14 h-14 rounded-2xl bg-gradient-to-br from-sky-100 to-sky-50 dark:from-sky-500/15 dark:to-sky-500/5 border border-sky-200/60 dark:border-sky-500/20 flex items-center justify-center mb-5 shadow-sm"
                            >
                                <Lock className="w-6 h-6 text-sky-500" />
                            </motion.div>

                            {/* Headline */}
                            <h2 className="text-[22px] font-bold text-sky-900 dark:text-white tracking-tight leading-snug mb-1.5">
                                {headline}
                            </h2>

                            {/* Limit reason */}
                            <p className="text-[14px] text-sky-700/60 dark:text-sky-300/50 leading-relaxed mb-5">
                                {subtitle}
                            </p>

                            {/* What you get with upgrade */}
                            <div className="bg-sky-50/60 dark:bg-sky-500/[0.06] rounded-2xl border border-sky-100/60 dark:border-sky-500/10 p-4 mb-5">
                                <div className="flex items-center gap-2 mb-3">
                                    <Crown className="w-3.5 h-3.5 text-amber-500" />
                                    <span className="text-[11px] font-bold text-sky-600 dark:text-sky-400 uppercase tracking-wider">
                                        What you get with {nextTier}
                                    </span>
                                </div>
                                <div className="grid grid-cols-2 gap-y-2 gap-x-3">
                                    {PERKS.map((perk, i) => (
                                        <motion.div
                                            key={i}
                                            initial={{ opacity: 0, x: -8 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.15 + i * 0.05 }}
                                            className="flex items-center gap-2"
                                        >
                                            <span className="text-[13px]">{perk.icon}</span>
                                            <span className="text-[12px] font-medium text-sky-800/70 dark:text-sky-200/60 leading-tight">{perk.text}</span>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>

                            {/* Price tease */}
                            <div className="text-center mb-2">
                                <span className="text-[12px] text-sky-600/40 dark:text-sky-400/30">
                                    Plans start at{' '}
                                </span>
                                <span className="text-[15px] font-bold text-sky-600 dark:text-sky-400">
                                    $4.99/mo
                                </span>
                            </div>
                        </div>

                        {/* CTAs */}
                        <div className="px-7 pb-7 pt-2 flex flex-col gap-2.5">
                            <Link
                                href="/pricing"
                                onClick={onClose}
                                className="flex items-center justify-center gap-2 w-full h-12 rounded-full bg-sky-500 hover:bg-sky-600 text-white text-[14px] font-bold tracking-tight shadow-lg shadow-sky-500/25 hover:shadow-sky-500/40 transition-all active:scale-[0.97]"
                            >
                                <Zap className="w-4 h-4" />
                                See Plans
                                <ArrowRight className="w-4 h-4" />
                            </Link>

                            <button
                                onClick={onClose}
                                className="w-full h-10 rounded-full text-[13px] font-semibold text-sky-500/50 dark:text-sky-400/40 hover:text-sky-600 dark:hover:text-sky-300 hover:bg-sky-50 dark:hover:bg-gray-800/50 transition-colors"
                            >
                                Not right now
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
