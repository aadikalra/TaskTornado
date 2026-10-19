'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Star } from 'lucide-react';
import {
    SiOpenai, SiGoogleclassroom, SiGoogledocs, SiGooglecalendar,
    SiQuizlet, SiGooglesheets, SiGrammarly, SiGoogletranslate,
    SiDiscord, SiReddit, SiKahoot
} from 'react-icons/si';

const STATS = [
    { value: '12+', label: 'Built-in tools' },
    { value: '100%', label: 'Free, forever' },
    { value: '0', label: 'Ads or trackers' },
];

const REPLACED_APPS = [
    { icon: SiOpenai, color: "text-[#10A37F]", name: "ChatGPT", replacedBy: "AI Tutor (Aurora)", startAngle: 0, radius: 180 },
    { icon: SiDiscord, color: "text-[#5865F2]", name: "Discord", replacedBy: "Study groups / group chats", startAngle: 30, radius: 180 },
    { icon: SiGoogledocs, color: "text-[#4285F4]", name: "Google Docs", replacedBy: "Writing assistant", startAngle: 60, radius: 180 },
    { icon: SiGoogleclassroom, color: "text-[#00897B]", name: "Google Classroom", replacedBy: "Homework + Class tracking", startAngle: 90, radius: 180 },
    { icon: Star, color: "text-[#F4B400]", name: "Favorites", replacedBy: "Bookmarks / web saves", fill: true, startAngle: 120, radius: 180 },
    { icon: SiGooglecalendar, color: "text-[#4285F4]", name: "Google Calendar", replacedBy: "Deadline calendar", startAngle: 150, radius: 180 },
    { icon: SiGrammarly, color: "text-[#15C39A]", name: "Grammarly", replacedBy: "Writing assistant", startAngle: 180, radius: 180 },
    { icon: SiReddit, color: "text-[#FF4500]", name: "Reddit", replacedBy: "Discussion boards", startAngle: 210, radius: 180 },
    { icon: SiQuizlet, color: "text-[#4255FF]", name: "Quizlet", replacedBy: "Flashcards", startAngle: 240, radius: 180 },
    { icon: SiGooglesheets, color: "text-[#0F9D58]", name: "Google Sheets", replacedBy: "Grade calculator", startAngle: 270, radius: 180 },
    { icon: SiKahoot, color: "text-[#4617B4]", name: "Kahoot", replacedBy: "Quizzes / games", startAngle: 300, radius: 180 },
    { icon: SiGoogletranslate, color: "text-[#4285F4]", name: "Google Translate", replacedBy: "Translation", startAngle: 330, radius: 180 },
];

