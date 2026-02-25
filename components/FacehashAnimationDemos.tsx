'use client';

import React, { useState, useCallback } from 'react';
import { Facehash } from 'facehash';
import { motion, AnimatePresence, useAnimationControls } from 'framer-motion';

const COLORS = [
    '#3b82f6', '#6366f1', '#8b5cf6', '#ec4899',
    '#f43f5e', '#f59e0b', '#10b981', '#14b8a6',
    '#06b6d4', '#0ea5e9', '#f97316', '#64748b',
];

// ─── Overdue Peek Demo ─────────────────────────────────────────────────────────
function OverduePeekDemo() {
    const controls = useAnimationControls();
    const [showFrown, setShowFrown] = useState(false);
    const [playing, setPlaying] = useState(false);

    const play = useCallback(async () => {
        if (playing) return;
        setPlaying(true);
        // Slide toward the "card"
        await controls.start({
            x: 60, y: 8, rotate: -8,
            transition: { type: 'spring', stiffness: 60, damping: 16 },
        });
        setShowFrown(true);
        await new Promise(r => setTimeout(r, 2000));
        setShowFrown(false);
        await controls.start({
            x: 0, y: 0, rotate: 0,
            transition: { type: 'spring', stiffness: 80, damping: 18 },
        });
        setPlaying(false);
    }, [controls, playing]);

    return (
        <div className="flex items-center gap-4">
            <motion.div animate={controls} className="shrink-0 rounded-2xl overflow-hidden">
                <Facehash
                    name="Demo"
                    size={56}
                    enableBlink={!showFrown}
                    intensity3d="dramatic"
                    colors={COLORS}
                    style={{ borderRadius: '14px' }}
                    onRenderMouth={showFrown ? () => (
                        <svg width="18" height="10" viewBox="0 0 18 10" fill="none">
                            <path d="M3 8C5.5 4 12.5 4 15 8" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                        </svg>
                    ) : undefined}
                    showInitial={!showFrown}
                />
            </motion.div>
            {/* Fake "overdue card" target */}
            <div className="w-20 h-14 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 flex items-center justify-center">
                <span className="text-[9px] text-red-400 dark:text-red-500 font-medium">Overdue!</span>
            </div>
            <button
                onClick={play}
                disabled={playing}
                className="ml-auto text-xs px-4 py-2 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 font-medium"
            >
                {playing ? 'Playing...' : '▶ Play'}
            </button>
        </div>
    );
}

// ─── Sleepy Head Demo ───────────────────────────────────────────────────────────
function SleepyHeadDemo() {
    const controls = useAnimationControls();
    const [showSleepy, setShowSleepy] = useState(false);
    const [playing, setPlaying] = useState(false);

    const play = useCallback(async () => {
        if (playing) return;
        setPlaying(true);
        setShowSleepy(true);
        await controls.start({
            rotate: 20, y: 6,
            transition: { type: 'spring', stiffness: 30, damping: 12 },
        });
        await new Promise(r => setTimeout(r, 3000));
        setShowSleepy(false);
        await controls.start({
            rotate: 0, y: 0,
            transition: { type: 'spring', stiffness: 120, damping: 14 },
        });
        setPlaying(false);
    }, [controls, playing]);

    return (
        <div className="flex items-center gap-4">
            <div className="relative shrink-0">
                <motion.div animate={controls} className="rounded-2xl overflow-hidden">
                    <Facehash
                        name="Sleepy"
                        size={56}
                        enableBlink={!showSleepy}
                        intensity3d="dramatic"
                        colors={COLORS}
                        style={{ borderRadius: '14px' }}
                        onRenderMouth={showSleepy ? () => (
                            <svg width="16" height="6" viewBox="0 0 16 6" fill="none">
                                <path d="M3 2C5.5 4.5 10.5 4.5 13 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                            </svg>
                        ) : undefined}
                        showInitial={!showSleepy}
                    />
                </motion.div>
                {/* Pillow */}
                <AnimatePresence>
                    {showSleepy && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.5 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.5 }}
                            className="absolute -bottom-2.5 -left-2 -right-2 z-[-1]"
                        >
                            <svg viewBox="0 0 60 18" fill="none" className="w-full">
                                <rect x="2" y="3" width="56" height="14" rx="6" fill="white" stroke="#e5e7eb" strokeWidth="1" />
                                <ellipse cx="14" cy="8" rx="5" ry="3" fill="#f3f4f6" opacity="0.8" />
                                <ellipse cx="46" cy="8" rx="5" ry="3" fill="#f3f4f6" opacity="0.8" />
                            </svg>
                        </motion.div>
                    )}
                </AnimatePresence>
                {/* Zzz bubbles */}
                <AnimatePresence>
                    {showSleepy && [0, 1, 2].map(i => (
                        <motion.span
                            key={i}
                            initial={{ opacity: 0, y: 0, x: 24 + i * 6, scale: 0.6 }}
                            animate={{
                                opacity: [0, 1, 1, 0],
                                y: [-4, -14 - i * 10],
                                scale: [0.6, 0.7 + i * 0.15],
                            }}
                            transition={{ duration: 2, delay: i * 0.6, repeat: Infinity }}
                            className="absolute top-0 text-blue-400/60 dark:text-blue-300/50 font-bold pointer-events-none"
                            style={{ fontSize: `${9 + i * 2}px` }}
                        >
                            z
                        </motion.span>
                    ))}
                </AnimatePresence>
            </div>
            <button
                onClick={play}
                disabled={playing}
                className="ml-auto text-xs px-4 py-2 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 font-medium"
            >
                {playing ? 'Playing...' : '▶ Play'}
            </button>
        </div>
    );
}

