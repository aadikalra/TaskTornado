'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { RealtimeChat } from '@/components/realtime-chat';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useRouter } from 'next/navigation';

export default function TestChatPage() {
  const { user, full_name, loading: authLoading } = useAuth();
  const [username, setUsername] = useState('');
  const [room, setRoom] = useState('test-room');
  const [hasJoined, setHasJoined] = useState(false);
  const router = useRouter();

  // Auto-fill username with user's name and join test room when auth data is loaded
  useEffect(() => {
    if (full_name) {
      setUsername(full_name);
      // Auto-join the test room after a short delay to ensure UI is ready
      const timer = setTimeout(() => {
        if (full_name.trim()) {
          setHasJoined(true);
        }
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [full_name]);

  // Handle manual join if needed (e.g., if user changes the username)
  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim()) {
      setHasJoined(true);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  if (!user) {
    router.push('/login?redirectTo=/testchat');
    return null;
  }

  if (!hasJoined) {
    return (
      <div className="container mx-auto p-4 max-w-md">
        <Card className="animate-fade-in">
          <CardHeader>
            <CardTitle>Welcome to Test Chat</CardTitle>
            <CardDescription>You'll be automatically joined to the test room</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleJoin} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="username" className="text-sm font-medium">
                  Your Display Name
                </label>
                <Input
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your display name"
                  required
                />
              </div>
              <div className="pt-4">
                <div className="text-sm text-muted-foreground mb-2">
                  You'll be joining: <span className="font-medium">test-room</span>
                </div>
                <Button type="submit" className="w-full">
                  {username ? `Join as ${username}` : 'Join Chat'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-4xl h-[calc(100vh-2rem)] flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Test Chat Room: {room}</h1>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Connected as: {username}</span>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setHasJoined(false)}
          >
            Change Name
          </Button>
        </div>
      </div>
      
      <div className="flex-1 border rounded-lg overflow-hidden bg-card">
        <RealtimeChat 
          roomName={room} 
          username={username} 
        />
      </div>
      
      <div className="mt-4 text-sm text-muted-foreground text-center">
        <p>Open this page in another browser or incognito window to test the chat with multiple users.</p>
      </div>
    </div>
  );
}
