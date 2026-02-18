'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

// ─── Tour Step Definition ──────────────────────────────────────────────────────
interface TourStep {
    target: string;          // data-tour attribute value
    title: string;
    description: string;
    position: 'top' | 'bottom' | 'left' | 'right';
    maxSpotlightHeight?: number; // Cap the spotlight height for tall elements
}

const TOUR_STEPS: TourStep[] = [
    {
        target: 'dock',
        title: 'Navigation',
        description: 'Quick access to your classes, calendar, and AI assistant.',
        position: 'top',
    },
    {
        target: 'search',
        title: 'Instant Search',
        description: 'Press ⌘K to instantly find classes, homework, and tools.',
        position: 'top',
    },
    {
        target: 'aurora',
        title: 'Aurora AI',
        description: 'Your study companion for homework help and flashcards.',
        position: 'top',
    },
    {
        target: 'calendar',
        title: 'Calendar',
        description: 'View your tests, homework, and school events in one place.',
        position: 'top',
    },
    {
        target: 'apps',
        title: 'App Drawer',
        description: 'Secondary tools like Games, Writing, and Grade Calculators.',
        position: 'top',
    },
    {
        target: 'notifications',
        title: 'Notifications',
        description: 'Stay updated on upcoming deadlines and system alerts.',
        position: 'top',
    },
    {
        target: 'settings',
        title: 'Preferences',
        description: 'Customize your profile, theme, and study settings.',
        position: 'top',
    },
    {
        target: 'classes',
        title: 'Management',
        description: 'Organize your classes, track assignments, and stay on schedule.',
        position: 'top',
        maxSpotlightHeight: 120,
    },
];

const STORAGE_KEY = 'onboarding-tour-completed';

// ─── Helper: get element rect with padding ─────────────────────────────────────
function getTargetRect(target: string, padding = 12, maxHeight?: number): DOMRect | null {
    const el = document.querySelector(`[data-tour="${target}"]`);
    if (!el) return null;
    const rect = el.getBoundingClientRect();
    const height = maxHeight ? Math.min(rect.height + padding * 2, maxHeight) : rect.height + padding * 2;
    return new DOMRect(
        rect.x - padding,
        rect.y - padding,
        rect.width + padding * 2,
        height
    );
}

