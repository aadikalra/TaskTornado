'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useClassContext } from '@/context/ClassContext';
import { useRequireAuth } from '@/hooks/use-require-auth';
import { HugeIcon } from '@/lib/huge-icon-map';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

const WORD_BANK = [
    'ALGEBRA', 'BIOLOGY', 'CALCULUS', 'PHYSICS', 'HISTORY',
    'GEOMETRY', 'GRAMMAR', 'SCIENCE', 'ENGLISH', 'ECOLOGY',
    'THEORY', 'THESIS', 'FORMULA', 'NUCLEUS', 'ELEMENT',
    'SYNTAX', 'POETRY', 'CLIMATE', 'CULTURE', 'GRAVITY',
    'DENSITY', 'CIRCUIT', 'PROTEIN', 'OSMOSIS', 'ANALYZE',
    'CHAPTER', 'DECIMAL', 'QUANTUM', 'POLYMER', 'ISOTOPE',
    'VOLTAGE', 'MINERAL', 'SONNET', 'MITOSIS', 'PHOTON',
    'VECTOR', 'MATRIX', 'LINEAR', 'PRISM', 'FORCE',
    'MOTION', 'ENERGY', 'VOLUME', 'RADIUS', 'NERVE',
    'ORGAN', 'FEUDAL', 'COLONY', 'EMPIRE', 'TREATY',
];

function scramble(word: string): string {
    const arr = word.split('');
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    const scrambled = arr.join('');
    // Make sure it's actually scrambled
    return scrambled === word ? scramble(word) : scrambled;
}

