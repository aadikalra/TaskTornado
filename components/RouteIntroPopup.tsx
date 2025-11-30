'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { Button } from '@/components/animate-ui/components/buttons/button';

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
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
                        onClick={onClose}
                    />

                    {/* Popup */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ type: 'spring', duration: 0.5 }}
                        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-lg mx-4"
                    >
                        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
                            {/* Header */}
                            <div className="relative p-6 sm:p-8 border-b border-gray-200 dark:border-gray-800">
                                <button
                                    onClick={onClose}
                                    className="absolute top-4 right-4 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                    aria-label="Close"
                                >
                                    <X className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                                </button>

                                <div className="flex items-start gap-4 pr-8">
                                    {icon && (
                                        <div className="flex-shrink-0 w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center text-gray-600 dark:text-gray-400">
                                            {icon}
                                        </div>
                                    )}
                                    <div className="flex-1">
                                        <h2 className="text-xl sm:text-2xl font-light text-gray-900 dark:text-white mb-2 tracking-tight">
                                            {title}
                                        </h2>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                                            {description}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-6 sm:p-8">
                                {features && features.length > 0 && (
                                    <div className="space-y-3 mb-6">
                                        <ul className="space-y-3">
                                            {features.map((feature, index) => (
                                                <motion.li
                                                    key={index}
                                                    initial={{ opacity: 0, x: -10 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: 0.1 + index * 0.05 }}
                                                    className="flex items-start gap-3 text-sm text-gray-600 dark:text-gray-400"
                                                >
                                                    <span className="text-gray-400 dark:text-gray-600 mt-0.5 shrink-0">•</span>
                                                    <span className="leading-relaxed">{feature}</span>
                                                </motion.li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {/* Action Button */}
                                <Button
                                    onClick={onClose}
                                    className="w-full"
                                >
                                    Got it!
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
