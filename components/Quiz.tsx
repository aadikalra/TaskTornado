'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, CheckCircle, XCircle, RefreshCw, Sparkle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export interface QuizQuestion {
    id: string;
    question: string;
    options: string[];
    correctAnswer: number;
    explanation?: string;
    topic: string;
}

interface QuizProps {
    questions: QuizQuestion[];
    onSave?: (questions: QuizQuestion[]) => void;
}

export function InteractiveQuiz({ questions, onSave }: QuizProps) {
    const { user } = useAuth();
    const [currentIndex, setCurrentIndex] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
    const [showResult, setShowResult] = useState(false);
    const [score, setScore] = useState(0);
    const [answeredQuestions, setAnsweredQuestions] = useState<Set<number>>(new Set());
    const [correctAnswers, setCorrectAnswers] = useState<Set<number>>(new Set());
    const [quizCompleted, setQuizCompleted] = useState(false);

    const currentQuestion = questions[currentIndex];

    const handleAnswerSelect = (optionIndex: number) => {
        if (showResult) return;
        setSelectedAnswer(optionIndex);
    };

    const handleSubmitAnswer = () => {
        if (selectedAnswer === null) {
            toast.error('Please select an answer');
            return;
        }

        setShowResult(true);
        const isCorrect = selectedAnswer === currentQuestion.correctAnswer;

        if (isCorrect && !correctAnswers.has(currentIndex)) {
            setScore(prev => prev + 1);
            setCorrectAnswers(prev => new Set(prev).add(currentIndex));
        }

        setAnsweredQuestions(prev => new Set(prev).add(currentIndex));
    };

    const handleNext = () => {
        const nextIndex = currentIndex + 1;
        if (nextIndex >= questions.length) {
            setQuizCompleted(true);
            return;
        }
        setCurrentIndex(nextIndex);
        setSelectedAnswer(null);
        setShowResult(false);
    };

    const handlePrevious = () => {
        if (currentIndex > 0) {
            setCurrentIndex(prev => prev - 1);
            setSelectedAnswer(null);
            setShowResult(false);
        }
    };

    const handleRestart = () => {
        setCurrentIndex(0);
        setSelectedAnswer(null);
        setShowResult(false);
        setScore(0);
        setAnsweredQuestions(new Set());
        setCorrectAnswers(new Set());
        setQuizCompleted(false);
    };

    if (!currentQuestion) return null;

    const progress = ((currentIndex + 1) / questions.length) * 100;

    // ── Quiz Complete ──
    if (quizCompleted) {
        const percentage = Math.round((score / questions.length) * 100);
        return (
            <div className="flex flex-col items-center gap-6 w-full max-w-3xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="w-full bg-[#f5f9fc] dark:bg-gray-800 rounded-2xl border border-sky-100 dark:border-gray-700 p-12 text-center"
                >
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: 'spring' }}
                        className="mb-6"
                    >
                        {percentage >= 80 ? (
                            <CheckCircle className="h-20 w-20 text-emerald-500 mx-auto" />
                        ) : percentage >= 60 ? (
                            <CheckCircle className="h-20 w-20 text-amber-500 mx-auto" />
                        ) : (
                            <XCircle className="h-20 w-20 text-red-400 mx-auto" />
                        )}
                    </motion.div>

                    <h2 className="text-3xl font-bold text-sky-900 dark:text-white mb-3">
                        Quiz Complete!
                    </h2>

                    <p className="text-5xl font-bold mb-2">
                        <span className={cn(
                            percentage >= 80 ? 'text-emerald-500' :
                                percentage >= 60 ? 'text-amber-500' :
                                    'text-red-400'
                        )}>
                            {percentage}%
                        </span>
                    </p>

                    <p className="text-lg text-sky-600/60 dark:text-sky-400/60 mb-8">
                        {score} of {questions.length} correct
                    </p>

                    <button
                        onClick={handleRestart}
                        className="flex items-center gap-2 px-6 py-3 text-sm font-semibold text-sky-700 bg-[#ebf6b5] hover:bg-[#e0efa0] border border-[#d4e88e] rounded-xl transition-colors mx-auto"
                    >
                        <RefreshCw className="h-4 w-4" />
                        Try Again
                    </button>
                </motion.div>
            </div>
        );
    }

    const isCorrect = showResult && selectedAnswer === currentQuestion.correctAnswer;
    const isWrong = showResult && selectedAnswer !== currentQuestion.correctAnswer;

    return (
        <div className="flex flex-col items-center gap-6 w-full max-w-3xl mx-auto">
            {/* Progress bar */}
            <div className="w-full flex items-center gap-4">
                <span className="text-sm font-bold text-sky-500 dark:text-sky-400 shrink-0 tabular-nums">
                    {currentIndex + 1} / {questions.length}
                </span>
                <div className="flex-1 h-1.5 bg-sky-500/10 dark:bg-sky-400/10 rounded-full overflow-hidden">
                    <motion.div
                        className="h-full bg-sky-500 dark:bg-sky-400 rounded-full"
                        initial={{ width: `${progress}%` }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.3, ease: 'easeOut' }}
                    />
                </div>
                <span className="text-xs font-bold text-sky-500/40 dark:text-sky-400/40 shrink-0 tabular-nums">
                    {score}/{questions.length}
                </span>
            </div>

            {/* Question Card */}
            <motion.div
                key={currentIndex}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="w-full bg-white dark:bg-gray-800 rounded-2xl border border-sky-100 dark:border-gray-700 shadow-sm overflow-hidden"
            >
                {/* Question header */}
                <div className="px-6 pt-5 pb-3 flex items-center gap-2">
                    <Sparkle className="w-3.5 h-3.5 text-sky-500/40 dark:text-sky-400/40" />
                    <span className="text-[11px] font-bold text-sky-500/40 dark:text-sky-400/40 uppercase tracking-widest">
                        Question {currentIndex + 1}
                    </span>
                </div>

                {/* Question text */}
                <div className="px-6 pb-6">
                    <h3 className="text-lg sm:text-xl font-medium text-sky-900 dark:text-white leading-relaxed">
                        {currentQuestion.question}
                    </h3>
                </div>

                {/* Answer Options */}
                <div className="px-6 pb-4 space-y-2.5">
                    {currentQuestion.options.map((option, index) => {
                        const isSelected = selectedAnswer === index;
                        const isCorrectOption = index === currentQuestion.correctAnswer;
                        const showAsCorrect = showResult && isCorrectOption;
                        const showAsWrong = showResult && isSelected && !isCorrectOption;

                        return (
                            <motion.button
                                key={index}
                                whileHover={{ scale: showResult ? 1 : 1.005 }}
                                whileTap={{ scale: showResult ? 1 : 0.995 }}
                                onClick={() => handleAnswerSelect(index)}
                                disabled={showResult}
                                className={cn(
                                    'w-full p-4 rounded-xl text-left transition-all duration-200 border',
                                    !showResult && !isSelected && 'border-sky-100 dark:border-gray-700 hover:border-sky-200 dark:hover:border-gray-600 bg-[#f5f9fc] dark:bg-gray-900',
                                    !showResult && isSelected && 'border-sky-400 bg-sky-50 dark:border-sky-500 dark:bg-sky-500/10',
                                    showAsCorrect && 'border-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 dark:border-emerald-500',
                                    showAsWrong && 'border-red-300 bg-red-50 dark:bg-red-500/10 dark:border-red-500',
                                    showResult && 'cursor-default'
                                )}
                            >
                                <div className="flex items-center justify-between">
                                    <span className={cn(
                                        'text-sm font-medium',
                                        showAsCorrect && 'text-emerald-700 dark:text-emerald-300',
                                        showAsWrong && 'text-red-600 dark:text-red-300',
                                        !showResult && isSelected && 'text-sky-700 dark:text-sky-300',
                                        !showResult && !isSelected && 'text-sky-900 dark:text-white'
                                    )}>
                                        {option}
                                    </span>
                                    {showAsCorrect && <CheckCircle className="h-4.5 w-4.5 text-emerald-500 shrink-0" />}
                                    {showAsWrong && <XCircle className="h-4.5 w-4.5 text-red-400 shrink-0" />}
                                </div>
                            </motion.button>
                        );
                    })}
                </div>

                {/* Explanation */}
                <AnimatePresence>
                    {showResult && currentQuestion.explanation && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mx-6 mb-4 p-4 rounded-xl bg-[#ebf6b5]/40 dark:bg-emerald-500/5 border border-[#d4e88e]/50 dark:border-emerald-500/20"
                        >
                            <p className="text-xs font-bold text-sky-700/60 dark:text-sky-400/60 mb-1 uppercase tracking-wider">
                                Explanation
                            </p>
                            <p className="text-sm text-sky-800 dark:text-sky-300 leading-relaxed">
                                {currentQuestion.explanation}
                            </p>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Submit / Result */}
                <div className="px-6 pb-6">
                    {!showResult ? (
                        <button
                            onClick={handleSubmitAnswer}
                            disabled={selectedAnswer === null}
                            className="w-full py-3 text-sm font-semibold text-sky-700 bg-[#ebf6b5] hover:bg-[#e0efa0] border border-[#d4e88e] rounded-xl transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                            Submit Answer
                        </button>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className={cn(
                                'py-3 rounded-xl text-center text-sm font-bold',
                                isCorrect && 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
                                isWrong && 'bg-red-50 dark:bg-red-500/10 text-red-500 dark:text-red-400'
                            )}
                        >
                            {isCorrect ? '✓ Correct!' : '✗ Incorrect'}
                        </motion.div>
                    )}
                </div>
            </motion.div>

            {/* Navigation */}
            <div className="flex items-center justify-between w-full">
                <button
                    onClick={handlePrevious}
                    disabled={currentIndex === 0}
                    className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-sky-600 dark:text-sky-400 hover:bg-sky-500/5 rounded-xl transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                >
                    <ChevronLeft className="h-4 w-4" />
                    Prev
                </button>

                <button
                    onClick={handleNext}
                    disabled={!showResult}
                    className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-sky-600 dark:text-sky-400 hover:bg-sky-500/5 rounded-xl transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                >
                    {currentIndex === questions.length - 1 ? 'Finish' : 'Next'}
                    <ChevronRight className="h-4 w-4" />
                </button>
            </div>

            {/* Dot nav */}
            {questions.length > 1 && questions.length <= 20 && (
                <div className="flex items-center gap-1.5">
                    {questions.map((_, idx) => (
                        <div
                            key={idx}
                            className={cn(
                                'w-2 h-2 rounded-full transition-all',
                                idx === currentIndex && 'bg-sky-500 dark:bg-sky-400 scale-125',
                                idx !== currentIndex && correctAnswers.has(idx) && 'bg-emerald-400 dark:bg-emerald-500',
                                idx !== currentIndex && answeredQuestions.has(idx) && !correctAnswers.has(idx) && 'bg-red-300 dark:bg-red-500',
                                idx !== currentIndex && !answeredQuestions.has(idx) && 'bg-sky-500/20 dark:bg-sky-400/20'
                            )}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
