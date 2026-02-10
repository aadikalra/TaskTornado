'use client';

import { motion } from 'framer-motion';
import { Users, MessageSquare, BookOpen } from 'lucide-react';

export default function CollaborationSection() {
    return (
        <section className="py-24 bg-white dark:bg-gray-950">
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
                            Collaboration
                        </span>
                        <h2 className="text-5xl font-bold mb-6 text-gray-900 dark:text-white">
                            Study together, succeed together
                        </h2>
                        <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
                            Connect with classmates, share resources, and collaborate in real-time study groups. Learning is better together.
                        </p>

                        <div className="space-y-4">
                            {[
                                { icon: <Users className="w-5 h-5" />, title: "Class Group Chats", desc: "Create dedicated channels for each class to share notes and discuss assignments" },
                                { icon: <MessageSquare className="w-5 h-5" />, title: "Real-Time Messaging", desc: "Instant messaging with your study group, no phone numbers required" },
                                { icon: <BookOpen className="w-5 h-5" />, title: "Resource Sharing", desc: "Share study materials, flashcards, and helpful links with your group" }
                            ].map((feature, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 10 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: i * 0.1 }}
                                    className="flex items-start gap-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700"
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

                    {/* Visual - Group Chat Preview */}
                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="relative"
                    >
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                            {/* Chat Header */}
                            <div className="bg-[#275085] dark:bg-[#1f3f6b] p-4 flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                                    <Users className="w-5 h-5 text-white" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-bold text-white">AP Chemistry Study Group</h3>
                                    <p className="text-xs text-white/80">8 members • 3 online</p>
                                </div>
                            </div>

                            {/* Chat Messages */}
                            <div className="p-4 space-y-3 bg-gray-50 dark:bg-gray-900 min-h-[300px]">
                                <div className="flex items-start gap-2">
                                    <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
                                        SM
                                    </div>
                                    <div className="flex-1">
                                        <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
                                            <p className="text-xs font-semibold text-gray-900 dark:text-white mb-1">Sarah M.</p>
                                            <p className="text-sm text-gray-700 dark:text-gray-300">Did anyone finish the lab report yet?</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-start gap-2">
                                    <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
                                        JD
                                    </div>
                                    <div className="flex-1">
                                        <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
                                            <p className="text-xs font-semibold text-gray-900 dark:text-white mb-1">Jake D.</p>
                                            <p className="text-sm text-gray-700 dark:text-gray-300">Just finished! I can share my notes if you need help with the calculations</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-start gap-2">
                                    <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
                                        AL
                                    </div>
                                    <div className="flex-1">
                                        <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
                                            <p className="text-xs font-semibold text-gray-900 dark:text-white mb-1">Alex L.</p>
                                            <p className="text-sm text-gray-700 dark:text-gray-300">That would be amazing! Also, anyone want to study together for the midterm?</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Chat Input */}
                            <div className="p-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
                                <div className="flex items-center gap-2">
                                    <input
                                        type="text"
                                        placeholder="Type a message..."
                                        className="flex-1 bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2 text-sm text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#275085]"
                                        disabled
                                    />
                                    <button className="px-4 py-2 bg-[#275085] hover:bg-[#1f3f6b] dark:bg-[#1f3f6b] dark:hover:bg-[#275085] text-white rounded-lg transition-colors text-sm font-medium">
                                        Send
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Floating Badge */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.3 }}
                            className="absolute -top-4 -right-4 bg-green-500 text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2"
                        >
                            <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                            <span className="text-sm font-semibold">Live Collaboration</span>
                        </motion.div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
