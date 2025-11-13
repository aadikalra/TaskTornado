'use client'

import { cn } from '@/lib/utils'
import { ChatMessageItem } from './chat-message'
import { useChatScroll } from '@/hooks/use-chat-scroll'
import {
  type ChatMessage,
  useRealtimeChat,
} from '@/hooks/use-realtime-chat'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Send } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Loader2 } from 'lucide-react'

interface RealtimeChatProps {
  roomName: string
  username: string
  onMessage?: (messages: ChatMessage[]) => void
  messages?: ChatMessage[]
  className?: string
}

/**
 * Realtime chat component
 * @param roomName - The name of the room to join. Each room is a unique chat.
 * @param username - The username of the user
 * @param onMessage - The callback function to handle the messages. Useful if you want to store the messages in a database.
 * @param messages - The messages to display in the chat. Useful if you want to display messages from a database.
 * @returns The chat component
 */
export const RealtimeChat = ({
  roomName,
  username,
  onMessage,
  messages: initialMessages = [],
  className,
}: RealtimeChatProps) => {
  const { containerRef, scrollToBottom } = useChatScroll()

  const {
    messages: realtimeMessages,
    sendMessage,
    isConnected,
  } = useRealtimeChat({
    roomName,
    username,
  })
  const [newMessage, setNewMessage] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [dbMessages, setDbMessages] = useState<ChatMessage[]>([])

  // Load existing messages from the database
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const groupId = roomName.replace('group-', '')
        const { data: messages, error } = await supabase
          .from('group_messages')
          .select('*')
          .eq('group_id', groupId)
          .order('created_at', { ascending: true })

        if (error) throw error

        if (messages) {
          const formattedMessages = messages.map(msg => ({
            id: msg.id,
            content: msg.content,
            user: {
              name: msg.full_name || 'Anonymous',
            },
            createdAt: msg.created_at,
            timestamp: new Date(msg.created_at).getTime(),
          } as ChatMessage))
          setDbMessages(formattedMessages)
        }
      } catch (error) {
        console.error('Error loading messages:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchMessages()
  }, [roomName])

  // Merge database messages with real-time messages
  const allMessages = useMemo(() => {
    // Combine database messages, initial messages, and real-time messages
    // Remove duplicates by message ID
    const messageMap = new Map<string, ChatMessage>()
    
    // Helper to create a ChatMessage from any message-like object
    const createChatMessage = (msg: any): ChatMessage => ({
      id: msg.id,
      content: msg.content,
      user: {
        name: msg.user?.name || 'Anonymous',
      },
      createdAt: msg.createdAt || new Date().toISOString(),
    })
    
    // Add all messages to the map, last one in wins for duplicates
    ;[...dbMessages, ...initialMessages, ...realtimeMessages].forEach(msg => {
      messageMap.set(msg.id, createChatMessage(msg))
    })
    
    // Convert back to array and sort by creation date
    return Array.from(messageMap.values()).sort((a, b) => 
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    )
  }, [initialMessages, realtimeMessages])

  useEffect(() => {
    if (onMessage) {
      onMessage(allMessages)
    }
  }, [allMessages, onMessage])

  useEffect(() => {
    // Scroll to bottom whenever messages change
    scrollToBottom()
  }, [allMessages, scrollToBottom])

  const handleSendMessage = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      if (!newMessage.trim() || !isConnected) return

      try {
        // Get current user
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error('User not authenticated')

        // Save message to database
        const { error } = await supabase
          .from('group_messages')
          .insert([
            { 
              content: newMessage,
              group_id: roomName.replace('group-', ''), // Extract group ID from room name
              user_id: user.id,
              full_name: username // Use the provided username (which comes from full_name or email)
            }
          ])
          
        if (error) throw error
        
        // Send message via realtime
        sendMessage(newMessage)
        setNewMessage('')
      } catch (error) {
        console.error('Error saving message:', error)
        // Still send the message via realtime even if DB save fails
        sendMessage(newMessage)
        setNewMessage('')
      }
    },
    [newMessage, isConnected, sendMessage, roomName, username]
  )

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className={cn('flex flex-col h-full', className)}>
      {/* Messages */}
      <div ref={containerRef} className="flex-1 overflow-y-auto p-4 space-y-4">
        {allMessages.length === 0 ? (
          <div className="text-center text-sm text-muted-foreground">
            No messages yet. Start the conversation!
          </div>
        ) : null}
        <div className="space-y-1">
          {allMessages.map((message, index) => {
            const prevMessage = index > 0 ? allMessages[index - 1] : null
            const showHeader = !prevMessage || prevMessage.user.name !== message.user.name

            return (
              <div
                key={message.id}
                className="animate-in fade-in slide-in-from-bottom-4 duration-300"
              >
                <ChatMessageItem
                  message={message}
                  isOwnMessage={message.user.name === username}
                  showHeader={showHeader}
                />
              </div>
            )
          })}
        </div>
      </div>

      <form onSubmit={handleSendMessage} className="flex w-full gap-2 border-t border-border p-4">
        <Input
          className={cn(
            'rounded-full bg-background text-sm transition-all duration-300',
            isConnected && newMessage.trim() ? 'w-[calc(100%-36px)]' : 'w-full'
          )}
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          disabled={!isConnected}
        />
        {isConnected && newMessage.trim() && (
          <Button
            className="aspect-square rounded-full animate-in fade-in slide-in-from-right-4 duration-300"
            type="submit"
            disabled={!isConnected}
          >
            <Send className="size-4" />
          </Button>
        )}
      </form>
    </div>
  )
}
