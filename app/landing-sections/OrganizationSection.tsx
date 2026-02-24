'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';

interface OrganizationSectionProps {
    id?: string;
    homeworkItems?: any[];
    onItemToggle?: (id: string) => void;
}

export default function OrganizationSection({ id, homeworkItems, onItemToggle }: OrganizationSectionProps) {
    const features = [
        {
            title: 'Smart Calendar',
            desc: 'Syncs assignments across all your classes automatically, so you never miss a deadline.',
            image: '/calendarCard.png'
        },
        {
            title: 'AI Study Assistant',
            desc: 'Get instant study help, practice quizzes, and detailed breakdowns of complex topics.',
            image: '/aiCard.png'
        },
        {
            title: 'Progress Tracking',
            desc: 'Visualize your academic growth with deep insights into your grades and completion rates.',
            image: '/progressCard.png'
        }
    ];

    return (
        <section id={id || "organization"} className="py-12 md:py-20 bg-[#FCFDF5] dark:bg-zinc-950">
            <div className="max-w-7xl mx-auto px-6 md:px-12">
                {/* ── Feature Grid ───────────────────────────────────────── */}
                <div className="bg-[#F1F6D1] dark:bg-zinc-900 rounded-[40px] md:rounded-[64px] p-8 md:p-16">
                    {/* ── Header ────────────────────────────────────────────── */}
                    <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="text-center mb-12 md:mb-16 px-8 md:px-16"
                    >
                        <span className="inline-block px-3 py-1 text-[10px] font-bold uppercase tracking-[0.15em] text-[#275085] dark:text-[#4a9cdb] bg-[#275085]/5 dark:bg-[#275085]/10 border border-[#275085]/10 dark:border-[#4a9cdb]/10 rounded-full mb-4">
                            Organization
                        </span>
                        <h2 className="text-3xl md:text-5xl font-semibold text-[#275085] dark:text-[#4a9cdb] tracking-tight leading-[1.15] max-w-3xl mx-auto">
                            Your entire school life, centralized.
                        </h2>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                        {features.map((feature, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1, duration: 0.5 }}
                                className="bg-[#fff8fa] dark:bg-zinc-800 rounded-[32px] p-8 md:p-10 flex flex-col items-center text-center shadow-sm border border-[#275085]/5 dark:border-zinc-700 h-full hover:shadow-md transition-shadow"
                            >
                                {/* Graphic */}
                                <div className="h-44 flex items-center justify-center mb-8 w-full">
                                    <div className="relative w-full h-full flex items-center justify-center">
                                        <Image
                                            src={feature.image}
                                            alt={feature.title}
                                            width={280}
                                            height={200}
                                            className="max-w-full max-h-full object-contain dark:opacity-90"
                                        />
                                    </div>
                                </div>

                                {/* Text */}
                                <h3 className="text-xl md:text-2xl font-bold text-[#275085] dark:text-[#4a9cdb] mb-4 leading-tight">
                                    {feature.title}
                                </h3>
                                <p className="text-base text-[#275085]/60 dark:text-[#4a9cdb]/60 leading-relaxed">
                                    {feature.desc}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
