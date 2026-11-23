'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, LockKeyhole, Play } from 'lucide-react';
import { HugeIcon } from '@/lib/huge-icon-map';
import { useHomeworkContext } from '@/context/HomeworkContext';
import { useRequireAuth } from '@/hooks/use-require-auth';

const games = [
    {
        title: 'Color Match',
        description: 'Pick the ink color before the clock runs out.',
        href: '/color-match',
        icon: 'PaintBoard',
        accent: 'bg-pink-100 text-pink-800 dark:bg-pink-400/15 dark:text-pink-300',
        threshold: 0,
    },
    {
        title: 'Math Sprint',
        description: 'Solve as many quick math problems as you can in 60 seconds.',
        href: '/math-sprint',
        icon: 'Calculate',
        accent: 'bg-sky-100 text-sky-800 dark:bg-sky-400/15 dark:text-sky-300',
        threshold: 60,
    },
    {
        title: 'Typing Speed',
        description: 'Race the clock and see how fast and accurately you type.',
        href: '/typing-speed',
        icon: 'Keyboard',
        accent: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-400/15 dark:text-indigo-300',
        threshold: 65,
    },
    {
        title: 'Memory Match',
        description: 'Flip cards and remember where each matching pair is hiding.',
        href: '/memory-match',
        icon: 'Brain',
        accent: 'bg-violet-100 text-violet-800 dark:bg-violet-400/15 dark:text-violet-300',
        threshold: 70,
    },
    {
        title: 'Snake',
        description: 'Collect checkmarks and weave around the barriers as you grow.',
        href: '/snake',
        icon: 'Maze',
        accent: 'bg-lime-100 text-lime-800 dark:bg-lime-400/15 dark:text-lime-300',
        threshold: 75,
    },
    {
        title: 'Task Tower',
        description: 'Stack falling blocks and clear a row before the tower fills up.',
        href: '/task-tower',
        icon: 'PisaTower',
        accent: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-400/15 dark:text-emerald-300',
        threshold: 80,
    },
    {
        title: 'Word Scramble',
        description: 'Unscramble school vocabulary before time runs out.',
        href: '/word-scramble',
        icon: 'TextFont',
        accent: 'bg-amber-100 text-amber-800 dark:bg-amber-400/15 dark:text-amber-300',
        threshold: 85,
    },
    {
        title: 'Reaction Time',
        description: 'Hit the shrinking targets and put your reflexes to the test.',
        href: '/reaction-time',
        icon: 'Target01',
        accent: 'bg-orange-100 text-orange-800 dark:bg-orange-400/15 dark:text-orange-300',
        threshold: 90,
    },
] as const;

const featuredGame = games[0];

