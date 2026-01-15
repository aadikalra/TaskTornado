'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { TutorialArticleTemplate } from '@/components/TutorialArticleTemplate';
import Image from 'next/image';
import { PlayfulHomeworkList } from '@/components/PlayfulHomeworkList';

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
                <div className="relative w-full mb-12 rounded-2xl overflow-hidden shadow-2xl">
                    <Image
                        src="/StarringTutorial.png"
                        alt="Starring Homeworks Tutorial"
                        width={986}
                        height={480}
                        className="w-full h-auto"
                        priority
                    />
                </div>

                <p className="text-xl leading-[1.6] text-gray-800 dark:text-gray-200 mb-8 font-serif italic text-center px-8 border-l-4 border-blue-600">
                    "Setting priorities is the key to managing your workload. In TaskTornado, we've made it as simple as a single click to highlight what matters most."
                </p>

                <p className="text-lg leading-[1.8] text-gray-600 dark:text-gray-400 mb-6">
                    Managing a heavy course load means constantly deciding what needs your attention first. While priority tags (High, Medium, Low) are great for organization, sometimes you need a specific task to stand out visually across your dashboard. That's where <b>Starring</b> comes in.
                </p>

                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-12 mb-4">Why Star a Homework?</h2>
                <p className="text-lg leading-[1.8] text-gray-600 dark:text-gray-400 mb-6">
                    A star is more than just a priority level; it's a visual bookmark. When you star a homework assignment, it replaces the standard priority tag with a bright, eye-catching star. This makes it instantly recognizable in your list, helping you focus on your "must-do" items for the day.
                </p>

                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-12 mb-4">How to Star an Assignment</h2>
                <p className="text-lg leading-[1.8] text-gray-600 dark:text-gray-400 mb-6">
                    The process is designed to be fast and intuitive:
                </p>
                <ol className="list-decimal list-inside space-y-4 text-lg text-gray-600 dark:text-gray-400 mb-8">
                    <li>Locate the homework item on your <b>Dashboard</b> or in the <b>Homework</b> tab.</li>
                    <li>Look for the priority tag (e.g., <span className="text-red-500 font-semibold">High</span>, <span className="text-yellow-500 font-semibold">Medium</span>, or <span className="text-green-500 font-semibold">Low</span>) on the card.</li>
                    <li><b>Simply click directly on the priority tag.</b></li>
                    <li>The tag will instantly transform into a golden star ⭐.</li>
                </ol>

                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-12 mb-4">Unstarring and Re-prioritizing</h2>
                <p className="text-lg leading-[1.8] text-gray-600 dark:text-gray-400 mb-6">
                    Changed your mind? No problem. Clicking the star again will bring back the original priority selection menu, allowing you to reset the priority or simply unstar the item. This flexibility ensures your dashboard always reflects your current academic focus.
                </p>

                <div className="bg-blue-50 dark:bg-blue-900/20 p-8 rounded-2xl border border-blue-100 dark:border-blue-800 mt-12">
                    <h3 className="text-xl font-bold text-blue-900 dark:text-blue-100 mb-3">Pro Tip</h3>
                    <p className="text-blue-800 dark:text-blue-200">
                        Use Stars for assignments due within the next 24 hours. This creates a clear "Hot List" that you can tackle first thing when you sit down to study.
                    </p>
                </div>

                <div className="mt-20">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Interactive Practice Zone</h2>
                    <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
                        Try it out yourself! below are some "playful" homework tasks. Click on their priority icons to star them.
                    </p>
                    <div className="bg-gray-50 dark:bg-gray-900/50 p-8 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-inner">
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
        // In this practice list, we'll just remove the item to simulate deleting the series
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
