'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWideLayout } from '@/hooks/use-wide-layout';
import {
    MessageSquare,
    Plus,
    Pin,
    CheckCircle,
    Eye,
    ThumbsUp,
    Send,
    ArrowLeft,
    FileText,
    Link as LinkIcon,
    Video,
    File,
    Search,
    Trash2,
    MoreVertical,
    Award,
    X,
    Users,
    LogIn,
    LogOut,
} from 'lucide-react';
import { useDiscussionBoards } from '@/context/DiscussionBoardsContext';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { Button } from '@/components/animate-ui/components/buttons/button';
import { Label } from '@/components/ui/label';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { ResourceType } from '@/context/DiscussionBoardsContext';
import { useRouteIntro } from '@/hooks/use-route-intro';
import { RouteIntroPopup } from '@/components/RouteIntroPopup';

export function ClassDiscussionBoards() {
    const { user } = useAuth();
    const { success, error: toastError } = useToast();
    const { getContainerClass } = useWideLayout();
    const {
        boards,
        threads,
        posts,
        resources,
        currentBoard,
        currentThread,
        loading,
        createBoard,
        deleteBoard,
        joinBoard,
        leaveBoard,
        setCurrentBoard,
        setCurrentThread,
        createThread,
        deleteThread,
        toggleThreadPin,
        toggleThreadResolved,
        incrementThreadViews,
        createPost,
        deletePost,
        togglePostUpvote,
        markAsAnswer,
        createResource,
        deleteResource,
        toggleResourceUpvote,
        fetchThreadsByBoard,
        fetchPostsByThread,
        fetchResourcesByBoard,
        fetchAllBoards,
    } = useDiscussionBoards();

    const { showIntro, dismissIntro } = useRouteIntro('discussions');

    const [view, setView] = useState<'boards' | 'threads' | 'resources'>('boards');
    const [searchQuery, setSearchQuery] = useState('');
    const [searchFocused, setSearchFocused] = useState(false);
    const [filterTag, setFilterTag] = useState<string>('all');

    // New board modal
    const [showNewBoardModal, setShowNewBoardModal] = useState(false);
    const [newBoardName, setNewBoardName] = useState('');
    const [newBoardDescription, setNewBoardDescription] = useState('');

    // New thread modal
    const [showNewThreadModal, setShowNewThreadModal] = useState(false);
    const [newThreadTitle, setNewThreadTitle] = useState('');
    const [newThreadContent, setNewThreadContent] = useState('');
    const [newThreadTags, setNewThreadTags] = useState<string[]>([]);
    const [tagInput, setTagInput] = useState('');

    // New resource modal
    const [showNewResourceModal, setShowNewResourceModal] = useState(false);
    const [newResourceTitle, setNewResourceTitle] = useState('');
    const [newResourceDescription, setNewResourceDescription] = useState('');
    const [newResourceType, setNewResourceType] = useState<ResourceType>('link');
    const [newResourceUrl, setNewResourceUrl] = useState('');
    const [newResourceTags, setNewResourceTags] = useState<string[]>([]);

    // Reply input
    const [replyContent, setReplyContent] = useState('');

    // Delete board confirmation
    const [boardToDelete, setBoardToDelete] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // Load boards on mount
    useEffect(() => {
        fetchAllBoards();
    }, []);

    const handleCreateBoard = async () => {
        if (!newBoardName.trim()) return;

        try {
            await createBoard(newBoardName, newBoardDescription);
            success('Board created!', 'Your discussion board is ready.');
            setShowNewBoardModal(false);
            setNewBoardName('');
            setNewBoardDescription('');
        } catch (err: any) {
            toastError('Failed to create board', err.message);
        }
    };

    const handleJoinBoard = async (boardId: string) => {
        try {
            await joinBoard(boardId);
            success('Joined board!', 'You can now participate in discussions.');
        } catch (err: any) {
            toastError('Failed to join board', err.message);
        }
    };

    const handleLeaveBoard = async (boardId: string) => {
        try {
            await leaveBoard(boardId);
            success('Left board', 'You have left this discussion board.');
        } catch (err: any) {
            toastError('Failed to leave board', err.message);
        }
    };

    const handleDeleteBoard = async (boardId: string) => {
        setIsDeleting(true);
        try {
            await deleteBoard(boardId);
            success('Board deleted', 'The discussion board has been removed.');
            setBoardToDelete(null);
        } catch (err: any) {
            toastError('Failed to delete board', err.message);
        } finally {
            setIsDeleting(false);
        }
    };

    const handleSelectBoard = async (board: any) => {
        setCurrentBoard(board);
        setView('threads');
        await fetchThreadsByBoard(board.id);
        await fetchResourcesByBoard(board.id);
    };

    const handleCreateThread = async () => {
        if (!currentBoard || !newThreadTitle.trim() || !newThreadContent.trim()) return;

        try {
            await createThread(currentBoard.id, newThreadTitle, newThreadContent, newThreadTags);
            success('Thread created!', 'Your question has been posted.');
            setShowNewThreadModal(false);
            setNewThreadTitle('');
            setNewThreadContent('');
            setNewThreadTags([]);
        } catch (err: any) {
            toastError('Failed to create thread', err.message);
        }
    };

    const handleCreateResource = async () => {
        if (!currentBoard || !newResourceTitle.trim()) return;

        try {
            await createResource(
                currentBoard.id,
                newResourceTitle,
                newResourceType,
                newResourceUrl || undefined,
                newResourceDescription || undefined,
                newResourceTags
            );
            success('Resource added!', 'Your resource has been shared.');
            setShowNewResourceModal(false);
            setNewResourceTitle('');
            setNewResourceDescription('');
            setNewResourceUrl('');
            setNewResourceTags([]);
        } catch (err: any) {
            toastError('Failed to add resource', err.message);
        }
    };

    const handleOpenThread = async (threadId: string) => {
        const thread = threads.find(t => t.id === threadId);
        if (!thread) return;

        setCurrentThread(thread);
        await incrementThreadViews(threadId);
        await fetchPostsByThread(threadId);
    };

    const handleSendReply = async () => {
        if (!currentThread || !replyContent.trim()) return;

        try {
            await createPost(currentThread.id, replyContent);
            setReplyContent('');
            success('Reply posted!', 'Your response has been added.');
        } catch (err: any) {
            toastError('Failed to post reply', err.message);
        }
    };

    const addTag = (tags: string[], setTags: (tags: string[]) => void, input: string, setInput: (input: string) => void) => {
        if (input.trim() && !tags.includes(input.trim())) {
            setTags([...tags, input.trim()]);
            setInput('');
        }
    };

    const removeTag = (tags: string[], setTags: (tags: string[]) => void, tag: string) => {
        setTags(tags.filter(t => t !== tag));
    };

    // Get all unique tags
    const allTags = React.useMemo(() => {
        const tagSet = new Set<string>();
        threads.forEach(t => t.tags.forEach(tag => tagSet.add(tag)));
        resources.forEach(r => r.tags.forEach(tag => tagSet.add(tag)));
        return Array.from(tagSet);
    }, [threads, resources]);

    // Filter threads and resources
    const filteredThreads = threads.filter(thread => {
        const matchesSearch = thread.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            thread.content.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesTag = filterTag === 'all' || thread.tags.includes(filterTag);
        return matchesSearch && matchesTag;
    });

    const filteredResources = resources.filter(resource => {
        const matchesSearch = resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (resource.description?.toLowerCase() || '').includes(searchQuery.toLowerCase());
        const matchesTag = filterTag === 'all' || resource.tags.includes(filterTag);
        return matchesSearch && matchesTag;
    });

    const getResourceIcon = (type: ResourceType) => {
        switch (type) {
            case 'link': return <LinkIcon className="w-4 h-4" />;
            case 'video': return <Video className="w-4 h-4" />;
            case 'document': return <FileText className="w-4 h-4" />;
            case 'file': return <File className="w-4 h-4" />;
            default: return <FileText className="w-4 h-4" />;
        }
    };

    // Thread detail view
    if (currentThread) {
        return (
            <div className="min-h-screen bg-[#fffaf4] dark:bg-gray-950 relative">
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-sky-200/20 dark:bg-sky-500/[0.06] rounded-full blur-[140px]" />
                    <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-[#ebf6b5]/30 dark:bg-emerald-500/[0.04] rounded-full blur-[120px]" />
                    <div className="absolute top-1/3 right-0 w-[300px] h-[300px] bg-[#ebf6b5]/20 dark:bg-emerald-500/[0.04] rounded-full blur-[100px]" />
                </div>
                <div className="relative z-10 px-4 sm:px-6 md:px-12 lg:px-16 pt-28 pb-16">
                    <button
                        onClick={() => setCurrentThread(null)}
                        className="flex items-center gap-2 mb-6 text-sm font-medium text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Threads
                    </button>

                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-8"
                    >
                        {/* Thread Header */}
                        <div className="pb-6 border-b border-sky-100 dark:border-gray-800">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-3">
                                        {currentThread.is_pinned && (
                                            <span className="p-1.5 bg-sky-100 dark:bg-sky-500/15 rounded-lg">
                                                <Pin className="w-4 h-4 text-sky-500 dark:text-sky-400" />
                                            </span>
                                        )}
                                        {currentThread.is_resolved && (
                                            <span className="p-1.5 bg-emerald-100 dark:bg-emerald-500/15 rounded-lg">
                                                <CheckCircle className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
                                            </span>
                                        )}
                                        <h1 className="text-3xl sm:text-4xl font-bold text-sky-900 dark:text-white tracking-tight">
                                            {currentThread.title}
                                        </h1>
                                    </div>
                                    <div className="flex items-center gap-3 text-sm">
                                        <span className="font-semibold text-sky-700 dark:text-sky-300">{currentThread.user_name}</span>
                                        <span className="text-sky-300 dark:text-sky-600">•</span>
                                        <span className="text-sky-600/60 dark:text-sky-400/60">{currentThread.created_at ? new Date(currentThread.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}</span>
                                        <span className="text-sky-300 dark:text-sky-600">•</span>
                                        <span className="flex items-center gap-1.5 text-sky-600/60 dark:text-sky-400/60">
                                            <Eye className="w-3.5 h-3.5" />
                                            {currentThread.view_count || 0} views
                                        </span>
                                    </div>
                                    {currentThread.tags.length > 0 && (
                                        <div className="flex gap-2 mt-4">
                                            {currentThread.tags.map(tag => (
                                                <span
                                                    key={tag}
                                                    className="px-3 py-1 bg-[#ebf6b5]/50 dark:bg-sky-500/10 text-sky-600 dark:text-sky-400 rounded-full text-xs font-semibold"
                                                >
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                {currentThread.user_id === user?.id && (
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="sm">
                                                <MoreVertical className="w-4 h-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent>
                                            <DropdownMenuItem onClick={() => toggleThreadPin(currentThread.id)}>
                                                <Pin className="w-4 h-4 mr-2" />
                                                {currentThread.is_pinned ? 'Unpin' : 'Pin'} Thread
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => toggleThreadResolved(currentThread.id)}>
                                                <CheckCircle className="w-4 h-4 mr-2" />
                                                Mark as {currentThread.is_resolved ? 'Unresolved' : 'Resolved'}
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                onClick={() => {
                                                    deleteThread(currentThread.id);
                                                    setCurrentThread(null);
                                                }}
                                                className="text-red-600"
                                            >
                                                <Trash2 className="w-4 h-4 mr-2" />
                                                Delete Thread
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                )}
                            </div>
                            <p className="text-[15px] text-sky-800 dark:text-sky-200 whitespace-pre-wrap leading-relaxed mt-5">
                                {currentThread.content}
                            </p>
                        </div>

                        {/* Replies */}
                        <div>
                            <h2 className="text-lg font-bold text-sky-900 dark:text-white mb-4">
                                Replies ({posts.length})
                            </h2>

                            <div className="space-y-4">
                                <AnimatePresence>
                                    {posts.map((post, index) => (
                                        <motion.div
                                            key={post.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                            transition={{ delay: index * 0.03 }}
                                            className={`p-5 border rounded-2xl transition-all ${post.is_answer
                                                ? 'border-[#d4e88e] bg-[#ebf6b5]/15 dark:border-emerald-800 dark:bg-emerald-950/20'
                                                : 'border-sky-100 dark:border-gray-800 bg-white/60 dark:bg-gray-900'
                                                }`}
                                        >
                                            <div className="flex gap-4">
                                                {/* Upvote column */}
                                                <div className="flex flex-col items-center gap-1 pt-0.5">
                                                    <button
                                                        onClick={() => togglePostUpvote(post.id)}
                                                        className={`p-2 rounded-xl transition-all ${post.user_upvoted
                                                            ? 'text-sky-600 dark:text-sky-400 bg-sky-100 dark:bg-sky-500/15'
                                                            : 'text-sky-400/30 hover:text-sky-500 hover:bg-sky-50 dark:hover:bg-sky-500/10'
                                                            }`}
                                                    >
                                                        <ThumbsUp className="w-4 h-4" />
                                                    </button>
                                                    <span className={`text-sm font-bold ${post.user_upvoted ? 'text-sky-600 dark:text-sky-400' : 'text-sky-600/40 dark:text-sky-400/40'}`}>{post.upvotes}</span>
                                                </div>
                                                {/* Post content */}
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <div className="flex items-center gap-2.5">
                                                            <span className="font-semibold text-sky-900 dark:text-white">{post.user_name}</span>
                                                            {post.is_answer && (
                                                                <span className="flex items-center gap-1 px-2.5 py-0.5 bg-emerald-100 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 rounded-full text-[11px] font-bold">
                                                                    <Award className="w-3 h-3" />
                                                                    Accepted
                                                                </span>
                                                            )}
                                                            <span className="text-sky-300 dark:text-sky-600">•</span>
                                                            <span className="text-sm text-sky-600/50 dark:text-sky-400/50">
                                                                {post.created_at ? new Date(post.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-1.5">
                                                            {currentThread.user_id === user?.id && !post.is_answer && (
                                                                <button
                                                                    onClick={() => markAsAnswer(post.id)}
                                                                    className="flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 rounded-full transition-colors"
                                                                >
                                                                    <Award className="w-3 h-3" />
                                                                    Mark as Answer
                                                                </button>
                                                            )}
                                                            {post.user_id === user?.id && (
                                                                <button
                                                                    onClick={() => deletePost(post.id)}
                                                                    className="p-1.5 rounded-full text-sky-400/30 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                                                                >
                                                                    <Trash2 className="w-3.5 h-3.5" />
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <p className="text-[15px] text-sky-800 dark:text-sky-200 whitespace-pre-wrap leading-relaxed">
                                                        {post.content}
                                                    </p>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </div>
                        </div>

                        {/* Reply input */}
                        {currentBoard?.is_member ? (
                            <div className="pt-6 border-t border-sky-100 dark:border-gray-800">
                                <label htmlFor="reply" className="text-sm font-semibold text-sky-900 dark:text-white mb-2 block">
                                    Your Reply
                                </label>
                                <textarea
                                    id="reply"
                                    value={replyContent}
                                    onChange={(e) => setReplyContent(e.target.value)}
                                    placeholder="Share your thoughts or answer..."
                                    rows={4}
                                    className="w-full px-4 py-3 text-[15px] bg-[#f5f9fc] dark:bg-gray-800 border border-sky-100 dark:border-gray-700 rounded-xl text-sky-900 dark:text-white placeholder:text-sky-600/30 outline-none focus:ring-2 focus:ring-sky-400/30 resize-none mb-4"
                                />
                                <button
                                    onClick={handleSendReply}
                                    disabled={!replyContent.trim()}
                                    className="flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-sky-700 bg-[#ebf6b5] hover:bg-[#e0efa0] border border-[#d4e88e] rounded-full transition-colors disabled:opacity-50"
                                >
                                    <Send className="w-4 h-4" />
                                    Post Reply
                                </button>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center py-10 border-t border-sky-100 dark:border-gray-800">
                                <p className="text-sm text-sky-600/50 dark:text-sky-400/50 mb-4">
                                    Join this board to participate in discussions
                                </p>
                                <button
                                    onClick={() => currentBoard && handleJoinBoard(currentBoard.id)}
                                    className="flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-sky-700 bg-[#ebf6b5] hover:bg-[#e0efa0] border border-[#d4e88e] rounded-full transition-colors"
                                >
                                    <LogIn className="w-4 h-4" />
                                    Join Board
                                </button>
                            </div>
                        )}
                    </motion.div>
                </div>
            </div>
        );
    }

    // Board list view
    if (view === 'boards' || !currentBoard) {
        return (
            <div className="min-h-screen bg-[#fffaf4] dark:bg-gray-950 relative">
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-sky-200/20 dark:bg-sky-500/[0.06] rounded-full blur-[140px]" />
                    <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-[#ebf6b5]/30 dark:bg-emerald-500/[0.04] rounded-full blur-[120px]" />
                    <div className="absolute top-1/3 right-0 w-[300px] h-[300px] bg-[#ebf6b5]/20 dark:bg-emerald-500/[0.04] rounded-full blur-[100px]" />
                </div>
                <div className="relative z-10 px-4 sm:px-6 md:px-12 lg:px-16 pt-28 pb-16">
                    {/* Header */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-10"
                    >
                        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-6">
                            <div>
                                <h1 className="text-4xl lg:text-[52px] font-bold text-sky-500 dark:text-sky-400 leading-[1.08] tracking-tight mb-2">
                                    Discussion Boards
                                </h1>
                                <p className="text-sm sm:text-base text-sky-600/50 dark:text-sky-400/50">
                                    {boards.length} board{boards.length !== 1 ? 's' : ''} · Join forums and collaborate with others
                                </p>
                            </div>

                            <div className="flex items-center gap-3">
                                {/* Search bar — blog style */}
                                <div
                                    className={`relative flex items-center gap-2 px-4 py-2.5 bg-[#f5f9fc] dark:bg-gray-800 border border-sky-200/60 dark:border-sky-800/30 rounded-full transition-all duration-300 w-full md:w-[280px] ${searchFocused ? 'ring-2 ring-sky-400/30 shadow-lg shadow-sky-500/5' : ''}`}
                                >
                                    <Search className="w-4 h-4 text-sky-500 dark:text-sky-400 shrink-0" />
                                    <input
                                        type="text"
                                        placeholder="Search boards..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        onFocus={() => setSearchFocused(true)}
                                        onBlur={() => setSearchFocused(false)}
                                        className="flex-1 bg-transparent text-[14px] text-sky-900 dark:text-sky-100 placeholder:text-sky-600/40 dark:placeholder:text-sky-400/40 outline-none"
                                    />
                                </div>

                                {/* Create Board CTA */}
                                {user && (
                                    <button
                                        onClick={() => setShowNewBoardModal(true)}
                                        className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-sky-700 bg-[#ebf6b5] hover:bg-[#e0efa0] border border-[#d4e88e] rounded-full transition-colors whitespace-nowrap"
                                    >
                                        <Plus className="w-4 h-4" />
                                        New Board
                                    </button>
                                )}
                            </div>
                        </div>
                    </motion.div>

                    {/* Boards list */}
                    <div className="space-y-0">
                        <AnimatePresence>
                            {boards
                                .filter(board =>
                                    board.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                    (board.description?.toLowerCase() || '').includes(searchQuery.toLowerCase())
                                )
                                .map((board, index) => (
                                    <motion.div
                                        key={board.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        transition={{ delay: index * 0.03 }}
                                        className="flex items-center justify-between py-4 border-b border-sky-100 dark:border-gray-800 group hover:bg-sky-500/[0.02] cursor-pointer transition-colors px-1"
                                        onClick={() => handleSelectBoard(board)}
                                    >
                                        <div className="flex items-center gap-4 flex-1 min-w-0">
                                            <div className="w-10 h-10 bg-sky-100 dark:bg-sky-500/10 rounded-xl flex items-center justify-center shrink-0">
                                                <MessageSquare className="h-4.5 w-4.5 text-sky-500 dark:text-sky-400" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h3 className="text-base font-semibold text-sky-900 dark:text-white truncate mb-1">{board.name}</h3>
                                                <div className="flex items-center gap-3 text-sm text-sky-600/50 dark:text-sky-400/50">
                                                    <span className="flex items-center gap-1">
                                                        <Users className="w-3 h-3" />
                                                        {board.member_count || 0} member{(board.member_count || 0) !== 1 ? 's' : ''}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <MessageSquare className="w-3 h-3" />
                                                        {board.thread_count || 0} thread{(board.thread_count || 0) !== 1 ? 's' : ''}
                                                    </span>
                                                    <span className="text-sky-600/30 dark:text-sky-400/30">by {board.creator_name}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 shrink-0 ml-4" onClick={(e) => e.stopPropagation()}>
                                            {user && (
                                                <>
                                                    {board.is_member ? (
                                                        <>
                                                            <button
                                                                onClick={() => handleSelectBoard(board)}
                                                                className="px-4 py-1.5 text-sm font-medium text-sky-600 bg-sky-50 dark:bg-sky-500/10 dark:text-sky-400 rounded-full hover:bg-sky-100 dark:hover:bg-sky-500/20 transition-colors"
                                                            >
                                                                View
                                                            </button>
                                                            <button
                                                                onClick={() => handleLeaveBoard(board.id)}
                                                                className="p-1.5 rounded-full text-sky-400/40 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                                                                title="Leave Board"
                                                            >
                                                                <LogOut className="w-4 h-4" />
                                                            </button>
                                                            {board.created_by === user.id && (
                                                                <button
                                                                    onClick={() => setBoardToDelete(board.id)}
                                                                    className="p-1.5 rounded-full text-sky-400/40 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                                                                    title="Delete Board"
                                                                >
                                                                    <Trash2 className="w-4 h-4" />
                                                                </button>
                                                            )}
                                                        </>
                                                    ) : (
                                                        <button
                                                            onClick={() => handleJoinBoard(board.id)}
                                                            className="flex items-center gap-1.5 px-4 py-1.5 text-sm font-semibold text-sky-700 bg-[#ebf6b5] hover:bg-[#e0efa0] border border-[#d4e88e] rounded-full transition-colors"
                                                        >
                                                            <LogIn className="w-3.5 h-3.5" />
                                                            Join
                                                        </button>
                                                    )}
                                                </>
                                            )}
                                        </div>
                                    </motion.div>
                                ))}
                        </AnimatePresence>

                        {boards.length === 0 && (
                            <div className="flex flex-col items-center justify-center py-24">
                                <div className="w-20 h-20 bg-[#f5f9fc] dark:bg-gray-800 rounded-3xl border border-sky-100 dark:border-gray-700 flex items-center justify-center mb-6">
                                    <MessageSquare className="h-9 w-9 text-sky-500/30 dark:text-sky-400/30" />
                                </div>
                                <h3 className="text-xl font-bold text-sky-900 dark:text-white mb-2">No Discussion Boards Yet</h3>
                                <p className="text-sm text-sky-600/50 dark:text-sky-400/50 mb-8 text-center max-w-sm">
                                    Create the first board and start collaborating!
                                </p>
                                {user && (
                                    <button
                                        onClick={() => setShowNewBoardModal(true)}
                                        className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-sky-700 bg-[#ebf6b5] hover:bg-[#e0efa0] border border-[#d4e88e] rounded-xl transition-colors"
                                    >
                                        <Plus className="w-4 h-4" />
                                        Create Board
                                    </button>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Create Board Modal */}
                    <AnimatePresence>
                        {showNewBoardModal && (
                            <>
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
                                    onClick={() => setShowNewBoardModal(false)}
                                />
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md z-50 bg-white dark:bg-gray-900 rounded-2xl border border-sky-100 dark:border-gray-800 shadow-2xl p-6 space-y-4"
                                >
                                    <div className="flex items-center justify-between">
                                        <h2 className="text-lg font-bold text-sky-900 dark:text-white">Create New Board</h2>
                                        <button onClick={() => setShowNewBoardModal(false)} className="p-1 rounded-lg text-sky-400/40 hover:text-sky-600 transition-colors">
                                            <X className="w-5 h-5" />
                                        </button>
                                    </div>
                                    <p className="text-sm text-sky-600/50 dark:text-sky-400/50">Create a public forum for discussions on any topic</p>
                                    <div>
                                        <Label htmlFor="board-name" className="text-sm font-medium text-sky-900 dark:text-white mb-1 block">Board Name</Label>
                                        <input
                                            id="board-name"
                                            value={newBoardName}
                                            onChange={(e) => setNewBoardName(e.target.value)}
                                            placeholder="e.g., AP Calculus Study Group"
                                            className="w-full px-4 py-2.5 text-sm bg-[#f5f9fc] dark:bg-gray-800 border border-sky-100 dark:border-gray-700 rounded-xl text-sky-900 dark:text-white placeholder:text-sky-600/30 outline-none focus:ring-2 focus:ring-sky-400/30"
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="board-description" className="text-sm font-medium text-sky-900 dark:text-white mb-1 block">Description (Optional)</Label>
                                        <textarea
                                            id="board-description"
                                            value={newBoardDescription}
                                            onChange={(e) => setNewBoardDescription(e.target.value)}
                                            placeholder="What is this board about?"
                                            rows={3}
                                            className="w-full px-4 py-2.5 text-sm bg-[#f5f9fc] dark:bg-gray-800 border border-sky-100 dark:border-gray-700 rounded-xl text-sky-900 dark:text-white placeholder:text-sky-600/30 outline-none focus:ring-2 focus:ring-sky-400/30 resize-none"
                                        />
                                    </div>
                                    <button
                                        onClick={handleCreateBoard}
                                        disabled={!newBoardName.trim()}
                                        className="w-full flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-semibold text-sky-700 bg-[#ebf6b5] hover:bg-[#e0efa0] border border-[#d4e88e] rounded-xl transition-colors disabled:opacity-50"
                                    >
                                        Create Board
                                    </button>
                                </motion.div>
                            </>
                        )}
                    </AnimatePresence>
                </div>

                {/* Route Intro Popup */}
                <RouteIntroPopup
                    isOpen={showIntro}
                    onClose={dismissIntro}
                    title="Welcome to Discussions!"
                    description="Collaborate with classmates by sharing questions, answers, and resources."
                    icon={<MessageSquare className="h-6 w-6" />}
                    features={[
                        'Create and join public discussion boards',
                        'Start threads and share ideas',
                        'Upvote helpful responses',
                        'Share resources with your community',
                    ]}
                />

                {/* Delete Board Confirmation Modal */}
                <AnimatePresence>
                    {boardToDelete && (
                        <>
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
                                onClick={() => !isDeleting && setBoardToDelete(null)}
                            />
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm z-50 bg-white dark:bg-gray-900 rounded-2xl border border-sky-100 dark:border-gray-800 shadow-2xl p-6 space-y-4"
                            >
                                <div className="flex items-center justify-between">
                                    <h2 className="text-lg font-bold text-sky-900 dark:text-white">Delete Board?</h2>
                                    <button onClick={() => !isDeleting && setBoardToDelete(null)} className="p-1 rounded-lg text-sky-400/40 hover:text-sky-600 transition-colors">
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>
                                <p className="text-sm text-sky-600/60 dark:text-sky-400/60">
                                    This will permanently delete the board and all its threads, posts, and resources. This cannot be undone.
                                </p>
                                <div className="flex gap-3 pt-2">
                                    <button
                                        onClick={() => setBoardToDelete(null)}
                                        disabled={isDeleting}
                                        className="flex-1 px-4 py-2.5 text-sm font-semibold text-sky-700 dark:text-sky-300 bg-sky-50 dark:bg-sky-500/10 hover:bg-sky-100 dark:hover:bg-sky-500/20 rounded-xl transition-colors disabled:opacity-50"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={() => handleDeleteBoard(boardToDelete)}
                                        disabled={isDeleting}
                                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-red-500 hover:bg-red-600 rounded-xl transition-colors disabled:opacity-50"
                                    >
                                        {isDeleting ? (
                                            <>
                                                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                                </svg>
                                                Deleting...
                                            </>
                                        ) : (
                                            <>
                                                <Trash2 className="w-4 h-4" />
                                                Delete
                                            </>
                                        )}
                                    </button>
                                </div>
                            </motion.div>
                        </>
                    )}
                </AnimatePresence>
            </div>
        );
    }

    // Board threads/resources view
    const containerClass = getContainerClass('max-w-7xl');
    const isWide = containerClass.includes('w-[90%]');

    return (
        <div className="min-h-screen bg-[#fffaf4] dark:bg-gray-950 w-full relative">
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-sky-200/20 dark:bg-sky-500/[0.06] rounded-full blur-[140px]" />
                <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-[#ebf6b5]/30 dark:bg-emerald-500/[0.04] rounded-full blur-[120px]" />
                <div className="absolute top-1/3 right-0 w-[300px] h-[300px] bg-[#ebf6b5]/20 dark:bg-emerald-500/[0.04] rounded-full blur-[100px]" />
            </div>
            <div className="relative z-10 w-full">
                <div className="px-4 sm:px-6 md:px-12 lg:px-16 pt-28 pb-16">
                    {/* Back button */}
                    <button
                        onClick={() => {
                            setCurrentBoard(null);
                            setView('boards');
                        }}
                        className="flex items-center gap-2 mb-6 text-sm font-medium text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Boards
                    </button>

                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-6"
                    >
                        {/* Board header */}
                        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-2">
                            <div>
                                <h1 className="text-4xl lg:text-[52px] font-bold text-sky-500 dark:text-sky-400 leading-[1.08] tracking-tight mb-2">
                                    {currentBoard?.name}
                                </h1>
                                {currentBoard?.description && (
                                    <p className="text-sm sm:text-base text-sky-600/50 dark:text-sky-400/50">
                                        {currentBoard.description}
                                    </p>
                                )}
                            </div>

                            {/* Search bar */}
                            <div
                                className={`relative flex items-center gap-2 px-4 py-2.5 bg-[#f5f9fc] dark:bg-gray-800 border border-sky-200/60 dark:border-sky-800/30 rounded-full transition-all duration-300 w-full md:w-[280px] shrink-0 ${searchFocused ? 'ring-2 ring-sky-400/30 shadow-lg shadow-sky-500/5' : ''}`}
                            >
                                <Search className="w-4 h-4 text-sky-500 dark:text-sky-400 shrink-0" />
                                <input
                                    type="text"
                                    placeholder="Search..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    onFocus={() => setSearchFocused(true)}
                                    onBlur={() => setSearchFocused(false)}
                                    className="flex-1 bg-transparent text-[14px] text-sky-900 dark:text-sky-100 placeholder:text-sky-600/40 dark:placeholder:text-sky-400/40 outline-none"
                                />
                            </div>
                        </div>

                        {/* Pill tabs + actions */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setView('threads')}
                                    className={`flex items-center gap-2 px-5 py-2 text-[13px] font-bold rounded-full transition-all duration-200 ${view === 'threads'
                                        ? 'bg-[#ebf6b5]/80 dark:bg-sky-500/25 text-sky-600 dark:text-sky-400'
                                        : 'text-sky-600/60 dark:text-sky-400/60 hover:text-sky-600 dark:hover:text-sky-400 hover:bg-[#ebf6b5]/30 dark:hover:bg-sky-500/10'
                                        }`}
                                >
                                    <MessageSquare className="h-3.5 w-3.5" />
                                    Threads
                                </button>
                                <button
                                    onClick={() => setView('resources')}
                                    className={`flex items-center gap-2 px-5 py-2 text-[13px] font-bold rounded-full transition-all duration-200 ${view === 'resources'
                                        ? 'bg-[#ebf6b5]/80 dark:bg-sky-500/25 text-sky-600 dark:text-sky-400'
                                        : 'text-sky-600/60 dark:text-sky-400/60 hover:text-sky-600 dark:hover:text-sky-400 hover:bg-[#ebf6b5]/30 dark:hover:bg-sky-500/10'
                                        }`}
                                >
                                    <FileText className="h-3.5 w-3.5" />
                                    Resources
                                </button>

                                {/* Tag filter pills */}
                                {allTags.length > 0 && (
                                    <>
                                        <div className="w-[1px] h-5 bg-sky-100 dark:bg-gray-700 mx-1" />
                                        <button
                                            onClick={() => setFilterTag('all')}
                                            className={`px-3 py-1.5 text-[12px] font-medium rounded-full transition-all duration-200 ${filterTag === 'all'
                                                ? 'bg-sky-100 dark:bg-sky-500/15 text-sky-600 dark:text-sky-400'
                                                : 'text-sky-600/40 dark:text-sky-400/40 hover:text-sky-600 dark:hover:text-sky-400 hover:bg-sky-50 dark:hover:bg-sky-500/5'
                                                }`}
                                        >
                                            All
                                        </button>
                                        {allTags.map(tag => (
                                            <button
                                                key={tag}
                                                onClick={() => setFilterTag(tag)}
                                                className={`px-3 py-1.5 text-[12px] font-medium rounded-full transition-all duration-200 ${filterTag === tag
                                                    ? 'bg-[#ebf6b5]/60 dark:bg-sky-500/15 text-sky-600 dark:text-sky-400'
                                                    : 'text-sky-600/40 dark:text-sky-400/40 hover:text-sky-600 dark:hover:text-sky-400 hover:bg-[#ebf6b5]/20 dark:hover:bg-sky-500/5'
                                                    }`}
                                            >
                                                {tag}
                                            </button>
                                        ))}
                                    </>
                                )}
                            </div>

                            {/* Action buttons */}
                            {currentBoard?.is_member && view === 'threads' && (
                                <button
                                    onClick={() => setShowNewThreadModal(true)}
                                    className="flex items-center gap-2 px-5 py-2 text-sm font-semibold text-sky-700 bg-[#ebf6b5] hover:bg-[#e0efa0] border border-[#d4e88e] rounded-full transition-colors"
                                >
                                    <Plus className="w-4 h-4" />
                                    New Thread
                                </button>
                            )}

                            {currentBoard?.is_member && view === 'resources' && (
                                <button
                                    onClick={() => setShowNewResourceModal(true)}
                                    className="flex items-center gap-2 px-5 py-2 text-sm font-semibold text-sky-700 bg-[#ebf6b5] hover:bg-[#e0efa0] border border-[#d4e88e] rounded-full transition-colors"
                                >
                                    <Plus className="w-4 h-4" />
                                    Add Resource
                                </button>
                            )}
                        </div>

                        {/* Content */}
                        {view === 'threads' ? (
                            <div className="space-y-0">
                                <AnimatePresence>
                                    {filteredThreads.map((thread, index) => (
                                        <motion.div
                                            key={thread.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                            transition={{ delay: index * 0.03 }}
                                            className="flex items-center gap-4 py-4 border-b border-sky-100 dark:border-gray-800 group hover:bg-sky-500/[0.02] cursor-pointer transition-colors px-1"
                                            onClick={() => handleOpenThread(thread.id)}
                                        >
                                            {/* Reply count */}
                                            <div className="flex flex-col items-center justify-center w-14 shrink-0">
                                                <span className="text-xl font-bold text-sky-500 dark:text-sky-400 leading-none">{thread.post_count || 0}</span>
                                                <span className="text-[10px] text-sky-600/30 dark:text-sky-400/30 mt-0.5">replies</span>
                                            </div>

                                            {/* Thread content */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    {thread.is_pinned && <Pin className="w-3.5 h-3.5 text-sky-500 shrink-0" />}
                                                    {thread.is_resolved && <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" />}
                                                    <h3 className="text-base font-semibold text-sky-900 dark:text-white truncate">{thread.title}</h3>
                                                </div>
                                                <p className="text-sm text-sky-700/60 dark:text-sky-300/60 line-clamp-1 mb-1.5">
                                                    {thread.content}
                                                </p>
                                                <div className="flex items-center gap-3 text-xs text-sky-600/40 dark:text-sky-400/40">
                                                    <span className="font-medium text-sky-600/60 dark:text-sky-400/60">{thread.user_name}</span>
                                                    <span>•</span>
                                                    <span>{thread.created_at ? new Date(thread.created_at).toLocaleDateString() : 'N/A'}</span>
                                                    <span>•</span>
                                                    <span className="flex items-center gap-1">
                                                        <Eye className="w-3 h-3" />
                                                        {thread.view_count || 0}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Tags */}
                                            {thread.tags.length > 0 && (
                                                <div className="flex gap-1.5 shrink-0">
                                                    {thread.tags.map(tag => (
                                                        <span
                                                            key={tag}
                                                            className="px-2.5 py-1 bg-[#ebf6b5]/40 dark:bg-sky-500/10 text-sky-600 dark:text-sky-400 rounded-full text-[11px] font-medium"
                                                        >
                                                            {tag}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                        </motion.div>
                                    ))}
                                </AnimatePresence>

                                {filteredThreads.length === 0 && (
                                    <div className="flex flex-col items-center justify-center py-24">
                                        <div className="w-20 h-20 bg-[#f5f9fc] dark:bg-gray-800 rounded-3xl border border-sky-100 dark:border-gray-700 flex items-center justify-center mb-6">
                                            <MessageSquare className="h-9 w-9 text-sky-500/30 dark:text-sky-400/30" />
                                        </div>
                                        <h3 className="text-xl font-bold text-sky-900 dark:text-white mb-2">No Threads Yet</h3>
                                        <p className="text-sm text-sky-600/50 dark:text-sky-400/50 text-center max-w-sm">
                                            {currentBoard?.is_member
                                                ? 'Start a discussion by creating the first thread!'
                                                : 'Join this board to see and create threads'}
                                        </p>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                <AnimatePresence>
                                    {filteredResources.map((resource, index) => (
                                        <motion.div
                                            key={resource.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                            transition={{ delay: index * 0.03 }}
                                            className="p-4 border border-sky-100 dark:border-gray-800 rounded-2xl bg-[#f5f9fc] dark:bg-gray-900 hover:border-sky-200 dark:hover:border-gray-700 hover:shadow-md transition-all"
                                        >
                                            <div className="flex items-start justify-between mb-3">
                                                <div className="flex items-center gap-2">
                                                    {getResourceIcon(resource.resource_type)}
                                                    <h3 className="font-semibold text-sky-900 dark:text-white line-clamp-1">{resource.title}</h3>
                                                </div>
                                                {resource.user_id === user?.id && (
                                                    <button
                                                        onClick={() => deleteResource(resource.id)}
                                                        className="p-1.5 rounded-full text-sky-400/30 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </div>
                                            {resource.description && (
                                                <p className="text-sm text-sky-700 dark:text-sky-300 mb-3 line-clamp-2">
                                                    {resource.description}
                                                </p>
                                            )}
                                            {resource.url && (
                                                <a
                                                    href={resource.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-sm text-sky-500 dark:text-sky-400 hover:underline mb-3 block truncate"
                                                >
                                                    {resource.url}
                                                </a>
                                            )}
                                            {resource.tags.length > 0 && (
                                                <div className="flex gap-1 flex-wrap mb-3">
                                                    {resource.tags.map(tag => (
                                                        <span
                                                            key={tag}
                                                            className="px-2 py-0.5 bg-[#ebf6b5]/40 dark:bg-sky-500/10 text-sky-600 dark:text-sky-400 rounded-full text-xs font-medium"
                                                        >
                                                            {tag}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                            <div className="flex items-center justify-between text-sm text-sky-600/50 dark:text-sky-400/50">
                                                <span>{resource.user_name}</span>
                                                <button
                                                    onClick={() => toggleResourceUpvote(resource.id)}
                                                    className={`flex items-center gap-1 px-2 py-1 rounded-full transition-colors ${resource.user_upvoted ? 'text-sky-600 dark:text-sky-400' : 'text-sky-400/40 hover:text-sky-500'}`}
                                                >
                                                    <ThumbsUp className="w-3.5 h-3.5" />
                                                    <span className="text-xs font-medium">{resource.upvotes}</span>
                                                </button>
                                            </div>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>

                                {filteredResources.length === 0 && (
                                    <div className="col-span-full flex flex-col items-center justify-center py-24">
                                        <div className="w-20 h-20 bg-[#f5f9fc] dark:bg-gray-800 rounded-3xl border border-sky-100 dark:border-gray-700 flex items-center justify-center mb-6">
                                            <FileText className="h-9 w-9 text-sky-500/30 dark:text-sky-400/30" />
                                        </div>
                                        <h3 className="text-xl font-bold text-sky-900 dark:text-white mb-2">No Resources Yet</h3>
                                        <p className="text-sm text-sky-600/50 dark:text-sky-400/50 text-center max-w-sm">
                                            {currentBoard?.is_member
                                                ? 'Share something helpful with the group!'
                                                : 'Join this board to see and share resources'}
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}
                    </motion.div>
                </div>
            </div>

            {/* Route Intro Popup */}
            <RouteIntroPopup
                isOpen={showIntro}
                onClose={dismissIntro}
                title="Welcome to Discussion Boards!"
                description="Join public forums and collaborate with students worldwide"
                icon={<MessageSquare className="h-6 w-6" />}
                features={[
                    'Join or create public discussion boards',
                    'Ask questions and share knowledge',
                    'Upvote helpful answers and resources',
                    'Organize discussions with tags and threads',
                ]}
            />
        </div>
    );
}
