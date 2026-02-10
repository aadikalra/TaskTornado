'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export default function FinalCTASection() {
    return (
        <section className="py-20 md:py-28 bg-white dark:bg-gray-950">
            <div className="max-w-5xl mx-auto px-5 md:px-8">
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    className="bg-[#275085] border border-[#1f3f6b] rounded-[28px] px-8 py-14 md:px-16 md:py-20 text-center relative overflow-hidden"
                >
                    {/* Subtle top glow */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[400px] h-[200px] bg-white/10 rounded-full blur-[100px] pointer-events-none" />

                    <h2 className="text-3xl md:text-5xl font-bold text-white tracking-tight mb-4 relative z-10">
                        Ready to upgrade your GPA?
                    </h2>
                    <p className="text-base md:text-lg text-white/70 max-w-lg mx-auto leading-relaxed mb-8 relative z-10">
                        Be one of the first to try the app.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-3 relative z-10">
                        <Link
                            href="/signup"
                            className="
                                inline-flex items-center gap-2 px-7 py-3.5
                                bg-white text-gray-900
                                font-semibold text-sm
                                rounded-full
                                hover:bg-gray-100
                                transition-colors duration-200
                                shadow-lg shadow-white/10
                            "
                        >
                            Launch TaskTornado
                            <ArrowRight className="w-4 h-4" />
                        </Link>
                        <Link
                            href="/blog"
                            className="
                                inline-flex items-center gap-2 px-7 py-3.5
                                bg-transparent text-white/80
                                font-medium text-sm
                                rounded-full
                                border border-white/20
                                hover:text-white hover:border-white/40
                                transition-colors duration-200
                            "
                        >
                            Read the journal
                        </Link>
                    </div>

                    {/* Trust line */}
                    <p className="mt-8 text-xs text-white/50 relative z-10">
                        Free forever · No credit card · 2-minute setup
                    </p>
                </motion.div>
            </div>
        </section>
    );
}
