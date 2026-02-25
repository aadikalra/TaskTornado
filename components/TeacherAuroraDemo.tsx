'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {  Plus, Brain, ArrowUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Markdown } from './markdown';
import { useDarkMode } from '@/context/DarkModeContext';
import { X } from 'lucide-react';
import { UserRound } from 'lucide-react';

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
            <div className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full border border-white dark:border-zinc-900 z-10 shadow-sm bg-emerald-500" />
        </div>
    );
};

interface DemoMessage {
    role: 'user' | 'assistant';
    content: string;
    id: string;
}

// Teacher-focused conversation about photosynthesis (Socratic method demo)
const TEACHER_CONVERSATION: DemoMessage[] = [
    {
        id: '1',
        role: 'user',
        content: "I don't understand how photosynthesis works. Can you just tell me the answer for my worksheet?"
    },
    {
        id: '2',
        role: 'assistant',
        content: "I'd love to help you understand it! Let's start with the basics — do you know what plants need to make their own food?"
    },
    {
        id: '3',
        role: 'user',
        content: "Sunlight and water?"
    },
    {
        id: '4',
        role: 'assistant',
        content: "Exactly! Sunlight and water are two of the key ingredients. There's one more important gas they absorb from the air — do you remember which one?"
    },
    {
        id: '5',
        role: 'user',
        content: "Oh, CO2! Carbon dioxide!"
    },
    {
        id: '6',
        role: 'assistant',
        content: "That's it! So plants take in sunlight, water, and CO₂ and convert them into glucose (food) and oxygen. Now, can you write that as a simple equation for your worksheet?"
    },
    {
        id: '7',
        role: 'user',
        content: "CO₂ + Water + Sunlight → Glucose + Oxygen?"
    },
    {
        id: '8',
        role: 'assistant',
        content: "You've got the right idea! 🎉 Now try balancing it — how many CO₂ and H₂O molecules do you need on the left side so the atoms match on both sides?"
    },
];

