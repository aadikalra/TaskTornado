'use client';

import React, { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Gamepad2, Trophy, Zap, ArrowRight, Lock, Home, Layers, Waves } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useClassContext } from '@/context/ClassContext';
import { useWideLayout } from '@/hooks/use-wide-layout';
import WorthinessCheckModal from '@/components/WorthinessCheckModal';
import { useRouteIntro } from '@/hooks/use-route-intro';
import { RouteIntroPopup } from '@/components/RouteIntroPopup';
import { getFullVersionString } from '@/config/version';

export default function GamesPage() {
    const router = useRouter();
    const { homeworks } = useClassContext();
    const { getContainerClass } = useWideLayout();
    const [selectedGame, setSelectedGame] = useState<{ title: string, href: string } | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Route intro popup
    const { showIntro, dismissIntro } = useRouteIntro('games');

    // Calculate homework completion percentage
    const completionPercentage = useMemo(() => {
        if (homeworks.length === 0) return 0;
        const completedCount = homeworks.filter((hw: any) => hw.completed).length;
        return Math.round((completedCount / homeworks.length) * 100);
    }, [homeworks]);

    const handleGameClick = (game: { title: string, href: string }) => {
        setSelectedGame(game);
        setIsModalOpen(true);
    };

    const handleWorthinessApproved = () => {
        if (selectedGame) {
            router.push(selectedGame.href);
        }
    };

    const games = [
        {
            id: 'snake',
            title: 'Snake',
            description: 'Classic snake game with a twist - difficulty scales with your remaining homework!',
            icon: Waves,
            href: '/snake',
            color: 'from-green-500 to-emerald-600',
            bgColor: 'bg-green-500/10',
            borderColor: 'border-green-200/50 dark:border-green-800/50',
            textColor: 'text-green-600 dark:text-green-400',
            unlockThreshold: 75,
            stats: {
                label: 'Unlocked',
                value: 'Complete 75% homework',
            }
        },
        {
            id: 'task-tower',
            title: 'Task Tower',
            description: 'Tetris-style game where blocks are your tasks! Clear lines by organizing assignments efficiently.',
            icon: Layers,
            href: '/task-tower',
            color: 'from-purple-500 to-pink-600',
            bgColor: 'bg-purple-500/10',
            borderColor: 'border-purple-200/50 dark:border-purple-800/50',
            textColor: 'text-purple-600 dark:text-purple-400',
            unlockThreshold: 80,
            stats: {
                label: 'Unlocked',
                value: 'Complete 80% homework',
            }
        },
        // Future games can be added here
    ];

    return (
        <div className="min-h-screen bg-white dark:bg-gray-950">
            <div className={getContainerClass() + ' py-16'}>

                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-16"
                >
                    <h1 className="text-4xl font-light text-gray-900 dark:text-white mb-3 tracking-tight">
                        Game Center
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400">
                        Take a break and play games - earn them by completing your work!
                    </p>
                </motion.div>

                {/* Stats Section */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 }}
                    className="mb-12"
                >
                    <div className="pb-4 border-b border-gray-200 dark:border-gray-800 mb-6">
                        <h2 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
                            Your Progress
                        </h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Track your homework completion and game unlocks
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="text-center">
                            <div className="text-3xl font-light text-gray-900 dark:text-white mb-1">
                                {games.length}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                                Available Games
                            </div>
                        </div>

                        <div className="text-center">
                            <div className="text-3xl font-light text-purple-600 dark:text-purple-400 mb-1">
                                {completionPercentage}%
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                                Homework Completed
                            </div>
                        </div>

                        <div className="text-center">
                            <div className="text-3xl font-light text-blue-600 dark:text-blue-400 mb-1">
                                {games.filter(g => completionPercentage >= g.unlockThreshold).length}/{games.length}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                                Games Unlocked
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Games Section */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="mb-12"
                >
                    <div className="pb-4 border-b border-gray-200 dark:border-gray-800 mb-6">
                        <h2 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
                            Games
                        </h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Choose a game to play - complete more homework to unlock additional games
                        </p>
                    </div>

                    <div className="space-y-6">
                        {games.map((game, index) => {
                            const Icon = game.icon;
                            const isUnlocked = completionPercentage >= game.unlockThreshold;

                            return (
                                <motion.div
                                    key={game.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.15 + index * 0.05 }}
                                    className={`group border-b border-gray-200 dark:border-gray-800 pb-6 last:border-0 ${!isUnlocked ? 'opacity-50' : ''}`}
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-start gap-4">
                                            <div className={`p-3 rounded-lg ${game.bgColor} border ${game.borderColor} relative`}>
                                                <Icon className={`h-6 w-6 ${game.textColor}`} />
                                                {!isUnlocked && (
                                                    <div className="absolute inset-0 flex items-center justify-center bg-white/80 dark:bg-gray-900/80 rounded-lg">
                                                        <Lock className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex-1">
                                                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                                                    {game.title}
                                                    {!isUnlocked && <Lock className="h-4 w-4 text-gray-400" />}
                                                </h3>
                                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 leading-relaxed">
                                                    {game.description}
                                                </p>
                                                <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full ${game.bgColor} border ${game.borderColor}`}>
                                                    {isUnlocked ? (
                                                        <>
                                                            <Trophy className={`h-3.5 w-3.5 ${game.textColor}`} />
                                                            <span className={`text-xs font-medium ${game.textColor}`}>
                                                                Unlocked!
                                                            </span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Lock className="h-3.5 w-3.5 text-gray-500" />
                                                            <span className="text-xs font-medium text-gray-500">
                                                                {game.stats.value}
                                                            </span>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {isUnlocked && (
                                            <div className="flex items-center gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="gap-2"
                                                    onClick={() => handleGameClick({ title: game.title, href: game.href })}
                                                >
                                                    Play
                                                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-200" />
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            );
                        })}

                        {/* Coming Soon */}
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.25 }}
                            className="border-b border-gray-200 dark:border-gray-800 pb-6 last:border-0"
                        >
                            <div className="flex items-start gap-4">
                                <div className="p-3 rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                                    <Zap className="h-6 w-6 text-gray-400" />
                                </div>

                                <div className="flex-1">
                                    <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        More Games Coming Soon
                                    </h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        Keep completing your homework to unlock new games!
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </motion.div>

                {/* Info Section */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="mb-12"
                >
                    <div className="pb-4 border-b border-gray-200 dark:border-gray-800 mb-6">
                        <h2 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
                            How It Works
                        </h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Learn more about the game system
                        </p>
                    </div>

                    <div className="prose prose-sm max-w-none dark:prose-invert">
                        <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                            The more homework you complete, the easier the games become! Game difficulty dynamically adjusts based on your remaining homework count. Stay on top of your assignments to unlock a more relaxed gaming experience as your reward.
                        </p>
                    </div>
                </motion.div>

                {/* Footer */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.35 }}
                    className="mt-20 pt-8 border-t border-gray-200 dark:border-gray-800"
                >
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Built for students • Public Beta {getFullVersionString()}
                        </p>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => router.push('/')}
                            className="gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                        >
                            <Home className="h-4 w-4" />
                            <span>Home</span>
                        </Button>
                    </div>
                </motion.div>
            </div>

            {/* Worthiness Check Modal */}
            <WorthinessCheckModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onApproved={handleWorthinessApproved}
                gameTitle={selectedGame?.title || ''}
            />

            {/* Route Intro Popup */}
            <RouteIntroPopup
                isOpen={showIntro}
                onClose={dismissIntro}
                title="Welcome to Game Center!"
                description="Earn games by completing your homework - the more you finish, the easier they become!"
                icon={<Gamepad2 className="h-6 w-6" />}
                features={[
                    'Unlock games by completing homework assignments',
                    'Game difficulty adjusts based on remaining homework',
                    'Track your progress and unlocked games',
                    'Take well-deserved breaks after finishing your work',
                ]}
            />
        </div>
    );
}
