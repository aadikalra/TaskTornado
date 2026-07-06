'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { HugeIcon } from '@/lib/huge-icon-map';
import { InteractiveQuiz, QuizQuestion } from '@/components/Quiz';
import { useAuth } from '@/context/AuthContext';
import { useRequireAuth } from '@/hooks/use-require-auth';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
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

    // ── Search state ──
    const [searchQuery, setSearchQuery] = useState('');
    const [searchFocused, setSearchFocused] = useState(false);
    const [searchExpanded, setSearchExpanded] = useState(false);
    const searchInputRef = useRef<HTMLInputElement>(null);

    // ── Create dropdown & manual create state ──
    const [createDropdownOpen, setCreateDropdownOpen] = useState(false);
    const createDropdownRef = useRef<HTMLDivElement>(null);
    const [manualCreateOpen, setManualCreateOpen] = useState(false);
    const [manualQuizTitle, setManualQuizTitle] = useState('');
    const [manualQuestions, setManualQuestions] = useState<{
        question: string;
        options: string[];
        correctAnswer: number;
        explanation: string;
    }[]>([
        { question: '', options: ['', '', '', ''], correctAnswer: 0, explanation: '' },
    ]);
    const [savingManual, setSavingManual] = useState(false);

    const filteredQuizzes = useMemo(() => {
        if (!searchQuery) return savedQuizzes;
        const q = searchQuery.toLowerCase();
        return savedQuizzes.filter(quiz =>
            quiz.title.toLowerCase().includes(q)
        );
    }, [savedQuizzes, searchQuery]);

    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (createDropdownRef.current && !createDropdownRef.current.contains(e.target as Node)) {
                setCreateDropdownOpen(false);
            }
        };
        if (createDropdownOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [createDropdownOpen]);

    // Manual quiz helpers
    const addManualQuestion = () => {
        setManualQuestions(prev => [...prev, { question: '', options: ['', '', '', ''], correctAnswer: 0, explanation: '' }]);
    };

    const removeManualQuestion = (index: number) => {
        setManualQuestions(prev => prev.filter((_, i) => i !== index));
    };

    const updateManualQuestion = (index: number, field: 'question' | 'explanation', value: string) => {
        setManualQuestions(prev => prev.map((q, i) => (i === index ? { ...q, [field]: value } : q)));
    };

    const updateManualOption = (questionIndex: number, optionIndex: number, value: string) => {
        setManualQuestions(prev => prev.map((q, i) => {
            if (i === questionIndex) {
                const newOptions = [...q.options];
                newOptions[optionIndex] = value;
                return { ...q, options: newOptions };
            }
            return q;
        }));
    };

    const updateCorrectAnswer = (questionIndex: number, correctAnswer: number) => {
        setManualQuestions(prev => prev.map((q, i) => (i === questionIndex ? { ...q, correctAnswer } : q)));
    };

    const saveManualQuiz = () => {
        const title = manualQuizTitle.trim();
        if (!title) { toast.error('Please enter a quiz title'); return; }
        const validQuestions = manualQuestions.filter(q => q.question.trim() && q.options.every(o => o.trim()));
        if (validQuestions.length === 0) { toast.error('Add at least one question with all options filled'); return; }

        setSavingManual(true);
        try {
            const quizQuestions: QuizQuestion[] = validQuestions.map((q, i) => ({
                id: `manual-${Date.now()}-${i}`,
                question: q.question,
                options: q.options,
                correctAnswer: q.correctAnswer,
                explanation: q.explanation || undefined,
                topic: title,
            }));
            const newQuiz: SavedQuiz = {
                title,
                questions: quizQuestions,
                createdAt: new Date().toISOString(),
            };
            const updated = [...savedQuizzes, newQuiz];
            setSavedQuizzes(updated);
            localStorage.setItem('savedQuizzes', JSON.stringify(updated));
            setManualCreateOpen(false);
            setManualQuizTitle('');
            setManualQuestions([{ question: '', options: ['', '', '', ''], correctAnswer: 0, explanation: '' }]);
            toast.success('Quiz created!');
        } catch (err) {
            console.error(err);
            toast.error('Failed to create quiz');
        } finally {
            setSavingManual(false);
        }
    };

    const openQuizAssistant = () => {
        setCreateDropdownOpen(false);
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
                                    <HugeIcon name="ArrowLeft01" className="h-4 w-4" />
                                    All Quizzes
                                </button>
                                <button
                                    onClick={openQuizAssistant}
                                    className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-sky-700 bg-[#ebf6b5] hover:bg-[#e0efa0] border border-[#d4e88e] rounded-xl transition-colors"
                                >
                                    <HugeIcon name="PlusSign" className="h-4 w-4" />
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
                    icon={<HugeIcon name="Quiz04" size={24} className="h-6 w-6" />}
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
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div>
                            <h1 className="text-4xl sm:text-5xl font-bold text-sky-500 dark:text-sky-400 tracking-tight mb-2">
                                Quizzes
                            </h1>
                            <p className="text-sky-600/50 dark:text-sky-400/50 text-sm font-medium">
                                Test your knowledge with interactive quizzes
                            </p>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                            {/* Expanding Search — icon left, bar slides right */}
                            <motion.div
                                initial={false}
                                animate={{ width: searchExpanded ? 280 : 40 }}
                                transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                                className={`relative h-10 flex items-center rounded-full overflow-hidden bg-[#f5f9fc] dark:bg-zinc-800 border border-sky-200/60 dark:border-sky-800/30 ${!searchExpanded ? 'cursor-pointer hover:bg-sky-100 dark:hover:bg-zinc-700 hover:border-sky-300 dark:hover:border-sky-700' : ''
                                    } ${searchFocused ? 'ring-2 ring-sky-400/30 shadow-lg shadow-sky-500/5' : ''}`}
                                style={{ originX: 1 }}
                                onClick={() => {
                                    if (!searchExpanded) {
                                        setSearchExpanded(true);
                                        setTimeout(() => searchInputRef.current?.focus(), 80);
                                    }
                                }}
                            >
                                {/* Search icon — pinned left */}
                                <div className="w-10 h-10 flex items-center justify-center shrink-0">
                                    <HugeIcon name="Search01" className="w-4 h-4 text-sky-500 dark:text-sky-400" />
                                </div>

                                {/* Input area — right of icon */}
                                <div className={`flex items-center flex-1 min-w-0 overflow-hidden transition-opacity duration-200 ${searchExpanded ? 'opacity-100 pr-4' : 'opacity-0 w-0 pr-0'}`}>
                                    <input
                                        ref={searchInputRef}
                                        type="text"
                                        placeholder="Search quizzes..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        onFocus={() => setSearchFocused(true)}
                                        onBlur={() => {
                                            setSearchFocused(false);
                                            if (!searchQuery) {
                                                setSearchExpanded(false);
                                            }
                                        }}
                                        className="flex-1 bg-transparent text-[14px] text-sky-900 dark:text-sky-100 placeholder:text-sky-600/40 dark:placeholder:text-sky-400/40 outline-none w-full min-w-0"
                                    />
                                    {searchQuery && (
                                        <button
                                            onMouseDown={(e) => e.preventDefault()}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setSearchQuery('');
                                                searchInputRef.current?.focus();
                                            }}
                                            className="p-0.5 ml-1 rounded-full text-sky-400 hover:text-sky-600 dark:hover:text-sky-300 transition-colors shrink-0"
                                        >
                                            <HugeIcon name="Cancel01" className="w-3.5 h-3.5" />
                                        </button>
                                    )}
                                </div>
                            </motion.div>

                            {/* Create dropdown */}
                            <div ref={createDropdownRef} className="relative">
                                <button
                                    onClick={() => setCreateDropdownOpen(prev => !prev)}
                                    className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-sky-700 bg-[#ebf6b5] hover:bg-[#e0efa0] border border-[#d4e88e] rounded-xl transition-colors"
                                >
                                    <HugeIcon name="PlusSign" className="h-4 w-4" />
                                    Create
                                    <HugeIcon name="ArrowDown01" className={`h-3.5 w-3.5 transition-transform duration-200 ${createDropdownOpen ? 'rotate-180' : ''}`} />
                                </button>

                                <AnimatePresence>
                                    {createDropdownOpen && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 6, scale: 0.96 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: 6, scale: 0.96 }}
                                            transition={{ duration: 0.15 }}
                                            className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-gray-900 border border-sky-100 dark:border-gray-800 rounded-2xl shadow-2xl shadow-sky-500/5 overflow-hidden z-50 p-1.5"
                                        >
                                            <button
                                                onClick={openQuizAssistant}
                                                className="w-full flex items-center gap-3 px-3.5 py-2.5 text-sm text-sky-900 dark:text-white hover:bg-sky-50 dark:hover:bg-gray-800 rounded-xl transition-colors text-left"
                                            >
                                                <HugeIcon name="AiMagic" className="h-4 w-4 text-sky-500 dark:text-sky-400 shrink-0" />
                                                <div>
                                                    <div className="font-semibold text-[13px]">Smart Create</div>
                                                    <div className="text-[11px] text-sky-500/50 dark:text-sky-400/40">AI-powered with Aurora</div>
                                                </div>
                                            </button>
                                            <div className="mx-2 my-0.5 border-t border-sky-100/60 dark:border-gray-800" />
                                            <button
                                                onClick={() => { setCreateDropdownOpen(false); setManualCreateOpen(true); }}
                                                className="w-full flex items-center gap-3 px-3.5 py-2.5 text-sm text-sky-900 dark:text-white hover:bg-sky-50 dark:hover:bg-gray-800 rounded-xl transition-colors text-left"
                                            >
                                                <HugeIcon name="PencilEdit01" className="h-4 w-4 text-sky-500 dark:text-sky-400 shrink-0" />
                                                <div>
                                                    <div className="font-semibold text-[13px]">Manual Create</div>
                                                    <div className="text-[11px] text-sky-500/50 dark:text-sky-400/40">Write your own quiz</div>
                                                </div>
                                            </button>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Info notice */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.03 }}
                    className="mb-8 flex items-center gap-2 px-4 py-3 bg-[#f5f9fc] dark:bg-gray-900 rounded-xl border border-sky-100 dark:border-gray-800"
                >
                    <HugeIcon name="AlertCircle" className="w-3.5 h-3.5 text-amber-500 shrink-0" />
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
                            <HugeIcon name="HelpCircle" className="h-9 w-9 text-sky-500/30 dark:text-sky-400/30" />
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
                            <HugeIcon name="AiMagic" className="h-4 w-4" />
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
                        <div className="flex items-center gap-3 mb-6">
                            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-sky-500 dark:text-sky-400 px-1">
                                Current Session
                            </h2>
                            <div className="flex items-center gap-1 px-2 py-0.5 bg-amber-100 dark:bg-amber-500/20 rounded-full">
                                <HugeIcon name="AlertCircle" className="w-2.5 h-2.5 text-amber-600 dark:text-amber-400" />
                                <span className="text-[9px] font-bold text-amber-600 dark:text-amber-400 uppercase">Temporary</span>
                            </div>
                        </div>
                        <div
                            onClick={() => studyQuiz(tempQuestions, tempQuestions[0]?.topic || 'Quiz')}
                            className="group cursor-pointer bg-[#ebf6b5]/40 dark:bg-gray-900 rounded-2xl border border-[#d4e88e]/60 dark:border-gray-800 p-5 hover:shadow-lg hover:border-[#d4e88e] dark:hover:border-gray-700 transition-all max-w-sm"
                        >
                            <div className="flex items-start gap-3">
                                <div className="w-9 h-9 bg-[#ebf6b5] dark:bg-emerald-500/10 rounded-xl flex items-center justify-center border border-[#d4e88e]/50">
                                    <HugeIcon name="HelpCircle" className="h-4 w-4 text-sky-700 dark:text-emerald-400" />
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
                        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-sky-500 dark:text-sky-400 mb-6 px-1">
                            Saved Quizzes
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {filteredQuizzes.map((quiz, index) => (
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
                                            <HugeIcon name="Layers01" className="h-4 w-4 text-sky-500 dark:text-sky-400" />
                                        </div>
                                        <button
                                            onClick={(e) => deleteQuiz(index, e)}
                                            className="p-1.5 rounded-lg text-red-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-all"
                                        >
                                            <HugeIcon name="Delete02" className="h-3.5 w-3.5" />
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
                icon={<HugeIcon name="Quiz04" size={24} className="h-6 w-6" />}
                features={[
                    'Generate quizzes using the AI Aurora',
                    'Answer multiple-choice questions',
                    'Get instant feedback and explanations',
                    'Track your score per session',
                ]}
            />

            {/* ── Manual Create Modal ── */}
            <AnimatePresence>
                {manualCreateOpen && (
                    <div
                        className="fixed inset-0 bg-[#fffaf4]/80 dark:bg-gray-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-100 fixed-padding-adjust"
                        onClick={() => setManualCreateOpen(false)}
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.96, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.96, y: 20 }}
                            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white dark:bg-gray-900 rounded-[28px] shadow-2xl shadow-sky-500/5 w-full max-w-lg relative border border-sky-100 dark:border-gray-800 max-h-[90vh] overflow-y-auto"
                        >
                            {/* Header */}
                            <div className="sticky top-0 bg-white dark:bg-gray-900 flex items-center justify-between px-6 py-4 border-b border-sky-100 dark:border-gray-800 rounded-t-[28px] z-10">
                                <h2 className="text-lg font-bold text-sky-900 dark:text-white">
                                    Create Quiz
                                </h2>
                                <button
                                    onClick={() => setManualCreateOpen(false)}
                                    className="p-2 text-sky-400 hover:text-sky-900 dark:text-sky-500 dark:hover:text-white hover:bg-sky-50 rounded-full transition-colors"
                                >
                                    <HugeIcon name="Cancel01" className="h-5 w-5" />
                                </button>
                            </div>

                            {/* Content */}
                            <div className="p-6 space-y-5">
                                {/* Quiz Title */}
                                <div>
                                    <label className="block text-[11px] font-semibold text-sky-600 dark:text-sky-400 uppercase tracking-wider mb-2">
                                        Quiz Title
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="e.g., Biology Chapter 5 Quiz"
                                        value={manualQuizTitle}
                                        onChange={(e) => setManualQuizTitle(e.target.value)}
                                        className="w-full h-11 px-3 text-sm bg-white dark:bg-gray-900 border border-sky-200 dark:border-gray-700 rounded-xl text-sky-900 dark:text-white placeholder-sky-400 dark:placeholder-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                                    />
                                </div>

                                {/* Questions */}
                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <label className="block text-[11px] font-semibold text-sky-600 dark:text-sky-400 uppercase tracking-wider">
                                            Questions
                                        </label>
                                        <span className="text-[11px] text-sky-500 dark:text-sky-400 font-medium">
                                            {manualQuestions.length} question{manualQuestions.length !== 1 ? 's' : ''}
                                        </span>
                                    </div>
                                    <div className="space-y-4">
                                        {manualQuestions.map((q, index) => (
                                            <motion.div
                                                key={index}
                                                initial={{ opacity: 0, y: 8 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className="bg-sky-50/40 dark:bg-gray-800 border border-sky-100/50 dark:border-gray-700 rounded-2xl p-4 relative group"
                                            >
                                                <div className="flex items-center justify-between mb-3">
                                                    <span className="text-[10px] font-bold text-sky-500/40 dark:text-sky-400/30 uppercase tracking-widest">Question {index + 1}</span>
                                                    {manualQuestions.length > 1 && (
                                                        <button
                                                            onClick={() => removeManualQuestion(index)}
                                                            className="p-1 rounded-lg text-red-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-all"
                                                        >
                                                            <HugeIcon name="Delete02" className="h-3.5 w-3.5" />
                                                        </button>
                                                    )}
                                                </div>
                                                <div className="space-y-3">
                                                    {/* Question Text */}
                                                    <div>
                                                        <label className="block text-[11px] font-semibold text-sky-600 dark:text-sky-400 uppercase tracking-wider mb-1.5">
                                                            Question
                                                        </label>
                                                        <textarea
                                                            placeholder="Enter the question..."
                                                            value={q.question}
                                                            onChange={(e) => updateManualQuestion(index, 'question', e.target.value)}
                                                            rows={2}
                                                            className="w-full px-3 py-2.5 text-sm bg-white dark:bg-gray-900 border border-sky-200 dark:border-gray-700 rounded-xl text-sky-900 dark:text-white placeholder-sky-400 dark:placeholder-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 resize-none"
                                                        />
                                                    </div>

                                                    {/* Options */}
                                                    <div>
                                                        <label className="block text-[11px] font-semibold text-sky-600 dark:text-sky-400 uppercase tracking-wider mb-2">
                                                            Answer Options (select the correct one)
                                                        </label>
                                                        <div className="space-y-2">
                                                            {q.options.map((option, optIndex) => (
                                                                <div key={optIndex} className="flex items-center gap-2">
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => updateCorrectAnswer(index, optIndex)}
                                                                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                                                                            q.correctAnswer === optIndex
                                                                                ? 'border-emerald-500 bg-emerald-500'
                                                                                : 'border-sky-300 dark:border-gray-600 hover:border-sky-400 dark:hover:border-gray-500'
                                                                        }`}
                                                                    >
                                                                        {q.correctAnswer === optIndex && (
                                                                            <div className="w-2 h-2 bg-white rounded-full" />
                                                                        )}
                                                                    </button>
                                                                    <input
                                                                        type="text"
                                                                        placeholder={`Option ${optIndex + 1}`}
                                                                        value={option}
                                                                        onChange={(e) => updateManualOption(index, optIndex, e.target.value)}
                                                                        className="flex-1 h-10 px-3 text-sm bg-white dark:bg-gray-900 border border-sky-200 dark:border-gray-700 rounded-xl text-sky-900 dark:text-white placeholder-sky-400 dark:placeholder-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                                                                    />
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>

                                                    {/* Explanation */}
                                                    <div>
                                                        <label className="block text-[11px] font-semibold text-sky-600 dark:text-sky-400 uppercase tracking-wider mb-1.5">
                                                            Explanation (optional)
                                                        </label>
                                                        <textarea
                                                            placeholder="Explain why this answer is correct..."
                                                            value={q.explanation}
                                                            onChange={(e) => updateManualQuestion(index, 'explanation', e.target.value)}
                                                            rows={2}
                                                            className="w-full px-3 py-2.5 text-sm bg-white dark:bg-gray-900 border border-sky-200 dark:border-gray-700 rounded-xl text-sky-900 dark:text-white placeholder-sky-400 dark:placeholder-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 resize-none"
                                                        />
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                    <button
                                        onClick={addManualQuestion}
                                        className="mt-3 flex items-center gap-2 h-10 px-4 text-[13px] font-semibold text-sky-600 dark:text-sky-400 hover:text-sky-900 dark:hover:text-white hover:bg-sky-50 dark:hover:bg-gray-800 border border-dashed border-sky-200 dark:border-gray-700 rounded-full transition-colors w-full justify-center"
                                    >
                                        <HugeIcon name="PlusSign" className="h-4 w-4" />
                                        Add Question
                                    </button>
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="sticky bottom-0 bg-white dark:bg-gray-900 flex items-center justify-end gap-2.5 px-6 py-4 border-t border-sky-100 dark:border-gray-800 rounded-b-[28px]">
                                <button
                                    onClick={() => setManualCreateOpen(false)}
                                    className="h-10 px-5 text-[13px] font-semibold text-sky-600 dark:text-sky-400 hover:text-sky-900 dark:hover:text-white hover:bg-sky-50 dark:hover:bg-gray-800 border border-sky-200 dark:border-gray-700 rounded-full transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={saveManualQuiz}
                                    disabled={savingManual || !manualQuizTitle.trim()}
                                    className="h-10 px-6 text-[13px] font-semibold text-sky-700 dark:text-sky-300 bg-[#ebf6b5]/60 dark:bg-[#ebf6b5]/10 hover:bg-[#ebf6b5] border border-[#d4e88e]/50 dark:border-[#d4e88e]/20 rounded-full disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                                >
                                    {savingManual ? (
                                        <><div className="w-4 h-4 border-2 border-sky-700/30 border-t-sky-700 rounded-full animate-spin" /> Saving...</>
                                    ) : (
                                        'Save Quiz'
                                    )}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
