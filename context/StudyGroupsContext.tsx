'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase/client';
import { Database } from '@/types/database.types';
import { checkSchoolTimeWarning } from '@/lib/school-schedule';

type StudyGroup = Database['public']['Tables']['study_groups']['Row'] & {
  member_count?: number;
  unread_count?: number;
  messagesCount?: number; // Add messagesCount property to match the UI
};

type GroupMessage = Database['public']['Tables']['group_messages']['Row'] & {
  profiles?: {
    full_name: string;
    avatar_url?: string;
  };
};

type GroupLink = Database['public']['Tables']['group_links']['Row'] & {
  profiles?: {
    full_name: string;
    avatar_url?: string;
  };
};

interface StudyGroupsContextType {
  groups: StudyGroup[];
  currentGroup: StudyGroup | null;
  messages: GroupMessage[];
  links: GroupLink[];
  loading: boolean;
  error: string | null;
  connectionStatus: 'connected' | 'connecting' | 'disconnected';
  schoolWarning: { showWarning: boolean; message: string } | null;
  createGroup: (name: string, classId?: string) => Promise<void>;
  joinGroup: (groupId: string) => Promise<void>;
  leaveGroup: (groupId: string) => Promise<void>;
  sendMessage: (groupId: string, content: string) => Promise<void>;
  addLink: (groupId: string, url: string, title?: string) => Promise<void>;
  setCurrentGroup: (group: StudyGroup | null) => void;
  refreshGroups: () => Promise<void>;
  dismissSchoolWarning: () => void;
}

const StudyGroupsContext = createContext<StudyGroupsContextType | undefined>(undefined);

