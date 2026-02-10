'use client';

import { motion } from 'framer-motion';
import { Brain, UserRound } from 'lucide-react';

export default function CommandFlowSection() {
    return (
        <section className="py-24 bg-gray-50 dark:bg-gray-900">
            <div className="max-w-7xl mx-auto px-6">
                <div className="grid lg:grid-cols-2 gap-16 items-center">
                    {/* Text Content */}
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                    >
                        <span className="inline-block px-3 py-1 text-sm font-medium text-[#275085] dark:text-[#4a7ba7] bg-[#275085]/10 dark:bg-[#275085]/5 rounded-md mb-4">
                            The Workflow
                        </span>
                        <h2 className="text-5xl font-bold mb-6 text-gray-900 dark:text-white">
                            Control everything with a keystroke
                        </h2>
                        <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
                            Efficiency matters. Use our specialized chat commands to manage your workflow without leaving the keyboard.
                        </p>

                        <div className="space-y-3">
                            {[
                                { cmd: '@homework', example: 'What is due this week?' },
                                { cmd: '@flashcards', example: 'Create a deck for Biology Ch. 3' },
                                { cmd: '@resources', example: 'Find calculus practice problems' },
                                { cmd: '@control', example: 'Mark math homework as done' }
                            ].map((item, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, x: -10 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: i * 0.1 }}
                                    className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700"
                                >
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="px-2 py-1 bg-[#275085] dark:bg-[#1f3f6b] text-white text-xs font-mono font-semibold rounded">
                                            {item.cmd}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 font-mono">{item.example}</p>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Visual - Aurora Preview */}
                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                    >
                        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-700">
                            {/* Header */}
                            <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm p-4 flex justify-between items-center border-b border-gray-200/50 dark:border-gray-800/50">
                                <div className="flex items-center space-x-3">
                                    <div>
                                        <h3 className="font-medium text-gray-900 dark:text-white">
                                            Aurora
                                        </h3>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">AI-powered help</p>
                                    </div>
                                </div>
                            </div>

                            {/* Messages */}
                            <div className="p-4 space-y-4 bg-gray-50 dark:bg-gray-950 min-h-[350px]">
                                {/* User Message */}
                                <div className="flex items-start gap-3 justify-end">
                                    <div className="max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed bg-slate-600 dark:bg-slate-700 text-white rounded-tr-sm shadow-sm">
                                        @homework What's due this week?
                                    </div>
                                    <div className="p-1.5 rounded-lg bg-primary/5 dark:bg-primary/20">
                                        <UserRound className="h-4 w-4 text-[#275085] dark:text-[#4a7ba7]" />
                                    </div>
                                </div>

                                {/* AI Response */}
                                <div className="flex items-start gap-3 justify-start">
                                    <div className="p-1.5 rounded-lg bg-linear-to-br from-primary/5 to-primary/10 dark:from-primary/10 dark:to-primary/20">
                                        <Brain className="h-4 w-4 text-[#275085] dark:text-[#4a7ba7]" />
                                    </div>
                                    <div className="max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed bg-white dark:bg-gray-800/70 text-gray-900 dark:text-gray-100 rounded-tl-sm shadow-sm border border-gray-100 dark:border-gray-700/50">
                                        <p className="mb-2">You have 3 assignments due:</p>
                                        <ul className="space-y-1 ml-4">
                                            <li className="text-gray-700 dark:text-gray-300">• Math Ch. 8 - Due Friday</li>
                                            <li className="text-gray-700 dark:text-gray-300">• History Essay - Due Thursday</li>
                                            <li className="text-gray-700 dark:text-gray-300">• Science Lab - Due Monday</li>
                                        </ul>
                                    </div>
                                </div>

                                {/* User Message 2 */}
                                <div className="flex items-start gap-3 justify-end">
                                    <div className="max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed bg-slate-600 dark:bg-slate-700 text-white rounded-tr-sm shadow-sm">
                                        @control mark math as done
                                    </div>
                                    <div className="p-1.5 rounded-lg bg-primary/5 dark:bg-primary/20">
                                        <UserRound className="h-4 w-4 text-[#275085] dark:text-[#4a7ba7]" />
                                    </div>
                                </div>

                                {/* AI Response 2 */}
                                <div className="flex items-start gap-3 justify-start">
                                    <div className="p-1.5 rounded-lg bg-linear-to-br from-primary/5 to-primary/10 dark:from-primary/10 dark:to-primary/20">
                                        <Brain className="h-4 w-4 text-[#275085] dark:text-[#4a7ba7]" />
                                    </div>
                                    <div className="max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed bg-white dark:bg-gray-800/70 text-gray-900 dark:text-gray-100 rounded-tl-sm shadow-sm border border-gray-100 dark:border-gray-700/50">
                                        ✓ Math homework marked complete
                                    </div>
                                </div>
                            </div>

                            {/* Input Area */}
                            <div className="border-t border-gray-100/50 dark:border-gray-800/50 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm p-3">
                                <div className="flex items-center gap-2">
                                    <input
                                        type="text"
                                        placeholder="Ask away..."
                                        className="flex-1 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2 text-sm text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#275085]"
                                        disabled
                                    />
                                    <button className="px-4 py-2 bg-[#275085] hover:bg-[#1f3f6b] dark:bg-[#1f3f6b] dark:hover:bg-[#275085] text-white rounded-lg transition-colors text-sm font-medium">
                                        Send
                                    </button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
