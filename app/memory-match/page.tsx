'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useClassContext } from '@/context/ClassContext';
import { useRequireAuth } from '@/hooks/use-require-auth';
import { ArrowLeft, RotateCcw, Trophy, Brain, Sparkles, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

const EMOJIS = ['📚', '🧪', '🎨', '🎵', '📐', '🌍', '💻', '🔬', '✏️', '🏀', '🧮', '🎭', '📖', '🔭', '🧬', '🎯', '🧠', '⚡'];

interface Card {
    id: number;
    emoji: string;
    flipped: boolean;
    matched: boolean;
}

function MemoryMatchGame({ pairCount }: { pairCount: number }) {
    const [cards, setCards] = useState<Card[]>([]);
    const [flippedIds, setFlippedIds] = useState<number[]>([]);
    const [moves, setMoves] = useState(0);
    const [matchedPairs, setMatchedPairs] = useState(0);
    const [gameStarted, setGameStarted] = useState(false);
    const [gameWon, setGameWon] = useState(false);
    const [isChecking, setIsChecking] = useState(false);

    const totalPairs = pairCount;

    const initGame = useCallback(() => {
        const selected = EMOJIS.slice(0, totalPairs);
        const deck = [...selected, ...selected].map((emoji, i) => ({
            id: i,
            emoji,
            flipped: false,
            matched: false,
        }));
        // Shuffle
        for (let i = deck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [deck[i], deck[j]] = [deck[j], deck[i]];
        }
        setCards(deck);
        setFlippedIds([]);
        setMoves(0);
        setMatchedPairs(0);
        setGameWon(false);
        setGameStarted(true);
    }, [totalPairs]);

    const handleCardClick = (id: number) => {
        if (isChecking) return;
        if (flippedIds.length >= 2) return;
        if (cards[id].flipped || cards[id].matched) return;

        const newCards = [...cards];
        newCards[id] = { ...newCards[id], flipped: true };
        setCards(newCards);

        const newFlipped = [...flippedIds, id];
        setFlippedIds(newFlipped);

        if (newFlipped.length === 2) {
            setMoves(m => m + 1);
            setIsChecking(true);

            const [first, second] = newFlipped;
            if (newCards[first].emoji === newCards[second].emoji) {
                // Match!
                setTimeout(() => {
                    setCards(prev => prev.map((c, i) =>
                        i === first || i === second ? { ...c, matched: true } : c
                    ));
                    const newMatched = matchedPairs + 1;
                    setMatchedPairs(newMatched);
                    if (newMatched === totalPairs) {
                        setGameWon(true);
                    }
                    setFlippedIds([]);
                    setIsChecking(false);
                }, 500);
            } else {
                // No match — flip back
                setTimeout(() => {
                    setCards(prev => prev.map((c, i) =>
                        i === first || i === second ? { ...c, flipped: false } : c
                    ));
                    setFlippedIds([]);
                    setIsChecking(false);
                }, 800);
            }
        }
    };

    const cols = totalPairs <= 6 ? 4 : totalPairs <= 8 ? 4 : 6;

    return (
        <div className="flex flex-col items-center">
            {/* Stats bar */}
            <div className="flex items-center gap-3 mb-5 w-full max-w-[500px]">
                <div className="flex-1 flex items-center gap-3 px-4 py-2.5 bg-white/60 dark:bg-gray-900 border border-sky-100 dark:border-gray-800 rounded-2xl">
                    <Trophy className="w-4 h-4 text-sky-500" />
                    <span className="text-sm font-bold text-sky-900 dark:text-white">{matchedPairs}/{totalPairs}</span>
                    <span className="text-[11px] text-sky-500/50 font-medium">pairs</span>
                </div>
                <div className="flex-1 flex items-center gap-3 px-4 py-2.5 bg-white/60 dark:bg-gray-900 border border-sky-100 dark:border-gray-800 rounded-2xl">
                    <Brain className="w-4 h-4 text-sky-500" />
                    <span className="text-sm font-bold text-sky-900 dark:text-white">{moves}</span>
                    <span className="text-[11px] text-sky-500/50 font-medium">moves</span>
                </div>
                {gameStarted && (
                    <button
                        onClick={initGame}
                        className="p-2 text-sky-500 hover:text-sky-700 dark:hover:text-sky-300 hover:bg-sky-50 dark:hover:bg-gray-800 rounded-xl transition-colors"
                        title="Restart"
                    >
                        <RotateCcw className="w-4 h-4" />
                    </button>
                )}
            </div>

            {/* Card grid */}
            <div className="relative">
                {!gameStarted && (
                    <div className="absolute inset-0 z-10 bg-sky-950/80 dark:bg-gray-950/80 backdrop-blur-sm flex flex-col items-center justify-center gap-4 rounded-2xl">
                        <h2 className="text-2xl font-bold text-white">Memory Match</h2>
                        <p className="text-sm text-sky-200/60 text-center max-w-xs">
                            Find all {totalPairs} matching pairs!
                        </p>
                        <button
                            onClick={initGame}
                            className="flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-sky-700 bg-[#ebf6b5] hover:bg-[#e0efa0] border border-[#d4e88e] rounded-full transition-colors"
                        >
                            <Sparkles className="w-4 h-4" />
                            Start Game
                        </button>
                    </div>
                )}

                <div
                    className="grid gap-2.5 p-4 bg-white/40 dark:bg-gray-900/40 border border-sky-100 dark:border-gray-800 rounded-2xl"
                    style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}
                >
                    {(gameStarted ? cards : Array.from({ length: totalPairs * 2 }).map((_, i) => ({
                        id: i, emoji: '', flipped: false, matched: false
                    }))).map((card, index) => (
                        <motion.button
                            key={card.id}
                            onClick={() => gameStarted && handleCardClick(index)}
                            whileTap={{ scale: 0.95 }}
                            className={`w-16 h-16 sm:w-[72px] sm:h-[72px] rounded-xl text-2xl font-bold transition-all duration-300 ${card.matched
                                ? 'bg-emerald-100 dark:bg-emerald-500/15 border-2 border-emerald-300 dark:border-emerald-500/30 scale-95'
                                : card.flipped
                                    ? 'bg-sky-100 dark:bg-sky-500/15 border-2 border-sky-300 dark:border-sky-500/30'
                                    : 'bg-sky-50 dark:bg-gray-800 border-2 border-sky-200/50 dark:border-gray-700 hover:border-sky-300 dark:hover:border-gray-600 cursor-pointer'
                                }`}
                        >
                            {card.flipped || card.matched ? (
                                <span>{card.emoji}</span>
                            ) : (
                                <span className="text-sky-300/30 dark:text-sky-500/20 text-lg">?</span>
                            )}
                        </motion.button>
                    ))}
                </div>

                {/* Win overlay */}
                <AnimatePresence>
                    {gameWon && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="absolute inset-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm z-10 flex flex-col items-center justify-center gap-3 rounded-2xl"
                        >
                            <h2 className="text-3xl font-bold text-sky-500">You Won! 🎉</h2>
                            <p className="text-lg text-sky-700 dark:text-sky-300 font-medium">
                                {moves} moves · {totalPairs} pairs
                            </p>
                            <button
                                onClick={initGame}
                                className="flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-sky-700 bg-[#ebf6b5] hover:bg-[#e0efa0] border border-[#d4e88e] rounded-full transition-colors mt-2"
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

export default function MemoryMatchPage() {
    const { authenticated } = useRequireAuth();
    if (!authenticated) return null;
    const { homeworks } = useClassContext();
    const totalHomeworks = homeworks ? homeworks.length : 0;
    const completedHomeworks = homeworks ? homeworks.filter(hw => hw.completed).length : 0;
    const remainingCount = totalHomeworks - completedHomeworks;

    const completionPercentage = totalHomeworks > 0 ? (completedHomeworks / totalHomeworks) * 100 : 0;
    const hasEarnedAccess = completionPercentage >= 70;

    // Scale difficulty: more remaining homework = more pairs (harder)
    const pairCount = Math.min(Math.max(6, 6 + Math.floor(remainingCount / 2)), 12);

    return (
        <div className="min-h-screen bg-[#fffaf4] dark:bg-gray-950 relative">
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-violet-200/20 dark:bg-violet-500/[0.06] rounded-full blur-[140px]" />
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
                                Memory Match
                            </h1>
                            <p className="text-sky-600/50 dark:text-sky-400/50 text-sm max-w-md">
                                Find matching pairs! {pairCount} pairs to match — {remainingCount > 0 ? `${remainingCount} extra cards from remaining homework` : 'minimum difficulty — nice work!'}.
                            </p>
                        </motion.div>

                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
                            <MemoryMatchGame pairCount={pairCount} />
                        </motion.div>
                    </div>
                ) : (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center justify-center py-16">
                        <div className="w-full max-w-md">
                            <div className="text-center mb-8">
                                <h1 className="text-4xl lg:text-[52px] font-bold text-sky-500 dark:text-sky-400 leading-[1.08] tracking-tight mb-2">
                                    Memory Match
                                </h1>
                                <p className="text-sky-600/50 dark:text-sky-400/50 text-sm">
                                    Complete more homework to unlock this game
                                </p>
                            </div>
                            <div className="bg-white/60 dark:bg-gray-900 border border-sky-100 dark:border-gray-800 rounded-2xl p-6">
                                <div className="flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-500/10 border border-amber-200/60 dark:border-amber-500/20 rounded-xl mb-5">
                                    <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-sm font-semibold text-amber-800 dark:text-amber-300 mb-1">70% homework required</p>
                                        <p className="text-xs text-amber-600/80 dark:text-amber-400/80">Complete more assignments to unlock Memory Match.</p>
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
                                        {completedHomeworks} of {totalHomeworks} assignments · {Math.max(0, Math.ceil(totalHomeworks * 0.70) - completedHomeworks)} more to unlock
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
