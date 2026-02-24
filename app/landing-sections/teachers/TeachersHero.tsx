'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, GraduationCap, Brain, CalendarCheck, BookOpen, LayoutGrid, ClipboardList, Users, MessageSquare, Bell } from 'lucide-react';

// ─── Rotating words — teacher-focused outcomes ───────────────────────────────────
const ROTATING_WORDS = [
    { bold: 'prepared', color: 'text-[#b5d565]' },
    { bold: 'engaged', color: 'text-[#b5d565]' },
    { bold: 'on track', color: 'text-[#b5d565]' },
    { bold: 'confident', color: 'text-[#b5d565]' },
    { bold: 'accountable', color: 'text-[#b5d565]' },
];

// ─── Orbiting chips — teacher-relevant features ─────────────────────────────────
const ORBITING_CHIPS = [
    { icon: ClipboardList, label: 'Homework', accent: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-950/30', border: 'border-blue-200/60 dark:border-blue-800/30', startAngle: 0, radius: 185 },
    { icon: Brain, label: 'AI Tutor', accent: 'text-violet-500', bg: 'bg-violet-50 dark:bg-violet-950/30', border: 'border-violet-200/60 dark:border-violet-800/30', startAngle: 45, radius: 215 },
    { icon: CalendarCheck, label: 'Deadlines', accent: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-950/30', border: 'border-emerald-200/60 dark:border-emerald-800/30', startAngle: 90, radius: 185 },
    { icon: BookOpen, label: 'Flashcards', accent: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-950/30', border: 'border-amber-200/60 dark:border-amber-800/30', startAngle: 135, radius: 215 },
    { icon: LayoutGrid, label: 'Quizzes', accent: 'text-indigo-500', bg: 'bg-indigo-50 dark:bg-indigo-950/30', border: 'border-indigo-200/60 dark:border-indigo-800/30', startAngle: 180, radius: 185 },
    { icon: Users, label: 'Study Groups', accent: 'text-cyan-500', bg: 'bg-cyan-50 dark:bg-cyan-950/30', border: 'border-cyan-200/60 dark:border-cyan-800/30', startAngle: 225, radius: 215 },
    { icon: MessageSquare, label: 'Discussions', accent: 'text-teal-500', bg: 'bg-teal-50 dark:bg-teal-950/30', border: 'border-teal-200/60 dark:border-teal-800/30', startAngle: 270, radius: 185 },
    { icon: Bell, label: 'Smart Alerts', accent: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-950/30', border: 'border-orange-200/60 dark:border-orange-800/30', startAngle: 315, radius: 215 },
];

const ORBIT_DURATION = 45;

export default function TeachersHero() {
    const [index, setIndex] = useState(0);
    const orbitRef = useRef<HTMLDivElement>(null);

    // ── Mouse-reactive motion values ──────────────────────────
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    const springConfig = { stiffness: 150, damping: 20, mass: 0.5 };
    const logoX = useSpring(mouseX, springConfig);
    const logoY = useSpring(mouseY, springConfig);

    const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        if (!orbitRef.current) return;
        const rect = orbitRef.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const nx = (e.clientX - centerX) / (rect.width / 2);
        const ny = (e.clientY - centerY) / (rect.height / 2);
        mouseX.set(nx * 18);
        mouseY.set(ny * 14);
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
        <section className="relative min-h-screen flex flex-col justify-center pt-20 pb-10 overflow-hidden bg-gradient-to-b from-[#f6fae7] via-[#f6fae7] to-[#FCFDF5] dark:from-gray-950 dark:via-gray-950 dark:to-gray-900">

            {/* Orbit keyframes injected once */}
            <style>{`
                @keyframes orbit {
                    from { transform: rotate(var(--start)) translateX(var(--radius)) rotate(calc(-1 * var(--start))); }
                    to   { transform: rotate(calc(var(--start) + 360deg)) translateX(var(--radius)) rotate(calc(-1 * (var(--start) + 360deg))); }
                }
            `}</style>

            {/* ── Multi-layer ambient glow ─────────────────────────── */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-[#275085]/[0.04] dark:bg-[#4a9cdb]/[0.06] rounded-full blur-[140px]" />
                <div className="absolute bottom-0 right-1/3 w-[400px] h-[400px] bg-emerald-400/[0.03] dark:bg-emerald-500/[0.04] rounded-full blur-[120px]" />
                <div className="absolute top-1/3 left-0 w-[300px] h-[300px] bg-violet-400/[0.03] dark:bg-violet-500/[0.04] rounded-full blur-[100px]" />
            </div>

            <div className="relative z-10 w-full px-4 md:px-8 flex flex-col lg:flex-row items-center justify-between min-h-[85vh] gap-12 lg:gap-0">
                {/* ── Left Column: Content ─────────────────────────────── */}
                <div className="text-left py-12 pl-6 md:pl-12 xl:pl-20 lg:w-[50%] xl:w-[55%]">

                    {/* ── Badge ────────────────────────────────────────────── */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.4 }}
                        className="mb-6"
                    >
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-[#275085] dark:text-[#4a7ba7] bg-[#275085]/8 dark:bg-[#275085]/10 rounded-full">
                            <GraduationCap className="w-2.5 h-2.5" />
                            For Teachers
                            <span className="ml-1 px-1.5 py-0.5 text-[8px] font-extrabold uppercase tracking-widest bg-amber-400 text-amber-900 rounded">Alpha</span>
                        </span>
                    </motion.div>

                    {/* ── Headline with rotating word ──────────────────────── */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1, duration: 0.6 }}
                        className="mb-8"
                    >
                        <h1 className="text-3xl md:text-5xl lg:text-6xl xl:text-[68px] font-bold tracking-tight leading-[1.08]">
                            <span className="text-[#275085] dark:text-[#4a9cdb]">Your students show up</span>
                            <br />
                            <span className="inline-flex overflow-hidden align-baseline">
                                <AnimatePresence mode="wait">
                                    <motion.span
                                        key={index}
                                        initial={{ y: 60, opacity: 0 }}
                                        animate={{ y: 0, opacity: 1 }}
                                        exit={{ y: -60, opacity: 0 }}
                                        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                                        className={`${ROTATING_WORDS[index].color} whitespace-nowrap`}
                                    >
                                        {ROTATING_WORDS[index].bold}
                                    </motion.span>
                                </AnimatePresence>
                            </span>
                            <span className="text-[#275085] dark:text-[#4a9cdb]">.</span>
                        </h1>
                    </motion.div>

                    {/* ── Subtitle ─────────────────────────────────────────── */}
                    <motion.p
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2, duration: 0.5 }}
                        className="text-xl md:text-2xl text-[#275085]/70 dark:text-[#4a9cdb]/70 max-w-2xl leading-relaxed font-medium mb-10"
                    >
                        TaskTornado syncs with Google Classroom, tracks homework completion, and gives your students a built-in AI tutor — so they come to class ready to learn.
                    </motion.p>

                    {/* ── CTAs ─────────────────────────────────────────────── */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3, duration: 0.4 }}
                        className="flex flex-col sm:flex-row items-start gap-3 mb-8"
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
                            Recommend to your class
                            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                        </Link>
                        <a
                            href="#google-classroom"
                            className="
                                inline-flex items-center gap-2 px-7 py-3
                                text-[#275085]/60 dark:text-gray-400 font-medium text-sm
                                rounded-full border border-[#275085]/20 dark:border-zinc-800
                                hover:text-[#275085] dark:hover:text-white
                                hover:border-[#275085]/40 dark:hover:border-zinc-700
                                transition-all duration-200
                            "
                        >
                            See how it works
                        </a>
                    </motion.div>

                    {/* ── Trust line ───────────────────────────────────────── */}
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1.2, duration: 0.5 }}
                        className="text-[10px] font-medium uppercase tracking-widest text-[#275085]/40 dark:text-zinc-600"
                    >
                        Google Classroom sync · Free for every student · No setup required for teachers
                    </motion.p>
                </div>

                {/* ── Right Column: Visual (Orbit) ──────────────────────── */}
                <div
                    ref={orbitRef}
                    onMouseMove={handleMouseMove}
                    onMouseLeave={handleMouseLeave}
                    className="relative flex items-center justify-center pr-4 md:pr-8 xl:pr-16 lg:w-[45%] xl:w-[40%] h-[500px] lg:h-[700px] overflow-visible"
                >
                    {/* ── Orbit Container ─────────────────────────────────── */}
                    <div className="relative w-full h-full flex items-center justify-center">
                        {/* ── Continuously orbiting chips (desktop) ─────────── */}
                        <div className="hidden lg:block absolute inset-0 pointer-events-none scale-100 xl:scale-110">
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
                                    <div className={`w-max flex items-center gap-2 px-5 py-2.5 ${chip.bg} border ${chip.border} rounded-full shadow-md whitespace-nowrap backdrop-blur-md -translate-x-1/2 -translate-y-1/2 transition-transform hover:scale-110`}>
                                        <chip.icon className={`w-4 h-4 ${chip.accent}`} />
                                        <span className={`text-[13px] font-bold ${chip.accent}`}>{chip.label}</span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* ── Central logo — mouse-reactive ─────────────────── */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.6 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.3, duration: 0.6, type: 'spring', bounce: 0.25 }}
                            className="relative z-20"
                            style={{ x: logoX, y: logoY, perspective: 600 }}
                        >
                            <motion.div
                                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-[#275085]/[0.1] dark:bg-[#4a9cdb]/[0.08] rounded-full blur-[100px] pointer-events-none"
                                style={{ x: logoX, y: logoY }}
                            />

                            <div className="relative w-48 h-48 md:w-64 md:h-64 flex items-center justify-center">
                                <img
                                    src="/TaskTornado.svg"
                                    alt="TaskTornado"
                                    className="w-32 h-32 md:w-48 md:h-48 relative z-20 drop-shadow-[0_25px_60px_rgba(39,80,133,0.35)] transition-transform duration-500 hover:scale-110 dark:hidden"
                                />
                                <img
                                    src="/TaskTornadoDark.svg"
                                    alt="TaskTornado"
                                    className="w-32 h-32 md:w-48 md:h-48 relative z-20 drop-shadow-[0_25px_60px_rgba(74,156,219,0.35)] transition-transform duration-500 hover:scale-110 hidden dark:block"
                                />
                            </div>
                        </motion.div>

                        {/* ── Mobile/Tablet chips (stacked, no orbit) ──────────────── */}
                        <div className="lg:hidden absolute bottom-0 left-0 right-0 flex flex-wrap items-center justify-center gap-2.5 pb-12">
                            {ORBITING_CHIPS.slice(0, 8).map((chip, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.6 + i * 0.08 }}
                                    className={`flex items-center gap-2 px-4 py-2 ${chip.bg} border ${chip.border} rounded-full shadow-sm backdrop-blur-sm`}
                                >
                                    <chip.icon className={`w-3.5 h-3.5 ${chip.accent}`} />
                                    <span className={`text-[12px] font-bold ${chip.accent}`}>{chip.label}</span>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

        </section>
    );
}