function WordScrambleGame({ timePerWord }: { timePerWord: number }) {
    const [currentWord, setCurrentWord] = useState('');
    const [scrambledWord, setScrambledWord] = useState('');
    const [userInput, setUserInput] = useState('');
    const [score, setScore] = useState(0);
    const [streak, setStreak] = useState(0);
    const [bestStreak, setBestStreak] = useState(0);
    const [timeLeft, setTimeLeft] = useState(timePerWord);
    const [gameStarted, setGameStarted] = useState(false);
    const [gameOver, setGameOver] = useState(false);
    const [feedback, setFeedback] = useState<'correct' | 'wrong' | 'timeout' | null>(null);
    const [wordsCompleted, setWordsCompleted] = useState(0);
    const [usedWords, setUsedWords] = useState<Set<string>>(new Set());
    const inputRef = useRef<HTMLInputElement>(null);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    const nextWord = useCallback(() => {
        const available = WORD_BANK.filter(w => !usedWords.has(w));
        if (available.length === 0) {
            setGameOver(true);
            return;
        }
        const word = available[Math.floor(Math.random() * available.length)];
        setCurrentWord(word);
        setScrambledWord(scramble(word));
        setUserInput('');
        setTimeLeft(timePerWord);
        setFeedback(null);
        setUsedWords(prev => new Set([...prev, word]));
        setTimeout(() => inputRef.current?.focus(), 100);
    }, [usedWords, timePerWord]);

    const startGame = () => {
        setScore(0);
        setStreak(0);
        setBestStreak(0);
        setWordsCompleted(0);
        setGameOver(false);
        setUsedWords(new Set());
        setGameStarted(true);
        // nextWord will be called by effect
    };

    useEffect(() => {
        if (gameStarted && !gameOver && currentWord === '') {
            nextWord();
        }
    }, [gameStarted, gameOver, currentWord, nextWord]);

    // Timer
    useEffect(() => {
        if (!gameStarted || gameOver || feedback) return;

        timerRef.current = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    // Time's up
                    setFeedback('timeout');
                    setStreak(0);
                    setWordsCompleted(w => w + 1);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [gameStarted, gameOver, feedback]);

    // Auto-advance after feedback
    useEffect(() => {
        if (feedback) {
            const timer = setTimeout(() => {
                if (wordsCompleted >= 15) {
                    setGameOver(true);
                } else {
                    setCurrentWord('');
                }
            }, feedback === 'correct' ? 800 : 1200);
            return () => clearTimeout(timer);
        }
    }, [feedback, wordsCompleted]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!userInput.trim() || feedback) return;

        if (timerRef.current) clearInterval(timerRef.current);

        if (userInput.toUpperCase() === currentWord) {
            const timeBonus = Math.floor(timeLeft / 2);
            const streakBonus = streak >= 3 ? 5 : 0;
            setScore(s => s + 10 + timeBonus + streakBonus);
            setStreak(s => {
                const newStreak = s + 1;
                setBestStreak(b => Math.max(b, newStreak));
                return newStreak;
            });
            setFeedback('correct');
        } else {
            setFeedback('wrong');
            setStreak(0);
        }
        setWordsCompleted(w => w + 1);
    };

    const progressPercent = (wordsCompleted / 15) * 100;
    const timerPercent = (timeLeft / timePerWord) * 100;

    return (
        <div className="flex flex-col items-center w-full max-w-lg">
            {/* Stats bar */}
            <div className="flex items-center gap-3 mb-5 w-full">
                <div className="flex-1 flex items-center gap-3 px-4 py-2.5 bg-white/60 dark:bg-gray-900 border border-sky-100 dark:border-gray-800 rounded-2xl">
                    <HugeIcon name="Award01" className="w-4 h-4 text-sky-500" />
                    <span className="text-sm font-bold text-sky-900 dark:text-white">{score}</span>
                    <span className="text-[11px] text-sky-500/50 font-medium">pts</span>
                </div>
                <div className="flex-1 flex items-center gap-3 px-4 py-2.5 bg-white/60 dark:bg-gray-900 border border-sky-100 dark:border-gray-800 rounded-2xl">
                    <HugeIcon name="Star" className="w-4 h-4 text-amber-500" />
                    <span className="text-sm font-bold text-sky-900 dark:text-white">{streak}</span>
                    <span className="text-[11px] text-sky-500/50 font-medium">streak</span>
                </div>
                <div className="flex items-center gap-3 px-4 py-2.5 bg-white/60 dark:bg-gray-900 border border-sky-100 dark:border-gray-800 rounded-2xl">
                    <span className="text-sm font-bold text-sky-900 dark:text-white">{wordsCompleted}/15</span>
                </div>
            </div>

            {/* Game area */}
            <div className="relative w-full bg-white/60 dark:bg-gray-900/60 border border-sky-100 dark:border-gray-800 rounded-2xl overflow-hidden">
                {!gameStarted ? (
                    <div className="flex flex-col items-center justify-center gap-4 py-20 px-6">
                        <h2 className="text-2xl font-bold text-sky-900 dark:text-white">Word Scramble</h2>
                        <p className="text-sm text-sky-600/50 dark:text-sky-400/50 text-center max-w-xs">
                            Unscramble 15 academic words before time runs out!
                        </p>
                        <button
                            onClick={startGame}
                            className="flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-sky-700 bg-[#ebf6b5] hover:bg-[#e0efa0] border border-[#d4e88e] rounded-full transition-colors"
                        >
                            <HugeIcon name="Play" className="w-4 h-4" />
                            Start Game
                        </button>
                    </div>
                ) : gameOver ? (
                    <div className="flex flex-col items-center justify-center gap-3 py-16 px-6">
                        <h2 className="text-3xl font-bold text-sky-500">Game Complete! 🎓</h2>
                        <p className="text-lg text-sky-700 dark:text-sky-300 font-medium">{score} points</p>
                        <p className="text-sm text-sky-600/50 dark:text-sky-400/50">Best streak: {bestStreak} words</p>
                        <button
                            onClick={startGame}
                            className="flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-sky-700 bg-[#ebf6b5] hover:bg-[#e0efa0] border border-[#d4e88e] rounded-full transition-colors mt-2"
                        >
                            <HugeIcon name="Rotate01" className="w-4 h-4" />
                            Play Again
                        </button>
                    </div>
                ) : (
                    <div className="p-6">
                        {/* Timer bar */}
                        <div className="w-full h-1.5 bg-sky-100 dark:bg-gray-800 rounded-full mb-6 overflow-hidden">
                            <motion.div
                                className={`h-full rounded-full transition-colors ${timerPercent > 50 ? 'bg-sky-500' : timerPercent > 25 ? 'bg-amber-500' : 'bg-red-500'
                                    }`}
                                animate={{ width: `${timerPercent}%` }}
                                transition={{ duration: 0.3 }}
                            />
                        </div>

                        <div className="flex items-center justify-between mb-4">
                            <span className="text-xs text-sky-500/50 font-semibold uppercase tracking-wider">Unscramble this word</span>
                            <div className="flex items-center gap-1.5 text-sm font-bold text-sky-900 dark:text-white">
                                <HugeIcon name="Timer01" className="w-3.5 h-3.5 text-sky-500" />
                                {timeLeft}s
                            </div>
                        </div>

                        {/* Scrambled word */}
                        <div className="flex items-center justify-center gap-2 mb-8">
                            {scrambledWord.split('').map((letter, i) => (
                                <motion.div
                                    key={`${currentWord}-${i}`}
                                    initial={{ opacity: 0, y: -10, rotate: Math.random() * 20 - 10 }}
                                    animate={{ opacity: 1, y: 0, rotate: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                    className="w-11 h-12 bg-sky-50 dark:bg-gray-800 border-2 border-sky-200/60 dark:border-gray-700 rounded-xl flex items-center justify-center text-xl font-bold text-sky-900 dark:text-white"
                                >
                                    {letter}
                                </motion.div>
                            ))}
                        </div>

                        {/* Input */}
                        <form onSubmit={handleSubmit} className="mb-4">
                            <div className="flex gap-2">
                                <input
                                    ref={inputRef}
                                    type="text"
                                    value={userInput}
                                    onChange={(e) => setUserInput(e.target.value.toUpperCase())}
                                    placeholder="Type the word..."
                                    disabled={!!feedback}
                                    maxLength={currentWord.length}
                                    className="flex-1 px-4 py-3 bg-white dark:bg-gray-800 border border-sky-200/60 dark:border-gray-700 rounded-xl text-base font-bold text-sky-900 dark:text-white placeholder:text-sky-300/30 dark:placeholder:text-sky-500/20 outline-none focus:border-sky-400 dark:focus:border-sky-500/40 transition-colors text-center tracking-[0.15em] uppercase disabled:opacity-50"
                                />
                                <button
                                    type="submit"
                                    disabled={!userInput.trim() || !!feedback}
                                    className="px-5 py-3 bg-sky-500 text-white font-semibold text-sm rounded-xl hover:bg-sky-600 disabled:opacity-40 transition-all"
                                >
                                    <HugeIcon name="CheckmarkCircle02" className="w-5 h-5" />
                                </button>
                            </div>
                        </form>

                        {/* Feedback */}
                        <AnimatePresence>
                            {feedback && (
                                <motion.div
                                    initial={{ opacity: 0, y: 4 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0 }}
                                    className={`text-center text-sm font-bold py-2 rounded-xl ${feedback === 'correct'
                                            ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10'
                                            : feedback === 'wrong'
                                                ? 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10'
                                                : 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10'
                                        }`}
                                >
                                    {feedback === 'correct' ? '✅ Correct!' : feedback === 'wrong' ? `❌ It was ${currentWord}` : `⏰ Time's up! It was ${currentWord}`}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                )}
            </div>
        </div>
    );
}

export default function WordScramblePage() {
    const { authenticated } = useRequireAuth();
    if (!authenticated) return null;
    const { homeworks } = useClassContext();
    const totalHomeworks = homeworks ? homeworks.length : 0;
    const completedHomeworks = homeworks ? homeworks.filter(hw => hw.completed).length : 0;
    const remainingCount = totalHomeworks - completedHomeworks;

    const completionPercentage = totalHomeworks > 0 ? (completedHomeworks / totalHomeworks) * 100 : 0;
    const hasEarnedAccess = completionPercentage >= 85;

    // More remaining homework = less time per word (harder)
    const timePerWord = Math.max(8, 15 - Math.floor(remainingCount / 3));

    return (
        <div className="min-h-screen bg-[#fffaf4] dark:bg-gray-950 relative">
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-amber-200/20 dark:bg-amber-500/[0.06] rounded-full blur-[140px]" />
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
                            <h1 className="text-4xl lg:text-[52px] font-bold text-sky-500 dark:text-sky-400 leading-[1.08] tracking-tight mb-2">
                                Word Scramble
                            </h1>
                            <p className="text-sky-600/50 dark:text-sky-400/50 text-sm max-w-md">
                                Unscramble academic words! {timePerWord}s per word — {remainingCount > 0 ? 'less time with more homework remaining' : 'max time — you\'re crushing it!'}.
                            </p>
                        </motion.div>

                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="w-full flex justify-center">
                            <WordScrambleGame timePerWord={timePerWord} />
                        </motion.div>
                    </div>
                ) : (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center justify-center py-16">
                        <div className="w-full max-w-md">
                            <div className="text-center mb-8">
                                <h1 className="text-4xl lg:text-[52px] font-bold text-sky-500 dark:text-sky-400 leading-[1.08] tracking-tight mb-2">
                                    Word Scramble
                                </h1>
                                <p className="text-sky-600/50 dark:text-sky-400/50 text-sm">Complete more homework to unlock this game</p>
                            </div>
                            <div className="bg-white/60 dark:bg-gray-900 border border-sky-100 dark:border-gray-800 rounded-2xl p-6">
                                <div className="flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-500/10 border border-amber-200/60 dark:border-amber-500/20 rounded-xl mb-5">
                                    <HugeIcon name="AlertCircle" className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-sm font-semibold text-amber-800 dark:text-amber-300 mb-1">85% homework required</p>
                                        <p className="text-xs text-amber-600/80 dark:text-amber-400/80">Complete more assignments to unlock Word Scramble.</p>
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
                                        {completedHomeworks} of {totalHomeworks} assignments · {Math.max(0, Math.ceil(totalHomeworks * 0.85) - completedHomeworks)} more to unlock
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
