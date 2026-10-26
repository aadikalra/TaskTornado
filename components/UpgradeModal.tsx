'use client';

import Link from 'next/link';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

interface UpgradeModalProps {
    isOpen: boolean;
    onClose: () => void;
    featureLabel?: string;
    limitMessage?: string;
}

// Kept under the existing component name for callers of the shared limit handler.
export default function UpgradeModal({ isOpen, onClose, featureLabel, limitMessage }: UpgradeModalProps) {
    const isAiLimit = /\b(ai|quick|deep|translation|translations|copilot|writing)\b/i.test(`${featureLabel || ''} ${limitMessage || ''}`);
    return (
        <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
            <DialogContent className="rounded-3xl border-sky-100 bg-white dark:border-sky-900 dark:bg-gray-900 sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>{isAiLimit ? 'Free AI allowance' : 'Free plan limit'}</DialogTitle>
                    <DialogDescription className="pt-2 leading-relaxed">
                        {limitMessage || (isAiLimit ? 'Your free AI allowance has a daily limit.' : 'This feature has reached its current free limit.')}
                    </DialogDescription>
                </DialogHeader>
                {isAiLimit ? (
                    <>
                        <p className="text-sm text-sky-700 dark:text-sky-300">Use your own API key at any time to continue with your provider. Your free allowance resets daily.</p>
                        <Link href="/settings#ai" onClick={onClose} className="rounded-xl bg-sky-500 px-4 py-3 text-center text-sm font-semibold text-white hover:bg-sky-600">Connect your own key</Link>
                    </>
                ) : <p className="text-sm text-sky-700 dark:text-sky-300">For storage limits, remove items you no longer need to make room.</p>}
                <button type="button" onClick={onClose} className="rounded-xl px-4 py-2 text-sm font-medium text-sky-600 hover:bg-sky-50 dark:text-sky-300 dark:hover:bg-sky-950">Close</button>
            </DialogContent>
        </Dialog>
    );
}
