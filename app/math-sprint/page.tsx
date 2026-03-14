'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useClassContext } from '@/context/ClassContext';
import { useRequireAuth } from '@/hooks/use-require-auth';
import { ArrowLeft, RotateCcw, Trophy, Zap, Timer, AlertTriangle, Play, CheckCircle2, XCircle, Settings2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

// ── Topic Definitions ──────────────────────────────────────────────────

type Topic = {
    id: string;
    label: string;
    emoji: string;
    description: string;
    difficulty: 'easy' | 'medium' | 'hard';
};

const TOPICS: Topic[] = [
    { id: 'basic-add-sub', label: 'Addition & Subtraction', emoji: '➕', description: 'Basic +/− operations', difficulty: 'easy' },
    { id: 'multiplication', label: 'Multiplication', emoji: '✖️', description: 'Times tables & beyond', difficulty: 'easy' },
    { id: 'division', label: 'Division', emoji: '➗', description: 'Clean division problems', difficulty: 'easy' },
    { id: 'order-ops', label: 'Order of Operations', emoji: '🔢', description: 'PEMDAS / BODMAS', difficulty: 'medium' },
    { id: 'exponents', label: 'Exponents', emoji: '📈', description: 'Powers like 2³, 5²', difficulty: 'medium' },
    { id: 'square-roots', label: 'Square Roots', emoji: '√', description: '√49, √144, etc.', difficulty: 'medium' },
    { id: 'cube-roots', label: 'Cube Roots', emoji: '∛', description: '∛27, ∛125, etc.', difficulty: 'medium' },
    { id: 'percentages', label: 'Percentages', emoji: '%', description: '25% of 80, etc.', difficulty: 'medium' },
    { id: 'logarithms', label: 'Logarithms', emoji: 'log', description: 'log₂(8), log₃(27)', difficulty: 'hard' },
    { id: 'quadratics', label: 'Quadratics', emoji: 'x²', description: 'Find a root of x²+bx+c=0', difficulty: 'hard' },
    { id: 'fractions', label: 'Fractions', emoji: '½', description: 'Fraction arithmetic', difficulty: 'medium' },
    { id: 'negatives', label: 'Negative Numbers', emoji: '−', description: 'Operations with negatives', difficulty: 'medium' },
];

const DIFFICULTY_COLORS = {
    easy: { bg: 'bg-emerald-50 dark:bg-emerald-500/10', border: 'border-emerald-200/50 dark:border-emerald-500/20', text: 'text-emerald-600 dark:text-emerald-400', badge: 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400' },
    medium: { bg: 'bg-amber-50 dark:bg-amber-500/10', border: 'border-amber-200/50 dark:border-amber-500/20', text: 'text-amber-600 dark:text-amber-400', badge: 'bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400' },
    hard: { bg: 'bg-red-50 dark:bg-red-500/10', border: 'border-red-200/50 dark:border-red-500/20', text: 'text-red-600 dark:text-red-400', badge: 'bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400' },
};

// ── Problem Generation ─────────────────────────────────────────────────

type Problem = { question: string; answer: number; display?: string };

// Perfect squares for sqrt problems
const PERFECT_SQUARES = [4, 9, 16, 25, 36, 49, 64, 81, 100, 121, 144, 169, 196, 225];
const PERFECT_CUBES = [8, 27, 64, 125, 216, 343, 512];

function generateProblem(topics: string[]): Problem {
    const topic = topics[Math.floor(Math.random() * topics.length)];

    switch (topic) {
        case 'basic-add-sub': {
            const op = Math.random() > 0.5 ? '+' : '−';
            if (op === '+') {
                const a = Math.floor(Math.random() * 100) + 1;
                const b = Math.floor(Math.random() * 100) + 1;
                return { question: `${a} + ${b}`, answer: a + b };
            } else {
                const a = Math.floor(Math.random() * 100) + 10;
                const b = Math.floor(Math.random() * a) + 1;
                return { question: `${a} − ${b}`, answer: a - b };
            }
        }

        case 'multiplication': {
            const a = Math.floor(Math.random() * 12) + 2;
            const b = Math.floor(Math.random() * 12) + 2;
            return { question: `${a} × ${b}`, answer: a * b };
        }

        case 'division': {
            const b = Math.floor(Math.random() * 12) + 2;
            const answer = Math.floor(Math.random() * 12) + 1;
            const a = b * answer;
            return { question: `${a} ÷ ${b}`, answer };
        }

        case 'order-ops': {
            const type = Math.floor(Math.random() * 4);
            if (type === 0) {
                const a = Math.floor(Math.random() * 10) + 1;
                const b = Math.floor(Math.random() * 10) + 1;
                const c = Math.floor(Math.random() * 10) + 1;
                return { question: `${a} + ${b} × ${c}`, answer: a + b * c };
            } else if (type === 1) {
                const a = Math.floor(Math.random() * 10) + 1;
                const b = Math.floor(Math.random() * 10) + 1;
                const c = Math.floor(Math.random() * 5) + 1;
                const inner = a + b;
                return { question: `(${a} + ${b}) × ${c}`, answer: inner * c };
            } else if (type === 2) {
                const a = Math.floor(Math.random() * 10) + 2;
                const b = Math.floor(Math.random() * 5) + 1;
                const c = Math.floor(Math.random() * 10) + 1;
                return { question: `${a}² − ${c}`, display: `${a}² − ${c}`, answer: a * a - c };
            } else {
                const a = Math.floor(Math.random() * 10) + 1;
                const b = Math.floor(Math.random() * 10) + 1;
                const c = Math.floor(Math.random() * 10) + 1;
                const d = Math.floor(Math.random() * 10) + 1;
                return { question: `${a} × ${b} + ${c} × ${d}`, answer: a * b + c * d };
            }
        }

        case 'exponents': {
            const bases = [2, 2, 2, 3, 3, 4, 5, 5, 6, 7, 10];
            const base = bases[Math.floor(Math.random() * bases.length)];
            let exp: number;
            if (base <= 3) exp = Math.floor(Math.random() * 5) + 2;
            else if (base <= 5) exp = Math.floor(Math.random() * 3) + 2;
            else exp = 2;
            return { question: `${base}^${exp}`, display: `${base}${toSuperscript(exp)}`, answer: Math.pow(base, exp) };
        }

        case 'square-roots': {
            const sq = PERFECT_SQUARES[Math.floor(Math.random() * PERFECT_SQUARES.length)];
            return { question: `√${sq}`, display: `√${sq}`, answer: Math.sqrt(sq) };
        }

        case 'cube-roots': {
            const cb = PERFECT_CUBES[Math.floor(Math.random() * PERFECT_CUBES.length)];
            return { question: `∛${cb}`, display: `∛${cb}`, answer: Math.round(Math.cbrt(cb)) };
        }

        case 'percentages': {
            const percents = [10, 20, 25, 30, 40, 50, 60, 75, 80, 90];
            const p = percents[Math.floor(Math.random() * percents.length)];
            const bases = [20, 40, 50, 60, 80, 100, 120, 150, 200, 250, 300, 400, 500];
            const b = bases[Math.floor(Math.random() * bases.length)];
            return { question: `${p}% of ${b}`, answer: (p / 100) * b };
        }

        case 'logarithms': {
            const logProblems = [
                { base: 2, arg: 4, ans: 2 }, { base: 2, arg: 8, ans: 3 },
                { base: 2, arg: 16, ans: 4 }, { base: 2, arg: 32, ans: 5 },
                { base: 2, arg: 64, ans: 6 }, { base: 3, arg: 9, ans: 2 },
                { base: 3, arg: 27, ans: 3 }, { base: 3, arg: 81, ans: 4 },
                { base: 4, arg: 16, ans: 2 }, { base: 4, arg: 64, ans: 3 },
                { base: 5, arg: 25, ans: 2 }, { base: 5, arg: 125, ans: 3 },
                { base: 10, arg: 100, ans: 2 }, { base: 10, arg: 1000, ans: 3 },
                { base: 10, arg: 10, ans: 1 }, { base: 6, arg: 36, ans: 2 },
                { base: 7, arg: 49, ans: 2 },
            ];
            const p = logProblems[Math.floor(Math.random() * logProblems.length)];
            return { question: `log_${p.base}(${p.arg})`, display: `log${toSubscript(p.base)}(${p.arg})`, answer: p.ans };
        }

        case 'quadratics': {
            // x² + bx + c = 0 where roots are r1, r2 (both integers)
            // We ask for one root — the POSITIVE or SMALLER one
            const r1 = Math.floor(Math.random() * 8) + 1;
            const r2 = Math.floor(Math.random() * 8) + 1;
            const b = -(r1 + r2);
            const c = r1 * r2;
            const bStr = b >= 0 ? `+ ${b}` : `− ${Math.abs(b)}`;
            const cStr = c >= 0 ? `+ ${c}` : `− ${Math.abs(c)}`;
            const smaller = Math.min(r1, r2);
            return {
                question: `x² ${bStr}x ${cStr} = 0, smaller x?`,
                display: `x² ${bStr}x ${cStr} = 0`,
                answer: smaller,
            };
        }

        case 'fractions': {
            const type = Math.floor(Math.random() * 3);
            if (type === 0) {
                // a/b + c/b (same denominator)
                const den = Math.floor(Math.random() * 8) + 2;
                const num1 = Math.floor(Math.random() * den) + 1;
                const num2 = Math.floor(Math.random() * den) + 1;
                const ansNum = num1 + num2;
                // Only if it simplifies to a whole number
                if (ansNum % den === 0) {
                    return { question: `${num1}/${den} + ${num2}/${den}`, answer: ansNum / den };
                }
                // fallback: simpler fraction
                const a = Math.floor(Math.random() * 5) + 1;
                const b = Math.floor(Math.random() * 5) + 1;
                return { question: `${a * b} ÷ ${b}`, answer: a };
            } else if (type === 1) {
                // What is a/b as a decimal (simple ones)
                const fracs = [
                    { n: 1, d: 2, ans: 0.5 }, { n: 1, d: 4, ans: 0.25 },
                    { n: 3, d: 4, ans: 0.75 }, { n: 1, d: 5, ans: 0.2 },
                    { n: 2, d: 5, ans: 0.4 }, { n: 3, d: 5, ans: 0.6 },
                ];
                const f = fracs[Math.floor(Math.random() * fracs.length)];
                // Ask: how many [d]ths in [answer]
                return { question: `${f.n}/${f.d} × ${f.d * 10}`, answer: f.n * 10 };
            } else {
                // a × (b/c) where result is whole
                const c = Math.floor(Math.random() * 6) + 2;
                const b = Math.floor(Math.random() * 5) + 1;
                const a = c * (Math.floor(Math.random() * 5) + 1);
                return { question: `${a} × ${b}/${c}`, answer: (a * b) / c };
            }
        }

        case 'negatives': {
            const type = Math.floor(Math.random() * 4);
            if (type === 0) {
                const a = -(Math.floor(Math.random() * 20) + 1);
                const b = Math.floor(Math.random() * 30) + 1;
                return { question: `${a} + ${b}`, answer: a + b };
            } else if (type === 1) {
                const a = -(Math.floor(Math.random() * 15) + 1);
                const b = -(Math.floor(Math.random() * 15) + 1);
                return { question: `(${a}) + (${b})`, answer: a + b };
            } else if (type === 2) {
                const a = -(Math.floor(Math.random() * 10) + 1);
                const b = -(Math.floor(Math.random() * 10) + 1);
                return { question: `(${a}) × (${b})`, answer: a * b };
            } else {
                const a = -(Math.floor(Math.random() * 10) + 1);
                const b = Math.floor(Math.random() * 10) + 1;
                return { question: `(${a}) × ${b}`, answer: a * b };
            }
        }

        default:
            return { question: '1 + 1', answer: 2 };
    }
}

function toSuperscript(n: number): string {
    const map: Record<string, string> = { '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹' };
    return String(n).split('').map(c => map[c] || c).join('');
}

function toSubscript(n: number): string {
    const map: Record<string, string> = { '0': '₀', '1': '₁', '2': '₂', '3': '₃', '4': '₄', '5': '₅', '6': '₆', '7': '₇', '8': '₈', '9': '₉' };
    return String(n).split('').map(c => map[c] || c).join('');
}

// ── Topic Selector ─────────────────────────────────────────────────────

function TopicSelector({ selected, onToggle, onStart }: {
    selected: Set<string>;
    onToggle: (id: string) => void;
    onStart: () => void;
}) {
    const grouped = {
        easy: TOPICS.filter(t => t.difficulty === 'easy'),
        medium: TOPICS.filter(t => t.difficulty === 'medium'),
        hard: TOPICS.filter(t => t.difficulty === 'hard'),
    };

    const selectAll = () => TOPICS.forEach(t => { if (!selected.has(t.id)) onToggle(t.id); });
    const clearAll = () => TOPICS.forEach(t => { if (selected.has(t.id)) onToggle(t.id); });

    return (
        <div className="w-full max-w-xl">
            <div className="text-center mb-8">
                <div className="w-16 h-16 bg-sky-100 dark:bg-sky-500/15 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Settings2 className="w-7 h-7 text-sky-500" />
                </div>
                <h2 className="text-2xl font-bold text-sky-900 dark:text-white mb-2">Choose Your Topics</h2>
                <p className="text-sm text-sky-600/50 dark:text-sky-400/50">
                    Select the math topics you want to practice. Pick at least one!
                </p>
            </div>

            {/* Quick actions */}
            <div className="flex items-center justify-center gap-3 mb-6">
                <button
                    onClick={selectAll}
                    className="px-3 py-1.5 text-[11px] font-semibold text-sky-500 bg-sky-500/[0.06] hover:bg-sky-500/[0.1] rounded-full transition-colors"
                >
                    Select All
                </button>
                <button
                    onClick={clearAll}
                    className="px-3 py-1.5 text-[11px] font-semibold text-sky-400/50 hover:text-sky-500 bg-sky-500/[0.04] hover:bg-sky-500/[0.08] rounded-full transition-colors"
                >
                    Clear All
                </button>
            </div>

            {/* Topic groups */}
            {(['easy', 'medium', 'hard'] as const).map(diff => (
                <div key={diff} className="mb-5">
                    <div className="flex items-center gap-2 mb-2.5">
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${DIFFICULTY_COLORS[diff].badge}`}>
                            {diff}
                        </span>
                        <div className="flex-1 h-px bg-sky-100 dark:bg-gray-800" />
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {grouped[diff].map(topic => {
                            const isSelected = selected.has(topic.id);
                            return (
                                <button
                                    key={topic.id}
                                    onClick={() => onToggle(topic.id)}
                                    className={`flex items-start gap-2.5 p-3 rounded-xl border-2 text-left transition-all ${isSelected
                                            ? 'bg-sky-50 dark:bg-sky-500/10 border-sky-400 dark:border-sky-500/40 shadow-sm shadow-sky-500/5'
                                            : 'bg-white/60 dark:bg-gray-900/40 border-sky-100/60 dark:border-gray-800 hover:border-sky-200 dark:hover:border-gray-700'
                                        }`}
                                >
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-sm font-bold ${isSelected ? 'bg-sky-500 text-white' : 'bg-sky-100 dark:bg-gray-800 text-sky-500/50'
                                        }`}>
                                        {isSelected ? '✓' : topic.emoji}
                                    </div>
                                    <div className="min-w-0">
                                        <p className={`text-[13px] font-semibold leading-tight ${isSelected ? 'text-sky-900 dark:text-white' : 'text-sky-700/70 dark:text-sky-300/70'
                                            }`}>
                                            {topic.label}
                                        </p>
                                        <p className="text-[10px] text-sky-500/40 dark:text-sky-400/30 leading-tight mt-0.5">
                                            {topic.description}
                                        </p>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>
            ))}

            {/* Start button */}
            <div className="text-center mt-8">
                <button
                    onClick={onStart}
                    disabled={selected.size === 0}
                    className="inline-flex items-center gap-2 px-8 py-3 text-sm font-semibold text-sky-700 bg-[#ebf6b5] hover:bg-[#e0efa0] border border-[#d4e88e] rounded-full transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                >
                    <Play className="w-4 h-4" />
                    Start Sprint ({selected.size} topic{selected.size !== 1 ? 's' : ''})
                </button>
            </div>
        </div>
    );
}

// ── Game Component ─────────────────────────────────────────────────────

function MathSprintGame({ topics, onBack }: { topics: string[]; onBack: () => void }) {
    const [problem, setProblem] = useState<Problem | null>(null);
    const [userInput, setUserInput] = useState('');
    const [score, setScore] = useState(0);
    const [streak, setStreak] = useState(0);
    const [bestStreak, setBestStreak] = useState(0);
    const [timeLeft, setTimeLeft] = useState(60);
    const [gameStarted, setGameStarted] = useState(false);
    const [gameOver, setGameOver] = useState(false);
    const [totalAnswered, setTotalAnswered] = useState(0);
    const [correct, setCorrect] = useState(0);
    const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const nextProblem = useCallback(() => {
        setProblem(generateProblem(topics));
        setUserInput('');
        setFeedback(null);
        setTimeout(() => inputRef.current?.focus(), 50);
    }, [topics]);

    const startGame = () => {
        setScore(0);
        setStreak(0);
        setBestStreak(0);
        setTimeLeft(60);
        setGameOver(false);
        setTotalAnswered(0);
        setCorrect(0);
        setGameStarted(true);
        setProblem(null);
    };

    useEffect(() => {
        if (gameStarted && !gameOver && !problem) {
            nextProblem();
        }
    }, [gameStarted, gameOver, problem, nextProblem]);

    useEffect(() => {
        if (!gameStarted || gameOver) return;
        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) { setGameOver(true); return 0; }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, [gameStarted, gameOver]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!userInput.trim() || !problem || feedback) return;

        const parsed = parseFloat(userInput);
        setTotalAnswered(t => t + 1);

        if (Math.abs(parsed - problem.answer) < 0.01) {
            const streakBonus = streak >= 5 ? 10 : streak >= 3 ? 5 : 0;
            const timeBonus = timeLeft > 30 ? 3 : 0;
            setScore(s => s + 10 + streakBonus + timeBonus);
            setStreak(s => { const ns = s + 1; setBestStreak(b => Math.max(b, ns)); return ns; });
            setCorrect(c => c + 1);
            setFeedback('correct');
        } else {
            setStreak(0);
            setFeedback('wrong');
        }

        setTimeout(() => nextProblem(), 500);
    };

    const accuracy = totalAnswered > 0 ? Math.round((correct / totalAnswered) * 100) : 0;
    const timerPercent = (timeLeft / 60) * 100;

    if (!gameStarted) {
        startGame();
        return null;
    }

    return (
        <div className="flex flex-col items-center w-full max-w-lg">
            {/* Stats */}
            <div className="flex items-center gap-3 mb-5 w-full">
                <div className="flex-1 flex items-center gap-2 px-4 py-2.5 bg-white/60 dark:bg-gray-900 border border-sky-100 dark:border-gray-800 rounded-2xl">
                    <Trophy className="w-4 h-4 text-sky-500" />
                    <span className="text-sm font-bold text-sky-900 dark:text-white">{score}</span>
                    <span className="text-[11px] text-sky-500/50 font-medium">pts</span>
                </div>
                <div className="flex-1 flex items-center gap-2 px-4 py-2.5 bg-white/60 dark:bg-gray-900 border border-sky-100 dark:border-gray-800 rounded-2xl">
                    <Zap className="w-4 h-4 text-amber-500" />
                    <span className="text-sm font-bold text-sky-900 dark:text-white">{streak}</span>
                    <span className="text-[11px] text-sky-500/50 font-medium">streak</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2.5 bg-white/60 dark:bg-gray-900 border border-sky-100 dark:border-gray-800 rounded-2xl">
                    <Timer className={`w-4 h-4 ${timeLeft <= 10 ? 'text-red-500' : 'text-sky-500'}`} />
                    <span className={`text-sm font-bold ${timeLeft <= 10 ? 'text-red-500' : 'text-sky-900 dark:text-white'}`}>{timeLeft}s</span>
                </div>
                <button onClick={startGame} className="p-2 text-sky-500 hover:text-sky-700 dark:hover:text-sky-300 hover:bg-sky-50 dark:hover:bg-gray-800 rounded-xl transition-colors" title="Restart">
                    <RotateCcw className="w-4 h-4" />
                </button>
            </div>

            {/* Game area */}
            <div className="relative w-full bg-white/60 dark:bg-gray-900/60 border border-sky-100 dark:border-gray-800 rounded-2xl overflow-hidden">
                {gameOver ? (
                    <div className="flex flex-col items-center justify-center gap-3 py-16 px-6">
                        <h2 className="text-3xl font-bold text-sky-500">Time&apos;s Up! 🧮</h2>
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
                        <p className="text-sm text-sky-600/40 mt-1">{correct}/{totalAnswered} correct · {topics.length} topic{topics.length !== 1 ? 's' : ''}</p>
                        <div className="flex items-center gap-3 mt-3">
                            <button onClick={startGame} className="flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-sky-700 bg-[#ebf6b5] hover:bg-[#e0efa0] border border-[#d4e88e] rounded-full transition-colors">
                                <RotateCcw className="w-4 h-4" />
                                Play Again
                            </button>
                            <button onClick={onBack} className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-sky-500 hover:text-sky-600 bg-sky-500/[0.06] hover:bg-sky-500/[0.1] rounded-full transition-colors">
                                <Settings2 className="w-4 h-4" />
                                Topics
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="p-6">
                        {/* Timer bar */}
                        <div className="w-full h-1.5 bg-sky-100 dark:bg-gray-800 rounded-full mb-8 overflow-hidden">
                            <motion.div
                                className={`h-full rounded-full ${timerPercent > 50 ? 'bg-sky-500' : timerPercent > 20 ? 'bg-amber-500' : 'bg-red-500'}`}
                                animate={{ width: `${timerPercent}%` }}
                                transition={{ duration: 0.3 }}
                            />
                        </div>

                        {/* Problem */}
                        {problem && (
                            <div className="text-center mb-6">
                                <AnimatePresence mode="wait">
                                    <motion.div
                                        key={problem.question}
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 10 }}
                                    >
                                        <div className="text-4xl sm:text-5xl font-bold text-sky-900 dark:text-white tracking-tight">
                                            {problem.display || problem.question}
                                        </div>
                                        {problem.display && problem.display !== problem.question && problem.question.includes('smaller') && (
                                            <p className="text-xs text-sky-500/40 mt-2 font-medium">Find the smaller root</p>
                                        )}
                                    </motion.div>
                                </AnimatePresence>
                                <p className="text-xs text-sky-500/30 mt-2 font-medium">= ?</p>
                            </div>
                        )}

                        {/* Input */}
                        <form onSubmit={handleSubmit}>
                            <div className="flex gap-2">
                                <input
                                    ref={inputRef}
                                    type="number"
                                    step="any"
                                    value={userInput}
                                    onChange={(e) => setUserInput(e.target.value)}
                                    placeholder="Answer"
                                    autoFocus
                                    className="flex-1 px-4 py-3 bg-white dark:bg-gray-800 border border-sky-200/60 dark:border-gray-700 rounded-xl text-lg font-bold text-sky-900 dark:text-white placeholder:text-sky-300/30 outline-none focus:border-sky-400 dark:focus:border-sky-500/40 transition-colors text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                />
                                <button type="submit" disabled={!userInput.trim()} className="px-5 py-3 bg-sky-500 text-white font-semibold text-sm rounded-xl hover:bg-sky-600 disabled:opacity-40 transition-all">
                                    <CheckCircle2 className="w-5 h-5" />
                                </button>
                            </div>
                        </form>

                        {/* Feedback */}
                        <AnimatePresence>
                            {feedback && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0 }}
                                    className={`flex items-center justify-center gap-2 mt-4 text-sm font-bold py-2 rounded-xl ${feedback === 'correct'
                                            ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10'
                                            : 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10'
                                        }`}
                                >
                                    {feedback === 'correct' ? (
                                        <><CheckCircle2 className="w-4 h-4" /> Correct!</>
                                    ) : (
                                        <><XCircle className="w-4 h-4" /> Answer: {problem?.answer}</>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                )}
            </div>
        </div>
    );
}

