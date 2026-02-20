'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, Shield, GraduationCap, TrendingUp, CalendarCheck, Brain, HeartPulse, BookOpen, BarChart3, Bell } from 'lucide-react';

// ─── Rotating words — parent-focused outcomes ────────────────────────────────────
const ROTATING_WORDS = [
    { bold: 'organized', color: 'text-[#275085] dark:text-[#4a9cdb]' },
    { bold: 'thriving', color: 'text-emerald-500 dark:text-emerald-400' },
    { bold: 'on track', color: 'text-violet-500 dark:text-violet-400' },
    { bold: 'stress-free', color: 'text-amber-500 dark:text-amber-400' },
    { bold: 'supported', color: 'text-rose-500 dark:text-rose-400' },
];

// ─── Orbiting chips — parent-relevant features ──────────────────────────────────
const ORBITING_CHIPS = [
    { icon: Brain, label: 'AI Tutor', accent: 'text-violet-500', bg: 'bg-violet-50 dark:bg-violet-950/30', border: 'border-violet-200/60 dark:border-violet-800/30', startAngle: 0, radius: 185 },
    { icon: CalendarCheck, label: 'Deadlines', accent: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-950/30', border: 'border-blue-200/60 dark:border-blue-800/30', startAngle: 45, radius: 210 },
    { icon: BarChart3, label: 'Grade Trends', accent: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-950/30', border: 'border-emerald-200/60 dark:border-emerald-800/30', startAngle: 90, radius: 185 },
    { icon: BookOpen, label: 'Study Tools', accent: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-950/30', border: 'border-amber-200/60 dark:border-amber-800/30', startAngle: 135, radius: 210 },
    { icon: HeartPulse, label: 'Wellbeing', accent: 'text-rose-500', bg: 'bg-rose-50 dark:bg-rose-950/30', border: 'border-rose-200/60 dark:border-rose-800/30', startAngle: 180, radius: 185 },
    { icon: Bell, label: 'Smart Alerts', accent: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-950/30', border: 'border-orange-200/60 dark:border-orange-800/30', startAngle: 225, radius: 210 },
    { icon: GraduationCap, label: 'Progress', accent: 'text-cyan-500', bg: 'bg-cyan-50 dark:bg-cyan-950/30', border: 'border-cyan-200/60 dark:border-cyan-800/30', startAngle: 270, radius: 185 },
    { icon: TrendingUp, label: 'Streaks', accent: 'text-pink-500', bg: 'bg-pink-50 dark:bg-pink-950/30', border: 'border-pink-200/60 dark:border-pink-800/30', startAngle: 315, radius: 210 },
];

const ORBIT_DURATION = 45;

export default function GuardiansHero() {
    const [index, setIndex] = useState(0);
    const orbitRef = useRef<HTMLDivElement>(null);

    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);
    const springConfig = { stiffness: 150, damping: 20, mass: 0.5 };
    const logoX = useSpring(mouseX, springConfig);
    const logoY = useSpring(mouseY, springConfig);

    const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        if (!orbitRef.current) return;
        const rect = orbitRef.current.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        mouseX.set(((e.clientX - cx) / (rect.width / 2)) * 18);
        mouseY.set(((e.clientY - cy) / (rect.height / 2)) * 14);
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
        <section className="relative min-h-screen flex flex-col justify-center pt-20 pb-10 overflow-hidden bg-transparent dark:bg-gray-950">

            {/* Orbit keyframes */}
            <style>{`
                @keyframes orbit {
                    from { transform: rotate(var(--start)) translateX(var(--radius)) rotate(calc(-1 * var(--start))); }
                    to   { transform: rotate(calc(var(--start) + 360deg)) translateX(var(--radius)) rotate(calc(-1 * (var(--start) + 360deg))); }
                }
            `}</style>

            {/* Ambient glow — warmer tones for parent page */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-[#275085]/[0.04] rounded-full blur-[140px]" />
                <div className="absolute bottom-0 left-1/3 w-[400px] h-[400px] bg-amber-400/[0.03] rounded-full blur-[120px]" />
                <div className="absolute top-1/3 right-0 w-[300px] h-[300px] bg-rose-400/[0.03] rounded-full blur-[100px]" />
            </div>

            <div className="relative z-10 max-w-5xl mx-auto px-5 md:px-8">

                {/* Badge */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="text-center mb-8"
                >
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-[#275085] dark:text-[#4a7ba7] bg-[#275085]/8 dark:bg-[#275085]/10 rounded-full">
                        <Shield className="w-2.5 h-2.5" />
                        For Parents & Guardians
                        <span className="ml-1 px-1.5 py-0.5 text-[8px] font-extrabold uppercase tracking-widest bg-amber-400 text-amber-900 rounded">Alpha</span>
                    </span>
                </motion.div>

                {/* Headline */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1, duration: 0.5 }}
                    className="text-center mb-5"
                >
                    <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.08]">
                        <span className="text-gray-900 dark:text-white">Keep your child</span>
                        <br />
                        <span className="inline-flex overflow-hidden align-baseline min-w-[140px] md:min-w-[220px] lg:min-w-[260px]">
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
                        <span className="text-gray-400 dark:text-zinc-500">.</span>
                    </h1>
                </motion.div>

                {/* Subtitle */}
                <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.4 }}
                    className="text-center text-base md:text-lg text-gray-500 dark:text-gray-400 max-w-lg mx-auto leading-relaxed mb-10"
                >
                    TaskTornado gives your student AI tutoring, smart scheduling, and a homework dashboard — so you can stop worrying and start watching them succeed.
                </motion.p>

                {/* CTAs — parent-focused */}
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
                        Show them TaskTornado
                        <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                    </Link>
                    <Link
                        href="/"
                        className="
                            inline-flex items-center gap-2 px-7 py-3
                            text-gray-500 dark:text-gray-400 font-medium text-sm
                            rounded-full border border-gray-200 dark:border-zinc-800
                            hover:text-gray-900 dark:hover:text-white
                            hover:border-gray-300 dark:hover:border-zinc-700
                            transition-all duration-200
                        "
                    >
                        See the student view
                    </Link>
                </motion.div>

                {/* ── Logo orbit — same wow factor as student hero ────── */}
                <div
                    ref={orbitRef}
                    onMouseMove={handleMouseMove}
                    onMouseLeave={handleMouseLeave}
                    className="relative flex items-center justify-center mx-auto mb-10"
                    style={{ height: 380 }}
                >
                    {/* Orbiting chips */}
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

                    {/* Central logo — mouse reactive */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.6 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.3, duration: 0.6, type: 'spring', bounce: 0.25 }}
                        className="relative z-10"
                        style={{ x: logoX, y: logoY }}
                    >
                        <motion.div
                            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200px] h-[200px] bg-[#275085]/[0.12] rounded-full blur-[60px] pointer-events-none"
                            style={{ x: logoX, y: logoY }}
                        />
                        <div className="relative w-32 h-32 md:w-40 md:h-40 flex items-center justify-center">
                            <img
                                src="/TaskTornado.svg"
                                alt="TaskTornado"
                                className="w-24 h-24 md:w-32 md:h-32 relative z-10 drop-shadow-[0_10px_30px_rgba(39,80,133,0.3)]"
                            />
                        </div>
                    </motion.div>

                    {/* Mobile chips */}
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

                {/* Trust line */}
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.2, duration: 0.5 }}
                    className="text-center text-[10px] font-medium uppercase tracking-widest text-gray-400 dark:text-zinc-600"
                >
                    Free forever · No ads · No data selling · Crisis support built-in
                </motion.p>
            </div>
        </section>
    );
}
