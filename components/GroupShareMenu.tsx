'use client';

import React, { useState } from 'react';
import {
    Share2,
    
    Twitter,
    Linkedin,
    Link as LinkIcon,
    Mail,
    Users,
    Check
} from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
    DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { useToast } from '@/context/ToastContext';

interface GroupShareMenuProps {
    groupId: string;
    groupName: string;
    className?: string;
    variant?: 'ghost' | 'outline' | 'default';
    size?: 'icon' | 'sm' | 'default';
}

export function GroupShareMenu({ groupId, groupName, className, variant = 'ghost', size = 'icon' }: GroupShareMenuProps) {
    const { success, error: toastError } = useToast();
    const [copied, setCopied] = useState(false);

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
    };

    const shareOnTwitter = () => {
        const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareData.text)}&url=${encodeURIComponent(shareData.url)}`;
        window.open(url, '_blank', 'width=550,height=420');
    };

    const shareOnLinkedIn = () => {
        const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareData.url)}`;
        window.open(url, '_blank', 'width=550,height=600');
    };

    const shareViaEmail = () => {
        const url = `mailto:?subject=${encodeURIComponent(shareData.title)}&body=${encodeURIComponent(shareData.text + '\n\n' + shareData.url)}`;
        window.location.href = url;
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant={variant} size={size} className={className}>
                    <Share2 className="w-4 h-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
                <DropdownMenuLabel className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Invite to Group
                </DropdownMenuLabel>
                <DropdownMenuSeparator />

                {typeof navigator !== 'undefined' && (navigator as any).share && (
                    <>
                        <DropdownMenuItem onClick={handleNativeShare}>
                            <Share2 className="mr-2 h-4 w-4" />
                            <span>System Share</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                    </>
                )}

                <DropdownMenuItem onClick={copyToClipboard}>
                    {copied ? (
                        <Check className="mr-2 h-4 w-4 text-green-500" />
                    ) : (
                        <LinkIcon className="mr-2 h-4 w-4" />
                    )}
                    <span>{copied ? 'Copied!' : 'Copy Invite Link'}</span>
                </DropdownMenuItem>

                <DropdownMenuItem onClick={shareOnTwitter}>
                    <Twitter className="mr-2 h-4 w-4" />
                    <span>Share on X</span>
                </DropdownMenuItem>

                <DropdownMenuItem onClick={shareOnLinkedIn}>
                    <Linkedin className="mr-2 h-4 w-4" />
                    <span>Share on LinkedIn</span>
                </DropdownMenuItem>

                <DropdownMenuItem onClick={shareViaEmail}>
                    <Mail className="mr-2 h-4 w-4" />
                    <span>Send via Email</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
