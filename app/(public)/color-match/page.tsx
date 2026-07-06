'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useClassContext } from '@/context/ClassContext';
import { useRequireAuth } from '@/hooks/use-require-auth';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { HugeIcon } from '@/lib/huge-icon-map';

const COLOR_MAP: Record<string, string> = {
    RED: '#ef4444',
    BLUE: '#3b82f6',
    GREEN: '#22c55e',
    YELLOW: '#eab308',
    PURPLE: '#a855f7',
    ORANGE: '#f97316',
    PINK: '#ec4899',
    CYAN: '#06b6d4',
};

const COLOR_NAMES = Object.keys(COLOR_MAP);

type Round = {
    word: string;        // The text displayed (e.g. "RED")
    displayColor: string; // The color the text is rendered in (e.g. blue hex)
    correctAnswer: string; // The correct answer (the DISPLAY COLOR name, not the word)
    options: string[];   // 3-4 clickable choices
};

function generateRound(optionCount: number): Round {
    const word = COLOR_NAMES[Math.floor(Math.random() * COLOR_NAMES.length)];

    // Pick a DIFFERENT color for display (the Stroop effect)
    let displayColorName: string;
    do {
        displayColorName = COLOR_NAMES[Math.floor(Math.random() * COLOR_NAMES.length)];
    } while (displayColorName === word);

    const displayColor = COLOR_MAP[displayColorName];

    // Build options — must include the correct answer
    const optionSet = new Set<string>([displayColorName]);
    while (optionSet.size < optionCount) {
        optionSet.add(COLOR_NAMES[Math.floor(Math.random() * COLOR_NAMES.length)]);
    }
    // Shuffle
    const options = Array.from(optionSet).sort(() => Math.random() - 0.5);

    return {
        word,
        displayColor,
        correctAnswer: displayColorName,
        options,
    };
}

