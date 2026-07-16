'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useHomeworkContext } from '@/context/HomeworkContext';
import { useRequireAuth } from '@/hooks/use-require-auth';
import { HugeIcon } from '@/lib/huge-icon-map';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

const SENTENCES = [
    'The mitochondria is the powerhouse of the cell.',
    'Photosynthesis converts sunlight into chemical energy.',
    'The quadratic formula solves second degree equations.',
    'A thesis statement guides the entire essay structure.',
    'Gravity is a fundamental force of nature.',
    'The periodic table organizes all known elements.',
    'Shakespeare wrote many famous plays and sonnets.',
    'The water cycle includes evaporation and condensation.',
    'Algebra uses variables to represent unknown values.',
    'The French Revolution began in seventeen eighty nine.',
    'Cells are the basic building blocks of life.',
    'The speed of light is constant in a vacuum.',
    'DNA carries genetic information in living organisms.',
    'An ecosystem includes both living and nonliving things.',
    'Newton discovered the three laws of motion.',
    'The Constitution establishes the framework of government.',
    'Chemical bonds form between atoms sharing electrons.',
    'The Renaissance was a period of cultural rebirth.',
    'Plate tectonics explains the movement of continents.',
    'Supply and demand determine market equilibrium prices.',
];

function TypingSpeedGame({ extraTime }: { extraTime: number }) {
    const [currentSentence, setCurrentSentence] = useState('');
    const [userInput, setUserInput] = useState('');
    const [sentencesCompleted, setSentencesCompleted] = useState(0);
    const [totalChars, setTotalChars] = useState(0);
    const [errors, setErrors] = useState(0);
    const [timeLeft, setTimeLeft] = useState(45 + extraTime);
    const [gameStarted, setGameStarted] = useState(false);
    const [gameOver, setGameOver] = useState(false);
    const [usedSentences, setUsedSentences] = useState<Set<number>>(new Set());
    const [startTime, setStartTime] = useState(0);
    const inputRef = useRef<HTMLInputElement>(null);
    const gameDuration = 45 + extraTime;

    const pickSentence = useCallback(() => {
        const available = SENTENCES.map((_, i) => i).filter(i => !usedSentences.has(i));
        if (available.length === 0) {
            setUsedSentences(new Set());
            const idx = Math.floor(Math.random() * SENTENCES.length);
            return { sentence: SENTENCES[idx], idx };
        }
        const idx = available[Math.floor(Math.random() * available.length)];
        return { sentence: SENTENCES[idx], idx };
    }, [usedSentences]);

    const nextSentence = useCallback(() => {
        const { sentence, idx } = pickSentence();
        setCurrentSentence(sentence);
        setUserInput('');
        setUsedSentences(prev => new Set([...prev, idx]));
        setTimeout(() => inputRef.current?.focus(), 50);
    }, [pickSentence]);

    const startGame = () => {
        setTimeLeft(gameDuration);
        setGameOver(false);
        setSentencesCompleted(0);
        setTotalChars(0);
        setErrors(0);
        setUsedSentences(new Set());
        setGameStarted(true);
        setStartTime(Date.now());
        setCurrentSentence('');
    };

    useEffect(() => {
        if (gameStarted && !gameOver && !currentSentence) {
            nextSentence();
        }
    }, [gameStarted, gameOver, currentSentence, nextSentence]);

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

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setUserInput(val);

        // Count errors in real-time
        let errCount = 0;
        for (let i = 0; i < val.length && i < currentSentence.length; i++) {
            if (val[i] !== currentSentence[i]) errCount++;
        }

        // Check if sentence is completed
        if (val === currentSentence) {
            setTotalChars(t => t + currentSentence.length);
            setSentencesCompleted(s => s + 1);
            setErrors(e => e + errCount);
            nextSentence();
        }
    };

    const elapsedSeconds = gameOver ? gameDuration : Math.max(1, (Date.now() - startTime) / 1000);
    const wpm = gameStarted ? Math.round((totalChars / 5) / (elapsedSeconds / 60)) : 0;
    const accuracy = totalChars > 0 ? Math.round(((totalChars - errors) / totalChars) * 100) : 100;
    const timerPercent = (timeLeft / gameDuration) * 100;

    // Character-by-character highlighting
    const renderSentence = () => {
        return currentSentence.split('').map((char, i) => {
            let className = 'text-sky-400/30 dark:text-sky-500/25';
            if (i < userInput.length) {
                className = userInput[i] === char
                    ? 'text-emerald-500 dark:text-emerald-400'
                    : 'text-red-500 dark:text-red-400 bg-red-100/50 dark:bg-red-500/10 rounded-sm';
            } else if (i === userInput.length) {
                className = 'text-sky-900 dark:text-white border-b-2 border-sky-500';
            }
            return (
                <span key={i} className={`${className} font-mono`}>
                    {char}
                </span>
            );
        });
    };

    return (
        <div className="flex flex-col items-center w-full max-w-xl">
            {/* Stats */}
            <div className="flex items-center gap-3 mb-5 w-full flex-wrap">
                <div className="flex-1 flex items-center gap-2 px-4 py-2.5 bg-white/60 dark:bg-gray-900 border border-sky-100 dark:border-gray-800 rounded-2xl min-w-fit">
                    <HugeIcon name="Zap" className="w-4 h-4 text-sky-500" />
                    <span className="text-sm font-bold text-sky-900 dark:text-white">{wpm}</span>
                    <span className="text-[11px] text-sky-500/50 font-medium">WPM</span>
                </div>
                <div className="flex-1 flex items-center gap-2 px-4 py-2.5 bg-white/60 dark:bg-gray-900 border border-sky-100 dark:border-gray-800 rounded-2xl min-w-fit">
                    <HugeIcon name="CheckmarkCircle02" className="w-4 h-4 text-emerald-500" />
                    <span className="text-sm font-bold text-sky-900 dark:text-white">{sentencesCompleted}</span>
                    <span className="text-[11px] text-sky-500/50 font-medium">done</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2.5 bg-white/60 dark:bg-gray-900 border border-sky-100 dark:border-gray-800 rounded-2xl min-w-fit">
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
                        <h2 className="text-2xl font-bold text-sky-900 dark:text-white">Typing Speed</h2>
                        <p className="text-sm text-sky-600/50 dark:text-sky-400/50 text-center max-w-xs">
                            Type academic sentences as fast and accurately as you can!
                        </p>
                        <button onClick={startGame} className="flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-sky-700 bg-[#ebf6b5] hover:bg-[#e0efa0] border border-[#d4e88e] rounded-full transition-colors">
                            <HugeIcon name="Play" className="w-4 h-4" />
                            Start Game
                        </button>
                    </div>
                ) : gameOver ? (
                    <div className="flex flex-col items-center justify-center gap-3 py-16 px-6">
                        <h2 className="text-3xl font-bold text-sky-500">Time&apos;s Up! ⌨️</h2>
                        <div className="grid grid-cols-3 gap-6 text-center mt-2">
                            <div>
                                <p className="text-2xl font-bold text-sky-900 dark:text-white">{wpm}</p>
                                <p className="text-[11px] text-sky-500/50 font-medium">WPM</p>
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-sky-900 dark:text-white">{accuracy}%</p>
                                <p className="text-[11px] text-sky-500/50 font-medium">Accuracy</p>
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-sky-900 dark:text-white">{sentencesCompleted}</p>
                                <p className="text-[11px] text-sky-500/50 font-medium">Completed</p>
                            </div>
                        </div>
                        <button onClick={startGame} className="flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-sky-700 bg-[#ebf6b5] hover:bg-[#e0efa0] border border-[#d4e88e] rounded-full transition-colors mt-3">
                            <HugeIcon name="Rotate01" className="w-4 h-4" />
                            Play Again
                        </button>
                    </div>
                ) : (
                    <div className="p-6">
                        {/* Timer bar */}
                        <div className="w-full h-1.5 bg-sky-100 dark:bg-gray-800 rounded-full mb-6 overflow-hidden">
                            <motion.div
                                className={`h-full rounded-full ${timerPercent > 50 ? 'bg-sky-500' : timerPercent > 20 ? 'bg-amber-500' : 'bg-red-500'}`}
                                animate={{ width: `${timerPercent}%` }}
                                transition={{ duration: 0.3 }}
                            />
                        </div>

                        {/* Sentence to type */}
                        <div className="mb-6 p-4 bg-sky-50/50 dark:bg-gray-800/50 rounded-xl min-h-[80px] flex items-center">
                            <p className="text-[15px] leading-[1.8] tracking-wide break-words">
                                {renderSentence()}
                            </p>
                        </div>

                        {/* Input */}
                        <input
                            ref={inputRef}
                            type="text"
                            value={userInput}
                            onChange={handleInputChange}
                            autoFocus
                            spellCheck={false}
                            autoCorrect="off"
                            autoCapitalize="off"
                            className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-sky-200/60 dark:border-gray-700 rounded-xl text-base font-mono text-sky-900 dark:text-white placeholder:text-sky-300/30 outline-none focus:border-sky-400 dark:focus:border-sky-500/40 transition-colors"
                            placeholder="Start typing..."
                        />
                    </div>
                )}
            </div>
        </div>
    );
}

