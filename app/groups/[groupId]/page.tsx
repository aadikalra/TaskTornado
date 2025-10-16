'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useStudyGroups } from '@/context/StudyGroupsContext';
import { supabase } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MessageSquare, Link as LinkIcon, ArrowLeft, Send, Plus } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { format } from 'date-fns';

export default function GroupPage() {
  const { groupId } = useParams() as { groupId: string };
  const router = useRouter();
  const { 
    currentGroup, 
    messages, 
    links, 
    loading, 
    error, 
    sendMessage, 
    addLink,
    leaveGroup,
    refreshGroups,
    setCurrentGroup,
    groups: contextGroups
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
  
  // Scroll to bottom of messages when new messages arrive
  useEffect(() => {
    const messagesContainer = document.getElementById('messages-container');
    if (messagesContainer) {
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
  }, [messages]);

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

  const handleLeaveGroup = async () => {
    if (!window.confirm('Are you sure you want to leave this group?')) return;
    
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Main content */}
        <div className="md:col-span-2 space-y-4">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="chat">
                <MessageSquare className="h-4 w-4 mr-2" />
                Chat
              </TabsTrigger>
              <TabsTrigger value="links">
                <LinkIcon className="h-4 w-4 mr-2" />
                Links
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="chat" className="mt-0">
              <Card className="h-[500px] flex flex-col">
                <CardHeader className="border-b">
                  <CardTitle>Group Chat</CardTitle>
                </CardHeader>
                
                <div id="messages-container" className="flex-1 p-4 overflow-y-auto">
                  {messages.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-muted-foreground">
                      <p>No messages yet. Say hello!</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {messages.map((message) => (
                        <div key={message.id} className="flex gap-3">
                          <Avatar className="h-8 w-8 mt-1">
                            <AvatarImage src={message.profiles?.avatar_url} />
                            <AvatarFallback>
                              {message.profiles?.full_name?.charAt(0).toUpperCase() || '?'}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="flex items-baseline gap-2">
                              <span className="font-medium">
                                {message.profiles?.full_name || 'Unknown User'}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {format(new Date(message.created_at), 'MMM d, h:mm a')}
                              </span>
                            </div>
                            <p className="text-sm">{message.content}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                <div className="p-4 border-t">
                  <form onSubmit={handleSendMessage} className="flex gap-2">
                    <Input
                      type="text"
                      placeholder="Type a message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      className="flex-1"
                      disabled={isSending}
                    />
                    <Button type="submit" disabled={!newMessage.trim() || isSending}>
                      {isSending ? 'Sending...' : <Send className="h-4 w-4" />}
                    </Button>
                  </form>
                </div>
              </Card>
            </TabsContent>
            
            <TabsContent value="links" className="mt-0">
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle>Shared Links</CardTitle>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => {
                        setActiveTab('chat');
                        document.getElementById('link-input')?.focus();
                      }}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Share in Chat
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {links.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <LinkIcon className="mx-auto h-8 w-8 mb-2" />
                      <p>No links shared yet</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {links.map((link) => (
                        <a 
                          key={link.id} 
                          href={link.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="block p-3 border rounded hover:bg-accent transition-colors"
                        >
                          <div className="flex items-start gap-3">
                            <div className="mt-0.5">
                              <LinkIcon className="h-4 w-4 text-muted-foreground" />
                            </div>
                            <div>
                              <p className="font-medium line-clamp-1">{link.title || link.url}</p>
                              <p className="text-sm text-muted-foreground line-clamp-1">{link.url}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <Avatar className="h-5 w-5">
                                  <AvatarImage src={link.profiles?.avatar_url} />
                                  <AvatarFallback className="text-xs">
                                    {link.profiles?.full_name?.charAt(0).toUpperCase() || '?'}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="text-xs text-muted-foreground">
                                  Shared by {link.profiles?.full_name || 'Unknown'}
                                </span>
                                <span className="text-xs text-muted-foreground">•</span>
                                <span className="text-xs text-muted-foreground">
                                  {format(new Date(link.created_at), 'MMM d, yyyy')}
                                </span>
                              </div>
                            </div>
                          </div>
                        </a>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
        
        {/* Sidebar */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Group Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Created</h3>
                <p>{format(new Date(currentGroup.created_at), 'MMMM d, yyyy')}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Members</h3>
                <p>{currentGroup.member_count || 0} members</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Invite Link</h3>
                <div className="flex items-center gap-2 mt-1">
                  <Input 
                    value={`${window.location.origin}/groups/join/${groupId}`} 
                    readOnly 
                    className="text-xs h-8"
                  />
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      navigator.clipboard.writeText(`${window.location.origin}/groups/join/${groupId}`);
                      // Show copied tooltip
                    }}
                  >
                    Copy
                  </Button>
                </div>
              </div>
              
              <Button 
                variant="destructive" 
                className="w-full mt-4"
                onClick={handleLeaveGroup}
              >
                Leave Group
              </Button>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Share a Link</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddLink} className="space-y-2">
                <Input
                  id="link-input"
                  type="url"
                  placeholder="https://example.com"
                  value={newLink}
                  onChange={(e) => setNewLink(e.target.value)}
                  required
                />
                <Button type="submit" className="w-full">
                  Share Link
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

// Skeleton component for loading state
function Skeleton({ className }: { className: string }) {
  return (
    <div className={`animate-pulse bg-gray-200 dark:bg-gray-700 rounded ${className}`} />
  );
}
