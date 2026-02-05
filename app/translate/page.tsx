'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Languages, ArrowRightLeft, Copy, Check, Volume2, Loader2, ChevronDown, Sparkles, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useWideLayout } from '@/hooks/use-wide-layout';
import { useRouteIntro } from '@/hooks/use-route-intro';
import { RouteIntroPopup } from '@/components/RouteIntroPopup';
import { getFullVersionString } from '@/config/version';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

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
            <div className="text-[10px] text-gray-500 dark:text-gray-400 mb-2 font-bold uppercase tracking-wider">
                {label}
            </div>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between gap-3 px-4 py-3 bg-[#F7F7F9] dark:bg-zinc-900/50 border border-gray-200/80 dark:border-white/5 rounded-2xl hover:border-gray-300 dark:hover:border-white/10 transition-all duration-200 group"
            >
                <div className="flex items-center gap-3">
                    <span className="text-xl">{selectedLang?.flag}</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{selectedLang?.name}</span>
                </div>
                <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.98 }}
                        transition={{ duration: 0.15 }}
                        className="absolute top-full left-0 right-0 mt-2 z-50 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl border border-gray-200/80 dark:border-white/10 rounded-2xl shadow-xl overflow-hidden"
                    >
                        <div className="p-2 border-b border-gray-100 dark:border-white/5">
                            <input
                                type="text"
                                placeholder="Search languages..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full px-3 py-2 bg-gray-100/80 dark:bg-white/5 rounded-xl text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 outline-none focus:ring-1 focus:ring-[#165df9]/30"
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
                                    className={`w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-100/80 dark:hover:bg-white/5 transition-colors ${value === lang.code ? 'bg-[#165df9]/5 dark:bg-[#165df9]/10' : ''
                                        }`}
                                >
                                    <span className="text-xl">{lang.flag}</span>
                                    <span className={`text-sm ${value === lang.code ? 'text-[#165df9] dark:text-[#165df9] font-semibold' : 'text-gray-700 dark:text-gray-300'}`}>
                                        {lang.name}
                                    </span>
                                    {value === lang.code && (
                                        <Check className="h-4 w-4 text-[#165df9] ml-auto" />
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

    const [sourceLanguage, setSourceLanguage] = useState('en');
    const [targetLanguage, setTargetLanguage] = useState('es');
    const [sourceText, setSourceText] = useState('');
    const [translatedText, setTranslatedText] = useState('');
    const [pronunciation, setPronunciation] = useState('');
    const [explanation, setExplanation] = useState('');
    const [isTranslating, setIsTranslating] = useState(false);
    const [copied, setCopied] = useState(false);
    const [charCount, setCharCount] = useState(0);

    const abortControllerRef = useRef<AbortController | null>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const MAX_CHARS = 5000;

    // Redirect to login if not authenticated
    useEffect(() => {
        if (!user) {
            router.push('/login');
        }
    }, [user, router]);

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

        // Cancel any ongoing speech
        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);

        // Try to find a high-quality voice for the selected language
        const voices = window.speechSynthesis.getVoices();

        // Match by exact language code first (e.g., 'es-ES'), then by prefix (e.g., 'es')
        const voice = voices.find(v => v.lang === langCode) ||
            voices.find(v => v.lang.startsWith(langCode)) ||
            voices.find(v => v.lang.includes(langCode));

        if (voice) {
            utterance.voice = voice;
        }

        utterance.lang = langCode;
        utterance.rate = 1.0;
        utterance.pitch = 1.0;

        // Some browsers require a small delay after cancel
        setTimeout(() => {
            window.speechSynthesis.speak(utterance);
        }, 50);
    };

    // Pre-load voices to ensure they are available when requested
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
            let currentSection: 'translation' | 'pronunciation' | 'explanation' | null = null;

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value, { stream: true });
                const lines = chunk.split('\n');

                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        try {
                            const data = JSON.parse(line.slice(6));
                            if (data.translation) {
                                accumulatedResponse += data.translation;

                                // Simple parser for markers
                                const translationMarker = '[TRANSLATION]';
                                const pronunciationMarker = '[PRONUNCIATION]';
                                const explanationMarker = '[EXPLANATION]';

                                // Check for section changes
                                if (accumulatedResponse.includes(translationMarker)) {
                                    currentSection = 'translation';
                                }
                                if (accumulatedResponse.includes(pronunciationMarker)) {
                                    currentSection = 'pronunciation';
                                }
                                if (accumulatedResponse.includes(explanationMarker)) {
                                    currentSection = 'explanation';
                                }

                                // Extract content for each section
                                let tempText = accumulatedResponse;

                                // Helper to get content between markers
                                const extractBetween = (str: string, startMarker: string, endMarker?: string) => {
                                    const startIndex = str.indexOf(startMarker);
                                    if (startIndex === -1) return '';

                                    const contentStart = startIndex + startMarker.length;
                                    const contentEnd = endMarker ? str.indexOf(endMarker, contentStart) : str.length;

                                    return str.substring(contentStart, contentEnd !== -1 ? contentEnd : str.length).trim();
                                };

                                const t = extractBetween(tempText, translationMarker, pronunciationMarker);
                                const p = extractBetween(tempText, pronunciationMarker, explanationMarker);
                                const e = extractBetween(tempText, explanationMarker);

                                if (t) setTranslatedText(t);
                                if (p) setPronunciation(p);
                                if (e) setExplanation(e);

                                // Fallback for when markers haven't appeared yet or for normal translation
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

    if (!user) {
        return null;
    }

    return (
        <div className="min-h-screen bg-white dark:bg-gray-950">
            <div className={getContainerClass() + ' py-16'}>
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-12"
                >
                    <div className="flex items-start justify-between">
                        <div>
                            <div className="flex items-center gap-4 mb-3">
                                <div className="p-3 bg-gray-100 dark:bg-zinc-900 border border-gray-200/50 dark:border-white/5 rounded-2xl">
                                    <Languages className="h-6 w-6 text-[#165df9]" />
                                </div>
                                <h1 className="text-4xl font-light text-gray-900 dark:text-white tracking-tight">
                                    Translate
                                </h1>
                            </div>
                            <p className="text-gray-500 dark:text-gray-400 max-w-lg">
                                High-fidelity translation across 55+ languages powered by AI
                            </p>
                        </div>
                        <div className="hidden sm:flex items-center gap-3 text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                            <div className="flex items-center gap-1.5 px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded-md">
                                <kbd>⌘</kbd>
                                <span>+</span>
                                <kbd>Enter</kbd>
                            </div>
                            <span>to translate</span>
                        </div>
                    </div>
                </motion.div>

                {/* Main Translation Interface */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 }}
                    className="bg-white/95 dark:bg-zinc-900/80 backdrop-blur-md border border-gray-200/80 dark:border-white/5 rounded-[32px] shadow-sm overflow-hidden"
                >
                    {/* Language Selectors */}
                    <div className="flex items-center gap-4 p-6 border-b border-gray-100 dark:border-white/5 bg-[#F7F7F9]/30 dark:bg-black/5">
                        <div className="flex-1">
                            <LanguageSelector
                                value={sourceLanguage}
                                onChange={setSourceLanguage}
                                label="From"
                            />
                        </div>

                        <button
                            onClick={swapLanguages}
                            className="mt-6 p-3 rounded-xl bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 transition-colors group"
                            title="Swap languages"
                        >
                            <ArrowRightLeft className="h-4 w-4 text-gray-400 dark:text-gray-500 group-hover:text-[#165df9] transition-colors" />
                        </button>

                        <div className="flex-1">
                            <LanguageSelector
                                value={targetLanguage}
                                onChange={setTargetLanguage}
                                label="To"
                            />
                        </div>
                    </div>

                    {/* Text Areas */}
                    <div className="grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-gray-100 dark:divide-white/5">
                        {/* Source Text */}
                        <div className="relative p-8">
                            <textarea
                                ref={textareaRef}
                                value={sourceText}
                                onChange={handleSourceTextChange}
                                placeholder="Enter text to translate..."
                                className="w-full h-80 resize-none bg-transparent text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 text-lg leading-relaxed outline-none scrollbar-hide"
                            />
                            <div className="absolute bottom-6 left-8 right-8 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => speakText(sourceText, sourceLanguage)}
                                        disabled={!sourceText}
                                        className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                        title="Listen"
                                    >
                                        <Volume2 className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                                    </button>
                                    {sourceText && (
                                        <button
                                            onClick={() => {
                                                setSourceText('');
                                                setCharCount(0);
                                                setTranslatedText('');
                                            }}
                                            className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
                                            title="Clear"
                                        >
                                            <X className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                                        </button>
                                    )}
                                </div>
                                <span className={`text-[10px] font-bold uppercase tracking-widest ${charCount > MAX_CHARS * 0.9 ? 'text-amber-500' : 'text-gray-400 dark:text-gray-500'}`}>
                                    {charCount.toLocaleString()} / {MAX_CHARS.toLocaleString()}
                                </span>
                            </div>
                        </div>

                        {/* Translated Text */}
                        <div className="relative p-8 bg-gray-50/30 dark:bg-white/[0.01]">
                            {isTranslating && !translatedText ? (
                                <div className="flex items-center justify-center h-80">
                                    <div className="flex flex-col items-center gap-4">
                                        <Loader2 className="h-8 w-8 text-[#165df9] animate-spin" />
                                        <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500">Processing...</span>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <div className="h-80 overflow-y-auto scrollbar-hide">
                                        <div className={`text-lg leading-relaxed mb-4 ${translatedText ? 'text-gray-900 dark:text-white' : 'text-gray-400 dark:text-gray-500'
                                            }`}>
                                            {translatedText || 'Translation will appear here...'}
                                        </div>
                                        {pronunciation && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 5 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-white/5 rounded-xl border border-gray-200/50 dark:border-white/5"
                                            >
                                                <Volume2 className="h-3 w-3 text-gray-400" />
                                                <span className="text-xs font-medium text-gray-500 dark:text-gray-400 italic">
                                                    {pronunciation}
                                                </span>
                                            </motion.div>
                                        )}
                                    </div>
                                    <div className="absolute bottom-6 left-8 right-8 flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => speakText(translatedText, targetLanguage)}
                                                disabled={!translatedText}
                                                className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                                title="Listen"
                                            >
                                                <Volume2 className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                                            </button>
                                            <button
                                                onClick={copyToClipboard}
                                                disabled={!translatedText}
                                                className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                                title="Copy"
                                            >
                                                {copied ? (
                                                    <Check className="h-4 w-4 text-green-500" />
                                                ) : (
                                                    <Copy className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Extra Context (Explanation) */}
                    {explanation && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="border-t border-gray-100 dark:border-white/5 bg-[#F7F7F9]/30 dark:bg-black/10 overflow-hidden"
                        >
                            <div className="p-6">
                                <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-2">Translation Context</div>
                                <div className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed max-w-3xl">
                                    {explanation}
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* Action Bar */}
                    <div className="p-6 border-t border-gray-100 dark:border-white/5 bg-[#F7F7F9]/30 dark:bg-black/5">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                {isTranslating && translatedText && (
                                    <div className="flex items-center gap-2 bg-white/80 dark:bg-zinc-800/80 px-3 py-1.5 rounded-full border border-gray-200/50 dark:border-white/5 shadow-sm">
                                        <Loader2 className="h-3 w-3 text-[#165df9] animate-spin" />
                                        <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400">Streaming Response</span>
                                    </div>
                                )}
                            </div>
                            <div className="flex items-center gap-3">
                                {isTranslating ? (
                                    <Button
                                        onClick={cancelTranslation}
                                        variant="ghost"
                                        size="sm"
                                        className="gap-2 text-gray-500 hover:text-red-600 transition-colors"
                                    >
                                        <X className="h-4 w-4" />
                                        Stop Generation
                                    </Button>
                                ) : (
                                    <Button
                                        onClick={translate}
                                        disabled={!sourceText.trim()}
                                        className="h-10 px-8 rounded-2xl bg-[#165df9] hover:bg-[#165df9]/90 text-white shadow-lg shadow-[#165df9]/20 font-medium transition-all hover:scale-[1.02] active:scale-[0.98]"
                                    >
                                        Translate
                                    </Button>
                                )}
                            </div>
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
                            Built for students • Public Beta {getFullVersionString()}
                        </p>
                        <div className="flex items-center gap-6 text-xs text-gray-400 dark:text-gray-500 font-medium tracking-tight">
                            <span>Enterprise-Grade Privacy</span>
                            <span>Local Model Accuracy</span>
                        </div>
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
