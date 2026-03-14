'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase/client';
import { getPlanTier, TIER_LIMITS } from '@/lib/planTier';

export type ResourceType = 'link' | 'file' | 'video' | 'document' | 'other';

export interface DiscussionBoard {
    id: string;
    name: string;
    description: string | null;
    created_by: string;
    member_count?: number;
    thread_count?: number;
    created_at: string | null;
    updated_at: string | null;
    creator_name?: string;
    is_member?: boolean;
}

export interface DiscussionThread {
    id: string;
    board_id: string;
    user_id: string;
    title: string;
    content: string;
    is_pinned: boolean;
    is_resolved: boolean;
    tags: string[];
    view_count: number;
    created_at: string | null;
    updated_at: string | null;
    user_name?: string;
    post_count?: number;
}

export interface DiscussionPost {
    id: string;
    thread_id: string;
    user_id: string;
    content: string;
    is_answer: boolean;
    upvotes: number;
    created_at: string | null;
    updated_at: string | null;
    user_name?: string;
    user_upvoted?: boolean;
}

export interface DiscussionResource {
    id: string;
    board_id: string;
    user_id: string;
    title: string;
    description: string | null;
    resource_type: ResourceType;
    url: string | null;
    file_path: string | null;
    tags: string[];
    upvotes: number;
    created_at: string | null;
    updated_at: string | null;
    user_name?: string;
    user_upvoted?: boolean;
}

interface DiscussionBoardsContextType {
    boards: DiscussionBoard[];
    threads: DiscussionThread[];
    posts: DiscussionPost[];
    resources: DiscussionResource[];
    currentBoard: DiscussionBoard | null;
    currentThread: DiscussionThread | null;
    loading: boolean;
    error: string | null;

    // Board operations
    createBoard: (name: string, description?: string) => Promise<DiscussionBoard>;
    deleteBoard: (boardId: string) => Promise<void>;
    joinBoard: (boardId: string) => Promise<void>;
    leaveBoard: (boardId: string) => Promise<void>;
    setCurrentBoard: (board: DiscussionBoard | null) => void;
    fetchAllBoards: () => Promise<void>;

    // Thread operations
    createThread: (boardId: string, title: string, content: string, tags?: string[]) => Promise<void>;
    updateThread: (threadId: string, updates: Partial<DiscussionThread>) => Promise<void>;
    deleteThread: (threadId: string) => Promise<void>;
    toggleThreadPin: (threadId: string) => Promise<void>;
    toggleThreadResolved: (threadId: string) => Promise<void>;
    incrementThreadViews: (threadId: string) => Promise<void>;
    setCurrentThread: (thread: DiscussionThread | null) => void;

    // Post operations
    createPost: (threadId: string, content: string, isAnswer?: boolean) => Promise<void>;
    updatePost: (postId: string, content: string) => Promise<void>;
    deletePost: (postId: string) => Promise<void>;
    togglePostUpvote: (postId: string) => Promise<void>;
    markAsAnswer: (postId: string) => Promise<void>;

    // Resource operations
    createResource: (
        boardId: string,
        title: string,
        resourceType: ResourceType,
        url?: string,
        description?: string,
        tags?: string[]
    ) => Promise<void>;
    updateResource: (resourceId: string, updates: Partial<DiscussionResource>) => Promise<void>;
    deleteResource: (resourceId: string) => Promise<void>;
    toggleResourceUpvote: (resourceId: string) => Promise<void>;

    // Fetch operations
    fetchThreadsByBoard: (boardId: string) => Promise<void>;
    fetchPostsByThread: (threadId: string) => Promise<void>;
    fetchResourcesByBoard: (boardId: string) => Promise<void>;
    refreshAll: () => Promise<void>;
}

const DiscussionBoardsContext = createContext<DiscussionBoardsContextType | undefined>(undefined);

