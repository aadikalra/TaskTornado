'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface RouteIntroPopupProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    description: string;
    features?: string[];
    icon?: React.ReactNode;
}

export function RouteIntroPopup({
    isOpen,
    onClose,
    title,
    description,
    features,
    icon,
}: RouteIntroPopupProps) {
    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-[#fffaf4]/80 dark:bg-gray-950/80 backdrop-blur-sm z-50"
                        onClick={onClose}
                    />

                    {/* Popup */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 28 }}
                        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md mx-4"
                    >
                        <div className="bg-white dark:bg-gray-900 rounded-[32px] shadow-2xl shadow-sky-500/5 border border-sky-100 dark:border-gray-800 overflow-hidden">
                            <div className="p-7">
                                {/* Close button */}
                                <div className="flex justify-end mb-1">
                                    <button
                                        onClick={onClose}
                                        className="h-8 w-8 flex items-center justify-center rounded-full text-sky-400/30 hover:text-sky-900 dark:hover:text-white hover:bg-sky-500/[0.06] transition-colors"
                                        aria-label="Close"
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                </div>

                                {/* Icon + Title */}
                                <div className="text-center mb-6">
                                    {icon && (
                                        <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-sky-100/40 dark:bg-sky-500/10 border border-sky-100/50 dark:border-sky-500/10 flex items-center justify-center text-sky-500">
                                            {icon}
                                        </div>
                                    )}
                                    <h2 className="text-2xl font-bold text-sky-900 dark:text-white mb-2 tracking-tight">
                                        {title}
                                    </h2>
                                    <p className="text-sm text-sky-600/90 dark:text-sky-400/90 leading-relaxed max-w-sm mx-auto">
                                        {description}
                                    </p>
                                </div>

                                {/* Features */}
                                {features && features.length > 0 && (
                                    <div className="space-y-2 mb-7">
                                        {features.map((feature, index) => (
                                            <motion.div
                                                key={index}
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: 0.1 + index * 0.05 }}
                                                className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-white/60 dark:bg-gray-800/40 border border-sky-100/60 dark:border-gray-700"
                                            >
                                                <span className="w-1.5 h-1.5 rounded-full bg-sky-500 shrink-0" />
                                                <span className="text-sm text-sky-900 dark:text-sky-100 leading-snug">{feature}</span>
                                            </motion.div>
                                        ))}
                                    </div>
                                )}

                                {/* Action Button */}
                                <button
                                    onClick={onClose}
                                    className="w-full h-12 rounded-full flex items-center justify-center text-[14px] font-semibold text-sky-700 dark:text-sky-300 bg-[#ebf6b5]/60 dark:bg-[#ebf6b5]/10 hover:bg-[#ebf6b5] border border-[#d4e88e]/50 dark:border-[#d4e88e]/20 transition-colors"
                                >
                                    Got it!
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
