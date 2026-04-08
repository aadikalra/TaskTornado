'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HugeIcon } from '@/lib/huge-icon-map';
import { useToast } from '@/context/ToastContext';

interface GroupShareMenuProps {
    groupId: string;
    groupName: string;
    className?: string;
}

export function GroupShareMenu({ groupId, groupName, className }: GroupShareMenuProps) {
    const { success, error: toastError } = useToast();
    const [copied, setCopied] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    const getInviteUrl = () => {
        if (typeof window !== 'undefined') {
            return `${window.location.origin}/groups/join/${groupId}`;
        }
        return '';
    };

    const shareData = {
        title: `Join my study group: ${groupName}`,
        text: `Hey! Join my study group "${groupName}" on TaskTornado.`,
        url: getInviteUrl(),
    };

    const handleNativeShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share(shareData);
                success('Shared successfully!');
            } catch (err) {
                if ((err as Error).name !== 'AbortError') {
                    console.error('Error sharing:', err);
                }
            }
        }
        setIsOpen(false);
    };

    const copyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(getInviteUrl());
            setCopied(true);
            success('Invite link copied!', 'Share it with others to invite them.');
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            toastError('Failed to copy link', 'Please try again.');
        }
        setIsOpen(false);
    };

    const shareOnTwitter = () => {
        const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareData.text)}&url=${encodeURIComponent(shareData.url)}`;
        window.open(url, '_blank', 'width=550,height=420');
        setIsOpen(false);
    };

    const shareOnLinkedIn = () => {
        const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareData.url)}`;
        window.open(url, '_blank', 'width=550,height=600');
        setIsOpen(false);
    };

    const shareViaEmail = () => {
        const url = `mailto:?subject=${encodeURIComponent(shareData.title)}&body=${encodeURIComponent(shareData.text + '\n\n' + shareData.url)}`;
        window.location.href = url;
        setIsOpen(false);
    };

    const menuItems = [
        {
            icon: copied ? 'CheckmarkCircle02' : 'LinkSquare02',
            label: copied ? 'Copied!' : 'Copy Invite Link',
            onClick: copyToClipboard,
            iconColor: copied ? 'text-emerald-500' : 'text-sky-500',
            bgColor: copied ? 'bg-emerald-100/50 dark:bg-emerald-500/10' : 'bg-sky-100/50 dark:bg-sky-500/10',
        },
        ...(typeof navigator !== 'undefined' && (navigator as any).share ? [{
            icon: 'Share03',
            label: 'System Share',
            onClick: handleNativeShare,
            iconColor: 'text-sky-500',
            bgColor: 'bg-sky-100/50 dark:bg-sky-500/10',
        }] : []),
        {
            icon: 'NewTwitter',
            label: 'Share on X',
            onClick: shareOnTwitter,
            iconColor: 'text-sky-500',
            bgColor: 'bg-sky-100/50 dark:bg-sky-500/10',
        },
        {
            icon: 'Linkedin02',
            label: 'Share on LinkedIn',
            onClick: shareOnLinkedIn,
            iconColor: 'text-sky-500',
            bgColor: 'bg-sky-100/50 dark:bg-sky-500/10',
        },
        {
            icon: 'MailSend01',
            label: 'Send via Email',
            onClick: shareViaEmail,
            iconColor: 'text-sky-500',
            bgColor: 'bg-sky-100/50 dark:bg-sky-500/10',
        },
    ];

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`${className} flex items-center justify-center`}
            >
                <HugeIcon name="Share03" className="w-[22px] h-[22px]" />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-40"
                            onClick={() => setIsOpen(false)}
                        />
                        <motion.div
                            initial={{ opacity: 0, y: 8, scale: 0.96 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 8, scale: 0.96 }}
                            transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
                            className="absolute right-0 top-full mt-2 w-64 z-50"
                        >
                            <div className="bg-white/90 dark:bg-gray-900/95 backdrop-blur-xl border border-sky-100 dark:border-gray-800 rounded-2xl shadow-xl shadow-sky-500/5 overflow-hidden p-2">
                                {/* Header */}
                                <div className="flex items-center gap-3 px-3 py-2 mb-1">
                                    <div className="w-10 h-10 rounded-xl bg-[#ebf6b5] dark:bg-sky-500/20 flex items-center justify-center">
                                        <HugeIcon name="UserGroup03" className="w-5 h-5 text-sky-600 dark:text-sky-400" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-sky-900 dark:text-white">Invite to Group</p>
                                        <p className="text-[10px] text-sky-500/60 dark:text-sky-400/60">Share with classmates</p>
                                    </div>
                                </div>

                                {/* Divider */}
                                <div className="mx-2 my-2 border-t border-sky-100/60 dark:border-gray-800" />

                                {/* Menu Items */}
                                <div className="space-y-0.5">
                                    {menuItems.map((item, index) => (
                                        <motion.button
                                            key={item.label}
                                            initial={{ opacity: 0, x: -8 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.03 }}
                                            onClick={item.onClick}
                                            className="w-full flex items-center gap-3 px-2.5 py-2.5 text-sm text-sky-900 dark:text-white hover:bg-sky-50 dark:hover:bg-gray-800 rounded-xl transition-colors text-left"
                                        >
                                            <div className={`w-9 h-9 rounded-lg ${item.bgColor} flex items-center justify-center shrink-0 ${item.iconColor}`}>
                                                <HugeIcon name={item.icon} className="w-4 h-4" />
                                            </div>
                                            <span className="font-medium">{item.label}</span>
                                        </motion.button>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}
