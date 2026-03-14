'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRightLeft, Copy, Check, Volume2, Loader2, ChevronDown, X } from 'lucide-react';
import { useWideLayout } from '@/hooks/use-wide-layout';
import { useRouteIntro } from '@/hooks/use-route-intro';
import { RouteIntroPopup } from '@/components/RouteIntroPopup';
import { getFullVersionString } from '@/config/version';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { Languages, Lock } from 'lucide-react';
import Cookies from 'js-cookie';
import { getPlanTier, TIER_LIMITS } from '@/lib/planTier';
import { useUpgrade } from '@/context/UpgradeContext';

// Supported languages for the translation
const LANGUAGES = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'es', name: 'Spanish', flag: '🇪🇸' },
    { code: 'fr', name: 'French', flag: '🇫🇷' },
    { code: 'de', name: 'German', flag: '🇩🇪' },
    { code: 'it', name: 'Italian', flag: '🇮🇹' },
    { code: 'pt', name: 'Portuguese', flag: '🇵🇹' },
    { code: 'nl', name: 'Dutch', flag: '🇳🇱' },
    { code: 'ru', name: 'Russian', flag: '🇷🇺' },
    { code: 'ja', name: 'Japanese', flag: '🇯🇵' },
    { code: 'ko', name: 'Korean', flag: '🇰🇷' },
    { code: 'zh-Hans', name: 'Chinese (Simplified)', flag: '🇨🇳' },
    { code: 'zh-Hant', name: 'Chinese (Traditional)', flag: '🇹🇼' },
    { code: 'ar', name: 'Arabic', flag: '🇸🇦' },
    { code: 'hi', name: 'Hindi', flag: '🇮🇳' },
    { code: 'bn', name: 'Bengali', flag: '🇧🇩' },
    { code: 'tr', name: 'Turkish', flag: '🇹🇷' },
    { code: 'pl', name: 'Polish', flag: '🇵🇱' },
    { code: 'uk', name: 'Ukrainian', flag: '🇺🇦' },
    { code: 'vi', name: 'Vietnamese', flag: '🇻🇳' },
    { code: 'th', name: 'Thai', flag: '🇹🇭' },
    { code: 'id', name: 'Indonesian', flag: '🇮🇩' },
    { code: 'ms', name: 'Malay', flag: '🇲🇾' },
    { code: 'sv', name: 'Swedish', flag: '🇸🇪' },
    { code: 'no', name: 'Norwegian', flag: '🇳🇴' },
    { code: 'da', name: 'Danish', flag: '🇩🇰' },
    { code: 'fi', name: 'Finnish', flag: '🇫🇮' },
    { code: 'el', name: 'Greek', flag: '🇬🇷' },
    { code: 'he', name: 'Hebrew', flag: '🇮🇱' },
    { code: 'cs', name: 'Czech', flag: '🇨🇿' },
    { code: 'ro', name: 'Romanian', flag: '🇷🇴' },
    { code: 'hu', name: 'Hungarian', flag: '🇭🇺' },
    { code: 'sw', name: 'Swahili', flag: '🇰🇪' },
    { code: 'ta', name: 'Tamil', flag: '🇮🇳' },
    { code: 'te', name: 'Telugu', flag: '🇮🇳' },
    { code: 'mr', name: 'Marathi', flag: '🇮🇳' },
    { code: 'gu', name: 'Gujarati', flag: '🇮🇳' },
    { code: 'kn', name: 'Kannada', flag: '🇮🇳' },
    { code: 'ml', name: 'Malayalam', flag: '🇮🇳' },
    { code: 'pa', name: 'Punjabi', flag: '🇮🇳' },
    { code: 'ur', name: 'Urdu', flag: '🇵🇰' },
    { code: 'fa', name: 'Persian', flag: '🇮🇷' },
    { code: 'af', name: 'Afrikaans', flag: '🇿🇦' },
    { code: 'bg', name: 'Bulgarian', flag: '🇧🇬' },
    { code: 'hr', name: 'Croatian', flag: '🇭🇷' },
    { code: 'sk', name: 'Slovak', flag: '🇸🇰' },
    { code: 'sl', name: 'Slovenian', flag: '🇸🇮' },
    { code: 'lt', name: 'Lithuanian', flag: '🇱🇹' },
    { code: 'lv', name: 'Latvian', flag: '🇱🇻' },
    { code: 'et', name: 'Estonian', flag: '🇪🇪' },
    { code: 'ca', name: 'Catalan', flag: '🇪🇸' },
    { code: 'eu', name: 'Basque', flag: '🇪🇸' },
    { code: 'gl', name: 'Galician', flag: '🇪🇸' },
    { code: 'cy', name: 'Welsh', flag: '🏴󠁧󠁢󠁷󠁬󠁳󠁿' },
    { code: 'ga', name: 'Irish', flag: '🇮🇪' },
];

