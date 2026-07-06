'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { TutorialArticleTemplate } from '@/components/TutorialArticleTemplate';
import Image from 'next/image';
import { HugeIcon } from '@/lib/huge-icon-map';
import { PlayfulHomeworkList } from '@/components/PlayfulHomeworkList';

const FlameIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    className={className}
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinejoin="round"
  >
    <path d="M12 22C16.4183 22 20 18.4183 20 14C20 8 12 2 12 2C11.6117 4.48692 11.2315 5.82158 10 8C8.79908 7.4449 8.5 7 8 5.75C6 8 4 11 4 14C4 18.4183 7.58172 22 12 22Z" />
    <path d="M12 18C13.6569 18 15 16.6569 15 15C15 13.5 13.5 12 12 11C10.5 12 9 13.5 9 15C9 16.6569 10.3431 18 12 18Z" />
  </svg>
);

export default function StarringHomeworkTutorialPage() {
    return (
        <TutorialArticleTemplate
            title="Priority Stars"
            category="Features"
            description="Learn how to highlight your most important assignments by converting their priority tags into prominent stars."
            nextTutorial={{
                title: "Test Details",
                href: "/tutorials/test-details"
            }}
        >
            <motion.section
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="mb-12"
            >
                <div className="relative w-full mb-12 rounded-2xl overflow-hidden shadow-2xl shadow-sky-500/[0.08]">
                    <Image
                        src="/StarringTutorial.png"
                        alt="Starring Homeworks Tutorial"
                        width={986}
                        height={480}
                        className="w-full h-auto"
                        priority
                    />
                </div>

                <p className="text-xl leading-[1.6] text-sky-700/80 dark:text-sky-300/80 mb-8 font-serif italic text-center px-8 border-l-4 border-sky-500">
                    &quot;Setting priorities is the key to managing your workload. In TaskTornado, we&apos;ve made it as simple as a single click to highlight what matters most.&quot;
                </p>

                <p className="text-lg leading-[1.8] text-sky-800/70 dark:text-sky-300/70 mb-6">
                    Managing a heavy course load means constantly deciding what needs your attention first. While priority tags (High, Medium, Low) are great for organization, sometimes you need a specific task to stand out visually across your dashboard. That&apos;s where <b>Starring</b> comes in.
                </p>

                <h2 className="text-2xl font-bold text-sky-500 dark:text-sky-400 mt-12 mb-4">Why Star a Homework?</h2>
                <p className="text-lg leading-[1.8] text-sky-800/70 dark:text-sky-300/70 mb-6">
                    A star is more than just a priority level; it&apos;s a visual bookmark. When you star a homework assignment, it replaces the standard priority tag with a bright, eye-catching star. This makes it instantly recognizable in your list, helping you focus on your &quot;must-do&quot; items for the day.
                </p>

                <h2 className="text-2xl font-bold text-sky-500 dark:text-sky-400 mt-12 mb-4">How to Star an Assignment</h2>
                <p className="text-lg leading-[1.8] text-sky-800/70 dark:text-sky-300/70 mb-6">
                    The process is designed to be fast and intuitive:
                </p>
                <ol className="list-decimal list-inside space-y-4 text-lg text-sky-800/70 dark:text-sky-300/70 mb-8">
                    <li>Locate the homework item on your <b>Dashboard</b> or in the <b>Homework</b> tab.</li>
                    <li>Look for the priority tag (e.g., <span className="inline-flex items-center gap-1 align-middle"><span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-red-100 dark:bg-red-500/15"><FlameIcon className="w-3 h-3 text-red-500 dark:text-red-400" /></span><span className="text-red-500 font-semibold">High</span></span>, <span className="inline-flex items-center gap-1 align-middle"><span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-orange-100 dark:bg-orange-500/12"><HugeIcon name="AlertCircle" className="w-3 h-3 text-orange-500 dark:text-orange-400" /></span><span className="text-orange-500 font-semibold">Medium</span></span>, or <span className="inline-flex items-center gap-1 align-middle"><span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-green-100 dark:bg-green-500/10"><HugeIcon name="MinusSignCircle" className="w-3 h-3 text-green-500/60 dark:text-green-400/50" /></span><span className="text-green-500 font-semibold">Low</span></span>) on the card.</li>
                    <li><b>Simply click directly on the priority tag.</b></li>
                    <li>The tag will instantly transform into a golden star ⭐.</li>
                </ol>

                <h2 className="text-2xl font-bold text-sky-500 dark:text-sky-400 mt-12 mb-4">Unstarring and Re-prioritizing</h2>
                <p className="text-lg leading-[1.8] text-sky-800/70 dark:text-sky-300/70 mb-6">
                    Changed your mind? No problem. Clicking the star again will bring back the original priority selection menu, allowing you to reset the priority or simply unstar the item. This flexibility ensures your dashboard always reflects your current academic focus.
                </p>

                <div className="bg-[#f5f9fc] dark:bg-zinc-800 p-8 rounded-[20px] border border-sky-200/40 dark:border-sky-800/30 mt-12">
                    <h3 className="text-xl font-bold text-sky-500 dark:text-sky-400 mb-3">Pro Tip</h3>
                    <p className="text-sky-700/80 dark:text-sky-300/80">
                        Use Stars for assignments due within the next 24 hours. This creates a clear &quot;Hot List&quot; that you can tackle first thing when you sit down to study.
                    </p>
                </div>

                <div className="mt-20">
                    <h2 className="text-3xl font-bold text-sky-500 dark:text-sky-400 mb-6">Interactive Practice Zone</h2>
                    <p className="text-lg text-sky-800/70 dark:text-sky-300/70 mb-6">
                        Try it out yourself! Below are some &quot;playful&quot; homework tasks. Click on their priority icons to star them.
                    </p>
                    <div className="flex items-center gap-6 mb-8 px-4 py-3 rounded-xl bg-sky-50/60 dark:bg-zinc-800/40 border border-sky-100/50 dark:border-sky-800/20">
                        <span className="text-sm font-medium text-sky-600/50 dark:text-sky-400/40 uppercase tracking-wider">Key</span>
                        <div className="flex items-center gap-2">
                            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-red-100 dark:bg-red-500/15"><FlameIcon className="w-3 h-3 text-red-500 dark:text-red-400" /></span>
                            <span className="text-sm text-sky-800/70 dark:text-sky-300/70">High</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-orange-100 dark:bg-orange-500/12"><HugeIcon name="AlertCircle" className="w-3 h-3 text-orange-500 dark:text-orange-400" /></span>
                            <span className="text-sm text-sky-800/70 dark:text-sky-300/70">Medium</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-green-100 dark:bg-green-500/10"><HugeIcon name="MinusSignCircle" className="w-3 h-3 text-green-500/60 dark:text-green-400/50" /></span>
                            <span className="text-sm text-sky-800/70 dark:text-sky-300/70">Low</span>
                        </div>
                    </div>
                    <div className="bg-[#f5f9fc] dark:bg-zinc-800/50 p-8 rounded-[24px] border border-sky-200/40 dark:border-sky-800/30">
                        <PracticeHomeworkList />
                    </div>
                </div>
            </motion.section>
        </TutorialArticleTemplate>
    );
}

function PracticeHomeworkList() {
    const [items, setItems] = React.useState<any[]>([
        {
            id: 'practice-1',
            text: 'Finish Rocket Science for Cats',
            completed: false,
            subtext: 'Due tomorrow',
            priority: 'high',
            className: 'Astronomy',
            classColor: '#3B82F6',
            dueDateIcon: <div className="w-1 h-1 bg-blue-500 rounded-full" />,
            pinned: false
        },
        {
            id: 'practice-2',
            text: 'Bake a Giant Cookie for History Class',
            completed: false,
            subtext: 'Due in 2 days',
            priority: 'medium',
            className: 'History',
            classColor: '#F59E0B',
            dueDateIcon: <div className="w-1 h-1 bg-amber-500 rounded-full" />,
            pinned: false
        },
        {
            id: 'practice-3',
            text: 'Daily Tap Dancing Practice',
            completed: false,
            subtext: 'Due today (Recurring)',
            priority: 'low',
            className: 'Robotics',
            classColor: '#10B981',
            dueDateIcon: <div className="w-1 h-1 bg-emerald-500 rounded-full" />,
            pinned: false,
            isRecurringInstance: true,
            recurringFrequency: 'daily'
        }
    ]);

    const handleToggle = (id: string) => {
        setItems(prev => prev.map(item =>
            item.id === id ? { ...item, completed: !item.completed } : item
        ));
    };

    const handlePinToggle = (id: string, pinned: boolean) => {
        setItems(prev => prev.map(item =>
            item.id === id ? { ...item, pinned } : item
        ));
    };

    const handleDelete = (id: string) => {
        setItems(prev => prev.filter(item => item.id !== id));
    };

    const handleDeleteSeries = (id: string) => {
        setItems(prev => prev.filter(item => item.id !== id));
        alert('Whole series deleted (simulated)');
    };

    const itemsWithHandlers = items.map(item => ({
        ...item,
        onDelete: () => handleDelete(item.id),
        onDeleteSeries: item.isRecurringInstance ? () => handleDeleteSeries(item.id) : undefined
    }));

    return (
        <PlayfulHomeworkList
            items={itemsWithHandlers}
            onItemToggle={handleToggle}
            onPinToggle={handlePinToggle}
        />
    );
}
