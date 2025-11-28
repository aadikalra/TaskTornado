'use client';

import { ClassDiscussionBoards } from '@/components/ClassDiscussionBoards';
import { DiscussionBoardsProvider } from '@/context/DiscussionBoardsContext';

export default function DiscussionsPage() {
    return (
        <DiscussionBoardsProvider>
            <ClassDiscussionBoards />
        </DiscussionBoardsProvider>
    );
}
