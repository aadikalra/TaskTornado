'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

// ─── Tour Step Definition ──────────────────────────────────────────────────────
interface TourStep {
  target: string; // data-tour attribute value
  title: string;
  description: string;
  position: 'top' | 'bottom' | 'left' | 'right';
  maxSpotlightHeight?: number;
}

const TOUR_STEPS: TourStep[] = [
  {
    target: 'nav-bar',
    title: 'Main Navigation',
    description: 'Jump between Home, Calendar, Grades, and any extra pages you choose to pin to the top bar.',
    position: 'bottom',
  },
  {
    target: 'search',
    title: 'Instant Search (⌘K)',
    description: 'Search across your classes, homework, tests, and quick actions from anywhere using Search or Command+K.',
    position: 'bottom',
  },
  {
    target: 'aurora',
    title: 'Aurora AI Study Assistant',
    description: 'Open Aurora AI anytime for study explanations, assignment breakdowns, and quick homework help.',
    position: 'bottom',
  },
  {
    target: 'tools',
    title: 'Tools & AI Suite',
    description: 'Open Tools to access Web Saves, the Study Timer, Break Games, Tutorials, Blog, Changelog, and the AI Suite.',
    position: 'bottom',
  },
  {
    target: 'profile',
    title: 'Profile, Edit Nav & Settings',
    description: 'Customize which tabs stay pinned in your top bar with Edit Nav, or visit Settings to re-run setup or this tour anytime.',
    position: 'bottom',
  },
  {
    target: 'calendar-widget',
    title: 'Weekly Overview',
    description: 'See your week at a glance and click any day or event to jump straight into deadlines and tests.',
    position: 'bottom',
    maxSpotlightHeight: 160,
  },
  {
    target: 'classes',
    title: 'My Classes',
    description: 'Expand any course card to view assignments, add homework or tests inside that class, or share class invites.',
    position: 'top',
    maxSpotlightHeight: 160,
  },
  {
    target: 'tests',
    title: 'Upcoming Tests',
    description: 'Track upcoming exams and quizzes by status and date, or add a new test directly from this section.',
    position: 'top',
    maxSpotlightHeight: 360,
  },
];

const COMPLETED_STORAGE_KEY = 'onboarding-tour-completed';
const REQUESTED_STORAGE_KEY = 'onboarding-tour-requested';

interface OnboardingTourProps {
  forceStart?: boolean;
  suppressAutoStart?: boolean;
  onComplete?: () => void;
}

