'use client';

import { motion } from 'framer-motion';
import { Brain, Image as ImageIcon, BookOpen } from 'lucide-react';

export default function AITutorSection() {
    return (
        <section className="py-24 bg-white dark:bg-gray-950">
            <div className="max-w-7xl mx-auto px-6">
                <div className="grid lg:grid-cols-2 gap-16 items-center">
                    {/* Visual - AI Chat Preview */}
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="order-2 lg:order-1"
                    >
                        <div className="bg-linear-to-br from-[#275085] to-[#1f3f6b] rounded-2xl shadow-2xl p-6 text-white">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                                    <Brain className="w-5 h-5" />
                                </div>
                                <div>
                                    <h4 className="font-semibold">AI Tutor</h4>
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-green-400" />
                                        <span className="text-xs opacity-90">Online & Ready</span>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div className="bg-white/10 backdrop-blur-sm p-3 rounded-lg">
                                    <p className="text-sm">Can you explain the quadratic formula?</p>
                                </div>
                                <div className="bg-white/20 backdrop-blur-sm p-3 rounded-lg">
                                    <p className="text-sm">The quadratic formula is x = (-b ± √(b²-4ac)) / 2a. It's used to solve equations in the form ax² + bx + c = 0...</p>
                                </div>
                                <div className="flex items-center gap-2 text-xs opacity-75">
                                    <ImageIcon className="w-4 h-4" />
                                    <span>Upload images for visual help</span>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Text Content */}
                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="order-1 lg:order-2"
                    >
                        <span className="inline-block px-3 py-1 text-sm font-medium text-[#275085] dark:text-[#4a7ba7] bg-[#275085]/10 dark:bg-[#275085]/5 rounded-md mb-4">
                            The Engine
                        </span>
                        <h2 className="text-5xl font-bold mb-6 text-gray-900 dark:text-white">
                            A private tutor in your pocket. 24/7.
                        </h2>
                        <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
                            Stuck on a problem? Don't wait for office hours. Our AI adapts to your needs.
                        </p>

                        <div className="space-y-4">
                            {[
                                { icon: <ImageIcon className="w-5 h-5" />, title: "Visual Learning", desc: "Upload a photo of a homework problem for instant explanations" },
                                { icon: <Brain className="w-5 h-5" />, title: "Dual Modes", desc: "Use Quick Mode (Gemma) for fast answers or Deep Mode (Gemini) for complex analysis" },
                                { icon: <BookOpen className="w-5 h-5" />, title: "Flashcards", desc: "Let the AI generate study decks based on your notes" }
                            ].map((feature, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 10 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: i * 0.1 }}
                                    className="flex items-start gap-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800"
                                >
                                    <div className="w-10 h-10 rounded-lg bg-[#275085] dark:bg-[#1f3f6b] flex items-center justify-center text-white shrink-0">
                                        {feature.icon}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900 dark:text-white mb-1">{feature.title}</h3>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">{feature.desc}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
