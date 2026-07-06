'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence, useAnimationControls } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { useClassContext } from '@/context/ClassContext';
import { useMainApp } from '@/context/MainAppContext';
import { Facehash } from 'facehash';
import { HugeIcon } from '@/lib/huge-icon-map';

export const MainAppHeader = () => {
  const { user, full_name } = useAuth();
  const { homeworks } = useClassContext();
  const { setShowBracket, showBracket } = useMainApp();

  const timeGreeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 6) return { text: 'Burning the Midnight Oil' };
    if (hour < 12) return { text: 'Good Morning' };
    if (hour < 17) return { text: 'Good Afternoon' };
    if (hour < 21) return { text: 'Good Evening' };
    return { text: 'Late Night Grind' };
  }, []);

  // ─── Facehash Joke Feature ──────────────────────────────────────────────────
  const [joke, setJoke] = useState<string | null>(null);
  const [jokeLoading, setJokeLoading] = useState(false);
  const jokeTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  const fetchJoke = useCallback(async () => {
    if (jokeLoading) return;
    setJokeLoading(true);
    try {
      const res = await fetch('https://icanhazdadjoke.com/', {
        headers: { 'Accept': 'application/json' },
      });
      const data = await res.json();
      setJoke(data.joke);
      // Auto-dismiss after 8 seconds
      if (jokeTimeoutRef.current) clearTimeout(jokeTimeoutRef.current);
      jokeTimeoutRef.current = setTimeout(() => setJoke(null), 8000);
    } catch {
      setJoke("Why did the student eat their homework? Because their teacher said it was a piece of cake!");
      if (jokeTimeoutRef.current) clearTimeout(jokeTimeoutRef.current);
      jokeTimeoutRef.current = setTimeout(() => setJoke(null), 8000);
    } finally {
      setJokeLoading(false);
    }
  }, [jokeLoading]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (jokeTimeoutRef.current) clearTimeout(jokeTimeoutRef.current);
    };
  }, []);

  // ─── Facehash "Overdue Peek" Animation ──────────────────────────────────────
  const facehashRef = React.useRef<HTMLDivElement>(null);
  const facehashControls = useAnimationControls();
  const [hasPlayedOverduePeek, setHasPlayedOverduePeek] = useState(false);
  const [showFrowny, setShowFrowny] = useState(false);
  const [showSleepy, setShowSleepy] = useState(false);
  const [showParty, setShowParty] = useState(false);
  const [showVictory, setShowVictory] = useState(false);
  const prevCompletionCountRef = React.useRef(0);
  const victoryAnimatingRef = React.useRef(false);

  // Memoized: overdue homework count
  const overdueCount = useMemo(() => {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    return homeworks.filter((hw: any) => !hw.completed && new Date(hw.dueDate) < todayStart).length;
  }, [homeworks]);

  // Initial appear animation
  useEffect(() => {
    facehashControls.start({
      scale: 1,
      opacity: 1,
      transition: { delay: 0.1, type: 'spring', stiffness: 300, damping: 20 },
    });
  }, [facehashControls]);

  // ─── Facehash "Sleepy Head" — Persistent from 10:30 PM to 5 AM ─────────────
  const isLateNight = useMemo(() => {
    const now = new Date();
    const hour = now.getHours();
    const minutes = now.getMinutes();
    return (hour === 22 && minutes >= 30) || hour >= 23 || hour < 5;
  }, []);

  useEffect(() => {
    if (!isLateNight) return;

    const delay = overdueCount > 0 ? 8000 : 500;
    const timer = setTimeout(() => {
      if (showFrowny || joke) return;
      setShowSleepy(true);

      facehashControls.start({
        rotate: 20,
        y: 6,
        transition: { type: 'spring', stiffness: 30, damping: 12 },
      });
    }, delay);

    return () => clearTimeout(timer);
  }, [isLateNight, overdueCount, showFrowny, joke, facehashControls]);

  // ─── Facehash "Celebration Dance" Animation ───────────────────────────────────
  const playPartyAnimation = useCallback(() => {
    setShowParty(true);
    facehashControls.start({
      scaleX: 1.12,
      scaleY: 0.88,
      y: 4,
      rotate: 0,
      transition: { duration: 0.15, ease: 'easeIn' },
    }).then(() => {
      return facehashControls.start({
        scaleX: 0.9,
        scaleY: 1.1,
        y: -30,
        rotate: -360,
        transition: { duration: 0.5, ease: [0.2, 0.8, 0.2, 1] },
      });
    }).then(() => {
      return new Promise(resolve => setTimeout(resolve, 80));
    }).then(() => {
      return facehashControls.start({
        scaleX: 1.15,
        scaleY: 0.85,
        y: 3,
        rotate: 0,
        transition: { duration: 0.25, ease: 'easeIn' },
      });
    }).then(() => {
      return facehashControls.start({
        scaleX: 1,
        scaleY: 1,
        y: -6,
        transition: { duration: 0.2, type: 'spring', stiffness: 400, damping: 12 },
      });
    }).then(() => {
      return facehashControls.start({
        y: 0,
        transition: { duration: 0.3, type: 'spring', stiffness: 300, damping: 15 },
      });
    }).then(() => {
      setShowParty(false);
    });
  }, [facehashControls]);

  // ─── Facehash "100% Victory Lap" Animation ──────────────────────────────────
  const playVictoryAnimation = useCallback(() => {
    if (victoryAnimatingRef.current) return;
    victoryAnimatingRef.current = true;
    setShowVictory(true);
    setShowParty(false);

    facehashControls.start({
      y: -10,
      scale: 1.06,
      rotate: 0,
      transition: { duration: 0.8, ease: [0.2, 0.8, 0.3, 1] },
    }).then(() => {
      return facehashControls.start({
        y: [-10, -13, -10, -12, -10],
        transition: { duration: 2.5, ease: 'easeInOut' },
      });
    }).then(() => {
      setShowVictory(false);
      return facehashControls.start({
        y: 0,
        scale: 1,
        transition: { duration: 0.6, type: 'spring', stiffness: 100, damping: 14 },
      });
    }).then(() => {
      victoryAnimatingRef.current = false;
    });
  }, [facehashControls]);

  const completionCount = useMemo(() => homeworks.filter((hw: any) => hw.completed).length, [homeworks]);
  const totalHomeworkCount = homeworks.length;

  useEffect(() => {
    if (completionCount > prevCompletionCountRef.current && prevCompletionCountRef.current > 0) {
      if (totalHomeworkCount > 0 && completionCount === totalHomeworkCount) {
        playVictoryAnimation();
      } else {
        playPartyAnimation();
      }
    }
    prevCompletionCountRef.current = completionCount;
  }, [completionCount, totalHomeworkCount, playPartyAnimation, playVictoryAnimation]);

  const completionRate = useMemo(() => {
    if (homeworks.length === 0) return 0;
    return Math.round((homeworks.filter((hw: any) => hw.completed).length / homeworks.length) * 100);
  }, [homeworks]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-6"
    >
      <div className="flex items-center gap-4 sm:gap-5">
        {/* Facehash Avatar — clickable for jokes */}
        <div className="relative shrink-0" ref={facehashRef}>
          <div className="relative">
            {/* Pillow + zzz during sleepy animation */}
            <AnimatePresence>
              {showSleepy && (
                <>
                  <motion.div
                    initial={{ opacity: 0, scale: 0.7, x: 5 }}
                    animate={{ opacity: 1, scale: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ type: 'spring', stiffness: 200, damping: 20, delay: 0.3 }}
                    className="absolute -bottom-3 -left-4 pointer-events-none select-none z-0"
                  >
                    <svg width="48" height="24" viewBox="0 0 48 24" fill="none">
                      <rect x="2" y="4" width="44" height="18" rx="6" fill="#e0e7ff" className="dark:fill-indigo-900/60" />
                      <ellipse cx="12" cy="11" rx="6" ry="5" fill="#eef2ff" className="dark:fill-indigo-800/40" />
                      <ellipse cx="36" cy="11" rx="6" ry="5" fill="#eef2ff" className="dark:fill-indigo-800/40" />
                      <rect x="2" y="4" width="44" height="18" rx="6" stroke="#c7d2fe" strokeWidth="1" fill="none" className="dark:stroke-indigo-700/50" />
                    </svg>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.4 }}
                    className="absolute -top-4 -right-3 pointer-events-none select-none z-20"
                  >
                    <motion.span
                      animate={{ y: [0, -4, 0], opacity: [0.4, 1, 0.4] }}
                      transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                      className="text-[10px] font-bold text-indigo-300 dark:text-indigo-400/60 block"
                    >
                      z
                    </motion.span>
                    <motion.span
                      animate={{ y: [0, -3, 0], opacity: [0.3, 0.8, 0.3] }}
                      transition={{ duration: 2.3, repeat: Infinity, ease: 'easeInOut', delay: 0.4 }}
                      className="text-xs font-bold text-teal-300 dark:text-teal-400/60 block -mt-1 ml-1"
                    >
                      z
                    </motion.span>
                    <motion.span
                      animate={{ y: [0, -5, 0], opacity: [0.2, 0.7, 0.2] }}
                      transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut', delay: 0.8 }}
                      className="text-sm font-bold text-teal-300 dark:text-teal-400/60 block -mt-1 ml-2.5"
                    >
                      z
                    </motion.span>
                  </motion.div>
                </>
              )}
            </AnimatePresence>

            {/* Golden crown when all homework is done */}
            <AnimatePresence>
              {completionRate === 100 && homeworks.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.3 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.5 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 14, delay: 0.5 }}
                  className="absolute -top-8 left-1/2 -translate-x-1/2 pointer-events-none select-none z-30"
                >
                  <svg width="44" height="32" viewBox="0 0 44 32" fill="none">
                    <ellipse cx="22" cy="26" rx="16" ry="5" fill="#fbbf24" opacity="0.2" />
                    <path
                      d="M5 24L2 8L12 16L22 4L32 16L42 8L39 24H5Z"
                      fill="#f59e0b"
                      stroke="#d97706"
                      strokeWidth="1"
                    />
                    <rect x="5" y="24" width="34" height="4" rx="1" fill="#d97706" />
                    <circle cx="14" cy="18" r="2.5" fill="#fbbf24" />
                    <circle cx="22" cy="12" r="3" fill="#fcd34d" />
                    <circle cx="30" cy="18" r="2.5" fill="#fbbf24" />
                  </svg>
                  <motion.div
                    animate={{ opacity: [0, 1, 0], scale: [0.8, 1.2, 0.8] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                    className="absolute -top-2 -left-2"
                  >
                    <span className="text-[10px]">✨</span>
                  </motion.div>
                  <motion.div
                    animate={{ opacity: [0, 1, 0], scale: [0.8, 1.2, 0.8] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
                    className="absolute -top-2 -right-2"
                  >
                    <span className="text-[10px]">✨</span>
                  </motion.div>
                  <motion.div
                    animate={{ opacity: [0, 1, 0], scale: [0.8, 1.3, 0.8] }}
                    transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
                    className="absolute -top-1 left-1/2 -translate-x-1/2"
                  >
                    <span className="text-[8px]">⭐</span>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={facehashControls}
              whileTap={{ scale: 0.92 }}
              transition={{ delay: 0.1, type: 'spring', stiffness: 300, damping: 20 }}
              className="rounded-2xl overflow-hidden shadow-md cursor-pointer select-none z-10 relative"
              onClick={fetchJoke}
              title="Click me for a joke!"
            >
              <Facehash
                name={(full_name?.split(' ')[0]) || user?.email || 'Student'}
                size={64}
                enableBlink={!showSleepy}
                intensity3d="dramatic"
                showInitial={!showFrowny && !showSleepy && !showParty && !showVictory}
                colors={[
                  '#3b82f6', '#6366f1', '#8b5cf6', '#ec4899',
                  '#f43f5e', '#f59e0b', '#10b981', '#14b8a6',
                  '#06b6d4', '#0ea5e9', '#f97316', '#64748b',
                ]}
                style={{ borderRadius: '16px' }}
                onRenderMouth={
                  showVictory ? () => (
                    <svg width="24" height="14" viewBox="0 0 24 14" fill="none">
                      <path
                        d="M3 3C5 11 19 11 21 3"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                      />
                      <path
                        d="M7 6C9 9 15 9 17 6"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        opacity="0.4"
                      />
                    </svg>
                  ) : showParty ? () => (
                    <svg width="24" height="12" viewBox="0 0 24 12" fill="none">
                      <path
                        d="M2 2C6 10 18 10 22 2"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                      />
                    </svg>
                  ) : showFrowny ? () => (
                    <svg width="20" height="12" viewBox="0 0 20 12" fill="none">
                      <path
                        d="M2 10C5 4 10 2 18 4"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                      />
                    </svg>
                  ) : showSleepy ? () => (
                    <svg width="16" height="6" viewBox="0 0 16 6" fill="none">
                      <path
                        d="M3 2C5.5 4.5 10.5 4.5 13 2"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                    </svg>
                  ) : undefined
                }
              />
            </motion.div>
          </div>

          {/* Joke Speech Bubble */}
          <AnimatePresence>
            {joke && (
              <motion.div
                initial={{ opacity: 0, scale: 0.85, y: 5 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 5 }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                className="absolute left-0 top-full mt-2 z-50 w-64 sm:w-72 cursor-pointer"
                onClick={() => { setJoke(null); if (jokeTimeoutRef.current) clearTimeout(jokeTimeoutRef.current); }}
              >
                <div className="absolute -top-1.5 left-5 w-3 h-3 bg-white dark:bg-gray-800 border-l border-t border-gray-200 dark:border-gray-700 rotate-45" />
                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-3 shadow-lg">
                  <p className="text-xs leading-relaxed text-gray-700 dark:text-gray-300">
                    {joke}
                  </p>
                  <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1.5 text-right">
                    tap to dismiss · click me again for another
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex-1 min-w-0 flex items-center gap-2 sm:gap-3">
          <h1 className="text-3xl sm:text-4xl lg:text-[52px] font-bold text-sky-500 dark:text-sky-400 leading-[1.08] tracking-tight">
            {timeGreeting.text}, {full_name?.split(' ')[0] || 'Student'}!
          </h1>
          <button
            onClick={() => setShowBracket(true)}
            className="shrink-0 group relative p-2 rounded-xl bg-sky-50 dark:bg-sky-500/10 border border-sky-100 dark:border-sky-500/20 hover:bg-sky-100 dark:hover:bg-sky-500/20 hover:border-sky-200 dark:hover:border-sky-500/30 transition-all duration-300 active:scale-90 self-center"
            title="Task Bracket"
          >
            <HugeIcon name="Sword03" size={16} className="w-4 h-4 sm:w-5 sm:h-5 text-sky-400 dark:text-sky-400 group-hover:text-sky-500 transition-colors" />
            <span className="absolute inset-0 rounded-xl animate-ping bg-sky-400/10 pointer-events-none" style={{ animationDuration: '3s' }} />
          </button>
        </div>
      </div>
    </motion.div>
  );
};
