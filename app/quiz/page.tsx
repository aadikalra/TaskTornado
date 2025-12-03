'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Plus, Home, HelpCircle } from 'lucide-react';
import { InteractiveQuiz, QuizQuestion } from '@/components/Quiz';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useWideLayout } from '@/hooks/use-wide-layout';
import { useRouteIntro } from '@/hooks/use-route-intro';
import { RouteIntroPopup } from '@/components/RouteIntroPopup';

export default function QuizPage() {
    const router = useRouter();
    const { user } = useAuth();
    const { getContainerClass } = useWideLayout();
    const [questions, setQuestions] = useState<QuizQuestion[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { showIntro, dismissIntro } = useRouteIntro('quiz');

    // Check for quiz in localStorage
    useEffect(() => {
        const savedQuiz = localStorage.getItem('currentQuiz');
        if (savedQuiz) {
            try {
                setQuestions(JSON.parse(savedQuiz));
            } catch (error) {
                console.error('Error parsing quiz:', error);
                toast.error('Failed to load quiz questions');
            }
        }
        setIsLoading(false);
    }, []);

    const handleSave = (updatedQuestions: QuizQuestion[]) => {
        // Update the local state to reflect any changes
        setQuestions(updatedQuestions);
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-white dark:bg-gray-950">
                <div className={getContainerClass() + ' py-16'}>
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-16"
                    >
                        <h1 className="text-4xl font-light text-gray-900 dark:text-white mb-3 tracking-tight">
                            Quiz
                        </h1>
                        <p className="text-gray-500 dark:text-gray-400">
                            Test your knowledge with interactive quizzes
                        </p>
                    </motion.div>

                    <div className="space-y-6">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="border-b border-gray-200 dark:border-gray-800 pb-6">
                                <div className="h-6 w-48 bg-gray-100 dark:bg-gray-800 rounded mb-2 animate-pulse" />
                                <div className="h-4 w-32 bg-gray-100 dark:bg-gray-800 rounded mb-4 animate-pulse" />
                                <div className="h-10 w-24 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    // If we have no questions to display
    if (questions.length === 0) {
        return (
            <div className="min-h-screen bg-white dark:bg-gray-950">
                <div className={getContainerClass() + ' py-16'}>
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-16"
                    >
                        <h1 className="text-4xl font-light text-gray-900 dark:text-white mb-3 tracking-tight">
                            Quiz
                        </h1>
                        <p className="text-gray-500 dark:text-gray-400">
                            Test your knowledge with interactive quizzes
                        </p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.05 }}
                    >
                        <div className="text-center py-16">
                            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full mb-4">
                                <HelpCircle className="h-8 w-8 text-gray-400" />
                            </div>
                            <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
                                No Quiz Questions Found
                            </h3>
                            <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md text-center mx-auto">
                                It looks like you don't have any quiz questions to answer. Generate some from the Study Assistant!
                            </p>
                            <div className="flex flex-col sm:flex-row gap-3 justify-center">
                                <Button onClick={() => router.push('/study-assistant')} className="gap-2">
                                    <Plus className="h-4 w-4" />
                                    Go to Study Assistant
                                </Button>
                            </div>
                        </div>
                    </motion.div>

                    {/* Footer */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="mt-20 pt-8 border-t border-gray-200 dark:border-gray-800"
                    >
                        <div className="flex items-center justify-between">
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Built for students • Public Beta v2.0.2
                            </p>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => router.push('/')}
                                className="gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                            >
                                <Home className="h-4 w-4" />
                                <span>Home</span>
                            </Button>
                        </div>
                    </motion.div>
                </div>
            </div>
        );
    }

    const quizTopic = questions[0]?.topic || 'Quiz';

    return (
        <div className="min-h-screen bg-white dark:bg-gray-950">
            <div className={getContainerClass() + ' py-16'}>

                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-16"
                >
                    <div className="flex items-start justify-between">
                        <div>
                            <h1 className="text-4xl font-light text-gray-900 dark:text-white mb-3 tracking-tight">
                                {quizTopic}
                            </h1>
                            <p className="text-gray-500 dark:text-gray-400">
                                {questions.length} multiple-choice questions
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => router.back()}
                                className="gap-2"
                            >
                                <ArrowLeft className="h-4 w-4" />
                                Back
                            </Button>
                            <Button asChild>
                                <Link href="/study-assistant" className="gap-2">
                                    <Plus className="h-4 w-4" />
                                    New
                                </Link>
                            </Button>
                        </div>
                    </div>
                </motion.div>

                {/* Quiz */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 }}
                >
                    <div className="border border-gray-200 dark:border-gray-800 rounded-xl p-6 bg-white dark:bg-gray-900">
                        <InteractiveQuiz questions={questions} onSave={handleSave} />
                    </div>
                </motion.div>

                {/* Footer */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="mt-20 pt-8 border-t border-gray-200 dark:border-gray-800"
                >
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Built for students • Public Beta v2.0.2
                        </p>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => router.push('/')}
                            className="gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                        >
                            <Home className="h-4 w-4" />
                            <span>Home</span>
                        </Button>
                    </div>
                </motion.div>
            </div>

            {/* Route Intro Popup */}
            <RouteIntroPopup
                isOpen={showIntro}
                onClose={dismissIntro}
                title="Welcome to Interactive Quizzes!"
                description="Test your knowledge with AI-generated multiple-choice quizzes"
                icon={<HelpCircle className="h-6 w-6" />}
                features={[
                    'Generate quizzes using the AI Study Assistant',
                    'Answer multiple-choice questions',
                    'Get instant feedback on your answers',
                    'Track your score and review explanations',
                ]}
            />
        </div>
    );
}
