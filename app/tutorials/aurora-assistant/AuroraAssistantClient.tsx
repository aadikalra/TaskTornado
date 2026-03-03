'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { TutorialArticleTemplate } from '@/components/TutorialArticleTemplate';
import Link from 'next/link';
import { Sparkles, Zap, Brain, Cloud, MessageSquare, BookOpen, PlusCircle, Bookmark, HelpCircle, Heart, CheckCircle, ShieldAlert, ArrowRight, Timer } from 'lucide-react';

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
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-16">
                    <div className="p-6 rounded-[20px] bg-[#f5f9fc] dark:bg-zinc-800 border border-sky-200/40 dark:border-sky-800/30">
                        <Zap className="w-8 h-8 text-teal-500 dark:text-teal-400 mb-4" />
                        <h3 className="text-lg font-bold text-sky-800 dark:text-sky-200 mb-2">Quick Mode</h3>
                        <p className="text-sm text-sky-700/70 dark:text-sky-300/70">Powered by Gemma 3. Perfect for fast questions and simple tasks. 100 messages/day.</p>
                    </div>
                    <div className="p-6 rounded-[20px] bg-[#f5f9fc] dark:bg-zinc-800 border border-sky-200/40 dark:border-sky-800/30">
                        <Brain className="w-8 h-8 text-purple-500 dark:text-purple-400 mb-4" />
                        <h3 className="text-lg font-bold text-sky-800 dark:text-sky-200 mb-2">Deep Mode</h3>
                        <p className="text-sm text-sky-700/70 dark:text-sky-300/70">Powered by Gemini 2.5. Best for deep reasoning and complex explanations. 30 messages/day.</p>
                    </div>
                    <div className="p-6 rounded-[20px] bg-[#f5f9fc] dark:bg-zinc-800 border border-sky-200/40 dark:border-sky-800/30">
                        <Cloud className="w-8 h-8 text-sky-500 dark:text-sky-400 mb-4" />
                        <h3 className="text-lg font-bold text-sky-800 dark:text-sky-200 mb-2">Cloud Mode</h3>
                        <p className="text-sm text-sky-700/70 dark:text-sky-300/70">Powered by DeepSeek. Maximum intelligence for your hardest assignments. 20 messages/day.</p>
                    </div>
                </div>

                <p className="text-lg leading-[1.8] text-sky-800/70 dark:text-sky-300/70 mb-8">
                    Aurora isn&apos;t like other AI assistants. She&apos;s built specifically for students. Instead of just giving you the answers, she uses <b>Socratic teaching</b>—asking you guiding questions that help you reach the &quot;aha!&quot; moment yourself.
                </p>

                <h2 className="text-3xl font-bold text-sky-800 dark:text-sky-200 mt-16 mb-8 flex items-center gap-3">
                    <Sparkles className="w-8 h-8 text-sky-500" />
                    Powerful @Commands
                </h2>
                <p className="text-lg leading-[1.8] text-sky-800/70 dark:text-sky-300/70 mb-8">
                    Unlock specialized workflows by using @-commands in your messages. Each command activates a dedicated sub-system inside Aurora:
                </p>

                <div className="space-y-4 mb-12">
                    <div className="flex gap-4 p-5 rounded-[16px] border border-sky-200/40 dark:border-sky-800/30 bg-[#f5f9fc] dark:bg-zinc-800">
                        <div className="w-10 h-10 rounded-xl bg-[#ebf6b5]/60 dark:bg-sky-500/15 flex items-center justify-center shrink-0">
                            <BookOpen className="w-5 h-5 text-sky-600 dark:text-sky-400" />
                        </div>
                        <div>
                            <h4 className="font-bold text-sky-800 dark:text-sky-200">@data — The Knowledge Hub</h4>
                            <p className="text-sm text-sky-700/60 dark:text-sky-300/60 mt-1">Gives Aurora context about your current workload. Ask &quot;@data what should I study today?&quot; to get a personalized recommendation based on your upcoming tests and homework.</p>
                        </div>
                    </div>

                    <div className="flex gap-4 p-5 rounded-[16px] border border-sky-200/40 dark:border-sky-800/30 bg-[#f5f9fc] dark:bg-zinc-800">
                        <div className="w-10 h-10 rounded-xl bg-[#ebf6b5]/60 dark:bg-sky-500/15 flex items-center justify-center shrink-0">
                            <PlusCircle className="w-5 h-5 text-sky-600 dark:text-sky-400" />
                        </div>
                        <div>
                            <h4 className="font-bold text-sky-800 dark:text-sky-200">@control — Task Management</h4>
                            <p className="text-sm text-sky-700/60 dark:text-sky-300/60 mt-1">Manage your dashboard directly. Try &quot;@control mark my math assignment as done&quot; or &quot;@control delete my test homework.&quot;</p>
                        </div>
                    </div>

                    <div className="flex gap-4 p-5 rounded-[16px] border border-sky-200/40 dark:border-sky-800/30 bg-[#f5f9fc] dark:bg-zinc-800">
                        <div className="w-10 h-10 rounded-xl bg-[#ebf6b5]/60 dark:bg-sky-500/15 flex items-center justify-center shrink-0">
                            <Bookmark className="w-5 h-5 text-sky-600 dark:text-sky-400" />
                        </div>
                        <div>
                            <h4 className="font-bold text-sky-800 dark:text-sky-200">@flashcards — Instant Study Sets</h4>
                            <p className="text-sm text-sky-700/60 dark:text-sky-300/60 mt-1">Generates a complete deck of 10 flashcards on any topic. Once generated, they appear instantly in your Flashcards page.</p>
                        </div>
                    </div>

                    <div className="flex gap-4 p-5 rounded-[16px] border border-sky-200/40 dark:border-sky-800/30 bg-[#f5f9fc] dark:bg-zinc-800">
                        <div className="w-10 h-10 rounded-xl bg-[#ebf6b5]/60 dark:bg-sky-500/15 flex items-center justify-center shrink-0">
                            <HelpCircle className="w-5 h-5 text-sky-600 dark:text-sky-400" />
                        </div>
                        <div>
                            <h4 className="font-bold text-sky-800 dark:text-sky-200">@quiz — Self Testing</h4>
                            <p className="text-sm text-sky-700/60 dark:text-sky-300/60 mt-1">Creates interactive, multiple-choice quizzes that you can take directly on the Quiz page to test your mastery.</p>
                        </div>
                    </div>

                    <div className="flex gap-4 p-5 rounded-[16px] border border-sky-200/40 dark:border-sky-800/30 bg-[#f5f9fc] dark:bg-zinc-800">
                        <div className="w-10 h-10 rounded-xl bg-[#ebf6b5]/60 dark:bg-sky-500/15 flex items-center justify-center shrink-0">
                            <Heart className="w-5 h-5 text-sky-600 dark:text-sky-400" />
                        </div>
                        <div>
                            <h4 className="font-bold text-sky-800 dark:text-sky-200">@therapist — Mental Support</h4>
                            <p className="text-sm text-sky-700/60 dark:text-sky-300/60 mt-1">A safe space to talk about school stress, burnout, or any academic challenges you&apos;re facing.</p>
                        </div>
                    </div>
                </div>

                <h2 className="text-2xl font-bold text-sky-800 dark:text-sky-200 mt-12 mb-6">Interactive Learning Widgets</h2>
                <p className="text-lg leading-[1.8] text-sky-800/70 dark:text-sky-300/70 mb-8">
                    Aurora doesn&apos;t just send text. She sends <b>Interactive teaching tools</b>:
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-16">
                    <div className="p-6 rounded-[20px] bg-[#f5f9fc] dark:bg-zinc-800 border border-sky-200/40 dark:border-sky-800/30">
                        <div className="flex items-center gap-3 mb-4">
                            <MessageSquare className="w-5 h-5 text-sky-500" />
                            <h4 className="font-bold text-sky-800 dark:text-sky-200">Smart Buttons</h4>
                        </div>
                        <p className="text-sm text-sky-700/60 dark:text-sky-300/60 leading-relaxed">
                            Quick response buttons at the end of messages let you dive deeper into a topic with one click. You can also press the corresponding letter on your keyboard to trigger them instantly.
                        </p>
                    </div>

                    <div className="p-6 rounded-[20px] bg-[#f5f9fc] dark:bg-zinc-800 border border-sky-200/40 dark:border-sky-800/30">
                        <div className="flex items-center gap-3 mb-4">
                            <CheckCircle className="w-5 h-5 text-emerald-500" />
                            <h4 className="font-bold text-sky-800 dark:text-sky-200">Smart Checklists</h4>
                        </div>
                        <p className="text-sm text-sky-700/60 dark:text-sky-300/60 leading-relaxed">
                            When you ask for a study plan, Aurora generates a real-time editable checklist. You can check off items as you complete them to track your progress directly in the chat.
                        </p>
                    </div>
                </div>

                <h2 className="text-2xl font-bold text-sky-800 dark:text-sky-200 mt-12 mb-6 flex items-center gap-3">
                    <ShieldAlert className="w-6 h-6 text-rose-500" />
                    Educational Guidelines &amp; Ethics
                </h2>
                <p className="text-lg leading-[1.8] text-sky-800/70 dark:text-sky-300/70 mb-6">
                    Aurora is designed to be a <b>tutor</b>, not a shortcut. We believe in academic integrity and deep understanding. To ensure Aurora remains a positive force for your education, we&apos;ve established clear guidelines:
                </p>

                <div className="bg-[#f5f9fc] dark:bg-zinc-800 border border-sky-200/40 dark:border-sky-800/30 rounded-[20px] p-6 mb-12">
                    <ul className="space-y-4">
                        <li className="flex gap-3 text-sm text-sky-800/80 dark:text-sky-300/80">
                            <CheckCircle className="w-5 h-5 text-sky-500 shrink-0" />
                            <span><b>No Direct Answers:</b> Aurora will guide you through the logic of a problem rather than just providing the solution.</span>
                        </li>
                        <li className="flex gap-3 text-sm text-sky-800/80 dark:text-sky-300/80">
                            <CheckCircle className="w-5 h-5 text-sky-500 shrink-0" />
                            <span><b>Critical Thinking:</b> She is programmed to ask &quot;Why?&quot; and &quot;How?&quot; to prompt your own discovery.</span>
                        </li>
                        <li className="flex gap-3 text-sm text-sky-800/80 dark:text-sky-300/80">
                            <CheckCircle className="w-5 h-5 text-sky-500 shrink-0" />
                            <span><b>Safety First:</b> Suspicious conversations are internally flagged to maintain a safe and productive environment.</span>
                        </li>
                    </ul>
                    <div className="mt-6 pt-6 border-t border-sky-200/40 dark:border-sky-800/30">
                        <Link href="/ai-guidelines" className="text-sky-600 dark:text-sky-400 font-bold hover:underline inline-flex items-center gap-2 text-sm">
                            View Full AI Guidelines Page <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>
                </div>

                <h2 className="text-2xl font-bold text-sky-800 dark:text-sky-200 mt-12 mb-6 flex items-center gap-3">
                    <Timer className="w-6 h-6 text-sky-500" />
                    Usage &amp; Rate Limits
                </h2>
                <p className="text-lg leading-[1.8] text-sky-800/70 dark:text-sky-300/70 mb-6">
                    To provide high-quality AI access to all students fairly, we use daily message quotas. Your limits reset every 24 hours at midnight.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12">
                    <div className="p-4 rounded-[16px] border border-sky-200/40 dark:border-sky-800/30 bg-[#f5f9fc] dark:bg-zinc-800 text-center">
                        <span className="block text-2xl font-bold text-teal-500 mb-1">100</span>
                        <span className="text-xs text-sky-600/60 dark:text-sky-400/60 uppercase tracking-wider font-medium">Quick Messages</span>
                    </div>
                    <div className="p-4 rounded-[16px] border border-sky-200/40 dark:border-sky-800/30 bg-[#f5f9fc] dark:bg-zinc-800 text-center">
                        <span className="block text-2xl font-bold text-purple-500 mb-1">30</span>
                        <span className="text-xs text-sky-600/60 dark:text-sky-400/60 uppercase tracking-wider font-medium">Deep Messages</span>
                    </div>
                    <div className="p-4 rounded-[16px] border border-sky-200/40 dark:border-sky-800/30 bg-[#f5f9fc] dark:bg-zinc-800 text-center">
                        <span className="block text-2xl font-bold text-sky-500 mb-1">20</span>
                        <span className="text-xs text-sky-600/60 dark:text-sky-400/60 uppercase tracking-wider font-medium">Cloud Messages</span>
                    </div>
                </div>

                <div className="mt-16 p-8 rounded-[24px] bg-sky-600 text-white">
                    <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                        <Zap className="w-5 h-5 text-yellow-300" />
                        Pro Tip: Dynamic Presence
                    </h3>
                    <p className="text-sky-100 leading-relaxed italic">
                        &quot;Watch the Aura sphere at the bottom of the input. It speeds up when she&apos;s thinking and changes colors based on the intelligence mode you&apos;ve selected. You can also resize the side panel by dragging the edges to fit your workspace perfectly.&quot;
                    </p>
                </div>
            </motion.section>
        </TutorialArticleTemplate>
    );
}
