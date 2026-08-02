'use client';

import { motion } from 'framer-motion';
import {
    SiGooglegemini, SiGoogleclassroom, SiGoogledocs, SiGooglecalendar,
    SiGooglesheets, SiGoogletranslate
} from 'react-icons/si';

const REPLACED_APPS = [
    { icon: SiGooglegemini, color: "text-[#8E75B2]", name: "Gemini", replacedBy: "AI tutor (planned)", startAngle: 0, radius: 180 },
    { icon: SiGoogledocs, color: "text-[#4285F4]", name: "Google Docs", replacedBy: "Writing assistant", startAngle: 60, radius: 180 },
    { icon: SiGoogleclassroom, color: "text-[#00897B]", name: "Google Classroom", replacedBy: "Sync (review pending)", startAngle: 120, radius: 180, highlight: true },
    { icon: SiGooglecalendar, color: "text-[#4285F4]", name: "Google Calendar", replacedBy: "Deadline calendar", startAngle: 180, radius: 180 },
    { icon: SiGooglesheets, color: "text-[#0F9D58]", name: "Google Sheets", replacedBy: "Grade calculator", startAngle: 240, radius: 180 },
    { icon: SiGoogletranslate, color: "text-[#4285F4]", name: "Google Translate", replacedBy: "Translation (planned)", startAngle: 300, radius: 180 },
];

export default function GoogleClassroomSection() {
    return (
        <section id="google-classroom" className="py-14 md:py-20 bg-yellow-50 dark:bg-zinc-900 overflow-hidden">
            <div className="max-w-5xl mx-auto px-5 md:px-8">

                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    className="text-center mb-8 md:mb-10"
                >
                    <span className="inline-block px-3 py-1 text-[10px] font-bold uppercase tracking-[0.15em] text-yellow-700 dark:text-yellow-400 bg-yellow-600/5 dark:bg-yellow-400/5 border border-yellow-600/10 dark:border-yellow-400/10 rounded-full mb-6">
                        Planned Integration
                    </span>
                    <h2 className="text-3xl md:text-5xl lg:text-6xl font-semibold text-yellow-500 dark:text-yellow-400 tracking-tight leading-[1.1] mb-4">
                        Google Classroom sync is planned.
                    </h2>
                    <p className="text-base md:text-lg text-yellow-900/60 dark:text-yellow-400/60 max-w-xl mx-auto leading-relaxed font-medium">
                        The connection is disabled until Google OAuth review and
                        production privacy checks are complete. When launched,
                        it will use read-only, least-privilege access.
                    </p>
                </motion.div>

                {/* ── App Orbit Spinner ────────────────────────── */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="relative w-full max-w-2xl mx-auto h-[340px] md:h-[420px] lg:h-[460px] flex items-center justify-center overflow-visible"
                >
                    {/* ── Central logo ─────────────────── */}
                    <div className="relative z-20 flex items-center justify-center w-28 h-28 md:w-36 md:h-36">
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[250px] h-[250px] bg-yellow-500/[0.08] dark:bg-yellow-400/[0.08] rounded-full blur-[60px] pointer-events-none" />
                        <img
                            src="/2.svg"
                            alt="TaskTornado"
                            className="w-20 h-20 md:w-28 md:h-28 relative z-20 drop-shadow-[0_15px_30px_rgba(39,80,133,0.25)] dark:hidden transition-transform duration-500 hover:scale-110"
                        />
                        <img
                            src="/3.svg"
                            alt="TaskTornado"
                            className="w-20 h-20 md:w-28 md:h-28 relative z-20 drop-shadow-[0_15px_30px_rgba(74,156,219,0.3)] hidden dark:block transition-transform duration-500 hover:scale-110"
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
                                <div className="absolute top-0 right-6 bottom-0 left-[60px] bg-gradient-to-r from-transparent to-yellow-500/15 dark:to-yellow-400/15 overflow-hidden">
                                    <div
                                        className="absolute top-0 bottom-0 w-8 bg-gradient-to-r from-transparent via-yellow-500 dark:via-yellow-400 to-transparent"
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
                                    <div className={`w-12 h-12 md:w-14 md:h-14 bg-white dark:bg-zinc-800 rounded-full flex items-center justify-center transition-transform hover:scale-110 ${app.highlight ? 'shadow-lg shadow-yellow-500/20 border-2 border-yellow-500 dark:border-yellow-400 relative z-10' : 'shadow-md border border-yellow-500/10 dark:border-zinc-700/50'}`}>
                                        {app.highlight && (
                                            <div className="absolute inset-0 rounded-full bg-yellow-500/10 dark:bg-yellow-400/10 animate-pulse pointer-events-none" />
                                        )}
                                        <app.icon
                                            className={`w-6 h-6 md:w-7 md:h-7 ${app.color} relative z-10`}
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

                {/* Bottom note */}
                <motion.p
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.4 }}
                    className="text-center text-sm text-yellow-900/40 dark:text-yellow-400/40 mt-4 max-w-md mx-auto font-medium"
                >
                    Your students set up their account in seconds — just point them to TaskTornado and everything connects.
                </motion.p>
            </div>
        </section>
    );
}
