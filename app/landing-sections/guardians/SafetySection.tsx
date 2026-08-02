'use client';

import { useRef, useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Shield, Check, X } from 'lucide-react';
import Image from 'next/image';

const SAFETY_CHECKS = [
    { text: 'No advertisements — ever', safe: true },
    { text: 'No student data sold to third parties', safe: true },
    { text: 'Clear limits: not therapy or emergency support', safe: true },
    { text: 'No social media feeds or doom-scrolling', safe: true },
    { text: 'AI study tools are paused during our provider update', safe: true },
    { text: 'No credit card required', safe: true },
];

const UNSAFE_OTHERS = [
    { text: 'Social feeds that distract', app: 'Most apps' },
    { text: 'Targeted ads based on age & behavior', app: 'Free tools' },
    { text: 'Sell student data to brokers', app: 'Some EdTech' },
    { text: 'No safeguards on AI answers', app: 'ChatGPT' },
];

export default function SafetySection() {
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
        `linear-gradient(to right, #8b5cf6 ${v}%, ${isDarkMode ? 'rgba(167,139,250,0.4)' : 'rgba(139,92,246,0.4)'} ${v}%)`
    );

    return (
        <section className="py-20 md:py-28 bg-[#faf9ff] dark:bg-zinc-950 overflow-hidden">
            <div className="max-w-6xl mx-auto px-5 md:px-8">

                {/* ── Header ──────────────────────────────────────────── */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-12 md:mb-16"
                >
                    <span className="inline-block px-3 py-1 text-[10px] font-bold uppercase tracking-[0.15em] text-violet-500 dark:text-violet-400 bg-violet-500/5 dark:bg-violet-400/5 border border-violet-500/10 dark:border-violet-400/10 rounded-full mb-6">
                        The Safety
                    </span>
                    <h2 className="text-3xl md:text-5xl font-semibold text-violet-500 dark:text-violet-400 tracking-tight leading-[1.15] mb-4">
                        A safe space,<br />
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
                            built for students.
                            <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 300 10" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
                                <motion.path
                                    d="M2 6 C 10 2, 18 2, 26 6 S 42 10, 50 6 S 66 2, 74 6 S 90 10, 98 6 S 114 2, 122 6 S 138 10, 146 6 S 162 2, 170 6 S 186 10, 194 6 S 210 2, 218 6 S 234 10, 242 6 S 258 2, 266 6 S 282 10, 298 6"
                                    stroke="#8b5cf6"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    fill="none"
                                    style={{ pathLength }}
                                />
                            </svg>
                        </motion.span>
                    </h2>
                    <p className="text-base md:text-lg text-violet-500/70 dark:text-violet-400/70 max-w-2xl mx-auto leading-relaxed font-medium">
                        No ads. No data selling. No distractions. Just tools designed with your child&apos;s safety as the foundation.
                    </p>
                </motion.div>

                {/* ── Two-column: Safe vs Unsafe ─────────────────────── */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 max-w-4xl mx-auto">

                    {/* LEFT COLUMN */}
                    <div className="flex flex-col h-full">
                        {/* TaskTornado safety checklist */}
                        <motion.div
                            initial={{ opacity: 0, y: 16 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.1, duration: 0.6 }}
                            className="bg-white dark:bg-zinc-800/50 border border-violet-500/10 dark:border-zinc-700/50 rounded-[24px] p-6 md:p-8 flex-1 shadow-sm"
                        >
                            <div className="flex items-center gap-2 mb-6">
                                <div className="p-1.5 rounded-lg bg-violet-500/10 dark:bg-violet-400/15">
                                    <Shield className="w-4 h-4 text-violet-500 dark:text-violet-400" />
                                </div>
                                <span className="text-sm font-bold text-violet-500 dark:text-violet-400">TaskTornado</span>
                            </div>

                            <div className="space-y-3">
                                {SAFETY_CHECKS.map((item, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, x: -8 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: 0.15 + i * 0.06 }}
                                        className="flex items-center gap-3"
                                    >
                                        <div className="w-4 h-4 rounded-full bg-violet-500 dark:bg-violet-400 flex items-center justify-center shrink-0">
                                            <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />
                                        </div>
                                        <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">{item.text}</span>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>

                        {/* TaskTornado Image */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.2, duration: 0.5 }}
                        >
                            <div className="h-[220px] md:h-[280px] flex items-center justify-center mt-6">
                                <Image
                                    src="/safety-tasktornado.png"
                                    alt="Student First Safety"
                                    width={400}
                                    height={300}
                                    className="h-full w-auto object-contain drop-shadow-sm"
                                    priority
                                />
                            </div>
                        </motion.div>

                    </div>

                    {/* RIGHT COLUMN */}
                    <div className="flex flex-col h-full">
                        {/* RIGHT — What other apps do */}
                        <motion.div
                            initial={{ opacity: 0, y: 16 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.2, duration: 0.6 }}
                            className="bg-white dark:bg-zinc-800/50 border border-[#275085]/8 dark:border-[#4a9cdb]/10 rounded-[20px] p-5 flex-1 shadow-sm"
                        >
                            <div className="flex items-center gap-2 mb-4">
                                <div className="p-1.5 rounded-lg bg-[#275085]/8 dark:bg-[#4a9cdb]/8">
                                    <X className="w-4 h-4 text-[#275085]/35 dark:text-[#4a9cdb]/35" />
                                </div>
                                <span className="text-sm font-bold text-[#275085] dark:text-[#4a9cdb]">Common alternatives</span>
                            </div>

                            <div className="space-y-2.5">
                                {UNSAFE_OTHERS.map((item, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, x: -8 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: 0.25 + i * 0.06 }}
                                        className="flex items-start gap-3"
                                    >
                                        <div className="w-4.5 h-4.5 rounded-full bg-[#275085]/8 dark:bg-[#4a9cdb]/8 flex items-center justify-center shrink-0 mt-0.5">
                                            <X className="w-2.5 h-2.5 text-[#275085]/35 dark:text-[#4a9cdb]/35" strokeWidth={3} />
                                        </div>
                                        <div>
                                            <span className="text-sm text-[#275085]/70 dark:text-[#4a9cdb]/70 font-medium">{item.text}</span>
                                            <span className="text-[10px] text-[#275085]/40 dark:text-[#4a9cdb]/40 ml-2">{item.app}</span>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>

                            {/* Subtle separator */}
                            <div className="mt-4 pt-3 border-t border-[#275085]/6 dark:border-[#4a9cdb]/8">
                                <p className="text-[11px] text-[#275085]/45 dark:text-[#4a9cdb]/45 leading-snug font-medium">
                                    You shouldn&apos;t have to read a 40-page privacy policy to trust a study tool.
                                </p>
                            </div>
                        </motion.div>

                        {/* Other Tools Image */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.3, duration: 0.5 }}
                        >
                            <div className="h-[220px] md:h-[280px] flex items-center justify-center mt-6">
                                <Image
                                    src="/safety-other-tools.png"
                                    alt="Other Tools Comparison"
                                    width={400}
                                    height={300}
                                    className="h-full w-auto object-contain drop-shadow-sm"
                                    priority
                                />
                            </div>
                        </motion.div>
                    </div>
                </div>


            </div>
        </section>
    );
}
