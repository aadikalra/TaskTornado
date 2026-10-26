'use client';

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HugeIcon } from '@/lib/huge-icon-map';
import { Message } from '@/components/ai-assistant/types';
import { MessageItem } from '@/components/ai-assistant/MessageItem';
import { ChatInput } from '@/components/ai-assistant/ChatInput';
import { Text, Transforms } from 'slate';
import { findDocumentTextRange, getDocumentText, insertAuroraComment } from '@/components/editor/aurora-comments';
import { commentPlugin } from '@/components/editor/plugins/comment-kit';

export function GraderSidebar({ editor }: { editor: any }) {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const [isInputFocused, setIsInputFocused] = useState(false);
  const [hasWiped, setHasWiped] = useState(false);
  const [expandedThoughts, setExpandedThoughts] = useState<Record<string, boolean>>({});
  const [expandedToolDetails, setExpandedToolDetails] = useState<Record<string, boolean>>({});
  const [expandedUserMessages, setExpandedUserMessages] = useState<Record<string, boolean>>({});

  const inputRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || isLoading) return;

    setHasWiped(true);
    setTimeout(() => setHasWiped(false), 500);

    const docText = editor?.children ? getDocumentText(editor) : '';

    const newMessage: Message = {
      id: Date.now(),
      role: 'user',
      content: input,
      timestamp: new Date()
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

      const data = await response.json().catch(() => null);
      if (!response.ok) throw new Error(data?.error || 'Could not generate feedback. Please try again.');
      if (!Array.isArray(data?.actions)) throw new Error('Aurora returned no feedback. Please try again.');

      let assistantMessageContent = '';
      const toolCalls: any[] = [];
      let firstCommentId: string | null = null;
      let unmatched = 0;

      // Process actions
      if (data.actions && Array.isArray(data.actions)) {
        for (const action of data.actions) {
          if (action.action === 'message') {
            assistantMessageContent += (assistantMessageContent ? '\n\n' : '') + action.text;
          } else if (action.action === 'highlight_text') {
            const range = editor && findDocumentTextRange(editor, action.text);
            if (!range) { unmatched++; continue; }
            Transforms.setNodes(editor, { backgroundColor: '#fef08a' } as any, { at: range, match: Text.isText, split: true });
            toolCalls.push({ name: 'highlight_text', args: { textToHighlight: action.text }, status: 'success' });
          } else if (action.action === 'add_comment') {
            const id = editor && insertAuroraComment(editor, {
              excerpt: action.text,
              comment: action.comment,
              suggestedReplacement: action.suggestedReplacement,
            });
            if (!id) { unmatched++; continue; }
            firstCommentId ??= id;
            toolCalls.push({ name: 'add_comment', args: { textToCommentOn: action.text, commentText: action.comment }, status: 'success' });
          }
        }
      }
      if (firstCommentId) editor.setOption(commentPlugin, 'activeId', firstCommentId);
      if (unmatched) {
        assistantMessageContent += `\n\n${unmatched} passage${unmatched === 1 ? '' : 's'} could not be matched to the current document. No annotation was added to those passages.`;
      }

      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        role: 'assistant',
        content: assistantMessageContent || (firstCommentId ? 'I added comments to the marked passages. Click a comment mark to read the feedback.' : 'No feedback was added. Please try again.'),
        timestamp: new Date(),
        toolCalls: toolCalls.length > 0 ? toolCalls : undefined,
        modelUsed: 'Groq approved model'
      }]);

    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        role: 'assistant',
        content: error instanceof Error ? error.message : 'Could not generate feedback. Please try again.',
        isError: true,
        timestamp: new Date(),
        modelUsed: 'Groq approved model'
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
            hasWiped={hasWiped}
            setHasWiped={setHasWiped}
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