export function TeacherAuroraDemo() {
    const { isDark } = useDarkMode();
    const [visibleCount, setVisibleCount] = useState(0);
    const [isTyping, setIsTyping] = useState(false);
    const [inputText, setInputText] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isUserTyping, setIsUserTyping] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);
    const hasStarted = useRef(false);
    const timeoutsRef = useRef<NodeJS.Timeout[]>([]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [visibleCount, isTyping, inputText]);

    // Clean up timeouts on unmount
    useEffect(() => {
        return () => {
            timeoutsRef.current.forEach(t => clearTimeout(t));
        };
    }, []);

    const wait = (ms: number) => new Promise<void>(resolve => {
        const t = setTimeout(resolve, ms);
        timeoutsRef.current.push(t);
    });

    // Type text character by character into the input bar
    const typeIntoInput = async (text: string) => {
        setIsUserTyping(true);
        setInputText('');

        for (let c = 0; c < text.length; c++) {
            await wait(30 + Math.random() * 30); // 30-60ms per character
            setInputText(text.slice(0, c + 1));
        }

        // Brief pause after finishing typing
        await wait(400);
        setIsUserTyping(false);
    };

    // Simulate pressing the submit button
    const simulateSubmit = async () => {
        setIsSubmitting(true);
        await wait(200);
        setIsSubmitting(false);
        setInputText('');
    };

    // Auto-play the conversation with delays
    const startConversation = useCallback(() => {
        if (hasStarted.current) return;
        hasStarted.current = true;

        const run = async () => {
            await wait(800);

            for (let i = 0; i < TEACHER_CONVERSATION.length; i++) {
                const msg = TEACHER_CONVERSATION[i];

                if (msg.role === 'user') {
                    // 1) Type word-by-word into input bar
                    await typeIntoInput(msg.content);

                    // 2) Press submit button
                    await simulateSubmit();

                    // 3) Show the message bubble
                    setVisibleCount(prev => prev + 1);

                    // Pause before next message
                    if (i < TEACHER_CONVERSATION.length - 1) {
                        await wait(500);
                    }
                } else {
                    // Assistant: show typing indicator, then reveal
                    setIsTyping(true);
                    await wait(1500);
                    setIsTyping(false);
                    setVisibleCount(prev => prev + 1);

                    // Pause before next message
                    if (i < TEACHER_CONVERSATION.length - 1) {
                        await wait(600);
                    }
                }
            }
        };

        run();
    }, []);

    const visibleMessages = TEACHER_CONVERSATION.slice(0, visibleCount);

    return (
        <motion.div
            onViewportEnter={() => startConversation()}
            viewport={{ once: true, amount: 0.3 }}
            className="w-full max-w-[600px] mx-auto h-full flex flex-col bg-white dark:bg-black border border-gray-200 dark:border-zinc-900 shadow-xl rounded-3xl overflow-hidden relative font-sans"
        >
            {/* Floating Top Controls */}
            <div className="absolute top-0 inset-x-0 z-50 pointer-events-none p-4 flex justify-between items-start">
                <div className="pointer-events-auto">
                    <div className="flex items-center h-9 p-0.5 rounded-full bg-white/50 dark:bg-zinc-900/50 backdrop-blur-md border border-gray-200 dark:border-zinc-800 shadow-lg">
                        <div className="flex items-center gap-1.5 h-full px-3 rounded-full">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
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
                    {visibleMessages.map((msg) => (
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
                                    ? "max-w-[85%] rounded-[24px] px-4 py-2.5 text-sm bg-emerald-500 text-white shadow-md shadow-emerald-500/10 font-medium leading-relaxed"
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
                                    <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0 }} className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                                    <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0.2 }} className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                                    <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0.4 }} className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Bottom Bar */}
            <div className="absolute bottom-0 inset-x-0 z-50 pointer-events-none p-4 bg-linear-to-t from-white via-white/40 to-transparent dark:from-black dark:via-black/40 dark:to-transparent pt-12">
                {/* Tagline */}
                <div className="absolute left-0 right-0 flex justify-center px-4 pointer-events-none z-10 transform translate-y-[-32px]">
                    <span className="px-3 py-1 rounded-full bg-[#df96c9]/10 dark:bg-[#df96c9]/20 backdrop-blur-md border border-[#df96c9]/30 text-[10px] font-medium text-[#c06ea8] dark:text-[#df96c9] italic">
                        <Brain className="w-2.5 h-2.5 inline mr-1" />
                        Teaches the method, not the answer
                    </span>
                </div>

                <div className="pointer-events-auto bg-white/50 dark:bg-zinc-900/50 backdrop-blur-md shadow-xl rounded-[28px] border border-gray-200 dark:border-zinc-800 flex items-center gap-2 p-1">
                    <div className="flex-1 bg-transparent px-3 py-2 text-sm select-none flex items-center min-h-[36px] overflow-hidden">
                        <AnimatePresence mode="wait">
                            {inputText ? (
                                <motion.span
                                    key="typing"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="text-zinc-900 dark:text-zinc-100 font-medium truncate"
                                >
                                    {inputText}
                                    {isUserTyping && (
                                        <motion.span
                                            animate={{ opacity: [1, 0] }}
                                            transition={{ repeat: Infinity, duration: 0.53 }}
                                            className="inline-block w-[1.5px] h-[13px] bg-zinc-900 dark:bg-zinc-100 ml-px relative top-[1px]"
                                        />
                                    )}
                                </motion.span>
                            ) : (
                                <motion.span
                                    key="placeholder"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="text-gray-400 dark:text-zinc-500"
                                >
                                    Ask away...
                                </motion.span>
                            )}
                        </AnimatePresence>
                    </div>
                    <motion.div
                        animate={isSubmitting
                            ? { scale: 0.85, backgroundColor: '#10b981' }
                            : inputText
                                ? { scale: 1, backgroundColor: '#10b981' }
                                : { scale: 1, backgroundColor: isDark ? '#27272a' : '#f4f4f5' }
                        }
                        transition={{ duration: 0.15 }}
                        className="p-2 rounded-3xl mr-1 flex items-center justify-center"
                    >
                        <ArrowUp
                            size={18}
                            strokeWidth={2.5}
                            className={cn(
                                "transition-colors duration-150",
                                inputText ? "text-white" : "text-zinc-400 dark:text-zinc-500"
                            )}
                        />
                    </motion.div>
                </div>
            </div>
        </motion.div>
    );
}
