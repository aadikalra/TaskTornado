import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Trophy, Swords, Play, RotateCcw, Sparkles, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface BracketTask {
    id: string;
    title: string;
}

interface TaskBracketProps {
    open: boolean;
    onClose: () => void;
    tasks: BracketTask[];
}

export function TaskBracket({ open, onClose, tasks }: TaskBracketProps) {
    const [hasStarted, setHasStarted] = useState(false);
    const [queue, setQueue] = useState<BracketTask[]>([]);
    const [nextRound, setNextRound] = useState<BracketTask[]>([]);
    const [roundNum, setRoundNum] = useState(1);
    const [winner, setWinner] = useState<BracketTask | null>(null);
    const [animatingId, setAnimatingId] = useState<string | null>(null);

    // Shuffle and reset when opened
    useEffect(() => {
        if (open) {
            setHasStarted(false);
            setQueue([...tasks].sort(() => Math.random() - 0.5));
            setNextRound([]);
            setRoundNum(1);
            setWinner(null);
            setAnimatingId(null);
        }
    }, [open, tasks]);

    const handlePick = useCallback((selected: BracketTask, rejected: BracketTask) => {
        if (animatingId) return;
        setAnimatingId(selected.id);

        setTimeout(() => {
            const newNextRound = [...nextRound, selected];
            const remainingQueue = queue.slice(2);

            // Auto-advance if there's an odd one out
            if (remainingQueue.length === 1) {
                newNextRound.push(remainingQueue[0]);
                remainingQueue.shift();
            }

            if (remainingQueue.length === 0) {
                if (newNextRound.length === 1) {
                    setWinner(newNextRound[0]);
                } else {
                    setQueue(newNextRound.sort(() => Math.random() - 0.5));
                    setNextRound([]);
                    setRoundNum(r => r + 1);
                }
            } else {
                setQueue(remainingQueue);
                setNextRound(newNextRound);
            }

            setAnimatingId(null);
        }, 450);
    }, [animatingId, nextRound, queue]);

    const reset = useCallback(() => {
        setHasStarted(false);
        setQueue([...tasks].sort(() => Math.random() - 0.5));
        setNextRound([]);
        setRoundNum(1);
        setWinner(null);
        setAnimatingId(null);
    }, [tasks]);

    const getRoundName = useCallback(() => {
        const totalRemaining = queue.length + nextRound.length;
        if (totalRemaining === 2) return "🏟️ Final Matchup";
        if (totalRemaining === 4) return "⚔️ Semifinals";
        if (totalRemaining === 8) return "🗡️ Quarterfinals";
        return `Round ${roundNum}`;
    }, [queue.length, nextRound.length, roundNum]);

    const progressPercent = useMemo(() => {
        const total = tasks.length;
        if (total <= 1) return 100;
        const decisionsNeeded = total - 1;
        const decisionsMade = nextRound.length + (tasks.length - queue.length - nextRound.length);
        // Rough progress: the further along we are in rounds, the more progress
        if (winner) return 100;
        return Math.min(95, Math.round(((tasks.length - queue.length) / tasks.length) * 100 + (roundNum - 1) * 20));
    }, [tasks.length, queue.length, nextRound.length, roundNum, winner]);

    if (!open) return null;

    const notEnoughTasks = tasks.length < 2;

    return (
        <AnimatePresence>
            {open && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="fixed inset-0 z-[100] flex items-center justify-center p-4"
                >
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-[#fffaf4]/80 dark:bg-gray-950/80 backdrop-blur-sm"
                        onClick={onClose}
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.96, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.96, y: 20 }}
                        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                        className="relative w-full max-w-2xl bg-white dark:bg-gray-900 rounded-[28px] shadow-2xl shadow-sky-500/5 border border-sky-100 dark:border-gray-800 overflow-hidden"
                    >
                        {/* Close button */}
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 z-20 p-2 text-sky-400 hover:text-sky-900 dark:text-sky-500 dark:hover:text-white hover:bg-sky-50 dark:hover:bg-gray-800 rounded-full transition-colors"
                        >
                            <X className="h-5 w-5" />
                        </button>

                        {/* Content */}
                        <div className="p-6 sm:p-8 min-h-[440px] flex flex-col">

                            {/* Not enough tasks */}
                            {notEnoughTasks && (
                                <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4 py-8">
                                    <div className="w-16 h-16 bg-sky-50 dark:bg-sky-500/10 border border-sky-100 dark:border-sky-500/20 rounded-2xl flex items-center justify-center">
                                        <Swords className="w-8 h-8 text-sky-400" />
                                    </div>
                                    <h2 className="text-xl font-bold text-sky-900 dark:text-white tracking-tight">
                                        Need More Tasks
                                    </h2>
                                    <p className="text-sm text-sky-600/60 dark:text-gray-400 max-w-xs">
                                        Add at least 2 incomplete tasks to run a bracket tournament.
                                    </p>
                                </div>
                            )}

                            {/* Landing — Pre-start */}
                            {!notEnoughTasks && !hasStarted && !winner && (
                                <motion.div
                                    initial={{ opacity: 0, y: 12 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                                    className="flex-1 flex flex-col items-center justify-center text-center space-y-5 py-4"
                                >
                                    <div className="w-16 h-16 bg-sky-50 dark:bg-sky-500/10 border border-sky-100 dark:border-sky-500/20 rounded-2xl flex items-center justify-center shadow-sm">
                                        <Swords className="w-8 h-8 text-sky-500" strokeWidth={1.5} />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl sm:text-3xl font-bold text-sky-900 dark:text-white tracking-tight">
                                            Task Bracket
                                        </h2>
                                        <p className="text-sm text-sky-600/60 dark:text-gray-400 mt-1.5 max-w-sm">
                                            Pit your tasks against each other. Only the most important survives.
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => setHasStarted(true)}
                                        className="mt-3 flex items-center gap-2 px-6 py-3 bg-sky-500 hover:bg-sky-600 text-white font-semibold text-sm rounded-full shadow-md shadow-sky-500/20 hover:shadow-lg hover:shadow-sky-500/30 active:scale-95 transition-all"
                                    >
                                        <Play className="w-4 h-4 fill-white" /> Begin Tournament
                                    </button>
                                    <div className="mt-5 flex flex-wrap justify-center gap-2 max-w-md">
                                        {tasks.slice(0, 8).map((t) => (
                                            <span
                                                key={t.id}
                                                className="text-[11px] font-medium bg-sky-50 dark:bg-sky-500/10 text-sky-600 dark:text-sky-300 border border-sky-100 dark:border-sky-500/20 px-3 py-1 rounded-full truncate max-w-[180px]"
                                            >
                                                {t.title}
                                            </span>
                                        ))}
                                        {tasks.length > 8 && (
                                            <span className="text-[11px] font-medium text-sky-400 dark:text-sky-500 px-3 py-1">
                                                +{tasks.length - 8} more
                                            </span>
                                        )}
                                    </div>
                                </motion.div>
                            )}

                            {/* Battle View */}
                            {!notEnoughTasks && hasStarted && !winner && queue.length >= 2 && (
                                <motion.div
                                    key={`battle-${queue[0].id}-${queue[1].id}`}
                                    initial={{ opacity: 0, scale: 0.98 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ duration: 0.3 }}
                                    className="flex-1 flex flex-col"
                                >
                                    {/* Round header */}
                                    <div className="text-center mb-6">
                                        <span className="inline-block text-[11px] font-bold tracking-widest uppercase text-sky-500 dark:text-sky-400 bg-sky-50 dark:bg-sky-500/10 border border-sky-100 dark:border-sky-500/20 px-3 py-1 rounded-full mb-2">
                                            {getRoundName()}
                                        </span>
                                        <p className="text-sm text-sky-600/50 dark:text-gray-500 font-medium">
                                            Which task should you tackle first?
                                        </p>
                                        {/* Progress bar */}
                                        <div className="mt-3 mx-auto w-full max-w-xs h-1 bg-sky-100 dark:bg-sky-500/10 rounded-full overflow-hidden">
                                            <motion.div
                                                className="h-full bg-sky-400 dark:bg-sky-500 rounded-full"
                                                initial={{ width: 0 }}
                                                animate={{ width: `${progressPercent}%` }}
                                                transition={{ duration: 0.4, ease: 'easeOut' }}
                                            />
                                        </div>
                                    </div>

                                    {/* Battle cards */}
                                    <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 relative items-stretch">
                                        {/* VS Badge */}
                                        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 hidden sm:flex w-10 h-10 bg-white dark:bg-gray-900 border-2 border-sky-200 dark:border-sky-500/30 rounded-full items-center justify-center font-extrabold text-sm text-sky-400 dark:text-sky-500 shadow-lg">
                                            VS
                                        </div>

                                        {/* Task A */}
                                        <motion.button
                                            layout
                                            onClick={() => handlePick(queue[0], queue[1])}
                                            disabled={animatingId !== null}
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            className={`
                        group relative flex flex-col items-center justify-center p-6 sm:p-10 min-h-[160px] sm:min-h-[220px]
                        rounded-2xl border-2 transition-all duration-300 outline-none text-center
                        ${animatingId === queue[0].id
                                                    ? 'bg-sky-500 border-sky-500 text-white scale-[1.02] shadow-xl shadow-sky-500/20'
                                                    : animatingId === queue[1].id
                                                        ? 'opacity-30 scale-95 border-sky-100 dark:border-gray-800 bg-sky-50/50 dark:bg-gray-800/30'
                                                        : 'bg-[#f5f9fc] dark:bg-gray-800/50 border-sky-100 dark:border-gray-700/50 hover:border-sky-400 dark:hover:border-sky-500 hover:shadow-lg hover:shadow-sky-500/10'
                                                }
                      `}
                                        >
                                            <h3 className={`text-lg sm:text-2xl font-bold tracking-tight leading-tight transition-colors duration-300 ${animatingId === queue[0].id
                                                    ? 'text-white'
                                                    : 'text-sky-900 dark:text-white group-hover:text-sky-600 dark:group-hover:text-sky-300'
                                                }`}>
                                                {queue[0].title}
                                            </h3>
                                        </motion.button>

                                        {/* Mobile VS */}
                                        <div className="sm:hidden flex items-center justify-center -my-1">
                                            <span className="text-xs font-extrabold text-sky-300 dark:text-sky-600">VS</span>
                                        </div>

                                        {/* Task B */}
                                        <motion.button
                                            layout
                                            onClick={() => handlePick(queue[1], queue[0])}
                                            disabled={animatingId !== null}
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            className={`
                        group relative flex flex-col items-center justify-center p-6 sm:p-10 min-h-[160px] sm:min-h-[220px]
                        rounded-2xl border-2 transition-all duration-300 outline-none text-center
                        ${animatingId === queue[1].id
                                                    ? 'bg-sky-500 border-sky-500 text-white scale-[1.02] shadow-xl shadow-sky-500/20'
                                                    : animatingId === queue[0].id
                                                        ? 'opacity-30 scale-95 border-sky-100 dark:border-gray-800 bg-sky-50/50 dark:bg-gray-800/30'
                                                        : 'bg-[#f5f9fc] dark:bg-gray-800/50 border-sky-100 dark:border-gray-700/50 hover:border-sky-400 dark:hover:border-sky-500 hover:shadow-lg hover:shadow-sky-500/10'
                                                }
                      `}
                                        >
                                            <h3 className={`text-lg sm:text-2xl font-bold tracking-tight leading-tight transition-colors duration-300 ${animatingId === queue[1].id
                                                    ? 'text-white'
                                                    : 'text-sky-900 dark:text-white group-hover:text-sky-600 dark:group-hover:text-sky-300'
                                                }`}>
                                                {queue[1].title}
                                            </h3>
                                        </motion.button>
                                    </div>
                                </motion.div>
                            )}

                            {/* Winner */}
                            {winner && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                                    className="flex-1 flex flex-col items-center justify-center text-center py-4"
                                >
                                    <div className="text-sky-400 dark:text-sky-500 font-bold tracking-widest uppercase text-[11px] mb-5 flex items-center gap-1.5">
                                        <Sparkles size={12} /> The Champion <Sparkles size={12} />
                                    </div>

                                    {/* Winner card */}
                                    <motion.div
                                        initial={{ scale: 0.9, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        transition={{ delay: 0.15, type: 'spring', stiffness: 200, damping: 18 }}
                                        className="relative w-full max-w-md bg-gradient-to-br from-sky-50 via-white to-sky-50 dark:from-sky-500/10 dark:via-gray-800/80 dark:to-sky-500/5 rounded-2xl border-2 border-sky-200 dark:border-sky-500/30 p-8 sm:p-10 shadow-xl shadow-sky-500/10"
                                    >
                                        {/* Trophy glow ring */}
                                        <motion.div
                                            className="absolute inset-0 rounded-2xl"
                                            animate={{
                                                boxShadow: [
                                                    '0 0 0 0 rgba(56, 189, 248, 0)',
                                                    '0 0 0 12px rgba(56, 189, 248, 0.08)',
                                                    '0 0 0 0 rgba(56, 189, 248, 0)',
                                                ],
                                            }}
                                            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                                        />

                                        <Trophy className="w-12 h-12 text-amber-400 mx-auto mb-4" strokeWidth={1.5} />
                                        <h2 className="text-2xl sm:text-3xl font-bold text-sky-900 dark:text-white tracking-tight leading-tight mb-2">
                                            {winner.title}
                                        </h2>
                                        <p className="text-sm text-sky-600/50 dark:text-gray-400 font-medium">
                                            Time to get it done. 💪
                                        </p>
                                    </motion.div>

                                    <button
                                        onClick={reset}
                                        className="mt-6 text-sky-400 dark:text-sky-500 hover:text-sky-600 dark:hover:text-sky-300 flex items-center gap-1.5 text-sm font-medium transition-colors"
                                    >
                                        <RotateCcw size={14} /> Run another bracket
                                    </button>
                                </motion.div>
                            )}
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