// ─── Celebration Dance Demo ─────────────────────────────────────────────────────
function CelebrationDemo() {
    const controls = useAnimationControls();
    const [showParty, setShowParty] = useState(false);
    const [playing, setPlaying] = useState(false);

    const play = useCallback(async () => {
        if (playing) return;
        setPlaying(true);
        setShowParty(true);

        // Phase 1: Anticipation squish
        await controls.start({
            scaleX: 1.12, scaleY: 0.88, y: 4, rotate: 0,
            transition: { duration: 0.25, ease: 'easeOut' },
        });
        // Phase 2: Launch with backflip
        await controls.start({
            scaleX: 0.9, scaleY: 1.1, y: -20, rotate: 360,
            transition: { duration: 0.4, ease: [0.2, 0.8, 0.3, 1] },
        });
        // Phase 3: Apex hang
        await controls.start({
            y: -22, rotate: 370,
            transition: { duration: 0.15, ease: 'easeOut' },
        });
        // Phase 4: Landing squish
        await controls.start({
            scaleX: 1.15, scaleY: 0.85, y: 2, rotate: 360,
            transition: { duration: 0.2, ease: [0.6, 0, 0.8, 1] },
        });
        // Phase 5: Settle bounce
        await controls.start({
            scaleX: 1, scaleY: 1, y: 0, rotate: 0,
            transition: { type: 'spring', stiffness: 300, damping: 15 },
        });

        setShowParty(false);
        setPlaying(false);
    }, [controls, playing]);

    return (
        <div className="flex items-center gap-4">
            <motion.div animate={controls} className="shrink-0 rounded-2xl overflow-hidden">
                <Facehash
                    name="Party"
                    size={56}
                    enableBlink
                    intensity3d="dramatic"
                    colors={COLORS}
                    style={{ borderRadius: '14px' }}
                    onRenderMouth={showParty ? () => (
                        <svg width="18" height="10" viewBox="0 0 18 10" fill="none">
                            <path d="M3 3C5.5 8 12.5 8 15 3" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                        </svg>
                    ) : undefined}
                    showInitial={!showParty}
                />
            </motion.div>
            <button
                onClick={play}
                disabled={playing}
                className="ml-auto text-xs px-4 py-2 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 font-medium"
            >
                {playing ? 'Playing...' : '▶ Play'}
            </button>
        </div>
    );
}

// ─── Victory Lap Demo ───────────────────────────────────────────────────────────
function VictoryLapDemo() {
    const controls = useAnimationControls();
    const [showCrown, setShowCrown] = useState(false);
    const [showVictory, setShowVictory] = useState(false);
    const [playing, setPlaying] = useState(false);

    const play = useCallback(async () => {
        if (playing) return;
        setPlaying(true);
        setShowVictory(true);

        // Rise
        await controls.start({
            y: -10, scale: 1.06,
            transition: { duration: 0.8, ease: [0.2, 0.8, 0.3, 1] },
        });
        setShowCrown(true);
        // Hover bob
        await controls.start({
            y: [-10, -13, -10, -12, -10],
            transition: { duration: 2.5, ease: 'easeInOut' },
        });
        // Descend
        setShowCrown(false);
        setShowVictory(false);
        await controls.start({
            y: 0, scale: 1,
            transition: { duration: 0.6, type: 'spring', stiffness: 100, damping: 14 },
        });
        setPlaying(false);
    }, [controls, playing]);

    return (
        <div className="flex items-center gap-4">
            <div className="relative shrink-0">
                <motion.div animate={controls} className="rounded-2xl overflow-hidden">
                    <Facehash
                        name="Victory"
                        size={56}
                        enableBlink
                        intensity3d="dramatic"
                        colors={COLORS}
                        style={{ borderRadius: '14px' }}
                        onRenderMouth={showVictory ? () => (
                            <svg width="18" height="10" viewBox="0 0 18 10" fill="none">
                                <path d="M3 3C5.5 8 12.5 8 15 3" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                            </svg>
                        ) : undefined}
                        showInitial={!showVictory}
                    />
                </motion.div>
                {/* Crown */}
                <AnimatePresence>
                    {showCrown && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.3 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.3 }}
                            transition={{ type: 'spring', stiffness: 260, damping: 20 }}
                            className="absolute -top-6 left-1/2 -translate-x-1/2 pointer-events-none"
                        >
                            <svg width="32" height="24" viewBox="0 0 40 28" fill="none">
                                <path d="M4 24L2 8L10 16L20 4L30 16L38 8L36 24H4Z" fill="#facc15" stroke="#eab308" strokeWidth="1.5" strokeLinejoin="round" />
                                <circle cx="10" cy="22" r="2" fill="#ef4444" />
                                <circle cx="20" cy="20" r="2.5" fill="#3b82f6" />
                                <circle cx="30" cy="22" r="2" fill="#22c55e" />
                            </svg>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
            <button
                onClick={play}
                disabled={playing}
                className="ml-auto text-xs px-4 py-2 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 font-medium"
            >
                {playing ? 'Playing...' : '▶ Play'}
            </button>
        </div>
    );
}

// ─── Exported Combined Component ─────────────────────────────────────────────
export function AnimationDemo({ type }: { type: 'overdue' | 'sleepy' | 'celebration' | 'victory' }) {
    return (
        <div className="not-prose my-4 p-5 rounded-2xl bg-gray-50 dark:bg-zinc-900/60 border border-gray-100 dark:border-zinc-800">
            {type === 'overdue' && <OverduePeekDemo />}
            {type === 'sleepy' && <SleepyHeadDemo />}
            {type === 'celebration' && <CelebrationDemo />}
            {type === 'victory' && <VictoryLapDemo />}
        </div>
    );
}