export default function TypingSpeedPage() {
    const { authenticated } = useRequireAuth();
    if (!authenticated) return null;
    const { homeworks } = useHomeworkContext();
    const totalHomeworks = homeworks ? homeworks.length : 0;
    const completedHomeworks = homeworks ? homeworks.filter(hw => hw.completed).length : 0;
    const remainingCount = totalHomeworks - completedHomeworks;

    const completionPercentage = totalHomeworks > 0 ? (completedHomeworks / totalHomeworks) * 100 : 0;
    const hasEarnedAccess = completionPercentage >= 65;

    // More homework done = more time (easier)
    const extraTime = remainingCount === 0 ? 15 : Math.max(0, 15 - remainingCount);

    return (
        <div className="min-h-screen bg-[#fffaf4] dark:bg-gray-950 relative">
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-sky-200/20 dark:bg-sky-500/[0.06] rounded-full blur-[140px]" />
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
                            <h1 className="text-4xl lg:text-[52px] font-bold text-sky-500 dark:text-sky-400 leading-[1.08] tracking-tight mb-2">Typing Speed</h1>
                            <p className="text-sky-600/50 dark:text-sky-400/50 text-sm max-w-md">
                                Type academic sentences! {45 + extraTime}s on the clock — {remainingCount === 0 ? 'bonus time for finishing all homework!' : 'finish homework for extra time'}.
                            </p>
                        </motion.div>
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="w-full flex justify-center">
                            <TypingSpeedGame extraTime={extraTime} />
                        </motion.div>
                    </div>
                ) : (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center justify-center py-16">
                        <div className="w-full max-w-md">
                            <div className="text-center mb-8">
                                <h1 className="text-4xl lg:text-[52px] font-bold text-sky-500 dark:text-sky-400 leading-[1.08] tracking-tight mb-2">Typing Speed</h1>
                                <p className="text-sky-600/50 dark:text-sky-400/50 text-sm">Complete more homework to unlock this game</p>
                            </div>
                            <div className="bg-white/60 dark:bg-gray-900 border border-sky-100 dark:border-gray-800 rounded-2xl p-6">
                                <div className="flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-500/10 border border-amber-200/60 dark:border-amber-500/20 rounded-xl mb-5">
                                    <HugeIcon name="AlertCircle" className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-sm font-semibold text-amber-800 dark:text-amber-300 mb-1">65% homework required</p>
                                        <p className="text-xs text-amber-600/80 dark:text-amber-400/80">Complete more assignments to unlock Typing Speed.</p>
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
                                        {completedHomeworks} of {totalHomeworks} assignments · {Math.max(0, Math.ceil(totalHomeworks * 0.65) - completedHomeworks)} more to unlock
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
