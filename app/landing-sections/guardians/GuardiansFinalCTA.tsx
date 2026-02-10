'use client';

import { motion } from 'framer-motion';
import { ArrowRight, Shield, Heart } from 'lucide-react';
import Link from 'next/link';

export default function GuardiansFinalCTA() {
    return (
        <section className="relative py-24 md:py-32 bg-white dark:bg-gray-950 overflow-hidden">

            {/* Ambient glow */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-[#275085]/[0.05] rounded-full blur-[120px]" />
                <div className="absolute bottom-0 right-1/4 w-[300px] h-[300px] bg-amber-400/[0.03] rounded-full blur-[100px]" />
            </div>

            <div className="relative z-10 max-w-3xl mx-auto px-5 md:px-8 text-center">

                {/* Icon cluster */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    className="flex items-center justify-center gap-3 mb-8"
                >
                    <div className="w-12 h-12 rounded-2xl bg-[#275085]/10 dark:bg-[#275085]/15 flex items-center justify-center">
                        <Shield className="w-6 h-6 text-[#275085] dark:text-[#4a9cdb]" />
                    </div>
                    <div className="w-14 h-14 rounded-2xl bg-rose-50 dark:bg-rose-950/20 flex items-center justify-center border-2 border-rose-100 dark:border-rose-800/30">
                        <Heart className="w-7 h-7 text-rose-500" />
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-[#275085]/10 dark:bg-[#275085]/15 flex items-center justify-center">
                        <img src="/TaskTornado.svg" alt="" className="w-6 h-6" />
                    </div>
                </motion.div>

                {/* Headline */}
                <motion.h2
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.1, duration: 0.5 }}
                    className="text-3xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white tracking-tight leading-[1.1] mb-5"
                >
                    Show them tonight.
                </motion.h2>

                <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2, duration: 0.4 }}
                    className="text-base md:text-lg text-gray-500 dark:text-gray-400 max-w-md mx-auto leading-relaxed mb-10"
                >
                    It takes 30 seconds to sign up. No credit card. No commitment. Just a better way for your child to stay organized, learn smarter, and feel supported.
                </motion.p>

                {/* CTAs */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3, duration: 0.4 }}
                    className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-8"
                >
                    <Link
                        href="/signup"
                        className="
                            group inline-flex items-center gap-2 px-8 py-3.5
                            bg-[#275085] hover:bg-[#1f3f6b]
                            text-white font-bold text-sm
                            rounded-full transition-all duration-200
                            shadow-lg shadow-[#275085]/20 hover:shadow-xl hover:shadow-[#275085]/30
                        "
                    >
                        Share TaskTornado with your child
                        <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                    </Link>
                    <Link
                        href="/"
                        className="
                            inline-flex items-center gap-2 px-7 py-3.5
                            text-gray-500 dark:text-gray-400 font-medium text-sm
                            rounded-full border border-gray-200 dark:border-zinc-800
                            hover:text-gray-900 dark:hover:text-white
                            hover:border-gray-300 dark:hover:border-zinc-700
                            transition-all duration-200
                        "
                    >
                        Explore the student view
                    </Link>
                </motion.div>

                {/* Trust micro-badges */}
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.5, duration: 0.5 }}
                    className="flex flex-wrap items-center justify-center gap-4"
                >
                    {[
                        'Free forever',
                        'No ads',
                        'No data selling',
                        'Crisis support built-in',
                    ].map((badge, i) => (
                        <span key={i} className="flex items-center gap-1 text-[10px] font-medium uppercase tracking-wider text-gray-400 dark:text-zinc-600">
                            <svg className="w-2.5 h-2.5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                            {badge}
                        </span>
                    ))}
                </motion.div>
            </div>
        </section>
    );
}
