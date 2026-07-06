'use client';

import { ClassDiscussionBoards } from '@/components/ClassDiscussionBoards';
import { DiscussionBoardsProvider } from '@/context/DiscussionBoardsContext';
import { useRequireAuth } from '@/hooks/use-require-auth';

export default function DiscussionsPage() {
    const { authenticated } = useRequireAuth();
    if (!authenticated) return null;
    return (
        <DiscussionBoardsProvider>
            <ClassDiscussionBoards />
        </DiscussionBoardsProvider>
    );
}
