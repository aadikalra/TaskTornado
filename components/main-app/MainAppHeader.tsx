'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence, useAnimationControls } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { useHomeworkContext } from '@/context/HomeworkContext';
import { useMainApp } from '@/context/MainAppContext';
import { PixelCat } from '@/components/PixelCat';

import { useCatFriendship, feedCatTreat } from '@/lib/catTreats';

export const MainAppHeader = () => {
  const { user, full_name } = useAuth();
  const { homeworks } = useHomeworkContext();

  const timeGreeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 6) return { text: 'Burning the Midnight Oil' };
    if (hour < 12) return { text: 'Good Morning' };
    if (hour < 17) return { text: 'Good Afternoon' };
    if (hour < 21) return { text: 'Good Evening' };
    return { text: 'Late Night Grind' };
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
      if (showFrowny) return;
      setShowSleepy(true);

      facehashControls.start({
        rotate: 20,
        y: 6,
        transition: { type: 'spring', stiffness: 30, damping: 12 },
      });
    }, delay);

    return () => clearTimeout(timer);
  }, [isLateNight, overdueCount, showFrowny, facehashControls]);

  // ─── Overdue Peek Animation ─────────────────────────────────────────────────
  useEffect(() => {
    if (overdueCount === 0 || hasPlayedOverduePeek) return;
    setHasPlayedOverduePeek(true);
    setShowFrowny(true);

    const sequence = async () => {
      await facehashControls.start({
        rotate: -12,
        y: -4,
        transition: { type: 'spring', stiffness: 400, damping: 15 },
      });
      await facehashControls.start({
        rotate: 0,
        y: 0,
        transition: { type: 'spring', stiffness: 200, damping: 12, delay: 1.2 },
      });
      setShowFrowny(false);
    };
    sequence();
  }, [overdueCount, hasPlayedOverduePeek, facehashControls]);

  // ─── Facehash "Celebration Dance" Animation ───────────────────────────────────
  const playPartyAnimation = useCallback(() => {
    setShowParty(true);
    facehashControls.start({
      rotate: [0, -15, 15, -10, 10, 0],
      y: [0, -8, 0, -4, 0],
      scale: [1, 1.15, 1.05, 1],
      transition: { duration: 0.8, ease: 'easeInOut' },
    }).then(() => {
      setShowParty(false);
    });
  }, [facehashControls]);

  // ─── Facehash "100% Victory Lap" Animation ──────────────────────────────────
  const playVictoryAnimation = useCallback(() => {
    if (victoryAnimatingRef.current) return;
    victoryAnimatingRef.current = true;
    setShowVictory(true);

    facehashControls.start({
      rotate: [0, -20, 20, -15, 15, 0],
      scale: [1, 1.25, 1.1, 1.2, 1],
      y: [0, -12, -4, -8, 0],
      transition: { duration: 1.2, ease: 'easeInOut' },
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
      className="mb-3 sm:mb-3.5"
    >
      <div className="flex items-center gap-2.5 sm:gap-4">
        {/* Cat Avatar */}
        <div className="relative shrink-0 flex items-center" ref={facehashRef}>
          <div className="relative flex items-center">
            <PixelCat
              name={(full_name?.split(' ')[0]) || user?.email || 'Student'}
              size="clamp(44px, 12vw, 60px)"
              is100PercentDone={completionRate === 100 && homeworks.length > 0}
            />
          </div>
        </div>

        <div className="flex-1 min-w-0 flex items-center">
          <h1 className="text-xl min-[390px]:text-2xl sm:text-4xl lg:text-[52px] font-bold text-sky-500 dark:text-sky-400 leading-[1.08] tracking-tight">
            {timeGreeting.text}, {full_name?.split(' ')[0] || 'Student'}!
          </h1>
        </div>
      </div>
    </motion.div>
  );
};
