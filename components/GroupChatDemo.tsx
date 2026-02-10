'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Users, Wifi } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

// ─── Demo messages ──────────────────────────────────────────────────────────────
const DEMO_MESSAGES = [
    { id: '1', name: 'Sarah M.', initials: 'SM', color: 'bg-blue-500', content: 'Did anyone finish the lab report?', time: '3:42 PM', isOwn: false },
    { id: '2', name: 'Jake D.', initials: 'JD', color: 'bg-green-500', content: 'Just wrapped it up! Want me to share my notes?', time: '3:43 PM', isOwn: false },
    { id: '3', name: 'You', initials: 'AK', color: 'bg-[#264f84]', content: 'That would be awesome, thanks!', time: '3:44 PM', isOwn: true },
    { id: '4', name: 'Alex L.', initials: 'AL', color: 'bg-purple-500', content: 'Should we study together for the midterm? 📚', time: '3:45 PM', isOwn: false },
    { id: '5', name: 'You', initials: 'AK', color: 'bg-[#264f84]', content: 'I\'m down! Library at 5?', time: '3:45 PM', isOwn: true },
    { id: '6', name: 'Sarah M.', initials: 'SM', color: 'bg-blue-500', content: 'Count me in 🙌', time: '3:46 PM', isOwn: false },
];

// ─── Component ──────────────────────────────────────────────────────────────────
export function GroupChatDemo({ className }: { className?: string }) {
    const [inputValue, setInputValue] = useState('');
    const [visibleCount, setVisibleCount] = useState(0);
    const scrollRef = useRef<HTMLDivElement>(null);

    // Animate messages appearing one by one on mount
    useEffect(() => {
        if (visibleCount < DEMO_MESSAGES.length) {
            const timer = setTimeout(() => {
                setVisibleCount(prev => prev + 1);
            }, visibleCount === 0 ? 300 : 600);
            return () => clearTimeout(timer);
        }
    }, [visibleCount]);

    // Auto-scroll as messages appear
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [visibleCount]);

    const visibleMessages = DEMO_MESSAGES.slice(0, visibleCount);

    return (
        <div className={cn('flex flex-col bg-white dark:bg-zinc-900 rounded-2xl border border-gray-200 dark:border-zinc-800 overflow-hidden', className)}>

            {/* ── Header ─────────────────────────────────────────── */}
            <div className="flex items-center justify-between px-3 py-2 border-b border-gray-100 dark:border-zinc-800">
                <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-[#275085] flex items-center justify-center">
                        <Users className="w-3 h-3 text-white" />
                    </div>
                    <div>
                        <p className="text-[11px] font-semibold text-gray-900 dark:text-white leading-tight">AP Chemistry</p>
                        <p className="text-[9px] text-gray-400 dark:text-zinc-500">4 members</p>
                    </div>
                </div>
                <div className="flex items-center gap-1.5 px-2 py-1 bg-green-50 dark:bg-green-950/20 rounded-full">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-[9px] font-medium text-green-600 dark:text-green-400">Live</span>
                </div>
            </div>

            {/* ── Messages ───────────────────────────────────────── */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto px-3 py-2 space-y-0.5" style={{ minHeight: 0 }}>
                <AnimatePresence>
                    {visibleMessages.map((msg, index) => {
                        const prevMsg = index > 0 ? visibleMessages[index - 1] : null;
                        const showHeader = !prevMsg || prevMsg.name !== msg.name;

                        return (
                            <motion.div
                                key={msg.id}
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.25, ease: 'easeOut' }}
                                className={cn('flex', showHeader ? 'mt-2' : 'mt-0.5', msg.isOwn ? 'justify-end' : 'justify-start')}
                            >
                                <div className={cn('max-w-[80%] flex flex-col gap-0.5', msg.isOwn && 'items-end')}>
                                    {showHeader && (
                                        <div className={cn('flex items-center gap-1.5 px-1', msg.isOwn && 'flex-row-reverse')}>
                                            <span className="text-[9px] font-semibold text-gray-700 dark:text-gray-300">{msg.name}</span>
                                            <span className="text-[8px] text-gray-400 dark:text-zinc-600">{msg.time}</span>
                                        </div>
                                    )}
                                    <div className={cn(
                                        'px-2.5 py-1.5 rounded-xl text-[11px] leading-relaxed w-fit',
                                        msg.isOwn
                                            ? 'bg-[#264f84] dark:bg-blue-600 text-white'
                                            : 'bg-gray-100 dark:bg-zinc-800 text-gray-800 dark:text-gray-200'
                                    )}>
                                        {msg.content}
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
            </div>

            {/* ── Input (non-functional, demo only) ──────────────── */}
            <div className="px-2 py-2 border-t border-gray-100 dark:border-zinc-800">
                <div className="flex items-center gap-1.5 bg-gray-50 dark:bg-zinc-800/50 rounded-full px-3 py-1.5">
                    <input
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder="Type a message..."
                        className="flex-1 bg-transparent text-[11px] text-gray-700 dark:text-gray-300 placeholder:text-gray-400 dark:placeholder:text-zinc-600 outline-none"
                        readOnly
                    />
                    <button className="w-6 h-6 rounded-full bg-[#264f84] dark:bg-blue-600 flex items-center justify-center opacity-40 cursor-default">
                        <Send className="w-3 h-3 text-white" />
                    </button>
                </div>
            </div>
        </div>
    );
}
