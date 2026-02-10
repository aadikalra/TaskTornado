'use client';

import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

// ─── Staggered fade-up for the price strip ──────────────────────────────────────
const stagger = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.08 } },
};
const fadeUp = {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function PromiseSection() {
    return (
        <section className="py-24 md:py-32 bg-white dark:bg-gray-950 overflow-hidden">
            <div className="max-w-5xl mx-auto px-5 md:px-8">

                {/* ── Giant price statement ───────────────────────────── */}
                <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-16 md:mb-20"
                >
                    <span className="inline-block px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-[#275085] dark:text-[#4a7ba7] bg-[#275085]/8 dark:bg-[#275085]/10 rounded-full mb-8">
                        The Promise
                    </span>

                    {/* The $0 hero */}
                    <div className="relative inline-block mb-6">
                        <motion.span
                            initial={{ opacity: 0, scale: 0.8 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.2, duration: 0.5, ease: [0.25, 1, 0.5, 1] }}
                            className="text-[120px] md:text-[180px] lg:text-[220px] font-black text-gray-900 dark:text-white leading-none tracking-tighter tabular-nums"
                        >
                            $0
                        </motion.span>
                        <motion.span
                            initial={{ opacity: 0, x: -10 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.5, duration: 0.4 }}
                            className="absolute -top-2 -right-16 md:-right-20 text-sm md:text-base font-bold text-emerald-500 bg-emerald-500/10 px-3 py-1 rounded-full"
                        >
                            forever
                        </motion.span>
                    </div>

                    <h2 className="text-2xl md:text-4xl font-bold text-gray-900 dark:text-white tracking-tight mb-4">
                        No hidden fees. No bait-and-switch.
                    </h2>
                    <p className="text-base md:text-lg text-gray-500 dark:text-gray-400 max-w-xl mx-auto leading-relaxed">
                        We&apos;ve been burned by &ldquo;free&rdquo; apps that switch to paid models too. TaskTornado is genuinely different.
                    </p>
                </motion.div>

                {/* ── Competitor price comparison strip ────────────────── */}
                <motion.div
                    variants={stagger}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    className="flex flex-col md:flex-row items-stretch justify-center gap-4 md:gap-5 max-w-3xl mx-auto mb-16 md:mb-20"
                >
                    {/* Competitors */}
                    {[
                        { name: 'ChatGPT Plus', price: '$20', period: '/mo' },
                        { name: 'Notion Personal', price: '$10', period: '/mo' },
                    ].map((comp, i) => (
                        <motion.div
                            key={i}
                            variants={fadeUp}
                            className="flex-1 bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-[20px] p-6 text-center relative"
                        >
                            <p className="text-xs font-medium text-gray-400 dark:text-zinc-500 mb-2">{comp.name}</p>
                            <div className="relative inline-block">
                                <span className="text-3xl font-black text-gray-300 dark:text-zinc-600 tabular-nums">{comp.price}</span>
                                <span className="text-sm text-gray-300 dark:text-zinc-600">{comp.period}</span>
                                {/* strikethrough */}
                                <div className="absolute top-1/2 left-0 right-0 h-[2px] bg-red-400/70 -rotate-6" />
                            </div>
                        </motion.div>
                    ))}

                    {/* TaskTornado */}
                    <motion.div
                        variants={fadeUp}
                        className="flex-1 bg-[#275085] dark:bg-[#275085] border border-[#1f3f6b] dark:border-[#1f3f6b] rounded-[20px] p-6 text-center relative"
                    >
                        <p className="text-xs font-medium text-white/70 mb-2">TaskTornado</p>
                        <span className="text-3xl font-black text-white tabular-nums">$0</span>
                        <span className="text-sm text-white/60">/forever</span>
                        <div className="absolute -top-2 -right-2">
                            <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/30">
                                <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />
                            </div>
                        </div>
                    </motion.div>
                </motion.div>

                {/* ── How we keep it free ──────────────────────────────── */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.1 }}
                    className="max-w-2xl mx-auto"
                >
                    <h3 className="text-center text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-zinc-500 mb-6">
                        How we keep it free
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-gray-200 dark:bg-zinc-800 rounded-[20px] overflow-hidden border border-gray-200 dark:border-zinc-800">
                        {[
                            { title: 'Open-source models', desc: 'Efficient AI like Gemma keeps our costs near zero' },
                            { title: 'Fair usage limits', desc: 'Daily message caps so everyone gets equal access' },
                            { title: 'No investor pressure', desc: 'We answer to students, not shareholders' },
                        ].map((item, i) => (
                            <div key={i} className="bg-white dark:bg-gray-950 p-5 text-center">
                                <p className="text-sm font-bold text-gray-900 dark:text-white mb-1">{item.title}</p>
                                <p className="text-xs text-gray-500 dark:text-zinc-400 leading-relaxed">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
