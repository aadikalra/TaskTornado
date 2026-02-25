'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Plus, HelpCircle, Sparkle, Layers, AlertTriangle, Trash2 } from 'lucide-react';
import { InteractiveQuiz, QuizQuestion } from '@/components/Quiz';
import { useAuth } from '@/context/AuthContext';
import { useRequireAuth } from '@/hooks/use-require-auth';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { useRouteIntro } from '@/hooks/use-route-intro';
import { RouteIntroPopup } from '@/components/RouteIntroPopup';
import { useAI } from '@/context/AIContext';

interface SavedQuiz {
    title: string;
    questions: QuizQuestion[];
    createdAt: string;
}

export default function QuizPage() {
    const { authenticated } = useRequireAuth();
    if (!authenticated) return null;
    const router = useRouter();
    const { user } = useAuth();
    const [currentQuestions, setCurrentQuestions] = useState<QuizQuestion[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [studying, setStudying] = useState(false);
    const [studyingTitle, setStudyingTitle] = useState('');
    const [tempQuestions, setTempQuestions] = useState<QuizQuestion[]>([]);
    const [savedQuizzes, setSavedQuizzes] = useState<SavedQuiz[]>([]);
    const { showIntro, dismissIntro } = useRouteIntro('quiz');
    const { setAIAssistantOpen, setAIInput } = useAI();

    const openQuizAssistant = () => {
        setAIInput('@quiz ');
        setAIAssistantOpen(true);
    };

    // Load temp quiz + saved quizzes from localStorage
    useEffect(() => {
        const savedQuiz = localStorage.getItem('currentQuiz');
        if (savedQuiz) {
            try { setTempQuestions(JSON.parse(savedQuiz)); } catch { }
        }
        const saved = localStorage.getItem('savedQuizzes');
        if (saved) {
            try { setSavedQuizzes(JSON.parse(saved)); } catch { }
        }
        setIsLoading(false);
    }, []);

    const studyQuiz = (questions: QuizQuestion[], title: string) => {
        setCurrentQuestions(questions);
        setStudyingTitle(title);
        setStudying(true);
    };

    const deleteQuiz = (index: number, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!confirm('Delete this quiz?')) return;
        const updated = savedQuizzes.filter((_, i) => i !== index);
        setSavedQuizzes(updated);
        localStorage.setItem('savedQuizzes', JSON.stringify(updated));
        toast.success('Quiz deleted');
    };

    const BackgroundOrbs = () => (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-sky-200/20 dark:bg-sky-500/[0.06] rounded-full blur-[140px]" />
            <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-[#ebf6b5]/30 dark:bg-emerald-500/[0.04] rounded-full blur-[120px]" />
            <div className="absolute top-1/3 right-0 w-[300px] h-[300px] bg-[#ebf6b5]/20 dark:bg-emerald-500/[0.04] rounded-full blur-[100px]" />
        </div>
    );

    // ── Loading ──
    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#fffaf4] dark:bg-gray-950 relative">
                <BackgroundOrbs />
                <div className="relative z-10 w-full mx-auto px-4 sm:px-6 md:px-12 lg:px-16 pt-28 pb-16">
                    <h1 className="text-4xl sm:text-5xl font-bold text-sky-500 dark:text-sky-400 tracking-tight mb-6">
                        Quizzes
                    </h1>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="bg-[#f5f9fc] dark:bg-gray-900 rounded-2xl border border-sky-100 dark:border-gray-800 p-6">
                                <div className="h-5 w-32 bg-sky-100 rounded-lg mb-3 animate-pulse" />
                                <div className="h-4 w-24 bg-sky-50 rounded-lg animate-pulse" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    // ── Taking a quiz ──
    if (studying && currentQuestions.length > 0) {
        return (
            <div className="min-h-screen bg-[#fffaf4] dark:bg-gray-950 relative">
                <BackgroundOrbs />
                <div className="relative z-10 w-full mx-auto px-4 sm:px-6 md:px-12 lg:px-16 pt-28 pb-16">
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
                        <div className="flex items-start justify-between">
                            <div>
                                <h1 className="text-4xl sm:text-5xl font-bold text-sky-500 dark:text-sky-400 tracking-tight mb-2">
                                    {studyingTitle}
                                </h1>
                                <p className="text-sky-600/50 dark:text-sky-400/50 text-sm font-medium">
                                    {currentQuestions.length} questions
                                </p>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => { setStudying(false); setCurrentQuestions([]); }}
                                    className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-sky-600 dark:text-sky-400 hover:bg-sky-500/5 rounded-xl transition-colors"
                                >
                                    <ArrowLeft className="h-4 w-4" />
                                    All Quizzes
                                </button>
                                <button
                                    onClick={openQuizAssistant}
                                    className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-sky-700 bg-[#ebf6b5] hover:bg-[#e0efa0] border border-[#d4e88e] rounded-xl transition-colors"
                                >
                                    <Plus className="h-4 w-4" />
                                    New
                                </button>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
                        <InteractiveQuiz questions={currentQuestions} />
                    </motion.div>
                </div>

                <RouteIntroPopup
                    isOpen={showIntro}
                    onClose={dismissIntro}
                    title="Welcome to Quizzes!"
                    description="Test your knowledge with AI-generated quizzes"
                    icon={<HelpCircle className="h-6 w-6" />}
                    features={[
                        'Generate quizzes using the AI Aurora',
                        'Answer multiple-choice questions',
                        'Get instant feedback and explanations',
                        'Track your score per session',
                    ]}
                />
            </div>
        );
    }

    // ── Default: All Quizzes view ──
    const hasTempQuiz = tempQuestions.length > 0;
    const hasSaved = savedQuizzes.length > 0;
    const isEmpty = !hasTempQuiz && !hasSaved;

    return (
        <div className="min-h-screen bg-[#fffaf4] dark:bg-gray-950 relative">
            <BackgroundOrbs />
            <div className="relative z-10 w-full mx-auto px-4 sm:px-6 md:px-12 lg:px-16 pt-28 pb-16">

                {/* Header */}
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
                    <div className="flex items-start justify-between">
                        <div>
                            <h1 className="text-4xl sm:text-5xl font-bold text-sky-500 dark:text-sky-400 tracking-tight mb-2">
                                Quizzes
                            </h1>
                            <p className="text-sky-600/50 dark:text-sky-400/50 text-sm font-medium">
                                Test your knowledge with interactive quizzes
                            </p>
                        </div>
                        <button
                            onClick={openQuizAssistant}
                            className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-sky-700 bg-[#ebf6b5] hover:bg-[#e0efa0] border border-[#d4e88e] rounded-xl transition-colors"
                        >
                            <Sparkle className="h-4 w-4" />
                            Create with Aurora
                        </button>
                    </div>
                </motion.div>

                {/* Info notice */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.03 }}
                    className="mb-8 flex items-center gap-2 px-4 py-3 bg-[#f5f9fc] dark:bg-gray-900 rounded-xl border border-sky-100 dark:border-gray-800"
                >
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                    <p className="text-xs text-sky-600/60 dark:text-sky-400/60">
                        Quizzes are saved locally in your browser and will be cleared when you log out or clear browser data.
                    </p>
                </motion.div>

                {/* Empty state */}
                {isEmpty && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.05 }}
                        className="flex flex-col items-center justify-center py-24"
                    >
                        <div className="w-20 h-20 bg-[#f5f9fc] dark:bg-gray-800 rounded-3xl border border-sky-100 dark:border-gray-700 flex items-center justify-center mb-6">
                            <HelpCircle className="h-9 w-9 text-sky-500/30 dark:text-sky-400/30" />
                        </div>
                        <h3 className="text-xl font-bold text-sky-900 dark:text-white mb-2">
                            No Quizzes Yet
                        </h3>
                        <p className="text-sm text-sky-600/50 dark:text-sky-400/50 mb-8 max-w-sm text-center">
                            Generate a quiz with Aurora AI to test your knowledge
                        </p>
                        <button
                            onClick={openQuizAssistant}
                            className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-sky-700 bg-[#ebf6b5] hover:bg-[#e0efa0] border border-[#d4e88e] rounded-xl transition-colors"
                        >
                            <Sparkle className="h-4 w-4" />
                            Open Aurora
                        </button>
                    </motion.div>
                )}

                {/* Temporarily Saved (current session) */}
                {hasTempQuiz && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.05 }}
                        className="mb-10"
                    >
                        <div className="flex items-center gap-2 mb-4">
                            <h2 className="text-sm font-bold text-sky-500 dark:text-sky-400 uppercase tracking-widest">
                                Current Session
                            </h2>
                            <div className="flex items-center gap-1 px-2 py-0.5 bg-amber-100 dark:bg-amber-500/20 rounded-full">
                                <AlertTriangle className="w-2.5 h-2.5 text-amber-600 dark:text-amber-400" />
                                <span className="text-[9px] font-bold text-amber-600 dark:text-amber-400 uppercase">Temporary</span>
                            </div>
                        </div>
                        <div
                            onClick={() => studyQuiz(tempQuestions, tempQuestions[0]?.topic || 'Quiz')}
                            className="group cursor-pointer bg-[#ebf6b5]/40 dark:bg-gray-900 rounded-2xl border border-[#d4e88e]/60 dark:border-gray-800 p-5 hover:shadow-lg hover:border-[#d4e88e] dark:hover:border-gray-700 transition-all max-w-sm"
                        >
                            <div className="flex items-start gap-3">
                                <div className="w-9 h-9 bg-[#ebf6b5] dark:bg-emerald-500/10 rounded-xl flex items-center justify-center border border-[#d4e88e]/50">
                                    <HelpCircle className="h-4 w-4 text-sky-700 dark:text-emerald-400" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-base font-bold text-sky-900 dark:text-white truncate">
                                        {tempQuestions[0]?.topic || 'Recent Quiz'}
                                    </h3>
                                    <p className="text-xs text-sky-600/50 dark:text-sky-400/50">
                                        {tempQuestions.length} question{tempQuestions.length !== 1 ? 's' : ''}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Saved Quizzes (localStorage) */}
                {hasSaved && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: hasTempQuiz ? 0.1 : 0.05 }}
                    >
                        <h2 className="text-sm font-bold text-sky-500 dark:text-sky-400 uppercase tracking-widest mb-4">
                            Saved Quizzes
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {savedQuizzes.map((quiz, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.05 + index * 0.03 }}
                                    onClick={() => studyQuiz(quiz.questions, quiz.title)}
                                    className="group cursor-pointer bg-[#f5f9fc] dark:bg-gray-900 rounded-2xl border border-sky-100 dark:border-gray-800 p-5 hover:shadow-lg hover:border-sky-200 dark:hover:border-gray-700 transition-all"
                                >
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="w-9 h-9 bg-sky-100 dark:bg-sky-500/10 rounded-xl flex items-center justify-center">
                                            <Layers className="h-4 w-4 text-sky-500 dark:text-sky-400" />
                                        </div>
                                        <button
                                            onClick={(e) => deleteQuiz(index, e)}
                                            className="p-1.5 rounded-lg text-red-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-all"
                                        >
                                            <Trash2 className="h-3.5 w-3.5" />
                                        </button>
                                    </div>
                                    <h3 className="text-base font-bold text-sky-900 dark:text-white mb-1 truncate group-hover:text-sky-600 dark:group-hover:text-sky-300 transition-colors">
                                        {quiz.title}
                                    </h3>
                                    <p className="text-xs text-sky-600/50 dark:text-sky-400/50 mb-3">
                                        {quiz.questions.length} questions
                                    </p>
                                    <p className="text-[10px] font-medium text-sky-500/30 dark:text-sky-400/30 uppercase tracking-wider">
                                        {new Date(quiz.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                    </p>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </div>

            <RouteIntroPopup
                isOpen={showIntro}
                onClose={dismissIntro}
                title="Welcome to Quizzes!"
                description="Test your knowledge with AI-generated quizzes"
                icon={<HelpCircle className="h-6 w-6" />}
                features={[
                    'Generate quizzes using the AI Aurora',
                    'Answer multiple-choice questions',
                    'Get instant feedback and explanations',
                    'Track your score per session',
                ]}
            />
        </div>
    );
}
