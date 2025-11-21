'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Gamepad2, Trophy, Zap, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function GamesPage() {
    const router = useRouter();

    const games = [
        {
            id: 'snake',
            title: 'Snake',
            description: 'Classic snake game with a twist - difficulty scales with your remaining homework!',
            icon: Gamepad2,
            href: '/snake',
            color: 'from-green-500 to-emerald-600',
            bgColor: 'bg-green-500/10',
            borderColor: 'border-green-200/50 dark:border-green-800/50',
            textColor: 'text-green-600 dark:text-green-400',
            stats: {
                label: 'Unlocked',
                value: 'Complete 75% homework',
            }
        },
        {
            id: 'task-tower',
            title: 'Task Tower',
            description: 'Tetris-style game where blocks are your tasks! Clear lines by organizing assignments efficiently.',
            icon: Trophy,
            href: '/task-tower',
            color: 'from-purple-500 to-pink-600',
            bgColor: 'bg-purple-500/10',
            borderColor: 'border-purple-200/50 dark:border-purple-800/50',
            textColor: 'text-purple-600 dark:text-purple-400',
            stats: {
                label: 'Unlocked',
                value: 'Complete 80% homework',
            }
        },
        // Future games can be added here
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50/30 to-blue-50/20 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900 overflow-x-hidden font-sans text-gray-900 dark:text-gray-100">
            <main className="max-w-7xl mx-auto px-6 py-8">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-4 mb-3">
                        <div className="p-3 rounded-2xl bg-gradient-to-br from-purple-500/10 to-blue-500/10 dark:from-purple-900/20 dark:to-blue-900/20 border border-purple-200/50 dark:border-purple-800/50">
                            <Gamepad2 className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div>
                            <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                                Game Center
                            </h1>
                            <p className="text-gray-600 dark:text-gray-400 text-lg">
                                Take a break and play games - earn them by completing your work!
                            </p>
                        </div>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    <Card className="bg-white/70 dark:bg-gray-900/40 backdrop-blur border-gray-200/50 dark:border-gray-800/50 hover:shadow-lg transition-all duration-200">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Available Games</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-0">
                            <div className="text-3xl font-bold text-gray-900 dark:text-white">{games.length}</div>
                            <div className="flex items-center gap-1 mt-1">
                                <Gamepad2 className="h-3 w-3 text-purple-500" />
                                <span className="text-xs text-gray-500 dark:text-gray-400">ready to play</span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-white/70 dark:bg-gray-900/40 backdrop-blur border-gray-200/50 dark:border-gray-800/50 hover:shadow-lg transition-all duration-200">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Unlock Progress</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-0">
                            <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">75%</div>
                            <div className="flex items-center gap-1 mt-1">
                                <Trophy className="h-3 w-3 text-purple-500" />
                                <span className="text-xs text-gray-500 dark:text-gray-400">homework needed</span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-white/70 dark:bg-gray-900/40 backdrop-blur border-gray-200/50 dark:border-gray-800/50 hover:shadow-lg transition-all duration-200">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Coming Soon</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-0">
                            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">More</div>
                            <div className="flex items-center gap-1 mt-1">
                                <Zap className="h-3 w-3 text-blue-500" />
                                <span className="text-xs text-gray-500 dark:text-gray-400">stay tuned</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Games Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {games.map((game) => {
                        const Icon = game.icon;
                        return (
                            <Link key={game.id} href={game.href}>
                                <Card className={`bg-white/70 dark:bg-gray-900/40 backdrop-blur ${game.borderColor} hover:shadow-xl hover:scale-[1.02] transition-all duration-300 cursor-pointer group h-full`}>
                                    <CardHeader className="pb-3">
                                        <div className="flex items-start justify-between">
                                            <div className={`p-3 rounded-xl bg-gradient-to-br ${game.bgColor} border ${game.borderColor}`}>
                                                <Icon className={`h-6 w-6 ${game.textColor}`} />
                                            </div>
                                            <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 group-hover:translate-x-1 transition-all duration-200" />
                                        </div>
                                        <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white mt-4">
                                            {game.title}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 leading-relaxed">
                                            {game.description}
                                        </p>
                                        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full ${game.bgColor} border ${game.borderColor}`}>
                                            <Trophy className={`h-3.5 w-3.5 ${game.textColor}`} />
                                            <span className={`text-xs font-medium ${game.textColor}`}>
                                                {game.stats.value}
                                            </span>
                                        </div>
                                    </CardContent>
                                </Card>
                            </Link>
                        );
                    })}

                    {/* Coming Soon Card */}
                    <Card className="bg-white/70 dark:bg-gray-900/40 backdrop-blur border-gray-200/50 dark:border-gray-800/50 border-dashed h-full flex items-center justify-center min-h-[280px]">
                        <CardContent className="text-center py-8">
                            <div className="p-4 rounded-full bg-gray-100 dark:bg-gray-800 inline-flex mb-4">
                                <Zap className="h-8 w-8 text-gray-400 dark:text-gray-500" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                More Games Coming Soon
                            </h3>
                            <p className="text-gray-500 dark:text-gray-400 text-sm">
                                Keep completing your homework to unlock new games!
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Info Banner */}
                <div className="mt-8 p-6 rounded-2xl bg-gradient-to-r from-purple-500/10 to-blue-500/10 dark:from-purple-900/20 dark:to-blue-900/20 border border-purple-200/50 dark:border-purple-800/50">
                    <div className="flex items-start gap-4">
                        <div className="p-2 rounded-lg bg-purple-500/20 dark:bg-purple-900/30">
                            <Trophy className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                                How to Unlock Games
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                                Games are unlocked as rewards for staying on top of your schoolwork. Complete at least 75% of your homework assignments to access the Snake game. The difficulty of each game adapts based on your remaining homework, making it a fun way to stay motivated!
                            </p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
