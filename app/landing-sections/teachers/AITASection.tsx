'use client';

import { useRef, useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import Image from 'next/image';
import { TeacherAuroraDemo } from '@/components/TeacherAuroraDemo';

export default function AITASection() {
    const squiggleRef = useRef<HTMLSpanElement>(null);
    const [isDarkMode, setIsDarkMode] = useState(false);

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
        `linear-gradient(to right, #10b981 ${v}%, ${isDarkMode ? 'rgba(16,185,129,0.3)' : 'rgba(16,185,129,0.2)'} ${v}%)`
    );

    return (
        <section className="py-20 md:py-28 bg-emerald-50 dark:bg-gray-950 overflow-hidden">
            <div className="max-w-6xl mx-auto px-5 md:px-8">

                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    className="text-center mb-14 md:mb-16"
                >
                    <span className="inline-block px-3 py-1 text-[10px] font-bold uppercase tracking-[0.15em] text-emerald-600 dark:text-emerald-400 bg-emerald-600/5 dark:bg-emerald-400/5 border border-emerald-600/10 dark:border-emerald-400/10 rounded-full mb-6">
                        After-Hours Help
                    </span>
                    <h2 className="text-3xl md:text-5xl lg:text-6xl font-semibold text-emerald-500 dark:text-emerald-400 tracking-tight leading-[1.15] mb-4">
                        Help that never<br />
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
                            clocks out.
                            <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 300 10" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
                                <motion.path
                                    d="M2 6 C 10 2, 18 2, 26 6 S 42 10, 50 6 S 66 2, 74 6 S 90 10, 98 6 S 114 2, 122 6 S 138 10, 146 6 S 162 2, 170 6 S 186 10, 194 6 S 210 2, 218 6 S 234 10, 242 6 S 258 2, 266 6 S 282 10, 298 6"
                                    stroke="#10b981"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    fill="none"
                                    style={{ pathLength }}
                                />
                            </svg>
                        </motion.span>
                    </h2>
                    <p className="text-base md:text-lg text-emerald-900/60 dark:text-emerald-400/60 max-w-xl mx-auto leading-relaxed font-medium mt-2">
                        Aurora meets students where they are — guiding them through concepts with thoughtful questions, never handing out answers.
                    </p>
                </motion.div>

                {/* 2-col: Aurora demo left, Robot image right */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-12 items-center">

                    {/* Left — Aurora Demo Chat */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="h-[520px] md:h-[560px]"
                    >
                        <TeacherAuroraDemo />
                    </motion.div>

                    {/* Right — Robot illustration */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1, duration: 0.6 }}
                        className="flex justify-center"
                    >
                        <div className="relative w-72 h-72 md:w-96 md:h-96 lg:w-[440px] lg:h-[440px] pointer-events-none">
                            <Image
                                src="/aurora-robot.png"
                                alt="Aurora AI robot illustration"
                                fill
                                className="object-contain drop-shadow-2xl"
                            />
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
