'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useClassContext } from '@/context/ClassContext';
import { Check } from 'lucide-react';

const GRID_SIZE = 20;
const CELL_SIZE = 25;
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
        <div className="flex flex-col items-center justify-center bg-gradient-to-br from-green-100 to-blue-100 p-8 rounded-xl border border-border">
            <div className="mb-6 text-center">
                <h1 className="text-4xl font-bold text-gray-800 mb-2">Snake Game</h1>
                <p className="text-xl text-gray-600">Score: {score}</p>
                {gameStarted && <p className="text-sm text-gray-500 mt-2">Use arrow keys to move • Space to pause • R to restart</p>}
            </div>

            {!gameStarted && (
                <button
                    onClick={startGame}
                    className="mb-2 px-6 py-3 bg-green-500 text-white font-semibold rounded-lg hover:bg-green-600 transition-colors"
                >
                    Start Game
                </button>
            )}

            <div
                className="relative bg-gray-900 rounded-lg shadow-2xl"
                style={{
                    width: GRID_SIZE * CELL_SIZE,
                    height: GRID_SIZE * CELL_SIZE
                }}
            >
                <div className="absolute inset-0 grid" style={{
                    gridTemplateColumns: `repeat(${GRID_SIZE}, ${CELL_SIZE}px)`,
                    gridTemplateRows: `repeat(${GRID_SIZE}, ${CELL_SIZE}px)`
                }}>
                    {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, i) => (
                        <div key={i} className="border border-gray-800" />
                    ))}
                </div>

                {barriers.map((barrier, i) => (
                    <div
                        key={i}
                        className="absolute rounded"
                        style={{
                            left: barrier.x * CELL_SIZE,
                            top: barrier.y * CELL_SIZE,
                            width: CELL_SIZE - 2,
                            height: CELL_SIZE - 2,
                            backgroundColor: '#92614f'
                        }}
                    />
                ))}

                {snake.map((segment, i) => (
                    <div
                        key={i}
                        className="absolute rounded"
                        style={{
                            left: segment.x * CELL_SIZE,
                            top: segment.y * CELL_SIZE,
                            width: CELL_SIZE - 2,
                            height: CELL_SIZE - 2,
                            backgroundColor: i === 0 ? '#22c55e' : '#4ade80',
                            transition: `left ${GAME_SPEED}ms linear, top ${GAME_SPEED}ms linear`
                        }}
                    />
                ))}

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
                        <Check className="text-blue-500" size={20} strokeWidth={3} />
                    </div>
                )}

                {gameOver && (
                    <div className="absolute inset-0 bg-black bg-opacity-75 flex items-center justify-center">
                        <div className="text-center">
                            <h2 className="text-4xl font-bold text-white mb-4">Game Over!</h2>
                            <p className="text-2xl text-white mb-6">Final Score: {score}</p>
                            <button
                                onClick={startGame}
                                className="px-6 py-3 bg-green-500 text-white font-semibold rounded-lg hover:bg-green-600 transition-colors"
                            >
                                Play Again
                            </button>
                        </div>
                    </div>
                )}

                {isPaused && !gameOver && gameStarted && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                        <h2 className="text-4xl font-bold text-white">PAUSED</h2>
                    </div>
                )}

                {!gameStarted && !gameOver && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                        <h2 className="text-3xl font-bold text-white">Click Start Game to Play Again</h2>
                    </div>
                )}
            </div>
        </div>
    );
}

export default function SnakePage() {
    const { homeworks } = useClassContext();
    const totalHomeworks = homeworks ? homeworks.length : 0;
    const completedHomeworks = homeworks ? homeworks.filter(hw => hw.completed).length : 0;
    const remainingCount = totalHomeworks - completedHomeworks;

    // Calculate completion percentage
    const completionPercentage = totalHomeworks > 0 ? (completedHomeworks / totalHomeworks) * 100 : 0;
    const hasEarnedAccess = completionPercentage > 75;

    return (
        <div className="min-h-screen bg-background p-8">
            <div className="max-w-4xl mx-auto">
                {hasEarnedAccess ? (
                    <>
                        <h1 className="text-4xl font-bold mb-4">Remaining Homework Count: {remainingCount}</h1>
                        <p className="text-muted-foreground mb-8">
                            This count determines the difficulty (number of barriers) in the game below.
                        </p>
                        <div className="border border-border rounded-lg overflow-hidden">
                            <SnakeGame barrierCount={remainingCount} />
                        </div>
                    </>
                ) : (
                    <div className="flex flex-col items-center justify-center min-h-[600px] text-center">
                        <div className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950 dark:to-red-950 border-2 border-orange-300 dark:border-orange-700 rounded-2xl p-12 max-w-2xl">
                            <div className="text-6xl mb-6">📚</div>
                            <h1 className="text-4xl font-bold mb-4 text-orange-900 dark:text-orange-100">
                                Time to Focus on Your Work!
                            </h1>
                            <p className="text-xl text-orange-800 dark:text-orange-200 mb-6">
                                You need to complete more than <span className="font-bold">75%</span> of your assignments to unlock the snake game.
                            </p>
                            <div className="bg-white dark:bg-gray-900 rounded-lg p-6 mb-6">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-lg font-semibold text-gray-700 dark:text-gray-300">Your Progress</span>
                                    <span className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                                        {completionPercentage.toFixed(1)}%
                                    </span>
                                </div>
                                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 overflow-hidden">
                                    <div
                                        className="bg-gradient-to-r from-orange-400 to-orange-600 h-4 rounded-full transition-all duration-500"
                                        style={{ width: `${completionPercentage}%` }}
                                    />
                                </div>
                                <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
                                    <p className="font-medium">
                                        {completedHomeworks} of {totalHomeworks} assignments completed
                                    </p>
                                    <p className="mt-1">
                                        Complete {Math.ceil(totalHomeworks * 0.75) - completedHomeworks} more to unlock the game!
                                    </p>
                                </div>
                            </div>
                            <p className="text-lg text-orange-700 dark:text-orange-300 font-medium">
                                💪 Keep going! You've got this!
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}