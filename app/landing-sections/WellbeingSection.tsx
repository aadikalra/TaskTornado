'use client';

import { useRef, useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Sparkles, Brain, Zap, BookOpen, Heart } from 'lucide-react';
import Image from 'next/image';
import { AuroraDemo } from '@/components/AuroraDemo';

// ─── Floating topic pills ───────────────────────────────────────────────────
const TOPICS = [
    { label: 'Socratic tutoring', x: '-8%', y: '8%', delay: 0 },
    { label: '@commands', x: '102%', y: '0%', delay: 0.8 },
    { label: 'Study plans', x: '-10%', y: '60%', delay: 1.6 },
    { label: 'Practice quizzes', x: '104%', y: '55%', delay: 0.4 },
    { label: 'Flashcards', x: '100%', y: '92%', delay: 1.2 },
    { label: 'Stress support', x: '-6%', y: '95%', delay: 2.0 },
];

export default function WellbeingSection() {
    const squiggleRef = useRef<HTMLSpanElement>(null);
    const [isDarkMode, setIsDarkMode] = useState(false);

    // Track dark mode for JS-driven gradient
    useEffect(() => {
        const checkDark = () => setIsDarkMode(document.documentElement.classList.contains('dark'));
        checkDark();
        const observer = new MutationObserver(checkDark);
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
        return () => observer.disconnect();
    }, []);

    const { scrollYProgress } = useScroll({
        target: squiggleRef,
        offset: ['start 0.85', 'start 0.5']
    });
    const pathLength = useTransform(scrollYProgress, [0, 1], [0, 1]);
    const wipePercent = useTransform(scrollYProgress, [0, 1], [0, 100]);
    const backgroundImage = useTransform(wipePercent, (v) =>
        `linear-gradient(to right, #fb7185 ${v}%, ${isDarkMode ? 'rgba(251,113,133,0.3)' : 'rgba(251,113,133,0.2)'} ${v}%)`
    );

    return (
        <section className="bg-rose-50 dark:bg-gray-950 py-16 md:py-24 overflow-hidden">
            <div className="max-w-6xl mx-auto px-5 md:px-8">

                {/* ── Header ──────────────────────────────────────────────── */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-12 md:mb-16"
                >
                    <span className="inline-block px-3 py-1 text-[10px] font-bold uppercase tracking-[0.15em] text-rose-600 dark:text-rose-400 bg-rose-600/5 dark:bg-rose-400/5 border border-rose-600/10 dark:border-rose-400/10 rounded-full mb-4">
                        Meet Aurora
                    </span>
                    <h2 className="text-3xl md:text-5xl font-semibold text-rose-500 dark:text-rose-400 tracking-tight leading-[1.15] mb-4">
                        Your AI study partner<br />
                        <motion.span
                            ref={squiggleRef}
                            className="relative inline-block"
                            style={{
                                backgroundImage,
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                backgroundClip: 'text',
                            }}
                        >
                            that actually gets school.
                            <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 300 10" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
                                <motion.path
                                    d="M2 6 C 10 2, 18 2, 26 6 S 42 10, 50 6 S 66 2, 74 6 S 90 10, 98 6 S 114 2, 122 6 S 138 10, 146 6 S 162 2, 170 6 S 186 10, 194 6 S 210 2, 218 6 S 234 10, 242 6 S 258 2, 266 6 S 282 10, 298 6"
                                    stroke="#fb7185"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    fill="none"
                                    style={{ pathLength }}
                                />
                            </svg>
                        </motion.span>
                    </h2>
                    <p className="text-base md:text-lg text-rose-900/60 dark:text-rose-400/60 font-medium max-w-lg mx-auto leading-relaxed mt-2">
                        Aurora teaches, organizes, quizzes, and supports you — all from one conversation.
                    </p>
                </motion.div>

                {/* ── Two heroes: Image + Chat ────────────────────────────── */}
                <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center mb-12 md:mb-16">

                    {/* Left — Illustration (transparent bg, no card) */}
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                        className="flex justify-center"
                    >
                        <Image
                            src="/aurora-wellbeing.png"
                            alt="Cozy study illustration"
                            width={480}
                            height={480}
                            className="w-full max-w-[420px] h-auto object-contain drop-shadow-2xl"
                        />
                    </motion.div>

                    {/* Right — Chat card with floating pills */}
                    <div className="relative">

                        {/* Floating topic pills */}
                        <div className="hidden md:block">
                            {TOPICS.map((topic, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    whileInView={{ opacity: 1, scale: 1 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: 0.3 + topic.delay * 0.15, duration: 0.5 }}
                                    className="absolute z-[60]"
                                    style={{ left: topic.x, top: topic.y }}
                                >
                                    <motion.div
                                        animate={{ y: [-4, 4, -4] }}
                                        transition={{ repeat: Infinity, duration: 3 + i * 0.5, ease: 'easeInOut' }}
                                        className="px-3 py-1.5 bg-white dark:bg-zinc-800 border border-rose-500/10 dark:border-rose-400/10 rounded-full text-[11px] font-medium text-rose-900/60 dark:text-rose-400/60 whitespace-nowrap shadow-sm"
                                    >
                                        {topic.label}
                                    </motion.div>
                                </motion.div>
                            ))}
                        </div>

                        {/* The conversation demo */}
                        <motion.div
                            initial={{ opacity: 0, x: 30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                            className="h-[400px] w-full"
                        >
                            <AuroraDemo />
                        </motion.div>
                    </div>
                </div>

                {/* ── Bottom: four minimal feature points ─────────────────── */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 max-w-3xl mx-auto">
                    {[
                        { icon: Brain, label: 'Socratic Method', desc: 'Guides you, never gives answers' },
                        { icon: Zap, label: '7 @Commands', desc: 'One shortcut for every workflow' },
                        { icon: BookOpen, label: 'Instant Flashcards', desc: 'AI-generated from any topic' },
                        { icon: Heart, label: 'Stress Support', desc: 'A safe space when school gets heavy' },
                    ].map((item, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 16 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.1 + i * 0.06 }}
                            className="text-center"
                        >
                            <div className="w-10 h-10 rounded-2xl bg-rose-500/10 dark:bg-rose-400/10 flex items-center justify-center mx-auto mb-3">
                                <item.icon className="w-5 h-5 text-rose-600 dark:text-rose-400" />
                            </div>
                            <h3 className="text-sm font-bold text-rose-600 dark:text-rose-400 mb-1">{item.label}</h3>
                            <p className="text-[11px] text-rose-900/40 dark:text-rose-400/40 leading-relaxed">{item.desc}</p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