function getVisibleTargetRect(target: string, padding = 12, maxHeight?: number): DOMRect | null {
  const el = document.querySelector(`[data-tour="${target}"]`);
  if (!el) return null;
  const rect = el.getBoundingClientRect();
  if (rect.width <= 0 || rect.height <= 0) return null;
  const height = maxHeight ? Math.min(rect.height + padding * 2, maxHeight) : rect.height + padding * 2;
  return new DOMRect(
    rect.x - padding,
    rect.y - padding,
    rect.width + padding * 2,
    height
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────
export function OnboardingTour({
  forceStart = false,
  suppressAutoStart = false,
  onComplete,
}: OnboardingTourProps = {}) {
  const [isActive, setIsActive] = useState(false);
  const [activeSteps, setActiveSteps] = useState<TourStep[]>(TOUR_STEPS);
  const [currentStep, setCurrentStep] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const animFrameRef = useRef<number>(0);
  const primaryButtonRef = useRef<HTMLButtonElement>(null);
  const { user } = useAuth();

  const startTourNow = useCallback(() => {
    const visibleSteps = TOUR_STEPS.filter((step) => getVisibleTargetRect(step.target) !== null);
    if (visibleSteps.length === 0) {
      localStorage.removeItem(REQUESTED_STORAGE_KEY);
      localStorage.setItem(COMPLETED_STORAGE_KEY, 'true');
      onComplete?.();
      return;
    }
    setActiveSteps(visibleSteps);
    setCurrentStep(0);
    setIsActive(true);
    localStorage.removeItem(REQUESTED_STORAGE_KEY);
  }, [onComplete]);

  // Start only when explicitly triggered (after App Intro or from Settings -> Restart Tour)
  useEffect(() => {
    if (!user || suppressAutoStart || isActive) return;

    if (forceStart) {
      const timer = setTimeout(startTourNow, 200);
      return () => clearTimeout(timer);
    }

    if (typeof window !== 'undefined' && localStorage.getItem(REQUESTED_STORAGE_KEY) === 'true') {
      const timer = setTimeout(startTourNow, 500);
      return () => clearTimeout(timer);
    }
  }, [user, forceStart, suppressAutoStart, isActive, startTourNow]);

  // Track target element position
  const updateRect = useCallback(() => {
    if (!isActive) return;
    const step = activeSteps[currentStep];
    if (!step) return;
    const rect = getVisibleTargetRect(step.target, 12, step.maxSpotlightHeight);
    setTargetRect(rect);
    animFrameRef.current = requestAnimationFrame(updateRect);
  }, [isActive, activeSteps, currentStep]);

  useEffect(() => {
    if (isActive) {
      animFrameRef.current = requestAnimationFrame(updateRect);
    }
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [isActive, updateRect]);

  const completeTour = useCallback(() => {
    setIsActive(false);
    localStorage.removeItem(REQUESTED_STORAGE_KEY);
    localStorage.setItem(COMPLETED_STORAGE_KEY, 'true');
    onComplete?.();
  }, [onComplete]);

  const nextStep = useCallback(() => {
    if (currentStep < activeSteps.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      completeTour();
    }
  }, [currentStep, activeSteps.length, completeTour]);

  const prevStep = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  }, [currentStep]);

  // Programmatic focus routing into the tour step card
  useEffect(() => {
    if (!isActive) return;
    const timer = setTimeout(() => {
      primaryButtonRef.current?.focus();
    }, 60);
    return () => clearTimeout(timer);
  }, [isActive, currentStep]);

  // Keyboard navigation
  useEffect(() => {
    if (!isActive) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') nextStep();
      else if (e.key === 'ArrowLeft') prevStep();
      else if (e.key === 'Escape') completeTour();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isActive, nextStep, prevStep, completeTour]);

  // Scroll target into view when step changes
  useEffect(() => {
    if (!isActive) return;
    const step = activeSteps[currentStep];
    if (!step) return;
    const el = document.querySelector(`[data-tour="${step.target}"]`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [isActive, activeSteps, currentStep]);

  const step = activeSteps[currentStep];

  // Calculate tooltip position — stays within viewport
  const getTooltipStyle = (): React.CSSProperties => {
    if (!targetRect || !step) return { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' };

    const tooltipWidth = 340;
    const tooltipHeight = 200;
    const gap = 16;
    const safeMargin = 16;
    const viewportW = window.innerWidth;
    const viewportH = window.innerHeight;

    const centerX = Math.max(
      tooltipWidth / 2 + safeMargin,
      Math.min(viewportW - tooltipWidth / 2 - safeMargin, targetRect.left + targetRect.width / 2)
    );

    const spaceAbove = targetRect.top - gap;
    const spaceBelow = viewportH - targetRect.bottom - gap;

    let preferTop = step.position === 'top';
    if (preferTop && spaceAbove < tooltipHeight) preferTop = false;
    if (!preferTop && spaceBelow < tooltipHeight) preferTop = true;

    if (preferTop) {
      const bottomPos = viewportH - targetRect.top + gap;
      const clampedBottom = Math.max(safeMargin, Math.min(viewportH - tooltipHeight - safeMargin, bottomPos));
      return {
        bottom: `${clampedBottom}px`,
        left: `${centerX}px`,
        transform: 'translateX(-50%)',
      };
    }

    const topPos = targetRect.bottom + gap;
    const clampedTop = Math.max(safeMargin, Math.min(viewportH - tooltipHeight - safeMargin, topPos));
    return {
      top: `${clampedTop}px`,
      left: `${centerX}px`,
      transform: 'translateX(-50%)',
    };
  };

  return (
    <AnimatePresence>
      {isActive && step && (
        <>
          {/* Dark overlay with spotlight cutout */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
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

          {/* Accessible Tour Tooltip Card */}
          <motion.div
            key={currentStep}
            role="dialog"
            aria-modal="false"
            aria-labelledby="onboarding-tour-title"
            initial={{ opacity: 0, y: 8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 500, damping: 35 }}
            className="fixed z-[103] w-[320px] max-w-[calc(100vw-32px)]"
            style={getTooltipStyle()}
          >
            <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-xl border border-gray-200 dark:border-zinc-800 overflow-hidden">
              <div className="px-5 pt-5 pb-4">
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <h2 id="onboarding-tour-title" className="text-[15px] font-semibold text-gray-900 dark:text-white">
                    {step.title}
                  </h2>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-semibold text-gray-400 dark:text-zinc-500">
                      {currentStep + 1} / {activeSteps.length}
                    </span>
                    <button
                      type="button"
                      onClick={completeTour}
                      aria-label="Close feature tour"
                      className="text-[11px] font-medium text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 px-1 py-0.5 rounded transition-colors"
                    >
                      Skip
                    </button>
                  </div>
                </div>

                <p className="text-[13px] text-gray-500 dark:text-gray-400 leading-relaxed">
                  {step.description}
                </p>
              </div>

              <div className="px-5 pb-4 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  {activeSteps.map((_, i) => (
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

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={currentStep > 0 ? prevStep : completeTour}
                    className="text-[12px] font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors px-1.5 py-1"
                  >
                    {currentStep > 0 ? 'Back' : 'Skip'}
                  </button>
                  <button
                    ref={primaryButtonRef}
                    type="button"
                    onClick={nextStep}
                    className="flex items-center gap-1 px-3.5 py-1.5 text-[12px] font-semibold text-white bg-gray-900 dark:bg-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    {currentStep === activeSteps.length - 1 ? 'Done' : 'Next'}
                    {currentStep < activeSteps.length - 1 && (
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
    localStorage.removeItem(COMPLETED_STORAGE_KEY);
    localStorage.setItem(REQUESTED_STORAGE_KEY, 'true');
    window.location.href = '/dashboard';
  }, []);

  const isCompleted = typeof window !== 'undefined' ? localStorage.getItem(COMPLETED_STORAGE_KEY) === 'true' : false;

  return { resetTour, isCompleted };
}
