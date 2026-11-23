'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import HeroWaves from './HeroWaves';
import styles from './Hero.module.css';

import { Brain, CalendarCheck, BookOpen, LayoutGrid, PenTool, Languages, Calculator, Users, MessageSquare, Timer, Bookmark, Gamepad2 } from 'lucide-react';

// ─── Rotating word pairs ─────────────────────────────────────────────────────────
const ROTATING_WORDS = [
    { bold: 'organized', color: 'text-[#4f7d18] dark:text-[#b5d565]' },
    { bold: 'ahead', color: 'text-[#4f7d18] dark:text-[#b5d565]' },
    { bold: 'unstoppable', color: 'text-[#4f7d18] dark:text-[#b5d565]' },
    { bold: 'stress-free', color: 'text-[#4f7d18] dark:text-[#b5d565]' },
    { bold: 'on track', color: 'text-[#4f7d18] dark:text-[#b5d565]' },
];

// ─── Orbiting feature chips — real app features from the DockNav ─────────────────
const ORBITING_CHIPS = [
    { icon: Brain, label: 'Aurora AI', accent: 'text-violet-700 dark:text-violet-300', bg: 'bg-violet-50 dark:bg-violet-950/60', border: 'border-violet-200/60 dark:border-violet-800/40', startAngle: 0, radius: 185 },
    { icon: CalendarCheck, label: 'Calendar', accent: 'text-blue-700 dark:text-blue-300', bg: 'bg-blue-50 dark:bg-blue-950/60', border: 'border-blue-200/60 dark:border-blue-800/40', startAngle: 30, radius: 215 },
    { icon: BookOpen, label: 'Flashcards', accent: 'text-amber-700 dark:text-amber-300', bg: 'bg-amber-50 dark:bg-amber-950/60', border: 'border-amber-200/60 dark:border-amber-800/40', startAngle: 60, radius: 185 },
    { icon: LayoutGrid, label: 'Quizzes', accent: 'text-indigo-700 dark:text-indigo-300', bg: 'bg-indigo-50 dark:bg-indigo-950/60', border: 'border-indigo-200/60 dark:border-indigo-800/40', startAngle: 90, radius: 215 },
    { icon: PenTool, label: 'Writing', accent: 'text-pink-700 dark:text-pink-300', bg: 'bg-pink-50 dark:bg-pink-950/60', border: 'border-pink-200/60 dark:border-pink-800/40', startAngle: 120, radius: 185 },
    { icon: Languages, label: 'Translate', accent: 'text-sky-700 dark:text-sky-300', bg: 'bg-sky-50 dark:bg-sky-950/60', border: 'border-sky-200/60 dark:border-sky-800/40', startAngle: 150, radius: 215 },
    { icon: Calculator, label: 'Grades', accent: 'text-emerald-700 dark:text-emerald-300', bg: 'bg-emerald-50 dark:bg-emerald-950/60', border: 'border-emerald-200/60 dark:border-emerald-800/40', startAngle: 180, radius: 185 },
    { icon: Users, label: 'Groups', accent: 'text-cyan-700 dark:text-cyan-300', bg: 'bg-cyan-50 dark:bg-cyan-950/60', border: 'border-cyan-200/60 dark:border-cyan-800/40', startAngle: 210, radius: 215 },
    { icon: MessageSquare, label: 'Discuss', accent: 'text-teal-700 dark:text-teal-300', bg: 'bg-teal-50 dark:bg-teal-950/60', border: 'border-teal-200/60 dark:border-teal-800/40', startAngle: 240, radius: 185 },
    { icon: Timer, label: 'Study Timer', accent: 'text-orange-700 dark:text-orange-300', bg: 'bg-orange-50 dark:bg-orange-950/60', border: 'border-orange-200/60 dark:border-orange-800/40', startAngle: 270, radius: 215 },
    { icon: Bookmark, label: 'Web Saves', accent: 'text-rose-700 dark:text-rose-300', bg: 'bg-rose-50 dark:bg-rose-950/60', border: 'border-rose-200/60 dark:border-rose-800/40', startAngle: 300, radius: 185 },
    { icon: Gamepad2, label: 'Games', accent: 'text-fuchsia-700 dark:text-fuchsia-300', bg: 'bg-fuchsia-50 dark:bg-fuchsia-950/60', border: 'border-fuchsia-200/60 dark:border-fuchsia-800/40', startAngle: 330, radius: 215 },
];

