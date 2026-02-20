'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { Globe } from 'lucide-react';

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.1, delayChildren: 0.1 },
    },
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const stats = [
    { value: '2+', label: 'States' },
    { value: '50+', label: 'Students' },
    { value: '1,000+', label: 'Hours' },
];

export default function UserReachSection() {
    return (
        <section className="py-24 md:py-32 bg-[#F4F7FF] dark:bg-zinc-950/50 overflow-hidden">
            <motion.div
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.2 }}
                className="max-w-6xl mx-auto px-5 md:px-8"
            >
                {/* ── Header ──────────────────────────────── */}
                <motion.div variants={itemVariants} className="text-center mb-12 md:mb-16">
                    <span className="inline-block px-3 py-1 text-[10px] font-bold uppercase tracking-[0.15em] text-[#275085] dark:text-[#4a9cdb] bg-[#275085]/5 dark:bg-[#275085]/10 border border-[#275085]/10 dark:border-[#4a9cdb]/10 rounded-full mb-4">
                        Growing Fast
                    </span>
                    <h2 className="text-3xl md:text-5xl font-semibold text-[#275085] dark:text-[#4a9cdb] tracking-tight leading-[1.15] mb-4">
                        Students everywhere.
                    </h2>
                    <p className="text-base md:text-lg text-[#275085]/55 dark:text-[#4a9cdb]/55 font-medium max-w-lg mx-auto leading-relaxed">
                        From California to Texas, TaskTornado helps students across the country stay on top of their education.
                    </p>
                </motion.div>

                {/* ── Map ──────────────────────────────────── */}
                <motion.div
                    variants={itemVariants}
                    className="relative w-full max-w-4xl mx-auto mb-16 md:mb-20"
                >
                    <Image
                        src="/userMap.png"
                        alt="World map showing TaskTornado user distribution"
                        width={1200}
                        height={600}
                        className="w-full h-auto object-contain rounded-2xl"
                        priority={false}
                    />
                </motion.div>

                {/* ── Stats Row ────────────────────────────── */}
                <motion.div
                    variants={itemVariants}
                    className="grid grid-cols-3 gap-6 md:gap-12 max-w-2xl mx-auto"
                >
                    {stats.map((stat, i) => (
                        <motion.div
                            key={i}
                            variants={itemVariants}
                            className="text-center"
                        >
                            <p className="text-3xl md:text-5xl font-bold text-[#275085] dark:text-[#4a9cdb] tracking-tight mb-1">
                                {stat.value}
                            </p>
                            <p className="text-xs md:text-sm font-semibold text-[#275085]/50 dark:text-[#4a9cdb]/50 uppercase tracking-widest">
                                {stat.label}
                            </p>
                        </motion.div>
                    ))}
                </motion.div>
            </motion.div>
        </section>
    );
}
