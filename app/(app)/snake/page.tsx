'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useClassContext } from '@/context/ClassContext';
import { useRequireAuth } from '@/hooks/use-require-auth';
import { HugeIcon } from '@/lib/huge-icon-map';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

const GRID_SIZE = 20;
const CELL_SIZE = 24;
const INITIAL_SNAKE = [{ x: 10, y: 10 }];
const INITIAL_DIRECTION = { x: 1, y: 0 };
const GAME_SPEED = 150;

function SnakeGame({ barrierCount }: { barrierCount: number }) {
    const [snake, setSnake] = useState(INITIAL_SNAKE);
    const [direction, setDirection] = useState(INITIAL_DIRECTION);
    const [checkmark, setCheckmark] = useState<{ x: number; y: number } | null>(null);
    const [barriers, setBarriers] = useState<{ x: number; y: number }[]>([]);
    const [gameOver, setGameOver] = useState(false);
    const [score, setScore] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const [gameStarted, setGameStarted] = useState(false);

    function generateCheckmark(existingBarriers: { x: number; y: number }[], existingSnake: { x: number; y: number }[]) {
        let pos: { x: number; y: number };
        let attempts = 0;
        do {
            pos = {
                x: Math.floor(Math.random() * GRID_SIZE),
                y: Math.floor(Math.random() * GRID_SIZE)
            };
            attempts++;
        } while (
            attempts < 100 &&
            (existingBarriers.some(b => b.x === pos.x && b.y === pos.y) ||
                existingSnake.some(s => s.x === pos.x && s.y === pos.y))
        );
        return pos;
    }

    function generateBarriers(count: number, existingSnake: { x: number; y: number }[]) {
        const newBarriers: { x: number; y: number }[] = [];
        let attempts = 0;
        while (newBarriers.length < count && attempts < 1000) {
            const pos = {
                x: Math.floor(Math.random() * GRID_SIZE),
                y: Math.floor(Math.random() * GRID_SIZE)
            };
            if (!existingSnake.some(s => s.x === pos.x && s.y === pos.y) &&
                !newBarriers.some(b => b.x === pos.x && b.y === pos.y)) {
                newBarriers.push(pos);
            }
            attempts++;
        }
        return newBarriers;
    }

    const startGame = () => {
        const newBarriers = generateBarriers(barrierCount, INITIAL_SNAKE);
        setBarriers(newBarriers);
        setCheckmark(generateCheckmark(newBarriers, INITIAL_SNAKE));
        setSnake(INITIAL_SNAKE);
        setDirection(INITIAL_DIRECTION);
        setGameOver(false);
        setScore(0);
        setIsPaused(false);
        setGameStarted(true);
    };

    const moveSnake = useCallback(() => {
        if (gameOver || isPaused || !gameStarted) return;

        setSnake(prev => {
            const head = prev[0];
            const newHead = {
                x: head.x + direction.x,
                y: head.y + direction.y
            };

            if (newHead.x < 0 || newHead.x >= GRID_SIZE ||
                newHead.y < 0 || newHead.y >= GRID_SIZE) {
                setGameOver(true);
                return prev;
            }

            if (prev.some(seg => seg.x === newHead.x && seg.y === newHead.y)) {
                setGameOver(true);
                return prev;
            }

            if (barriers.some(b => b.x === newHead.x && b.y === newHead.y)) {
                setGameOver(true);
                return prev;
            }

            const newSnake = [newHead, ...prev];

            if (checkmark && newHead.x === checkmark.x && newHead.y === checkmark.y) {
                setScore(s => s + 1);
                setCheckmark(generateCheckmark(barriers, newSnake));
            } else {
                newSnake.pop();
            }

            return newSnake;
        });
    }, [direction, checkmark, barriers, gameOver, isPaused, gameStarted]);

    useEffect(() => {
        const handleKeyPress = (e: KeyboardEvent) => {
            if (e.key === ' ') {
                e.preventDefault();
                if (gameStarted) setIsPaused(p => !p);
                return;
            }

            if (e.key === 'r' || e.key === 'R') {
                e.preventDefault();
                startGame();
                return;
            }

            if (isPaused || !gameStarted) return;

            switch (e.key) {
                case 'ArrowUp':
                    if (direction.y === 0) setDirection({ x: 0, y: -1 });
                    break;
                case 'ArrowDown':
                    if (direction.y === 0) setDirection({ x: 0, y: 1 });
                    break;
                case 'ArrowLeft':
                    if (direction.x === 0) setDirection({ x: -1, y: 0 });
                    break;
                case 'ArrowRight':
                    if (direction.x === 0) setDirection({ x: 1, y: 0 });
                    break;
            }
        };

        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, [direction, isPaused, gameStarted]);

    useEffect(() => {
        const interval = setInterval(moveSnake, GAME_SPEED);
        return () => clearInterval(interval);
    }, [moveSnake]);

    return (
        <div className="flex flex-col items-center">
            {/* Score bar */}
            <div className="flex items-center gap-3 mb-5 w-full max-w-[480px]">
                <div className="flex-1 flex items-center gap-3 px-4 py-2.5 bg-white/60 dark:bg-gray-900 border border-sky-100 dark:border-gray-800 rounded-2xl">
                    <HugeIcon name="Award01" className="w-4 h-4 text-sky-500" />
                    <span className="text-sm font-bold text-sky-900 dark:text-white">{score}</span>
                    <span className="text-[11px] text-sky-500/50 font-medium">points</span>
                </div>
                <div className="flex-1 flex items-center gap-3 px-4 py-2.5 bg-white/60 dark:bg-gray-900 border border-sky-100 dark:border-gray-800 rounded-2xl">
                    <HugeIcon name="Zap" className="w-4 h-4 text-sky-500" />
                    <span className="text-sm font-bold text-sky-900 dark:text-white">{barrierCount}</span>
                    <span className="text-[11px] text-sky-500/50 font-medium">barriers</span>
                </div>
                {gameStarted && (
                    <div className="flex items-center gap-1.5">
                        <button
                            onClick={() => setIsPaused(p => !p)}
                            className="p-2 text-sky-500 hover:text-sky-700 dark:hover:text-sky-300 hover:bg-sky-50 dark:hover:bg-gray-800 rounded-xl transition-colors"
                            title={isPaused ? 'Resume' : 'Pause'}
                        >
                            {isPaused ? <HugeIcon name="Play" className="w-4 h-4" /> : <HugeIcon name="Pause" className="w-4 h-4" />}
                        </button>
                        <button
                            onClick={startGame}
                            className="p-2 text-sky-500 hover:text-sky-700 dark:hover:text-sky-300 hover:bg-sky-50 dark:hover:bg-gray-800 rounded-xl transition-colors"
                            title="Restart"
                        >
                            <HugeIcon name="Rotate01" className="w-4 h-4" />
                        </button>
                    </div>
                )}
            </div>

            {/* Game board */}
            <div
                className="relative bg-sky-950 dark:bg-gray-900 rounded-2xl border border-sky-200/50 dark:border-gray-700 shadow-lg overflow-hidden"
                style={{
                    width: GRID_SIZE * CELL_SIZE,
                    height: GRID_SIZE * CELL_SIZE
                }}
            >
                {/* Grid lines */}
                <div className="absolute inset-0 grid" style={{
                    gridTemplateColumns: `repeat(${GRID_SIZE}, ${CELL_SIZE}px)`,
                    gridTemplateRows: `repeat(${GRID_SIZE}, ${CELL_SIZE}px)`
                }}>
                    {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, i) => (
                        <div key={i} className="border border-sky-900/20 dark:border-gray-800/50" />
                    ))}
                </div>

                {/* Barriers */}
                {barriers.map((barrier, i) => (
                    <div
                        key={i}
                        className="absolute rounded-[4px]"
                        style={{
                            left: barrier.x * CELL_SIZE + 1,
                            top: barrier.y * CELL_SIZE + 1,
                            width: CELL_SIZE - 2,
                            height: CELL_SIZE - 2,
                            backgroundColor: '#f59e0b',
                            opacity: 0.7,
                        }}
                    />
                ))}

                {/* Snake */}
                {snake.map((segment, i) => (
                    <div
                        key={i}
                        className="absolute rounded-[4px]"
                        style={{
                            left: segment.x * CELL_SIZE + 1,
                            top: segment.y * CELL_SIZE + 1,
                            width: CELL_SIZE - 2,
                            height: CELL_SIZE - 2,
                            backgroundColor: i === 0 ? '#38bdf8' : '#7dd3fc',
                            boxShadow: i === 0 ? '0 0 8px rgba(56,189,248,0.5)' : 'none',
                            transition: `left ${GAME_SPEED}ms linear, top ${GAME_SPEED}ms linear`
                        }}
                    />
                ))}

                {/* Checkmark (food) */}
                {checkmark && (
                    <div
                        className="absolute flex items-center justify-center"
                        style={{
                            left: checkmark.x * CELL_SIZE,
                            top: checkmark.y * CELL_SIZE,
                            width: CELL_SIZE,
                            height: CELL_SIZE
                        }}
                    >
                        <div className="w-5 h-5 bg-[#ebf6b5] rounded-full flex items-center justify-center">
                            <HugeIcon name="CheckmarkCircle02" className="text-sky-700 w-3.5 h-3.5" />
                        </div>
                    </div>
                )}

                {/* Start overlay */}
                {!gameStarted && !gameOver && (
                    <div className="absolute inset-0 bg-sky-950/80 dark:bg-gray-950/80 backdrop-blur-sm flex flex-col items-center justify-center gap-4">
                        <h2 className="text-2xl font-bold text-white">Ready to Play?</h2>
                        <button
                            onClick={startGame}
                            className="flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-sky-700 bg-[#ebf6b5] hover:bg-[#e0efa0] border border-[#d4e88e] rounded-full transition-colors"
                        >
                            <HugeIcon name="Play" className="w-4 h-4" />
                            Start Game
                        </button>
                    </div>
                )}

                {/* Game over overlay */}
                {gameOver && (
                    <div className="absolute inset-0 bg-sky-950/85 dark:bg-gray-950/85 backdrop-blur-sm flex flex-col items-center justify-center gap-3">
                        <h2 className="text-3xl font-bold text-white">Game Over</h2>
                        <p className="text-lg text-sky-200 font-medium">Score: {score}</p>
                        <button
                            onClick={startGame}
                            className="flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-sky-700 bg-[#ebf6b5] hover:bg-[#e0efa0] border border-[#d4e88e] rounded-full transition-colors mt-2"
                        >
                            <HugeIcon name="Rotate01" className="w-4 h-4" />
                            Play Again
                        </button>
                    </div>
                )}

                {/* Paused overlay */}
                {isPaused && !gameOver && gameStarted && (
                    <div className="absolute inset-0 bg-sky-950/70 dark:bg-gray-950/70 backdrop-blur-sm flex items-center justify-center">
                        <h2 className="text-3xl font-bold text-white">Paused</h2>
                    </div>
                )}
            </div>

            {/* Controls hint */}
            {gameStarted && (
                <p className="text-[11px] text-sky-500/40 dark:text-sky-400/30 mt-4 text-center">
                    Arrow keys to move · Space to pause · R to restart
                </p>
            )}
        </div>
    );
}

