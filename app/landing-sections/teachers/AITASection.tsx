'use client';

import { motion } from 'framer-motion';
import { Brain, MessageSquare, BookOpen, LayoutGrid } from 'lucide-react';

const CONVERSATION = [
    { role: 'student', text: 'I don\'t understand how photosynthesis works. Can you just tell me the answer for my worksheet?' },
    { role: 'aurora', text: 'I\'d love to help you understand it! Let\'s start with the basics — do you know what plants need to make their own food?' },
    { role: 'student', text: 'Sunlight and water?' },
    { role: 'aurora', text: 'Exactly! Sunlight and water are two of the key ingredients. There\'s one more important gas they absorb from the air — do you remember which one?' },
    { role: 'student', text: 'Oh, CO2! Carbon dioxide!' },
    { role: 'aurora', text: 'That\'s it! So plants take in sunlight, water, and CO₂ and convert them into glucose (food) and oxygen. Now, can you write that as a simple equation for your worksheet?' },
];

const TOOLS = [
    { icon: Brain, label: 'Socratic Method', desc: 'Guides students to answers through questions, never spoon-feeds.', accent: 'text-violet-500', bg: 'bg-violet-50 dark:bg-violet-950/20', border: 'border-violet-200/50 dark:border-violet-800/30' },
    { icon: BookOpen, label: 'Flashcard Generator', desc: 'Creates review cards from any topic your students are studying.', accent: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-950/20', border: 'border-amber-200/50 dark:border-amber-800/30' },
    { icon: LayoutGrid, label: 'Practice Quizzes', desc: 'Adaptive quizzes that target each student\'s weak spots.', accent: 'text-indigo-500', bg: 'bg-indigo-50 dark:bg-indigo-950/20', border: 'border-indigo-200/50 dark:border-indigo-800/30' },
];

export default function AITASection() {
    return (
        <section className="py-20 md:py-28 bg-gray-50 dark:bg-zinc-900 overflow-hidden">
            <div className="max-w-5xl mx-auto px-5 md:px-8">

                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    className="text-center mb-14 md:mb-16"
                >
                    <span className="inline-block px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-violet-500 dark:text-violet-400 bg-violet-500/8 dark:bg-violet-500/10 rounded-full mb-4">
                        After-Hours Help
                    </span>
                    <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white tracking-tight leading-[1.1] mb-4">
                        A TA that works<br />
                        <span className="text-gray-400 dark:text-zinc-500">after hours.</span>
                    </h2>
                    <p className="text-base md:text-lg text-gray-500 dark:text-gray-400 max-w-lg mx-auto leading-relaxed">
                        When a student is stuck at 11pm, Aurora AI walks them through the concept — using the Socratic method, not copy-paste answers.
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 max-w-3xl mx-auto">

                    {/* ── Conversation preview ────────────────────────────── */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1, duration: 0.5 }}
                        className="bg-white dark:bg-zinc-800/50 border border-gray-200 dark:border-zinc-700/50 rounded-[24px] p-5 md:p-6 shadow-lg shadow-gray-200/30 dark:shadow-black/20"
                    >
                        <div className="flex items-center gap-2 mb-4">
                            <div className="p-1.5 rounded-lg bg-violet-50 dark:bg-violet-950/20">
                                <Brain className="w-4 h-4 text-violet-500" />
                            </div>
                            <span className="text-sm font-bold text-gray-900 dark:text-white">Aurora AI Tutor</span>
                            <span className="ml-auto text-[9px] font-medium text-gray-400 dark:text-zinc-500">11:23 PM</span>
                        </div>

                        <div className="space-y-2.5 max-h-[320px] overflow-y-auto pr-1">
                            {CONVERSATION.map((msg, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 6 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: 0.15 + i * 0.08 }}
                                    className={`flex ${msg.role === 'student' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div className={`max-w-[85%] px-3.5 py-2.5 rounded-[14px] ${msg.role === 'student'
                                            ? 'bg-[#275085] text-white text-[12px]'
                                            : 'bg-gray-100 dark:bg-zinc-700/50 text-gray-700 dark:text-gray-300 text-[12px]'
                                        }`}>
                                        {msg.role === 'aurora' && (
                                            <div className="flex items-center gap-1 mb-1">
                                                <Brain className="w-2.5 h-2.5 text-violet-400" />
                                                <span className="text-[9px] font-bold text-violet-500 dark:text-violet-400">Aurora</span>
                                            </div>
                                        )}
                                        <p className="leading-snug">{msg.text}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        <div className="mt-3 pt-3 border-t border-gray-100 dark:border-zinc-700/50">
                            <p className="text-[10px] text-center text-violet-500 dark:text-violet-400 font-medium italic">
                                <MessageSquare className="w-2.5 h-2.5 inline mr-1" />
                                Teaches the method, not the answer
                            </p>
                        </div>
                    </motion.div>

                    {/* ── Study tools ──────────────────────────────────────── */}
                    <div className="flex flex-col gap-4">
                        {TOOLS.map((tool, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, x: 12 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.2 + i * 0.1 }}
                                className={`flex items-start gap-3 px-5 py-4 ${tool.bg} border ${tool.border} rounded-[18px]`}
                            >
                                <div className={`p-2 rounded-xl ${tool.bg} shrink-0`}>
                                    <tool.icon className={`w-5 h-5 ${tool.accent}`} />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-gray-800 dark:text-gray-200 mb-0.5">{tool.label}</p>
                                    <p className="text-[12px] text-gray-500 dark:text-zinc-400 leading-snug">{tool.desc}</p>
                                </div>
                            </motion.div>
                        ))}

                        {/* Teacher note */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.5 }}
                            className="px-5 py-3 bg-violet-50/50 dark:bg-violet-950/10 border border-violet-200/30 dark:border-violet-800/20 rounded-[14px] text-center"
                        >
                            <p className="text-[11px] text-violet-600 dark:text-violet-400 font-medium">
                                Think of Aurora as your classroom extension — available when you can&apos;t be.
                            </p>
                        </motion.div>
                    </div>
                </div>
            </div>
        </section>
    );
}
