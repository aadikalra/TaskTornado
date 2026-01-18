'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { TutorialArticleTemplate } from '@/components/TutorialArticleTemplate';
import Link from 'next/link';
import { Sparkles, Zap, Brain, Cloud, MessageSquare, BookOpen, PlusCircle, Search, Bookmark, HelpCircle, Calculator, Heart, Image as ImageIcon, CheckCircle, ShieldAlert, ArrowRight, Timer } from 'lucide-react';

export default function AuroraTutorialPage() {
    return (
        <TutorialArticleTemplate
            title="Meet Aurora: Your AI Study Partner"
            category="Features"
            description="Master your academic workflow with Aurora—the supportive, data-aware assistant designed to help you study smarter, not just harder."
            nextTutorial={{
                title: "Getting Started",
                href: "/tutorials/onboarding",
                label: "Back to Basics"
            }}
        >
            <motion.section
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="mb-12"
            >
                {/* Feature Highlight Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
                    <div className="p-6 rounded-2xl bg-teal-50 dark:bg-teal-900/10 border border-teal-100 dark:border-teal-800">
                        <Zap className="w-8 h-8 text-teal-600 dark:text-teal-400 mb-4" />
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Quick Mode</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Powered by Gemma 3. Perfect for fast questions and simple tasks. 100 messages/day.</p>
                    </div>
                    <div className="p-6 rounded-2xl bg-purple-50 dark:bg-purple-900/10 border border-purple-100 dark:border-purple-800">
                        <Brain className="w-8 h-8 text-purple-600 dark:text-purple-400 mb-4" />
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Deep Mode</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Powered by Gemini 2.5. Best for deep reasoning and complex explanations. 30 messages/day.</p>
                    </div>
                    <div className="p-6 rounded-2xl bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800">
                        <Cloud className="w-8 h-8 text-blue-600 dark:text-blue-400 mb-4" />
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Cloud Mode</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Powered by DeepSeek. Maximum intelligence for your hardest assignments. 20 messages/day.</p>
                    </div>
                </div>

                <p className="text-lg leading-[1.8] text-gray-600 dark:text-gray-400 mb-8">
                    Aurora isn't like other AI assistants. She's built specifically for students. Instead of just giving you the answers, she uses <b>Socratic teaching</b>—asking you guiding questions that help you reach the "aha!" moment yourself.
                </p>

                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mt-16 mb-8 flex items-center gap-3">
                    <Sparkles className="w-8 h-8 text-blue-500" />
                    Powerful @Commands
                </h2>
                <p className="text-lg leading-[1.8] text-gray-600 dark:text-gray-400 mb-8">
                    Unlock specialized workflows by using @-commands in your messages. Each command activates a dedicated sub-system inside Aurora:
                </p>

                <div className="space-y-6 mb-12">
                    <div className="flex gap-4 p-5 rounded-xl border border-gray-100 dark:border-zinc-800 bg-white dark:bg-zinc-900/50">
                        <div className="w-10 h-10 rounded-lg bg-yellow-100 dark:bg-yellow-900/20 flex items-center justify-center shrink-0">
                            <BookOpen className="w-5 h-5 text-yellow-600" />
                        </div>
                        <div>
                            <h4 className="font-bold text-gray-900 dark:text-white">@data — The Knowledge Hub</h4>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Gives Aurora context about your current workload. Ask "@data what should I study today?" to get a personalized recommendation based on your upcoming tests and homework.</p>
                        </div>
                    </div>

                    <div className="flex gap-4 p-5 rounded-xl border border-gray-100 dark:border-zinc-800 bg-white dark:bg-zinc-900/50">
                        <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center shrink-0">
                            <PlusCircle className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                            <h4 className="font-bold text-gray-900 dark:text-white">@control — Task Management</h4>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage your dashboard directly. Try "@control mark my math assignment as done" or "@control delete my test homework."</p>
                        </div>
                    </div>

                    <div className="flex gap-4 p-5 rounded-xl border border-gray-100 dark:border-zinc-800 bg-white dark:bg-zinc-900/50">
                        <div className="w-10 h-10 rounded-lg bg-pink-100 dark:bg-pink-900/20 flex items-center justify-center shrink-0">
                            <Bookmark className="w-5 h-5 text-pink-600" />
                        </div>
                        <div>
                            <h4 className="font-bold text-gray-900 dark:text-white">@flashcards — Instant Study Sets</h4>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Generates a complete deck of 10 flashcards on any topic. Once generated, they appear instantly in your Flashcards page.</p>
                        </div>
                    </div>

                    <div className="flex gap-4 p-5 rounded-xl border border-gray-100 dark:border-zinc-800 bg-white dark:bg-zinc-900/50">
                        <div className="w-10 h-10 rounded-lg bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center shrink-0">
                            <HelpCircle className="w-5 h-5 text-orange-600" />
                        </div>
                        <div>
                            <h4 className="font-bold text-gray-900 dark:text-white">@quiz — Self Testing</h4>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Creates interactive, multiple-choice quizzes that you can take directly on the Quiz page to test your mastery.</p>
                        </div>
                    </div>

                    <div className="flex gap-4 p-5 rounded-xl border border-gray-100 dark:border-zinc-800 bg-white dark:bg-zinc-900/50">
                        <div className="w-10 h-10 rounded-lg bg-cyan-100 dark:bg-cyan-900/20 flex items-center justify-center shrink-0">
                            <Heart className="w-5 h-5 text-cyan-600" />
                        </div>
                        <div>
                            <h4 className="font-bold text-gray-900 dark:text-white">@therapist — Mental Support</h4>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">A safe space to talk about school stress, burnout, or any academic challenges you're facing.</p>
                        </div>
                    </div>
                </div>

                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-12 mb-6">Interactive Learning Widgets</h2>
                <p className="text-lg leading-[1.8] text-gray-600 dark:text-gray-400 mb-8">
                    Aurora doesn't just send text. She sends <b>Interactive teaching tools</b>:
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-16">
                    <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 shadow-sm">
                        <div className="flex items-center gap-3 mb-4">
                            <MessageSquare className="w-5 h-5 text-blue-500" />
                            <h4 className="font-bold text-gray-900 dark:text-white">Smart Buttons</h4>
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                            Quick response buttons at the end of messages let you dive deeper into a topic with one click. You can also press the corresponding letter on your keyboard to trigger them instantly.
                        </p>
                    </div>

                    <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 shadow-sm">
                        <div className="flex items-center gap-3 mb-4">
                            <CheckCircle className="w-5 h-5 text-green-500" />
                            <h4 className="font-bold text-gray-900 dark:text-white">Smart Checklists</h4>
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                            When you ask for a study plan, Aurora generates a real-time editable checklist. You can check off items as you complete them to track your progress directly in the chat.
                        </p>
                    </div>
                </div>

                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-12 mb-6 flex items-center gap-3">
                    <ShieldAlert className="w-6 h-6 text-rose-500" />
                    Educational Guidelines & Ethics
                </h2>
                <p className="text-lg leading-[1.8] text-gray-600 dark:text-gray-400 mb-6">
                    Aurora is designed to be a <b>tutor</b>, not a shortcut. We believe in academic integrity and deep understanding. To ensure Aurora remains a positive force for your education, we've established clear guidelines:
                </p>

                <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-800 rounded-2xl p-6 mb-12">
                    <ul className="space-y-4">
                        <li className="flex gap-3 text-sm text-gray-700 dark:text-gray-300">
                            <CheckCircle className="w-5 h-5 text-amber-600 shrink-0" />
                            <span><b>No Direct Answers:</b> Aurora will guide you through the logic of a problem rather than just providing the solution.</span>
                        </li>
                        <li className="flex gap-3 text-sm text-gray-700 dark:text-gray-300">
                            <CheckCircle className="w-5 h-5 text-amber-600 shrink-0" />
                            <span><b>Critical Thinking:</b> She is programmed to ask "Why?" and "How?" to prompt your own discovery.</span>
                        </li>
                        <li className="flex gap-3 text-sm text-gray-700 dark:text-gray-300">
                            <CheckCircle className="w-5 h-5 text-amber-600 shrink-0" />
                            <span><b>Safety First:</b> Suspicious conversations are internally flagged to maintain a safe and productive environment.</span>
                        </li>
                    </ul>
                    <div className="mt-6 pt-6 border-t border-amber-100 dark:border-amber-800">
                        <Link href="/ai-guidelines" className="text-amber-700 dark:text-amber-400 font-bold hover:underline inline-flex items-center gap-2 text-sm">
                            View Full AI Guidelines Page <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>
                </div>

                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-12 mb-6 flex items-center gap-3">
                    <Timer className="w-6 h-6 text-blue-500" />
                    Usage & Rate Limits
                </h2>
                <p className="text-lg leading-[1.8] text-gray-600 dark:text-gray-400 mb-6">
                    To provide high-quality AI access to all students fairly, we use daily message quotas. Your limits reset every 24 hours at midnight.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12">
                    <div className="p-4 rounded-xl border border-gray-100 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 text-center">
                        <span className="block text-2xl font-bold text-teal-600 mb-1">100</span>
                        <span className="text-xs text-gray-500 uppercase tracking-wider">Quick Messages</span>
                    </div>
                    <div className="p-4 rounded-xl border border-gray-100 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 text-center">
                        <span className="block text-2xl font-bold text-purple-600 mb-1">30</span>
                        <span className="text-xs text-gray-500 uppercase tracking-wider">Deep Messages</span>
                    </div>
                    <div className="p-4 rounded-xl border border-gray-100 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 text-center">
                        <span className="block text-2xl font-bold text-blue-600 mb-1">20</span>
                        <span className="text-xs text-gray-500 uppercase tracking-wider">Cloud Messages</span>
                    </div>
                </div>

                <div className="mt-16 p-8 rounded-3xl bg-gray-900 text-white dark:bg-zinc-900 border border-zinc-800">
                    <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                        <Zap className="w-5 h-5 text-yellow-400" />
                        Pro Tip: Dynamic Presence
                    </h3>
                    <p className="text-gray-400 leading-relaxed italic">
                        "Watch the Aura sphere at the bottom of the input. It speeds up when she's thinking and changes colors based on the intelligence mode you've selected. You can also resize the side panel by dragging the edges to fit your workspace perfectly."
                    </p>
                </div>
            </motion.section>
        </TutorialArticleTemplate>
    );
}
