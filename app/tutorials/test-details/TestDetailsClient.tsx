'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { TutorialArticleTemplate } from '@/components/TutorialArticleTemplate';
import EnhancedTestCard from '@/components/EnhancedTestCard';
import { TestDetailModal } from '@/components/TestDetailModal';
import { BookOpen } from 'lucide-react';

export default function TestDetailsTutorialPage() {
    return (
        <TutorialArticleTemplate
            title="Test Details"
            category="Features"
            description="Discover how to access comprehensive information about your upcoming tests, including dates, study materials, and grades."
            nextTutorial={{
                title: "Recurring Homework",
                href: "/tutorials/recurring-homeworks"
            }}
        >
            <motion.section
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="mb-12"
            >
                <p className="text-xl leading-[1.6] text-gray-800 dark:text-gray-200 mb-8 font-serif italic text-center px-8 border-l-4 border-purple-600">
                    "Staying organized for exams is half the battle. TaskTornado keeps all your test-related info in one unified view."
                </p>

                <p className="text-lg leading-[1.8] text-gray-600 dark:text-gray-400 mb-6">
                    A test is more than just a date on a calendar. It's an event that requires preparation, tracking of study materials, and eventually, a record of your success. In TaskTornado, every test card is an entry point to a detailed command center for that specific assessment.
                </p>

                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-12 mb-4">The Test Card Overview</h2>
                <p className="text-lg leading-[1.8] text-gray-600 dark:text-gray-400 mb-6">
                    On your dashboard or tests page, you'll see premium cards representing each exam. These cards give you a quick "at-a-glance" look at:
                </p>
                <ul className="list-disc list-inside space-y-3 text-lg text-gray-600 dark:text-gray-400 mb-8">
                    <li><b>Title & Type:</b> Quickly see if it's a FINAL, ALPHA, BETA, or regular QUIZ.</li>
                    <li><b>Due Date:</b> Clearly marked with natural language labels like "Today" or "In 2 days".</li>
                    <li><b>Subject Icon:</b> Color-coded to match your specific class for instant recognition.</li>
                    <li><b>Current Grade:</b> If the test is completed, your score will appear right on the card.</li>
                </ul>

                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-12 mb-4">Deep Dive: The Detail Modal</h2>
                <p className="text-lg leading-[1.8] text-gray-600 dark:text-gray-400 mb-6">
                    By simply <b>clicking anywhere on a test card</b>, you open the Detail Modal. This is where you'll find the most critical information:
                </p>
                <div className="space-y-6 mb-12">
                    <div className="flex gap-4 items-start">
                        <div className="mt-1 bg-purple-100 p-2 rounded-lg text-purple-600 dark:bg-purple-900/40 dark:text-purple-400">
                            <BookOpen className="w-5 h-5" />
                        </div>
                        <div>
                            <h4 className="font-bold text-gray-900 dark:text-white">Study Materials</h4>
                            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">External links, PDFs, or notes you've attached to the test for quick studying.</p>
                        </div>
                    </div>
                    <div className="flex gap-4 items-start">
                        <div className="mt-1 bg-blue-100 p-2 rounded-lg text-blue-600 dark:bg-blue-900/40 dark:text-blue-400">
                            <BookOpen className="w-5 h-5" />
                        </div>
                        <div>
                            <h4 className="font-bold text-gray-900 dark:text-white">Full Description</h4>
                            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">Detailed notes about what's covered in the exam or specific instructions from your teacher.</p>
                        </div>
                    </div>
                </div>

                <div className="bg-purple-50 dark:bg-purple-900/20 p-8 rounded-2xl border border-purple-100 dark:border-purple-800 mt-12 mb-20">
                    <h3 className="text-xl font-bold text-purple-900 dark:text-purple-100 mb-3">One-Click Management</h3>
                    <p className="text-purple-800 dark:text-purple-200 leading-relaxed">
                        From the details view, you can also <b>Edit</b> or <b>Delete</b> the test. This makes it a one-stop-shop for managing your academic schedule without leaving your current view.
                    </p>
                </div>

                <div className="mt-20">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Interactive Practice Zone</h2>
                    <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 font-medium">
                        Click on the test card below to see the details drawer in action.
                    </p>
                    <div className="bg-gray-50 dark:bg-gray-900/50 p-12 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-inner flex justify-center">
                        <PracticeTestCard />
                    </div>
                </div>
            </motion.section>
        </TutorialArticleTemplate>
    );
}

function PracticeTestCard() {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const sampleTest = {
        id: 'tutorial-test-1',
        title: 'Quantum Physics Final',
        testDate: new Date().toISOString(), // Today
        testTime: '10:30 AM',
        testType: 'FINAL',
        description: 'Covers everything from wave-particle duality to SchrÃ¶dinger\'s cat. Bring a calculator and a pencil.',
        classId: 'class-1',
        status: 'upcoming',
        studyMaterials: [
            { url: 'https://example.com/notes', title: 'Chapter 5 Notes' },
            { url: 'https://example.com/practice', title: 'Practice Exam' }
        ],
        grade: null,
        score: null,
        maxScore: 100
    };

    const sampleClass = {
        id: 'class-1',
        name: 'Physics 101',
        icon: 'Calculator',
        color: '#8B5CF6'
    };

    const handleDelete = async (id: string) => {
        alert('Delete button clicked (Simulated)');
    };

    return (
        <>
            <div className="w-full max-w-sm">
                <EnhancedTestCard
                    test={sampleTest as any}
                    classInfo={sampleClass as any}
                    classIcon={BookOpen}
                    variant="compact"
                    onClick={() => setIsModalOpen(true)}
                />
            </div>

            <TestDetailModal
                test={sampleTest as any}
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onDelete={handleDelete}
                classInfo={sampleClass as any}
            />
        </>
    );
}
