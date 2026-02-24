'use client';

import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default function TeachersFinalCTA() {
    return (
        <section className="relative py-24 md:py-32 bg-orange-50 dark:bg-gray-950 overflow-hidden">

            {/* Ambient glow */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-orange-500/[0.04] rounded-full blur-[120px]" />
                <div className="absolute bottom-0 right-1/4 w-[300px] h-[300px] bg-amber-400/[0.05] rounded-full blur-[100px]" />
            </div>

            <div className="relative z-10 max-w-7xl mx-auto px-5 md:px-8">

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 items-center">

                    {/* Left — Content */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                    >
                        <span className="inline-block px-3 py-1 text-[10px] font-bold uppercase tracking-[0.15em] text-orange-900/70 dark:text-orange-400 bg-orange-900/5 dark:bg-orange-400/5 border border-orange-900/10 dark:border-orange-400/10 rounded-full mb-6">
                            Get Started
                        </span>

                        <h2 className="text-3xl md:text-4xl lg:text-5xl font-semibold text-orange-500 dark:text-orange-400 tracking-tight leading-[1.1] mb-5">
                            Share it with your class.
                        </h2>

                        <p className="text-base md:text-lg text-orange-900/60 dark:text-orange-400/60 max-w-lg leading-relaxed font-medium mb-8">
                            Students sign up in seconds, Google Classroom connects seamlessly, and you get to watch your classroom transform — one prepared student at a time.
                        </p>

                        {/* CTAs */}
                        <div className="flex flex-col sm:flex-row items-start gap-3 mb-8">
                            <Link
                                href="/signup"
                                className="
                                    group inline-flex items-center gap-2 px-8 py-3.5
                                    bg-orange-600 hover:bg-orange-700
                                    text-white font-bold text-sm
                                    rounded-full transition-all duration-200
                                    shadow-lg shadow-orange-600/20 hover:shadow-xl hover:shadow-orange-600/30
                                "
                            >
                                Recommend TaskTornado
                                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                            </Link>
                            <Link
                                href="/guardians"
                                className="
                                    inline-flex items-center gap-2 px-7 py-3.5
                                    text-orange-900/60 dark:text-orange-400/60 font-medium text-sm
                                    rounded-full border border-orange-900/15 dark:border-orange-400/15
                                    hover:text-orange-900 dark:hover:text-orange-400
                                    hover:border-orange-900/30 dark:hover:border-orange-400/30
                                    transition-all duration-200
                                "
                            >
                                See the parent view
                            </Link>
                        </div>

                        {/* Trust badges */}
                        <div className="flex flex-wrap items-start gap-x-5 gap-y-2">
                            {[
                                'Google Classroom sync',
                                'Free forever',
                                'No data selling',
                                'Socratic AI only',
                            ].map((badge, i) => (
                                <span key={i} className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-orange-900/40 dark:text-orange-400/40">
                                    <svg className="w-3 h-3 text-[#8bc34a]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                    </svg>
                                    {badge}
                                </span>
                            ))}
                        </div>
                    </motion.div>

                    {/* Right — Illustration */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1, duration: 0.6 }}
                        className="flex justify-center"
                    >
                        <div className="relative w-72 h-72 md:w-96 md:h-96 lg:w-[480px] lg:h-[480px] pointer-events-none">
                            <Image
                                src="/teachers-share.png"
                                alt="Share TaskTornado with your class"
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
