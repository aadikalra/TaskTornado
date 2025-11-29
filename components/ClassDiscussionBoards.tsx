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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
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
            <div className="min-h-screen bg-white dark:bg-gray-950">
                <div className="px-4 py-8 sm:px-6 sm:py-12 lg:px-8 lg:py-16">
                    <Button
                        onClick={() => setCurrentThread(null)}
                        variant="ghost"
                        size="sm"
                        className="mb-6 text-gray-600 dark:text-gray-400"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Threads
                    </Button>

                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-8"
                    >
                        {/* Thread Header */}
                        <div className="pb-6 border-b border-gray-200 dark:border-gray-800">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-3">
                                        {currentThread.is_pinned && (
                                            <Pin className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                                        )}
                                        {currentThread.is_resolved && (
                                            <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                                        )}
                                        <h1 className="text-2xl sm:text-3xl font-light text-gray-900 dark:text-white">
                                            {currentThread.title}
                                        </h1>
                                    </div>
                                    <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                                        <span>{currentThread.user_name}</span>
                                        <span>•</span>
                                        <span>{currentThread.created_at ? new Date(currentThread.created_at).toLocaleDateString() : 'N/A'}</span>
                                        <span>•</span>
                                        <span className="flex items-center gap-1">
                                            <Eye className="w-3 h-3" />
                                            {currentThread.view_count || 0}
                                        </span>
                                    </div>
                                    {currentThread.tags.length > 0 && (
                                        <div className="flex gap-2 mt-3">
                                            {currentThread.tags.map(tag => (
                                                <span
                                                    key={tag}
                                                    className="px-2 py-1 bg-gray-50 dark:bg-gray-900 text-gray-600 dark:text-gray-400 rounded text-xs"
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
                            <p className="text-gray-600 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                                {currentThread.content}
                            </p>
                        </div>

                        {/* Replies */}
                        <div>
                            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
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
                                            className={`p-4 border rounded-lg ${post.is_answer
                                                ? 'border-green-200 dark:border-green-900 bg-green-50/50 dark:bg-green-950/20'
                                                : 'border-gray-200 dark:border-gray-800'
                                                }`}
                                        >
                                            <div className="flex gap-4">
                                                <div className="flex flex-col items-center gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => togglePostUpvote(post.id)}
                                                        className={post.user_upvoted ? 'text-gray-900 dark:text-white' : 'text-gray-400'}
                                                    >
                                                        <ThumbsUp className="w-4 h-4" />
                                                    </Button>
                                                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{post.upvotes}</span>
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <div className="flex items-center gap-2">
                                                            <span className="font-medium text-gray-900 dark:text-white">{post.user_name}</span>
                                                            {post.is_answer && (
                                                                <span className="flex items-center gap-1 px-2 py-0.5 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded text-xs">
                                                                    <Award className="w-3 h-3" />
                                                                    Accepted
                                                                </span>
                                                            )}
                                                            <span className="text-sm text-gray-500 dark:text-gray-400">
                                                                {post.created_at ? new Date(post.created_at).toLocaleDateString() : 'N/A'}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            {currentThread.user_id === user?.id && !post.is_answer && (
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={() => markAsAnswer(post.id)}
                                                                    className="text-xs"
                                                                >
                                                                    <Award className="w-3 h-3 mr-1" />
                                                                    Mark as Answer
                                                                </Button>
                                                            )}
                                                            {post.user_id === user?.id && (
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={() => deletePost(post.id)}
                                                                >
                                                                    <Trash2 className="w-4 h-4 text-red-600" />
                                                                </Button>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <p className="text-gray-600 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
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
                            <div className="pt-6 border-t border-gray-200 dark:border-gray-800">
                                <Label htmlFor="reply" className="text-sm font-medium text-gray-900 dark:text-white mb-2 block">
                                    Your Reply
                                </Label>
                                <Textarea
                                    id="reply"
                                    value={replyContent}
                                    onChange={(e) => setReplyContent(e.target.value)}
                                    placeholder="Share your thoughts or answer..."
                                    className="min-h-[100px] mb-4"
                                />
                                <Button
                                    onClick={handleSendReply}
                                    disabled={!replyContent.trim()}
                                >
                                    <Send className="w-4 h-4 mr-2" />
                                    Post Reply
                                </Button>
                            </div>
                        ) : (
                            <div className="py-8 text-center border-t border-gray-200 dark:border-gray-800">
                                <p className="text-gray-500 dark:text-gray-400 mb-4">
                                    Join this board to participate in discussions
                                </p>
                                <Button onClick={() => currentBoard && handleJoinBoard(currentBoard.id)}>
                                    <LogIn className="w-4 h-4 mr-2" />
                                    Join Board
                                </Button>
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
            <div className="min-h-screen bg-white dark:bg-gray-950">
                <div className="px-4 py-8 sm:px-6 sm:py-12 lg:px-8 lg:py-16">
                    {/* Header */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-8 sm:mb-12"
                    >
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-light text-gray-900 dark:text-white mb-2 tracking-tight">
                                    Discussion Boards
                                </h1>
                                <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400">
                                    Join forums and collaborate with others
                                </p>
                            </div>
                            {user && (
                                <Dialog open={showNewBoardModal} onOpenChange={setShowNewBoardModal}>
                                    <DialogTrigger asChild>
                                        <Button>
                                            <Plus className="w-4 h-4 mr-2" />
                                            Create Board
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                        <DialogHeader>
                                            <DialogTitle>Create New Discussion Board</DialogTitle>
                                            <DialogDescription>
                                                Create a public forum for discussions on any topic
                                            </DialogDescription>
                                        </DialogHeader>
                                        <div className="space-y-4">
                                            <div>
                                                <Label htmlFor="board-name">Board Name</Label>
                                                <Input
                                                    id="board-name"
                                                    value={newBoardName}
                                                    onChange={(e) => setNewBoardName(e.target.value)}
                                                    placeholder="e.g., AP Calculus Study Group"
                                                />
                                            </div>
                                            <div>
                                                <Label htmlFor="board-description">Description (Optional)</Label>
                                                <Textarea
                                                    id="board-description"
                                                    value={newBoardDescription}
                                                    onChange={(e) => setNewBoardDescription(e.target.value)}
                                                    placeholder="What is this board about?"
                                                    className="min-h-[100px]"
                                                />
                                            </div>
                                            <Button
                                                onClick={handleCreateBoard}
                                                disabled={!newBoardName.trim()}
                                                className="w-full"
                                            >
                                                Create Board
                                            </Button>
                                        </div>
                                    </DialogContent>
                                </Dialog>
                            )}
                        </div>

                        {/* Search */}
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <Input
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search boards..."
                                className="pl-10"
                            />
                        </div>
                    </motion.div>

                    {/* Boards grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
                                        className="p-4 border border-gray-200 dark:border-gray-800 rounded-lg hover:border-gray-300 dark:hover:border-gray-700 transition-colors cursor-pointer"
                                        onClick={() => handleSelectBoard(board)}
                                    >
                                        <h3 className="font-medium text-gray-900 dark:text-white mb-2">{board.name}</h3>
                                        {board.description && (
                                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                                                {board.description}
                                            </p>
                                        )}
                                        <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-3">
                                            <span className="flex items-center gap-1">
                                                <Users className="w-3 h-3" />
                                                {board.member_count || 0}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <MessageSquare className="w-3 h-3" />
                                                {board.thread_count || 0}
                                            </span>
                                        </div>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                                            by {board.creator_name}
                                        </p>
                                        {user && (
                                            <div onClick={(e) => e.stopPropagation()}>
                                                {board.is_member ? (
                                                    <div className="flex gap-2">
                                                        <Button
                                                            onClick={() => handleSelectBoard(board)}
                                                            size="sm"
                                                            className="flex-1"
                                                        >
                                                            View Board
                                                        </Button>
                                                        <Button
                                                            onClick={() => handleLeaveBoard(board.id)}
                                                            variant="outline"
                                                            size="sm"
                                                        >
                                                            <LogOut className="w-4 h-4" />
                                                        </Button>
                                                    </div>
                                                ) : (
                                                    <Button
                                                        onClick={() => handleJoinBoard(board.id)}
                                                        variant="outline"
                                                        size="sm"
                                                        className="w-full"
                                                    >
                                                        <LogIn className="w-4 h-4 mr-2" />
                                                        Join
                                                    </Button>
                                                )}
                                            </div>
                                        )}
                                    </motion.div>
                                ))}
                        </AnimatePresence>

                        {boards.length === 0 && (
                            <div className="col-span-full py-12 text-center border border-gray-200 dark:border-gray-800 rounded-lg">
                                <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                                <p className="text-gray-600 dark:text-gray-400">
                                    No discussion boards yet. Create the first one!
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    // Board threads/resources view
    const containerClass = getContainerClass('max-w-7xl');
    const isWide = containerClass.includes('w-[90%]');

    return (
        <div className={`min-h-screen bg-gray-50 dark:bg-gray-900 w-full ${isWide ? 'px-0' : ''}`}>
            <div className={`${containerClass} w-full`}>
                <div className="px-4 py-8 sm:px-6 sm:py-12 lg:px-8 lg:py-16">
                    <Button
                        onClick={() => {
                            setCurrentBoard(null);
                            setView('boards');
                        }}
                        variant="ghost"
                        size="sm"
                        className="mb-6 text-gray-600 dark:text-gray-400"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Boards
                    </Button>

                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-8"
                    >
                        {/* Board header */}
                        <div className="pb-6 border-b border-gray-200 dark:border-gray-800">
                            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-light text-gray-900 dark:text-white mb-2 tracking-tight">
                                {currentBoard?.name}
                            </h1>
                            {currentBoard?.description && (
                                <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400">
                                    {currentBoard.description}
                                </p>
                            )}
                        </div>

                        {/* View tabs */}
                        <div className="flex items-center justify-between">
                            <div className="flex gap-2">
                                <Button
                                    variant={view === 'threads' ? 'default' : 'outline'}
                                    onClick={() => setView('threads')}
                                    size="sm"
                                >
                                    <MessageSquare className="w-4 h-4 mr-2" />
                                    Threads
                                </Button>
                                <Button
                                    variant={view === 'resources' ? 'default' : 'outline'}
                                    onClick={() => setView('resources')}
                                    size="sm"
                                >
                                    <FileText className="w-4 h-4 mr-2" />
                                    Resources
                                </Button>
                            </div>

                            {currentBoard?.is_member && view === 'threads' && (
                                <Dialog open={showNewThreadModal} onOpenChange={setShowNewThreadModal}>
                                    <DialogTrigger asChild>
                                        <Button size="sm">
                                            <Plus className="w-4 h-4 mr-2" />
                                            New Thread
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent className="max-w-2xl">
                                        <DialogHeader>
                                            <DialogTitle>Create New Thread</DialogTitle>
                                            <DialogDescription>
                                                Ask a question or start a discussion
                                            </DialogDescription>
                                        </DialogHeader>
                                        <div className="space-y-4">
                                            <div>
                                                <Label htmlFor="title">Title</Label>
                                                <Input
                                                    id="title"
                                                    value={newThreadTitle}
                                                    onChange={(e) => setNewThreadTitle(e.target.value)}
                                                    placeholder="What's your question?"
                                                />
                                            </div>
                                            <div>
                                                <Label htmlFor="content">Content</Label>
                                                <Textarea
                                                    id="content"
                                                    value={newThreadContent}
                                                    onChange={(e) => setNewThreadContent(e.target.value)}
                                                    placeholder="Provide more details..."
                                                    className="min-h-[150px]"
                                                />
                                            </div>
                                            <div>
                                                <Label htmlFor="tags">Tags</Label>
                                                <div className="flex gap-2 mb-2">
                                                    <Input
                                                        id="tags"
                                                        value={tagInput}
                                                        onChange={(e) => setTagInput(e.target.value)}
                                                        onKeyPress={(e) => {
                                                            if (e.key === 'Enter') {
                                                                e.preventDefault();
                                                                addTag(newThreadTags, setNewThreadTags, tagInput, setTagInput);
                                                            }
                                                        }}
                                                        placeholder="Add tags..."
                                                    />
                                                    <Button
                                                        type="button"
                                                        onClick={() => addTag(newThreadTags, setNewThreadTags, tagInput, setTagInput)}
                                                    >
                                                        Add
                                                    </Button>
                                                </div>
                                                <div className="flex gap-2 flex-wrap">
                                                    {newThreadTags.map(tag => (
                                                        <span
                                                            key={tag}
                                                            className="px-2 py-1 bg-gray-50 dark:bg-gray-900 text-gray-600 dark:text-gray-400 rounded text-sm flex items-center gap-1"
                                                        >
                                                            {tag}
                                                            <button
                                                                onClick={() => removeTag(newThreadTags, setNewThreadTags, tag)}
                                                                className="hover:text-red-600"
                                                            >
                                                                <X className="w-3 h-3" />
                                                            </button>
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                            <Button
                                                onClick={handleCreateThread}
                                                disabled={!newThreadTitle.trim() || !newThreadContent.trim()}
                                                className="w-full"
                                            >
                                                Create Thread
                                            </Button>
                                        </div>
                                    </DialogContent>
                                </Dialog>
                            )}

                            {currentBoard?.is_member && view === 'resources' && (
                                <Dialog open={showNewResourceModal} onOpenChange={setShowNewResourceModal}>
                                    <DialogTrigger asChild>
                                        <Button size="sm">
                                            <Plus className="w-4 h-4 mr-2" />
                                            Add Resource
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent className="max-w-2xl">
                                        <DialogHeader>
                                            <DialogTitle>Share a Resource</DialogTitle>
                                            <DialogDescription>
                                                Share helpful materials with the community
                                            </DialogDescription>
                                        </DialogHeader>
                                        <div className="space-y-4">
                                            <div>
                                                <Label htmlFor="resource-title">Title</Label>
                                                <Input
                                                    id="resource-title"
                                                    value={newResourceTitle}
                                                    onChange={(e) => setNewResourceTitle(e.target.value)}
                                                    placeholder="Resource name..."
                                                />
                                            </div>
                                            <div>
                                                <Label htmlFor="resource-type">Type</Label>
                                                <Select
                                                    value={newResourceType}
                                                    onValueChange={(value) => setNewResourceType(value as ResourceType)}
                                                >
                                                    <SelectTrigger id="resource-type">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="link">Link</SelectItem>
                                                        <SelectItem value="video">Video</SelectItem>
                                                        <SelectItem value="document">Document</SelectItem>
                                                        <SelectItem value="file">File</SelectItem>
                                                        <SelectItem value="other">Other</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div>
                                                <Label htmlFor="resource-url">URL</Label>
                                                <Input
                                                    id="resource-url"
                                                    value={newResourceUrl}
                                                    onChange={(e) => setNewResourceUrl(e.target.value)}
                                                    placeholder="https://..."
                                                />
                                            </div>
                                            <div>
                                                <Label htmlFor="resource-description">Description</Label>
                                                <Textarea
                                                    id="resource-description"
                                                    value={newResourceDescription}
                                                    onChange={(e) => setNewResourceDescription(e.target.value)}
                                                    placeholder="What is this resource about?"
                                                    className="min-h-[100px]"
                                                />
                                            </div>
                                            <Button
                                                onClick={handleCreateResource}
                                                disabled={!newResourceTitle.trim()}
                                                className="w-full"
                                            >
                                                Share Resource
                                            </Button>
                                        </div>
                                    </DialogContent>
                                </Dialog>
                            )}
                        </div>

                        {/* Search and filter */}
                        <div className="flex gap-4">
                            <div className="flex-1 relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <Input
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search..."
                                    className="pl-10"
                                />
                            </div>
                            {allTags.length > 0 && (
                                <Select value={filterTag} onValueChange={setFilterTag}>
                                    <SelectTrigger className="w-48">
                                        <SelectValue placeholder="Filter by tag" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Tags</SelectItem>
                                        {allTags.map(tag => (
                                            <SelectItem key={tag} value={tag}>
                                                {tag}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                        </div>

                        {/* Content */}
                        {view === 'threads' ? (
                            <div className="space-y-4">
                                <AnimatePresence>
                                    {filteredThreads.map((thread, index) => (
                                        <motion.div
                                            key={thread.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                            transition={{ delay: index * 0.03 }}
                                            className="p-4 border border-gray-200 dark:border-gray-800 rounded-lg hover:border-gray-300 dark:hover:border-gray-700 transition-colors cursor-pointer"
                                            onClick={() => handleOpenThread(thread.id)}
                                        >
                                            <div className="flex items-start gap-4">
                                                <div className="flex flex-col items-center gap-1 min-w-[60px]">
                                                    <span className="text-2xl font-light text-gray-900 dark:text-white">
                                                        {thread.post_count || 0}
                                                    </span>
                                                    <span className="text-xs text-gray-500 dark:text-gray-400">replies</span>
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        {thread.is_pinned && (
                                                            <Pin className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                                                        )}
                                                        {thread.is_resolved && (
                                                            <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                                                        )}
                                                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">{thread.title}</h3>
                                                    </div>
                                                    <p className="text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">
                                                        {thread.content}
                                                    </p>
                                                    <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                                                        <span>{thread.user_name}</span>
                                                        <span>•</span>
                                                        <span>{thread.created_at ? new Date(thread.created_at).toLocaleDateString() : 'N/A'}</span>
                                                        <span>•</span>
                                                        <span className="flex items-center gap-1">
                                                            <Eye className="w-3 h-3" />
                                                            {thread.view_count || 0}
                                                        </span>
                                                    </div>
                                                    {thread.tags.length > 0 && (
                                                        <div className="flex gap-2 mt-2">
                                                            {thread.tags.map(tag => (
                                                                <span
                                                                    key={tag}
                                                                    className="px-2 py-1 bg-gray-50 dark:bg-gray-900 text-gray-600 dark:text-gray-400 rounded text-xs"
                                                                >
                                                                    {tag}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>

                                {filteredThreads.length === 0 && (
                                    <div className="py-12 text-center border border-gray-200 dark:border-gray-800 rounded-lg">
                                        <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                                        <p className="text-gray-600 dark:text-gray-400">
                                            {currentBoard?.is_member
                                                ? 'No threads yet. Start a discussion!'
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
                                            className="p-4 border border-gray-200 dark:border-gray-800 rounded-lg hover:border-gray-300 dark:hover:border-gray-700 transition-colors"
                                        >
                                            <div className="flex items-start justify-between mb-3">
                                                <div className="flex items-center gap-2">
                                                    {getResourceIcon(resource.resource_type)}
                                                    <h3 className="font-medium text-gray-900 dark:text-white line-clamp-1">{resource.title}</h3>
                                                </div>
                                                {resource.user_id === user?.id && (
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => deleteResource(resource.id)}
                                                    >
                                                        <Trash2 className="w-4 h-4 text-red-600" />
                                                    </Button>
                                                )}
                                            </div>
                                            {resource.description && (
                                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                                                    {resource.description}
                                                </p>
                                            )}
                                            {resource.url && (
                                                <a
                                                    href={resource.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-sm text-blue-600 dark:text-blue-400 hover:underline mb-3 block truncate"
                                                >
                                                    {resource.url}
                                                </a>
                                            )}
                                            {resource.tags.length > 0 && (
                                                <div className="flex gap-1 flex-wrap mb-3">
                                                    {resource.tags.map(tag => (
                                                        <span
                                                            key={tag}
                                                            className="px-2 py-0.5 bg-gray-50 dark:bg-gray-900 text-gray-600 dark:text-gray-400 rounded text-xs"
                                                        >
                                                            {tag}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                            <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                                                <span>{resource.user_name}</span>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => toggleResourceUpvote(resource.id)}
                                                    className={resource.user_upvoted ? 'text-gray-900 dark:text-white' : ''}
                                                >
                                                    <ThumbsUp className="w-4 h-4 mr-1" />
                                                    {resource.upvotes}
                                                </Button>
                                            </div>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>

                                {filteredResources.length === 0 && (
                                    <div className="col-span-full py-12 text-center border border-gray-200 dark:border-gray-800 rounded-lg">
                                        <FileText className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                                        <p className="text-gray-600 dark:text-gray-400">
                                            {currentBoard?.is_member
                                                ? 'No resources yet. Share something helpful!'
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
