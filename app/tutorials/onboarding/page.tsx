'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { TutorialArticleTemplate } from '@/components/TutorialArticleTemplate';
import Image from 'next/image';

export default function OnboardingTutorialPage() {
    return (
        <TutorialArticleTemplate
            title="Onboarding: Setting Up Your Academic Success"
            description="A comprehensive guide to personalizing your TaskTornado experience, from grade selection to elective optimization."
            readTime="5 min read"
            nextTutorial={{
                title: "Starring Homeworks: Prioritize Your Tasks",
                href: "/tutorials/starring-homeworks",
                label: "Next Lesson"
            }}
        >
            <motion.section
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="mb-12"
            >
                <div className="relative w-full h-[400px] mb-12 rounded-2xl overflow-hidden shadow-2xl">
                    <Image
                        src="/OnboardingPhoto.jpeg"
                        alt="TaskTornado Onboarding"
                        fill
                        className="object-cover"
                        priority
                    />
                </div>

                <p className="text-xl leading-[1.6] text-gray-800 dark:text-gray-200 mb-8 font-serif italic text-center px-8 border-l-4 border-blue-600">
                    "The secret of getting ahead is getting started. The secret of getting started is breaking your complex overwhelming tasks into small manageable tasks, and then starting on the first one."
                </p>

                <p className="text-lg leading-[1.8] text-gray-600 dark:text-gray-400 mb-6">
                    Welcome to TaskTornado! Our onboarding process is designed to be the foundation of your organized academic life. We don't just ask for your name; we help you build a visual and data-driven hub centered around your actual school schedule.
                </p>

                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-12 mb-4">Step 1: Define Your Grade Level</h2>
                <p className="text-lg leading-[1.8] text-gray-600 dark:text-gray-400 mb-6">
                    Your journey begins by specifying your current grade (from 7th to 12th). This is crucial because TaskTornado uses this information to suggest standard core classes like Math, English, History, and Science tailored specifically for your level.
                </p>

                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-12 mb-4">Step 2: Language Requirements</h2>
                <p className="text-lg leading-[1.8] text-gray-600 dark:text-gray-400 mb-6">
                    For our 8th-grade students, the onboarding flow includes a dedicated step for language requirements. You'll be prompted to choose between <b>Spanish</b> and <b>Mandarin</b>. Setting this up early ensures your daily study view includes your language learning goals.
                </p>

                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-12 mb-4">Step 3: Math Acceleration</h2>
                <p className="text-lg leading-[1.8] text-gray-600 dark:text-gray-400 mb-6">
                    We know that every student's math path is unique. Our system allows you to specify if you are in an accelerated math program. If you are, you can indicate how many grade levels ahead you're working (up to 4 years). TaskTornado will then automatically adjust your curriculum tracking to match.
                </p>

                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-12 mb-4">Step 4: Customizing Your Electives</h2>
                <p className="text-lg leading-[1.8] text-gray-600 dark:text-gray-400 mb-6">
                    School isn't just about core subjects. In the Electives step, you can choose 1 (for 8th grade) or 2 (for other grades) additional classes. Our library includes everything from <b>MS Computer Science</b> and <b>Digital Media Arts</b> to <b>Concert Band</b> and <b>Theater Arts</b>.
                </p>

                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-12 mb-4">Final Review and Creation</h2>
                <p className="text-lg leading-[1.8] text-gray-600 dark:text-gray-400 mb-6">
                    The final summary step shows you a preview of your entire academic hub. Once you click "Create Classes," TaskTornado instantly builds your dashboard, assigns unique color codes to each class, and prepares your workspace for the semester ahead.
                </p>
            </motion.section>
        </TutorialArticleTemplate>
    );
}