const ORBIT_DURATION = 45; // seconds for a full revolution

export default function Hero() {
    const [index, setIndex] = useState(0);
    const orbitRef = useRef<HTMLDivElement>(null);
    const logoWrapRef = useRef<HTMLDivElement>(null);

    const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        if (!orbitRef.current || !logoWrapRef.current) return;
        const rect = orbitRef.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const nx = (e.clientX - centerX) / (rect.width / 2);
        const ny = (e.clientY - centerY) / (rect.height / 2);
        logoWrapRef.current.style.transform = `translate3d(${(nx * 18).toFixed(1)}px, ${(ny * 14).toFixed(1)}px, 0)`;
    }, []);

    const handleMouseLeave = useCallback(() => {
        if (!logoWrapRef.current) return;
        logoWrapRef.current.style.transform = 'translate3d(0, 0, 0)';
    }, []);

    useEffect(() => {
        const interval = setInterval(() => {
            setIndex(prev => (prev + 1) % ROTATING_WORDS.length);
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    return (
        <section className={`${styles.hero} relative min-h-svh flex flex-col justify-center pt-20 pb-24 lg:pb-10 overflow-hidden`}>
            <HeroWaves />

            {/* Orbit & word-swap keyframes injected once */}
            <style>{`
                @keyframes orbit {
                    from { transform: rotate(var(--start)) translateX(var(--radius)) rotate(calc(-1 * var(--start))); }
                    to   { transform: rotate(calc(var(--start) + 360deg)) translateX(var(--radius)) rotate(calc(-1 * (var(--start) + 360deg))); }
                }
                @keyframes word-in {
                    from { transform: translateY(36%); opacity: 0; }
                    to   { transform: translateY(0); opacity: 1; }
                }
            `}</style>

            {/* ── Multi-layer ambient glow (zero-blur radial gradients for fast paint) ── */}
            <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
                <div
                    className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[700px] rounded-full opacity-60 dark:opacity-100"
                    style={{ background: 'radial-gradient(circle, rgba(74,156,219,0.08) 0%, transparent 65%)' }}
                />
                <div
                    className="absolute bottom-0 left-1/4 w-[500px] h-[500px] rounded-full"
                    style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.06) 0%, transparent 65%)' }}
                />
                <div
                    className="absolute top-1/3 right-0 w-[400px] h-[400px] rounded-full"
                    style={{ background: 'radial-gradient(circle, rgba(16,185,129,0.06) 0%, transparent 65%)' }}
                />
            </div>

            <div className="relative z-10 w-full px-4 md:px-8 flex flex-col lg:flex-row items-center justify-between gap-3 md:gap-6 lg:gap-0">
                {/* ── Left Column: Content ─────────────────────────────── */}
                <div className="text-left pt-8 sm:pt-12 lg:py-12 px-2 sm:pl-6 md:pl-12 xl:pl-[4.25vw] lg:w-[50%] xl:w-[55%]">
                    {/* ── Headline with rotating word ──────────────────────── */}
                    <div className="mb-5 sm:mb-8">
                        <h1 className="text-3xl md:text-5xl lg:text-[clamp(2.5rem,4.25vw,4.75rem)] font-bold tracking-tight leading-[1.08]">
                            <span className="text-[#275085] dark:text-[#7ec0f2]">Everything you need</span>
                            <br />
                            <span className="text-[#275085] dark:text-[#7ec0f2]">to stay </span>
                            <span className="inline-flex overflow-hidden align-baseline">
                                <span
                                    key={index}
                                    style={index > 0 ? { animation: 'word-in 0.4s cubic-bezier(0.16, 1, 0.3, 1) both' } : undefined}
                                    className={`${ROTATING_WORDS[index].color} whitespace-nowrap`}
                                >
                                    {ROTATING_WORDS[index].bold}
                                </span>
                            </span>
                            <span className="text-[#275085] dark:text-[#7ec0f2]">.</span>
                        </h1>
                    </div>

                    {/* ── Subtitle ─────────────────────────────────────────── */}
                    <p className="text-base sm:text-xl md:text-2xl text-[#275085]/85 dark:text-[#9bd0f7] max-w-2xl leading-relaxed font-medium">
                        TaskTornado is a free student planner for tracking homework, classes, and deadlines, with study help from Aurora AI.
                    </p>
                </div>

                {/* ── Right Column: Visual (Orbit) ──────────────────────── */}
                <div
                    ref={orbitRef}
                    onMouseMove={handleMouseMove}
                    onMouseLeave={handleMouseLeave}
                    className="relative flex w-full items-center justify-center lg:pr-8 xl:pr-16 lg:w-[45%] xl:w-[40%] lg:h-[clamp(32rem,72svh,43.75rem)] overflow-visible"
                >
                    {/* ── Orbit Container ─────────────────────────────────── */}
                    <div className="relative w-full lg:h-full flex flex-col items-center justify-center">
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
                                    <div className={`w-max flex items-center gap-2 px-5 py-2.5 ${chip.bg} border ${chip.border} rounded-full shadow-md whitespace-nowrap -translate-x-1/2 -translate-y-1/2 transition-transform hover:scale-110`}>
                                        <chip.icon aria-hidden="true" className={`w-4 h-4 ${chip.accent}`} />
                                        <span className={`text-[13px] font-bold ${chip.accent}`}>{chip.label}</span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* ── Central logo — mouse-reactive ─────────────────── */}
                        <div
                            ref={logoWrapRef}
                            className="relative z-20 transition-transform duration-300 ease-out"
                        >
                            <div
                                aria-hidden="true"
                                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[360px] h-[360px] rounded-full pointer-events-none"
                                style={{ background: 'radial-gradient(circle, rgba(74,156,219,0.14) 0%, transparent 65%)' }}
                            />

                            <div className="relative w-36 h-36 sm:w-48 sm:h-48 md:w-64 md:h-64 flex items-center justify-center">
                                <picture className="relative z-20 block w-32 h-32 md:w-48 md:h-48">
                                    <source
                                        media="(prefers-color-scheme: dark)"
                                        srcSet="/logo-dark.webp"
                                        type="image/webp"
                                    />
                                    <img
                                        src="/logo-light.webp"
                                        alt="TaskTornado"
                                        width={192}
                                        height={192}
                                        fetchPriority="high"
                                        decoding="sync"
                                        className="w-32 h-32 md:w-48 md:h-48 drop-shadow-[0_18px_36px_rgba(39,80,133,0.3)] dark:drop-shadow-[0_18px_36px_rgba(74,156,219,0.3)] transition-transform duration-500 hover:scale-110"
                                    />
                                </picture>
                            </div>
                        </div>

                        {/* ── Mobile/Tablet chips (stacked, no orbit) ──────────────── */}
                        <div className="lg:hidden flex flex-wrap items-center justify-center gap-2.5">
                            {ORBITING_CHIPS.slice(0, 8).map((chip, i) => (
                                <div
                                    key={i}
                                    className={`flex items-center gap-2 px-4 py-2 ${chip.bg} border ${chip.border} rounded-full shadow-sm`}
                                >
                                    <chip.icon aria-hidden="true" className={`w-3.5 h-3.5 ${chip.accent}`} />
                                    <span className={`text-[12px] font-bold ${chip.accent}`}>{chip.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

        </section>
    );
}