function ColorMatchGame({ optionCount }: { optionCount: number }) {
    const [round, setRound] = useState<Round | null>(null);
    const [score, setScore] = useState(0);
    const [streak, setStreak] = useState(0);
    const [bestStreak, setBestStreak] = useState(0);
    const [timeLeft, setTimeLeft] = useState(45);
    const [gameStarted, setGameStarted] = useState(false);
    const [gameOver, setGameOver] = useState(false);
    const [totalRounds, setTotalRounds] = useState(0);
    const [correct, setCorrect] = useState(0);
    const [feedback, setFeedback] = useState<{ type: 'correct' | 'wrong'; answer?: string } | null>(null);

    const nextRound = useCallback(() => {
        setRound(generateRound(optionCount));
        setFeedback(null);
    }, [optionCount]);

    const startGame = () => {
        setScore(0);
        setStreak(0);
        setBestStreak(0);
        setTimeLeft(45);
        setGameOver(false);
        setTotalRounds(0);
        setCorrect(0);
        setRound(null);
        setGameStarted(true);
    };

    useEffect(() => {
        if (gameStarted && !gameOver && !round) {
            nextRound();
        }
    }, [gameStarted, gameOver, round, nextRound]);

    // Timer
    useEffect(() => {
        if (!gameStarted || gameOver) return;
        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    setGameOver(true);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, [gameStarted, gameOver]);

    const handleChoice = (choice: string) => {
        if (feedback || !round) return;
        setTotalRounds(t => t + 1);

        if (choice === round.correctAnswer) {
            const streakBonus = streak >= 5 ? 8 : streak >= 3 ? 4 : 0;
            setScore(s => s + 10 + streakBonus);
            setStreak(s => {
                const ns = s + 1;
                setBestStreak(b => Math.max(b, ns));
                return ns;
            });
            setCorrect(c => c + 1);
            setFeedback({ type: 'correct' });
        } else {
            setStreak(0);
            setFeedback({ type: 'wrong', answer: round.correctAnswer });
        }

        setTimeout(() => {
            nextRound();
        }, 500);
    };

    const accuracy = totalRounds > 0 ? Math.round((correct / totalRounds) * 100) : 0;
    const timerPercent = (timeLeft / 45) * 100;

    return (
        <div className="flex flex-col items-center w-full max-w-lg">
            {/* Stats */}
            <div className="flex items-center gap-3 mb-5 w-full">
                <div className="flex-1 flex items-center gap-2 px-4 py-2.5 bg-white/60 dark:bg-gray-900 border border-sky-100 dark:border-gray-800 rounded-2xl">
                    <HugeIcon name="Award01" className="w-4 h-4 text-sky-500" />
                    <span className="text-sm font-bold text-sky-900 dark:text-white">{score}</span>
                    <span className="text-[11px] text-sky-500/50 font-medium">pts</span>
                </div>
                <div className="flex-1 flex items-center gap-2 px-4 py-2.5 bg-white/60 dark:bg-gray-900 border border-sky-100 dark:border-gray-800 rounded-2xl">
                    <HugeIcon name="Zap" className="w-4 h-4 text-amber-500" />
                    <span className="text-sm font-bold text-sky-900 dark:text-white">{streak}</span>
                    <span className="text-[11px] text-sky-500/50 font-medium">streak</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2.5 bg-white/60 dark:bg-gray-900 border border-sky-100 dark:border-gray-800 rounded-2xl">
                    <HugeIcon name="Timer01" className={`w-4 h-4 ${timeLeft <= 10 ? 'text-red-500' : 'text-sky-500'}`} />
                    <span className={`text-sm font-bold ${timeLeft <= 10 ? 'text-red-500' : 'text-sky-900 dark:text-white'}`}>{timeLeft}s</span>
                </div>
                {gameStarted && (
                    <button onClick={startGame} className="p-2 text-sky-500 hover:text-sky-700 dark:hover:text-sky-300 hover:bg-sky-50 dark:hover:bg-gray-800 rounded-xl transition-colors">
                        <HugeIcon name="Rotate01" className="w-4 h-4" />
                    </button>
                )}
            </div>

            {/* Game area */}
            <div className="relative w-full bg-white/60 dark:bg-gray-900/60 border border-sky-100 dark:border-gray-800 rounded-2xl overflow-hidden">
                {!gameStarted ? (
                    <div className="flex flex-col items-center justify-center gap-4 py-20 px-6">
                        <h2 className="text-2xl font-bold text-sky-900 dark:text-white">Color Match</h2>
                        <p className="text-sm text-sky-600/50 dark:text-sky-400/50 text-center max-w-xs">
                            A word appears in a <strong>different color</strong>. Pick the <strong>color</strong> of the text, not what the word says!
                        </p>
                        <div className="text-center mt-2">
                            <span className="text-3xl font-black" style={{ color: '#3b82f6' }}>RED</span>
                            <p className="text-xs text-sky-500/40 mt-1">Answer: BLUE (the color, not the word)</p>
                        </div>
                        <button onClick={startGame} className="flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-sky-700 bg-[#ebf6b5] hover:bg-[#e0efa0] border border-[#d4e88e] rounded-full transition-colors mt-2">
                            <HugeIcon name="Play" className="w-4 h-4" />
                            Start Game
                        </button>
                    </div>
                ) : gameOver ? (
                    <div className="flex flex-col items-center justify-center gap-3 py-16 px-6">
                        <h2 className="text-3xl font-bold text-sky-500">Time&apos;s Up! 🎨</h2>
                        <div className="grid grid-cols-3 gap-6 text-center mt-2">
                            <div>
                                <p className="text-2xl font-bold text-sky-900 dark:text-white">{score}</p>
                                <p className="text-[11px] text-sky-500/50 font-medium">Score</p>
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-sky-900 dark:text-white">{accuracy}%</p>
                                <p className="text-[11px] text-sky-500/50 font-medium">Accuracy</p>
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-sky-900 dark:text-white">{bestStreak}</p>
                                <p className="text-[11px] text-sky-500/50 font-medium">Best Streak</p>
                            </div>
                        </div>
                        <p className="text-sm text-sky-600/40 mt-1">{correct}/{totalRounds} correct</p>
                        <button onClick={startGame} className="flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-sky-700 bg-[#ebf6b5] hover:bg-[#e0efa0] border border-[#d4e88e] rounded-full transition-colors mt-2">
                            <HugeIcon name="Rotate01" className="w-4 h-4" />
                            Play Again
                        </button>
                    </div>
                ) : round && (
                    <div className="p-6">
                        {/* Timer bar */}
                        <div className="w-full h-1.5 bg-sky-100 dark:bg-gray-800 rounded-full mb-8 overflow-hidden">
                            <motion.div
                                className={`h-full rounded-full ${timerPercent > 50 ? 'bg-sky-500' : timerPercent > 20 ? 'bg-amber-500' : 'bg-red-500'}`}
                                animate={{ width: `${timerPercent}%` }}
                                transition={{ duration: 0.3 }}
                            />
                        </div>

                        {/* Instruction */}
                        <p className="text-center text-xs text-sky-500/40 font-semibold uppercase tracking-wider mb-4">
                            What COLOR is the text?
                        </p>

                        {/* The Stroop word */}
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={`${round.word}-${round.displayColor}`}
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                className="text-center mb-10"
                            >
                                <span
                                    className="text-6xl sm:text-7xl font-black tracking-tight select-none"
                                    style={{ color: round.displayColor }}
                                >
                                    {round.word}
                                </span>
                            </motion.div>
                        </AnimatePresence>

                        {/* Options */}
                        <div className="grid grid-cols-2 gap-3">
                            {round.options.map(option => (
                                <button
                                    key={option}
                                    onClick={() => handleChoice(option)}
                                    disabled={!!feedback}
                                    className={`py-3.5 px-4 rounded-xl text-sm font-bold transition-all active:scale-95 ${feedback
                                            ? option === round.correctAnswer
                                                ? 'bg-emerald-100 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-2 border-emerald-300 dark:border-emerald-500/30'
                                                : feedback.type === 'wrong' && option === feedback.answer
                                                    ? 'bg-red-100 dark:bg-red-500/15 text-red-700 dark:text-red-400 border-2 border-red-300 dark:border-red-500/30'
                                                    : 'bg-sky-50 dark:bg-gray-800 text-sky-400/40 border-2 border-sky-100 dark:border-gray-700'
                                            : 'bg-sky-50 dark:bg-gray-800 text-sky-900 dark:text-white border-2 border-sky-200/50 dark:border-gray-700 hover:border-sky-400 dark:hover:border-sky-500/40 hover:bg-sky-100/50 dark:hover:bg-gray-700/50 cursor-pointer'
                                        }`}
                                >
                                    <div className="flex items-center justify-center gap-2">
                                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLOR_MAP[option] }} />
                                        {option}
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default function ColorMatchPage() {
    const { authenticated } = useRequireAuth();
    if (!authenticated) return null;
    const { homeworks } = useClassContext();
    const totalHomeworks = homeworks ? homeworks.length : 0;
    const completedHomeworks = homeworks ? homeworks.filter(hw => hw.completed).length : 0;
    const remainingCount = totalHomeworks - completedHomeworks;

    const completionPercentage = totalHomeworks > 0 ? (completedHomeworks / totalHomeworks) * 100 : 0;
    const hasEarnedAccess = completionPercentage >= 55;

    // More remaining homework = more options (harder to pick the right one)
    const optionCount = Math.min(Math.max(3, 3 + Math.floor(remainingCount / 4)), 6);

    return (
        <div className="min-h-screen bg-[#fffaf4] dark:bg-gray-950 relative">
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-pink-200/20 dark:bg-pink-500/[0.06] rounded-full blur-[140px]" />
                <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-[#ebf6b5]/30 dark:bg-emerald-500/[0.04] rounded-full blur-[120px]" />
            </div>

            <div className="relative z-10 px-4 sm:px-6 md:px-12 lg:px-16 pt-28 pb-16">
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                    <Link href="/games" className="inline-flex items-center gap-2 text-sm text-sky-500 hover:text-sky-600 dark:text-sky-400 dark:hover:text-sky-300 font-semibold transition-colors mb-6">
                        <HugeIcon name="ArrowLeft01" className="w-4 h-4" />
                        Back to Game Center
                    </Link>
                </motion.div>

                {hasEarnedAccess ? (
                    <div className="flex flex-col items-center">
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
                            <h1 className="text-4xl lg:text-[52px] font-bold text-sky-500 dark:text-sky-400 leading-[1.08] tracking-tight mb-2">Color Match</h1>
                            <p className="text-sky-600/50 dark:text-sky-400/50 text-sm max-w-md">
                                The Stroop effect! {optionCount} choices per round — {remainingCount > 0 ? 'more options with more homework remaining' : 'minimum difficulty — brain teaser mode!'}.
                            </p>
                        </motion.div>
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="w-full flex justify-center">
                            <ColorMatchGame optionCount={optionCount} />
                        </motion.div>
                    </div>
                ) : (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center justify-center py-16">
                        <div className="w-full max-w-md">
                            <div className="text-center mb-8">
                                <h1 className="text-4xl lg:text-[52px] font-bold text-sky-500 dark:text-sky-400 leading-[1.08] tracking-tight mb-2">Color Match</h1>
                                <p className="text-sky-600/50 dark:text-sky-400/50 text-sm">Complete more homework to unlock this game</p>
                            </div>
                            <div className="bg-white/60 dark:bg-gray-900 border border-sky-100 dark:border-gray-800 rounded-2xl p-6">
                                <div className="flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-500/10 border border-amber-200/60 dark:border-amber-500/20 rounded-xl mb-5">
                                    <HugeIcon name="AlertCircle" className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-sm font-semibold text-amber-800 dark:text-amber-300 mb-1">55% homework required</p>
                                        <p className="text-xs text-amber-600/80 dark:text-amber-400/80">Complete more assignments to unlock Color Match.</p>
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
                                        {completedHomeworks} of {totalHomeworks} assignments · {Math.max(0, Math.ceil(totalHomeworks * 0.55) - completedHomeworks)} more to unlock
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