export default function SocialProofSection() {
    return (
        <section className="py-20 md:py-28 bg-blue-50 dark:bg-zinc-950 overflow-hidden">
            <div className="max-w-6xl mx-auto px-5 md:px-8">

                {/* ── Header ──────────────────────────────────────────── */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    className="text-center mb-16 md:mb-20"
                >
                    <span className="inline-block px-3 py-1 text-[10px] font-bold uppercase tracking-[0.15em] text-blue-500 dark:text-blue-400 bg-blue-500/5 dark:bg-blue-400/5 border border-blue-500/10 dark:border-blue-400/10 rounded-full mb-6">
                        The Origin Story
                    </span>
                    <h2 className="text-[40px] sm:text-5xl lg:text-[56px] font-semibold text-blue-500 dark:text-blue-400 tracking-tight leading-[1.1] mb-6">
                        Built with students<br />
                        in mind, always.
                    </h2>
                    <p className="text-base md:text-lg text-blue-500/70 dark:text-blue-400/70 max-w-2xl mx-auto leading-relaxed font-medium mb-10">
                        TaskTornado started as a frustrated student&apos;s side project — one app to replace a handful of tools that never talked to each other.
                    </p>

                </motion.div>

                {/* ── Main Layout: Quote (Left) & Spinner (Right) ──────── */}
                <div className="flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-16 mb-20">

                    {/* ── Founder quote card (Left) ────────────────────────── */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1, duration: 0.5 }}
                        className="w-full lg:w-[45%] max-w-2xl mx-auto lg:mx-0"
                    >
                        <div className="relative bg-white dark:bg-zinc-800/50 border border-gray-200 dark:border-zinc-700/50 rounded-[24px] p-7 md:p-9 shadow-lg shadow-gray-200/30 dark:shadow-black/20">
                            {/* Ambient glow */}
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-blue-500/[0.04] rounded-full blur-[80px] pointer-events-none" />

                            {/* Quote mark */}
                            <div className="relative z-10">
                                <div className="text-5xl font-serif text-blue-500/20 dark:text-blue-400/20 leading-none mb-3">&ldquo;</div>
                                <p className="text-lg md:text-xl text-blue-500/80 dark:text-blue-400/80 font-medium leading-relaxed mb-6">
                                    I was using Google Calendar for deadlines, Quizlet for flashcards, ChatGPT for help, and Notion for notes. Nothing talked to each other. I built TaskTornado so students could have <span className="font-bold text-blue-500 dark:text-blue-400">one app that does it all</span> — and I made it free because students shouldn&apos;t have to pay for the tools they need to succeed.
                                </p>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-blue-500/10 dark:bg-blue-500/20 flex items-center justify-center">
                                         <img src="/2.svg" alt="" className="w-6 h-6 dark:hidden" />
                                         <img src="/3.svg" alt="" className="w-6 h-6 hidden dark:block" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-blue-500 dark:text-blue-400">Aadi Kalra</p>
                                        <p className="text-[11px] text-blue-500/60 dark:text-blue-400/60">Founder & Student</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* ── App Orbit Spinner (Right) ────────────────────────── */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="relative w-full lg:w-[50%] h-[400px] md:h-[500px] lg:h-[550px] flex items-center justify-center overflow-visible"
                    >
                        {/* ── Central logo ─────────────────── */}
                        <div className="relative z-20 flex items-center justify-center w-28 h-28 md:w-36 md:h-36">
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[250px] h-[250px] bg-blue-500/[0.08] dark:bg-blue-400/[0.08] rounded-full blur-[60px] pointer-events-none" />
                            <img
                                src="/2.svg"
                                alt="TaskTornado"
                                className="w-20 h-20 md:w-28 md:h-28 relative z-20 drop-shadow-[0_15px_30px_rgba(59,130,246,0.3)] dark:hidden transition-transform duration-500 hover:scale-110"
                            />
                            <img
                                src="/3.svg"
                                alt="TaskTornado"
                                className="w-20 h-20 md:w-28 md:h-28 relative z-20 drop-shadow-[0_15px_30px_rgba(96,165,250,0.3)] hidden dark:block transition-transform duration-500 hover:scale-110"
                            />
                        </div>

                        {/* ── Orbiting Apps ─────────── */}
                        <div className="absolute inset-0 pointer-events-none scale-90 md:scale-100">
                            <style>{`
                                @keyframes orbit-spoke {
                                    from { transform: rotate(var(--start)); }
                                    to   { transform: rotate(calc(var(--start) + 360deg)); }
                                }
                                @keyframes spoke-shimmer {
                                    0% { left: 100%; opacity: 0; }
                                    10% { opacity: 1; }
                                    50% { opacity: 1; }
                                    60% { left: -50%; opacity: 0; }
                                    100% { left: -50%; opacity: 0; }
                                }
                            `}</style>

                            {/* Spokes */}
                            {REPLACED_APPS.map((app, i) => (
                                <div
                                    key={`spoke-${i}`}
                                    className="absolute top-1/2 left-1/2 h-[1px] pointer-events-none origin-left"
                                    style={{
                                        width: `${app.radius}px`,
                                        ['--start' as string]: `${app.startAngle}deg`,
                                        animation: `orbit-spoke 45s linear infinite`,
                                    }}
                                >
                                    <div className="absolute top-0 right-6 bottom-0 left-[60px] bg-gradient-to-r from-transparent to-blue-500/15 dark:to-blue-400/15 overflow-hidden">
                                        <div
                                            className="absolute top-0 bottom-0 w-8 bg-gradient-to-r from-transparent via-blue-500 dark:via-blue-400 to-transparent"
                                            style={{
                                                animation: `spoke-shimmer 3s linear infinite`,
                                            }}
                                        />
                                    </div>
                                </div>
                            ))}

                            {/* Icons */}
                            {REPLACED_APPS.map((app, i) => (
                                <div
                                    key={`icon-${i}`}
                                    className="absolute"
                                    style={{
                                        left: '50%',
                                        top: '50%',
                                        marginLeft: -1,
                                        marginTop: -1,
                                        width: 2,
                                        height: 2,
                                        ['--start' as string]: `${app.startAngle}deg`,
                                        ['--radius' as string]: `${app.radius}px`,
                                        animation: `orbit 45s linear infinite`,
                                    }}
                                >
                                    <div className="absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2 group pointer-events-auto cursor-default">
                                        {/* Icon pill wrapper */}
                                        <div className="w-12 h-12 md:w-14 md:h-14 bg-white dark:bg-zinc-800 rounded-full shadow-md border border-gray-100 dark:border-zinc-700/50 flex items-center justify-center transition-transform hover:scale-110">
                                            <app.icon
                                                className={`w-6 h-6 md:w-7 md:h-7 ${app.color}`}
                                                style={app.fill ? { fill: 'currentColor' } : {}}
                                            />
                                        </div>

                                        {/* Hover Tooltip */}
                                        <div className="absolute -top-16 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none whitespace-nowrap z-30 flex flex-col items-center">
                                            <div className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 border border-white/10 dark:border-black/10 shadow-xl rounded-lg px-3 py-1.5 flex flex-col items-center">
                                                <span className="text-[9px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-0.5">
                                                    Replaces {app.name}
                                                </span>
                                                <span className="text-xs font-bold leading-none">
                                                    {app.replacedBy}
                                                </span>
                                            </div>
                                            <div className="w-2 h-2 bg-gray-900 dark:bg-white rotate-45 -mt-1 border-r border-b border-white/10 dark:border-black/10" />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </div>

                {/* ── Stats row ────────────────────────────────────────── */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="grid grid-cols-3 gap-6 md:gap-12 max-w-2xl mx-auto"
                >
                    {STATS.map((stat, i) => (
                        <div key={i} className="text-center">
                            <p className="text-3xl md:text-5xl font-bold text-blue-500 dark:text-blue-400 tracking-tight mb-1">
                                {stat.value}
                            </p>
                            <p className="text-xs md:text-sm font-semibold text-blue-500/50 dark:text-blue-400/50 uppercase tracking-widest">
                                {stat.label}
                            </p>
                        </div>
                    ))}
                </motion.div>
            </div>
        </section >
    );
}
