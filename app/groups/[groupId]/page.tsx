'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useStudyGroups } from '@/context/StudyGroupsContext';
import { supabase } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { HugeIcon } from '@/lib/huge-icon-map';
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
import { GroupShareMenu } from '@/components/GroupShareMenu';
import { useUpgrade } from '@/context/UpgradeContext';

const BackgroundOrbs = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-sky-200/20 dark:bg-sky-500/[0.06] rounded-full blur-[140px]" />
    <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-[#ebf6b5]/30 dark:bg-emerald-500/[0.04] rounded-full blur-[120px]" />
    <div className="absolute top-1/3 right-0 w-[300px] h-[300px] bg-[#ebf6b5]/20 dark:bg-emerald-500/[0.04] rounded-full blur-[100px]" />
  </div>
);

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
  const { handlePlanLimitError } = useUpgrade();

  const [newMessage, setNewMessage] = useState('');
  const [newLink, setNewLink] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [activeTab, setActiveTab] = useState('chat');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoadingGroup, setIsLoadingGroup] = useState(true);

  useEffect(() => {
    if (!groupId) return;

    const loadGroup = async () => {
      setIsLoadingGroup(true);
      setErrorMessage(null);

      try {
        const group = contextGroups.find(g => g.id === groupId);
        if (group) {
          setCurrentGroup(group);
        } else {
          const { data, error } = await supabase
            .from('study_groups')
            .select('*')
            .eq('id', groupId)
            .single();

          if (error) throw error;
          if (data) setCurrentGroup(data);
        }
      } catch (err) {
        console.error('Error loading group:', err);
        setErrorMessage('Failed to load group. The group may not exist or you may not have permission to view it.');
      } finally {
        setIsLoadingGroup(false);
      }
    };

    loadGroup();
    return () => { setCurrentGroup(null); };
  }, [groupId, contextGroups, setCurrentGroup]);

  useEffect(() => {
    const messagesContainer = document.getElementById('messages-container');
    if (messagesContainer && messages.length > 0) {
      const isNearBottom = messagesContainer.scrollHeight - messagesContainer.scrollTop - messagesContainer.clientHeight < 100;
      if (isNearBottom) {
        setTimeout(() => {
          messagesContainer.scrollTo({ top: messagesContainer.scrollHeight, behavior: 'smooth' });
        }, 100);
      }
    }
  }, [messages]);

  useEffect(() => {
    if (activeTab === 'chat') {
      const messagesContainer = document.getElementById('messages-container');
      if (messagesContainer) {
        setTimeout(() => {
          messagesContainer.scrollTo({ top: messagesContainer.scrollHeight, behavior: 'smooth' });
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
    } catch (err: any) {
      if (!handlePlanLimitError(err)) {
        console.error('Error sending message:', err);
        setErrorMessage('Failed to send message');
      }
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
    } catch (err: any) {
      if (!handlePlanLimitError(err)) {
        console.error('Error adding link:', err);
        setErrorMessage('Failed to add link');
      }
    }
  };

  const [showLeaveDialog, setShowLeaveDialog] = useState(false);

  const handleLeaveGroup = async () => {
    try {
      await leaveGroup(groupId as string);
      router.push('/groups');
    } catch (err) {
      console.error('Error leaving group:', err);
      setErrorMessage('Failed to leave group');
    }
  };

  // ── Loading ──
  if (loading) {
    return (
      <div className="min-h-screen bg-[#fffaf4] dark:bg-gray-950 relative">
        <BackgroundOrbs />
        <div className="relative z-10 w-full mx-auto px-4 sm:px-6 md:px-12 lg:px-16 pt-28 pb-16">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-10 h-10 bg-sky-100 rounded-xl animate-pulse" />
            <div className="h-6 w-48 bg-sky-100 rounded-lg animate-pulse" />
          </div>
          <div className="h-96 w-full bg-[#f5f9fc] dark:bg-gray-900 rounded-2xl border border-sky-100 dark:border-gray-800 animate-pulse" />
        </div>
      </div>
    );
  }

  // ── Error ──
  if (error) {
    return (
      <div className="min-h-screen bg-[#fffaf4] dark:bg-gray-950 relative">
        <BackgroundOrbs />
        <div className="relative z-10 w-full mx-auto px-4 sm:px-6 md:px-12 lg:px-16 pt-28 pb-16">
          <button
            onClick={() => router.push('/groups')}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-sky-600 dark:text-sky-400 hover:bg-sky-500/5 rounded-xl transition-colors mb-6"
          >
            <HugeIcon name="ArrowLeft01" className="h-4 w-4" />
            Back to Groups
          </button>
          <div className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-2xl">
            <HugeIcon name="AlertCircle" className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  // ── Not found ──
  if (!currentGroup) {
    return (
      <div className="min-h-screen bg-[#fffaf4] dark:bg-gray-950 relative">
        <BackgroundOrbs />
        <div className="relative z-10 w-full mx-auto px-4 sm:px-6 md:px-12 lg:px-16 pt-28 pb-16">
          <button
            onClick={() => router.push('/groups')}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-sky-600 dark:text-sky-400 hover:bg-sky-500/5 rounded-xl transition-colors mb-6"
          >
            <HugeIcon name="ArrowLeft01" className="h-4 w-4" />
            Back to Groups
          </button>
          <div className="flex flex-col items-center justify-center py-24">
            <div className="w-20 h-20 bg-[#f5f9fc] dark:bg-gray-800 rounded-3xl border border-sky-100 dark:border-gray-700 flex items-center justify-center mb-6">
              <HugeIcon name="Chat" className="h-9 w-9 text-sky-500/30 dark:text-sky-400/30" />
            </div>
            <h3 className="text-xl font-bold text-sky-900 dark:text-white mb-2">Group not found</h3>
            <p className="text-sm text-sky-600/50 dark:text-sky-400/50 mb-8 text-center max-w-sm">
              The group you're looking for doesn't exist or you don't have access to it.
            </p>
            <button
              onClick={() => router.push('/groups')}
              className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-sky-700 bg-[#ebf6b5] hover:bg-[#e0efa0] border border-[#d4e88e] rounded-xl transition-colors"
            >
              Back to Groups
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fffaf4] dark:bg-gray-950 relative">
      <BackgroundOrbs />
      <div className="relative z-10 w-full mx-auto px-4 sm:px-6 md:px-12 lg:px-16 pt-28 pb-16">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/groups')}
              className="p-2 rounded-xl text-sky-600 dark:text-sky-400 hover:bg-sky-500/5 transition-colors"
            >
              <HugeIcon name="ArrowLeft01" className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-sky-900 dark:text-white">{currentGroup.name}</h1>
              <p className="text-sm text-sky-600/50 dark:text-sky-400/50">
                {currentGroup.member_count || 0} members · Created {format(new Date(currentGroup.created_at), 'MMM d, yyyy')}
              </p>
            </div>
          </div>

          {/* Right side: Status, Share, Leave */}
          <div className="flex items-center gap-3">
            {connectionStatus === 'connected' && (
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20" title="Connected - Real-time sync active">
                <HugeIcon name="Wifi02" className="h-4 w-4 text-emerald-500" />
                <span className="text-xs font-medium text-emerald-700 dark:text-emerald-300">Connected</span>
              </div>
            )}
            {connectionStatus === 'connecting' && (
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20" title="Connecting...">
                <HugeIcon name="LoaderPinwheel" className="h-4 w-4 animate-spin text-amber-500" />
                <span className="text-xs font-medium text-amber-700 dark:text-amber-300">Connecting...</span>
              </div>
            )}
            {connectionStatus === 'disconnected' && (
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20" title="Disconnected - Messages may not sync">
                <HugeIcon name="WifiError02" className="h-5 w-5 text-red-500" />
                <span className="text-xs font-medium text-red-700 dark:text-red-300">Disconnected</span>
              </div>
            )}
            <GroupShareMenu
              groupId={groupId}
              groupName={currentGroup.name}
              className="h-10 w-10 rounded-xl hover:bg-sky-500/5 dark:hover:bg-sky-500/10 text-sky-600 dark:text-sky-400"
            />
            <button
              onClick={() => setShowLeaveDialog(true)}
              className="h-10 w-10 rounded-xl flex items-center justify-center hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors text-sky-600 dark:text-sky-400 hover:text-red-500"
              title="Leave Group"
            >
              <HugeIcon name="LogoutCircle02" className="h-5 w-5" />
            </button>
          </div>
        </motion.div>

        {/* Error message */}
        {errorMessage && (
          <div className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-2xl mb-6">
            <HugeIcon name="AlertCircle" className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
            <p className="text-sm text-red-600 dark:text-red-400">{errorMessage}</p>
          </div>
        )}

        {/* School Warning */}
        {schoolWarning?.showWarning && (
          <div className="flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-2xl mb-6">
            <HugeIcon name="AlertCircle" className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
            <p className="text-sm text-amber-600 dark:text-amber-400 flex-1">{schoolWarning.message}</p>
            <button onClick={dismissSchoolWarning} className="p-1 rounded-lg text-amber-500/50 hover:text-amber-600 transition-colors">
              <HugeIcon name="Cancel01" className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Main content */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          {/* Pill Tabs */}
          <div className="flex items-center gap-2 mb-4">
            <button
              onClick={() => setActiveTab('chat')}
              className={`flex items-center gap-2 px-5 py-2 text-[13px] font-bold rounded-full transition-all duration-200 ${activeTab === 'chat'
                ? 'bg-[#ebf6b5]/80 dark:bg-sky-500/25 text-sky-600 dark:text-sky-400'
                : 'text-sky-600/60 dark:text-sky-400/60 hover:text-sky-600 dark:hover:text-sky-400 hover:bg-[#ebf6b5]/30 dark:hover:bg-sky-500/10'
                }`}
            >
              <HugeIcon name="Chat" className="h-3.5 w-3.5" />
              Chat
            </button>
            <button
              onClick={() => setActiveTab('links')}
              className={`flex items-center gap-2 px-5 py-2 text-[13px] font-bold rounded-full transition-all duration-200 ${activeTab === 'links'
                ? 'bg-[#ebf6b5]/80 dark:bg-sky-500/25 text-sky-600 dark:text-sky-400'
                : 'text-sky-600/60 dark:text-sky-400/60 hover:text-sky-600 dark:hover:text-sky-400 hover:bg-[#ebf6b5]/30 dark:hover:bg-sky-500/10'
                }`}
            >
              <HugeIcon name="LinkSquare02" className="h-3.5 w-3.5" />
              Links
            </button>
          </div>

          {/* Chat Panel */}
          {activeTab === 'chat' && (
            <div className="h-[500px] flex flex-col">
              <Card className="flex-1 flex flex-col overflow-hidden relative bg-[#f5f9fc] dark:bg-gray-900 border-sky-100 dark:border-gray-800 rounded-2xl">
                {/* Floating Glassmorphic Header Capsules */}
                <div className="absolute top-0 inset-x-0 z-50 pointer-events-none p-3 flex justify-between items-start">
                  {/* Left Capsule: Members */}
                  <div className="pointer-events-auto flex items-center h-9 px-4 rounded-full bg-white/60 dark:bg-gray-900/60 backdrop-blur-md border border-sky-100 dark:border-gray-800 shadow-lg">
                    <span className="text-sm font-semibold text-sky-800 dark:text-sky-300">
                      {currentGroup.member_count || 0} {(currentGroup.member_count || 0) === 1 ? 'member' : 'members'}
                    </span>
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
          )}

          {/* Links Panel */}
          {activeTab === 'links' && (
            <div className="space-y-6 px-1 pt-2">
              {/* Share a Link */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-sky-900 dark:text-white tracking-tight">Shared Resources</h2>
                  <p className="text-sm text-sky-600/50 dark:text-sky-400/50 mt-1">Useful links and documents shared by the group.</p>
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
                      className="w-full h-11 pl-4 pr-12 rounded-2xl bg-white/60 dark:bg-gray-900/60 backdrop-blur-md border border-sky-100 dark:border-gray-800 shadow-sm focus-visible:ring-sky-500/20 transition-all"
                    />
                    <Button
                      type="submit"
                      size="icon"
                      className="absolute right-1 top-1 bottom-1 h-9 w-9 rounded-xl bg-sky-500 hover:bg-sky-600 dark:bg-sky-500 dark:hover:bg-sky-600 transition-all transform group-focus-within:scale-105"
                      disabled={!newLink.trim()}
                    >
                      <HugeIcon name="PlusSign" className="h-5 w-5" />
                    </Button>
                  </div>
                </form>
              </div>

              {links.length === 0 ? (
                <div className="bg-[#f5f9fc] dark:bg-gray-900 backdrop-blur-md rounded-[32px] border border-sky-100 dark:border-gray-800 p-16 text-center shadow-sm">
                  <div className="w-16 h-16 rounded-3xl bg-sky-500/5 flex items-center justify-center mx-auto mb-4">
                    <HugeIcon name="LinkSquare02" className="h-8 w-8 text-sky-500/30" />
                  </div>
                  <h3 className="text-xl font-bold text-sky-900 dark:text-white">No links yet</h3>
                  <p className="text-sm text-sky-600/50 dark:text-sky-400/50 mt-2 max-w-xs mx-auto">
                    Be the first to share a research paper, article, or resource with your team!
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {links.map((link) => {
                    const domain = new URL(link.url).hostname;
                    const urlLower = link.url.toLowerCase();

                    let brandStyles = {
                      cardBg: "bg-[#f5f9fc] dark:bg-gray-900",
                      iconBg: "bg-sky-500/5 dark:bg-sky-500/5",
                      iconBorder: "border-sky-500/10 dark:border-sky-500/10",
                      accentColor: "group-hover:text-sky-600 dark:group-hover:text-sky-400",
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
                          "group relative backdrop-blur-md rounded-3xl border border-sky-100 dark:border-gray-800 p-4 shadow-sm hover:shadow-xl transition-all duration-300",
                          brandStyles.cardBg,
                          "hover:border-sky-200 dark:hover:border-gray-700"
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
                                    (e.target as HTMLImageElement).parentElement!.innerHTML = '<svg class="w-6 h-6 text-sky-500/40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>';
                                  }}
                                />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className={cn(
                                "font-semibold text-sm leading-tight line-clamp-2 text-sky-900 dark:text-white transition-colors",
                                brandStyles.accentColor
                              )}>
                                {brandStyles.label}
                              </h4>
                              <p className="text-[10px] uppercase tracking-wider font-bold text-sky-500/40 dark:text-sky-400/40 mt-1 truncate">
                                {domain}
                              </p>
                            </div>
                          </div>

                          <div className="mt-auto pt-3 border-t border-sky-100/50 dark:border-gray-800/50 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Avatar className="h-6 w-6 ring-2 ring-[#fffaf4] dark:ring-gray-950">
                                <AvatarImage src={link.profiles?.avatar_url} />
                                <AvatarFallback className="text-[10px] bg-sky-500/10 text-sky-600 dark:text-sky-400 font-bold">
                                  {link.profiles?.full_name?.charAt(0).toUpperCase() || '?'}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex flex-col">
                                <span className="text-[10px] font-medium text-sky-900 dark:text-white leading-none">
                                  {link.profiles?.full_name?.split(' ')[0] || 'Unknown'}
                                </span>
                                <span className="text-[9px] text-sky-500/40 dark:text-sky-400/40 min-w-fit">
                                  {format(new Date(link.created_at), 'MMM d')}
                                </span>
                              </div>
                            </div>

                            <HugeIcon name="ArrowRight01" className={cn(
                              "h-4 w-4 -translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300 text-sky-500",
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
          )}
        </motion.div>
      </div>

      {/* Leave Group Dialog */}
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
