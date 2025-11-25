'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, ArrowRight, Save, Loader2, X, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export interface QuizQuestion {
    id: string;
    question: string;
    options: string[];
    correctAnswer: number; // Index of the correct answer in options array
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
    const [isSaving, setIsSaving] = useState(false);
    const [quizTitle, setQuizTitle] = useState('');
    const [showSaveDialog, setShowSaveDialog] = useState(false);
    const [quizCompleted, setQuizCompleted] = useState(false);

    const currentQuestion = questions[currentIndex];

    useEffect(() => {
        // Set a default title based on the topic or current date
        if (questions.length > 0) {
            const topic = questions[0]?.topic || 'Study Quiz';
            setQuizTitle(`${topic} - ${new Date().toLocaleDateString()}`);
        }
    }, [questions]);

    const handleAnswerSelect = (optionIndex: number) => {
        if (showResult) return; // Don't allow changing answer after viewing result
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

    const handleSave = async () => {
        if (!user) {
            toast.error('Please sign in to save quizzes');
            return;
        }

        if (questions.length === 0) {
            toast.error('No questions to save');
            return;
        }

        try {
            setIsSaving(true);

            // TODO: Implement quiz saving to database (similar to flashcard service)
            // For now, just save to localStorage
            const quizData = {
                title: quizTitle,
                questions: questions,
                createdAt: new Date().toISOString(),
            };

            const existingQuizzes = JSON.parse(localStorage.getItem('savedQuizzes') || '[]');
            existingQuizzes.push(quizData);
            localStorage.setItem('savedQuizzes', JSON.stringify(existingQuizzes));

            toast.success('Quiz saved successfully!');

            if (onSave) {
                onSave(questions);
            }

            setShowSaveDialog(false);
        } catch (error) {
            console.error('Error saving quiz:', error);
            toast.error('Failed to save quiz. Please try again.');
        } finally {
            setIsSaving(false);
        }
    };

    if (!currentQuestion) return null;

    // Quiz completion screen
    if (quizCompleted) {
        const percentage = Math.round((score / questions.length) * 100);
        return (
            <div className="flex flex-col items-center gap-8 w-full max-w-4xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="w-full bg-white dark:bg-gray-900 rounded-2xl p-12 text-center"
                >
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: 'spring' }}
                        className="mb-6"
                    >
                        {percentage >= 80 ? (
                            <CheckCircle className="h-24 w-24 text-green-500 mx-auto" />
                        ) : percentage >= 60 ? (
                            <CheckCircle className="h-24 w-24 text-yellow-500 mx-auto" />
                        ) : (
                            <XCircle className="h-24 w-24 text-red-500 mx-auto" />
                        )}
                    </motion.div>

                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                        Quiz Complete!
                    </h2>

                    <p className="text-6xl font-bold mb-2">
                        <span className={cn(
                            percentage >= 80 ? 'text-green-500' :
                                percentage >= 60 ? 'text-yellow-500' :
                                    'text-red-500'
                        )}>
                            {percentage}%
                        </span>
                    </p>

                    <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
                        You scored {score} out of {questions.length} questions correctly
                    </p>

                    <div className="flex items-center justify-center gap-4">
                        <Button
                            onClick={handleRestart}
                            className="gap-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100"
                        >
                            <RefreshCw className="h-4 w-4" />
                            Try Again
                        </Button>

                        {onSave && (
                            <Button
                                onClick={() => setShowSaveDialog(true)}
                                variant="outline"
                                className="gap-2"
                            >
                                <Save className="h-4 w-4" />
                                Save Quiz
                            </Button>
                        )}
                    </div>
                </motion.div>
            </div>
        );
    }

    const isCorrect = showResult && selectedAnswer === currentQuestion.correctAnswer;
    const isWrong = showResult && selectedAnswer !== currentQuestion.correctAnswer;

    return (
        <div className="flex flex-col items-center gap-8 w-full max-w-4xl mx-auto">
            {/* Progress Indicator */}
            <div className="w-full">
                <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-2">
                    <span>Question {currentIndex + 1}</span>
                    <span className="font-medium">
                        Score: {score}/{questions.length}
                    </span>
                    <span>{questions.length} Total</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1">
                    <motion.div
                        className="bg-gray-900 dark:bg-white h-1 rounded-full"
                        initial={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
                        animate={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
                        transition={{ duration: 0.3 }}
                    />
                </div>
            </div>

            {/* Question Card */}
            <motion.div
                key={currentIndex}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="w-full bg-white dark:bg-gray-900 rounded-2xl p-8"
            >
                <div className="mb-8">
                    <h3 className="text-2xl font-medium text-gray-900 dark:text-white mb-2">
                        {currentQuestion.question}
                    </h3>
                    {currentQuestion.topic && (
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Topic: {currentQuestion.topic}
                        </p>
                    )}
                </div>

                {/* Answer Options */}
                <div className="space-y-3 mb-6">
                    {currentQuestion.options.map((option, index) => {
                        const isSelected = selectedAnswer === index;
                        const isCorrectOption = index === currentQuestion.correctAnswer;
                        const showAsCorrect = showResult && isCorrectOption;
                        const showAsWrong = showResult && isSelected && !isCorrectOption;

                        return (
                            <motion.button
                                key={index}
                                whileHover={{ scale: showResult ? 1 : 1.01 }}
                                whileTap={{ scale: showResult ? 1 : 0.99 }}
                                onClick={() => handleAnswerSelect(index)}
                                disabled={showResult}
                                className={cn(
                                    'w-full p-4 rounded-xl text-left transition-all duration-200 border-2',
                                    !showResult && !isSelected && 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 bg-white dark:bg-gray-800',
                                    !showResult && isSelected && 'border-gray-900 dark:border-white bg-gray-50 dark:bg-gray-800',
                                    showAsCorrect && 'border-green-500 bg-green-50 dark:bg-green-900/20',
                                    showAsWrong && 'border-red-500 bg-red-50 dark:bg-red-900/20',
                                    showResult && 'cursor-not-allowed'
                                )}
                            >
                                <div className="flex items-center justify-between">
                                    <span className={cn(
                                        'text-base',
                                        showAsCorrect && 'text-green-700 dark:text-green-300 font-medium',
                                        showAsWrong && 'text-red-700 dark:text-red-300',
                                        !showResult && 'text-gray-900 dark:text-white'
                                    )}>
                                        {option}
                                    </span>
                                    {showAsCorrect && <CheckCircle className="h-5 w-5 text-green-500" />}
                                    {showAsWrong && <XCircle className="h-5 w-5 text-red-500" />}
                                </div>
                            </motion.button>
                        );
                    })}
                </div>

                {/* Explanation (shown after answering) */}
                <AnimatePresence>
                    {showResult && currentQuestion.explanation && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mb-6 p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800"
                        >
                            <p className="text-sm font-medium text-blue-900 dark:text-blue-200 mb-1">
                                Explanation:
                            </p>
                            <p className="text-sm text-blue-800 dark:text-blue-300">
                                {currentQuestion.explanation}
                            </p>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Submit/Result Message */}
                {!showResult ? (
                    <Button
                        onClick={handleSubmitAnswer}
                        disabled={selectedAnswer === null}
                        className="w-full bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100"
                    >
                        Submit Answer
                    </Button>
                ) : (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className={cn(
                            'p-4 rounded-xl text-center font-medium',
                            isCorrect && 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200',
                            isWrong && 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200'
                        )}
                    >
                        {isCorrect ? '✓ Correct!' : '✗ Incorrect'}
                    </motion.div>
                )}
            </motion.div>

            {/* Navigation Controls */}
            <div className="flex items-center justify-between w-full">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={handlePrevious}
                    disabled={currentIndex === 0}
                    className="gap-2"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Previous
                </Button>

                <div className="flex items-center gap-3">
                    {onSave && (
                        <Button
                            variant="default"
                            size="sm"
                            onClick={() => setShowSaveDialog(true)}
                            disabled={isSaving}
                            className="gap-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100"
                        >
                            {isSaving ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Save className="h-4 w-4" />
                                    Save
                                </>
                            )}
                        </Button>
                    )}
                </div>

                <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleNext}
                    disabled={!showResult}
                    className="gap-2"
                >
                    {currentIndex === questions.length - 1 ? 'Finish' : 'Next'}
                    <ArrowRight className="h-4 w-4" />
                </Button>
            </div>

            {/* Save Quiz Modal */}
            <AnimatePresence>
                {showSaveDialog && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/50 z-50"
                            onClick={() => setShowSaveDialog(false)}
                        />
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ duration: 0.2 }}
                                className="w-full max-w-md bg-white dark:bg-gray-800 rounded-xl shadow-xl"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <div className="p-6">
                                    <div className="flex items-center justify-between mb-6">
                                        <h2 className="text-xl font-medium text-gray-900 dark:text-white">
                                            Save Quiz
                                        </h2>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => setShowSaveDialog(false)}
                                            className="h-8 w-8 p-0"
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>

                                    <div className="space-y-4">
                                        <div>
                                            <label htmlFor="quizTitle" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Quiz Title
                                            </label>
                                            <Input
                                                id="quizTitle"
                                                type="text"
                                                value={quizTitle}
                                                onChange={(e) => setQuizTitle(e.target.value)}
                                                className="border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900"
                                                placeholder="Enter a title for your quiz"
                                                autoFocus
                                            />
                                        </div>
                                        <div className="flex justify-end gap-3 pt-2">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => setShowSaveDialog(false)}
                                                disabled={isSaving}
                                                className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                                            >
                                                Cancel
                                            </Button>
                                            <Button
                                                onClick={handleSave}
                                                disabled={isSaving || !quizTitle.trim()}
                                                size="sm"
                                                className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100"
                                            >
                                                {isSaving ? (
                                                    <>
                                                        <Loader2 className="h-3 w-3 mr-2 animate-spin" />
                                                        Saving...
                                                    </>
                                                ) : (
                                                    'Save Quiz'
                                                )}
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}
