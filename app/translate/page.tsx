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
import { Languages } from 'lucide-react';

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
                className="flex items-center gap-2.5 px-3 py-2 hover:bg-gray-100/80 dark:hover:bg-white/[0.04] rounded-xl transition-all duration-150 group"
            >
                <span className="text-lg leading-none">{selectedLang?.flag}</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">{selectedLang?.name}</span>
                <ChevronDown className={`h-3.5 w-3.5 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -8, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -8, scale: 0.98 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                        className="absolute top-full left-0 mt-1.5 z-50 w-64 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl border border-gray-200/80 dark:border-white/10 rounded-xl shadow-xl overflow-hidden"
                    >
                        <div className="p-2 border-b border-gray-100 dark:border-white/5">
                            <input
                                type="text"
                                placeholder="Search languages..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full px-3 py-2 bg-gray-100/80 dark:bg-white/5 rounded-lg text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 outline-none focus:ring-1 focus:ring-[#264f84]/30"
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
                                    className={`w-full flex items-center gap-3 px-3 py-2 hover:bg-gray-100/80 dark:hover:bg-white/5 transition-colors ${value === lang.code ? 'bg-[#264f84]/5 dark:bg-[#264f84]/10' : ''
                                        }`}
                                >
                                    <span className="text-lg">{lang.flag}</span>
                                    <span className={`text-sm ${value === lang.code ? 'text-[#264f84] dark:text-blue-400 font-semibold' : 'text-gray-700 dark:text-gray-300'}`}>
                                        {lang.name}
                                    </span>
                                    {value === lang.code && (
                                        <Check className="h-3.5 w-3.5 text-[#264f84] dark:text-blue-400 ml-auto" />
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
                if (done) break;

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
        <div className="min-h-screen bg-white dark:bg-gray-950">
            <div className="px-4 pt-4 pb-16 sm:px-6 sm:pt-6 sm:pb-20 lg:px-8 lg:pt-8 lg:pb-24">

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 sm:mb-10">
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-light text-gray-900 dark:text-white mb-2 tracking-tight">
                            Translate
                        </h1>
                        <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400">
                            AI-powered translation across 55+ languages
                        </p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="hidden sm:flex items-center gap-3 text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500"
                    >
                        <div className="flex items-center gap-1.5 px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded-md">
                            <kbd>⌘</kbd>
                            <span>+</span>
                            <kbd>Enter</kbd>
                        </div>
                        <span>to translate</span>
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
                        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/[0.04] transition-colors group active:scale-95"
                        title="Swap languages"
                    >
                        <ArrowRightLeft className="h-3.5 w-3.5 text-gray-400 dark:text-gray-500 group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors" />
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
                    <div className="relative border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden group/panel focus-within:border-gray-300 dark:focus-within:border-gray-700 transition-colors">
                        <div className="px-5 pt-4 pb-2 flex items-center justify-between">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500">
                                {sourceLang?.flag} {sourceLang?.name}
                            </span>
                            <span className={`text-[10px] font-medium tabular-nums tracking-tight ${charCount > MAX_CHARS * 0.9 ? 'text-amber-500' : 'text-gray-400 dark:text-gray-500'}`}>
                                {charCount > 0 ? `${charCount.toLocaleString()} / ${MAX_CHARS.toLocaleString()}` : ''}
                            </span>
                        </div>
                        <textarea
                            ref={textareaRef}
                            value={sourceText}
                            onChange={handleSourceTextChange}
                            placeholder="Enter text to translate..."
                            className="w-full h-56 sm:h-64 resize-none bg-transparent text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 text-[15px] leading-relaxed outline-none scrollbar-hide px-5 pb-14"
                        />
                        <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between">
                            <div className="flex items-center gap-1">
                                <button
                                    onClick={() => speakText(sourceText, sourceLanguage)}
                                    disabled={!sourceText}
                                    className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                    title="Listen"
                                >
                                    <Volume2 className="h-3.5 w-3.5 text-gray-400 dark:text-gray-500" />
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
                                        className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
                                        title="Clear"
                                    >
                                        <X className="h-3.5 w-3.5 text-gray-400 dark:text-gray-500" />
                                    </button>
                                )}
                            </div>
                            {isTranslating ? (
                                <button
                                    onClick={cancelTranslation}
                                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-500 hover:text-red-600 dark:hover:text-red-400 transition-colors rounded-lg hover:bg-red-50 dark:hover:bg-red-500/5 active:scale-95"
                                >
                                    <X className="h-3 w-3" />
                                    Stop
                                </button>
                            ) : (
                                <button
                                    onClick={translate}
                                    disabled={!sourceText.trim()}
                                    className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-gray-900 dark:bg-white dark:text-gray-900 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-95"
                                >
                                    Translate
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Output Panel */}
                    <div className="relative border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden bg-gray-50/50 dark:bg-white/[0.02]">
                        <div className="px-5 pt-4 pb-2 flex items-center justify-between">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500">
                                {targetLang?.flag} {targetLang?.name}
                            </span>
                            {isTranslating && (
                                <div className="flex items-center gap-1.5">
                                    <Loader2 className="h-3 w-3 text-gray-400 animate-spin" />
                                    <span className="text-[10px] font-medium text-gray-400 dark:text-gray-500">Translating...</span>
                                </div>
                            )}
                        </div>

                        {isTranslating && !translatedText ? (
                            <div className="flex items-center justify-center h-56 sm:h-64">
                                <div className="flex flex-col items-center gap-3">
                                    <Loader2 className="h-6 w-6 text-gray-400 animate-spin" />
                                    <span className="text-xs text-gray-400 dark:text-gray-500">Processing...</span>
                                </div>
                            </div>
                        ) : (
                            <>
                                <div className="h-56 sm:h-64 overflow-y-auto scrollbar-hide px-5 pb-14">
                                    <div className={`text-[15px] leading-relaxed ${translatedText ? 'text-gray-900 dark:text-white' : 'text-gray-400 dark:text-gray-500'}`}>
                                        {translatedText || 'Translation will appear here...'}
                                    </div>
                                    {pronunciation && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 5 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="mt-4 inline-flex items-center gap-2 px-2.5 py-1 bg-gray-100 dark:bg-white/5 rounded-lg"
                                        >
                                            <Volume2 className="h-3 w-3 text-gray-400" />
                                            <span className="text-xs text-gray-500 dark:text-gray-400 italic">
                                                {pronunciation}
                                            </span>
                                        </motion.div>
                                    )}
                                </div>
                                <div className="absolute bottom-3 left-4 right-4 flex items-center gap-1">
                                    <button
                                        onClick={() => speakText(translatedText, targetLanguage)}
                                        disabled={!translatedText}
                                        className="p-1.5 rounded-lg hover:bg-gray-200/80 dark:hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                        title="Listen"
                                    >
                                        <Volume2 className="h-3.5 w-3.5 text-gray-400 dark:text-gray-500" />
                                    </button>
                                    <button
                                        onClick={copyToClipboard}
                                        disabled={!translatedText}
                                        className="p-1.5 rounded-lg hover:bg-gray-200/80 dark:hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                        title="Copy"
                                    >
                                        {copied ? (
                                            <Check className="h-3.5 w-3.5 text-green-500" />
                                        ) : (
                                            <Copy className="h-3.5 w-3.5 text-gray-400 dark:text-gray-500" />
                                        )}
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </motion.div>

                {/* Explanation / Context */}
                <AnimatePresence>
                    {explanation && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="overflow-hidden mb-4"
                        >
                            <div className="border border-gray-200 dark:border-gray-800 rounded-xl p-5">
                                <div className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-2">
                                    Translation Context
                                </div>
                                <div className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                                    {explanation}
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Footer */}
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
