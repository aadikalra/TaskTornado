'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useClassContext } from '@/context/ClassContext';
import { AlertCircle } from 'lucide-react';

const BOARD_WIDTH = 10;
const BOARD_HEIGHT = 20;
const CELL_SIZE = 30;
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

const PRIORITY_COLORS = {
    low: '#3b82f6',    // Blue
    medium: '#eab308', // Yellow
    high: '#ef4444'    // Red
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

    // Calculate speed based on level and pending homework
    const getGameSpeed = useCallback(() => {
        const baseSpeed = INITIAL_SPEED - (level - 1) * SPEED_INCREASE_PER_LEVEL;
        const homeworkSpeedModifier = Math.min(pendingHomeworkCount * 20, 300); // Max 300ms faster
        return Math.max(baseSpeed - homeworkSpeedModifier, 100); // Minimum 100ms
    }, [level, pendingHomeworkCount]);

    // Refs to track remaining pieces of each priority
    const highRef = useRef(highCount);
    const mediumRef = useRef(mediumCount);
    const lowRef = useRef(lowCount);

    // Generate piece using remaining priority counts
    const generatePiece = useCallback((): Piece => {
        const shapeName = SHAPE_NAMES[Math.floor(Math.random() * SHAPE_NAMES.length)];
        const shape = SHAPES[shapeName as keyof typeof SHAPES];

        // Determine priority based on remaining counts
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
            // Fallback to original random distribution if counts exhausted
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

    // Start game
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

    // Check collision
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

    // Merge piece into board
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

    // Clear completed lines
    const clearLines = useCallback((board: (Priority | null)[][]): { newBoard: (Priority | null)[][], linesCleared: number } => {
        let linesCleared = 0;
        const newBoard = board.filter(row => {
            if (row.every(cell => cell !== null)) {
                linesCleared++;
                return false;
            }
            return true;
        });

        // Add empty rows at the top
        while (newBoard.length < BOARD_HEIGHT) {
            newBoard.unshift(Array(BOARD_WIDTH).fill(null));
        }

        return { newBoard, linesCleared };
    }, []);

    // Move piece down
    const movePieceDown = useCallback(() => {
        if (!currentPiece || gameOver || isPaused) return;

        if (!checkCollision(currentPiece, board, 0, 1)) {
            setCurrentPiece({ ...currentPiece, y: currentPiece.y + 1 });
        } else {
            // Merge piece
            const mergedBoard = mergePiece(currentPiece, board);
            const { newBoard, linesCleared } = clearLines(mergedBoard);

            setBoard(newBoard);
            setLines(prev => prev + linesCleared);

            // Calculate score
            const points = [0, 100, 300, 500, 800][linesCleared] * level;
            setScore(prev => prev + points);

            // Level up every 10 lines
            if (lines + linesCleared >= level * 10) {
                setLevel(prev => prev + 1);
            }

            // Spawn next piece
            if (nextPiece && !checkCollision(nextPiece, newBoard)) {
                setCurrentPiece(nextPiece);
                setNextPiece(generatePiece());
            } else {
                setGameOver(true);
            }
        }
    }, [currentPiece, board, gameOver, isPaused, checkCollision, mergePiece, clearLines, lines, level, nextPiece, generatePiece]);

    // Rotate piece
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

    // Move piece horizontally
    const movePieceHorizontal = useCallback((direction: number) => {
        if (!currentPiece || gameOver || isPaused) return;

        if (!checkCollision(currentPiece, board, direction, 0)) {
            setCurrentPiece({ ...currentPiece, x: currentPiece.x + direction });
        }
    }, [currentPiece, board, gameOver, isPaused, checkCollision]);

    // Hard drop
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

    // Keyboard controls
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

    // Game loop
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

    // Render board with current piece
    const renderBoard = () => {
        const displayBoard = board.map(row => [...row]);

        // Add current piece to display
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
        <div className="flex flex-col items-center justify-center bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-950 dark:to-pink-950 p-8 rounded-xl border border-border">
            <div className="mb-6 text-center">
                <h1 className="text-4xl font-bold text-gray-800 dark:text-gray-100 mb-2">Task Tower</h1>
                <p className="text-lg text-gray-600 dark:text-gray-400 mb-2">
                    Organize your tasks! Clear lines to score points.
                </p>
                <div className="flex gap-6 justify-center items-center text-sm">
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded" style={{ backgroundColor: PRIORITY_COLORS.high }}></div>
                        <span className="text-gray-700 dark:text-gray-300">High Priority</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded" style={{ backgroundColor: PRIORITY_COLORS.medium }}></div>
                        <span className="text-gray-700 dark:text-gray-300">Medium Priority</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded" style={{ backgroundColor: PRIORITY_COLORS.low }}></div>
                        <span className="text-gray-700 dark:text-gray-300">Low Priority</span>
                    </div>
                </div>
            </div>

            <div className="flex gap-6 items-start">
                {/* Main Game Board */}
                <div className="flex flex-col items-center">
                    <div className="mb-4 flex gap-4 text-center">
                        <div className="bg-white/50 dark:bg-gray-800/50 px-4 py-2 rounded-lg">
                            <div className="text-xs text-gray-600 dark:text-gray-400">Score</div>
                            <div className="text-2xl font-bold text-gray-900 dark:text-white">{score}</div>
                        </div>
                        <div className="bg-white/50 dark:bg-gray-800/50 px-4 py-2 rounded-lg">
                            <div className="text-xs text-gray-600 dark:text-gray-400">Lines</div>
                            <div className="text-2xl font-bold text-gray-900 dark:text-white">{lines}</div>
                        </div>
                        <div className="bg-white/50 dark:bg-gray-800/50 px-4 py-2 rounded-lg">
                            <div className="text-xs text-gray-600 dark:text-gray-400">Level</div>
                            <div className="text-2xl font-bold text-gray-900 dark:text-white">{level}</div>
                        </div>
                    </div>

                    {!gameStarted && (
                        <button
                            onClick={startGame}
                            className="mb-4 px-6 py-3 bg-purple-500 text-white font-semibold rounded-lg hover:bg-purple-600 transition-colors"
                        >
                            Start Game
                        </button>
                    )}

                    <div
                        className="relative bg-gray-900 rounded-lg shadow-2xl border-4 border-gray-700"
                        style={{
                            width: BOARD_WIDTH * CELL_SIZE,
                            height: BOARD_HEIGHT * CELL_SIZE
                        }}
                    >
                        {/* Grid Background */}
                        <div className="absolute inset-0 grid" style={{
                            gridTemplateColumns: `repeat(${BOARD_WIDTH}, ${CELL_SIZE}px)`,
                            gridTemplateRows: `repeat(${BOARD_HEIGHT}, ${CELL_SIZE}px)`
                        }}>
                            {Array.from({ length: BOARD_WIDTH * BOARD_HEIGHT }).map((_, i) => (
                                <div key={i} className="border border-gray-800/50" />
                            ))}
                        </div>

                        {/* Board Cells */}
                        {displayBoard.map((row, y) =>
                            row.map((cell, x) => (
                                cell && (
                                    <div
                                        key={`${y}-${x}`}
                                        className="absolute rounded-sm border border-gray-900"
                                        style={{
                                            left: x * CELL_SIZE + 2,
                                            top: y * CELL_SIZE + 2,
                                            width: CELL_SIZE - 4,
                                            height: CELL_SIZE - 4,
                                            backgroundColor: PRIORITY_COLORS[cell],
                                            boxShadow: 'inset 0 0 10px rgba(255,255,255,0.3)'
                                        }}
                                    />
                                )
                            ))
                        )}

                        {/* Game Over Overlay */}
                        {gameOver && (
                            <div className="absolute inset-0 bg-black bg-opacity-75 flex items-center justify-center">
                                <div className="text-center">
                                    <h2 className="text-4xl font-bold text-white mb-4">Game Over!</h2>
                                    <p className="text-2xl text-white mb-2">Final Score: {score}</p>
                                    <p className="text-xl text-white mb-6">Lines: {lines}</p>
                                    <button
                                        onClick={startGame}
                                        className="px-6 py-3 bg-purple-500 text-white font-semibold rounded-lg hover:bg-purple-600 transition-colors"
                                    >
                                        Play Again
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Paused Overlay */}
                        {isPaused && !gameOver && gameStarted && (
                            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                                <h2 className="text-4xl font-bold text-white">PAUSED</h2>
                            </div>
                        )}
                    </div>

                    {gameStarted && (
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-4 text-center max-w-md">
                            ← → or A/D: Move • ↑ or W: Rotate • ↓ or S: Soft Drop • Enter: Hard Drop<br />
                            Space: Pause • R: Restart
                        </p>
                    )}
                </div>

                {/* Next Piece Preview */}
                {nextPiece && gameStarted && (
                    <div className="flex flex-col gap-4">
                        <div className="bg-white/50 dark:bg-gray-800/50 p-4 rounded-lg">
                            <div className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 text-center">Next Task</div>
                            <div
                                className="bg-gray-900 rounded-lg p-4 flex items-center justify-center"
                                style={{
                                    width: CELL_SIZE * 4,
                                    height: CELL_SIZE * 4
                                }}
                            >
                                {nextPiece.shape.map((row, y) =>
                                    row.map((cell, x) =>
                                        cell ? (
                                            <div
                                                key={`${y}-${x}`}
                                                className="absolute rounded-sm border border-gray-900"
                                                style={{
                                                    left: x * CELL_SIZE,
                                                    top: y * CELL_SIZE,
                                                    width: CELL_SIZE - 4,
                                                    height: CELL_SIZE - 4,
                                                    backgroundColor: PRIORITY_COLORS[nextPiece.priority],
                                                    boxShadow: 'inset 0 0 8px rgba(255,255,255,0.3)'
                                                }}
                                            />
                                        ) : null
                                    )
                                )}
                            </div>
                        </div>

                        <div className="bg-white/50 dark:bg-gray-800/50 p-4 rounded-lg">
                            <div className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Difficulty</div>
                            <div className="text-xs text-gray-600 dark:text-gray-400">
                                Pending Tasks: <span className="font-bold">{pendingHomeworkCount}</span>
                            </div>
                            <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                Speed: <span className="font-bold">{getGameSpeed()}ms</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

import { useRequireAuth } from '@/hooks/use-require-auth';

export default function TaskTowerPage() {
    const { authenticated } = useRequireAuth();
    if (!authenticated) return null;
    const { homeworks } = useClassContext();
    const totalHomeworks = homeworks ? homeworks.length : 0;
    const completedHomeworks = homeworks ? homeworks.filter(hw => hw.completed).length : 0;
    const pendingHomeworkCount = totalHomeworks - completedHomeworks;

    // Count pending homeworks by priority
    const highCount = homeworks ? homeworks.filter(hw => !hw.completed && hw.priority === 'high').length : 0;
    const mediumCount = homeworks ? homeworks.filter(hw => !hw.completed && hw.priority === 'medium').length : 0;
    const lowCount = homeworks ? homeworks.filter(hw => !hw.completed && hw.priority === 'low').length : 0;

    const completionPercentage = totalHomeworks > 0 ? (completedHomeworks / totalHomeworks) * 100 : 0;
    const hasEarnedAccess = completionPercentage >= 80;

    return (
        <div className="min-h-screen bg-background p-8">
            <div className="max-w-7xl mx-auto">
                {hasEarnedAccess ? (
                    <>
                        <h1 className="text-4xl font-bold mb-4">Pending Tasks: {pendingHomeworkCount}</h1>
                        <p className="text-muted-foreground mb-8">
                            The game speed increases with more pending homework. Stay organized!
                        </p>
                        <div className="border border-border rounded-lg overflow-hidden inline-block">
                            <TaskTowerGame pendingHomeworkCount={pendingHomeworkCount} highCount={highCount} mediumCount={mediumCount} lowCount={lowCount} />
                        </div>
                    </>
                ) : (
                    <div className="flex flex-col items-center justify-center min-h-[600px] text-center">
                        <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950 border-2 border-purple-300 dark:border-purple-700 rounded-2xl p-12 max-w-2xl">
                            <div className="text-6xl mb-6">🎯</div>
                            <h1 className="text-4xl font-bold mb-4 text-purple-900 dark:text-purple-100">
                                Almost There!
                            </h1>
                            <p className="text-xl text-purple-800 dark:text-purple-200 mb-6">
                                You need to complete at least <span className="font-bold">80%</span> of your assignments to unlock Task Tower.
                            </p>
                            <div className="bg-white dark:bg-gray-900 rounded-lg p-6 mb-6">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-lg font-semibold text-gray-700 dark:text-gray-300">Your Progress</span>
                                    <span className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                                        {completionPercentage.toFixed(1)}%
                                    </span>
                                </div>
                                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 overflow-hidden">
                                    <div
                                        className="bg-gradient-to-r from-purple-400 to-pink-600 h-4 rounded-full transition-all duration-500"
                                        style={{ width: `${completionPercentage}%` }}
                                    />
                                </div>
                                <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
                                    <p className="font-medium">
                                        {completedHomeworks} of {totalHomeworks} assignments completed
                                    </p>
                                    <p className="mt-1">
                                        Complete {Math.ceil(totalHomeworks * 0.8) - completedHomeworks} more to unlock the game!
                                    </p>
                                </div>
                            </div>
                            <p className="text-lg text-purple-700 dark:text-purple-300 font-medium">
                                💪 Keep grinding! Task Tower awaits!
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
