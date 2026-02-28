'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useClassContext } from '@/context/ClassContext';
import { useRequireAuth } from '@/hooks/use-require-auth';
import { ArrowLeft, Play, RotateCcw, Pause, Trophy, Zap, Layers, AlertTriangle, Timer } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';

const BOARD_WIDTH = 10;
const BOARD_HEIGHT = 20;
const CELL_SIZE = 28;
const INITIAL_SPEED = 800;
const SPEED_INCREASE_PER_LEVEL = 50;

// Tetris piece shapes (tetrominos)
const SHAPES = {
    I: [[1, 1, 1, 1]],
    O: [[1, 1], [1, 1]],
    T: [[0, 1, 0], [1, 1, 1]],
    S: [[0, 1, 1], [1, 1, 0]],
    Z: [[1, 1, 0], [0, 1, 1]],
    J: [[1, 0, 0], [1, 1, 1]],
    L: [[0, 0, 1], [1, 1, 1]]
};

const SHAPE_NAMES = Object.keys(SHAPES);

type Priority = 'low' | 'medium' | 'high';

interface Piece {
    shape: number[][];
    x: number;
    y: number;
    priority: Priority;
}

// App-consistent priority colors
const PRIORITY_COLORS = {
    low: '#38bdf8',    // sky-400
    medium: '#facc15',  // yellow-400
    high: '#f87171'     // red-400
};

const PRIORITY_LABELS = {
    low: 'Low',
    medium: 'Medium',
    high: 'High'
};