export function StudyGroupsProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [groups, setGroups] = useState<StudyGroup[]>([]);
  const [currentGroup, setCurrentGroup] = useState<StudyGroup | null>(null);
  const [messages, setMessages] = useState<GroupMessage[]>([]);
  const [links, setLinks] = useState<GroupLink[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'connecting' | 'disconnected'>('disconnected');
  const [retryCount, setRetryCount] = useState(0);
  const [schoolWarning, setSchoolWarning] = useState<{ showWarning: boolean; message: string } | null>(null);

  // Fetch user's groups
  const fetchGroups = useCallback(async () => {
    if (!user) {
      setGroups([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      console.log('Fetching study group memberships for user:', user.id);
      
      // First, get all groups the user is a member of
      const { data: memberships, error: membershipsError, status } = await supabase
        .from('study_group_members')
        .select('group_id')
        .eq('user_id', user.id);

      console.log('Memberships query status:', status);
      console.log('Memberships data:', memberships);
      
      if (membershipsError) {
        console.error('Error fetching memberships:', membershipsError);
        throw new Error(`Memberships error: ${membershipsError.message}`);
      }
      
      if (!memberships || memberships.length === 0) {
        console.log('No memberships found for user');
        setGroups([]);
        return;
      }

      // Get the group IDs
      const groupIds = memberships.map(m => m.group_id);
      console.log('Found group IDs:', groupIds);
      
      if (groupIds.length === 0) {
        console.log('No group IDs to fetch');
        setGroups([]);
        return;
      }
      
      // Fetch the groups with member counts
      console.log('Fetching groups with IDs:', groupIds);
      const { data: groupsData, error: groupsError } = await supabase
        .from('study_groups')
        .select(`
          *,
          study_group_members(count),
          group_messages(count)
        `)
        .in('id', groupIds);
        
      if (groupsError) {
        console.error('Error fetching groups:', groupsError);
        throw new Error(`Groups error: ${groupsError.message}`);
      }

      console.log('Fetched groups data:', groupsData);

      // Format the groups data
      const formattedGroups = (groupsData || []).map(group => {
        const memberCount = Array.isArray(group.study_group_members) && group.study_group_members[0]?.count 
          ? group.study_group_members[0].count 
          : 0;
          
        const messagesCount = Array.isArray(group.group_messages) && group.group_messages[0]?.count 
          ? group.group_messages[0].count 
          : 0;
          
        return {
          ...group,
          member_count: memberCount,
          unread_count: 0, // You can implement unread count logic later
          messages_count: messagesCount
        };
      });

      console.log('Formatted groups:', formattedGroups);
      setGroups(formattedGroups);
    } catch (err: any) {
      const errorMessage = err?.message || 'Failed to load study groups. Please try again.';
      console.error('Error in fetchGroups:', {
        error: err,
        message: errorMessage,
        stack: err?.stack
      });
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Fetch group messages
  const fetchMessages = useCallback(async (groupId: string) => {
    if (!groupId) return;
    
    try {
      setLoading(true);
      
      // Fetch all messages for this group with the full_name directly from group_messages
      const { data: messages, error: messagesError } = await supabase
        .from('group_messages')
        .select('*')
        .eq('group_id', groupId)
        .order('created_at', { ascending: true });

      if (messagesError) throw messagesError;
      if (!messages || messages.length === 0) {
        setMessages([]);
        return;
      }

      // Process messages with the full_name directly from the message
      const processedMessages = messages.map(msg => {
        const isCurrentUser = msg.user_id === user?.id;
        
        return {
          ...msg,
          profiles: {
            full_name: isCurrentUser && msg.full_name === 'User' 
              ? 'You' 
              : msg.full_name || 'User',
            email: '',
            avatar_url: ''
          }
        };
      });
      
      setMessages(processedMessages);
    } catch (err) {
      console.error('Error fetching messages:', err);
      setError('Failed to load messages');
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Fetch group links
  const fetchLinks = useCallback(async (groupId: string) => {
    if (!groupId) return;
    
    try {
      // Fetch links with the full_name directly from group_links
      const { data, error } = await supabase
        .from('group_links')
        .select('*')
        .eq('group_id', groupId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Process links to match the expected format with profiles
      const processedLinks = data.map(link => ({
        ...link,
        profiles: {
          full_name: link.full_name || 'User',
          avatar_url: ''
        }
      }));
      
      setLinks(processedLinks || []);
    } catch (err) {
      console.error('Error fetching links:', err);
      setError('Failed to load links');
    }
  }, []);

  // Create a new group
  const createGroup = async (name: string, classId?: string) => {
    if (!user) throw new Error('User not authenticated');
    
    try {
      const { data: group, error } = await supabase
        .from('study_groups')
        .insert([{ 
          name, 
          class_id: classId || null,
          created_by: user.id 
        }])
        .select()
        .single();

      if (error) throw error;

      // Add creator as a member
      await supabase
        .from('study_group_members')
        .insert([{ 
          group_id: group.id, 
          user_id: user.id 
        }]);

      await fetchGroups();
      return group;
    } catch (err) {
      console.error('Error creating group:', err);
      throw new Error('Failed to create group');
    }
  };

  // Join a group
  const joinGroup = async (groupId: string) => {
    if (!user) throw new Error('User not authenticated');
    
    try {
      const { error } = await supabase
        .from('study_group_members')
        .insert([{ 
          group_id: groupId, 
          user_id: user.id 
        }]);

      if (error) throw error;
      
      await fetchGroups();
    } catch (err) {
      console.error('Error joining group:', err);
      throw new Error('Failed to join group');
    }
  };

  // Leave a group
  const leaveGroup = async (groupId: string) => {
    if (!user) throw new Error('User not authenticated');
    
    try {
      const { error } = await supabase
        .from('study_group_members')
        .delete()
        .eq('group_id', groupId)
        .eq('user_id', user.id);

      if (error) throw error;
      
      // If current group is the one we're leaving, clear it
      if (currentGroup?.id === groupId) {
        setCurrentGroup(null);
      }
      
      await fetchGroups();
    } catch (err) {
      console.error('Error leaving group:', err);
      throw new Error('Failed to leave group');
    }
  };

  // Send a message to a group
  const sendMessage = async (groupId: string, content: string) => {
    if (!user) throw new Error('User not authenticated');
    
    try {
      // First, get the user's full name from their profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user.id)
        .single();
      
      if (profileError) {
        console.error('Error fetching user profile:', profileError);
        throw new Error('Failed to load user profile');
      }
      
      const { error } = await supabase
        .from('group_messages')
        .insert([{
          group_id: groupId,
          user_id: user.id,
          content,
          full_name: profile?.full_name || 'User' // Fallback to 'User' if full_name is not available
        }]);

      if (error) throw error;
      
      // Refresh messages
      await fetchMessages(groupId);
    } catch (err) {
      console.error('Error sending message:', err);
      throw new Error('Failed to send message');
    }
  };

  // Add a link to a group
  const addLink = async (groupId: string, url: string, title?: string) => {
    if (!user) throw new Error('User not authenticated');
    
    try {
      // If no title provided, try to fetch it
      let linkTitle = title;
      if (!linkTitle) {
        try {
          const response = await fetch(`/api/link-preview?url=${encodeURIComponent(url)}`);
          const data = await response.json();
          linkTitle = data.title || new URL(url).hostname;
        } catch (e) {
          linkTitle = new URL(url).hostname;
        }
      }

      // Get the user's full name from their profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user.id)
        .single();
      
      if (profileError) {
        console.error('Error fetching user profile:', profileError);
        throw new Error('Failed to load user profile');
      }

      const { error } = await supabase
        .from('group_links')
        .insert([{
          group_id: groupId,
          url,
          title: linkTitle,
          user_id: user.id,
          full_name: profile?.full_name || 'User' // Fallback to 'User' if full_name is not available
        }]);

      if (error) throw error;
      
      // Refresh links
      await fetchLinks(groupId);
    } catch (err) {
      console.error('Error adding link:', err);
      throw new Error('Failed to add link');
    }
  };

  // Set up real-time subscriptions with retry logic
  useEffect(() => {
    if (!currentGroup?.id || !user) {
      setConnectionStatus('disconnected');
      return;
    }

    let retryTimeout: NodeJS.Timeout;
    let messageSubscription: any;
    let linkSubscription: any;

    const setupSubscription = async (attempt: number = 0) => {
      try {
        setConnectionStatus('connecting');
        console.log(`Setting up real-time subscription for group ${currentGroup.id} (user: ${user.id}), attempt ${attempt + 1}`);

        // Create unique channel names to avoid conflicts
        const messageChannel = `group_messages_${currentGroup.id}_${user.id}_${Date.now()}`;
        const linkChannel = `group_links_${currentGroup.id}_${user.id}_${Date.now()}`;

        // Subscribe to new messages - filter by group_id only
        messageSubscription = supabase
          .channel(messageChannel)
          .on('postgres_changes', {
            event: 'INSERT',
            schema: 'public',
            table: 'group_messages',
            filter: `group_id=eq.${currentGroup.id}`
          }, (payload) => {
            console.log('🎉 RECEIVED REAL-TIME MESSAGE:', {
              messageId: payload.new.id,
              content: payload.new.content,
              userId: payload.new.user_id,
              groupId: payload.new.group_id,
              currentUserId: user.id,
              timestamp: new Date().toISOString()
            });

            setMessages(prev => {
              // Check if message already exists to prevent duplicates
              const exists = prev.some(msg => msg.id === payload.new.id);
              if (exists) {
                console.log('⚠️ Message already exists, skipping duplicate');
                return prev;
              }

              console.log('✅ Adding new message to state');
              const newMessage = payload.new as GroupMessage;

              // Handle the profile data properly
              if (payload.new.user_id === user.id) {
                newMessage.profiles = {
                  full_name: payload.new.full_name || 'You',
                  avatar_url: ''
                };
              }

              return [...prev, newMessage];
            });
          })
          .subscribe((status, error) => {
            console.log('📡 Message subscription status:', status, error);
            if (status === 'SUBSCRIBED') {
              console.log('✅ Message subscription successfully established');
              setConnectionStatus('connected');
            } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
              console.error('❌ Message subscription error:', status, error);
              setConnectionStatus('disconnected');
              // Retry with exponential backoff
              const delay = Math.min(1000 * Math.pow(2, attempt), 10000);
              retryTimeout = setTimeout(() => setupSubscription(attempt + 1), delay);
            }
          });

        // Subscribe to new links
        linkSubscription = supabase
          .channel(linkChannel)
          .on('postgres_changes', {
            event: 'INSERT',
            schema: 'public',
            table: 'group_links',
            filter: `group_id=eq.${currentGroup.id}`
          }, (payload) => {
            console.log('🔗 Received real-time link:', payload.new);
            setLinks(prev => {
              // Check if link already exists to prevent duplicates
              const exists = prev.some(link => link.id === payload.new.id);
              if (exists) {
                console.log('⚠️ Link already exists, skipping duplicate');
                return prev;
              }
              return [payload.new as GroupLink, ...prev];
            });
          })
          .subscribe((status, error) => {
            console.log('🔗 Link subscription status:', status, error);
          });

      } catch (error) {
        console.error('💥 Error setting up subscription:', error);
        setConnectionStatus('disconnected');
        // Retry with exponential backoff
        const delay = Math.min(1000 * Math.pow(2, attempt), 10000);
        retryTimeout = setTimeout(() => setupSubscription(attempt + 1), delay);
      }
    };

    // Start the initial subscription setup
    setupSubscription();

    return () => {
      console.log('🧹 Cleaning up real-time subscriptions');
      if (retryTimeout) {
        clearTimeout(retryTimeout);
      }
      if (messageSubscription) {
        messageSubscription.unsubscribe();
      }
      if (linkSubscription) {
        linkSubscription.unsubscribe();
      }
      setConnectionStatus('disconnected');
    };
  }, [currentGroup?.id, user]);

  // Load groups when user changes
  useEffect(() => {
    fetchGroups();
  }, [fetchGroups]);

  // Load messages and links when current group changes
  useEffect(() => {
    if (currentGroup?.id) {
      fetchMessages(currentGroup.id);
      fetchLinks(currentGroup.id);
    } else {
      setMessages([]);
      setLinks([]);
    }
  }, [currentGroup?.id, fetchMessages, fetchLinks]);

  // Check for school warnings when current group changes
  useEffect(() => {
    if (currentGroup?.id) {
      const warning = checkSchoolTimeWarning();
      setSchoolWarning(warning);
    } else {
      setSchoolWarning(null);
    }
  }, [currentGroup?.id]);

  // Dismiss school warning
  const dismissSchoolWarning = useCallback(() => {
    setSchoolWarning(null);
  }, []);

  return (
    <StudyGroupsContext.Provider
      value={{
        groups,
        currentGroup,
        messages,
        links,
        loading,
        error,
        connectionStatus,
        schoolWarning,
        createGroup,
        joinGroup,
        leaveGroup,
        sendMessage,
        addLink,
        setCurrentGroup,
        refreshGroups: fetchGroups,
        dismissSchoolWarning,
      }}
    >
      {children}
    </StudyGroupsContext.Provider>
  );
}

export function useStudyGroups() {
  const context = useContext(StudyGroupsContext);
  if (context === undefined) {
    throw new Error('useStudyGroups must be used within a StudyGroupsProvider');
  }
  return context;
}