export function DiscussionBoardsProvider({ children }: { children: React.ReactNode }) {
    const { user, full_name } = useAuth();
    const [boards, setBoards] = useState<DiscussionBoard[]>([]);
    const [threads, setThreads] = useState<DiscussionThread[]>([]);
    const [posts, setPosts] = useState<DiscussionPost[]>([]);
    const [resources, setResources] = useState<DiscussionResource[]>([]);
    const [currentBoard, setCurrentBoard] = useState<DiscussionBoard | null>(null);
    const [currentThread, setCurrentThread] = useState<DiscussionThread | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Fetch all public boards
    const fetchAllBoards = useCallback(async () => {
        try {
            setLoading(true);
            const { data: boardsData, error: boardsError } = await supabase
                .from('discussion_boards')
                .select('*')
                .order('created_at', { ascending: false });

            if (boardsError) throw boardsError;

            // Fetch creator names
            const creatorIds = [...new Set(boardsData?.map(b => b.created_by) || [])];
            const { data: profiles } = await supabase
                .from('profiles')
                .select('id, full_name')
                .in('id', creatorIds);

            const profileMap = new Map(profiles?.map(p => [p.id, p.full_name]) || []);

            // Fetch user's memberships if logged in
            let membershipMap = new Map<string, boolean>();
            if (user) {
                const { data: memberships } = await supabase
                    .from('discussion_board_members')
                    .select('board_id')
                    .eq('user_id', user.id);

                membershipMap = new Set(memberships?.map(m => m.board_id) || []) as any;
            }

            const formattedBoards = (boardsData || []).map(board => ({
                ...board,
                member_count: board.member_count ?? undefined,
                thread_count: board.thread_count ?? undefined,
                creator_name: profileMap.get(board.created_by) || 'Unknown User',
                is_member: user ? membershipMap.has(board.id) : false,
            }));

            setBoards(formattedBoards);
        } catch (err: any) {
            console.error('Error fetching boards:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [user]);

    // Create a new public board
    const createBoard = async (name: string, description?: string): Promise<DiscussionBoard> => {
        if (!user) throw new Error('User not authenticated');

        // ─── Plan tier: only Pro+ can create boards ──────────────────────
        const tier = getPlanTier();
        const limits = TIER_LIMITS[tier];
        if (!limits.canCreateBoards) {
            throw new Error('PLAN_LIMIT:Creating discussion boards is a Pro feature — upgrade to start your own board.');
        }

        const { data, error } = await supabase
            .from('discussion_boards')
            .insert([{
                name,
                description: description || null,
                created_by: user.id,
            }])
            .select()
            .single();

        if (error) throw error;

        // Automatically join the board as creator
        await joinBoard(data.id);

        await fetchAllBoards();
        return {
            ...data,
            member_count: data.member_count ?? undefined,
            thread_count: data.thread_count ?? undefined,
        };
    };

    // Join a board
    const joinBoard = async (boardId: string) => {
        if (!user) throw new Error('User not authenticated');

        // ─── Plan tier: limit how many boards free users can join ─────────
        const tier = getPlanTier();
        const limits = TIER_LIMITS[tier];
        if (limits.discussionBoardsJoin !== Infinity) {
            const joinedCount = boards.filter(b => b.is_member).length;
            if (joinedCount >= limits.discussionBoardsJoin) {
                throw new Error(`PLAN_LIMIT:The free plan lets you join up to ${limits.discussionBoardsJoin} boards — upgrade to Pro for unlimited.`);
            }
        }

        const { error } = await supabase
            .from('discussion_board_members')
            .insert([{
                board_id: boardId,
                user_id: user.id,
            }]);

        if (error) throw error;
        await fetchAllBoards();
    };

    // Leave a board
    const leaveBoard = async (boardId: string) => {
        if (!user) throw new Error('User not authenticated');

        const { error } = await supabase
            .from('discussion_board_members')
            .delete()
            .eq('board_id', boardId)
            .eq('user_id', user.id);

        if (error) throw error;

        // If leaving the current board, clear it
        if (currentBoard?.id === boardId) {
            setCurrentBoard(null);
        }

        await fetchAllBoards();
    };

    // Delete a board and all associated data
    const deleteBoard = async (boardId: string) => {
        if (!user) throw new Error('User not authenticated');

        // 1. Get all threads for this board to delete their posts
        const { data: boardThreads } = await supabase
            .from('discussion_threads')
            .select('id')
            .eq('board_id', boardId);

        const threadIds = boardThreads?.map(t => t.id) || [];

        // 2. Delete all posts and their upvotes for these threads
        if (threadIds.length > 0) {
            // Delete post upvotes
            const { data: threadPosts } = await supabase
                .from('discussion_posts')
                .select('id')
                .in('thread_id', threadIds);

            const postIds = threadPosts?.map(p => p.id) || [];
            if (postIds.length > 0) {
                await supabase
                    .from('discussion_post_upvotes')
                    .delete()
                    .in('post_id', postIds);
            }

            // Delete posts
            await supabase
                .from('discussion_posts')
                .delete()
                .in('thread_id', threadIds);
        }

        // 3. Delete threads
        await supabase
            .from('discussion_threads')
            .delete()
            .eq('board_id', boardId);

        // 4. Delete resource upvotes and resources
        const { data: boardResources } = await supabase
            .from('discussion_resources')
            .select('id')
            .eq('board_id', boardId);

        const resourceIds = boardResources?.map(r => r.id) || [];
        if (resourceIds.length > 0) {
            await supabase
                .from('discussion_resource_upvotes')
                .delete()
                .in('resource_id', resourceIds);
        }

        await supabase
            .from('discussion_resources')
            .delete()
            .eq('board_id', boardId);

        // 5. Delete members
        await supabase
            .from('discussion_board_members')
            .delete()
            .eq('board_id', boardId);

        // 6. Delete the board itself
        const { error } = await supabase
            .from('discussion_boards')
            .delete()
            .eq('id', boardId);

        if (error) throw error;

        // Clear current board if it was the deleted one
        if (currentBoard?.id === boardId) {
            setCurrentBoard(null);
            setCurrentThread(null);
        }

        await fetchAllBoards();
    };

    // Fetch threads for a board
    const fetchThreadsByBoard = useCallback(async (boardId: string) => {
        try {
            setLoading(true);

            // Fetch threads with post counts
            const { data: threadsData, error: threadsError } = await supabase
                .from('discussion_threads')
                .select(`
          *,
          discussion_posts(count)
        `)
                .eq('board_id', boardId)
                .order('is_pinned', { ascending: false })
                .order('created_at', { ascending: false });

            if (threadsError) throw threadsError;

            // Fetch user names for threads
            const userIds = [...new Set(threadsData?.map(t => t.user_id) || [])];
            const { data: profiles } = await supabase
                .from('profiles')
                .select('id, full_name')
                .in('id', userIds);

            const profileMap = new Map(profiles?.map(p => [p.id, p.full_name]) || []);

            const formattedThreads = (threadsData || []).map(thread => ({
                ...thread,
                is_pinned: thread.is_pinned ?? false,
                is_resolved: thread.is_resolved ?? false,
                tags: thread.tags ?? [],
                view_count: thread.view_count ?? 0,
                user_name: profileMap.get(thread.user_id) || 'Unknown User',
                post_count: Array.isArray(thread.discussion_posts) && thread.discussion_posts[0]?.count
                    ? thread.discussion_posts[0].count
                    : 0,
            }));

            setThreads(formattedThreads);
        } catch (err: any) {
            console.error('Error fetching threads:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    // Fetch posts for a thread
    const fetchPostsByThread = useCallback(async (threadId: string) => {
        if (!user) return;

        try {
            setLoading(true);

            // Fetch posts
            const { data: postsData, error: postsError } = await supabase
                .from('discussion_posts')
                .select('*')
                .eq('thread_id', threadId)
                .order('created_at', { ascending: true });

            if (postsError) throw postsError;

            // Fetch user names
            const userIds = [...new Set(postsData?.map(p => p.user_id) || [])];
            const { data: profiles } = await supabase
                .from('profiles')
                .select('id, full_name')
                .in('id', userIds);

            const profileMap = new Map(profiles?.map(p => [p.id, p.full_name]) || []);

            // Fetch user's upvotes
            const postIds = postsData?.map(p => p.id) || [];
            const { data: upvotes } = await supabase
                .from('discussion_post_upvotes')
                .select('post_id')
                .eq('user_id', user.id)
                .in('post_id', postIds);

            const upvotedPostIds = new Set(upvotes?.map(u => u.post_id) || []);

            const formattedPosts = (postsData || []).map(post => ({
                ...post,
                is_answer: post.is_answer ?? false,
                upvotes: post.upvotes ?? 0,
                user_name: profileMap.get(post.user_id) || 'Unknown User',
                user_upvoted: upvotedPostIds.has(post.id),
            }));

            setPosts(formattedPosts);
        } catch (err: any) {
            console.error('Error fetching posts:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [user]);

    // Fetch resources for a board
    const fetchResourcesByBoard = useCallback(async (boardId: string) => {
        if (!user) return;

        try {
            setLoading(true);

            // Fetch resources
            const { data: resourcesData, error: resourcesError } = await supabase
                .from('discussion_resources')
                .select('*')
                .eq('board_id', boardId)
                .order('created_at', { ascending: false });

            if (resourcesError) throw resourcesError;

            // Fetch user names
            const userIds = [...new Set(resourcesData?.map(r => r.user_id) || [])];
            const { data: profiles } = await supabase
                .from('profiles')
                .select('id, full_name')
                .in('id', userIds);

            const profileMap = new Map(profiles?.map(p => [p.id, p.full_name]) || []);

            // Fetch user's upvotes
            const resourceIds = resourcesData?.map(r => r.id) || [];
            const { data: upvotes } = await supabase
                .from('discussion_resource_upvotes')
                .select('resource_id')
                .eq('user_id', user.id)
                .in('resource_id', resourceIds);

            const upvotedResourceIds = new Set(upvotes?.map(u => u.resource_id) || []);

            const formattedResources = (resourcesData || []).map(resource => ({
                ...resource,
                resource_type: resource.resource_type as ResourceType,
                tags: resource.tags ?? [],
                upvotes: resource.upvotes ?? 0,
                user_name: profileMap.get(resource.user_id) || 'Unknown User',
                user_upvoted: upvotedResourceIds.has(resource.id),
            }));

            setResources(formattedResources);
        } catch (err: any) {
            console.error('Error fetching resources:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [user]);

    // Create a new thread
    const createThread = async (boardId: string, title: string, content: string, tags: string[] = []) => {
        if (!user) throw new Error('User not authenticated');

        // ─── Plan tier: limit threads (posts) per day ────────────────────
        const tier = getPlanTier();
        const limits = TIER_LIMITS[tier];
        if (limits.discussionPostsPerDay !== Infinity) {
            const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);
            const { count } = await supabase
                .from('discussion_threads')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', user.id)
                .gte('created_at', todayStart.toISOString());
            if ((count ?? 0) >= limits.discussionPostsPerDay) {
                throw new Error(`PLAN_LIMIT:The free plan includes ${limits.discussionPostsPerDay} threads per day — upgrade to Pro for unlimited.`);
            }
        }

        const { error } = await supabase
            .from('discussion_threads')
            .insert([{
                board_id: boardId,
                user_id: user.id,
                title,
                content,
                tags,
            }]);

        if (error) throw error;
        await fetchThreadsByBoard(boardId);
    };

    // Update thread
    const updateThread = async (threadId: string, updates: Partial<DiscussionThread>) => {
        const { error } = await supabase
            .from('discussion_threads')
            .update(updates)
            .eq('id', threadId);

        if (error) throw error;
        if (currentBoard) await fetchThreadsByBoard(currentBoard.id);
    };

    // Delete thread
    const deleteThread = async (threadId: string) => {
        const { error } = await supabase
            .from('discussion_threads')
            .delete()
            .eq('id', threadId);

        if (error) throw error;
        if (currentBoard) await fetchThreadsByBoard(currentBoard.id);
    };

    // Toggle thread pin
    const toggleThreadPin = async (threadId: string) => {
        const thread = threads.find(t => t.id === threadId);
        if (!thread) return;

        await updateThread(threadId, { is_pinned: !thread.is_pinned });
    };

    // Toggle thread resolved
    const toggleThreadResolved = async (threadId: string) => {
        const thread = threads.find(t => t.id === threadId);
        if (!thread) return;

        await updateThread(threadId, { is_resolved: !thread.is_resolved });
    };

    // Increment thread views
    const incrementThreadViews = async (threadId: string) => {
        const thread = threads.find(t => t.id === threadId);
        if (!thread) return;

        await supabase
            .from('discussion_threads')
            .update({ view_count: thread.view_count + 1 })
            .eq('id', threadId);
    };

    // Create a new post (reply)
    const createPost = async (threadId: string, content: string, isAnswer: boolean = false) => {
        if (!user) throw new Error('User not authenticated');

        // ─── Plan tier: limit replies per day ────────────────────────────
        const tier = getPlanTier();
        const limits = TIER_LIMITS[tier];
        if (limits.discussionRepliesPerDay !== Infinity) {
            const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);
            const { count } = await supabase
                .from('discussion_posts')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', user.id)
                .gte('created_at', todayStart.toISOString());
            if ((count ?? 0) >= limits.discussionRepliesPerDay) {
                throw new Error(`PLAN_LIMIT:The free plan includes ${limits.discussionRepliesPerDay} replies per day — upgrade to Pro for unlimited.`);
            }
        }

        const { error } = await supabase
            .from('discussion_posts')
            .insert([{
                thread_id: threadId,
                user_id: user.id,
                content,
                is_answer: isAnswer,
            }]);

        if (error) throw error;
        await fetchPostsByThread(threadId);
    };

    // Update post
    const updatePost = async (postId: string, content: string) => {
        const { error } = await supabase
            .from('discussion_posts')
            .update({ content })
            .eq('id', postId);

        if (error) throw error;
        if (currentThread) await fetchPostsByThread(currentThread.id);
    };

    // Delete post
    const deletePost = async (postId: string) => {
        const { error } = await supabase
            .from('discussion_posts')
            .delete()
            .eq('id', postId);

        if (error) throw error;
        if (currentThread) await fetchPostsByThread(currentThread.id);
    };

    // Toggle post upvote
    const togglePostUpvote = async (postId: string) => {
        if (!user) throw new Error('User not authenticated');

        const post = posts.find(p => p.id === postId);
        if (!post) return;

        if (post.user_upvoted) {
            // Remove upvote
            await supabase
                .from('discussion_post_upvotes')
                .delete()
                .eq('post_id', postId)
                .eq('user_id', user.id);

            await supabase
                .from('discussion_posts')
                .update({ upvotes: Math.max(0, post.upvotes - 1) })
                .eq('id', postId);
        } else {
            // Add upvote
            await supabase
                .from('discussion_post_upvotes')
                .insert([{ post_id: postId, user_id: user.id }]);

            await supabase
                .from('discussion_posts')
                .update({ upvotes: post.upvotes + 1 })
                .eq('id', postId);
        }

        if (currentThread) await fetchPostsByThread(currentThread.id);
    };

    // Mark post as answer
    const markAsAnswer = async (postId: string) => {
        if (!currentThread) return;

        // First, unmark all other posts as answers
        await supabase
            .from('discussion_posts')
            .update({ is_answer: false })
            .eq('thread_id', currentThread.id);

        // Then mark this post as the answer
        await supabase
            .from('discussion_posts')
            .update({ is_answer: true })
            .eq('id', postId);

        await fetchPostsByThread(currentThread.id);
    };

    // Create a new resource
    const createResource = async (
        boardId: string,
        title: string,
        resourceType: ResourceType,
        url?: string,
        description?: string,
        tags: string[] = []
    ) => {
        if (!user) throw new Error('User not authenticated');

        // ─── Plan tier: sharing resources is Pro+ only ───────────────────
        const tier = getPlanTier();
        const limits = TIER_LIMITS[tier];
        if (!limits.canCreateBoards) {
            // canCreateBoards doubles as the "share resources" gate
            throw new Error('PLAN_LIMIT:Sharing resources in discussion boards is a Pro feature — upgrade to unlock.');
        }

        const { error } = await supabase
            .from('discussion_resources')
            .insert([{
                board_id: boardId,
                user_id: user.id,
                title,
                resource_type: resourceType,
                url: url || null,
                description: description || null,
                tags,
            }]);

        if (error) throw error;
        await fetchResourcesByBoard(boardId);
    };

    // Update resource
    const updateResource = async (resourceId: string, updates: Partial<DiscussionResource>) => {
        const { error } = await supabase
            .from('discussion_resources')
            .update(updates)
            .eq('id', resourceId);

        if (error) throw error;
        if (currentBoard) await fetchResourcesByBoard(currentBoard.id);
    };

    // Delete resource
    const deleteResource = async (resourceId: string) => {
        const { error } = await supabase
            .from('discussion_resources')
            .delete()
            .eq('id', resourceId);

        if (error) throw error;
        if (currentBoard) await fetchResourcesByBoard(currentBoard.id);
    };

    // Toggle resource upvote
    const toggleResourceUpvote = async (resourceId: string) => {
        if (!user) throw new Error('User not authenticated');

        const resource = resources.find(r => r.id === resourceId);
        if (!resource) return;

        if (resource.user_upvoted) {
            // Remove upvote
            await supabase
                .from('discussion_resource_upvotes')
                .delete()
                .eq('resource_id', resourceId)
                .eq('user_id', user.id);

            await supabase
                .from('discussion_resources')
                .update({ upvotes: Math.max(0, resource.upvotes - 1) })
                .eq('id', resourceId);
        } else {
            // Add upvote
            await supabase
                .from('discussion_resource_upvotes')
                .insert([{ resource_id: resourceId, user_id: user.id }]);

            await supabase
                .from('discussion_resources')
                .update({ upvotes: resource.upvotes + 1 })
                .eq('id', resourceId);
        }

        if (currentBoard) await fetchResourcesByBoard(currentBoard.id);
    };

    // Refresh all data
    const refreshAll = async () => {
        await fetchAllBoards();
        if (currentBoard) {
            await fetchThreadsByBoard(currentBoard.id);
            await fetchResourcesByBoard(currentBoard.id);
        }
        if (currentThread) {
            await fetchPostsByThread(currentThread.id);
        }
    };

    // Load boards on mount
    useEffect(() => {
        fetchAllBoards();
    }, [fetchAllBoards]);

    // Set up real-time subscriptions
    useEffect(() => {
        if (!currentBoard?.id) return;

        const channel = supabase
            .channel(`discussion-board-${currentBoard.id}`)
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'discussion_threads',
                filter: `board_id=eq.${currentBoard.id}`,
            }, () => {
                fetchThreadsByBoard(currentBoard.id);
            })
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'discussion_resources',
                filter: `board_id=eq.${currentBoard.id}`,
            }, () => {
                fetchResourcesByBoard(currentBoard.id);
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [currentBoard?.id, fetchThreadsByBoard, fetchResourcesByBoard]);

    // Set up real-time subscriptions for posts
    useEffect(() => {
        if (!currentThread?.id) return;

        const channel = supabase
            .channel(`discussion-thread-${currentThread.id}`)
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'discussion_posts',
                filter: `thread_id=eq.${currentThread.id}`,
            }, () => {
                fetchPostsByThread(currentThread.id);
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [currentThread?.id, fetchPostsByThread]);

    return (
        <DiscussionBoardsContext.Provider
            value={{
                boards,
                threads,
                posts,
                resources,
                currentBoard,
                currentThread,
                loading,
                error,
                createBoard,
                deleteBoard,
                joinBoard,
                leaveBoard,
                setCurrentBoard,
                fetchAllBoards,
                createThread,
                updateThread,
                deleteThread,
                toggleThreadPin,
                toggleThreadResolved,
                incrementThreadViews,
                setCurrentThread,
                createPost,
                updatePost,
                deletePost,
                togglePostUpvote,
                markAsAnswer,
                createResource,
                updateResource,
                deleteResource,
                toggleResourceUpvote,
                fetchThreadsByBoard,
                fetchPostsByThread,
                fetchResourcesByBoard,
                refreshAll,
            }}
        >
            {children}
        </DiscussionBoardsContext.Provider>
    );
}

export function useDiscussionBoards() {
    const context = useContext(DiscussionBoardsContext);
    if (context === undefined) {
        throw new Error('useDiscussionBoards must be used within a DiscussionBoardsProvider');
    }
    return context;
}
