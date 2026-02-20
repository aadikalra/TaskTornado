'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Plus, List, Brain, Zap, ArrowUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Markdown } from './markdown';
import { useDarkMode } from '@/context/DarkModeContext';
import { X } from './animate-ui/icons/x';
import { UserRound } from '@/components/animate-ui/icons/user-round';

// Re-implementing the Aurora Video Icon for the demo
const AuraVideoIcon = ({ isLoading, isDark }: { isLoading?: boolean; isDark: boolean }) => {
    const videoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;
        if (isLoading) {
            video.playbackRate = 3.0;
            video.play().catch(() => { });
        } else {
            video.pause();
        }
    }, [isLoading]);

    return (
        <div className="relative h-8 w-8 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0">
            <video
                ref={videoRef}
                src={isDark ? "/AI SphereDark.mp4" : "/AI Sphere.mp4"}
                muted
                playsInline
                loop
                className="w-full h-full object-cover scale-110 opacity-90"
            />
            <div className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full border border-white dark:border-zinc-900 z-10 shadow-sm bg-teal-500" />
        </div>
    );
};

interface DemoMessage {
    role: 'user' | 'assistant';
    content: string;
    id: string;
}

const DEMO_EXAMPLES = [
    {
        title: "Workload Summary",
        icon: List,
        userPrompt: "@data Give me an overview of my tasks.",
        response: "You currently have 3 assignments pending for Math 10 and a Science project due Friday. Based on your current progress, I recommend starting with the Math problems—they're high priority and should take about 30 minutes."
    },
    {
        title: "Socratic Help",
        icon: Brain,
        userPrompt: "How do I solve for X in 2x + 5 = 15?",
        response: "Think about how we can isolate the term with 'x'. If we have an extra +5 on that side, what operation could we perform to remove it? \n\n*Hint: What's the opposite of addition?*"
    },
    {
        title: "Study Tips",
        icon: Zap,
        userPrompt: "How can I study more effectively for my History midterm?",
        response: "For History, I recommend **Active Recall**. Instead of just re-reading, try to explain the 'Cause and Effect' of the French Revolution out loud as if you're teaching me. I can also generate a 10-question practice quiz (@quiz) to test your knowledge of key dates."
    }
];

