'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HugeIcon } from '@/lib/huge-icon-map';
import { getFullVersionString } from '@/config/version';
import { useAuth } from '@/context/AuthContext';
import { useClassContext, type Class } from '@/context/ClassContext';
import Cookies from 'js-cookie';

// ─── Types ──────────────────────────────────────────────────────────────────────
interface Assignment {
    name: string;
    category: 'practice' | 'assessment';
    pointsEarned: number;
    pointsPossible: number;
}

type Step = 'weights' | 'paste' | 'results';

interface ClassGradeData {
    assignments: Assignment[];
    practiceWeight: number;
    finalGrade: number;
}

// ─── Presets ────────────────────────────────────────────────────────────────────
const PRESETS = [
    { label: '10 / 90', practice: 10 },
    { label: '15 / 85', practice: 15 },
    { label: '20 / 80', practice: 20 },
    { label: '25 / 75', practice: 25 },
    { label: '30 / 70', practice: 30 },
];

// ─── Easing Grade Parsing Progress Bar ──────────────────────────────────────────
const GradeParsingProgressBar = ({ liveText }: { liveText: string }) => {
    const [progress, setProgress] = useState(5);
    const [label, setLabel] = useState('Initiating Parser...');
    const consoleRef = React.useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!liveText) {
            setLabel('Initiating Parser...');
            setProgress(5);
            return;
        }

        // Count assignments streamed so far
        const assignmentCount = (liveText.match(/"name"/g) || []).length;

        if (liveText.includes('assignments')) {
            if (assignmentCount > 0) {
                setLabel(`Streaming assignments: extracted ${assignmentCount}...`);
                setProgress(Math.min(92, 40 + assignmentCount * 4));
            } else {
                setLabel('Initializing grades array...');
                setProgress(30);
            }
        } else if (liveText.includes('{')) {
            setLabel('Formulating structured JSON response...');
            setProgress(20);
        } else {
            setLabel('Contacting AI parser agent...');
            setProgress(12);
        }

        // Scroll console to bottom smoothly as tokens stream
        if (consoleRef.current) {
            consoleRef.current.scrollTop = consoleRef.current.scrollHeight;
        }
    }, [liveText]);

    return (
        <div className="w-full max-w-sm mx-auto p-6 bg-white/60 dark:bg-zinc-900/60 backdrop-blur-md border border-sky-100/50 dark:border-white/5 rounded-[28px] shadow-sm text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-sky-500/10 flex items-center justify-center mx-auto border border-sky-500/20">
                <HugeIcon name="LoaderPinwheel" className="w-6 h-6 animate-spin text-sky-500" />
            </div>
            <div className="space-y-1.5">
                <h4 className="text-sm font-bold text-sky-900 dark:text-white uppercase tracking-wider transition-all duration-300">{label}</h4>
                <div className="flex items-center justify-between text-[11px] font-bold text-sky-500/50 dark:text-sky-400/50">
                    <span>Extracting grade rows</span>
                    <span className="tabular-nums">{Math.round(progress)}%</span>
                </div>
            </div>
            <div className="h-2 bg-sky-100 dark:bg-sky-950/30 rounded-full overflow-hidden">
                <motion.div
                    className="h-full bg-gradient-to-r from-sky-400 to-sky-600 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                />
            </div>
            {liveText && (
                <div
                    ref={consoleRef}
                    className="mt-4 p-3 bg-zinc-950 text-emerald-400 font-mono text-[9px] text-left rounded-xl max-h-28 overflow-y-auto whitespace-pre border border-white/5 scrollbar-thin select-none opacity-85 scroll-smooth"
                >
                    <div className="animate-pulse mb-1 font-bold text-white/40">// Live Parser Stream:</div>
                    {liveText}
                </div>
            )}
        </div>
    );
};

