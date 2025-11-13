'use client'

import { useCallback, useEffect, useState } from 'react'
import { RealtimeChannel } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase/client'

interface UseRealtimeChatProps {
  roomName: string
  username: string
}

export interface ChatMessage {
  id: string
  content: string
  user: {
    name: string
  }
  createdAt: string
}

const EVENT_MESSAGE_TYPE = 'message'

export function useRealtimeChat({ roomName, username }: UseRealtimeChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [channel, setChannel] = useState<RealtimeChannel | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Create a new channel
    const newChannel = supabase.channel(roomName, {
      config: {
        broadcast: { self: true },
        presence: { key: username }
      }
    });

    // Handle incoming messages
    newChannel.on(
      'broadcast',
      { event: EVENT_MESSAGE_TYPE },
      (payload: { payload: ChatMessage }) => {
        console.log('Received message:', payload);
        setMessages((current) => [...current, payload.payload]);
      }
    );

    // Subscribe to the channel
    newChannel.subscribe((status, err) => {
      console.log('Subscription status:', status);
      if (err) {
        console.error('Subscription error:', err);
        setError(err.message);
        setIsConnected(false);
        return;
      }
      
      const isSubscribed = status === 'SUBSCRIBED';
      console.log('Channel subscription state:', { status, isSubscribed });
      setIsConnected(isSubscribed);
      
      if (!isSubscribed) {
        setError(`Failed to subscribe to channel. Status: ${status}`);
      } else {
        setError(null);
      }
    });

    setChannel(newChannel);
    
    // Cleanup function
    return () => {
      if (newChannel) {
        supabase.removeChannel(newChannel);
      }
    };
  }, [roomName, username]);

  const sendMessage = useCallback(
    async (content: string) => {
      if (!channel || !isConnected) return

      const message: ChatMessage = {
        id: crypto.randomUUID(),
        content,
        user: {
          name: username,
        },
        createdAt: new Date().toISOString(),
      }

      // Update local state immediately for the sender
      setMessages((current) => [...current, message])

      await channel.send({
        type: 'broadcast',
        event: EVENT_MESSAGE_TYPE,
        payload: message,
      })
    },
    [channel, isConnected, username]
  )

  return { messages, sendMessage, isConnected }
}