export function AuroraDemo() {
    const { isDark } = useDarkMode();
    const [messages, setMessages] = useState<DemoMessage[]>([
        {
            id: 'initial',
            role: 'assistant',
            content: "Hi! I'm Aurora. I've evolved through TaskTornado's 33 releases to become your study partner. Select an example below to see how I work."
        }
    ]);
    const [isTyping, setIsTyping] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isTyping]);

    const runDemo = async (example: typeof DEMO_EXAMPLES[0]) => {
        if (isTyping) return;
        setMessages(prev => [...prev, { id: Date.now().toString(), role: 'user', content: example.userPrompt }]);
        setIsTyping(true);
        await new Promise(resolve => setTimeout(resolve, 1500));
        setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), role: 'assistant', content: example.response }]);
        setIsTyping(false);
    };

    return (
        <div className="w-full max-w-[600px] mx-auto h-full flex flex-col bg-white dark:bg-black border border-gray-200 dark:border-zinc-900 shadow-xl rounded-3xl overflow-hidden relative font-sans">
            {/* Floating Top Controls (Exact Match) */}
            <div className="absolute top-0 inset-x-0 z-50 pointer-events-none p-4 flex justify-between items-start">
                <div className="pointer-events-auto">
                    <div className="flex items-center h-9 p-0.5 rounded-full bg-white/50 dark:bg-zinc-900/50 backdrop-blur-md border border-gray-200 dark:border-zinc-800 shadow-lg">
                        <div className="flex items-center gap-1.5 h-full px-3 rounded-full">
                            <div className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
                            <span className="text-xs font-medium tabular-nums text-gray-700 dark:text-zinc-200">
                                Demo Version <span className="opacity-40 mx-0.5">/</span> V2.4
                            </span>
                        </div>
                    </div>
                </div>

                <div className="pointer-events-auto flex items-center h-9 p-0.5 rounded-full bg-white/50 dark:bg-zinc-900/50 border border-gray-200 dark:border-zinc-800 shadow-lg backdrop-blur-md">
                    <button className="h-8 w-8 flex items-center justify-center rounded-full text-zinc-500 dark:text-zinc-400 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-all">
                        <Plus size={18} />
                    </button>
                    <div className="w-[1px] h-4 bg-gray-200 dark:bg-zinc-800 mx-0.5" />
                    <button className="h-8 w-8 flex items-center justify-center rounded-full text-zinc-500 dark:text-zinc-400 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-all font-medium">
                        <X size={18} />
                    </button>
                </div>
            </div>

            {/* Messages Area */}
            <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto p-4 pt-20 pb-24 space-y-4 scrollbar-hide scroll-smooth"
            >
                <AnimatePresence>
                    {messages.map((msg) => (
                        <motion.div
                            key={msg.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={cn(
                                "flex flex-col gap-1.5",
                                msg.role === 'user' ? "items-end" : "items-start"
                            )}
                        >
                            {msg.role === 'assistant' ? (
                                <AuraVideoIcon isDark={isDark} />
                            ) : (
                                <div className="h-8 w-8 rounded-full flex items-center justify-center">
                                    <UserRound className="h-4 w-4 text-gray-600 dark:text-zinc-400" />
                                </div>
                            )}

                            <div className={cn(
                                "transition-all duration-300",
                                msg.role === 'user'
                                    ? "max-w-[85%] rounded-[24px] px-4 py-2.5 text-sm bg-[#165df9] text-white shadow-md shadow-[#165df9]/10 font-medium leading-relaxed"
                                    : "max-w-[90%] bg-transparent text-zinc-900 dark:text-zinc-100 text-[14.5px] leading-[1.6] px-1"
                            )}>
                                <Markdown>{msg.content}</Markdown>
                            </div>
                        </motion.div>
                    ))}

                    {isTyping && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-start gap-1.5">
                            <AuraVideoIcon isLoading isDark={isDark} />
                            <div className="bg-transparent px-1">
                                <div className="flex gap-1.5 py-2">
                                    <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0 }} className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                                    <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0.2 }} className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                                    <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0.4 }} className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Fake Input Area (Exact Match) */}
            <div className="absolute bottom-0 inset-x-0 z-50 pointer-events-none p-4 bg-linear-to-t from-white via-white/40 to-transparent dark:from-black dark:via-black/40 dark:to-transparent pt-12">
                {/* Context Chips - Improved visibility for Demo */}
                <div className="absolute left-0 right-0 flex justify-start gap-2 px-4 pointer-events-auto z-10 overflow-x-auto scrollbar-none pb-1 transform translate-y-[-32px]">
                    {DEMO_EXAMPLES.map((example, i) => (
                        <motion.button
                            key={i}
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            onClick={() => runDemo(example)}
                            disabled={isTyping}
                            className="flex-shrink-0 whitespace-nowrap px-3 py-1 rounded-full bg-zinc-100/90 dark:bg-zinc-800/90 backdrop-blur-md border border-zinc-200/50 dark:border-zinc-700/50 text-[10px] font-medium text-zinc-500 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700 hover:text-zinc-900 dark:hover:text-zinc-100 transition-all shadow-sm"
                        >
                            {example.title}
                        </motion.button>
                    ))}
                </div>

                <div className="pointer-events-auto bg-white/50 dark:bg-zinc-900/50 backdrop-blur-md shadow-xl rounded-[28px] border border-gray-200 dark:border-zinc-800 flex items-center gap-2 p-1">
                    <div className="flex-1 bg-transparent px-3 py-2 text-sm text-gray-400 dark:text-zinc-500 select-none flex items-center">
                        Ask away...
                    </div>
                    <div className="p-2 bg-zinc-100 dark:bg-zinc-800 rounded-3xl text-zinc-400 dark:text-zinc-500 mr-1">
                        <ArrowUp size={18} strokeWidth={2.5} />
                    </div>
                </div>
            </div>
        </div>
    );
}
