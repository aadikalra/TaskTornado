'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { TutorialArticleTemplate } from '@/components/TutorialArticleTemplate';
import Image from 'next/image';
import { HugeIcon } from '@/lib/huge-icon-map';

const stepData = [
    {
        icon: <HugeIcon name="Rocket" />,
        color: 'bg-sky-500/15 text-sky-500',
        title: 'Welcome Screen',
        description:
            'The moment you sign in for the first time, TaskTornado greets you by name with a personalized welcome screen. Tap "Let\'s Go" to begin the one-minute setup wizard, or "Skip for now" if you want to explore first — you can always run the setup later from Settings.',
    },
    {
        icon: <HugeIcon name="GraduationCap" />,
        color: 'bg-purple-500/15 text-purple-500',
        title: 'Grade Level',
        description:
            'Select your current grade (7th through 12th). This is the foundation of your workspace — TaskTornado uses it to auto-populate a suggested course map with standard core classes (Math, English, History, and Science) tailored to your level. A "Suggested Path" preview appears instantly so you can see exactly what will be created.',
    },
    {
        icon: <HugeIcon name="MessageCircle" />,
        color: 'bg-pink-500/15 text-pink-500',
        title: 'World Language',
        description:
            'For 8th and 9th graders, a world language is required — choose between Spanish and Mandarin. For grades 10-12, language is optional; simply tap "Yes" or "No." If you\'re taking a language, a level slider lets you pick your exact placement from Level 1 up to AP, and TaskTornado auto-suggests the right level based on your grade progression.',
    },
    {
        icon: <HugeIcon name="Calculator" />,
        color: 'bg-amber-500/15 text-amber-500',
        title: 'Math Placement',
        description:
            'A drag slider lets you set your exact math course. The system shows the full progression (Math 7 → Math 8 → IM1 → IM2 → IM3 → AP Calc AB → AP Calc BC → AP Stats) and lets you accelerate up to 4 grades ahead. If your slider lands on the IM3 slot, a follow-up panel asks whether you\'re in IM3 or Precalculus. The suggested path preview updates in real time.',
    },
    {
        icon: <HugeIcon name="BookOpen" />,
        color: 'bg-emerald-500/15 text-emerald-500',
        title: 'Elective Selection',
        description:
            'Choose your electives from a searchable grid of 16 options spanning PE (Aerobic Walking, Team Sports), Sciences (Marine Science), Music (Music Appreciation, Beginning Band, Concert Band, Guitar, Choir), Leadership, Arts (Theater Arts, Yearbook, Creative Writing, Digital Media Arts), Academic Support, and Computer Science. The number of slots depends on your language choice — 2 electives if you\'re not taking a language, 1 if you are.',
    },
    {
        icon: <HugeIcon name="CheckmarkCircle02" />,
        color: 'bg-[#ebf6b5]/60 text-sky-700',
        title: 'Summary & Creation',
        description:
            'The final summary screen displays every class that will be created — your core subjects, math placement, language (if any), and electives — each with its assigned color dot. Review the list, then tap "Create Classes." TaskTornado instantly builds your dashboard, assigns unique color codes, and prepares your workspace for the semester. It takes about three seconds.',
    },
];

