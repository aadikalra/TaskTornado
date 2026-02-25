'use client';

import React from 'react';
import {
    Share2,
    
    Twitter,
    Linkedin,
    Link as LinkIcon,
    
    Mail
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

interface TutorialShareMenuProps {
    title: string;
    className?: string;
}

export function TutorialShareMenu({ title, className }: TutorialShareMenuProps) {
    const { success, error: toastError } = useToast();

    const getUrl = () => {
        if (typeof window !== 'undefined') {
            return window.location.href;
        }
        return '';
    };

    const shareData = {
        title: `TaskTornado Tutorial: ${title}`,
        text: `Check out this guide on TaskTornado: ${title}`,
        url: getUrl(),
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
            await navigator.clipboard.writeText(getUrl());
            success('Link copied to clipboard!', 'You can now share it with others.');
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
                <Button variant="ghost" size="icon" className={className}>
                    <Share2 className="w-4 h-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Share Guide</DropdownMenuLabel>
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
                    <LinkIcon className="mr-2 h-4 w-4" />
                    <span>Copy Link</span>
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
