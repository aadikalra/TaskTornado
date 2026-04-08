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
import { HugeIcon } from '@/lib/huge-icon-map';
import { useCallback, useEffect, useMemo, useState } from 'react'
import { supabase } from '@/lib/supabase/client'

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
  }, [dbMessages, initialMessages, realtimeMessages])

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
        <HugeIcon name="LoaderPinwheel" className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className={cn('flex flex-col h-full', className)}>
      {/* Messages */}
      <div ref={containerRef} className="flex-1 min-h-0 overflow-y-auto p-4 pb-24 space-y-4 scroll-smooth">
        {allMessages.length === 0 ? (
          <div className="h-full flex items-center justify-center text-sm text-muted-foreground p-8">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-sky-500/10 flex items-center justify-center mx-auto mb-2">
                <HugeIcon name="ArrowUp02" className="w-6 h-6 text-sky-500" />
              </div>
              <p>No messages yet.</p>
              <p className="text-xs opacity-70">Start the conversation!</p>
            </div>
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

      {/* Floating Glassmorphic Input Area - Matches AIAssistant.tsx */}
      <div className="absolute bottom-0 inset-x-0 z-50 pointer-events-none p-4 bg-gradient-to-t from-[#f5f9fc] via-[#f5f9fc]/40 to-transparent dark:from-gray-900 dark:via-gray-900/40 dark:to-transparent pt-12">
        <form
          onSubmit={handleSendMessage}
          className="pointer-events-auto bg-white/60 dark:bg-gray-900/60 backdrop-blur-md shadow-xl rounded-[28px] border border-sky-100 dark:border-gray-800"
        >
          <div className="flex items-center gap-2 p-1">
            <Input
              className="flex-1 min-h-[44px] border-0 bg-transparent dark:bg-transparent shadow-none px-4 focus-visible:ring-0 focus-visible:ring-offset-0 text-base placeholder:text-muted-foreground/70"
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              disabled={!isConnected}
            />
            <Button
              className={cn(
                "h-10 w-10 rounded-full flex-shrink-0 mr-1",
                "bg-sky-500 hover:bg-sky-600 text-white dark:bg-sky-500 dark:hover:bg-sky-600 shadow-md",
                "transition-all duration-300",
                !newMessage.trim() && "opacity-50"
              )}
              type="submit"
              disabled={!isConnected || !newMessage.trim()}
            >
              <HugeIcon name="ArrowUp02" className="size-4" />
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