export default function SnakePage() {
    const { authenticated } = useRequireAuth();
    if (!authenticated) return null;
    const { homeworks } = useClassContext();
    const totalHomeworks = homeworks ? homeworks.length : 0;
    const completedHomeworks = homeworks ? homeworks.filter(hw => hw.completed).length : 0;
    const remainingCount = totalHomeworks - completedHomeworks;

    const completionPercentage = totalHomeworks > 0 ? (completedHomeworks / totalHomeworks) * 100 : 0;
    const hasEarnedAccess = completionPercentage > 75;

    return (
        <div className="min-h-screen bg-[#fffaf4] dark:bg-gray-950 relative">
            {/* Background orbs */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-sky-200/20 dark:bg-sky-500/[0.06] rounded-full blur-[140px]" />
                <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-[#ebf6b5]/30 dark:bg-emerald-500/[0.04] rounded-full blur-[120px]" />
            </div>

            <div className="relative z-10 px-4 sm:px-6 md:px-12 lg:px-16 pt-28 pb-16">
                {/* Back button */}
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                    <Link href="/games" className="inline-flex items-center gap-2 text-sm text-sky-500 hover:text-sky-600 dark:text-sky-400 dark:hover:text-sky-300 font-semibold transition-colors mb-6">
                        <HugeIcon name="ArrowLeft01" className="w-4 h-4" />
                        Back to Game Center
                    </Link>
                </motion.div>

                {hasEarnedAccess ? (
                    <div className="flex flex-col items-center">
                        {/* Header */}
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-center mb-8"
                        >
                            <h1 className="text-4xl lg:text-[52px] font-bold text-sky-500 dark:text-sky-400 leading-[1.08] tracking-tight mb-2">
                                Snake
                            </h1>
                            <p className="text-sky-600/50 dark:text-sky-400/50 text-sm max-w-md">
                                Collect checkmarks to score. {remainingCount} barrier{remainingCount !== 1 ? 's' : ''} based on your remaining homework.
                            </p>
                        </motion.div>

                        {/* Game */}
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.05 }}
                        >
                            <SnakeGame barrierCount={remainingCount} />
                        </motion.div>
                    </div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex flex-col items-center justify-center py-16"
                    >
                        <div className="w-full max-w-md">
                            <div className="text-center mb-8">
                                <h1 className="text-4xl lg:text-[52px] font-bold text-sky-500 dark:text-sky-400 leading-[1.08] tracking-tight mb-2">
                                    Snake
                                </h1>
                                <p className="text-sky-600/50 dark:text-sky-400/50 text-sm">
                                    Complete more homework to unlock this game
                                </p>
                            </div>

                            <div className="bg-white/60 dark:bg-gray-900 border border-sky-100 dark:border-gray-800 rounded-2xl p-6">
                                <div className="flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-500/10 border border-amber-200/60 dark:border-amber-500/20 rounded-xl mb-5">
                                    <HugeIcon name="AlertCircle" className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-sm font-semibold text-amber-800 dark:text-amber-300 mb-1">
                                            75% homework required
                                        </p>
                                        <p className="text-xs text-amber-600/80 dark:text-amber-400/80">
                                            Complete more assignments to unlock Snake.
                                        </p>
                                    </div>
                                </div>

                                <div className="mb-4">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-xs font-semibold text-sky-600 dark:text-sky-400 uppercase tracking-wider">Progress</span>
                                        <span className="text-sm font-bold text-sky-900 dark:text-white">
                                            {completionPercentage.toFixed(0)}%
                                        </span>
                                    </div>
                                    <div className="w-full bg-sky-100 dark:bg-gray-800 rounded-full h-2.5 overflow-hidden">
                                        <div
                                            className="bg-sky-500 h-2.5 rounded-full transition-all duration-500"
                                            style={{ width: `${completionPercentage}%` }}
                                        />
                                    </div>
                                    <p className="text-[11px] text-sky-500/40 dark:text-sky-400/30 mt-2">
                                        {completedHomeworks} of {totalHomeworks} assignments · {Math.max(0, Math.ceil(totalHomeworks * 0.75) - completedHomeworks)} more to unlock
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