function TaskTowerGame({ pendingHomeworkCount, highCount, mediumCount, lowCount }: { pendingHomeworkCount: number; highCount: number; mediumCount: number; lowCount: number }) {
    const [board, setBoard] = useState<(Priority | null)[][]>(
        Array(BOARD_HEIGHT).fill(null).map(() => Array(BOARD_WIDTH).fill(null))
    );
    const [currentPiece, setCurrentPiece] = useState<Piece | null>(null);
    const [nextPiece, setNextPiece] = useState<Piece | null>(null);
    const [gameOver, setGameOver] = useState(false);
    const [score, setScore] = useState(0);
    const [lines, setLines] = useState(0);
    const [level, setLevel] = useState(1);
    const [isPaused, setIsPaused] = useState(false);
    const [gameStarted, setGameStarted] = useState(false);
    const gameLoopRef = useRef<NodeJS.Timeout | null>(null);

    const getGameSpeed = useCallback(() => {
        const baseSpeed = INITIAL_SPEED - (level - 1) * SPEED_INCREASE_PER_LEVEL;
        const homeworkSpeedModifier = Math.min(pendingHomeworkCount * 20, 300);
        return Math.max(baseSpeed - homeworkSpeedModifier, 100);
    }, [level, pendingHomeworkCount]);

    const highRef = useRef(highCount);
    const mediumRef = useRef(mediumCount);
    const lowRef = useRef(lowCount);

    const generatePiece = useCallback((): Piece => {
        const shapeName = SHAPE_NAMES[Math.floor(Math.random() * SHAPE_NAMES.length)];
        const shape = SHAPES[shapeName as keyof typeof SHAPES];

        const totalRemaining = highRef.current + mediumRef.current + lowRef.current;
        let priority: Priority;
        if (totalRemaining > 0) {
            const rand = Math.random() * totalRemaining;
            if (rand < highRef.current) {
                priority = 'high';
                highRef.current--;
            } else if (rand < highRef.current + mediumRef.current) {
                priority = 'medium';
                mediumRef.current--;
            } else {
                priority = 'low';
                lowRef.current--;
            }
        } else {
            const rand = Math.random();
            if (pendingHomeworkCount > 10) {
                priority = rand < 0.5 ? 'high' : rand < 0.8 ? 'medium' : 'low';
            } else if (pendingHomeworkCount > 5) {
                priority = rand < 0.33 ? 'high' : rand < 0.66 ? 'medium' : 'low';
            } else {
                priority = rand < 0.2 ? 'high' : rand < 0.5 ? 'medium' : 'low';
            }
        }

        return {
            shape,
            x: Math.floor(BOARD_WIDTH / 2) - Math.floor(shape[0].length / 2),
            y: 0,
            priority,
        };
    }, [pendingHomeworkCount, highCount, mediumCount, lowCount]);

    const startGame = useCallback(() => {
        setBoard(Array(BOARD_HEIGHT).fill(null).map(() => Array(BOARD_WIDTH).fill(null)));
        setCurrentPiece(generatePiece());
        setNextPiece(generatePiece());
        setGameOver(false);
        setScore(0);
        setLines(0);
        setLevel(1);
        setIsPaused(false);
        setGameStarted(true);
    }, [generatePiece]);

    const checkCollision = useCallback((piece: Piece, board: (Priority | null)[][], offsetX = 0, offsetY = 0): boolean => {
        for (let y = 0; y < piece.shape.length; y++) {
            for (let x = 0; x < piece.shape[y].length; x++) {
                if (piece.shape[y][x]) {
                    const newX = piece.x + x + offsetX;
                    const newY = piece.y + y + offsetY;
                    if (
                        newX < 0 ||
                        newX >= BOARD_WIDTH ||
                        newY >= BOARD_HEIGHT ||
                        (newY >= 0 && board[newY][newX] !== null)
                    ) {
                        return true;
                    }
                }
            }
        }
        return false;
    }, []);

    const mergePiece = useCallback((piece: Piece, board: (Priority | null)[][]): (Priority | null)[][] => {
        const newBoard = board.map(row => [...row]);
        for (let y = 0; y < piece.shape.length; y++) {
            for (let x = 0; x < piece.shape[y].length; x++) {
                if (piece.shape[y][x] && piece.y + y >= 0) {
                    newBoard[piece.y + y][piece.x + x] = piece.priority;
                }
            }
        }
        return newBoard;
    }, []);

    const clearLines = useCallback((board: (Priority | null)[][]): { newBoard: (Priority | null)[][], linesCleared: number } => {
        let linesCleared = 0;
        const newBoard = board.filter(row => {
            if (row.every(cell => cell !== null)) {
                linesCleared++;
                return false;
            }
            return true;
        });

        while (newBoard.length < BOARD_HEIGHT) {
            newBoard.unshift(Array(BOARD_WIDTH).fill(null));
        }

        return { newBoard, linesCleared };
    }, []);

    const movePieceDown = useCallback(() => {
        if (!currentPiece || gameOver || isPaused) return;

        if (!checkCollision(currentPiece, board, 0, 1)) {
            setCurrentPiece({ ...currentPiece, y: currentPiece.y + 1 });
        } else {
            const mergedBoard = mergePiece(currentPiece, board);
            const { newBoard, linesCleared } = clearLines(mergedBoard);

            setBoard(newBoard);
            setLines(prev => prev + linesCleared);

            const points = [0, 100, 300, 500, 800][linesCleared] * level;
            setScore(prev => prev + points);

            if (lines + linesCleared >= level * 10) {
                setLevel(prev => prev + 1);
            }

            if (nextPiece && !checkCollision(nextPiece, newBoard)) {
                setCurrentPiece(nextPiece);
                setNextPiece(generatePiece());
            } else {
                setGameOver(true);
            }
        }
    }, [currentPiece, board, gameOver, isPaused, checkCollision, mergePiece, clearLines, lines, level, nextPiece, generatePiece]);

    const rotatePiece = useCallback(() => {
        if (!currentPiece || gameOver || isPaused) return;

        const rotated = currentPiece.shape[0].map((_, i) =>
            currentPiece.shape.map(row => row[i]).reverse()
        );

        const rotatedPiece = { ...currentPiece, shape: rotated };

        if (!checkCollision(rotatedPiece, board)) {
            setCurrentPiece(rotatedPiece);
        }
    }, [currentPiece, board, gameOver, isPaused, checkCollision]);

    const movePieceHorizontal = useCallback((direction: number) => {
        if (!currentPiece || gameOver || isPaused) return;

        if (!checkCollision(currentPiece, board, direction, 0)) {
            setCurrentPiece({ ...currentPiece, x: currentPiece.x + direction });
        }
    }, [currentPiece, board, gameOver, isPaused, checkCollision]);

    const hardDrop = useCallback(() => {
        if (!currentPiece || gameOver || isPaused) return;

        let dropDistance = 0;
        while (!checkCollision(currentPiece, board, 0, dropDistance + 1)) {
            dropDistance++;
        }

        const droppedPiece = { ...currentPiece, y: currentPiece.y + dropDistance };
        const mergedBoard = mergePiece(droppedPiece, board);
        const { newBoard, linesCleared } = clearLines(mergedBoard);

        setBoard(newBoard);
        setLines(prev => prev + linesCleared);

        const points = ([0, 100, 300, 500, 800][linesCleared] * level) + dropDistance * 2;
        setScore(prev => prev + points);

        if (lines + linesCleared >= level * 10) {
            setLevel(prev => prev + 1);
        }

        if (nextPiece && !checkCollision(nextPiece, newBoard)) {
            setCurrentPiece(nextPiece);
            setNextPiece(generatePiece());
        } else {
            setGameOver(true);
        }
    }, [currentPiece, board, gameOver, isPaused, checkCollision, mergePiece, clearLines, lines, level, nextPiece, generatePiece]);

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

            if (isPaused || !gameStarted || gameOver) return;

            switch (e.key) {
                case 'ArrowUp':
                case 'w':
                case 'W':
                    e.preventDefault();
                    rotatePiece();
                    break;
                case 'ArrowDown':
                case 's':
                case 'S':
                    e.preventDefault();
                    movePieceDown();
                    break;
                case 'ArrowLeft':
                case 'a':
                case 'A':
                    e.preventDefault();
                    movePieceHorizontal(-1);
                    break;
                case 'ArrowRight':
                case 'd':
                case 'D':
                    e.preventDefault();
                    movePieceHorizontal(1);
                    break;
                case 'Enter':
                    e.preventDefault();
                    hardDrop();
                    break;
            }
        };

        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, [gameStarted, isPaused, gameOver, rotatePiece, movePieceDown, movePieceHorizontal, hardDrop, startGame]);

    useEffect(() => {
        if (gameStarted && !gameOver && !isPaused) {
            gameLoopRef.current = setInterval(() => {
                movePieceDown();
            }, getGameSpeed());
        }

        return () => {
            if (gameLoopRef.current) clearInterval(gameLoopRef.current);
        };
    }, [gameStarted, gameOver, isPaused, movePieceDown, getGameSpeed]);

    const renderBoard = () => {
        const displayBoard = board.map(row => [...row]);
        if (currentPiece) {
            for (let y = 0; y < currentPiece.shape.length; y++) {
                for (let x = 0; x < currentPiece.shape[y].length; x++) {
                    if (currentPiece.shape[y][x] && currentPiece.y + y >= 0) {
                        displayBoard[currentPiece.y + y][currentPiece.x + x] = currentPiece.priority;
                    }
                }
            }
        }
        return displayBoard;
    };

    const displayBoard = renderBoard();

    return (
        <div className="flex gap-6 items-start justify-center">
            {/* Main game area */}
            <div className="flex flex-col items-center">
                {/* Score bar */}
                <div className="flex items-center gap-3 mb-5 w-full">
                    <div className="flex-1 flex items-center gap-2.5 px-4 py-2.5 bg-white/60 dark:bg-gray-900 border border-sky-100 dark:border-gray-800 rounded-2xl">
                        <Trophy className="w-4 h-4 text-sky-500" />
                        <span className="text-sm font-bold text-sky-900 dark:text-white">{score}</span>
                    </div>
                    <div className="flex-1 flex items-center gap-2.5 px-4 py-2.5 bg-white/60 dark:bg-gray-900 border border-sky-100 dark:border-gray-800 rounded-2xl">
                        <Layers className="w-4 h-4 text-sky-500" />
                        <span className="text-sm font-bold text-sky-900 dark:text-white">{lines}</span>
                    </div>
                    <div className="flex-1 flex items-center gap-2.5 px-4 py-2.5 bg-white/60 dark:bg-gray-900 border border-sky-100 dark:border-gray-800 rounded-2xl">
                        <Zap className="w-4 h-4 text-sky-500" />
                        <span className="text-sm font-bold text-sky-900 dark:text-white">Lv.{level}</span>
                    </div>
                    {gameStarted && (
                        <div className="flex items-center gap-1">
                            <button
                                onClick={() => setIsPaused(p => !p)}
                                className="p-2 text-sky-500 hover:text-sky-700 dark:hover:text-sky-300 hover:bg-sky-50 dark:hover:bg-gray-800 rounded-xl transition-colors"
                                title={isPaused ? 'Resume' : 'Pause'}
                            >
                                {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
                            </button>
                            <button
                                onClick={startGame}
                                className="p-2 text-sky-500 hover:text-sky-700 dark:hover:text-sky-300 hover:bg-sky-50 dark:hover:bg-gray-800 rounded-xl transition-colors"
                                title="Restart"
                            >
                                <RotateCcw className="w-4 h-4" />
                            </button>
                        </div>
                    )}
                </div>

                {/* Game board */}
                <div
                    className="relative bg-sky-950 dark:bg-gray-900 rounded-2xl border border-sky-200/50 dark:border-gray-700 shadow-lg overflow-hidden"
                    style={{
                        width: BOARD_WIDTH * CELL_SIZE,
                        height: BOARD_HEIGHT * CELL_SIZE
                    }}
                >
                    {/* Grid */}
                    <div className="absolute inset-0 grid" style={{
                        gridTemplateColumns: `repeat(${BOARD_WIDTH}, ${CELL_SIZE}px)`,
                        gridTemplateRows: `repeat(${BOARD_HEIGHT}, ${CELL_SIZE}px)`
                    }}>
                        {Array.from({ length: BOARD_WIDTH * BOARD_HEIGHT }).map((_, i) => (
                            <div key={i} className="border border-sky-900/20 dark:border-gray-800/50" />
                        ))}
                    </div>

                    {/* Board cells */}
                    {displayBoard.map((row, y) =>
                        row.map((cell, x) => (
                            cell && (
                                <div
                                    key={`${y}-${x}`}
                                    className="absolute rounded-[3px]"
                                    style={{
                                        left: x * CELL_SIZE + 2,
                                        top: y * CELL_SIZE + 2,
                                        width: CELL_SIZE - 4,
                                        height: CELL_SIZE - 4,
                                        backgroundColor: PRIORITY_COLORS[cell],
                                        boxShadow: 'inset 0 0 8px rgba(255,255,255,0.25)',
                                        border: '1px solid rgba(255,255,255,0.15)'
                                    }}
                                />
                            )
                        ))
                    )}

                    {/* Start overlay */}
                    {!gameStarted && !gameOver && (
                        <div className="absolute inset-0 bg-sky-950/80 dark:bg-gray-950/80 backdrop-blur-sm flex flex-col items-center justify-center gap-4">
                            <h2 className="text-2xl font-bold text-white">Ready to Play?</h2>
                            <button
                                onClick={startGame}
                                className="flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-sky-700 bg-[#ebf6b5] hover:bg-[#e0efa0] border border-[#d4e88e] rounded-full transition-colors"
                            >
                                <Play className="w-4 h-4" />
                                Start Game
                            </button>
                        </div>
                    )}

                    {/* Game over overlay */}
                    {gameOver && (
                        <div className="absolute inset-0 bg-sky-950/85 dark:bg-gray-950/85 backdrop-blur-sm flex flex-col items-center justify-center gap-3">
                            <h2 className="text-3xl font-bold text-white">Game Over</h2>
                            <p className="text-lg text-sky-200 font-medium">Score: {score}</p>
                            <p className="text-sm text-sky-300/60">Lines: {lines}</p>
                            <button
                                onClick={startGame}
                                className="flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-sky-700 bg-[#ebf6b5] hover:bg-[#e0efa0] border border-[#d4e88e] rounded-full transition-colors mt-2"
                            >
                                <RotateCcw className="w-4 h-4" />
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
                    <p className="text-[11px] text-sky-500/40 dark:text-sky-400/30 mt-4 text-center max-w-xs">
                        ← → Move · ↑ Rotate · ↓ Soft drop · Enter Hard drop · Space Pause · R Restart
                    </p>
                )}
            </div>

            {/* Sidebar */}
            {gameStarted && (
                <motion.div
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    className="flex flex-col gap-4 pt-[52px]"
                >
                    {/* Next piece */}
                    {nextPiece && (
                        <div className="bg-white/60 dark:bg-gray-900 border border-sky-100 dark:border-gray-800 rounded-2xl p-4">
                            <div className="text-[11px] font-semibold text-sky-600 dark:text-sky-400 uppercase tracking-wider mb-3">Next</div>
                            <div
                                className="bg-sky-950 dark:bg-gray-800 rounded-xl p-3 relative"
                                style={{
                                    width: CELL_SIZE * 4 + 24,
                                    height: CELL_SIZE * 3 + 24
                                }}
                            >
                                {nextPiece.shape.map((row, y) =>
                                    row.map((cell, x) =>
                                        cell ? (
                                            <div
                                                key={`${y}-${x}`}
                                                className="absolute rounded-[3px]"
                                                style={{
                                                    left: x * CELL_SIZE + 12,
                                                    top: y * CELL_SIZE + 12,
                                                    width: CELL_SIZE - 4,
                                                    height: CELL_SIZE - 4,
                                                    backgroundColor: PRIORITY_COLORS[nextPiece.priority],
                                                    boxShadow: 'inset 0 0 6px rgba(255,255,255,0.25)',
                                                    border: '1px solid rgba(255,255,255,0.15)'
                                                }}
                                            />
                                        ) : null
                                    )
                                )}
                            </div>
                        </div>
                    )}

                    {/* Difficulty info */}
                    <div className="bg-white/60 dark:bg-gray-900 border border-sky-100 dark:border-gray-800 rounded-2xl p-4">
                        <div className="text-[11px] font-semibold text-sky-600 dark:text-sky-400 uppercase tracking-wider mb-3">Difficulty</div>
                        <div className="space-y-2.5">
                            <div className="flex items-center justify-between">
                                <span className="text-xs text-sky-600/60 dark:text-sky-400/60">Tasks</span>
                                <span className="text-xs font-bold text-sky-900 dark:text-white">{pendingHomeworkCount}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-xs text-sky-600/60 dark:text-sky-400/60">Speed</span>
                                <span className="text-xs font-bold text-sky-900 dark:text-white">{getGameSpeed()}ms</span>
                            </div>
                        </div>
                    </div>

                    {/* Priority legend */}
                    <div className="bg-white/60 dark:bg-gray-900 border border-sky-100 dark:border-gray-800 rounded-2xl p-4">
                        <div className="text-[11px] font-semibold text-sky-600 dark:text-sky-400 uppercase tracking-wider mb-3">Priority</div>
                        <div className="space-y-2">
                            {(['high', 'medium', 'low'] as Priority[]).map(p => (
                                <div key={p} className="flex items-center gap-2.5">
                                    <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: PRIORITY_COLORS[p] }} />
                                    <span className="text-xs text-sky-700/70 dark:text-sky-300/70">{PRIORITY_LABELS[p]}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </motion.div>
            )}
        </div>
    );
}

export default function TaskTowerPage() {
    const { authenticated } = useRequireAuth();
    if (!authenticated) return null;
    const { homeworks } = useClassContext();
    const totalHomeworks = homeworks ? homeworks.length : 0;
    const completedHomeworks = homeworks ? homeworks.filter(hw => hw.completed).length : 0;
    const pendingHomeworkCount = totalHomeworks - completedHomeworks;

    const highCount = homeworks ? homeworks.filter(hw => !hw.completed && hw.priority === 'high').length : 0;
    const mediumCount = homeworks ? homeworks.filter(hw => !hw.completed && hw.priority === 'medium').length : 0;
    const lowCount = homeworks ? homeworks.filter(hw => !hw.completed && hw.priority === 'low').length : 0;

    const completionPercentage = totalHomeworks > 0 ? (completedHomeworks / totalHomeworks) * 100 : 0;
    const hasEarnedAccess = completionPercentage >= 80;

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
                        <ArrowLeft className="w-4 h-4" />
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
                                Task Tower
                            </h1>
                            <p className="text-sky-600/50 dark:text-sky-400/50 text-sm max-w-md">
                                {pendingHomeworkCount} pending task{pendingHomeworkCount !== 1 ? 's' : ''} affect speed and priority mix. Stay organized!
                            </p>
                        </motion.div>

                        {/* Game */}
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.05 }}
                        >
                            <TaskTowerGame pendingHomeworkCount={pendingHomeworkCount} highCount={highCount} mediumCount={mediumCount} lowCount={lowCount} />
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
                                    Task Tower
                                </h1>
                                <p className="text-sky-600/50 dark:text-sky-400/50 text-sm">
                                    Complete more homework to unlock this game
                                </p>
                            </div>

                            <div className="bg-white/60 dark:bg-gray-900 border border-sky-100 dark:border-gray-800 rounded-2xl p-6">
                                <div className="flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-500/10 border border-amber-200/60 dark:border-amber-500/20 rounded-xl mb-5">
                                    <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-sm font-semibold text-amber-800 dark:text-amber-300 mb-1">
                                            80% homework required
                                        </p>
                                        <p className="text-xs text-amber-600/80 dark:text-amber-400/80">
                                            Complete more assignments to unlock Task Tower.
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
                                        {completedHomeworks} of {totalHomeworks} assignments · {Math.max(0, Math.ceil(totalHomeworks * 0.8) - completedHomeworks)} more to unlock
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