// ── Page ────────────────────────────────────────────────────────────────

export default function MathSprintPage() {
    const { authenticated } = useRequireAuth();
    if (!authenticated) return null;
    const { homeworks } = useClassContext();
    const totalHomeworks = homeworks ? homeworks.length : 0;
    const completedHomeworks = homeworks ? homeworks.filter(hw => hw.completed).length : 0;

    const completionPercentage = totalHomeworks > 0 ? (completedHomeworks / totalHomeworks) * 100 : 0;
    const hasEarnedAccess = completionPercentage >= 60;

    const [selectedTopics, setSelectedTopics] = useState<Set<string>>(new Set(['basic-add-sub', 'multiplication']));
    const [phase, setPhase] = useState<'select' | 'play'>('select');

    const toggleTopic = (id: string) => {
        setSelectedTopics(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    return (
        <div className="min-h-screen bg-[#fffaf4] dark:bg-gray-950 relative">
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-sky-200/20 dark:bg-sky-500/[0.06] rounded-full blur-[140px]" />
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
                            <h1 className="text-4xl lg:text-[52px] font-bold text-sky-500 dark:text-sky-400 leading-[1.08] tracking-tight mb-2">Math Sprint</h1>
                            <p className="text-sky-600/50 dark:text-sky-400/50 text-sm max-w-md">
                                {phase === 'select' ? 'Pick your topics, then race the clock!' : 'Solve as many as you can in 60 seconds!'}
                            </p>
                        </motion.div>

                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="w-full flex justify-center">
                            {phase === 'select' ? (
                                <TopicSelector
                                    selected={selectedTopics}
                                    onToggle={toggleTopic}
                                    onStart={() => setPhase('play')}
                                />
                            ) : (
                                <MathSprintGame
                                    topics={Array.from(selectedTopics)}
                                    onBack={() => setPhase('select')}
                                />
                            )}
                        </motion.div>
                    </div>
                ) : (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center justify-center py-16">
                        <div className="w-full max-w-md">
                            <div className="text-center mb-8">
                                <h1 className="text-4xl lg:text-[52px] font-bold text-sky-500 dark:text-sky-400 leading-[1.08] tracking-tight mb-2">Math Sprint</h1>
                                <p className="text-sky-600/50 dark:text-sky-400/50 text-sm">Complete more homework to unlock this game</p>
                            </div>
                            <div className="bg-white/60 dark:bg-gray-900 border border-sky-100 dark:border-gray-800 rounded-2xl p-6">
                                <div className="flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-500/10 border border-amber-200/60 dark:border-amber-500/20 rounded-xl mb-5">
                                    <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-sm font-semibold text-amber-800 dark:text-amber-300 mb-1">60% homework required</p>
                                        <p className="text-xs text-amber-600/80 dark:text-amber-400/80">Complete more assignments to unlock Math Sprint.</p>
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
                                        {completedHomeworks} of {totalHomeworks} assignments · {Math.max(0, Math.ceil(totalHomeworks * 0.60) - completedHomeworks)} more to unlock
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
