'use client';

import { motion } from 'framer-motion';

// ─── Integration logos as lightweight inline SVG-style components ─────────────────
// Using simplified, muted brand marks for credibility without heavy assets.

function GoogleClassroomLogo() {
    return (
        <div className="flex items-center gap-2.5">
            <svg width="28" height="28" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="opacity-80 group-hover:opacity-100 transition-opacity duration-300">
                <rect x="4" y="6" width="40" height="36" rx="4" fill="#0F9D58" opacity="0.2" />
                <rect x="4" y="6" width="40" height="36" rx="4" stroke="#0F9D58" strokeWidth="2.5" opacity="0.6" />
                <circle cx="24" cy="20" r="5" fill="#0F9D58" opacity="0.5" />
                <path d="M16 34c0-4.4 3.6-8 8-8s8 3.6 8 8" stroke="#0F9D58" strokeWidth="2.5" strokeLinecap="round" opacity="0.5" />
                <circle cx="34" cy="18" r="3" fill="#0F9D58" opacity="0.4" />
                <circle cx="14" cy="18" r="3" fill="#0F9D58" opacity="0.4" />
            </svg>
            <span className="text-sm font-bold text-[#275085]/70 dark:text-[#4a9cdb]/70 group-hover:text-[#275085] dark:group-hover:text-[#4a9cdb] transition-colors duration-300 whitespace-nowrap">
                Google Classroom
            </span>
        </div>
    );
}

function GoogleCalendarLogo() {
    return (
        <div className="flex items-center gap-2.5">
            <svg width="28" height="28" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="opacity-80 group-hover:opacity-100 transition-opacity duration-300">
                <rect x="6" y="10" width="36" height="32" rx="3" fill="#4285F4" opacity="0.18" />
                <rect x="6" y="10" width="36" height="32" rx="3" stroke="#4285F4" strokeWidth="2.5" opacity="0.6" />
                <rect x="6" y="10" width="36" height="8" rx="3" fill="#4285F4" opacity="0.3" />
                <line x1="14" y1="6" x2="14" y2="14" stroke="#4285F4" strokeWidth="3" strokeLinecap="round" opacity="0.6" />
                <line x1="34" y1="6" x2="34" y2="14" stroke="#4285F4" strokeWidth="3" strokeLinecap="round" opacity="0.6" />
                {/* Calendar grid dots */}
                <circle cx="16" cy="26" r="1.5" fill="#4285F4" opacity="0.5" />
                <circle cx="24" cy="26" r="1.5" fill="#4285F4" opacity="0.5" />
                <circle cx="32" cy="26" r="1.5" fill="#4285F4" opacity="0.5" />
                <circle cx="16" cy="34" r="1.5" fill="#4285F4" opacity="0.5" />
                <circle cx="24" cy="34" r="1.5" fill="#4285F4" opacity="0.5" />
                <circle cx="32" cy="34" r="1.5" fill="#4285F4" opacity="0.5" />
            </svg>
            <span className="text-sm font-bold text-[#275085]/70 dark:text-[#4a9cdb]/70 group-hover:text-[#275085] dark:group-hover:text-[#4a9cdb] transition-colors duration-300 whitespace-nowrap">
                Google Calendar
            </span>
        </div>
    );
}

function PowerSchoolLogo() {
    return (
        <div className="flex items-center gap-2.5">
            <svg width="28" height="28" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="opacity-80 group-hover:opacity-100 transition-opacity duration-300">
                <circle cx="24" cy="24" r="18" fill="#F26522" opacity="0.18" />
                <circle cx="24" cy="24" r="18" stroke="#F26522" strokeWidth="2.5" opacity="0.6" />
                <text x="24" y="31" textAnchor="middle" fontSize="20" fontStyle="italic" fontWeight="900" fill="#F26522" opacity="0.7">P</text>
            </svg>
            <span className="text-sm font-bold text-[#275085]/70 dark:text-[#4a9cdb]/70 group-hover:text-[#275085] dark:group-hover:text-[#4a9cdb] transition-colors duration-300 whitespace-nowrap">
                PowerSchool
            </span>
        </div>
    );
}

const INTEGRATIONS = [
    { key: 'classroom', Component: GoogleClassroomLogo },
    { key: 'calendar', Component: GoogleCalendarLogo },
    { key: 'powerschool', Component: PowerSchoolLogo },
];

export default function TrustBarSection() {
    return (
        <section className="py-10 md:py-14 bg-[#FCFDF5] dark:bg-zinc-950 overflow-hidden">
            <div className="max-w-5xl mx-auto px-5 md:px-8">
                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    className="text-center"
                >
                    {/* Headline */}
                    <p className="text-sm md:text-base font-bold text-[#275085]/60 dark:text-[#4a9cdb]/60 tracking-wide mb-8 md:mb-10">
                        Syncs with the tools your school already uses
                    </p>

                    {/* Logo Row */}
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-10 md:gap-14">
                        {INTEGRATIONS.map(({ key, Component }, i) => (
                            <motion.div
                                key={key}
                                initial={{ opacity: 0, y: 8 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.1 + i * 0.1, duration: 0.4 }}
                                className="group flex items-center cursor-default"
                            >
                                <Component />
                            </motion.div>
                        ))}
                    </div>

                    {/* Subtle divider */}
                    <div className="mt-10 md:mt-14 mx-auto w-16 h-px bg-[#275085]/30 dark:bg-[#4a9cdb]/30" />
                </motion.div>
            </div>
        </section>
    );
}
