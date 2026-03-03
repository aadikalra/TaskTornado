'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Link2, Loader2, CheckCircle2, ArrowRight, Users } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useRequireAuth } from '@/hooks/use-require-auth';

export default function GuardianLinkPage() {
    const { authenticated } = useRequireAuth();
    const { user, linkedStudents } = useAuth();
    const router = useRouter();
    const [code, setCode] = useState<string[]>(Array(6).fill(''));
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState<{ name: string } | null>(null);
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    if (!authenticated) return null;

    const handleInputChange = (index: number, value: string) => {
        const char = value.toUpperCase().slice(-1);
        const newCode = [...code];
        newCode[index] = char;
        setCode(newCode);
        setError('');

        // Auto-advance to next input
        if (char && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
        if (e.key === 'Backspace' && !code[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
        if (e.key === 'Enter') {
            handleSubmit();
        }
    };

    const handlePaste = (e: React.ClipboardEvent) => {
        e.preventDefault();
        const pasted = e.clipboardData.getData('text').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6);
        if (pasted.length > 0) {
            const newCode = Array(6).fill('');
            for (let i = 0; i < Math.min(pasted.length, 6); i++) {
                newCode[i] = pasted[i];
            }
            setCode(newCode);
            // Focus last filled or the next empty
            const focusIndex = Math.min(pasted.length, 5);
            inputRefs.current[focusIndex]?.focus();
        }
    };

    const handleSubmit = async () => {
        const fullCode = code.join('');
        if (fullCode.length !== 6) {
            setError('Please enter the full 6-character code');
            return;
        }

        setIsSubmitting(true);
        setError('');

        try {
            const res = await fetch('/api/guardian/redeem-code', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code: fullCode }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || 'Failed to link account');
                return;
            }

            setSuccess({ name: data.student?.name || 'Student' });

            // Redirect to dashboard after brief success display
            setTimeout(() => {
                router.push('/guardian/dashboard');
            }, 2000);
        } catch (err) {
            setError('Something went wrong. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const isFull = code.every(c => c !== '');

    return (
        <div className="min-h-screen bg-[#fffaf4] dark:bg-gray-950 font-sans relative">
            {/* Background orbs */}
            <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
                <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-sky-200/20 dark:bg-sky-500/[0.06] rounded-full blur-[140px]" />
                <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-violet-300/15 dark:bg-violet-500/[0.04] rounded-full blur-[120px]" />
            </div>

            <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 sm:px-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="w-full max-w-md"
                >
                    {/* Success state */}
                    <AnimatePresence mode="wait">
                        {success ? (
                            <motion.div
                                key="success"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="text-center"
                            >
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.1 }}
                                    className="w-20 h-20 mx-auto mb-6 rounded-full bg-emerald-500/10 flex items-center justify-center"
                                >
                                    <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                                </motion.div>
                                <h1 className="text-3xl font-bold text-sky-500 dark:text-sky-400 tracking-tight mb-3">
                                    Linked!
                                </h1>
                                <p className="text-sky-800/50 dark:text-sky-300/50 font-medium">
                                    You&apos;re now connected to <span className="font-bold text-sky-800/80 dark:text-sky-300/80">{success.name}</span>&apos;s account.
                                </p>
                                <p className="text-sm text-sky-600/30 dark:text-sky-400/30 mt-2">
                                    Redirecting to dashboard...
                                </p>
                            </motion.div>
                        ) : (
                            <motion.div key="form">
                                {/* Header */}
                                <div className="text-center mb-10">
                                    <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-sky-500/[0.08] dark:bg-sky-500/[0.1] flex items-center justify-center">
                                        <Link2 className="w-8 h-8 text-sky-500" />
                                    </div>
                                    <h1 className="text-3xl sm:text-4xl font-bold text-sky-500 dark:text-sky-400 tracking-tight mb-3">
                                        Link to Your Child
                                    </h1>
                                    <p className="text-sky-800/40 dark:text-sky-300/40 font-medium text-sm max-w-xs mx-auto">
                                        Enter the 6-digit invite code your child generated from their Settings page.
                                    </p>
                                </div>

                                {/* Code Input */}
                                <div className="bg-white/70 dark:bg-zinc-900/50 backdrop-blur-xl border border-sky-100/60 dark:border-gray-800 rounded-3xl p-6 sm:p-8 shadow-[0_20px_60px_rgba(56,189,248,0.06)]">
                                    <div className="flex justify-center gap-2 sm:gap-3 mb-6" onPaste={handlePaste}>
                                        {code.map((digit, i) => (
                                            <input
                                                key={i}
                                                ref={el => { inputRefs.current[i] = el; }}
                                                type="text"
                                                maxLength={1}
                                                value={digit}
                                                onChange={(e) => handleInputChange(i, e.target.value)}
                                                onKeyDown={(e) => handleKeyDown(i, e)}
                                                className={`w-12 h-14 sm:w-14 sm:h-16 text-center text-xl sm:text-2xl font-bold rounded-2xl border-2 transition-all duration-200 outline-none
                                                    ${digit
                                                        ? 'bg-sky-500/[0.06] dark:bg-sky-500/[0.08] border-sky-300/50 dark:border-sky-500/30 text-sky-700 dark:text-sky-300'
                                                        : 'bg-sky-500/[0.02] dark:bg-sky-500/[0.03] border-sky-200/40 dark:border-gray-700 text-sky-900 dark:text-sky-100'
                                                    }
                                                    focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10 dark:focus:ring-sky-500/15
                                                    placeholder:text-sky-300/30`}
                                                placeholder="·"
                                            />
                                        ))}
                                    </div>

                                    {/* Error */}
                                    <AnimatePresence>
                                        {error && (
                                            <motion.p
                                                initial={{ opacity: 0, y: -4 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -4 }}
                                                className="text-xs text-red-500 dark:text-red-400 font-medium text-center mb-4"
                                            >
                                                {error}
                                            </motion.p>
                                        )}
                                    </AnimatePresence>

                                    {/* Submit */}
                                    <button
                                        onClick={handleSubmit}
                                        disabled={!isFull || isSubmitting}
                                        className={`w-full flex items-center justify-center gap-2 py-4 rounded-2xl text-sm font-bold transition-all active:scale-[0.98] ${isFull && !isSubmitting
                                                ? 'bg-sky-500 hover:bg-sky-600 text-white shadow-lg shadow-sky-500/20'
                                                : 'bg-sky-500/20 text-sky-500/40 cursor-not-allowed'
                                            }`}
                                    >
                                        {isSubmitting ? (
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                        ) : (
                                            <>
                                                Link Account
                                                <ArrowRight className="w-4 h-4" />
                                            </>
                                        )}
                                    </button>
                                </div>

                                {/* Already linked? */}
                                {linkedStudents.length > 0 && (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: 0.3 }}
                                        className="mt-6 text-center"
                                    >
                                        <button
                                            onClick={() => router.push('/guardian/dashboard')}
                                            className="inline-flex items-center gap-2 text-sm font-semibold text-sky-500 hover:text-sky-600 transition-colors"
                                        >
                                            <Users className="w-4 h-4" />
                                            Go to Dashboard →
                                        </button>
                                    </motion.div>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>
            </div>
        </div>
    );
}
