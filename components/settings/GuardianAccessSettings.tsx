'use client';

import { useState, useEffect, useCallback } from 'react';
import { Copy, Check, RefreshCw, Loader2, X, Users, Shield, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';

type LinkedGuardian = {
    id: string;
    name: string | null;
    email: string | null;
    linkedAt: string;
};

type InviteCode = {
    code: string;
    expiresAt: string;
};

export default function GuardianAccessSettings() {
    const { user } = useAuth();
    const [inviteCode, setInviteCode] = useState<InviteCode | null>(null);
    const [linkedGuardians, setLinkedGuardians] = useState<LinkedGuardian[]>([]);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isLoadingGuardians, setIsLoadingGuardians] = useState(true);
    const [copied, setCopied] = useState(false);
    const [error, setError] = useState('');
    const [unlinkingId, setUnlinkingId] = useState<string | null>(null);
    const [confirmUnlinkId, setConfirmUnlinkId] = useState<string | null>(null);

    const fetchLinkedGuardians = useCallback(async () => {
        if (!user) return;
        try {
            // We query from the student's perspective — find parent_links where student_id = user.id
            const { supabase } = await import('@/lib/supabase/client');
            const { data: links, error } = await supabase
                .from('parent_links')
                .select('parent_id, created_at')
                .eq('student_id', user.id)
                .eq('status', 'active');

            if (error || !links?.length) {
                setLinkedGuardians([]);
                setIsLoadingGuardians(false);
                return;
            }

            const parentIds = links.map(l => l.parent_id);
            const { data: profiles } = await supabase
                .from('profiles')
                .select('id, full_name, email')
                .in('id', parentIds);

            const guardians: LinkedGuardian[] = links.map(link => {
                const profile = profiles?.find(p => p.id === link.parent_id);
                return {
                    id: link.parent_id,
                    name: profile?.full_name ?? null,
                    email: profile?.email ?? null,
                    linkedAt: link.created_at ?? new Date().toISOString(),
                };
            });

            setLinkedGuardians(guardians);
        } catch (err) {
            console.error('Failed to fetch guardians:', err);
        } finally {
            setIsLoadingGuardians(false);
        }
    }, [user]);

    useEffect(() => {
        fetchLinkedGuardians();
    }, [fetchLinkedGuardians]);

    const handleGenerateCode = async () => {
        setIsGenerating(true);
        setError('');
        try {
            const res = await fetch('/api/guardian/generate-code', { method: 'POST' });
            const data = await res.json();

            if (!res.ok) {
                setError(data.error || 'Failed to generate code');
                return;
            }

            setInviteCode({ code: data.code, expiresAt: data.expiresAt });
        } catch (err) {
            setError('Failed to generate code. Please try again.');
        } finally {
            setIsGenerating(false);
        }
    };

    const handleCopyCode = async () => {
        if (!inviteCode) return;
        try {
            await navigator.clipboard.writeText(inviteCode.code);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            // Fallback
            const textArea = document.createElement('textarea');
            textArea.value = inviteCode.code;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const handleUnlink = async (parentId: string) => {
        if (confirmUnlinkId !== parentId) {
            setConfirmUnlinkId(parentId);
            setTimeout(() => setConfirmUnlinkId(null), 5000);
            return;
        }

        setUnlinkingId(parentId);
        try {
            const res = await fetch('/api/guardian/unlink', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ studentId: user?.id }),
            });

            if (res.ok) {
                setLinkedGuardians(prev => prev.filter(g => g.id !== parentId));
                setConfirmUnlinkId(null);
            }
        } catch (err) {
            console.error('Failed to unlink:', err);
        } finally {
            setUnlinkingId(null);
        }
    };

    const getTimeRemaining = (expiresAt: string) => {
        const diff = new Date(expiresAt).getTime() - Date.now();
        if (diff <= 0) return 'Expired';
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        return `${hours}h ${minutes}m remaining`;
    };

    return (
        <div className="space-y-6">
            {/* Info banner */}
            <div className="flex items-start gap-3 px-4 py-3 rounded-2xl bg-sky-500/[0.04] dark:bg-sky-500/[0.06] border border-sky-200/40 dark:border-sky-500/10">
                <Shield className="w-4 h-4 text-sky-500/60 mt-0.5 flex-shrink-0" />
                <p className="text-[13px] text-sky-800/60 dark:text-sky-300/60 font-medium leading-relaxed">
                    Let a parent or guardian monitor your classes, homework, and test progress.
                    They can only <span className="font-bold text-sky-800/80 dark:text-sky-300/80">view</span> your data — they cannot edit or delete anything.
                </p>
            </div>

            {/* Generate Invite Code */}
            <div className="space-y-3">
                <div className="flex items-center gap-2 px-1">
                    <Users className="w-4 h-4 text-sky-500/50" />
                    <span className="text-[14px] font-medium text-sky-900 dark:text-sky-100">
                        Invite Code
                    </span>
                </div>

                {inviteCode ? (
                    <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-4 rounded-2xl bg-white/60 dark:bg-zinc-900/40 border border-sky-100 dark:border-gray-700"
                    >
                        {/* Code display */}
                        <div className="flex items-center justify-center gap-1.5 mb-3">
                            {inviteCode.code.split('').map((char, i) => (
                                <div
                                    key={i}
                                    className="w-10 h-12 flex items-center justify-center bg-sky-500/[0.06] dark:bg-sky-500/[0.08] border border-sky-200/50 dark:border-sky-500/15 rounded-xl text-lg font-bold text-sky-700 dark:text-sky-300 tracking-wide"
                                >
                                    {char}
                                </div>
                            ))}
                        </div>

                        {/* Time remaining */}
                        <div className="flex items-center justify-center gap-1.5 mb-4">
                            <Clock className="w-3 h-3 text-sky-500/40" />
                            <span className="text-[11px] font-semibold text-sky-600/40 dark:text-sky-400/40">
                                {getTimeRemaining(inviteCode.expiresAt)}
                            </span>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2">
                            <button
                                onClick={handleCopyCode}
                                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-bold bg-sky-500 text-white hover:bg-sky-600 transition-colors active:scale-[0.98]"
                            >
                                {copied ? (
                                    <>
                                        <Check className="w-3.5 h-3.5" />
                                        Copied!
                                    </>
                                ) : (
                                    <>
                                        <Copy className="w-3.5 h-3.5" />
                                        Copy Code
                                    </>
                                )}
                            </button>
                            <button
                                onClick={handleGenerateCode}
                                disabled={isGenerating}
                                className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-[13px] font-bold text-sky-700 dark:text-sky-300 bg-sky-500/[0.06] hover:bg-sky-500/[0.1] border border-sky-200/40 dark:border-sky-500/15 transition-colors active:scale-[0.98]"
                            >
                                {isGenerating ? (
                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                ) : (
                                    <RefreshCw className="w-3.5 h-3.5" />
                                )}
                                New
                            </button>
                        </div>
                    </motion.div>
                ) : (
                    <button
                        onClick={handleGenerateCode}
                        disabled={isGenerating}
                        className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl text-[14px] font-bold text-sky-700 dark:text-sky-300 bg-white/60 dark:bg-zinc-900/40 border border-sky-100 dark:border-gray-700 hover:bg-sky-500/[0.04] transition-colors active:scale-[0.99]"
                    >
                        {isGenerating ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Generating...
                            </>
                        ) : (
                            <>
                                <Users className="w-4 h-4" />
                                Generate Invite Code
                            </>
                        )}
                    </button>
                )}

                {/* Error */}
                <AnimatePresence>
                    {error && (
                        <motion.p
                            initial={{ opacity: 0, y: -4 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -4 }}
                            className="text-xs text-red-500 dark:text-red-400 font-medium text-center"
                        >
                            {error}
                        </motion.p>
                    )}
                </AnimatePresence>
            </div>

            {/* Linked Guardians */}
            <div className="space-y-3">
                <div className="flex items-center gap-2 px-1">
                    <Shield className="w-4 h-4 text-sky-500/50" />
                    <span className="text-[14px] font-medium text-sky-900 dark:text-sky-100">
                        Linked Guardians
                    </span>
                </div>

                {isLoadingGuardians ? (
                    <div className="flex items-center justify-center py-8">
                        <Loader2 className="w-5 h-5 text-sky-500/40 animate-spin" />
                    </div>
                ) : linkedGuardians.length === 0 ? (
                    <div className="py-6 text-center rounded-2xl bg-white/40 dark:bg-zinc-900/20 border border-sky-100/50 dark:border-gray-800">
                        <p className="text-[13px] text-sky-600/30 dark:text-sky-400/30 font-medium">
                            No guardians linked yet
                        </p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {linkedGuardians.map((guardian) => (
                            <motion.div
                                key={guardian.id}
                                layout
                                className="flex items-center justify-between p-3.5 rounded-2xl bg-white/60 dark:bg-zinc-900/40 border border-sky-100 dark:border-gray-700"
                            >
                                <div className="flex items-center gap-3 min-w-0">
                                    <div className="w-9 h-9 rounded-full bg-sky-500/[0.08] dark:bg-sky-500/[0.1] flex items-center justify-center flex-shrink-0">
                                        <Users className="w-4 h-4 text-sky-500" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-[14px] font-semibold text-sky-900 dark:text-sky-100 truncate">
                                            {guardian.name || 'Guardian'}
                                        </p>
                                        <p className="text-[11px] text-sky-600/40 dark:text-sky-400/40 font-medium truncate">
                                            {guardian.email || 'No email'} · Linked {new Date(guardian.linkedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </p>
                                    </div>
                                </div>

                                <button
                                    onClick={() => handleUnlink(guardian.id)}
                                    disabled={unlinkingId === guardian.id}
                                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold transition-all active:scale-95 flex-shrink-0 ml-3 ${confirmUnlinkId === guardian.id
                                            ? 'bg-red-500 text-white hover:bg-red-600'
                                            : 'text-red-500/60 dark:text-red-400/60 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 border border-red-200/40 dark:border-red-500/15'
                                        }`}
                                >
                                    {unlinkingId === guardian.id ? (
                                        <Loader2 className="w-3 h-3 animate-spin" />
                                    ) : confirmUnlinkId === guardian.id ? (
                                        'Confirm?'
                                    ) : (
                                        <>
                                            <X className="w-3 h-3" />
                                            Revoke
                                        </>
                                    )}
                                </button>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
