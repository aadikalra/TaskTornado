'use client';

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HugeIcon } from '@/lib/huge-icon-map';
import { Message } from '@/components/ai-assistant/types';
import { MessageItem } from '@/components/ai-assistant/MessageItem';
import { ChatInput } from '@/components/ai-assistant/ChatInput';
import { Node, Text, Range, Transforms } from 'slate';
import { nanoid } from 'platejs';
import { getCommentKey } from '@platejs/comment';
import { discussionPlugin } from '@/components/editor/plugins/discussion-kit';

export function GraderSidebar({ editor }: { editor: any }) {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const [isInputFocused, setIsInputFocused] = useState(false);
  const [hasWiped, setHasWiped] = useState(false);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  
  const [expandedThoughts, setExpandedThoughts] = useState<Record<string, boolean>>({});
  const [expandedToolDetails, setExpandedToolDetails] = useState<Record<string, boolean>>({});
  const [expandedUserMessages, setExpandedUserMessages] = useState<Record<string, boolean>>({});

  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const findTextRange = (searchText: string): Range | null => {
    if (!editor || !searchText) return null;
    const searchTrimmed = searchText.trim();
    
    // Exact match
    for (const [node, path] of Node.texts(editor)) {
      const index = node.text.indexOf(searchTrimmed);
      if (index !== -1) {
        return {
          anchor: { path, offset: index },
          focus: { path, offset: index + searchTrimmed.length },
        };
      }
    }
    
    // Partial match fallback (if AI included extra punctuation or the text crosses a mark)
    // We'll just look for a substantial chunk of the text (e.g., first 20 chars)
    const chunk = searchTrimmed.length > 20 ? searchTrimmed.substring(0, 20) : searchTrimmed;
    if (chunk.length > 5) {
      for (const [node, path] of Node.texts(editor)) {
        const index = node.text.indexOf(chunk);
        if (index !== -1) {
          // Highlight the rest of this text node starting from the chunk
          return {
            anchor: { path, offset: index },
            focus: { path, offset: Math.min(node.text.length, index + searchTrimmed.length) },
          };
        }
      }
    }
    
    return null;
  };

  const extractText = (nodes: any[]): string => {
    if (!nodes) return '';
    return nodes.map(n => {
      if (typeof n.text === 'string') return n.text;
      if (Array.isArray(n.children)) return extractText(n.children);
      return '';
    }).join('\n');
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() && selectedImages.length === 0) return;

    setHasWiped(true);
    setTimeout(() => setHasWiped(false), 500);

    let docText = '';
    if (editor && editor.children) {
      docText = extractText(editor.children);
    }
    
    console.log("EXTRACTED TEXT:", docText);

    const newMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, newMessage]);
    setInput('');
    setIsLoading(true);

    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });

    try {
      const response = await fetch('/api/ai/grader', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, newMessage],
          documentContent: docText || 'Document is empty.',
        })
      });

      if (!response.ok) throw new Error('Failed to fetch AI response');
      const data = await response.json();

      let assistantMessageContent = '';
      const toolCalls: any[] = [];

      // Process actions
      if (data.actions && Array.isArray(data.actions)) {
        for (const action of data.actions) {
          if (action.action === 'message') {
            assistantMessageContent += (assistantMessageContent ? '\n\n' : '') + action.text;
          } else if (action.action === 'highlight_text') {
            toolCalls.push({ name: 'highlight_text', args: { textToHighlight: action.text }, status: 'success' });
            if (editor) {
              const range = findTextRange(action.text);
              if (range) {
                Transforms.select(editor, range);
                Transforms.setNodes(editor, { backgroundColor: '#fef08a' } as any, { match: Text.isText, split: true });
                Transforms.collapse(editor, { edge: 'end' });
              }
            }
          } else if (action.action === 'add_comment') {
            toolCalls.push({ name: 'add_comment', args: { textToCommentOn: action.text, commentText: action.comment }, status: 'success' });
            if (editor) {
              const range = findTextRange(action.text);
              if (range) {
                Transforms.select(editor, range);
                
                const discussionId = nanoid();
                
                Transforms.setNodes(editor, { 
                  [getCommentKey(discussionId)]: true
                } as any, { match: Text.isText, split: true });
                
                Transforms.collapse(editor, { edge: 'end' });
                
                const discussions = editor.getOption(discussionPlugin, 'discussions') || [];
                const newDiscussion = {
                  id: discussionId,
                  comments: [
                    {
                      id: nanoid(),
                      contentRich: [{ type: 'p', children: [{ text: action.comment }] }],
                      createdAt: new Date(),
                      discussionId: discussionId,
                      isEdited: false,
                      userId: 'aurora',
                      suggestedReplacement: action.suggestedReplacement
                    },
                  ],
                  createdAt: new Date(),
                  isResolved: false,
                  userId: 'aurora',
                };
                
                editor.setOption(discussionPlugin, 'discussions', [
                  ...discussions,
                  newDiscussion,
                ]);
              }
            }
          }
        }
      }

      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: assistantMessageContent || 'Done!',
        timestamp: new Date().toISOString(),
        toolCalls: toolCalls.length > 0 ? toolCalls : undefined,
        modelUsed: 'gemini-2.5-flash'
      }]);

    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry, I encountered an error while processing your request.',
        timestamp: new Date().toISOString(),
        modelUsed: 'gemini-2.5-flash'
      }]);
    } finally {
      setIsLoading(false);
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#f8fbfd]/50 dark:bg-[#0a0a0a]/50 backdrop-blur-xl relative">

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 pt-6 pb-32 space-y-4 scrollbar-thin scrollbar-thumb-sky-200 dark:scrollbar-thumb-gray-700 scrollbar-track-transparent scroll-smooth relative z-0">
        <AnimatePresence>
          {messages.length === 0 ? (
            <motion.div
              key="landing"
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="h-full flex flex-col items-center justify-center text-center p-8 absolute inset-0"
            >
              <div className="mb-6 p-4 rounded-full bg-sky-50 dark:bg-white/5">
                <HugeIcon name="SchoolReportCard" size={32} className="text-sky-400 dark:text-sky-500" />
              </div>
              <h2 className="text-xl font-medium text-sky-900 dark:text-sky-200 mb-2">
                Ready to review.
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 max-w-[250px]">
                Ask me to grade this essay, highlight thesis statements, or suggest structural edits.
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="chat"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-4"
            >
              {messages.map((msg, idx) => (
                <MessageItem 
                  key={`${msg.id}-${idx}`}
                  msg={msg}
                  idx={idx}
                  isLastAssistantMessage={messages.findIndex(m => m.role === 'assistant') === idx}
                  selectedModel="gemini-2.5-flash"
                  expandedThoughts={expandedThoughts}
                  setExpandedThoughts={setExpandedThoughts}
                  expandedToolDetails={expandedToolDetails}
                  setExpandedToolDetails={setExpandedToolDetails}
                  expandedUserMessages={expandedUserMessages}
                  setExpandedUserMessages={setExpandedUserMessages}
                  handleInteractiveButtonClick={() => {}}
                />
              ))}
              
              {isLoading && (
                <div className="flex justify-start">
                  <div className="max-w-[85%] rounded-2xl px-4 py-3 bg-white dark:bg-[#151515] border border-sky-100 dark:border-white/5 rounded-bl-sm shadow-sm flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} className="h-4" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Input Area */}
      <div className="absolute bottom-0 inset-x-0 z-10 pointer-events-none p-4 bg-linear-to-t from-white via-white/80 to-transparent dark:from-[#0a0a0a] dark:via-[#0a0a0a]/80 dark:to-transparent pt-12">
        <div className="pointer-events-auto">
          <ChatInput 
            input={input}
            setInput={setInput}
            handleSubmit={handleSubmit}
            handleKeyDown={handleKeyDown}
            inputRef={inputRef}
            fileInputRef={fileInputRef}
            hasWiped={hasWiped}
            setHasWiped={setHasWiped}
            selectedImages={selectedImages}
            removeImage={() => {}}
            handleImageUpload={() => {}}
            isAILoading={isLoading}
            handleStopResponse={() => {}}
            selectedModel="gemini-2.5-flash-lite"
            quickLimit={50}
            quickMessageCounter={0}
            deepLimit={10}
            deeperMessageCounter={0}
            cloudLimit={5}
            cloudMessageCounter={0}
            setIsInputFocused={setIsInputFocused}
            setChipRotation={() => {}}
          />
        </div>
      </div>
    </div>
  );
}