export default function GamesPage() {
    const { authenticated } = useRequireAuth();
    const { homeworks, loading } = useHomeworkContext();
    const [playableOnly, setPlayableOnly] = useState(false);

    if (!authenticated) return null;

    const completed = homeworks.filter(homework => homework.completed).length;
    const total = homeworks.length;
    const progress = total ? (completed / total) * 100 : 0;
    const nextGame = games.find(game => progress < game.threshold);
    const assignmentsToUnlock = nextGame ? Math.ceil(total * nextGame.threshold / 100) - completed : 0;
    const playableGames = games.filter(game => progress >= game.threshold);
    const visibleGames = playableOnly ? playableGames : games;

    return (
        <div className="min-h-screen bg-[#fffaf4] px-4 pb-16 pt-24 text-slate-900 dark:bg-gray-950 dark:text-white sm:px-8 sm:pt-28">
            <div className="mx-auto max-w-6xl">
                <header className="mb-7">
                    <h1 className="text-4xl font-bold tracking-tight text-[#275085] dark:text-sky-300 sm:text-5xl">Game Center</h1>
                    <p className="mt-2 text-sm text-slate-600 dark:text-slate-300 sm:text-base">Pick a game and take a study break.</p>
                </header>

                <div className="mb-9 grid gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
                    <section aria-labelledby="featured-game" className="relative isolate flex min-h-56 flex-col justify-center overflow-hidden rounded-3xl bg-[#142c51] p-6 text-white sm:p-8">
                        <div className="relative z-10">
                            <h2 id="featured-game" className="text-3xl font-bold tracking-tight sm:text-4xl">{featuredGame.title}</h2>
                            <p className="mt-2 max-w-60 text-sm leading-6 text-sky-100">{featuredGame.description}</p>
                            <Link href={featuredGame.href} className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#eaf5ae] px-4 py-2.5 text-sm font-semibold text-[#142c51] hover:bg-lime-100 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white">
                                <Play aria-hidden="true" className="size-4" />
                                Play Color Match
                            </Link>
                        </div>
                        <div aria-hidden="true" className="pointer-events-none absolute -right-6 bottom-1 hidden rotate-[-12deg] grid-cols-2 gap-3 opacity-90 min-[460px]:grid sm:right-10 sm:bottom-5 sm:gap-4">
                            <div className="grid size-16 place-items-center rounded-2xl bg-[#f89abe] text-[#52264c] shadow-lg sm:size-[4.75rem]"><span className="size-7 rounded-full bg-current" /></div>
                            <div className="mt-3 grid size-16 place-items-center rounded-2xl bg-[#95d9fc] text-[#22477d] shadow-lg sm:size-[4.75rem]"><span className="size-6 rotate-45 rounded-[4px] bg-current" /></div>
                            <div className="-mt-3 grid size-16 place-items-center rounded-2xl bg-[#dfef99] text-[#37491a] shadow-lg sm:size-[4.75rem]"><span className="size-7 rounded-full border-[6px] border-current" /></div>
                            <div className="grid size-16 place-items-center rounded-2xl bg-[#c1a9f8] text-[#45316f] shadow-lg sm:size-[4.75rem]"><span className="size-7 rounded-[4px] border-[6px] border-current" /></div>
                        </div>
                    </section>

                    <section aria-labelledby="homework-progress" className="flex flex-col justify-center rounded-3xl border border-[#e9ded2] bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
                        <h2 id="homework-progress" className="text-sm font-semibold text-slate-600 dark:text-slate-300">Homework progress</h2>
                        {loading ? (
                            <p className="mt-3 text-sm text-slate-600 dark:text-slate-300" role="status">Loading progress…</p>
                        ) : (
                            <>
                                <p className="mt-2 text-xl font-bold tracking-tight">{completed} of {total} complete</p>
                                <progress aria-labelledby="homework-progress" className="mt-3 block h-2 w-full overflow-hidden rounded-full bg-sky-100 [&::-moz-progress-bar]:bg-sky-600 [&::-webkit-progress-bar]:bg-sky-100 [&::-webkit-progress-value]:rounded-full [&::-webkit-progress-value]:bg-sky-600 dark:bg-gray-800 dark:[&::-webkit-progress-bar]:bg-gray-800" value={completed} max={total || 1} />
                                <p className="mt-4 text-sm text-slate-600 dark:text-slate-300">
                                    {!nextGame
                                        ? 'You’ve unlocked every game.'
                                        : total > 0
                                            ? <><span className="font-semibold">{assignmentsToUnlock} more {assignmentsToUnlock === 1 ? 'assignment' : 'assignments'}</span> to unlock {nextGame.title}.</>
                                            : <>Finish homework to unlock more games. {nextGame.title} is next at {nextGame.threshold}%.</>}
                                </p>
                            </>
                        )}
                    </section>
                </div>

                <section aria-labelledby="game-library">
                    <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                        <h2 id="game-library" className="text-xl font-bold tracking-tight">Game library</h2>
                        <div className="flex gap-1 rounded-full border border-[#e9ded2] bg-white p-1 dark:border-gray-800 dark:bg-gray-900" role="group" aria-label="Filter games">
                            {[{ label: 'All games', value: false }, { label: 'Playable', value: true }].map(filter => (
                                <button
                                    key={filter.label}
                                    type="button"
                                    aria-pressed={playableOnly === filter.value}
                                    onClick={() => setPlayableOnly(filter.value)}
                                    className="rounded-full px-3.5 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500 aria-pressed:bg-[#142c51] aria-pressed:text-white dark:text-slate-300 dark:hover:bg-gray-800 dark:aria-pressed:bg-sky-200 dark:aria-pressed:text-slate-950"
                                >
                                    {filter.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {visibleGames.map(game => {
                            const playable = progress >= game.threshold;

                            return (
                                <li key={game.href} className="flex min-w-0 flex-col rounded-2xl border border-[#e9ded2] bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
                                    <div aria-hidden="true" className={`grid size-11 place-items-center rounded-xl ${game.accent}`}>
                                        <HugeIcon name={game.icon} className="size-5" />
                                    </div>
                                    <h3 className="mt-3 text-base font-bold">{game.title}</h3>
                                    <p className="mb-3 mt-1 text-sm leading-5 text-slate-600 dark:text-slate-300">{game.description}</p>
                                    <div className="mt-auto flex min-h-10 items-center">
                                        {playable ? (
                                            <Link href={game.href} aria-label={`Play ${game.title}`} className="inline-flex items-center gap-2 rounded-full bg-sky-100 px-3.5 py-2 text-sm font-semibold text-sky-900 hover:bg-sky-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500 dark:bg-sky-400/15 dark:text-sky-200 dark:hover:bg-sky-400/25">
                                                Play <ArrowRight aria-hidden="true" className="size-4" />
                                            </Link>
                                        ) : (
                                            <p className="flex items-center gap-2 text-xs font-medium text-slate-600 dark:text-slate-300">
                                                <LockKeyhole aria-hidden="true" className="size-3.5 shrink-0" />
                                                {game.threshold}% homework complete
                                            </p>
                                        )}
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                </section>
            </div>
        </div>
    );
}
