'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Clipboard, Loader2, RotateCcw, ChevronDown, ChevronUp, AlertCircle, ArrowLeftRight, Trash2, Plus } from 'lucide-react';
import { getFullVersionString } from '@/config/version';

// ─── Types ──────────────────────────────────────────────────────────────────────
interface Assignment {
    name: string;
    category: 'practice' | 'assessment';
    pointsEarned: number;
    pointsPossible: number;
}

type Step = 'weights' | 'paste' | 'results';

// ─── Presets ────────────────────────────────────────────────────────────────────
const PRESETS = [
    { label: '10 / 90', practice: 10 },
    { label: '15 / 85', practice: 15 },
    { label: '20 / 80', practice: 20 },
    { label: '25 / 75', practice: 25 },
    { label: '30 / 70', practice: 30 },
];

// ─── Main Component ─────────────────────────────────────────────────────────────
export default function GradeCalculatorPage() {
    // State
    const [step, setStep] = useState<Step>('weights');
    const [practiceWeight, setPracticeWeight] = useState(15);
    const [rawText, setRawText] = useState('');
    const [assignments, setAssignments] = useState<Assignment[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [expandedCategory, setExpandedCategory] = useState<'practice' | 'assessment' | null>(null);
    const [entryMode, setEntryMode] = useState<'paste' | 'manual'>('paste');
    const [manualName, setManualName] = useState('');
    const [manualCategory, setManualCategory] = useState<'practice' | 'assessment'>('assessment');
    const [manualEarned, setManualEarned] = useState('');
    const [manualPossible, setManualPossible] = useState('');

    const assessmentWeight = 100 - practiceWeight;

    // ─── Calculation ────────────────────────────────────────────────────────────
    const results = useMemo(() => {
        if (assignments.length === 0) return null;

        const practice = assignments.filter(a => a.category === 'practice');
        const assessment = assignments.filter(a => a.category === 'assessment');

        const practiceEarned = practice.reduce((s, a) => s + a.pointsEarned, 0);
        const practicePossible = practice.reduce((s, a) => s + a.pointsPossible, 0);
        const assessmentEarned = assessment.reduce((s, a) => s + a.pointsEarned, 0);
        const assessmentPossible = assessment.reduce((s, a) => s + a.pointsPossible, 0);

        const practicePercent = practicePossible > 0 ? (practiceEarned / practicePossible) * 100 : 0;
        const assessmentPercent = assessmentPossible > 0 ? (assessmentEarned / assessmentPossible) * 100 : 0;

        const weightedGrade =
            (practicePossible > 0 ? practicePercent * (practiceWeight / 100) : 0) +
            (assessmentPossible > 0 ? assessmentPercent * (assessmentWeight / 100) : 0);

        const finalGrade = practicePossible === 0 && assessmentPossible > 0
            ? assessmentPercent
            : assessmentPossible === 0 && practicePossible > 0
                ? practicePercent
                : weightedGrade;

        return {
            practice: { earned: practiceEarned, possible: practicePossible, percent: practicePercent, count: practice.length },
            assessment: { earned: assessmentEarned, possible: assessmentPossible, percent: assessmentPercent, count: assessment.length },
            finalGrade,
            totalAssignments: assignments.length,
        };
    }, [assignments, practiceWeight, assessmentWeight]);

    // ─── Letter Grade ───────────────────────────────────────────────────────────
    const getLetterGrade = (percent: number): { letter: string; color: string } => {
        if (percent >= 90) return { letter: 'A', color: '#22c55e' };
        if (percent >= 80) return { letter: 'B', color: '#3b82f6' };
        if (percent >= 70) return { letter: 'C', color: '#eab308' };
        return { letter: 'I', color: '#ef4444' };
    };

    // ─── Parse Grades ──────────────────────────────────────────────────────────
    const parseGrades = async () => {
        if (!rawText.trim()) return;
        setLoading(true);
        setError('');

        try {
            const res = await fetch('/api/grades/parse', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ rawText }),
            });

            if (!res.ok) {
                throw new Error('Failed to parse grades');
            }

            const data = await res.json();

            if (data.assignments && Array.isArray(data.assignments)) {
                setAssignments(data.assignments);
                setStep('results');
            } else {
                throw new Error('Invalid response format');
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    // ─── Assignment Editing ────────────────────────────────────────────────────
    const updateAssignment = (index: number, field: keyof Assignment, value: string | number) => {
        setAssignments(prev => prev.map((a, i) => {
            if (i !== index) return a;
            if (field === 'pointsEarned' || field === 'pointsPossible') {
                return { ...a, [field]: Math.max(0, Number(value) || 0) };
            }
            return { ...a, [field]: value };
        }));
    };

    const toggleCategory = (index: number) => {
        setAssignments(prev => prev.map((a, i) =>
            i === index ? { ...a, category: a.category === 'practice' ? 'assessment' : 'practice' } : a
        ));
    };

    const removeAssignment = (index: number) => {
        setAssignments(prev => prev.filter((_, i) => i !== index));
    };

    // ─── Manual Entry ───────────────────────────────────────────────────────────
    const addManualAssignment = () => {
        if (!manualName.trim() || !manualEarned || !manualPossible) return;
        setAssignments(prev => [...prev, {
            name: manualName.trim(),
            category: manualCategory,
            pointsEarned: Math.max(0, Number(manualEarned) || 0),
            pointsPossible: Math.max(0, Number(manualPossible) || 0),
        }]);
        setManualName('');
        setManualEarned('');
        setManualPossible('');
    };

    const goToResultsManual = () => {
        if (assignments.length === 0) return;
        setStep('results');
    };

    // ─── Reset ─────────────────────────────────────────────────────────────────
    const reset = () => {
        setStep('weights');
        setRawText('');
        setAssignments([]);
        setError('');
        setExpandedCategory(null);
        setEntryMode('paste');
        setManualName('');
        setManualCategory('assessment');
        setManualEarned('');
        setManualPossible('');
    };

    // ─── Paste from Clipboard ──────────────────────────────────────────────────
    const pasteFromClipboard = async () => {
        try {
            const text = await navigator.clipboard.readText();
            setRawText(text);
        } catch {
            // Clipboard access denied — user can paste manually
        }
    };

    const stepIndex = ['weights', 'paste', 'results'].indexOf(step);

    return (
        <div className="min-h-screen bg-white dark:bg-gray-950">
            <div className="px-4 pt-4 pb-16 sm:px-6 sm:pt-6 sm:pb-20 lg:px-8 lg:pt-8 lg:pb-24">

                {/* Header — matching Translate's minimal heading */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 sm:mb-10">
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-light text-gray-900 dark:text-white mb-2 tracking-tight">
                            Grade Calculator
                        </h1>
                        <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400">
                            Paste your grades and get an instant weighted percentage
                        </p>
                    </motion.div>

                    {/* Step pills — right-aligned like Translate's kbd hint */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="hidden sm:flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500"
                    >
                        {(['weights', 'paste', 'results'] as Step[]).map((s, i) => (
                            <React.Fragment key={s}>
                                <div className={`flex items-center gap-1.5 px-2 py-1 rounded-md transition-colors ${step === s
                                    ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white'
                                    : i < stepIndex
                                        ? 'text-gray-400 dark:text-gray-500'
                                        : 'text-gray-300 dark:text-gray-600'
                                    }`}>
                                    <span>{i + 1}.</span>
                                    <span>{s === 'weights' ? 'Weights' : s === 'paste' ? 'Paste' : 'Results'}</span>
                                </div>
                                {i < 2 && <span className="text-gray-300 dark:text-gray-700">→</span>}
                            </React.Fragment>
                        ))}
                    </motion.div>
                </div>

                <AnimatePresence mode="wait">
                    {/* ─── Step 1: Weights ─────────────────────────────────────────── */}
                    {step === 'weights' && (
                        <motion.div
                            key="weights"
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -12 }}
                            transition={{ duration: 0.2 }}
                        >
                            {/* Weights Panel — styled like Translate's text panels */}
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.05 }}
                                className="border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden"
                            >
                                <div className="px-5 pt-4 pb-2">
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500">
                                        Category Weights
                                    </span>
                                </div>

                                <div className="px-5 pb-6 space-y-5">
                                    {/* Slider */}
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-gray-700 dark:text-gray-300">Practice</span>
                                            <span className="text-sm font-medium tabular-nums text-gray-900 dark:text-white">{practiceWeight}%</span>
                                        </div>

                                        <input
                                            type="range"
                                            min={0}
                                            max={100}
                                            step={5}
                                            value={practiceWeight}
                                            onChange={(e) => setPracticeWeight(Number(e.target.value))}
                                            className="w-full h-1.5 bg-gray-200 dark:bg-gray-800 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-gray-900 [&::-webkit-slider-thumb]:dark:bg-white [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:cursor-pointer"
                                        />

                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-gray-700 dark:text-gray-300">Assessments</span>
                                            <span className="text-sm font-medium tabular-nums text-gray-900 dark:text-white">{assessmentWeight}%</span>
                                        </div>

                                        {/* Colored split bar */}
                                        <div className="flex rounded-full overflow-hidden h-1.5">
                                            <div
                                                className="bg-blue-500 transition-all duration-300"
                                                style={{ width: `${practiceWeight}%` }}
                                            />
                                            <div
                                                className="bg-amber-500 transition-all duration-300"
                                                style={{ width: `${assessmentWeight}%` }}
                                            />
                                        </div>
                                        <div className="flex justify-between text-[10px] font-medium">
                                            <span className="text-blue-500">Practice ({practiceWeight}%)</span>
                                            <span className="text-amber-500">Assessments ({assessmentWeight}%)</span>
                                        </div>
                                    </div>

                                    {/* Presets */}
                                    <div className="flex gap-2 flex-wrap">
                                        {PRESETS.map(preset => (
                                            <button
                                                key={preset.label}
                                                onClick={() => setPracticeWeight(preset.practice)}
                                                className={`px-3 py-1.5 text-[11px] font-medium rounded-lg transition-all ${practiceWeight === preset.practice
                                                    ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900'
                                                    : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/[0.04]'
                                                    }`}
                                            >
                                                {preset.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Bottom action bar — like Translate's button bar */}
                                <div className="px-4 py-3 border-t border-gray-100 dark:border-gray-800/50 flex items-center justify-end">
                                    <button
                                        onClick={() => setStep('paste')}
                                        className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-gray-900 dark:bg-white dark:text-gray-900 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-100 transition-all active:scale-95"
                                    >
                                        Continue
                                        <ArrowRight className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}

                    {/* ─── Step 2: Paste / Manual ───────────────────────────────── */}
                    {step === 'paste' && (
                        <motion.div
                            key="paste"
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -12 }}
                            transition={{ duration: 0.2 }}
                            className="space-y-4"
                        >
                            {/* Mode switcher */}
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="flex items-center gap-1 p-0.5 bg-gray-100 dark:bg-gray-800/50 rounded-lg w-fit"
                            >
                                {(['paste', 'manual'] as const).map(mode => (
                                    <button
                                        key={mode}
                                        onClick={() => setEntryMode(mode)}
                                        className={`px-3 py-1.5 text-[11px] font-medium rounded-md transition-all ${entryMode === mode
                                            ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                                            : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                                            }`}
                                    >
                                        {mode === 'paste' ? 'AI Paste' : 'Manual Entry'}
                                    </button>
                                ))}
                            </motion.div>

                            {/* Paste mode */}
                            {entryMode === 'paste' && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.05 }}
                                    className="border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden"
                                >
                                    <div className="px-5 pt-4 pb-2 flex items-center justify-between">
                                        <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500">
                                            Grade Data
                                        </span>
                                        <span className="text-[10px] font-medium text-gray-400 dark:text-gray-500">
                                            {rawText.length > 0 ? `${rawText.length.toLocaleString()} chars` : ''}
                                        </span>
                                    </div>

                                    <div className="relative">
                                        <textarea
                                            value={rawText}
                                            onChange={(e) => setRawText(e.target.value)}
                                            placeholder={"Paste your grades table here...\n\nAssignment Name     Points     Grade\nHW 1.1              18/20      90%\nUnit 1 Test         45/50      90%\n..."}
                                            className="w-full h-56 sm:h-64 resize-none bg-transparent text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 text-[15px] leading-relaxed outline-none scrollbar-hide px-5 pb-14 font-mono"
                                        />
                                        <button
                                            onClick={pasteFromClipboard}
                                            className="absolute top-2 right-3 flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/[0.04] rounded-lg transition-colors"
                                        >
                                            <Clipboard className="w-3 h-3" />
                                            Paste
                                        </button>
                                    </div>

                                    {error && (
                                        <div className="mx-5 mb-4 flex items-center gap-2 p-3 border border-red-200 dark:border-red-900/30 rounded-lg">
                                            <AlertCircle className="w-3.5 h-3.5 text-red-500 shrink-0" />
                                            <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
                                        </div>
                                    )}

                                    {/* Bottom action bar */}
                                    <div className="px-4 py-3 border-t border-gray-100 dark:border-gray-800/50 flex items-center justify-between">
                                        <button
                                            onClick={() => setStep('weights')}
                                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-white/[0.04]"
                                        >
                                            Back
                                        </button>
                                        {loading ? (
                                            <button
                                                disabled
                                                className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-gray-900 dark:bg-white dark:text-gray-900 rounded-lg opacity-70"
                                            >
                                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                                Parsing...
                                            </button>
                                        ) : (
                                            <button
                                                onClick={parseGrades}
                                                disabled={!rawText.trim()}
                                                className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-gray-900 dark:bg-white dark:text-gray-900 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-95"
                                            >
                                                Calculate
                                            </button>
                                        )}
                                    </div>
                                </motion.div>
                            )}

                            {/* Manual mode */}
                            {entryMode === 'manual' && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.05 }}
                                    className="space-y-4"
                                >
                                    {/* Add assignment form */}
                                    <div className="border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden">
                                        <div className="px-5 pt-4 pb-2">
                                            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500">
                                                Add Assignment
                                            </span>
                                        </div>

                                        <div className="px-5 pb-5 space-y-3">
                                            {/* Name */}
                                            <input
                                                type="text"
                                                value={manualName}
                                                onChange={(e) => setManualName(e.target.value)}
                                                placeholder="Assignment name"
                                                className="w-full px-3 py-2 text-sm bg-transparent border border-gray-200 dark:border-gray-800 rounded-lg text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 outline-none focus:ring-1 focus:ring-gray-900/10 dark:focus:ring-white/10"
                                            />

                                            <div className="flex items-center gap-3">
                                                {/* Category */}
                                                <div className="flex items-center gap-1 p-0.5 bg-gray-100 dark:bg-gray-800/50 rounded-lg">
                                                    {(['practice', 'assessment'] as const).map(cat => (
                                                        <button
                                                            key={cat}
                                                            onClick={() => setManualCategory(cat)}
                                                            className={`px-2.5 py-1 text-[11px] font-medium rounded-md transition-all capitalize ${manualCategory === cat
                                                                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                                                                : 'text-gray-500 dark:text-gray-400'
                                                                }`}
                                                        >
                                                            {cat}
                                                        </button>
                                                    ))}
                                                </div>

                                                {/* Score */}
                                                <div className="flex items-center gap-1 flex-1">
                                                    <input
                                                        type="number"
                                                        value={manualEarned}
                                                        onChange={(e) => setManualEarned(e.target.value)}
                                                        placeholder="Earned"
                                                        className="w-full px-3 py-2 text-sm bg-transparent border border-gray-200 dark:border-gray-800 rounded-lg text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 outline-none focus:ring-1 focus:ring-gray-900/10 dark:focus:ring-white/10 tabular-nums [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                                    />
                                                    <span className="text-xs text-gray-300 dark:text-gray-600 shrink-0">/</span>
                                                    <input
                                                        type="number"
                                                        value={manualPossible}
                                                        onChange={(e) => setManualPossible(e.target.value)}
                                                        placeholder="Possible"
                                                        className="w-full px-3 py-2 text-sm bg-transparent border border-gray-200 dark:border-gray-800 rounded-lg text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 outline-none focus:ring-1 focus:ring-gray-900/10 dark:focus:ring-white/10 tabular-nums [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="px-4 py-3 border-t border-gray-100 dark:border-gray-800/50 flex items-center justify-end">
                                            <button
                                                onClick={addManualAssignment}
                                                disabled={!manualName.trim() || !manualEarned || !manualPossible}
                                                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/[0.04] rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed active:scale-95"
                                            >
                                                <Plus className="w-3 h-3" />
                                                Add
                                            </button>
                                        </div>
                                    </div>

                                    {/* List of added assignments */}
                                    {assignments.length > 0 && (
                                        <div className="border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden">
                                            <div className="px-5 pt-4 pb-2 flex items-center justify-between">
                                                <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500">
                                                    Assignments ({assignments.length})
                                                </span>
                                            </div>
                                            <div className="px-4 pb-4 space-y-1">
                                                {assignments.map((a, idx) => (
                                                    <div key={idx} className="flex items-center gap-2 py-1.5 px-3 rounded-lg hover:bg-gray-50 dark:hover:bg-white/[0.02] group transition-colors">
                                                        <span className="text-[10px] font-medium uppercase tracking-wide text-gray-400 dark:text-gray-500 w-12 shrink-0">
                                                            {a.category === 'practice' ? 'Prac' : 'Test'}
                                                        </span>
                                                        <span className="flex-1 text-xs text-gray-700 dark:text-gray-300 truncate">
                                                            {a.name}
                                                        </span>
                                                        <span className="text-xs font-medium tabular-nums text-gray-500 dark:text-gray-400 shrink-0">
                                                            {a.pointsEarned}/{a.pointsPossible}
                                                        </span>
                                                        <button
                                                            onClick={() => removeAssignment(idx)}
                                                            title="Remove"
                                                            className="p-1 rounded text-gray-300 hover:text-red-500 dark:text-gray-600 dark:hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                                                        >
                                                            <Trash2 className="w-3 h-3" />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Bottom action bar */}
                                    <div className="flex items-center justify-between">
                                        <button
                                            onClick={() => setStep('weights')}
                                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-white/[0.04]"
                                        >
                                            Back
                                        </button>
                                        <button
                                            onClick={goToResultsManual}
                                            disabled={assignments.length === 0}
                                            className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-gray-900 dark:bg-white dark:text-gray-900 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-95"
                                        >
                                            Calculate
                                        </button>
                                    </div>
                                </motion.div>
                            )}
                        </motion.div>
                    )}

                    {/* ─── Step 3: Results ──────────────────────────────────────────── */}
                    {step === 'results' && results && (
                        <motion.div
                            key="results"
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -12 }}
                            transition={{ duration: 0.2 }}
                            className="space-y-4"
                        >
                            {/* Grade result — top panel */}
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.05 }}
                                className="border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden"
                            >
                                <div className="px-5 pt-4 pb-2">
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500">
                                        Your Grade
                                    </span>
                                </div>

                                <div className="px-5 pb-6 flex items-center gap-5">
                                    <motion.span
                                        initial={{ scale: 0.5, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.1 }}
                                        className="text-6xl font-bold tabular-nums"
                                        style={{ color: getLetterGrade(results.finalGrade).color }}
                                    >
                                        {getLetterGrade(results.finalGrade).letter}
                                    </motion.span>
                                    <div>
                                        <motion.p
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.2 }}
                                            className="text-3xl font-bold tabular-nums text-gray-900 dark:text-white"
                                        >
                                            {results.finalGrade.toFixed(1)}%
                                        </motion.p>
                                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                                            {results.totalAssignments} assignments · {practiceWeight}/{assessmentWeight} weighting
                                        </p>
                                    </div>
                                </div>
                            </motion.div>

                            {/* Edit hint */}
                            <div className="flex items-start gap-2.5 px-4 py-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/30 rounded-xl">
                                <AlertCircle className="w-3.5 h-3.5 text-blue-500 shrink-0 mt-0.5" />
                                <p className="text-[11px] text-blue-600 dark:text-blue-400 leading-relaxed">
                                    Expand a category to edit names, scores, or swap categories. Changes recalculate instantly.
                                </p>
                            </div>

                            {/* Category panels — styled like Translate's source/output panels */}
                            <div className="grid md:grid-cols-2 gap-4">
                                {/* Practice */}
                                <div className="border border-blue-200 dark:border-blue-900/40 rounded-xl overflow-hidden">
                                    <button
                                        onClick={() => setExpandedCategory(expandedCategory === 'practice' ? null : 'practice')}
                                        className="w-full px-5 pt-4 pb-3 flex items-center justify-between hover:bg-blue-50/50 dark:hover:bg-blue-950/20 transition-colors"
                                    >
                                        <div>
                                            <span className="text-[10px] font-bold uppercase tracking-widest text-blue-500 dark:text-blue-400">
                                                Practice
                                            </span>
                                            <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5">
                                                {results.practice.count} items · {practiceWeight}% weight
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="text-right">
                                                <p className="text-sm font-medium tabular-nums text-gray-900 dark:text-white">
                                                    {results.practice.possible > 0 ? `${results.practice.percent.toFixed(1)}%` : '—'}
                                                </p>
                                                <p className="text-[10px] text-gray-400 dark:text-gray-500 tabular-nums">
                                                    {results.practice.earned}/{results.practice.possible} pts
                                                </p>
                                            </div>
                                            {expandedCategory === 'practice' ? (
                                                <ChevronUp className="w-3.5 h-3.5 text-gray-400" />
                                            ) : (
                                                <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
                                            )}
                                        </div>
                                    </button>

                                    <AnimatePresence>
                                        {expandedCategory === 'practice' && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                transition={{ duration: 0.2 }}
                                                className="overflow-hidden"
                                            >
                                                <div className="px-4 pb-4 space-y-1 border-t border-gray-100 dark:border-gray-800/50 pt-3">
                                                    {assignments.map((a, idx) => a.category !== 'practice' ? null : (
                                                        <div key={idx} className="flex items-center gap-2 py-1.5 px-3 rounded-lg hover:bg-gray-50 dark:hover:bg-white/[0.02] group transition-colors">
                                                            <input
                                                                type="text"
                                                                value={a.name}
                                                                onChange={(e) => updateAssignment(idx, 'name', e.target.value)}
                                                                className="flex-1 text-xs text-gray-700 dark:text-gray-300 bg-transparent min-w-0 truncate focus:outline-none focus:bg-gray-50 dark:focus:bg-gray-800 rounded px-1 -mx-1"
                                                            />
                                                            <div className="flex items-center gap-0.5 shrink-0">
                                                                <input
                                                                    type="number"
                                                                    value={a.pointsEarned}
                                                                    onChange={(e) => updateAssignment(idx, 'pointsEarned', e.target.value)}
                                                                    className="w-10 text-xs font-medium tabular-nums text-gray-500 dark:text-gray-400 bg-transparent text-right focus:outline-none focus:bg-gray-50 dark:focus:bg-gray-800 rounded px-1 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                                                />
                                                                <span className="text-xs text-gray-300 dark:text-gray-600">/</span>
                                                                <input
                                                                    type="number"
                                                                    value={a.pointsPossible}
                                                                    onChange={(e) => updateAssignment(idx, 'pointsPossible', e.target.value)}
                                                                    className="w-10 text-xs font-medium tabular-nums text-gray-500 dark:text-gray-400 bg-transparent focus:outline-none focus:bg-gray-50 dark:focus:bg-gray-800 rounded px-1 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                                                />
                                                            </div>
                                                            <button onClick={() => toggleCategory(idx)} title="Move to Assessments" className="p-1 rounded text-gray-300 hover:text-blue-500 dark:text-gray-600 dark:hover:text-blue-400 opacity-0 group-hover:opacity-100 transition-all">
                                                                <ArrowLeftRight className="w-3 h-3" />
                                                            </button>
                                                            <button onClick={() => removeAssignment(idx)} title="Remove" className="p-1 rounded text-gray-300 hover:text-red-500 dark:text-gray-600 dark:hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all">
                                                                <Trash2 className="w-3 h-3" />
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>

                                {/* Assessments */}
                                <div className="border border-amber-200 dark:border-amber-900/40 rounded-xl overflow-hidden bg-amber-50/30 dark:bg-amber-950/10">
                                    <button
                                        onClick={() => setExpandedCategory(expandedCategory === 'assessment' ? null : 'assessment')}
                                        className="w-full px-5 pt-4 pb-3 flex items-center justify-between hover:bg-amber-50/50 dark:hover:bg-amber-950/20 transition-colors"
                                    >
                                        <div>
                                            <span className="text-[10px] font-bold uppercase tracking-widest text-amber-500 dark:text-amber-400">
                                                Assessments
                                            </span>
                                            <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5">
                                                {results.assessment.count} items · {assessmentWeight}% weight
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="text-right">
                                                <p className="text-sm font-medium tabular-nums text-gray-900 dark:text-white">
                                                    {results.assessment.possible > 0 ? `${results.assessment.percent.toFixed(1)}%` : '—'}
                                                </p>
                                                <p className="text-[10px] text-gray-400 dark:text-gray-500 tabular-nums">
                                                    {results.assessment.earned}/{results.assessment.possible} pts
                                                </p>
                                            </div>
                                            {expandedCategory === 'assessment' ? (
                                                <ChevronUp className="w-3.5 h-3.5 text-gray-400" />
                                            ) : (
                                                <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
                                            )}
                                        </div>
                                    </button>

                                    <AnimatePresence>
                                        {expandedCategory === 'assessment' && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                transition={{ duration: 0.2 }}
                                                className="overflow-hidden"
                                            >
                                                <div className="px-4 pb-4 space-y-1 border-t border-gray-100 dark:border-gray-800/50 pt-3">
                                                    {assignments.map((a, idx) => a.category !== 'assessment' ? null : (
                                                        <div key={idx} className="flex items-center gap-2 py-1.5 px-3 rounded-lg hover:bg-gray-100/50 dark:hover:bg-white/[0.03] group transition-colors">
                                                            <input
                                                                type="text"
                                                                value={a.name}
                                                                onChange={(e) => updateAssignment(idx, 'name', e.target.value)}
                                                                className="flex-1 text-xs text-gray-700 dark:text-gray-300 bg-transparent min-w-0 truncate focus:outline-none focus:bg-gray-50 dark:focus:bg-gray-800 rounded px-1 -mx-1"
                                                            />
                                                            <div className="flex items-center gap-0.5 shrink-0">
                                                                <input
                                                                    type="number"
                                                                    value={a.pointsEarned}
                                                                    onChange={(e) => updateAssignment(idx, 'pointsEarned', e.target.value)}
                                                                    className="w-10 text-xs font-medium tabular-nums text-gray-500 dark:text-gray-400 bg-transparent text-right focus:outline-none focus:bg-gray-50 dark:focus:bg-gray-800 rounded px-1 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                                                />
                                                                <span className="text-xs text-gray-300 dark:text-gray-600">/</span>
                                                                <input
                                                                    type="number"
                                                                    value={a.pointsPossible}
                                                                    onChange={(e) => updateAssignment(idx, 'pointsPossible', e.target.value)}
                                                                    className="w-10 text-xs font-medium tabular-nums text-gray-500 dark:text-gray-400 bg-transparent focus:outline-none focus:bg-gray-50 dark:focus:bg-gray-800 rounded px-1 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                                                />
                                                            </div>
                                                            <button onClick={() => toggleCategory(idx)} title="Move to Practice" className="p-1 rounded text-gray-300 hover:text-amber-500 dark:text-gray-600 dark:hover:text-amber-400 opacity-0 group-hover:opacity-100 transition-all">
                                                                <ArrowLeftRight className="w-3 h-3" />
                                                            </button>
                                                            <button onClick={() => removeAssignment(idx)} title="Remove" className="p-1 rounded text-gray-300 hover:text-red-500 dark:text-gray-600 dark:hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all">
                                                                <Trash2 className="w-3 h-3" />
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </div>

                            {/* Weighted Breakdown — context panel like Translate's explanation */}
                            <div className="border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden">
                                <div className="px-5 pt-4 pb-2">
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500">
                                        Weighted Breakdown
                                    </span>
                                </div>
                                <div className="px-5 pb-5 space-y-2 text-xs">
                                    <div className="flex justify-between text-gray-600 dark:text-gray-400">
                                        <span>Practice ({practiceWeight}% weight)</span>
                                        <span className="font-medium tabular-nums">
                                            {results.practice.possible > 0
                                                ? `${results.practice.percent.toFixed(1)}% × ${practiceWeight}% = ${(results.practice.percent * practiceWeight / 100).toFixed(1)}%`
                                                : 'No assignments'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-gray-600 dark:text-gray-400">
                                        <span>Assessments ({assessmentWeight}% weight)</span>
                                        <span className="font-medium tabular-nums">
                                            {results.assessment.possible > 0
                                                ? `${results.assessment.percent.toFixed(1)}% × ${assessmentWeight}% = ${(results.assessment.percent * assessmentWeight / 100).toFixed(1)}%`
                                                : 'No assignments'}
                                        </span>
                                    </div>
                                    <div className="border-t border-gray-100 dark:border-gray-800 pt-2 flex justify-between font-semibold text-gray-900 dark:text-white">
                                        <span>Final Grade</span>
                                        <span className="tabular-nums">{results.finalGrade.toFixed(1)}%</span>
                                    </div>
                                </div>
                            </div>

                            {/* Reset — minimal, like Translate's bottom action */}
                            <button
                                onClick={reset}
                                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-white/[0.04]"
                            >
                                <RotateCcw className="w-3 h-3" />
                                Start over
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Footer — matching Translate */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="mt-20 pt-8 border-t border-gray-200 dark:border-gray-800"
                >
                    <div className="flex items-center justify-between">
                        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                            Built for students • Public Beta {getFullVersionString()}
                        </p>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