// ─── Main Component ─────────────────────────────────────────────────────────────
export default function GradeCalculatorPage() {
    const { user } = useAuth() || {};
    const { classes, loading: classesLoading } = useClassContext();

    // Selected Class Context
    const [selectedClass, setSelectedClass] = useState<Class | null>(null);

    // Stored grades state (classId -> ClassGradeData)
    const [classGrades, setClassGrades] = useState<Record<string, ClassGradeData>>({});

    // Calculator State (initialized/restored when class is selected)
    const [step, setStep] = useState<Step>('weights');
    const [practiceWeight, setPracticeWeight] = useState(15);
    const [rawText, setRawText] = useState('');
    const [assignments, setAssignments] = useState<Assignment[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [errorInfo, setErrorInfo] = useState<{
        message: string;
        rawOutput: string;
        errorType: string;
        stack?: string;
    } | null>(null);
    const [activeErrorTab, setActiveErrorTab] = useState<'overview' | 'output' | 'stack'>('overview');

    const [expandedCategory, setExpandedCategory] = useState<'practice' | 'assessment' | null>(null);
    const [entryMode, setEntryMode] = useState<'paste' | 'manual'>('paste');
    const [manualName, setManualName] = useState('');
    const [manualCategory, setManualCategory] = useState<'practice' | 'assessment'>('assessment');
    const [manualEarned, setManualEarned] = useState('');
    const [manualPossible, setManualPossible] = useState('');
    const [liveStreamText, setLiveStreamText] = useState('');

    const selectedClassColor = selectedClass?.color || '#3182CE';
    const selectedClassIcon = selectedClass?.icon || 'BookOpen01';

    const assessmentWeight = 100 - practiceWeight;

    // ─── Load Grades from localStorage on Mount (with legacy cookie migration) ───
    useEffect(() => {
        try {
            const stored = localStorage.getItem('classGrades');
            if (stored) {
                setClassGrades(JSON.parse(stored) || {});
            } else {
                // Fallback / migration path from legacy cookie
                const legacyVal = Cookies.get('classGrades');
                if (legacyVal) {
                    const parsed = JSON.parse(legacyVal);
                    if (parsed) {
                        setClassGrades(parsed);
                        localStorage.setItem('classGrades', JSON.stringify(parsed));
                    }
                    // Clean up cookie to prevent future browser bloat
                    Cookies.remove('classGrades');
                }
            }
        } catch (e) {
            console.error('Error loading classGrades from storage:', e);
        }
    }, []);

    // ─── Auth Guard & Mode Sync ─────────────────────────────────────────────────
    useEffect(() => {
        if (!user && entryMode === 'paste') {
            setEntryMode('manual');
        }
    }, [user, entryMode]);

    // ─── Select Class & Restore State ───────────────────────────────────────────
    const selectClass = (cls: Class) => {
        setSelectedClass(cls);
        const stored = classGrades[cls.id];
        if (stored) {
            setAssignments(stored.assignments || []);
            setPracticeWeight(stored.practiceWeight ?? 15);
            setStep('results');
        } else {
            setAssignments([]);
            setPracticeWeight(15);
            setStep('weights');
        }
        // Reset secondary states
        setRawText('');
        setError('');
        setErrorInfo(null);
        setExpandedCategory(null);
    };

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

    // ─── Save / Update Class Grades in localStorage ──────────────────────────────
    const saveGrade = (classId: string, currentAssignments: Assignment[], currentPracticeWeight: number, finalGrade: number) => {
        setClassGrades(prev => {
            const updatedGrades = {
                ...prev,
                [classId]: {
                    assignments: currentAssignments,
                    practiceWeight: currentPracticeWeight,
                    finalGrade,
                },
            };
            localStorage.setItem('classGrades', JSON.stringify(updatedGrades));
            return updatedGrades;
        });
    };

    const deleteGrade = (classId: string, e?: React.MouseEvent) => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
        setClassGrades(prev => {
            const updatedGrades = { ...prev };
            delete updatedGrades[classId];
            localStorage.setItem('classGrades', JSON.stringify(updatedGrades));
            return updatedGrades;
        });

        if (selectedClass?.id === classId) {
            setAssignments([]);
            setPracticeWeight(15);
            setStep('weights');
        }
    };

    // Auto-save whenever assignments or weights change for the selected class
    useEffect(() => {
        if (selectedClass && results) {
            saveGrade(selectedClass.id, assignments, practiceWeight, results.finalGrade);
        }
    }, [assignments, practiceWeight, results?.finalGrade]);

    // ─── Letter Grade Helper ─────────────────────────────────────────────────────
    const getLetterGrade = (percent: number): { letter: string; color: string } => {
        if (percent >= 90) return { letter: 'A', color: '#22c55e' };
        if (percent >= 80) return { letter: 'B', color: '#3b82f6' };
        if (percent >= 70) return { letter: 'C', color: '#eab308' };
        return { letter: 'I', color: '#ef4444' };
    };

    // ─── Extract and Parse JSON Helper ──────────────────────────────────────────
    const extractJSON = (text: string) => {
        const cleanJsonString = (str: string): string => {
            let cleaned = str.trim();
            // Remove markdown codeblock boundaries
            cleaned = cleaned.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '');
            // Strip JavaScript/JSON line comments (//...) or shell/Python comments (#...)
            cleaned = cleaned.replace(/(?:^|\s)\/\/.*$/gm, '');
            cleaned = cleaned.replace(/(?:^|\s)#.*$/gm, '');
            // Remove trailing commas inside objects and arrays
            cleaned = cleaned.replace(/,\s*([\]}])/g, '$1');
            // Clean curly and smart quotes
            cleaned = cleaned.replace(/[\u201C\u201D]/g, '"');
            return cleaned.trim();
        };

        // 1. Direct standard parse
        try {
            return JSON.parse(text.trim());
        } catch { }

        // 2. Code Block match regex
        const codeBlockRegex = /```(?:json)?\s*([\s\S]*?)```/i;
        const match = text.match(codeBlockRegex);
        if (match && match[1]) {
            const target = match[1].trim();
            try {
                return JSON.parse(target);
            } catch {
                try {
                    return JSON.parse(cleanJsonString(target));
                } catch { }
            }
        }

        // 3. Curly braces bounding match
        const firstBrace = text.indexOf('{');
        const lastBrace = text.lastIndexOf('}');
        if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
            const potentialJSON = text.substring(firstBrace, lastBrace + 1);
            try {
                return JSON.parse(potentialJSON.trim());
            } catch (eOuter) {
                try {
                    return JSON.parse(cleanJsonString(potentialJSON));
                } catch (eInner: any) {
                    throw new SyntaxError(`Malformed JSON structure inside bounds: ${eInner.message}`);
                }
            }
        }

        throw new Error("Could not locate any valid JSON structure or bounding curly braces in the response.");
    };

    // ─── Parse Grades ──────────────────────────────────────────────────────────
    const parseGrades = async () => {
        if (!rawText.trim()) return;
        setLoading(true);
        setError('');
        setErrorInfo(null);
        setLiveStreamText('');

        try {
            const res = await fetch('/api/grades/parse', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ rawText }),
            });

            if (!res.ok) {
                const errorData = await res.json().catch(() => ({}));
                throw new Error(errorData.details || errorData.error || 'Failed to parse grades');
            }

            const reader = res.body?.getReader();
            const decoder = new TextDecoder();
            let accumulated = '';

            if (reader) {
                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;
                    const chunk = decoder.decode(value, { stream: true });
                    accumulated += chunk;
                    setLiveStreamText(accumulated);
                }
            }

            const data = extractJSON(accumulated);

            if (data.assignments && Array.isArray(data.assignments)) {
                setAssignments(data.assignments);
                setStep('results');
            } else {
                throw new Error('Invalid response structure: Expected a root "assignments" array.');
            }
        } catch (err: any) {
            console.error('Grade parser error:', err);
            setError(err.message || 'Failed to parse grades');
            setErrorInfo({
                message: err.message || 'An unexpected parsing error occurred.',
                rawOutput: liveStreamText || 'No output was received from the model stream.',
                errorType: err.name || 'Error',
                stack: err.stack || new Error().stack
            });
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
        setErrorInfo(null);
        setExpandedCategory(null);
        setEntryMode('paste');
        setManualName('');
        setManualCategory('assessment');
        setManualEarned('');
        setManualPossible('');

        if (selectedClass) {
            deleteGrade(selectedClass.id);
        }
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

    const gradedClassesCount = useMemo(() => {
        return classes.filter(cls => classGrades[cls.id]).length;
    }, [classes, classGrades]);

    return (
        <div className="min-h-screen bg-[#fffaf4] dark:bg-gray-950 font-sans relative">

            {/* ── Ambient glows ─────────────────────── */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-sky-200/20 dark:bg-sky-500/[0.06] rounded-full blur-[140px]" />
                <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-[#ebf6b5]/30 dark:bg-emerald-500/[0.04] rounded-full blur-[120px]" />
                <div className="absolute top-1/3 right-0 w-[300px] h-[300px] bg-[#ebf6b5]/20 dark:bg-emerald-500/[0.04] rounded-full blur-[100px]" />
            </div>

            <div className="relative z-10 w-full mx-auto px-4 sm:px-6 md:px-12 lg:px-16 pt-28 pb-16">

                {/* Header — matching Translate's minimal heading */}
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-8 sm:mb-10">
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <h1 className="text-4xl lg:text-[52px] font-bold text-sky-500 dark:text-sky-400 leading-[1.08] tracking-tight mb-3">
                            Calculate grades.
                        </h1>
                        <p className="text-sm sm:text-base text-sky-600 dark:text-sky-300 font-medium">
                            {selectedClass
                                ? `Grade calculator for ${selectedClass.name}`
                                : 'Select a class to calculate and track your weighted average.'
                            }
                        </p>
                    </motion.div>

                    {/* Header Info Pills */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center gap-2"
                    >
                        {!selectedClass ? (
                            classes.length > 0 && (
                                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#ebf6b5]/60 dark:bg-sky-500/20 text-sky-600 dark:text-sky-400 rounded-full text-[10px] font-bold">
                                    <span>{gradedClassesCount} of {classes.length} classes graded</span>
                                </div>
                            )
                        ) : (
                            <div className="hidden sm:flex items-center gap-2">
                                {(['weights', 'paste', 'results'] as Step[]).map((s, i) => (
                                    <React.Fragment key={s}>
                                        <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold transition-colors ${step === s
                                            ? 'bg-[#ebf6b5]/60 dark:bg-sky-500/20 text-sky-600 dark:text-sky-400'
                                            : i < stepIndex
                                                ? 'text-sky-600/60 dark:text-sky-400/60'
                                                : 'text-sky-600/30 dark:text-sky-400/30'
                                            }`}>
                                            <span>{i + 1}.</span>
                                            <span>{s === 'weights' ? 'Weights' : s === 'paste' ? 'Paste' : 'Results'}</span>
                                        </div>
                                        {i < 2 && <span className="text-sky-600/30 dark:text-sky-400/30">→</span>}
                                    </React.Fragment>
                                ))}
                            </div>
                        )}
                    </motion.div>
                </div>

                <AnimatePresence mode="wait">
                    {/* ─── SCREEN 1: CLASS LIST ──────────────────────────────────────── */}
                    {!selectedClass ? (
                        <motion.div
                            key="class-list"
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -12 }}
                            transition={{ duration: 0.2 }}
                            className="space-y-6"
                        >
                            {classesLoading ? (
                                <div className="flex flex-col items-center justify-center py-24 space-y-4">
                                    <HugeIcon name="LoaderPinwheel" className="w-8 h-8 animate-spin text-sky-500/50" />
                                    <p className="text-xs font-bold text-sky-500/50 uppercase tracking-widest">Loading classes...</p>
                                </div>
                            ) : classes.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-24">
                                    <div className="w-20 h-20 bg-[#f5f9fc] dark:bg-gray-800 rounded-3xl border border-sky-100 dark:border-gray-700 flex items-center justify-center mb-6">
                                        <HugeIcon name="BookOpen02" className="h-9 w-9 text-sky-500/30 dark:text-sky-400/30" />
                                    </div>
                                    <h3 className="text-xl font-bold text-sky-900 dark:text-white mb-2">No Classes Found</h3>
                                    <p className="text-sm text-sky-600/50 dark:text-sky-400/50 mb-8 max-w-sm text-center">
                                        Add classes from your Dashboard to start calculating grades
                                    </p>
                                    <button
                                        onClick={() => window.location.href = '/dashboard'}
                                        className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-sky-700 bg-[#ebf6b5] hover:bg-[#e0efa0] border border-[#d4e88e] rounded-xl transition-colors"
                                    >
                                        <HugeIcon name="Home01" className="h-4 w-4" />
                                        Go to Dashboard
                                    </button>
                                </div>
                            ) : (
                                <div className="bg-white dark:bg-gray-900 rounded-[28px] border border-sky-100/80 dark:border-gray-800/80 px-6 py-2 shadow-sm">
                                    {classes.map((cls, index) => {
                                        const gradeData = classGrades[cls.id];
                                        const gradeColor = gradeData ? getLetterGrade(gradeData.finalGrade).color : '';
                                        const letterGrade = gradeData ? getLetterGrade(gradeData.finalGrade).letter : '';
                                        const classColor = cls.color || '#3182CE';
                                        const classIcon = cls.icon || 'BookOpen01';

                                        return (
                                            <motion.div
                                                key={cls.id}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: 0.05 + index * 0.03 }}
                                                onClick={() => selectClass(cls)}
                                                className="group cursor-pointer border-b border-sky-100/60 dark:border-gray-800/60 py-4 first:pt-3 last:pb-3 last:border-0"
                                            >
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-4 flex-1 min-w-0">
                                                        {/* Class Icon Container (Tinted Box Pattern) */}
                                                        <div
                                                            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border border-black/5 dark:border-white/5 transition-transform group-hover:scale-110"
                                                            style={{ backgroundColor: `${classColor}15`, color: classColor }}
                                                        >
                                                            <HugeIcon name={classIcon} size={18} />
                                                        </div>

                                                        {/* Class Title and Metadata */}
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center gap-2.5 mb-1">
                                                                <h3 className="text-[15px] font-bold text-sky-900 dark:text-white truncate group-hover:text-sky-600 dark:group-hover:text-sky-300 transition-colors">
                                                                    {cls.name}
                                                                </h3>

                                                                {gradeData ? (
                                                                    <span
                                                                        className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold"
                                                                        style={{ backgroundColor: `${gradeColor}15`, color: gradeColor }}
                                                                    >
                                                                        {letterGrade}
                                                                    </span>
                                                                ) : (
                                                                    <span className="inline-flex items-center px-2 py-0.5 bg-sky-50 dark:bg-sky-950/40 border border-sky-100/60 dark:border-sky-900/40 rounded-full text-[10px] font-bold text-sky-500/70 dark:text-sky-400/60">
                                                                        Unsaved
                                                                    </span>
                                                                )}
                                                            </div>

                                                            <div className="flex items-center gap-2.5">
                                                                <p className="text-xs text-sky-800/40 dark:text-sky-300/40 truncate">
                                                                    {gradeData
                                                                        ? `${gradeData.assignments?.length || 0} assignments tracked`
                                                                        : 'No grade calculated yet'
                                                                    }
                                                                </p>
                                                                {gradeData && (
                                                                    <>
                                                                        <span className="text-[10px] text-sky-600/30 dark:text-sky-400/30">•</span>
                                                                        <p className="text-[10px] font-bold uppercase tracking-wider text-sky-500/70 dark:text-sky-400/60">
                                                                            Practice: {gradeData.practiceWeight}%
                                                                        </p>
                                                                    </>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Right part: Grade display & action buttons */}
                                                    <div className="flex items-center gap-4 shrink-0 ml-3">
                                                        {gradeData && (
                                                            <div className="text-right flex flex-col justify-center select-none">
                                                                <span
                                                                    className="text-lg font-extrabold tabular-nums tracking-tight"
                                                                    style={{ color: gradeColor }}
                                                                >
                                                                    {gradeData.finalGrade.toFixed(1)}%
                                                                </span>
                                                            </div>
                                                        )}

                                                        <div className="flex items-center gap-1.5">
                                                            <button
                                                                className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-semibold text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-500/10 hover:bg-sky-100 dark:hover:bg-sky-500/20 rounded-lg transition-colors"
                                                            >
                                                                <HugeIcon name="PlusSign" className="h-3 w-3" />
                                                                {gradeData ? 'Edit' : 'Calculate'}
                                                            </button>
                                                            {gradeData && (
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        deleteGrade(cls.id, e);
                                                                    }}
                                                                    className="p-1.5 rounded-lg text-red-400/60 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors opacity-0 group-hover:opacity-100"
                                                                    title="Clear grade data"
                                                                >
                                                                    <HugeIcon name="Delete02" className="h-3.5 w-3.5" />
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        );
                                    })}
                                </div>
                            )}
                        </motion.div>
                    ) : (
                        /* ─── SCREEN 2: ACTIVE CALCULATOR ─────────────────────────────── */
                        <motion.div
                            key="grade-calculator-form"
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -12 }}
                            transition={{ duration: 0.2 }}
                            className="space-y-6"
                        >
                            {/* Return Button & Class Info */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <button
                                    onClick={() => setSelectedClass(null)}
                                    className="inline-flex items-center gap-1.5 text-sm text-sky-500 hover:text-sky-700 dark:text-sky-400 dark:hover:text-sky-300 transition-colors self-start"
                                >
                                    <HugeIcon name="ArrowLeft01" className="h-3.5 w-3.5" />
                                    All Classes
                                </button>

                                <div className="flex items-center gap-3">
                                    <div className="flex items-center gap-2.5 px-3 py-1.5 bg-[#ebf6b5]/60 dark:bg-sky-500/20 rounded-full">
                                        <div
                                            className="w-5 h-5 rounded-md flex items-center justify-center shrink-0"
                                            style={{ backgroundColor: `${selectedClassColor}20`, color: selectedClassColor }}
                                        >
                                            <HugeIcon name={selectedClassIcon} size={12} />
                                        </div>
                                        <span className="text-[11px] font-bold text-sky-600 dark:text-sky-400">
                                            {selectedClass.name}
                                        </span>
                                    </div>
                                    {classGrades[selectedClass.id] && (
                                        <button
                                            onClick={(e) => deleteGrade(selectedClass.id, e)}
                                            className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 text-red-400/60 hover:text-red-500 transition-colors"
                                            title="Delete stored grade"
                                        >
                                            <HugeIcon name="Delete02" className="h-3.5 w-3.5" />
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* ─── Step 1: Weights ─────────────────────────────────────────── */}
                            {step === 'weights' && (
                                <motion.div
                                    key="weights"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="bg-[#f5f9fc] dark:bg-zinc-800 rounded-[24px] overflow-hidden shadow-sm"
                                >
                                    <div className="px-5 pt-4 pb-2">
                                        <span className="text-[13px] font-bold text-sky-500 dark:text-sky-400 uppercase tracking-[0.1em]">
                                            Category Weights
                                        </span>
                                    </div>

                                    <div className="px-5 pb-6 space-y-5">
                                        {/* Slider */}
                                        <div className="space-y-3">
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm text-sky-800 dark:text-sky-200">Practice</span>
                                                <span className="text-sm font-medium tabular-nums text-sky-800 dark:text-sky-200">{practiceWeight}%</span>
                                            </div>

                                            <input
                                                type="range"
                                                min={0}
                                                max={100}
                                                step={5}
                                                value={practiceWeight}
                                                onChange={(e) => setPracticeWeight(Number(e.target.value))}
                                                className="w-full h-1.5 bg-sky-100 dark:bg-sky-900/30 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-sky-500 [&::-webkit-slider-thumb]:dark:bg-sky-400 [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:cursor-pointer"
                                            />

                                            <div className="flex justify-between items-center">
                                                <span className="text-sm text-sky-800 dark:text-sky-200">Assessments</span>
                                                <span className="text-sm font-medium tabular-nums text-sky-800 dark:text-sky-200">{assessmentWeight}%</span>
                                            </div>

                                            {/* Colored split bar */}
                                            <div className="flex rounded-full overflow-hidden h-1.5">
                                                <div
                                                    className="bg-sky-500 transition-all duration-300"
                                                    style={{ width: `${practiceWeight}%` }}
                                                />
                                                <div
                                                    className="bg-amber-500 transition-all duration-300"
                                                    style={{ width: `${assessmentWeight}%` }}
                                                />
                                            </div>
                                            <div className="flex justify-between text-[10px] font-bold">
                                                <span className="text-sky-500">Practice ({practiceWeight}%)</span>
                                                <span className="text-amber-500">Assessments ({assessmentWeight}%)</span>
                                            </div>
                                        </div>

                                        {/* Presets */}
                                        <div className="flex gap-2 flex-wrap">
                                            {PRESETS.map(preset => (
                                                <button
                                                    key={preset.label}
                                                    onClick={() => setPracticeWeight(preset.practice)}
                                                    className={`px-3 py-1.5 text-[11px] font-bold rounded-full transition-all ${practiceWeight === preset.practice
                                                        ? 'bg-[#ebf6b5]/60 dark:bg-sky-500/20 text-sky-600 dark:text-sky-400'
                                                        : 'text-sky-600/50 dark:text-sky-400/50 hover:bg-[#ebf6b5]/30 dark:hover:bg-sky-500/10'
                                                        }`}
                                                >
                                                    {preset.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Bottom action bar */}
                                    <div className="px-5 py-4 border-t border-sky-100 dark:border-sky-900/20 flex items-center justify-end">
                                        <button
                                            onClick={() => setStep('paste')}
                                            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-[#275085] dark:bg-[#4a9cdb] rounded-xl hover:bg-[#1f3f6b] dark:hover:bg-[#3d8bc4] shadow-lg shadow-[#275085]/15 dark:shadow-[#4a9cdb]/15 transition-all active:scale-95"
                                        >
                                            Continue
                                            <HugeIcon name="ArrowRight01" size={14} className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </motion.div>
                            )}

                            {/* ─── Step 2: Paste / Manual ───────────────────────────────── */}
                            {step === 'paste' && (
                                <motion.div
                                    key="paste"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="space-y-4"
                                >
                                    {/* Mode switcher */}
                                    <div className="flex items-center gap-1 p-0.5 bg-[#ebf6b5]/40 dark:bg-sky-500/10 rounded-full w-fit">
                                        {(['paste', 'manual'] as const).map(mode => {
                                            const isDisabled = mode === 'paste' && !user;
                                            return (
                                                <button
                                                    key={mode}
                                                    disabled={isDisabled}
                                                    onClick={() => !isDisabled && setEntryMode(mode)}
                                                    className={`px-3 py-1.5 text-[11px] font-bold rounded-full transition-all ${entryMode === mode
                                                        ? 'bg-[#ebf6b5]/60 dark:bg-sky-500/20 text-sky-600 dark:text-sky-400 shadow-sm'
                                                        : isDisabled
                                                            ? 'text-sky-600/20 dark:text-sky-400/20 cursor-not-allowed'
                                                            : 'text-sky-600/50 dark:text-sky-400/50 hover:text-sky-600 dark:hover:text-sky-400'
                                                        }`}
                                                >
                                                    <div className="flex items-center gap-1.5">
                                                        {mode === 'paste' ? 'AI Paste' : 'Manual Entry'}
                                                        {isDisabled && <HugeIcon name="CircleLock01" size={10} className="w-2.5 h-2.5 opacity-50" />}
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>

                                    {/* Paste mode */}
                                    {entryMode === 'paste' && (
                                        loading ? (
                                            <div className="bg-[#f5f9fc] dark:bg-zinc-800 rounded-[24px] border border-sky-100 dark:border-gray-800 p-12 flex items-center justify-center min-h-[360px]">
                                                <GradeParsingProgressBar liveText={liveStreamText} />
                                            </div>
                                        ) : (
                                            <div className="bg-[#f5f9fc] dark:bg-zinc-800 rounded-[24px] overflow-hidden shadow-sm">
                                                <div className="px-5 pt-4 pb-2 flex items-center justify-between relative">
                                                    <span className="text-[13px] font-bold text-sky-500 dark:text-sky-400 uppercase tracking-[0.1em]">
                                                        Grade Data
                                                    </span>
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-[10px] font-medium text-sky-700/60 dark:text-sky-400/60">
                                                            {rawText.length > 0 ? `${rawText.length.toLocaleString()} chars` : ''}
                                                        </span>
                                                        <button
                                                            onClick={pasteFromClipboard}
                                                            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-bold text-sky-600 dark:text-sky-400 hover:bg-[#ebf6b5]/40 dark:hover:bg-sky-500/10 rounded-full transition-colors shadow-sm"
                                                        >
                                                            <HugeIcon name="ClipboardPaste" size={16} className="w-4 h-4" />
                                                            Paste
                                                        </button>
                                                    </div>
                                                </div>

                                                <div className="relative">
                                                    <textarea
                                                        value={rawText}
                                                        onChange={(e) => setRawText(e.target.value)}
                                                        placeholder={"Paste your grades table here...\n\nAssignment Name     Points     Grade\nHW 1.1              18/20      90%\nUnit 1 Test         45/50      90%\n..."}
                                                        className="w-full h-56 sm:h-64 resize-none bg-transparent text-sky-900 dark:text-sky-100 placeholder:text-sky-700/40 dark:placeholder:text-sky-400/40 text-[15px] leading-relaxed outline-none scrollbar-hide px-6 pb-14 font-mono"
                                                    />
                                                </div>

                                                {errorInfo && (
                                                    <div className="mx-5 mb-5 rounded-2xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 overflow-hidden">
                                                        <div className="p-4 flex items-start gap-3">
                                                            <HugeIcon name="AlertCircle" className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-sm font-bold text-red-800 dark:text-red-300 mb-1">Failed to parse grades</p>
                                                                <p className="text-xs text-red-600 dark:text-red-400 leading-relaxed mb-3">
                                                                    {errorInfo.message}
                                                                </p>
                                                                <div className="flex flex-wrap gap-2">
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => { setEntryMode('manual'); setErrorInfo(null); setError(''); }}
                                                                        className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-semibold text-sky-700 bg-[#ebf6b5] hover:bg-[#e0efa0] border border-[#d4e88e] rounded-lg transition-colors"
                                                                    >
                                                                        <HugeIcon name="PencilEdit01" className="h-3 w-3" />
                                                                        Switch to Manual Entry
                                                                    </button>
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => setActiveErrorTab(activeErrorTab === 'overview' ? 'output' : activeErrorTab === 'output' ? 'stack' : 'overview')}
                                                                        className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-semibold text-sky-600 dark:text-sky-400 bg-white dark:bg-gray-900 hover:bg-sky-50 dark:hover:bg-gray-800 border border-sky-200 dark:border-gray-700 rounded-lg transition-colors"
                                                                    >
                                                                        <HugeIcon name="Search01" className="h-3 w-3" />
                                                                        {activeErrorTab === 'overview' ? 'View Raw Output' : activeErrorTab === 'output' ? 'View Stack Trace' : 'View Overview'}
                                                                    </button>
                                                                    <button
                                                                        type="button"
                                                                        onClick={async () => {
                                                                            try {
                                                                                const payload = JSON.stringify({
                                                                                    errorType: errorInfo.errorType,
                                                                                    message: errorInfo.message,
                                                                                    rawOutput: errorInfo.rawOutput,
                                                                                    stack: errorInfo.stack
                                                                                }, null, 2);
                                                                                await navigator.clipboard.writeText(payload);
                                                                            } catch { }
                                                                        }}
                                                                        className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-semibold text-sky-600 dark:text-sky-400 bg-white dark:bg-gray-900 hover:bg-sky-50 dark:hover:bg-gray-800 border border-sky-200 dark:border-gray-700 rounded-lg transition-colors"
                                                                    >
                                                                        <HugeIcon name="Copy01" className="h-3 w-3" />
                                                                        Copy Debug Info
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Expandable detail section */}
                                                        {activeErrorTab !== 'overview' && (
                                                            <div className="border-t border-red-200/60 dark:border-red-500/15 p-4">
                                                                {activeErrorTab === 'output' && (
                                                                    <div className="space-y-2">
                                                                        <span className="text-[10px] font-bold text-sky-500 dark:text-sky-400 uppercase tracking-widest">Raw AI Output</span>
                                                                        <pre className="text-[10px] font-mono leading-relaxed text-sky-800 dark:text-sky-200 overflow-x-auto whitespace-pre p-3 rounded-xl bg-white dark:bg-gray-900 border border-sky-100 dark:border-gray-800 max-h-48 scrollbar-thin select-all">
                                                                            {errorInfo.rawOutput}
                                                                        </pre>
                                                                    </div>
                                                                )}
                                                                {activeErrorTab === 'stack' && (
                                                                    <div className="space-y-2">
                                                                        <span className="text-[10px] font-bold text-sky-500 dark:text-sky-400 uppercase tracking-widest">Stack Trace</span>
                                                                        <pre className="text-[10px] font-mono leading-normal text-sky-800 dark:text-sky-200 overflow-x-auto whitespace-pre-wrap p-3 rounded-xl bg-white dark:bg-gray-900 border border-sky-100 dark:border-gray-800 max-h-48 scrollbar-thin">
                                                                            {errorInfo.stack || 'No trace captured.'}
                                                                        </pre>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                )}

                                                {/* Bottom action bar */}
                                                <div className="px-5 py-4 border-t border-sky-100 dark:border-sky-900/20 flex items-center justify-between">
                                                    <button
                                                        onClick={() => setStep('weights')}
                                                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-sky-600/60 dark:text-sky-400/60 hover:text-sky-600 dark:hover:text-sky-400 transition-colors rounded-full hover:bg-[#ebf6b5]/40 dark:hover:bg-sky-500/10"
                                                    >
                                                        Back
                                                    </button>
                                                    <button
                                                        onClick={parseGrades}
                                                        disabled={!rawText.trim()}
                                                        className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-[#275085] dark:bg-[#4a9cdb] rounded-xl hover:bg-[#1f3f6b] dark:hover:bg-[#3d8bc4] shadow-lg shadow-[#275085]/15 dark:shadow-[#4a9cdb]/15 disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-95"
                                                    >
                                                        Calculate
                                                    </button>
                                                </div>
                                            </div>
                                        )
                                    )}

                                    {entryMode === 'manual' && (
                                        <div className="space-y-4">
                                            {/* Add assignment form */}
                                            <div className="bg-[#f5f9fc] dark:bg-zinc-800 rounded-[24px] overflow-hidden shadow-sm">
                                                <div className="px-5 pt-4 pb-2">
                                                    <span className="text-[13px] font-bold text-sky-500 dark:text-sky-400 uppercase tracking-[0.1em]">
                                                        Add Assignment
                                                    </span>
                                                </div>

                                                <div className="px-5 pb-5 space-y-3">
                                                    <input
                                                        type="text"
                                                        value={manualName}
                                                        onChange={(e) => setManualName(e.target.value)}
                                                        placeholder="Assignment name"
                                                        className="w-full px-3 py-2 text-sm bg-white/60 dark:bg-zinc-700/50 border border-sky-100 dark:border-sky-900/30 rounded-xl text-sky-900 dark:text-sky-100 placeholder:text-sky-700/40 dark:placeholder:text-sky-400/40 outline-none focus:ring-1 focus:ring-sky-500/20"
                                                    />

                                                    <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                                                        <div className="flex items-center gap-1 p-0.5 bg-[#ebf6b5]/40 dark:bg-sky-500/10 rounded-full w-fit shrink-0">
                                                            {(['practice', 'assessment'] as const).map(cat => (
                                                                <button
                                                                    key={cat}
                                                                    onClick={() => setManualCategory(cat)}
                                                                    className={`px-2.5 py-1 text-[11px] font-bold rounded-full transition-all capitalize ${manualCategory === cat
                                                                        ? 'bg-[#ebf6b5]/60 dark:bg-sky-500/20 text-sky-600 dark:text-sky-400 shadow-sm'
                                                                        : 'text-sky-600/50 dark:text-sky-400/50'
                                                                        }`}
                                                                >
                                                                    {cat}
                                                                </button>
                                                            ))}
                                                        </div>

                                                        <div className="flex items-center gap-1.5 flex-1">
                                                            <input
                                                                type="number"
                                                                value={manualEarned}
                                                                onChange={(e) => setManualEarned(e.target.value)}
                                                                placeholder="Earned"
                                                                className="w-full px-3 py-2 text-sm bg-white/60 dark:bg-zinc-700/50 border border-sky-100 dark:border-sky-900/30 rounded-xl text-sky-900 dark:text-sky-100 placeholder:text-sky-700/40 dark:placeholder:text-sky-400/40 outline-none focus:ring-1 focus:ring-sky-500/20 tabular-nums [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                                            />
                                                            <span className="text-xs text-sky-600/40 dark:text-sky-400/40 shrink-0">/</span>
                                                            <input
                                                                type="number"
                                                                value={manualPossible}
                                                                onChange={(e) => setManualPossible(e.target.value)}
                                                                placeholder="Possible"
                                                                className="w-full px-3 py-2 text-sm bg-white/60 dark:bg-zinc-700/50 border border-sky-100 dark:border-sky-900/30 rounded-xl text-sky-900 dark:text-sky-100 placeholder:text-sky-700/40 dark:placeholder:text-sky-400/40 outline-none focus:ring-1 focus:ring-sky-500/20 tabular-nums [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="px-5 py-3 border-t border-sky-100 dark:border-sky-900/20 flex items-center justify-between">
                                                    {!user && (
                                                        <div className="flex items-center gap-1.5 px-2 text-[10px] text-sky-600/50 dark:text-sky-400/50 italic">
                                                            <HugeIcon name="CircleLock01" size={10} className="w-2.5 h-2.5" />
                                                            AI Paste requires an account
                                                        </div>
                                                    )}
                                                    <button
                                                        onClick={addManualAssignment}
                                                        disabled={!manualName.trim() || !manualEarned || !manualPossible}
                                                        className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-sky-600 dark:text-sky-400 hover:bg-[#ebf6b5]/40 dark:hover:bg-sky-500/10 rounded-full transition-colors disabled:opacity-30 disabled:cursor-not-allowed active:scale-95 ml-auto"
                                                    >
                                                        <HugeIcon name="PlusSign" size={12} className="w-3 h-3" />
                                                        Add Item
                                                    </button>
                                                </div>
                                            </div>

                                            {/* List of added assignments */}
                                            {assignments.length > 0 && (
                                                <div className="bg-[#f5f9fc] dark:bg-zinc-800 rounded-[24px] overflow-hidden shadow-sm">
                                                    <div className="px-5 pt-4 pb-2 flex items-center justify-between">
                                                        <span className="text-[11px] font-bold uppercase tracking-[0.1em] text-sky-500 dark:text-sky-400">
                                                            Assignments ({assignments.length})
                                                        </span>
                                                    </div>
                                                    <div className="px-4 pb-4 space-y-1">
                                                        {assignments.map((a, idx) => (
                                                            <div key={idx} className="flex items-center gap-2 py-1.5 px-3 rounded-xl hover:bg-sky-50 dark:hover:bg-sky-500/5 group transition-colors">
                                                                <span className="text-[10px] font-bold uppercase tracking-wide text-sky-500/70 dark:text-sky-400/70 w-12 shrink-0">
                                                                    {a.category === 'practice' ? 'Prac' : 'Test'}
                                                                </span>
                                                                <span className="flex-1 text-xs text-sky-800 dark:text-sky-200 truncate">
                                                                    {a.name}
                                                                </span>
                                                                <span className="text-xs font-medium tabular-nums text-sky-700/70 dark:text-sky-400/70 shrink-0">
                                                                    {a.pointsEarned}/{a.pointsPossible}
                                                                </span>
                                                                <button
                                                                    onClick={() => removeAssignment(idx)}
                                                                    title="Remove"
                                                                    className="p-1 rounded text-sky-400/40 hover:text-red-500 dark:text-sky-600/40 dark:hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                                                                >
                                                                    <HugeIcon name="Delete02" size={12} className="w-3 h-3" />
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
                                                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-sky-600/60 dark:text-sky-400/60 hover:text-sky-600 dark:hover:text-sky-400 transition-colors rounded-full hover:bg-[#ebf6b5]/40 dark:hover:bg-sky-500/10"
                                                >
                                                    Back
                                                </button>
                                                <button
                                                    onClick={goToResultsManual}
                                                    disabled={assignments.length === 0}
                                                    className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-[#275085] dark:bg-[#4a9cdb] rounded-xl hover:bg-[#1f3f6b] dark:hover:bg-[#3d8bc4] shadow-lg shadow-[#275085]/15 dark:shadow-[#4a9cdb]/15 disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-95"
                                                >
                                                    Calculate
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </motion.div>
                            )}

                            {/* ─── Step 3: Results ──────────────────────────────────────────── */}
                            {step === 'results' && results && (
                                <motion.div
                                    key="results"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="space-y-4"
                                >
                                    {/* Grade result — top panel */}
                                    <div className="bg-[#f5f9fc] dark:bg-zinc-800 rounded-[24px] overflow-hidden shadow-sm">
                                        <div className="px-5 pt-4 pb-2">
                                            <span className="text-[13px] font-bold text-sky-500 dark:text-sky-400 uppercase tracking-[0.1em]">
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
                                                    className="text-3xl font-bold tabular-nums text-sky-900 dark:text-sky-100 animate-pulse"
                                                >
                                                    {results.finalGrade.toFixed(1)}%
                                                </motion.p>
                                                <p className="text-xs text-sky-700/60 dark:text-sky-400/60 mt-0.5">
                                                    {results.totalAssignments} assignments · {practiceWeight}/{assessmentWeight} weighting
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Edit hint */}
                                    <div className="flex items-start gap-2.5 px-5 py-3 bg-[#ebf6b5]/30 dark:bg-sky-500/10 rounded-[16px]">
                                        <HugeIcon name="AlertCircle" size={14} className="w-3.5 h-3.5 text-sky-500 dark:text-sky-400 shrink-0 mt-0.5" />
                                        <p className="text-[11px] text-sky-700 dark:text-sky-300 leading-relaxed">
                                            Expand a category to edit names, scores, or swap categories. Changes recalculate and save instantly.
                                        </p>
                                    </div>

                                    {/* Category panels */}
                                    <div className="grid md:grid-cols-2 gap-4">
                                        {/* Practice */}
                                        <div className="bg-[#f5f9fc] dark:bg-zinc-800 rounded-[24px] overflow-hidden shadow-sm">
                                            <button
                                                onClick={() => setExpandedCategory(expandedCategory === 'practice' ? null : 'practice')}
                                                className="w-full px-5 pt-4 pb-3 flex items-center justify-between hover:bg-sky-50 dark:hover:bg-sky-500/5 transition-colors"
                                            >
                                                <div className="text-left">
                                                    <span className="text-[13px] font-bold text-sky-500 dark:text-sky-400 uppercase tracking-[0.1em]">
                                                        Practice
                                                    </span>
                                                    <p className="text-[11px] text-sky-700/60 dark:text-sky-400/60 mt-0.5">
                                                        {results.practice.count} items · {practiceWeight}% weight
                                                    </p>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <div className="text-right">
                                                        <p className="text-sm font-medium tabular-nums text-sky-800 dark:text-sky-200">
                                                            {results.practice.possible > 0 ? `${results.practice.percent.toFixed(1)}%` : '—'}
                                                        </p>
                                                        <p className="text-[10px] text-sky-700/60 dark:text-sky-400/60 tabular-nums">
                                                            {results.practice.earned}/{results.practice.possible} pts
                                                        </p>
                                                    </div>
                                                    {expandedCategory === 'practice' ? (
                                                        <HugeIcon name="ArrowUp02" size={14} className="w-3.5 h-3.5 text-sky-500" />
                                                    ) : (
                                                        <HugeIcon name="ArrowDown01" size={14} className="w-3.5 h-3.5 text-sky-500/50" />
                                                    )}
                                                </div>
                                            </button>

                                            <AnimatePresence>
                                                {expandedCategory === 'practice' && (
                                                    <motion.div
                                                        initial={{ height: 0 }}
                                                        animate={{ height: 'auto' }}
                                                        exit={{ height: 0 }}
                                                        className="overflow-hidden border-t border-sky-100/50 dark:border-sky-900/20"
                                                    >
                                                        <div className="p-4 space-y-3">
                                                            {assignments.filter(a => a.category === 'practice').map((a) => {
                                                                const idx = assignments.indexOf(a);
                                                                return (
                                                                    <div key={idx} className="flex flex-col sm:flex-row sm:items-center gap-3 p-3 bg-white/60 dark:bg-zinc-700/35 border border-sky-100 dark:border-sky-900/10 rounded-2xl relative group">
                                                                        <input
                                                                            type="text"
                                                                            value={a.name}
                                                                            onChange={(e) => updateAssignment(idx, 'name', e.target.value)}
                                                                            className="flex-1 min-w-0 bg-transparent text-sm font-semibold text-sky-900 dark:text-sky-100 outline-none"
                                                                        />
                                                                        <div className="flex items-center gap-2">
                                                                            <input
                                                                                type="number"
                                                                                value={a.pointsEarned}
                                                                                onChange={(e) => updateAssignment(idx, 'pointsEarned', e.target.value)}
                                                                                className="w-16 px-2 py-1 text-xs text-center bg-sky-50/50 dark:bg-zinc-800 border border-sky-100 dark:border-sky-900/20 rounded-lg outline-none font-medium tabular-nums"
                                                                            />
                                                                            <span className="text-xs text-sky-600/35 dark:text-sky-400/30">/</span>
                                                                            <input
                                                                                type="number"
                                                                                value={a.pointsPossible}
                                                                                onChange={(e) => updateAssignment(idx, 'pointsPossible', e.target.value)}
                                                                                className="w-16 px-2 py-1 text-xs text-center bg-sky-50/50 dark:bg-zinc-800 border border-sky-100 dark:border-sky-900/20 rounded-lg outline-none font-medium tabular-nums"
                                                                            />
                                                                            <button
                                                                                onClick={() => toggleCategory(idx)}
                                                                                className="p-1 text-[9px] font-extrabold text-sky-600/50 hover:text-sky-600 dark:text-sky-400/40 dark:hover:text-sky-400 hover:bg-sky-50 dark:hover:bg-zinc-800 rounded uppercase tracking-wider transition-colors shrink-0"
                                                                                title="Move to Assessments"
                                                                            >
                                                                                To Test
                                                                            </button>
                                                                            <button
                                                                                onClick={() => removeAssignment(idx)}
                                                                                className="p-1 hover:bg-red-50 dark:hover:bg-red-950/20 text-sky-400/40 hover:text-red-500 dark:text-sky-600/40 dark:hover:text-red-400 rounded transition-colors shrink-0"
                                                                            >
                                                                                <HugeIcon name="Delete02" size={14} />
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                );
                                                            })}
                                                            {results.practice.count === 0 && (
                                                                <p className="text-xs text-sky-600/45 dark:text-sky-400/40 text-center py-4 italic">No practice assignments.</p>
                                                            )}
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>

                                        {/* Assessments */}
                                        <div className="bg-[#f5f9fc] dark:bg-zinc-800 rounded-[24px] overflow-hidden shadow-sm">
                                            <button
                                                onClick={() => setExpandedCategory(expandedCategory === 'assessment' ? null : 'assessment')}
                                                className="w-full px-5 pt-4 pb-3 flex items-center justify-between hover:bg-sky-50 dark:hover:bg-sky-500/5 transition-colors"
                                            >
                                                <div className="text-left">
                                                    <span className="text-[13px] font-bold text-sky-500 dark:text-sky-400 uppercase tracking-[0.1em]">
                                                        Assessments
                                                    </span>
                                                    <p className="text-[11px] text-sky-700/60 dark:text-sky-400/60 mt-0.5">
                                                        {results.assessment.count} items · {assessmentWeight}% weight
                                                    </p>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <div className="text-right">
                                                        <p className="text-sm font-medium tabular-nums text-sky-800 dark:text-sky-200">
                                                            {results.assessment.possible > 0 ? `${results.assessment.percent.toFixed(1)}%` : '—'}
                                                        </p>
                                                        <p className="text-[10px] text-sky-700/60 dark:text-sky-400/60 tabular-nums">
                                                            {results.assessment.earned}/{results.assessment.possible} pts
                                                        </p>
                                                    </div>
                                                    {expandedCategory === 'assessment' ? (
                                                        <HugeIcon name="ArrowUp02" size={14} className="w-3.5 h-3.5 text-sky-500" />
                                                    ) : (
                                                        <HugeIcon name="ArrowDown01" size={14} className="w-3.5 h-3.5 text-sky-500/50" />
                                                    )}
                                                </div>
                                            </button>

                                            <AnimatePresence>
                                                {expandedCategory === 'assessment' && (
                                                    <motion.div
                                                        initial={{ height: 0 }}
                                                        animate={{ height: 'auto' }}
                                                        exit={{ height: 0 }}
                                                        className="overflow-hidden border-t border-sky-100/50 dark:border-sky-900/20"
                                                    >
                                                        <div className="p-4 space-y-3">
                                                            {assignments.filter(a => a.category === 'assessment').map((a) => {
                                                                const idx = assignments.indexOf(a);
                                                                return (
                                                                    <div key={idx} className="flex flex-col sm:flex-row sm:items-center gap-3 p-3 bg-white/60 dark:bg-zinc-700/35 border border-sky-100 dark:border-sky-900/10 rounded-2xl relative group">
                                                                        <input
                                                                            type="text"
                                                                            value={a.name}
                                                                            onChange={(e) => updateAssignment(idx, 'name', e.target.value)}
                                                                            className="flex-1 min-w-0 bg-transparent text-sm font-semibold text-sky-900 dark:text-sky-100 outline-none"
                                                                        />
                                                                        <div className="flex items-center gap-2">
                                                                            <input
                                                                                type="number"
                                                                                value={a.pointsEarned}
                                                                                onChange={(e) => updateAssignment(idx, 'pointsEarned', e.target.value)}
                                                                                className="w-16 px-2 py-1 text-xs text-center bg-sky-50/50 dark:bg-zinc-800 border border-sky-100 dark:border-sky-900/20 rounded-lg outline-none font-medium tabular-nums"
                                                                            />
                                                                            <span className="text-xs text-sky-600/35 dark:text-sky-400/30">/</span>
                                                                            <input
                                                                                type="number"
                                                                                value={a.pointsPossible}
                                                                                onChange={(e) => updateAssignment(idx, 'pointsPossible', e.target.value)}
                                                                                className="w-16 px-2 py-1 text-xs text-center bg-sky-50/50 dark:bg-zinc-800 border border-sky-100 dark:border-sky-900/20 rounded-lg outline-none font-medium tabular-nums"
                                                                            />
                                                                            <button
                                                                                onClick={() => toggleCategory(idx)}
                                                                                className="p-1 text-[9px] font-extrabold text-sky-600/50 hover:text-sky-600 dark:text-sky-400/40 dark:hover:text-sky-400 hover:bg-sky-50 dark:hover:bg-zinc-800 rounded uppercase tracking-wider transition-colors shrink-0"
                                                                                title="Move to Practice"
                                                                            >
                                                                                To Prac
                                                                            </button>
                                                                            <button
                                                                                onClick={() => removeAssignment(idx)}
                                                                                className="p-1 hover:bg-red-50 dark:hover:bg-red-950/20 text-sky-400/40 hover:text-red-500 dark:text-sky-600/40 dark:hover:text-red-400 rounded transition-colors shrink-0"
                                                                            >
                                                                                <HugeIcon name="Delete02" size={14} />
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                );
                                                            })}
                                                            {results.assessment.count === 0 && (
                                                                <p className="text-xs text-sky-600/45 dark:text-sky-400/40 text-center py-4 italic">No assessment assignments.</p>
                                                            )}
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    </div>

                                    {/* Weighted Breakdown */}
                                    <div className="bg-[#f5f9fc] dark:bg-zinc-800 rounded-[24px] overflow-hidden shadow-sm">
                                        <div className="px-5 pt-4 pb-2">
                                            <span className="text-[13px] font-bold text-sky-500 dark:text-sky-400 uppercase tracking-[0.1em]">
                                                Weighted Breakdown
                                            </span>
                                        </div>
                                        <div className="px-5 pb-5 space-y-2 text-xs">
                                            <div className="flex justify-between text-sky-800 dark:text-sky-200">
                                                <span>Practice ({practiceWeight}% weight)</span>
                                                <span className="font-medium tabular-nums">
                                                    {results.practice.possible > 0
                                                        ? `${results.practice.percent.toFixed(1)}% × ${practiceWeight}% = ${(results.practice.percent * practiceWeight / 100).toFixed(1)}%`
                                                        : 'No assignments'}
                                                </span>
                                            </div>
                                            <div className="flex justify-between text-sky-800 dark:text-sky-200">
                                                <span>Assessments ({assessmentWeight}% weight)</span>
                                                <span className="font-medium tabular-nums">
                                                    {results.assessment.possible > 0
                                                        ? `${results.assessment.percent.toFixed(1)}% × ${assessmentWeight}% = ${(results.assessment.percent * assessmentWeight / 100).toFixed(1)}%`
                                                        : 'No assignments'}
                                                </span>
                                            </div>
                                            <div className="border-t border-sky-100 dark:border-sky-900/20 pt-2 flex justify-between font-semibold text-sky-900 dark:text-sky-100">
                                                <span>Final Grade</span>
                                                <span className="tabular-nums">{results.finalGrade.toFixed(1)}%</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action row (Edit / Reset) */}
                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={() => setStep('paste')}
                                            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-sky-600 dark:text-sky-400 hover:text-sky-800 hover:bg-sky-50 dark:hover:bg-zinc-800 border border-sky-100 dark:border-gray-800 rounded-xl transition-all shadow-sm"
                                        >
                                            <HugeIcon name="PlusSign" size={12} />
                                            Add More Assignments
                                        </button>
                                        <button
                                            onClick={reset}
                                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-sky-600/60 dark:text-sky-400/60 hover:text-sky-600 dark:hover:text-sky-400 transition-colors rounded-full hover:bg-[#ebf6b5]/40 dark:hover:bg-sky-500/10"
                                        >
                                            <HugeIcon name="Rotate01" size={12} className="w-3 h-3" />
                                            Reset & Start Over
                                        </button>
                                    </div>
                                </motion.div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Footer */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="mt-20 pt-8 border-t border-sky-100 dark:border-sky-900/20"
                >
                    <div className="flex items-center justify-between">
                        <p className="text-xs sm:text-sm text-sky-700/60 dark:text-sky-400/60 font-medium">
                            Built for students • Public Beta {getFullVersionString()}
                        </p>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
