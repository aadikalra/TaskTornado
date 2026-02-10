'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useStudyGroups } from '@/context/StudyGroupsContext';
import { supabase } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsPanel, TabsPanels, TabsList, TabsTab } from '@/components/animate-ui/components/base/tabs';
import { MessageSquare, Link as LinkIcon, ArrowLeft, Send, Plus, Wifi, WifiOff, Loader2, LogOut, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { RealtimeChat } from '@/components/realtime-chat';
import { useAuth } from '@/context/AuthContext';
import { useRequireAuth } from '@/hooks/use-require-auth';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { format } from 'date-fns';
import { GoogleDocsIcon, GoogleSheetsIcon, GoogleSlidesIcon, GoogleDriveIcon, GoogleClassroomIcon, GoogleFormsIcon } from '@/components/BrandIcons';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { GroupShareMenu } from '@/components/GroupShareMenu';

export default function GroupPage() {
  const { authenticated } = useRequireAuth();
  if (!authenticated) return null;
  const { groupId } = useParams() as { groupId: string };
  const router = useRouter();
  const { user, full_name } = useAuth();
  const {
    currentGroup,
    messages,
    links,
    loading,
    error,
    connectionStatus,
    schoolWarning,
    sendMessage,
    addLink,
    leaveGroup,
    refreshGroups,
    setCurrentGroup,
    groups: contextGroups,
    dismissSchoolWarning
  } = useStudyGroups();

  const [newMessage, setNewMessage] = useState('');
  const [newLink, setNewLink] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [activeTab, setActiveTab] = useState('chat');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoadingGroup, setIsLoadingGroup] = useState(true);

  // Set current group when component mounts
  useEffect(() => {
    if (!groupId) return;

    const loadGroup = async () => {
      setIsLoadingGroup(true);
      setErrorMessage(null);

      try {
        // First check if the group is in the context
        const group = contextGroups.find(g => g.id === groupId);

        if (group) {
          setCurrentGroup(group);
        } else {
          // If not in context, fetch it from the database
          const { data, error } = await supabase
            .from('study_groups')
            .select('*')
            .eq('id', groupId)
            .single();

          if (error) throw error;
          if (data) {
            setCurrentGroup(data);
          }
        }
      } catch (err) {
        console.error('Error loading group:', err);
        setErrorMessage('Failed to load group. The group may not exist or you may not have permission to view it.');
      } finally {
        setIsLoadingGroup(false);
      }
    };

    loadGroup();

    // Clean up when component unmounts
    return () => {
      setCurrentGroup(null);
    };
  }, [groupId, contextGroups, setCurrentGroup]);

  // Scroll to bottom of messages when new messages arrive (with smart scrolling)
  useEffect(() => {
    const messagesContainer = document.getElementById('messages-container');
    if (messagesContainer && messages.length > 0) {
      // Check if user is near the bottom (within 100px)
      const isNearBottom = messagesContainer.scrollHeight - messagesContainer.scrollTop - messagesContainer.clientHeight < 100;

      if (isNearBottom) {
        // Smooth scroll to bottom for new messages
        setTimeout(() => {
          messagesContainer.scrollTo({
            top: messagesContainer.scrollHeight,
            behavior: 'smooth'
          });
        }, 100);
      }
    }
  }, [messages]);

  // Also scroll to bottom when switching to chat tab
  useEffect(() => {
    if (activeTab === 'chat') {
      const messagesContainer = document.getElementById('messages-container');
      if (messagesContainer) {
        setTimeout(() => {
          messagesContainer.scrollTo({
            top: messagesContainer.scrollHeight,
            behavior: 'smooth'
          });
        }, 100);
      }
    }
  }, [activeTab]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !groupId) return;

    setIsSending(true);
    try {
      await sendMessage(groupId as string, newMessage);
      setNewMessage('');
    } catch (err) {
      console.error('Error sending message:', err);
      setErrorMessage('Failed to send message');
    } finally {
      setIsSending(false);
    }
  };

  const handleAddLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLink.trim() || !groupId) return;

    try {
      await addLink(groupId as string, newLink);
      setNewLink('');
      setActiveTab('links');
    } catch (err) {
      console.error('Error adding link:', err);
      setErrorMessage('Failed to add link');
    }
  };

  const [showLeaveDialog, setShowLeaveDialog] = useState(false);

  // ...

  const handleLeaveGroup = async () => {
    try {
      await leaveGroup(groupId as string);
      router.push('/groups');
    } catch (err) {
      console.error('Error leaving group:', err);
      setErrorMessage('Failed to leave group');
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" onClick={() => router.push('/groups')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <Skeleton className="h-8 w-48" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-4">
            <Skeleton className="h-96 w-full rounded-lg" />
          </div>
          <div className="space-y-4">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Button variant="ghost" onClick={() => router.push('/groups')} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Groups
        </Button>

        <div className="bg-red-50 border-l-4 border-red-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!currentGroup) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Button variant="ghost" onClick={() => router.push('/groups')} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Groups
        </Button>

        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900">Group not found</h3>
          <p className="mt-2 text-sm text-gray-500">The group you're looking for doesn't exist or you don't have access to it.</p>
          <div className="mt-6">
            <Button onClick={() => router.push('/groups')}>
              Back to Groups
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" onClick={() => router.push('/groups')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">{currentGroup.name}</h1>
          <p className="text-sm text-muted-foreground">
            {currentGroup.member_count || 0} members • Created on {format(new Date(currentGroup.created_at), 'MMM d, yyyy')}
          </p>
        </div>
      </div>

      {errorMessage && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{errorMessage}</p>
            </div>
          </div>
        </div>
      )}

      {/* School Warning Banner - Only for Group Chats */}
      {schoolWarning?.showWarning && (
        <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 dark:border-yellow-600 rounded-r-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700 dark:text-yellow-300">
                  {schoolWarning.message}
                </p>
              </div>
            </div>
            <div className="ml-auto pl-3">
              <button
                onClick={dismissSchoolWarning}
                className="inline-flex text-yellow-400 hover:text-yellow-600 dark:text-yellow-500 dark:hover:text-yellow-300"
              >
                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {/* Main content */}
        <div className="space-y-4">
          <Tabs defaultValue="chat">
            <TabsList>
              <TabsTab value="chat">
                <MessageSquare className="h-4 w-4 mr-2" />
                Chat
              </TabsTab>
              <TabsTab value="links">
                <LinkIcon className="h-4 w-4 mr-2" />
                Links
              </TabsTab>
            </TabsList>

            <TabsPanels className="mt-0">
              <TabsPanel value="chat">
                <div className="h-[500px] flex flex-col">
                  <Card className="flex-1 flex flex-col overflow-hidden relative">
                    {/* Floating Glassmorphic Header Capsules */}
                    <div className="absolute top-0 inset-x-0 z-50 pointer-events-none p-3 flex justify-between items-start">
                      {/* Left Capsule: Members */}
                      <div className="pointer-events-auto flex items-center h-9 px-4 rounded-full bg-white/50 dark:bg-zinc-900/50 backdrop-blur-md border border-gray-200/80 dark:border-zinc-700/80 shadow-lg">
                        <span className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">
                          {currentGroup.member_count || 0} {(currentGroup.member_count || 0) === 1 ? 'member' : 'members'}
                        </span>
                      </div>

                      {/* Right Capsule: Status + Share */}
                      <div className="pointer-events-auto flex items-center h-9 rounded-full bg-white/50 dark:bg-zinc-900/50 backdrop-blur-md border border-gray-200/80 dark:border-zinc-700/80 shadow-lg">
                        {connectionStatus === 'connected' && (
                          <div className="pl-3 pr-2" title="Connected - Real-time sync active">
                            <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" />
                          </div>
                        )}
                        {connectionStatus === 'connecting' && (
                          <div className="pl-3 pr-2" title="Connecting...">
                            <Loader2 className="h-3.5 w-3.5 animate-spin text-yellow-500" />
                          </div>
                        )}
                        {connectionStatus === 'disconnected' && (
                          <div className="pl-3 pr-2" title="Disconnected - Messages may not sync">
                            <WifiOff className="h-3.5 w-3.5 text-red-500" />
                          </div>
                        )}
                        <div className="w-[1px] h-4 bg-gray-200 dark:bg-zinc-700" />
                        <GroupShareMenu
                          groupId={groupId}
                          groupName={currentGroup.name}
                          className="h-8 w-8 rounded-full hover:bg-gray-100/50 dark:hover:bg-zinc-800/50"
                        />
                        <div className="w-[1px] h-4 bg-gray-200 dark:bg-zinc-700" />
                        <button
                          onClick={() => setShowLeaveDialog(true)}
                          className="h-8 w-8 rounded-full flex items-center justify-center hover:bg-red-100/50 dark:hover:bg-red-900/30 transition-colors pr-1"
                          title="Leave Group"
                        >
                          <LogOut className="h-4 w-4 text-red-500" />
                        </button>
                      </div>
                    </div>
                    <div className="flex-1 min-h-0 overflow-hidden flex flex-col pt-2">
                      <RealtimeChat
                        roomName={`group-${groupId}`}
                        username={full_name || user?.email || 'Anonymous'}
                        className="h-full"
                      />
                    </div>
                  </Card>
                </div>
              </TabsPanel>

              <TabsPanel value="links">
                <div className="space-y-6 max-w-5xl mx-auto px-1 pt-2">
                  {/* Share a Link Header section */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <h2 className="text-2xl font-semibold tracking-tight">Shared Resources</h2>
                      <p className="text-sm text-muted-foreground mt-1">Useful links and documents shared by the group.</p>
                    </div>

                    <form onSubmit={handleAddLink} className="flex-1 max-w-md">
                      <div className="relative group">
                        <Input
                          id="link-input"
                          type="url"
                          placeholder="Share a new link (https://...)"
                          value={newLink}
                          onChange={(e) => setNewLink(e.target.value)}
                          required
                          className="w-full h-11 pl-4 pr-12 rounded-2xl bg-white/40 dark:bg-zinc-900/40 backdrop-blur-md border border-zinc-200/50 dark:border-zinc-800/50 shadow-sm focus-visible:ring-primary/20 transition-all"
                        />
                        <Button
                          type="submit"
                          size="icon"
                          className="absolute right-1 top-1 bottom-1 h-9 w-9 rounded-xl bg-[#264f84] hover:bg-[#1f3f6b] dark:bg-blue-600 dark:hover:bg-blue-700 transition-all transform group-focus-within:scale-105"
                          disabled={!newLink.trim()}
                        >
                          <Plus className="h-5 w-5" />
                        </Button>
                      </div>
                    </form>
                  </div>

                  {links.length === 0 ? (
                    <div className="bg-white/40 dark:bg-zinc-900/40 backdrop-blur-md rounded-[32px] border border-zinc-200/50 dark:border-zinc-800/50 p-16 text-center shadow-sm">
                      <div className="w-16 h-16 rounded-3xl bg-primary/5 flex items-center justify-center mx-auto mb-4">
                        <LinkIcon className="h-8 w-8 text-primary/40" />
                      </div>
                      <h3 className="text-xl font-medium">No links yet</h3>
                      <p className="text-muted-foreground mt-2 max-w-xs mx-auto">
                        Be the first to share a research paper, article, or resource with your team!
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {links.map((link) => {
                        const domain = new URL(link.url).hostname;
                        const urlLower = link.url.toLowerCase();

                        // Specialized brand styling logic
                        let brandStyles = {
                          cardBg: "bg-white/40 dark:bg-zinc-900/40",
                          iconBg: "bg-[#264f84]/5 dark:bg-blue-500/5",
                          iconBorder: "border-[#264f84]/10 dark:border-blue-500/10",
                          accentColor: "group-hover:text-[#264f84] dark:group-hover:text-blue-400",
                          label: link.title || domain,
                          sublabel: domain,
                          Icon: null as React.ElementType | null
                        };

                        if (urlLower.includes('docs.google.com/document')) {
                          brandStyles = { ...brandStyles, iconBg: "bg-blue-500/10", iconBorder: "border-blue-500/20", accentColor: "group-hover:text-blue-600 dark:group-hover:text-blue-400", label: link.title || 'Google Doc', Icon: GoogleDocsIcon };
                        } else if (urlLower.includes('docs.google.com/spreadsheets')) {
                          brandStyles = { ...brandStyles, iconBg: "bg-emerald-500/10", iconBorder: "border-emerald-500/20", accentColor: "group-hover:text-emerald-600 dark:group-hover:text-emerald-400", label: link.title || 'Google Sheet', Icon: GoogleSheetsIcon };
                        } else if (urlLower.includes('docs.google.com/presentation')) {
                          brandStyles = { ...brandStyles, iconBg: "bg-amber-500/10", iconBorder: "border-amber-500/20", accentColor: "group-hover:text-amber-600 dark:group-hover:text-amber-400", label: link.title || 'Google Slide', Icon: GoogleSlidesIcon };
                        } else if (urlLower.includes('drive.google.com')) {
                          brandStyles = { ...brandStyles, iconBg: "bg-blue-500/5", iconBorder: "border-blue-500/10", accentColor: "group-hover:text-blue-600 dark:group-hover:text-blue-400", label: link.title || 'Google Drive', Icon: GoogleDriveIcon };
                        } else if (urlLower.includes('classroom.google.com')) {
                          brandStyles = { ...brandStyles, iconBg: "bg-green-600/10", iconBorder: "border-green-600/20", accentColor: "group-hover:text-green-700 dark:group-hover:text-green-400", label: link.title || 'Google Classroom', Icon: GoogleClassroomIcon };
                        } else if (urlLower.includes('docs.google.com/forms')) {
                          brandStyles = { ...brandStyles, iconBg: "bg-purple-500/10", iconBorder: "border-purple-500/20", accentColor: "group-hover:text-purple-700 dark:group-hover:text-purple-400", label: link.title || 'Google Form', Icon: GoogleFormsIcon };
                        }

                        return (
                          <motion.a
                            key={link.id}
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            whileHover={{ y: -4 }}
                            className={cn(
                              "group relative backdrop-blur-md rounded-3xl border border-zinc-200/50 dark:border-zinc-800/50 p-4 shadow-sm hover:shadow-xl transition-all duration-300",
                              brandStyles.cardBg,
                              urlLower.includes('docs.google.com') ? "hover:border-blue-500/30" : "hover:border-[#264f84]/30 dark:hover:border-blue-500/30"
                            )}
                          >
                            <div className="flex flex-col h-full gap-3">
                              <div className="flex items-start justify-between gap-3">
                                <div className={cn(
                                  "p-2 rounded-2xl border shrink-0 transition-all duration-500 group-hover:scale-110",
                                  brandStyles.iconBg,
                                  brandStyles.iconBorder
                                )}>
                                  {brandStyles.Icon ? (
                                    <brandStyles.Icon className="w-6 h-6" />
                                  ) : (
                                    <img
                                      src={`https://unavatar.io/${domain}?fallback=https://www.google.com/s2/favicons?domain=${domain}&sz=64`}
                                      alt={domain}
                                      className="w-6 h-6 grayscale group-hover:grayscale-0 transition-all duration-500"
                                      onError={(e) => {
                                        (e.target as HTMLImageElement).src = '';
                                        (e.target as HTMLImageElement).parentElement!.innerHTML = '<svg class="w-6 h-6 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>';
                                      }}
                                    />
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h4 className={cn(
                                    "font-semibold text-sm leading-tight line-clamp-2 transition-colors",
                                    brandStyles.accentColor
                                  )}>
                                    {brandStyles.label}
                                  </h4>
                                  <p className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground/50 mt-1 truncate">
                                    {domain}
                                  </p>
                                </div>
                              </div>

                              <div className="mt-auto pt-3 border-t border-zinc-200/30 dark:border-zinc-800/30 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <Avatar className="h-6 w-6 ring-2 ring-background">
                                    <AvatarImage src={link.profiles?.avatar_url} />
                                    <AvatarFallback className="text-[10px] bg-[#264f84]/10 dark:bg-blue-500/10 text-[#264f84] dark:text-blue-400 font-bold">
                                      {link.profiles?.full_name?.charAt(0).toUpperCase() || '?'}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div className="flex flex-col">
                                    <span className="text-[10px] font-medium leading-none">
                                      {link.profiles?.full_name?.split(' ')[0] || 'Unknown'}
                                    </span>
                                    <span className="text-[9px] text-muted-foreground min-w-fit">
                                      {format(new Date(link.created_at), 'MMM d')}
                                    </span>
                                  </div>
                                </div>

                                <ArrowRight className={cn(
                                  "h-4 w-4 -translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300",
                                  brandStyles.accentColor
                                )} />
                              </div>
                            </div>
                          </motion.a>
                        );
                      })}
                    </div>
                  )}
                </div>
              </TabsPanel>
            </TabsPanels>
          </Tabs>
        </div>
      </div>
      {/* Leave Group Confirmation Dialog */}
      <AlertDialog open={showLeaveDialog} onOpenChange={setShowLeaveDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. You will be removed from the group and will need an invite link to rejoin.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleLeaveGroup}
              className="bg-red-600 hover:bg-red-700 text-white focus:ring-red-600"
            >
              Leave Group
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
