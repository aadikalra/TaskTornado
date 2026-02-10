'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring } from 'framer-motion';

import Link from 'next/link';
import { ArrowRight, Sparkles, Brain, CalendarCheck, BookOpen, LayoutGrid, PenTool, Languages, Calculator, Users, MessageSquare, Timer, Bookmark, Gamepad2 } from 'lucide-react';

// ─── Rotating word pairs ─────────────────────────────────────────────────────────
const ROTATING_WORDS = [
    { bold: 'organized', color: 'text-[#275085] dark:text-[#4a9cdb]' },
    { bold: 'ahead', color: 'text-emerald-500 dark:text-emerald-400' },
    { bold: 'unstoppable', color: 'text-violet-500 dark:text-violet-400' },
    { bold: 'stress-free', color: 'text-amber-500 dark:text-amber-400' },
    { bold: 'on track', color: 'text-rose-500 dark:text-rose-400' },
];

// ─── Orbiting feature chips — real app features from the DockNav ─────────────────
const ORBITING_CHIPS = [
    { icon: Brain, label: 'Aurora AI', accent: 'text-violet-500', bg: 'bg-violet-50 dark:bg-violet-950/30', border: 'border-violet-200/60 dark:border-violet-800/30', startAngle: 0, radius: 185 },
    { icon: CalendarCheck, label: 'Calendar', accent: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-950/30', border: 'border-blue-200/60 dark:border-blue-800/30', startAngle: 30, radius: 215 },
    { icon: BookOpen, label: 'Flashcards', accent: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-950/30', border: 'border-amber-200/60 dark:border-amber-800/30', startAngle: 60, radius: 185 },
    { icon: LayoutGrid, label: 'Quizzes', accent: 'text-indigo-500', bg: 'bg-indigo-50 dark:bg-indigo-950/30', border: 'border-indigo-200/60 dark:border-indigo-800/30', startAngle: 90, radius: 215 },
    { icon: PenTool, label: 'Writing', accent: 'text-pink-500', bg: 'bg-pink-50 dark:bg-pink-950/30', border: 'border-pink-200/60 dark:border-pink-800/30', startAngle: 120, radius: 185 },
    { icon: Languages, label: 'Translate', accent: 'text-sky-500', bg: 'bg-sky-50 dark:bg-sky-950/30', border: 'border-sky-200/60 dark:border-sky-800/30', startAngle: 150, radius: 215 },
    { icon: Calculator, label: 'Grades', accent: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-950/30', border: 'border-emerald-200/60 dark:border-emerald-800/30', startAngle: 180, radius: 185 },
    { icon: Users, label: 'Groups', accent: 'text-cyan-500', bg: 'bg-cyan-50 dark:bg-cyan-950/30', border: 'border-cyan-200/60 dark:border-cyan-800/30', startAngle: 210, radius: 215 },
    { icon: MessageSquare, label: 'Discuss', accent: 'text-teal-500', bg: 'bg-teal-50 dark:bg-teal-950/30', border: 'border-teal-200/60 dark:border-teal-800/30', startAngle: 240, radius: 185 },
    { icon: Timer, label: 'Study Timer', accent: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-950/30', border: 'border-orange-200/60 dark:border-orange-800/30', startAngle: 270, radius: 215 },
    { icon: Bookmark, label: 'Web Saves', accent: 'text-rose-500', bg: 'bg-rose-50 dark:bg-rose-950/30', border: 'border-rose-200/60 dark:border-rose-800/30', startAngle: 300, radius: 185 },
    { icon: Gamepad2, label: 'Games', accent: 'text-fuchsia-500', bg: 'bg-fuchsia-50 dark:bg-fuchsia-950/30', border: 'border-fuchsia-200/60 dark:border-fuchsia-800/30', startAngle: 330, radius: 215 },
];

const ORBIT_DURATION = 45; // seconds for a full revolution

export default function Hero() {
    const [index, setIndex] = useState(0);
    const orbitRef = useRef<HTMLDivElement>(null);

    // ── Mouse-reactive motion values ──────────────────────────
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    // Smooth spring physics for the follow effect
    const springConfig = { stiffness: 150, damping: 20, mass: 0.5 };
    const logoX = useSpring(mouseX, springConfig);
    const logoY = useSpring(mouseY, springConfig);

    const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        if (!orbitRef.current) return;
        const rect = orbitRef.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        // Normalize to -1..1 range, then scale to pixels of movement
        const nx = (e.clientX - centerX) / (rect.width / 2);
        const ny = (e.clientY - centerY) / (rect.height / 2);
        mouseX.set(nx * 18);  // max 18px shift
        mouseY.set(ny * 14);  // max 14px shift
    }, [mouseX, mouseY]);

    const handleMouseLeave = useCallback(() => {
        mouseX.set(0);
        mouseY.set(0);
    }, [mouseX, mouseY]);

    useEffect(() => {
        const interval = setInterval(() => {
            setIndex(prev => (prev + 1) % ROTATING_WORDS.length);
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    return (
        <section className="relative pt-28 pb-8 md:pt-36 md:pb-12 overflow-hidden bg-white dark:bg-gray-950">

            {/* Orbit keyframes injected once */}
            <style>{`
                @keyframes orbit {
                    from { transform: rotate(var(--start)) translateX(var(--radius)) rotate(calc(-1 * var(--start))); }
                    to   { transform: rotate(calc(var(--start) + 360deg)) translateX(var(--radius)) rotate(calc(-1 * (var(--start) + 360deg))); }
                }
            `}</style>

            {/* ── Multi-layer ambient glow ─────────────────────────── */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-[#275085]/[0.04] rounded-full blur-[140px]" />
                <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-violet-400/[0.03] rounded-full blur-[120px]" />
                <div className="absolute top-1/3 right-0 w-[300px] h-[300px] bg-emerald-400/[0.03] rounded-full blur-[100px]" />
            </div>

            <div className="relative z-10 max-w-5xl mx-auto px-5 md:px-8">
                {/* ── Headline with rotating word ──────────────────────── */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1, duration: 0.5 }}
                    className="text-center mb-5"
                >
                    <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.08]">
                        <span className="text-gray-900 dark:text-white">Everything you need</span>
                        <br />
                        <span className="text-gray-900 dark:text-white">to stay </span>
                        <span className="inline-flex overflow-hidden align-baseline min-w-[140px] md:min-w-[220px] lg:min-w-[280px]">
                            <AnimatePresence mode="wait">
                                <motion.span
                                    key={index}
                                    initial={{ y: 30, opacity: 0, filter: 'blur(6px)' }}
                                    animate={{ y: 0, opacity: 1, filter: 'blur(0px)' }}
                                    exit={{ y: -30, opacity: 0, filter: 'blur(6px)' }}
                                    transition={{ duration: 0.35, ease: [0.25, 1, 0.5, 1] }}
                                    className={ROTATING_WORDS[index].color}
                                >
                                    {ROTATING_WORDS[index].bold}
                                </motion.span>
                            </AnimatePresence>
                        </span>
                        <span className="text-gray-900 dark:text-white">.</span>
                    </h1>
                </motion.div>

                {/* ── Subtitle ─────────────────────────────────────────── */}
                <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.4 }}
                    className="text-center text-base md:text-lg text-gray-500 dark:text-gray-400 max-w-lg mx-auto leading-relaxed mb-10"
                >
                    AI tutoring, smart scheduling, and a homework dashboard that actually works — built for students, by students.
                </motion.p>

                {/* ── CTAs ──────────────────────────────────────────────── */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.4 }}
                    className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-16 md:mb-20"
                >
                    <Link
                        href="/signup"
                        className="
                            group inline-flex items-center gap-2 px-7 py-3
                            bg-[#275085] hover:bg-[#1f3f6b]
                            text-white font-semibold text-sm
                            rounded-full transition-all duration-200
                            shadow-lg shadow-[#275085]/20 hover:shadow-xl hover:shadow-[#275085]/30
                        "
                    >
                        Get Started Free
                        <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                    </Link>
                    <Link
                        href="/blog"
                        className="
                            inline-flex items-center gap-2 px-7 py-3
                            text-gray-500 dark:text-gray-400 font-medium text-sm
                            rounded-full border border-gray-200 dark:border-zinc-800
                            hover:text-gray-900 dark:hover:text-white
                            hover:border-gray-300 dark:hover:border-zinc-700
                            transition-all duration-200
                        "
                    >
                        Read the journal
                    </Link>
                </motion.div>

                {/* ═══════════════════════════════════════════════════════
                    VISUAL — Big logo with ORBITING chips
                ═══════════════════════════════════════════════════════ */}
                <div
                    ref={orbitRef}
                    onMouseMove={handleMouseMove}
                    onMouseLeave={handleMouseLeave}
                    className="relative flex items-center justify-center mx-auto mb-10"
                    style={{ height: 380 }}
                >

                    {/* ── Continuously orbiting chips (desktop) ─────────── */}
                    <div className="hidden md:block absolute inset-0">
                        {ORBITING_CHIPS.map((chip, i) => (
                            <div
                                key={i}
                                className="absolute"
                                style={{
                                    left: '50%',
                                    top: '50%',
                                    marginLeft: -1,
                                    marginTop: -1,
                                    width: 2,
                                    height: 2,
                                    ['--start' as string]: `${chip.startAngle}deg`,
                                    ['--radius' as string]: `${chip.radius}px`,
                                    animation: `orbit ${ORBIT_DURATION}s linear infinite`,
                                }}
                            >
                                <div className={`w-max flex items-center gap-2 px-4 py-2 ${chip.bg} border ${chip.border} rounded-full shadow-sm whitespace-nowrap backdrop-blur-sm -translate-x-1/2 -translate-y-1/2`}>
                                    <chip.icon className={`w-3.5 h-3.5 ${chip.accent}`} />
                                    <span className={`text-[12px] font-bold ${chip.accent}`}>{chip.label}</span>
                                </div>
                            </div>
                        ))}
                    </div>


                    {/* ── Central logo — mouse-reactive ─────────────────── */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.6 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.3, duration: 0.6, type: 'spring', bounce: 0.25 }}
                        className="relative z-10"
                        style={{ x: logoX, y: logoY, perspective: 600 }}
                    >
                        {/* Glow behind logo — also shifts with mouse */}
                        <motion.div
                            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200px] h-[200px] bg-[#275085]/[0.12] rounded-full blur-[60px] pointer-events-none"
                            style={{ x: logoX, y: logoY }}
                        />

                        {/* Logo container */}
                        <div className="relative w-32 h-32 md:w-40 md:h-40 flex items-center justify-center">
                            {/* Logo with drop-shadow */}
                            <img
                                src="/TaskTornado.svg"
                                alt="TaskTornado"
                                className="w-24 h-24 md:w-32 md:h-32 relative z-10 drop-shadow-[0_10px_30px_rgba(39,80,133,0.3)]"
                            />
                        </div>
                    </motion.div>

                    {/* ── Mobile chips (stacked, no orbit) ──────────────── */}
                    <div className="md:hidden absolute -bottom-2 left-0 right-0 flex flex-wrap items-center justify-center gap-2">
                        {ORBITING_CHIPS.slice(0, 4).map((chip, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.6 + i * 0.1 }}
                                className={`flex items-center gap-1 px-2.5 py-1 ${chip.bg} border ${chip.border} rounded-full`}
                            >
                                <chip.icon className={`w-2.5 h-2.5 ${chip.accent}`} />
                                <span className={`text-[10px] font-semibold ${chip.accent}`}>{chip.label}</span>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* ── Trust line ───────────────────────────────────────── */}
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.2, duration: 0.5 }}
                    className="text-center text-[10px] font-medium uppercase tracking-widest text-gray-400 dark:text-zinc-600"
                >
                    No credit card · 2-min setup · Works with Google Classroom
                </motion.p>
            </div>
        </section>
    );
}
