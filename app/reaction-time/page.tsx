'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useClassContext } from '@/context/ClassContext';
import { useRequireAuth } from '@/hooks/use-require-auth';
import { ArrowLeft, RotateCcw, Trophy, Zap, Timer, AlertTriangle, Play, Target } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

const GAME_DURATION = 30; // seconds
const COLORS = [
    { bg: '#38bdf8', name: 'sky' },
    { bg: '#a78bfa', name: 'violet' },
    { bg: '#fb923c', name: 'orange' },
    { bg: '#34d399', name: 'emerald' },
    { bg: '#f472b6', name: 'pink' },
];

function ReactionTimeGame({ shrinkSpeed }: { shrinkSpeed: number }) {
    const [targets, setTargets] = useState<{ id: number; x: number; y: number; size: number; color: string; createdAt: number }[]>([]);
    const [score, setScore] = useState(0);
    const [missed, setMissed] = useState(0);
    const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
    const [gameStarted, setGameStarted] = useState(false);
    const [gameOver, setGameOver] = useState(false);
    const [bestReaction, setBestReaction] = useState<number | null>(null);
    const [totalReaction, setTotalReaction] = useState(0);
    const [hits, setHits] = useState(0);
    const boardRef = useRef<HTMLDivElement>(null);
    const targetIdRef = useRef(0);
    const spawnIntervalRef = useRef<NodeJS.Timeout | null>(null);

    const startGame = () => {
        setScore(0);
        setMissed(0);
        setTimeLeft(GAME_DURATION);
        setGameOver(false);
        setTargets([]);
        setBestReaction(null);
        setTotalReaction(0);
        setHits(0);
        targetIdRef.current = 0;
        setGameStarted(true);
    };

    // Spawn targets
    useEffect(() => {
        if (!gameStarted || gameOver) return;

        const spawn = () => {
            const color = COLORS[Math.floor(Math.random() * COLORS.length)];
            const size = 40 + Math.floor(Math.random() * 30);
            const x = 20 + Math.random() * (100 - 40 - 10);
            const y = 20 + Math.random() * (100 - 40 - 10);

            setTargets(prev => {
                // Max 4 targets on screen
                const active = prev.length < 4 ? prev : prev.slice(1);
                return [...active, {
                    id: targetIdRef.current++,
                    x, y, size,
                    color: color.bg,
                    createdAt: Date.now(),
                }];
            });
        };

        spawn();
        const baseInterval = 1200;
        const interval = Math.max(500, baseInterval - shrinkSpeed * 50);
        spawnIntervalRef.current = setInterval(spawn, interval);

        return () => {
            if (spawnIntervalRef.current) clearInterval(spawnIntervalRef.current);
        };
    }, [gameStarted, gameOver, shrinkSpeed]);

    // Timer
    useEffect(() => {
        if (!gameStarted || gameOver) return;

        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    setGameOver(true);
                    if (spawnIntervalRef.current) clearInterval(spawnIntervalRef.current);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [gameStarted, gameOver]);

    // Remove expired targets (give them a lifetime)
    useEffect(() => {
        if (!gameStarted || gameOver) return;

        const cleanup = setInterval(() => {
            const now = Date.now();
            const lifetime = Math.max(1400, 2500 - shrinkSpeed * 80);

            setTargets(prev => {
                const expired = prev.filter(t => now - t.createdAt > lifetime);
                if (expired.length > 0) {
                    setMissed(m => m + expired.length);
                }
                return prev.filter(t => now - t.createdAt <= lifetime);
            });
        }, 100);

        return () => clearInterval(cleanup);
    }, [gameStarted, gameOver, shrinkSpeed]);

    const handleTargetClick = (id: number, createdAt: number) => {
        const reactionTime = Date.now() - createdAt;
        const bonus = reactionTime < 300 ? 5 : reactionTime < 500 ? 3 : 1;

        setScore(s => s + 10 + bonus);
        setTargets(prev => prev.filter(t => t.id !== id));
        setHits(h => h + 1);
        setTotalReaction(t => t + reactionTime);

        if (!bestReaction || reactionTime < bestReaction) {
            setBestReaction(reactionTime);
        }
    };

    const avgReaction = hits > 0 ? Math.round(totalReaction / hits) : 0;
    const accuracy = (hits + missed) > 0 ? Math.round((hits / (hits + missed)) * 100) : 0;

    return (
        <div className="flex flex-col items-center w-full max-w-2xl">
            {/* Stats bar */}
            <div className="flex items-center gap-3 mb-5 w-full flex-wrap">
                <div className="flex-1 flex items-center gap-2 px-4 py-2.5 bg-white/60 dark:bg-gray-900 border border-sky-100 dark:border-gray-800 rounded-2xl min-w-fit">
                    <Trophy className="w-4 h-4 text-sky-500" />
                    <span className="text-sm font-bold text-sky-900 dark:text-white">{score}</span>
                    <span className="text-[11px] text-sky-500/50 font-medium">pts</span>
                </div>
                <div className="flex-1 flex items-center gap-2 px-4 py-2.5 bg-white/60 dark:bg-gray-900 border border-sky-100 dark:border-gray-800 rounded-2xl min-w-fit">
                    <Target className="w-4 h-4 text-emerald-500" />
                    <span className="text-sm font-bold text-sky-900 dark:text-white">{hits}</span>
                    <span className="text-[11px] text-sky-500/50 font-medium">hits</span>
                </div>
                <div className="flex-1 flex items-center gap-2 px-4 py-2.5 bg-white/60 dark:bg-gray-900 border border-sky-100 dark:border-gray-800 rounded-2xl min-w-fit">
                    <Timer className="w-4 h-4 text-sky-500" />
                    <span className={`text-sm font-bold ${timeLeft <= 5 ? 'text-red-500' : 'text-sky-900 dark:text-white'}`}>{timeLeft}s</span>
                </div>
                {gameStarted && (
                    <button
                        onClick={startGame}
                        className="p-2 text-sky-500 hover:text-sky-700 dark:hover:text-sky-300 hover:bg-sky-50 dark:hover:bg-gray-800 rounded-xl transition-colors"
                    >
                        <RotateCcw className="w-4 h-4" />
                    </button>
                )}
            </div>

            {/* Game board */}
            <div
                ref={boardRef}
                className="relative w-full bg-white/40 dark:bg-gray-900/40 border border-sky-100 dark:border-gray-800 rounded-2xl overflow-hidden"
                style={{ height: '420px' }}
            >
                {!gameStarted && !gameOver && (
                    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-4">
                        <h2 className="text-2xl font-bold text-sky-900 dark:text-white">Reaction Time</h2>
                        <p className="text-sm text-sky-600/50 dark:text-sky-400/50 text-center max-w-xs">
                            Click the targets as fast as you can! 30 seconds on the clock.
                        </p>
                        <button
                            onClick={startGame}
                            className="flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-sky-700 bg-[#ebf6b5] hover:bg-[#e0efa0] border border-[#d4e88e] rounded-full transition-colors"
                        >
                            <Play className="w-4 h-4" />
                            Start Game
                        </button>
                    </div>
                )}

                {/* Targets */}
                <AnimatePresence>
                    {targets.map(target => (
                        <motion.button
                            key={target.id}
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0, opacity: 0 }}
                            transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                            onClick={() => handleTargetClick(target.id, target.createdAt)}
                            className="absolute rounded-full cursor-pointer hover:brightness-110 active:scale-90 transition-transform shadow-lg"
                            style={{
                                left: `${target.x}%`,
                                top: `${target.y}%`,
                                width: target.size,
                                height: target.size,
                                backgroundColor: target.color,
                                transform: 'translate(-50%, -50%)',
                                boxShadow: `0 4px 20px ${target.color}40`,
                            }}
                        >
                            <div className="absolute inset-[3px] rounded-full bg-white/20" />
                        </motion.button>
                    ))}
                </AnimatePresence>

                {/* Game Over overlay */}
                <AnimatePresence>
                    {gameOver && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="absolute inset-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm z-10 flex flex-col items-center justify-center gap-4"
                        >
                            <h2 className="text-3xl font-bold text-sky-500">Time&apos;s Up! ⚡</h2>
                            <div className="grid grid-cols-3 gap-4 text-center">
                                <div>
                                    <p className="text-2xl font-bold text-sky-900 dark:text-white">{score}</p>
                                    <p className="text-[11px] text-sky-500/50 font-medium">Score</p>
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-sky-900 dark:text-white">{accuracy}%</p>
                                    <p className="text-[11px] text-sky-500/50 font-medium">Accuracy</p>
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-sky-900 dark:text-white">{bestReaction ? `${bestReaction}ms` : '-'}</p>
                                    <p className="text-[11px] text-sky-500/50 font-medium">Best Time</p>
                                </div>
                            </div>
                            <p className="text-sm text-sky-600/50 dark:text-sky-400/50">
                                Avg reaction: {avgReaction}ms · {hits} hits · {missed} missed
                            </p>
                            <button
                                onClick={startGame}
                                className="flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-sky-700 bg-[#ebf6b5] hover:bg-[#e0efa0] border border-[#d4e88e] rounded-full transition-colors"
                            >
                                <RotateCcw className="w-4 h-4" />
                                Play Again
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}

export default function ReactionTimePage() {
    const { authenticated } = useRequireAuth();
    if (!authenticated) return null;
    const { homeworks } = useClassContext();
    const totalHomeworks = homeworks ? homeworks.length : 0;
    const completedHomeworks = homeworks ? homeworks.filter(hw => hw.completed).length : 0;
    const remainingCount = totalHomeworks - completedHomeworks;

    const completionPercentage = totalHomeworks > 0 ? (completedHomeworks / totalHomeworks) * 100 : 0;
    const hasEarnedAccess = completionPercentage >= 90;

    // More remaining homework = faster targets (harder)
    const shrinkSpeed = Math.min(remainingCount, 10);

    return (
        <div className="min-h-screen bg-[#fffaf4] dark:bg-gray-950 relative">
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-emerald-200/20 dark:bg-emerald-500/[0.06] rounded-full blur-[140px]" />
                <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-[#ebf6b5]/30 dark:bg-emerald-500/[0.04] rounded-full blur-[120px]" />
            </div>

            <div className="relative z-10 px-4 sm:px-6 md:px-12 lg:px-16 pt-28 pb-16">
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                    <Link href="/games" className="inline-flex items-center gap-2 text-sm text-sky-500 hover:text-sky-600 dark:text-sky-400 dark:hover:text-sky-300 font-semibold transition-colors mb-6">
                        <ArrowLeft className="w-4 h-4" />
                        Back to Game Center
                    </Link>
                </motion.div>

                {hasEarnedAccess ? (
                    <div className="flex flex-col items-center">
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
                            <h1 className="text-4xl lg:text-[52px] font-bold text-sky-500 dark:text-sky-400 leading-[1.08] tracking-tight mb-2">
                                Reaction Time
                            </h1>
                            <p className="text-sky-600/50 dark:text-sky-400/50 text-sm max-w-md">
                                Click the targets! {remainingCount > 0 ? `Targets move ${shrinkSpeed > 5 ? 'very fast' : 'faster'} with ${remainingCount} assignments remaining` : 'Chill speed — all homework done!'}.
                            </p>
                        </motion.div>

                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="w-full flex justify-center">
                            <ReactionTimeGame shrinkSpeed={shrinkSpeed} />
                        </motion.div>
                    </div>
                ) : (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center justify-center py-16">
                        <div className="w-full max-w-md">
                            <div className="text-center mb-8">
                                <h1 className="text-4xl lg:text-[52px] font-bold text-sky-500 dark:text-sky-400 leading-[1.08] tracking-tight mb-2">
                                    Reaction Time
                                </h1>
                                <p className="text-sky-600/50 dark:text-sky-400/50 text-sm">Complete more homework to unlock this game</p>
                            </div>
                            <div className="bg-white/60 dark:bg-gray-900 border border-sky-100 dark:border-gray-800 rounded-2xl p-6">
                                <div className="flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-500/10 border border-amber-200/60 dark:border-amber-500/20 rounded-xl mb-5">
                                    <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-sm font-semibold text-amber-800 dark:text-amber-300 mb-1">90% homework required</p>
                                        <p className="text-xs text-amber-600/80 dark:text-amber-400/80">Complete more assignments to unlock Reaction Time.</p>
                                    </div>
                                </div>
                                <div className="mb-4">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-xs font-semibold text-sky-600 dark:text-sky-400 uppercase tracking-wider">Progress</span>
                                        <span className="text-sm font-bold text-sky-900 dark:text-white">{completionPercentage.toFixed(0)}%</span>
                                    </div>
                                    <div className="w-full bg-sky-100 dark:bg-gray-800 rounded-full h-2.5 overflow-hidden">
                                        <div className="bg-sky-500 h-2.5 rounded-full transition-all duration-500" style={{ width: `${completionPercentage}%` }} />
                                    </div>
                                    <p className="text-[11px] text-sky-500/40 dark:text-sky-400/30 mt-2">
                                        {completedHomeworks} of {totalHomeworks} assignments · {Math.max(0, Math.ceil(totalHomeworks * 0.90) - completedHomeworks)} more to unlock
                                    </p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    );
}