export default function OnboardingTutorialPage() {
    return (
        <TutorialArticleTemplate
            title="Getting Started"
            category="Getting Started"
            description="A comprehensive guide to the onboarding wizard — from your personalized welcome screen to a fully built academic dashboard in under a minute."
            nextTutorial={{
                title: "Priority Stars",
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
                {/* Hero image */}
                <div className="relative w-full h-[400px] mb-12 rounded-2xl overflow-hidden shadow-2xl shadow-sky-500/[0.08]">
                    <Image
                        src="/OnboardingPhoto.jpeg"
                        alt="TaskTornado Onboarding"
                        fill
                        className="object-cover"
                        priority
                    />
                </div>

                {/* Intro quote */}
                <p className="text-xl leading-[1.6] text-sky-700/80 dark:text-sky-300/80 mb-8 font-serif italic text-center px-8 border-l-4 border-sky-500">
                    &quot;The secret of getting ahead is getting started. The secret of getting started is breaking your complex overwhelming tasks into small manageable tasks, and then starting on the first one.&quot;
                </p>

                {/* Intro paragraph */}
                <p className="text-lg leading-[1.8] text-sky-800/70 dark:text-sky-300/70 mb-6">
                    TaskTornado&apos;s onboarding wizard isn&apos;t a quick-and-dirty name prompt. It&apos;s a six-step setup flow that builds a personalized workspace around your actual academic schedule — the right grade, the right math level, the right language, and the electives you&apos;re actually taking. Everything you select feeds into your dashboard, calendar, and AI assistant from day one.
                </p>

                {/* The flow overview */}
                <h2 className="text-2xl font-bold text-sky-800 dark:text-sky-200 mt-12 mb-6">The 6-Step Flow</h2>

                <div className="space-y-6">
                    {stepData.map((step, index) => {
                        return (
                            <motion.div
                                key={step.title}
                                initial={{ opacity: 0, y: 16 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.06 }}
                                className="bg-[#f5f9fc] dark:bg-zinc-800 rounded-2xl p-6 border border-sky-100/60 dark:border-sky-800/30"
                            >
                                <div className="flex items-start gap-4">
                                    <div className={`shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${step.color}`}>
                                        {step.icon}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-3 mb-2">
                                            <span className="text-[11px] font-bold text-sky-500/50 dark:text-sky-400/50 tabular-nums">
                                                STEP {index + 1}
                                            </span>
                                        </div>
                                        <h3 className="text-lg font-bold text-sky-800 dark:text-sky-200 mb-2">{step.title}</h3>
                                        <p className="text-[15px] leading-[1.7] text-sky-800/60 dark:text-sky-300/60">
                                            {step.description}
                                        </p>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>

                {/* Smart details */}
                <h2 className="text-2xl font-bold text-sky-800 dark:text-sky-200 mt-16 mb-4">Smart Details Worth Knowing</h2>

                <ul className="space-y-4 text-lg leading-[1.8] text-sky-800/70 dark:text-sky-300/70">
                    <li>
                        <strong className="text-sky-800 dark:text-sky-200">Dynamic elective slots</strong> — Taking a language eats one of your two elective slots, so the wizard adjusts the count automatically. No confusion.
                    </li>
                    <li>
                        <strong className="text-sky-800 dark:text-sky-200">Language level auto-suggest</strong> — When you pick your grade, the default language level updates to match the typical progression (e.g. 9th grade defaults to Level 2).
                    </li>
                    <li>
                        <strong className="text-sky-800 dark:text-sky-200">IM3 / Precalc fork</strong> — If your math slider lands on the IM3 position, a secondary panel appears asking whether you&apos;re taking IM3 or Precalculus. The summary updates in real time.
                    </li>
                    <li>
                        <strong className="text-sky-800 dark:text-sky-200"><HugeIcon name="Search01" /> Searchable electives</strong> — With 16 elective options, a built-in search bar helps you find yours quickly.
                    </li>
                    <li>
                        <strong className="text-sky-800 dark:text-sky-200">Color-coded preview</strong> — The summary shows each class with the color dot that will appear on your dashboard, so you can mentally map your schedule before it&apos;s created.
                    </li>
                    <li>
                        <strong className="text-sky-800 dark:text-sky-200">Instant workspace</strong> — Tapping &quot;Create Classes&quot; generates your full dashboard in seconds — classes, color assignments, and workspace structure, all ready to go.
                    </li>
                </ul>

                {/* After onboarding */}
                <h2 className="text-2xl font-bold text-sky-800 dark:text-sky-200 mt-16 mb-4">After Setup</h2>
                <p className="text-lg leading-[1.8] text-sky-800/70 dark:text-sky-300/70 mb-6">
                    Once the wizard finishes, you&apos;ll land on your dashboard with a quick guided tour highlighting the Navigation dock, Instant <HugeIcon name="Search01" /> Search (⌘K), Aurora AI, Calendar, App Drawer, Notifications, Preferences, and your class management area. After that, you&apos;re fully set — add homework, schedule tests, and let TaskTornado keep you on track.
                </p>
                <p className="text-lg leading-[1.8] text-sky-800/70 dark:text-sky-300/70">
                    You can always add or remove classes later from the dashboard. The onboarding just gives you the fastest possible start.
                </p>
            </motion.section>
        </TutorialArticleTemplate>
    );
}