interface LanguageSelectorProps {
    value: string;
    onChange: (code: string) => void;
    label: string;
}

function LanguageSelector({ value, onChange, label }: LanguageSelectorProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState('');
    const dropdownRef = useRef<HTMLDivElement>(null);

    const selectedLang = LANGUAGES.find(l => l.code === value);
    const filteredLanguages = LANGUAGES.filter(l =>
        l.name.toLowerCase().includes(search.toLowerCase()) ||
        l.code.toLowerCase().includes(search.toLowerCase())
    );

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
                setSearch('');
            }
        }

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#ebf6b5]/60 dark:bg-sky-500/20 rounded-full transition-all duration-150 hover:bg-[#ebf6b5] dark:hover:bg-sky-500/30 group"
            >
                <span className="text-base leading-none">{selectedLang?.flag}</span>
                <span className="text-[11px] font-bold text-sky-600 dark:text-sky-400">{selectedLang?.name}</span>
                <ChevronDown className={`h-3 w-3 text-sky-600/60 dark:text-sky-400/60 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -8, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -8, scale: 0.98 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                        className="absolute top-full left-0 mt-1.5 z-50 w-64 bg-[#eff6fe]/95 dark:bg-zinc-900/95 backdrop-blur-xl border border-[#275085]/10 dark:border-[#4a9cdb]/10 rounded-xl shadow-xl overflow-hidden"
                    >
                        <div className="p-2 border-b border-[#275085]/5 dark:border-[#4a9cdb]/5">
                            <input
                                type="text"
                                placeholder="Search languages..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full px-3 py-2 bg-[#275085]/[0.03] dark:bg-[#4a9cdb]/[0.03] rounded-lg text-sm text-[#275085] dark:text-[#4a9cdb] placeholder:text-[#275085]/30 dark:placeholder:text-[#4a9cdb]/30 outline-none focus:ring-1 focus:ring-[#275085]/20 dark:focus:ring-[#4a9cdb]/20"
                                autoFocus
                            />
                        </div>
                        <div className="max-h-64 overflow-y-auto scrollbar-hide">
                            {filteredLanguages.map((lang) => (
                                <button
                                    key={lang.code}
                                    onClick={() => {
                                        onChange(lang.code);
                                        setIsOpen(false);
                                        setSearch('');
                                    }}
                                    className={`w-full flex items-center gap-3 px-3 py-2 hover:bg-[#275085]/[0.04] dark:hover:bg-[#4a9cdb]/[0.06] transition-colors ${value === lang.code ? 'bg-emerald-500/5 dark:bg-emerald-400/5' : ''
                                        }`}
                                >
                                    <span className="text-lg">{lang.flag}</span>
                                    <span className={`text-sm ${value === lang.code ? 'text-emerald-500 dark:text-emerald-400 font-semibold' : 'text-[#275085]/70 dark:text-[#4a9cdb]/70'}`}>
                                        {lang.name}
                                    </span>
                                    {value === lang.code && (
                                        <Check className="h-3.5 w-3.5 text-emerald-500 dark:text-emerald-400 ml-auto" />
                                    )}
                                </button>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

export default function TranslatePage() {
    const router = useRouter();
    const { user } = useAuth();
    const { getContainerClass } = useWideLayout();
    const { showIntro, dismissIntro } = useRouteIntro('translate');
    const { handlePlanLimitError } = useUpgrade();

    // ─── Plan tier limits ───────────────────────────────────────────────
    const tier = getPlanTier();
    const limits = TIER_LIMITS[tier];
    const MAX_CHARS = limits.translationMaxChars;

    const [sourceLanguage, setSourceLanguage] = useState('en');
    const [targetLanguage, setTargetLanguage] = useState('es');
    const [sourceText, setSourceText] = useState('');
    const [translatedText, setTranslatedText] = useState('');
    const [pronunciation, setPronunciation] = useState('');
    const [explanation, setExplanation] = useState('');
    const [isTranslating, setIsTranslating] = useState(false);
    const [copied, setCopied] = useState(false);
    const [charCount, setCharCount] = useState(0);
    const [translationsCount, setTranslationsCount] = useState<number>(0);

    // Load initial count
    useEffect(() => {
        if (user) {
            const today = new Date().toISOString().slice(0, 10);
            const count = parseInt(Cookies.get(`translate_usage_${today}`) || '0', 10);
            setTranslationsCount(count);
        } else {
            const count = parseInt(Cookies.get('translate_usage_guest') || '0', 10);
            setTranslationsCount(count);
        }
    }, [user]);

    const abortControllerRef = useRef<AbortController | null>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const abortedRef = useRef(false);

    const handleSourceTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const text = e.target.value;
        if (text.length <= MAX_CHARS) {
            setSourceText(text);
            setCharCount(text.length);
        }
    };

    const swapLanguages = () => {
        setSourceLanguage(targetLanguage);
        setTargetLanguage(sourceLanguage);
        setSourceText(translatedText);
        setTranslatedText(sourceText);
        setPronunciation('');
        setExplanation('');
    };

    const copyToClipboard = async () => {
        if (!translatedText) return;
        try {
            await navigator.clipboard.writeText(translatedText);
            setCopied(true);
            toast.success('Copied to clipboard');
            setTimeout(() => setCopied(false), 2000);
        } catch {
            toast.error('Failed to copy');
        }
    };

    const speakText = (text: string, langCode: string) => {
        if (!text || typeof window === 'undefined' || !window.speechSynthesis) {
            toast.error('Text-to-speech is not supported in this browser');
            return;
        }

        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        const voices = window.speechSynthesis.getVoices();
        const voice = voices.find(v => v.lang === langCode) ||
            voices.find(v => v.lang.startsWith(langCode)) ||
            voices.find(v => v.lang.includes(langCode));

        if (voice) {
            utterance.voice = voice;
        }

        utterance.lang = langCode;
        utterance.rate = 1.0;
        utterance.pitch = 1.0;

        setTimeout(() => {
            window.speechSynthesis.speak(utterance);
        }, 50);
    };

    useEffect(() => {
        if (typeof window !== 'undefined' && window.speechSynthesis) {
            window.speechSynthesis.getVoices();
        }
    }, []);

    const cancelTranslation = () => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
            abortControllerRef.current = null;
        }
        setIsTranslating(false);
    };

    const translate = useCallback(async () => {
        if (!sourceText.trim()) {
            toast.error('Please enter text to translate');
            return;
        }

        if (sourceLanguage === targetLanguage) {
            setTranslatedText(sourceText);
            return;
        }

        // ─── Plan tier: daily translation limit for signed-in users ─────
        if (user) {
            const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
            const cookieKey = `translate_usage_${today}`;
            const currentCount = parseInt(Cookies.get(cookieKey) || '0', 10);
            if (limits.translationsPerDay !== Infinity && currentCount >= limits.translationsPerDay) {
                try {
                    throw new Error(`PLAN_LIMIT:You've used all ${limits.translationsPerDay} translations for today — upgrade for more.`);
                } catch (err: any) {
                    handlePlanLimitError(err);
                    return;
                }
            }
        }

        // ─── Plan tier: max text length ──────────────────────────────────
        if (sourceText.length > limits.translationMaxChars) {
            try {
                throw new Error(`PLAN_LIMIT:Your plan supports up to ${limits.translationMaxChars.toLocaleString()} characters — upgrade for longer translations.`);
            } catch (err: any) {
                handlePlanLimitError(err);
                return;
            }
        }

        // Limit check for guest users
        if (!user) {
            const currentCount = parseInt(Cookies.get('translate_usage_guest') || '0', 10);
            if (currentCount >= 10) {
                toast.error('Limit reached', {
                    description: 'Guest users are limited to 10 translations. Sign in for unlimited access!',
                    action: {
                        label: 'Log In',
                        onClick: () => router.push('/login')
                    }
                });
                return;
            }
        }

        setIsTranslating(true);
        setTranslatedText('');
        setPronunciation('');
        setExplanation('');

        abortControllerRef.current = new AbortController();

        try {
            const response = await fetch('/api/translate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    text: sourceText,
                    sourceLanguage,
                    targetLanguage,
                }),
                signal: abortControllerRef.current.signal,
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.details || errorData.error || 'Translation failed');
            }

            const reader = response.body?.getReader();
            if (!reader) throw new Error('No response stream');

            const decoder = new TextDecoder();
            let accumulatedResponse = '';

            while (true) {
                const { done, value } = await reader.read();
                if (done) {
                    // Increment daily count for signed-in users
                    if (user) {
                        const today = new Date().toISOString().slice(0, 10);
                        const cookieKey = `translate_usage_${today}`;
                        const currentCount = parseInt(Cookies.get(cookieKey) || '0', 10);
                        Cookies.set(cookieKey, (currentCount + 1).toString(), { expires: 1 });
                        setTranslationsCount(currentCount + 1);
                    }
                    // Increment count for guest users on success
                    if (!user) {
                        const currentCount = parseInt(Cookies.get('translate_usage_guest') || '0', 10);
                        const newCount = currentCount + 1;
                        Cookies.set('translate_usage_guest', newCount.toString(), { expires: 7 });
                        setTranslationsCount(newCount);
                    }
                    break;
                }

                const chunk = decoder.decode(value, { stream: true });
                const lines = chunk.split('\n');

                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        try {
                            const data = JSON.parse(line.slice(6));
                            if (data.translation) {
                                accumulatedResponse += data.translation;

                                const translationMarker = '[TRANSLATION]';
                                const pronunciationMarker = '[PRONUNCIATION]';
                                const explanationMarker = '[EXPLANATION]';

                                const extractBetween = (str: string, startMarker: string, endMarker?: string) => {
                                    const startIndex = str.indexOf(startMarker);
                                    if (startIndex === -1) return '';
                                    const contentStart = startIndex + startMarker.length;
                                    const contentEnd = endMarker ? str.indexOf(endMarker, contentStart) : str.length;
                                    return str.substring(contentStart, contentEnd !== -1 ? contentEnd : str.length).trim();
                                };

                                const t = extractBetween(accumulatedResponse, translationMarker, pronunciationMarker);
                                const p = extractBetween(accumulatedResponse, pronunciationMarker, explanationMarker);
                                const e = extractBetween(accumulatedResponse, explanationMarker);

                                if (t) setTranslatedText(t);
                                if (p) setPronunciation(p);
                                if (e) setExplanation(e);

                                if (!t && !p && !e && accumulatedResponse && !accumulatedResponse.includes('[')) {
                                    setTranslatedText(accumulatedResponse.trim());
                                }
                            }
                        } catch {
                            // Skip invalid JSON chunks
                        }
                    }
                }
            }
        } catch (error: any) {
            if (error.name === 'AbortError') {
                toast.info('Translation cancelled');
            } else {
                console.error('Translation error:', error);
                toast.error(error.message || 'Translation failed');
            }
        } finally {
            setIsTranslating(false);
            abortControllerRef.current = null;
        }
    }, [sourceText, sourceLanguage, targetLanguage]);

    // Handle keyboard shortcut
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
                e.preventDefault();
                if (!isTranslating) {
                    translate();
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [translate, isTranslating]);

    const sourceLang = LANGUAGES.find(l => l.code === sourceLanguage);
    const targetLang = LANGUAGES.find(l => l.code === targetLanguage);

    return (
        <div className="min-h-screen bg-[#fffaf4] dark:bg-gray-950 font-sans relative">

            {/* ── Ambient glows ─────────────────────── */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-sky-200/20 dark:bg-sky-500/[0.06] rounded-full blur-[140px]" />
                <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-[#ebf6b5]/30 dark:bg-emerald-500/[0.04] rounded-full blur-[120px]" />
                <div className="absolute top-1/3 right-0 w-[300px] h-[300px] bg-[#ebf6b5]/20 dark:bg-emerald-500/[0.04] rounded-full blur-[100px]" />
            </div>

            {/* ── Main Content ─────────────────── */}
            <div className="relative z-10 w-full mx-auto px-4 sm:px-6 md:px-12 lg:px-16 pt-28 pb-16">

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-10">
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <h1 className="text-4xl lg:text-[52px] font-bold text-sky-500 dark:text-sky-400 leading-[1.08] tracking-tight mb-3">
                            Translate anything.
                        </h1>
                        <p className="text-sm sm:text-base text-sky-600 dark:text-sky-300 font-medium">
                            AI-powered translation across 55+ languages
                        </p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex flex-col items-end gap-2"
                    >
                        {!user && (
                            <div className="flex flex-col gap-1.5">
                                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#ebf6b5]/60 dark:bg-sky-500/20 rounded-full">
                                    <span className="text-[11px] font-bold text-sky-600 dark:text-sky-400">
                                        {translationsCount}/10 free translations
                                    </span>
                                    {translationsCount >= 10 && <Lock className="w-2.5 h-2.5 text-sky-600 dark:text-sky-400" />}
                                </div>
                                {/* Progress bar */}
                                <div className="h-1 w-full bg-sky-100 dark:bg-sky-900/40 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full rounded-full transition-all duration-500 ${translationsCount >= 10 ? 'bg-red-400' : 'bg-sky-500 dark:bg-sky-400'}`}
                                        style={{ width: `${Math.min((translationsCount / 10) * 100, 100)}%` }}
                                    />
                                </div>
                            </div>
                        )}

                    </motion.div>
                </div>

                {/* Language Bar */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 }}
                    className="flex items-center gap-2 mb-6"
                >
                    <LanguageSelector
                        value={sourceLanguage}
                        onChange={setSourceLanguage}
                        label="From"
                    />

                    <button
                        onClick={swapLanguages}
                        className="p-2 rounded-xl hover:bg-[#275085]/[0.04] dark:hover:bg-[#4a9cdb]/[0.06] transition-colors group active:scale-95"
                        title="Swap languages"
                    >
                        <ArrowRightLeft className="h-3.5 w-3.5 text-sky-600/50 dark:text-sky-400/50 group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors" />
                    </button>

                    <LanguageSelector
                        value={targetLanguage}
                        onChange={setTargetLanguage}
                        label="To"
                    />
                </motion.div>

                {/* Main Translation Panels */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="grid md:grid-cols-2 gap-4 mb-4"
                >
                    {/* Source Panel */}
                    <div className="relative bg-[#f5f9fc] dark:bg-zinc-800 rounded-[24px] overflow-hidden">
                        <div className="px-6 pt-5 pb-2 flex items-center justify-between">
                            <span className="text-[13px] font-bold text-sky-500 dark:text-sky-400 uppercase tracking-[0.1em]">
                                {sourceLang?.flag} {sourceLang?.name}
                            </span>
                            <span className={`text-[10px] font-medium tabular-nums tracking-tight ${charCount > MAX_CHARS * 0.9 ? 'text-amber-500' : 'text-sky-700/60 dark:text-sky-400/60'}`}>
                                {charCount > 0 ? `${charCount.toLocaleString()} / ${MAX_CHARS.toLocaleString()}` : ''}
                            </span>
                        </div>
                        <textarea
                            ref={textareaRef}
                            value={sourceText}
                            onChange={handleSourceTextChange}
                            placeholder="Enter text to translate..."
                            className="w-full h-56 sm:h-64 resize-none bg-transparent text-sky-900 dark:text-sky-100 placeholder:text-sky-700/40 dark:placeholder:text-sky-400/40 text-[15px] leading-relaxed outline-none scrollbar-hide px-6 pb-14"
                        />
                        <div className="absolute bottom-4 left-5 right-5 flex items-center justify-between">
                            <div className="flex items-center gap-1">
                                <button
                                    onClick={() => speakText(sourceText, sourceLanguage)}
                                    disabled={!sourceText}
                                    className="p-1.5 rounded-xl hover:bg-[#275085]/[0.04] dark:hover:bg-[#4a9cdb]/[0.06] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                    title="Listen"
                                >
                                    <Volume2 className="h-3.5 w-3.5 text-sky-600/60 dark:text-sky-400/60" />
                                </button>
                                {sourceText && (
                                    <button
                                        onClick={() => {
                                            setSourceText('');
                                            setCharCount(0);
                                            setTranslatedText('');
                                            setPronunciation('');
                                            setExplanation('');
                                        }}
                                        className="p-1.5 rounded-xl hover:bg-[#275085]/[0.04] dark:hover:bg-[#4a9cdb]/[0.06] transition-colors"
                                        title="Clear"
                                    >
                                        <X className="h-3.5 w-3.5 text-sky-600/60 dark:text-sky-400/60" />
                                    </button>
                                )}
                            </div>
                            {isTranslating ? (
                                <button
                                    onClick={cancelTranslation}
                                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-sky-700/70 dark:text-sky-400/70 hover:text-red-600 dark:hover:text-red-400 transition-colors rounded-xl hover:bg-red-50 dark:hover:bg-red-500/5 active:scale-95"
                                >
                                    <X className="h-3 w-3" />
                                    Stop
                                </button>
                            ) : (
                                <button
                                    onClick={translate}
                                    disabled={!sourceText.trim()}
                                    className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold text-white bg-[#275085] dark:bg-[#4a9cdb] rounded-xl hover:bg-[#1f3f6b] dark:hover:bg-[#3d8bc4] disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-95 shadow-lg shadow-[#275085]/15 dark:shadow-[#4a9cdb]/15"
                                >
                                    Translate
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Output Panel */}
                    <div className="relative bg-[#f5f9fc] dark:bg-zinc-800 rounded-[24px] overflow-hidden">
                        <div className="px-6 pt-5 pb-2 flex items-center justify-between">
                            <span className="text-[13px] font-bold text-sky-500 dark:text-sky-400 uppercase tracking-[0.1em]">
                                {targetLang?.flag} {targetLang?.name}
                            </span>
                            {isTranslating && (
                                <div className="flex items-center gap-1.5">
                                    <Loader2 className="h-3 w-3 text-emerald-500/60 animate-spin" />
                                    <span className="text-[10px] font-medium text-sky-700/70 dark:text-sky-400/70">Translating...</span>
                                </div>
                            )}
                        </div>

                        {isTranslating && !translatedText ? (
                            <div className="flex items-center justify-center h-56 sm:h-64">
                                <div className="flex flex-col items-center gap-3">
                                    <Loader2 className="h-6 w-6 text-emerald-500/50 animate-spin" />
                                    <span className="text-xs text-sky-700/70 dark:text-sky-400/70">Processing...</span>
                                </div>
                            </div>
                        ) : (
                            <>
                                <div className="h-56 sm:h-64 overflow-y-auto scrollbar-hide px-6 pb-14">
                                    <div className={`text-[15px] leading-relaxed ${translatedText ? 'text-sky-900 dark:text-sky-100' : 'text-sky-700/50 dark:text-sky-400/50'}`}>
                                        {translatedText || 'Translation will appear here...'}
                                    </div>
                                    {pronunciation && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 5 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="mt-4 inline-flex items-center gap-2 px-2.5 py-1 bg-[#275085]/[0.04] dark:bg-[#4a9cdb]/[0.04] rounded-xl"
                                        >
                                            <Volume2 className="h-3 w-3 text-sky-600/60 dark:text-sky-400/60" />
                                            <span className="text-xs text-sky-700/70 dark:text-sky-400/70 italic">
                                                {pronunciation}
                                            </span>
                                        </motion.div>
                                    )}
                                </div>
                                <div className="absolute bottom-4 left-5 right-5 flex items-center gap-1">
                                    <button
                                        onClick={() => speakText(translatedText, targetLanguage)}
                                        disabled={!translatedText}
                                        className="p-1.5 rounded-xl hover:bg-[#275085]/[0.04] dark:hover:bg-[#4a9cdb]/[0.06] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                        title="Listen"
                                    >
                                        <Volume2 className="h-3.5 w-3.5 text-sky-600/60 dark:text-sky-400/60" />
                                    </button>
                                    <button
                                        onClick={copyToClipboard}
                                        disabled={!translatedText}
                                        className="p-1.5 rounded-xl hover:bg-[#275085]/[0.04] dark:hover:bg-[#4a9cdb]/[0.06] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                        title="Copy"
                                    >
                                        {copied ? (
                                            <Check className="h-3.5 w-3.5 text-emerald-500" />
                                        ) : (
                                            <Copy className="h-3.5 w-3.5 text-sky-600/60 dark:text-sky-400/60" />
                                        )}
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </motion.div>

                {/* Explanation / Context */}
                <AnimatePresence>
                    {explanation && limits.translationContextExplanation && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="overflow-hidden mb-4"
                        >
                            <div className="bg-[#eff6fe]/80 dark:bg-zinc-900/80 backdrop-blur-xl border border-[#275085]/8 dark:border-[#4a9cdb]/10 rounded-3xl p-6 shadow-[0_20px_60px_rgba(39,80,133,0.08)] dark:shadow-[0_20px_60px_rgba(0,0,0,0.3)]">
                                <div className="text-[13px] font-black uppercase tracking-[0.1em] text-emerald-500 dark:text-emerald-400 mb-3">
                                    Translation Context
                                </div>
                                <div className="text-sm text-sky-900/80 dark:text-sky-200/80 leading-relaxed">
                                    {explanation}
                                </div>
                            </div>
                        </motion.div>
                    )}
                    {explanation && !limits.translationContextExplanation && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="overflow-hidden mb-4"
                        >
                            <button
                                onClick={() => {
                                    try {
                                        throw new Error('PLAN_LIMIT:Context explanations are a Pro feature — upgrade to see grammar, nuance, and cultural notes with every translation.');
                                    } catch (err: any) {
                                        handlePlanLimitError(err);
                                    }
                                }}
                                className="w-full bg-[#eff6fe]/50 dark:bg-zinc-900/50 backdrop-blur-xl border border-dashed border-[#275085]/15 dark:border-[#4a9cdb]/15 rounded-3xl p-5 text-left hover:bg-[#eff6fe]/80 dark:hover:bg-zinc-900/80 transition-colors group"
                            >
                                <div className="text-[13px] font-black uppercase tracking-[0.1em] text-sky-500/40 dark:text-sky-400/30 mb-1.5">
                                    Translation Context
                                </div>
                                <div className="text-sm text-sky-600/50 dark:text-sky-400/40 group-hover:text-sky-600/70 transition-colors">
                                    Upgrade to Pro to see grammar, nuance, and cultural context →
                                </div>
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Footer */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="mt-20 pt-8 border-t border-[#275085]/8 dark:border-[#4a9cdb]/8"
                >
                    <div className="flex items-center justify-between">
                        <p className="text-xs sm:text-sm text-sky-700/60 dark:text-sky-400/60 font-medium">
                            Built for students • Public Beta {getFullVersionString()}
                        </p>
                    </div>
                </motion.div>
            </div>

            {/* Route Intro Popup */}
            <RouteIntroPopup
                isOpen={showIntro}
                onClose={dismissIntro}
                title="Welcome to Translate!"
                description="High-fidelity AI translation across 55+ languages"
                icon={<Languages className="h-6 w-6" />}
                features={[
                    'Translate text between 55+ languages',
                    'Powered by GPT OSS AI model',
                    'Real-time streaming translation',
                    'Listen to translations with text-to-speech',
                ]}
            />
        </div>
    );
}