// ─── Main Component ────────────────────────────────────────────────────────────
export function OnboardingTour() {
    const [isActive, setIsActive] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);
    const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
    const animFrameRef = useRef<number>(0);
    const { user } = useAuth();

    // Check if the user is new (hasn't completed the tour) — only for logged-in users
    useEffect(() => {
        if (!user) return;
        const timer = setTimeout(() => {
            if (typeof window !== 'undefined') {
                const completed = localStorage.getItem(STORAGE_KEY);
                if (!completed) {
                    setIsActive(true);
                }
            }
        }, 1500); // Delay to let the page render first
        return () => clearTimeout(timer);
    }, [user]);

    // Track target element position
    const updateRect = useCallback(() => {
        if (!isActive) return;
        const step = TOUR_STEPS[currentStep];
        if (!step) return;
        const rect = getTargetRect(step.target, 12, step.maxSpotlightHeight);
        setTargetRect(rect);
        animFrameRef.current = requestAnimationFrame(updateRect);
    }, [isActive, currentStep]);

    useEffect(() => {
        if (isActive) {
            animFrameRef.current = requestAnimationFrame(updateRect);
        }
        return () => cancelAnimationFrame(animFrameRef.current);
    }, [isActive, updateRect]);

    // Navigate steps
    const nextStep = useCallback(() => {
        if (currentStep < TOUR_STEPS.length - 1) {
            setCurrentStep(prev => prev + 1);
        } else {
            completeTour();
        }
    }, [currentStep]);

    const prevStep = useCallback(() => {
        if (currentStep > 0) {
            setCurrentStep(prev => prev - 1);
        }
    }, [currentStep]);

    const completeTour = useCallback(() => {
        setIsActive(false);
        localStorage.setItem(STORAGE_KEY, 'true');
    }, []);

    // Keyboard nav
    useEffect(() => {
        if (!isActive) return;
        const handler = (e: KeyboardEvent) => {
            if (e.key === 'ArrowRight' || e.key === 'Enter') nextStep();
            else if (e.key === 'ArrowLeft') prevStep();
            else if (e.key === 'Escape') completeTour();
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [isActive, nextStep, prevStep, completeTour]);

    // Scroll target into view
    useEffect(() => {
        if (!isActive) return;
        const step = TOUR_STEPS[currentStep];
        if (!step) return;
        const el = document.querySelector(`[data-tour="${step.target}"]`);
        if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    }, [isActive, currentStep]);

    const step = TOUR_STEPS[currentStep];

    // Calculate tooltip position — always stays in viewport
    const getTooltipStyle = (): React.CSSProperties => {
        if (!targetRect) return { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' };

        const tooltipWidth = 340;
        const tooltipHeight = 200; // approximate
        const gap = 16;
        const safeMargin = 16;
        const viewportW = window.innerWidth;
        const viewportH = window.innerHeight;

        // Center horizontally on the target, clamped to viewport
        const centerX = Math.max(
            tooltipWidth / 2 + safeMargin,
            Math.min(viewportW - tooltipWidth / 2 - safeMargin, targetRect.left + targetRect.width / 2)
        );

        // Check available space above and below
        const spaceAbove = targetRect.top - gap;
        const spaceBelow = viewportH - targetRect.bottom - gap;

        // Prefer the step's declared position, but auto-flip if not enough room
        let preferTop = step.position === 'top';
        if (preferTop && spaceAbove < tooltipHeight) preferTop = false;
        if (!preferTop && spaceBelow < tooltipHeight) preferTop = true;

        if (preferTop) {
            // Place above the target, clamped so it doesn't go above viewport
            const bottomPos = viewportH - targetRect.top + gap;
            const clampedBottom = Math.max(safeMargin, Math.min(viewportH - tooltipHeight - safeMargin, bottomPos));
            return {
                bottom: `${clampedBottom}px`,
                left: `${centerX}px`,
                transform: 'translateX(-50%)',
            };
        } else {
            // Place below the target, clamped so it doesn't go below viewport
            const topPos = targetRect.bottom + gap;
            const clampedTop = Math.max(safeMargin, Math.min(viewportH - tooltipHeight - safeMargin, topPos));
            return {
                top: `${clampedTop}px`,
                left: `${centerX}px`,
                transform: 'translateX(-50%)',
            };
        }
    };

    return (
        <AnimatePresence>
            {isActive && (
                <>
                    {/* Dark overlay with spotlight cutout */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="fixed inset-0 z-[100]"
                        style={{ pointerEvents: 'none' }}
                    >
                        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                            <defs>
                                <mask id="spotlight-mask">
                                    <rect width="100%" height="100%" fill="white" />
                                    {targetRect && (
                                        <motion.rect
                                            initial={{ opacity: 0 }}
                                            animate={{
                                                x: targetRect.x,
                                                y: targetRect.y,
                                                width: targetRect.width,
                                                height: targetRect.height,
                                                opacity: 1,
                                            }}
                                            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                                            rx="16"
                                            ry="16"
                                            fill="black"
                                        />
                                    )}
                                </mask>
                            </defs>
                            <rect
                                width="100%"
                                height="100%"
                                fill="rgba(0, 0, 0, 0.55)"
                                mask="url(#spotlight-mask)"
                            />
                        </svg>
                    </motion.div>

                    {/* Subtle spotlight border */}
                    {targetRect && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed z-[101] pointer-events-none rounded-2xl border-2 border-white/25"
                            style={{
                                left: targetRect.x,
                                top: targetRect.y,
                                width: targetRect.width,
                                height: targetRect.height,
                            }}
                        />
                    )}

                    {/* Click blocker */}
                    <div
                        className="fixed inset-0 z-[102]"
                        onClick={(e) => e.stopPropagation()}
                    />

                    {/* Tooltip Card */}
                    <motion.div
                        key={currentStep}
                        initial={{ opacity: 0, y: 8, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.97 }}
                        transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                        className="fixed z-[103] w-[320px] max-w-[calc(100vw-32px)]"
                        style={getTooltipStyle()}
                    >
                        <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-xl border border-gray-200 dark:border-zinc-800 overflow-hidden">
                            <div className="px-5 pt-5 pb-4">
                                {/* Title */}
                                <h3 className="text-[15px] font-semibold text-gray-900 dark:text-white mb-1.5">
                                    {step.title}
                                </h3>

                                {/* Description */}
                                <p className="text-[13px] text-gray-500 dark:text-gray-400 leading-relaxed">
                                    {step.description}
                                </p>
                            </div>

                            {/* Footer */}
                            <div className="px-5 pb-4 flex items-center justify-between">
                                {/* Dot indicators */}
                                <div className="flex items-center gap-1.5">
                                    {TOUR_STEPS.map((_, i) => (
                                        <div
                                            key={i}
                                            className={`h-1.5 rounded-full transition-all duration-300 ${i === currentStep
                                                ? 'w-4 bg-gray-900 dark:bg-white'
                                                : i < currentStep
                                                    ? 'w-1.5 bg-gray-400 dark:bg-gray-500'
                                                    : 'w-1.5 bg-gray-200 dark:bg-zinc-700'
                                                }`}
                                        />
                                    ))}
                                </div>

                                {/* Actions */}
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={currentStep > 0 ? prevStep : completeTour}
                                        className="text-[12px] font-medium text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors px-1"
                                    >
                                        {currentStep > 0 ? 'Back' : 'Skip'}
                                    </button>
                                    <button
                                        onClick={nextStep}
                                        className="flex items-center gap-1 px-3.5 py-1.5 text-[12px] font-semibold text-white bg-gray-900 dark:bg-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100 rounded-lg transition-colors"
                                    >
                                        {currentStep === TOUR_STEPS.length - 1 ? 'Done' : 'Next'}
                                        {currentStep < TOUR_STEPS.length - 1 && (
                                            <ChevronRight className="w-3.5 h-3.5" />
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}

// ─── Hook to manually trigger the tour ─────────────────────────────────────────
export function useOnboardingTour() {
    const resetTour = useCallback(() => {
        localStorage.removeItem(STORAGE_KEY);
        window.location.reload();
    }, []);

    const isCompleted = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY) === 'true' : false;

    return { resetTour, isCompleted };
}
