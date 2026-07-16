'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HugeIcon } from '@/lib/huge-icon-map';
import { getFullVersionString } from '@/config/version';

interface Stats {
    words: number;
    chars: number;
    charsNoSpaces: number;
    sentences: number;
    paragraphs: number;
    readingTime: number; // in minutes
}

const DEFAULT_STATS: Stats = {
    words: 0,
    chars: 0,
    charsNoSpaces: 0,
    sentences: 0,
    paragraphs: 0,
    readingTime: 0,
};

export default function WordCounterPage() {
    const [text, setText] = useState('');
    const [stats, setStats] = useState<Stats>(DEFAULT_STATS);

    // Optimized counter for Chromebooks.
    // We use a simple debounce so we aren't locking the main thread on every keystroke for 14k+ word essays.
    useEffect(() => {
        const timer = setTimeout(() => {
            const trimmed = text.trim();
            if (!trimmed) {
                setStats(DEFAULT_STATS);
                return;
            }

            // O(n) scan for absolute fastest performance rather than expensive regexes
            let words = 0;
            let chars = 0;
            let charsNoSpaces = 0;
            let sentences = 0;
            let paragraphs = 0;
            let inWord = false;
            let inParagraph = false;

            for (let i = 0; i < text.length; i++) {
                const c = text[i];
                chars++;

                // Whitespace check
                if (c === ' ' || c === '\n' || c === '\r' || c === '\t') {
                    inWord = false;
                    
                    if (c === '\n') {
                        inParagraph = false;
                    }
                } else {
                    charsNoSpaces++;
                    if (!inWord) {
                        words++;
                        inWord = true;
                    }
                    if (!inParagraph) {
                        paragraphs++;
                        inParagraph = false; // We just set it, but wait, it should stay true until newline
                        inParagraph = true;
                    }

                    // Naive sentence boundary detection (end of word followed by punctuation)
                    if (c === '.' || c === '?' || c === '!') {
                        // Check if next char is whitespace or EOF
                        const next = text[i + 1];
                        if (next === undefined || next === ' ' || next === '\n' || next === '\r') {
                            sentences++;
                        }
                    }
                }
            }

            // Fallback for missing ending punctuation on single sentences
            if (words > 0 && sentences === 0) sentences = 1;

            setStats({
                words,
                chars,
                charsNoSpaces,
                sentences,
                paragraphs,
                readingTime: Math.max(1, Math.ceil(words / 238)), // Average adult reading speed: 238 wpm
            });
        }, 150); // 150ms debounce — fast enough to feel instant, slow enough to batch rapid typing on slow hardware

        return () => clearTimeout(timer);
    }, [text]);

    const handleClear = () => {
        setText('');
        setStats(DEFAULT_STATS);
    };

    return (
        <div className="min-h-screen bg-[#fffaf4] dark:bg-gray-950 font-sans relative overflow-x-hidden">
            {/* ── Ambient glows ─────────────────────── */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-sky-200/20 dark:bg-sky-500/[0.06] rounded-full blur-[140px]" />
                <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-[#ebf6b5]/30 dark:bg-emerald-500/[0.04] rounded-full blur-[120px]" />
                <div className="absolute top-1/3 right-0 w-[300px] h-[300px] bg-[#ebf6b5]/20 dark:bg-emerald-500/[0.04] rounded-full blur-[100px]" />
            </div>

            <div className="relative z-10 w-full mx-auto px-4 sm:px-6 md:px-12 lg:px-16 pt-28 pb-48 flex flex-col min-h-screen">
                
                {/* Header */}
                <div className="mb-8 flex justify-between items-end">
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                        <h1 className="text-4xl lg:text-[52px] font-bold text-sky-500 dark:text-sky-400 leading-[1.08] tracking-tight mb-3">
                            Word Counter.
                        </h1>
                        <p className="text-sm sm:text-base text-sky-600 dark:text-sky-300 font-medium">
                            Paste your essay. Count words, characters, and sentences instantly.
                        </p>
                    </motion.div>
                </div>

                {/* Distraction Free Text Area */}
                <motion.div 
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="flex-1 flex flex-col min-h-[60vh] relative"
                >
                    <div className="bg-[#f5f9fc] dark:bg-zinc-800 rounded-[32px] overflow-hidden shadow-sm flex-1 flex flex-col transition-all border border-sky-100 dark:border-zinc-700/50 group focus-within:shadow-md focus-within:border-sky-300 dark:focus-within:border-sky-500/50">
                        <div className="px-6 pt-5 pb-3 flex justify-between items-center border-b border-sky-100 dark:border-sky-900/20">
                            <span className="text-[13px] font-bold text-sky-500 dark:text-sky-400 uppercase tracking-[0.1em]">
                                Text Input
                            </span>
                            {text.length > 0 && (
                                <button 
                                    onClick={handleClear}
                                    className="text-[12px] font-bold text-sky-400 hover:text-sky-600 dark:text-sky-500/70 dark:hover:text-sky-400 transition-colors uppercase tracking-wider flex items-center gap-1.5"
                                >
                                    <HugeIcon name="Delete02" className="w-3.5 h-3.5" />
                                    Clear
                                </button>
                            )}
                        </div>
                        <textarea
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            placeholder="Paste your 14k word essay here..."
                            className="w-full flex-1 resize-none bg-transparent text-sky-950 dark:text-sky-50 placeholder:text-sky-700/40 dark:placeholder:text-sky-400/40 text-xl leading-[1.7] outline-none scrollbar-hide px-6 py-6"
                            spellCheck={false}
                        />
                    </div>
                </motion.div>
            </div>

            {/* Floating Glassmorphic Split-Capsule / Toolbar Pattern */}
            <AnimatePresence>
                {text.length > 0 && (
                    <motion.div 
                        initial={{ opacity: 0, y: 40, x: '-50%', scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, x: '-50%', scale: 1 }}
                        exit={{ opacity: 0, y: 40, x: '-50%', scale: 0.95 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        className="fixed bottom-10 left-1/2 z-50 flex items-center gap-px bg-white/60 dark:bg-zinc-800/60 p-1.5 rounded-full backdrop-blur-3xl shadow-2xl shadow-sky-500/10 border border-sky-100 dark:border-zinc-700/50"
                    >
                        {/* Word Count (Primary Highlight) */}
                        <div className="bg-[#275085] dark:bg-[#4a9cdb] rounded-full px-6 sm:px-8 py-3.5 flex items-center gap-3 sm:gap-4 shadow-inner">
                            <span className="text-[11px] sm:text-[12px] font-bold uppercase tracking-[0.1em] text-sky-200/80">Words</span>
                            <span className="text-2xl sm:text-3xl font-black tabular-nums tracking-tighter text-white">{stats.words.toLocaleString()}</span>
                        </div>

                        {/* Secondary Stats */}
                        <div className="bg-transparent rounded-full px-6 py-3.5 flex items-center gap-6">
                            <div className="flex items-center gap-2">
                                <span className="text-[11px] font-bold uppercase tracking-[0.1em] text-sky-500 dark:text-sky-400">Chars</span>
                                <span className="text-lg sm:text-xl font-bold text-sky-900 dark:text-sky-100 tabular-nums">{stats.chars.toLocaleString()}</span>
                            </div>
                            <div className="w-px h-6 bg-sky-200/50 dark:bg-zinc-700/50 hidden sm:block" />
                            <div className="hidden sm:flex items-center gap-2">
                                <span className="text-[11px] font-bold uppercase tracking-[0.1em] text-sky-500 dark:text-sky-400">Sentences</span>
                                <span className="text-lg sm:text-xl font-bold text-sky-900 dark:text-sky-100 tabular-nums">{stats.sentences.toLocaleString()}</span>
                            </div>
                            <div className="w-px h-6 bg-sky-200/50 dark:bg-zinc-700/50 hidden md:block" />
                            <div className="hidden md:flex items-center gap-2">
                                <span className="text-[11px] font-bold uppercase tracking-[0.1em] text-sky-500 dark:text-sky-400">Read Time</span>
                                <span className="text-lg sm:text-xl font-bold text-sky-900 dark:text-sky-100 tabular-nums">~{stats.readingTime}m</span>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
