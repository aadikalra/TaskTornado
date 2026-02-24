'use client';

import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default function GuardiansFinalCTA() {
    return (
        <section className="relative py-20 md:py-32 bg-pink-50 dark:bg-gray-950 overflow-hidden">
            <div className="max-w-6xl mx-auto px-5 md:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-[1.3fr_1fr] lg:gap-0 items-center">

                    {/* Left side: Illustration */}
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="relative w-[115%] -ml-[7.5%] lg:w-[120%] lg:-ml-[15%] aspect-[4/3] z-0"
                    >
                        <Image
                            src="/guardians-final-cta.png"
                            alt="Father and son using TaskTornado on a tablet"
                            fill
                            className="object-contain"
                            sizes="(max-width: 1024px) 100vw, 50vw"
                            priority
                        />
                    </motion.div>

                    {/* Right side: Content */}
                    <div className="flex flex-col items-center lg:items-start text-center lg:text-left relative z-10 lg:-ml-12 mt-8 lg:mt-0">
                        <motion.h2
                            initial={{ opacity: 0, y: 16 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.1, duration: 0.5 }}
                            className="text-3xl md:text-5xl font-semibold text-pink-500 dark:text-pink-400 tracking-tight leading-[1.15] mb-6"
                        >
                            Show them tonight.
                        </motion.h2>

                        <motion.p
                            initial={{ opacity: 0, y: 16 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.2, duration: 0.5 }}
                            className="text-base md:text-lg text-pink-500/70 dark:text-pink-400/70 max-w-lg leading-relaxed mb-8"
                        >
                            It takes 30 seconds to sign up. No credit card. No commitment. Just a better way for your child to stay organized, learn smarter, and feel supported.
                        </motion.p>

                        <motion.div
                            initial={{ opacity: 0, y: 16 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.3, duration: 0.5 }}
                        >
                            <Link
                                href="/signup"
                                className="
                                    group inline-flex items-center gap-2.5 px-8 py-4
                                    bg-pink-500 hover:bg-pink-600
                                    text-white font-medium text-base
                                    rounded-full transition-all duration-200
                                    shadow-md hover:shadow-lg
                                "
                            >
                                Share TaskTornado with your child
                                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                            </Link>
                        </motion.div>
                    </div>

                </div>
            </div>
        </section>
    );
}
