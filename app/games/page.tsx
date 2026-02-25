'use client';

import React, { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Gamepad2, Trophy, Zap, ArrowRight, Lock, Layers, Waves, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { useClassContext } from '@/context/ClassContext';
import { useWideLayout } from '@/hooks/use-wide-layout';
import WorthinessCheckModal from '@/components/WorthinessCheckModal';
import { useRequireAuth } from '@/hooks/use-require-auth';
import { useRouteIntro } from '@/hooks/use-route-intro';
import { RouteIntroPopup } from '@/components/RouteIntroPopup';
import { getFullVersionString } from '@/config/version';

export default function GamesPage() {
    const { authenticated } = useRequireAuth();
    if (!authenticated) return null;
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
            description: 'Classic snake game with a twist — difficulty scales with your remaining homework!',
            icon: Waves,
            href: '/snake',
            accent: 'sky',
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
            accent: 'emerald',
            unlockThreshold: 80,
            stats: {
                label: 'Unlocked',
                value: 'Complete 80% homework',
            }
        },
    ];

    const unlockedCount = games.filter(g => completionPercentage >= g.unlockThreshold).length;

    return (
        <div className="min-h-screen bg-[#fffaf4] dark:bg-gray-950 relative">
            {/* Background orbs */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-sky-200/20 dark:bg-sky-500/[0.06] rounded-full blur-[140px]" />
                <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-[#ebf6b5]/30 dark:bg-emerald-500/[0.04] rounded-full blur-[120px]" />
                <div className="absolute top-1/3 right-0 w-[300px] h-[300px] bg-[#ebf6b5]/20 dark:bg-emerald-500/[0.04] rounded-full blur-[100px]" />
            </div>

            <div className="relative z-10 px-4 sm:px-6 md:px-12 lg:px-16 pt-28 pb-16">

                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-12"
                >
                    <h1 className="text-4xl lg:text-[52px] font-bold text-sky-500 dark:text-sky-400 leading-[1.08] tracking-tight mb-3">
                        Game Center
                    </h1>
                    <p className="text-sky-600/50 dark:text-sky-400/50 text-base">
                        Take a break and play games — earn them by completing your work!
                    </p>
                </motion.div>

                {/* Stats Cards */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 }}
                    className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12"
                >
                    <div className="flex items-center gap-4 px-5 py-4 bg-white/60 dark:bg-gray-900 border border-sky-100 dark:border-gray-800 rounded-2xl">
                        <div className="w-11 h-11 bg-sky-100 dark:bg-sky-500/15 rounded-xl flex items-center justify-center shrink-0">
                            <Gamepad2 className="w-5 h-5 text-sky-500 dark:text-sky-400" />
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-sky-900 dark:text-white leading-none mb-0.5">
                                {games.length}
                            </div>
                            <div className="text-xs text-sky-600/40 dark:text-sky-400/40 font-medium">
                                Available Games
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 px-5 py-4 bg-white/60 dark:bg-gray-900 border border-sky-100 dark:border-gray-800 rounded-2xl">
                        <div className="w-11 h-11 bg-[#ebf6b5]/60 dark:bg-emerald-500/15 rounded-xl flex items-center justify-center shrink-0">
                            <Sparkles className="w-5 h-5 text-sky-600 dark:text-sky-400" />
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-sky-900 dark:text-white leading-none mb-0.5">
                                {completionPercentage}%
                            </div>
                            <div className="text-xs text-sky-600/40 dark:text-sky-400/40 font-medium">
                                Homework Done
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 px-5 py-4 bg-white/60 dark:bg-gray-900 border border-sky-100 dark:border-gray-800 rounded-2xl">
                        <div className="w-11 h-11 bg-sky-100 dark:bg-sky-500/15 rounded-xl flex items-center justify-center shrink-0">
                            <Trophy className="w-5 h-5 text-sky-500 dark:text-sky-400" />
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-sky-900 dark:text-white leading-none mb-0.5">
                                {unlockedCount}/{games.length}
                            </div>
                            <div className="text-xs text-sky-600/40 dark:text-sky-400/40 font-medium">
                                Games Unlocked
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Games List */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="mb-12"
                >
                    <div className="mb-6">
                        <h2 className="text-xl font-bold text-sky-900 dark:text-white mb-1">
                            Games
                        </h2>
                        <p className="text-sm text-sky-600/40 dark:text-sky-400/40">
                            Complete more homework to unlock additional games
                        </p>
                    </div>

                    <div className="space-y-0">
                        {games.map((game, index) => {
                            const Icon = game.icon;
                            const isUnlocked = completionPercentage >= game.unlockThreshold;

                            return (
                                <motion.div
                                    key={game.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.15 + index * 0.05 }}
                                    className={`flex items-center gap-4 py-5 border-b border-sky-100 dark:border-gray-800 group ${isUnlocked ? 'hover:bg-sky-500/[0.02] cursor-pointer' : 'opacity-50'} transition-colors px-1`}
                                    onClick={() => isUnlocked && handleGameClick({ title: game.title, href: game.href })}
                                >
                                    {/* Icon */}
                                    <div className="relative w-12 h-12 bg-sky-100 dark:bg-sky-500/15 rounded-xl flex items-center justify-center shrink-0">
                                        <Icon className="w-6 h-6 text-sky-500 dark:text-sky-400" />
                                        {!isUnlocked && (
                                            <div className="absolute inset-0 flex items-center justify-center bg-white/80 dark:bg-gray-900/80 rounded-xl backdrop-blur-[1px]">
                                                <Lock className="w-4 h-4 text-sky-400/50" />
                                            </div>
                                        )}
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2.5 mb-1">
                                            <h3 className="text-base font-semibold text-sky-900 dark:text-white">
                                                {game.title}
                                            </h3>
                                            {isUnlocked ? (
                                                <span className="flex items-center gap-1 px-2.5 py-0.5 bg-[#ebf6b5]/60 dark:bg-emerald-500/15 text-sky-600 dark:text-sky-400 rounded-full text-[11px] font-bold">
                                                    <Trophy className="w-3 h-3" />
                                                    Unlocked
                                                </span>
                                            ) : (
                                                <span className="flex items-center gap-1 px-2.5 py-0.5 bg-sky-50 dark:bg-sky-500/10 text-sky-500/50 dark:text-sky-400/50 rounded-full text-[11px] font-medium">
                                                    <Lock className="w-3 h-3" />
                                                    {game.stats.value}
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-sm text-sky-700/50 dark:text-sky-300/50 line-clamp-1">
                                            {game.description}
                                        </p>
                                    </div>

                                    {/* Play button */}
                                    {isUnlocked && (
                                        <button className="flex items-center gap-2 px-5 py-2 text-sm font-semibold text-sky-700 bg-[#ebf6b5] hover:bg-[#e0efa0] border border-[#d4e88e] rounded-full transition-colors shrink-0">
                                            Play
                                            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                                        </button>
                                    )}
                                </motion.div>
                            );
                        })}

                        {/* Coming Soon */}
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.25 }}
                            className="flex items-center gap-4 py-5 px-1"
                        >
                            <div className="w-12 h-12 bg-sky-50 dark:bg-gray-800 border border-sky-100 dark:border-gray-700 rounded-xl flex items-center justify-center shrink-0">
                                <Zap className="w-6 h-6 text-sky-400/30 dark:text-sky-400/20" />
                            </div>
                            <div>
                                <h3 className="text-base font-semibold text-sky-700/40 dark:text-sky-300/40 mb-0.5">
                                    More Games Coming Soon
                                </h3>
                                <p className="text-sm text-sky-600/30 dark:text-sky-400/30">
                                    Keep completing your homework to unlock new games!
                                </p>
                            </div>
                        </motion.div>
                    </div>
                </motion.div>

                {/* How It Works */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="mb-12"
                >
                    <div className="px-6 py-5 bg-white/60 dark:bg-gray-900 border border-sky-100 dark:border-gray-800 rounded-2xl">
                        <h2 className="text-sm font-bold text-sky-900 dark:text-white mb-2">
                            How It Works
                        </h2>
                        <p className="text-sm text-sky-700/50 dark:text-sky-300/50 leading-relaxed">
                            The more homework you complete, the easier the games become! Game difficulty dynamically adjusts based on your remaining homework count. Stay on top of your assignments to unlock a more relaxed gaming experience as your reward.
                        </p>
                    </div>
                </motion.div>

                {/* Footer */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.35 }}
                    className="pt-8 border-t border-sky-100 dark:border-gray-800"
                >
                    <p className="text-xs text-sky-600/30 dark:text-sky-400/30">
                        Built for students • Public Beta {getFullVersionString()}
                    </p>
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
