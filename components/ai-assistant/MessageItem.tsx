'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { HugeIcon } from '@/lib/huge-icon-map';
import { Markdown } from '../markdown';
import { Button } from '../ui/button';
import { AIChecklist } from '@/components/ai-checklist';
import BulkAddHomeworkDisplay from '@/components/BulkAddHomeworkDisplay';
import { GenerationProgressBar } from './GenerationProgressBar';
import { AuraVideoIcon } from './AuraVideoIcon';
import { Message, InteractiveButton } from './types';

interface MessageItemProps {
  msg: Message;
  idx: number;
  isLastAssistantMessage: boolean;
  selectedModel: string;
  expandedThoughts: Record<string, boolean>;
  setExpandedThoughts: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  expandedToolDetails: Record<string, boolean>;
  setExpandedToolDetails: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  expandedUserMessages: Record<string, boolean>;
  setExpandedUserMessages: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  handleInteractiveButtonClick: (button: InteractiveButton) => void;
  onRetry?: (msg: Message) => void;
}

export const MessageItem = ({
  msg,
  idx,
  isLastAssistantMessage,
  selectedModel,
  expandedThoughts,
  setExpandedThoughts,
  expandedToolDetails,
  setExpandedToolDetails,
  expandedUserMessages,
  setExpandedUserMessages,
  handleInteractiveButtonClick,
  onRetry
}: MessageItemProps) => {
  const [isCopied, setIsCopied] = React.useState(false);

  const handleCopy = async () => {
    if (!msg.content) return;
    try {
      await navigator.clipboard.writeText(msg.content);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy AI response:', err);
    }
  };

  const outputTokens = msg.usage?.completionTokens ?? Math.max(1, Math.ceil(((msg.content?.length || 0) + (msg.thought?.length || 0)) / 4.0));
  const inputTokens = msg.usage?.promptTokens ?? Math.max(50, Math.ceil(((msg.content?.length || 20) * 1.2) / 4.0) + 360);
  const totalTokens = msg.usage?.totalTokens ?? (inputTokens + outputTokens);

  return (
    <div
      className={cn(
        'group flex flex-col gap-1.5 animate-in fade-in duration-300 slide-in-from-bottom-2 relative',
        msg.role === 'user' ? 'items-end' : 'items-start'
      )}
    >
      {msg.role === 'assistant' && (
        <div className="flex flex-col gap-1 w-full">
          <div className="flex items-start gap-2">
            <div className="flex-shrink-0">
              <AuraVideoIcon
                isLoading={msg.isLoading}
                selectedModel={selectedModel}
                layoutId={isLastAssistantMessage ? "aurora-sphere" : undefined}
              />
            </div>
            {(msg.thought || msg.toolCall || (msg.groundingMetadata?.webSearchQueries && msg.groundingMetadata.webSearchQueries.length > 0)) && (
              <div className="select-none">
                <button
                  onClick={() => setExpandedThoughts(prev => ({ ...prev, [msg.id]: !prev[msg.id] }))}
                  className="flex items-center gap-1 text-[13px] text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors cursor-pointer list-none font-medium h-8 outline-none"
                >
                  <span>
                    {msg.isLoading && !msg.content
                      ? (msg.toolCall
                        ? (msg.toolCall === 'start_flashcards' ? 'Opening flashcards...' : msg.toolCall === 'start_quiz' ? 'Starting quiz...' : 'Checking schedule...')
                        : 'Thinking...')
                      : 'Show thinking'}
                  </span>
                  <svg
                    className={cn(
                      "w-3.5 h-3.5 transition-transform duration-200 text-zinc-500 dark:text-zinc-400",
                      expandedThoughts[msg.id] ? "rotate-180" : "rotate-0"
                    )}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.5}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <AnimatePresence initial={false}>
                  {expandedThoughts[msg.id] && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: 'easeInOut' }}
                      className="overflow-hidden"
                    >
                      <div className="mt-1 text-xs font-light text-zinc-500 dark:text-zinc-400 py-1.5 whitespace-pre-wrap max-w-prose leading-relaxed flex flex-col gap-2.5">
                        {(() => {
                          const toolCalls: Array<{ name: string; args?: any; status?: 'loading' | 'success' | 'error'; error?: string }> = msg.toolCalls && msg.toolCalls.length > 0
                            ? msg.toolCalls
                            : msg.toolCall
                              ? [{ name: msg.toolCall, args: msg.toolArgs, status: msg.isLoading ? 'loading' as const : 'success' as const }]
                              : [];

                          if (toolCalls.length === 0) return null;

                          const grouped = toolCalls.reduce((acc, tc) => {
                            const name = tc.name;
                            if (!acc[name]) {
                              acc[name] = [];
                            }
                            acc[name].push(tc);
                            return acc;
                          }, {} as Record<string, typeof toolCalls>);

                          return (
                            <div className="flex flex-col gap-2 w-full">
                              {Object.entries(grouped).map(([toolName, calls]) => {
                                const isExpanded = !!expandedToolDetails[`${msg.id}-${toolName}`];
                                
                                let displayLabel = toolName;
                                if (toolName === 'get_school_data') displayLabel = 'Check Schedule';
                                else if (toolName === 'start_flashcards') displayLabel = 'Open Flashcards';
                                else if (toolName === 'start_quiz') displayLabel = 'Start Quiz';
                                else if (toolName === 'calculate_expression') displayLabel = 'Calculate Expression';
                                else if (toolName === 'add_homework') displayLabel = 'Add Homework';
                                else if (toolName === 'add_test') displayLabel = 'Add Test';
                                else if (toolName === 'show_homeworks') displayLabel = 'Show Homework';
                                else if (toolName === 'delete_homework') displayLabel = 'Delete Homework';
                                else if (toolName === 'delete_test') displayLabel = 'Delete Test';
                                else {
                                  displayLabel = toolName.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
                                }

                                const count = calls.length;
                                const hasLoading = calls.some(c => c.status === 'loading');
                                const hasError = calls.some(c => c.status === 'error');
                                const isAddCommand = toolName === 'add_homework' || toolName === 'add_multiple_homeworks' || toolName === 'add_test';

                                return (
                                  <div key={toolName} className="flex flex-col gap-2 w-full max-w-full">
                                    <button
                                      onClick={() => {
                                        setExpandedToolDetails(prev => ({
                                          ...prev,
                                          [`${msg.id}-${toolName}`]: !prev[`${msg.id}-${toolName}`]
                                        }));
                                      }}
                                      className={cn(
                                        "flex items-center justify-between gap-3 text-[12px] font-medium transition-all duration-200 border rounded-[14px] px-3.5 py-1.5 backdrop-blur-sm w-full outline-none",
                                        hasError
                                          ? "text-rose-700 dark:text-rose-300 bg-rose-500/10 border-rose-500/20 hover:bg-rose-500/15"
                                          : hasLoading
                                            ? "text-amber-700 dark:text-amber-300 bg-amber-500/10 border-amber-500/20 hover:bg-amber-500/15"
                                            : isAddCommand
                                              ? "text-blue-700 dark:text-blue-300 bg-blue-500/10 border-blue-500/20 hover:bg-blue-500/15"
                                              : "text-emerald-700 dark:text-emerald-300 bg-emerald-500/10 border-emerald-500/20 hover:bg-emerald-500/15"
                                      )}
                                    >
                                      <div className="flex items-center gap-2">
                                        {isAddCommand ? (
                                          <HugeIcon name="PlusSign" className={cn(
                                            "w-3.5 h-3.5",
                                            hasError ? "text-rose-600 dark:text-rose-400" : hasLoading ? "text-amber-600 dark:text-amber-400 animate-pulse" : "text-blue-600 dark:text-blue-400"
                                          )} size={14} />
                                        ) : (
                                          <HugeIcon name="Search01" className={cn(
                                            "w-3.5 h-3.5",
                                            hasError ? "text-rose-600 dark:text-rose-400" : hasLoading ? "text-amber-600 dark:text-amber-400 animate-pulse" : "text-emerald-600 dark:text-emerald-400"
                                          )} size={14} />
                                        )}
                                        <span>
                                          {displayLabel}
                                        </span>
                                        <span className={cn(
                                          "text-[10px] font-bold px-1.5 py-0.5 rounded-full",
                                          hasError
                                            ? "bg-rose-500/20 text-rose-800 dark:text-rose-200"
                                            : hasLoading
                                              ? "bg-amber-500/20 text-amber-800 dark:text-amber-200"
                                              : isAddCommand
                                                ? "bg-blue-500/20 text-blue-800 dark:text-blue-200"
                                                : "bg-emerald-500/20 text-emerald-800 dark:text-emerald-200"
                                        )}>
                                          {count}
                                        </span>
                                      </div>
                                      <svg
                                        className={cn(
                                          "w-3.5 h-3.5 transition-transform duration-200",
                                          isExpanded ? "rotate-180" : "rotate-0",
                                          hasError
                                            ? "text-rose-600/80 dark:text-rose-400/80"
                                            : hasLoading
                                              ? "text-amber-600/80 dark:text-amber-400/80"
                                              : isAddCommand
                                                ? "text-blue-600/80 dark:text-blue-400/80"
                                                : "text-emerald-600/80 dark:text-emerald-400/80"
                                        )}
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                        strokeWidth={1.5}
                                      >
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                                      </svg>
                                    </button>

                                    <AnimatePresence>
                                      {isExpanded && (
                                        <motion.div
                                          initial={{ height: 0, opacity: 0 }}
                                          animate={{ height: 'auto', opacity: 1 }}
                                          exit={{ height: 0, opacity: 0 }}
                                          transition={{ duration: 0.2, ease: 'easeOut' }}
                                          className="overflow-hidden pl-1"
                                        >
                                          <div className="flex flex-col gap-2 mt-1 py-1 w-full">
                                            {calls.map((tc, idx) => {
                                              const status = tc.status || 'success';
                                              const hasArgs = tc.args && Object.keys(tc.args).length > 0;
                                              
                                              return (
                                                <div
                                                  key={idx}
                                                  className={cn(
                                                    "flex flex-col gap-2 p-2.5 rounded-[12px] border text-[11px] transition-colors w-full",
                                                    status === 'error'
                                                      ? "bg-rose-50 dark:bg-rose-950/20 border-rose-200/50 dark:border-rose-900/30"
                                                      : status === 'loading'
                                                        ? "bg-amber-50/50 dark:bg-amber-950/10 border-amber-200/50 dark:border-amber-900/30 animate-pulse"
                                                        : "bg-zinc-50 dark:bg-zinc-900/40 border-zinc-200/60 dark:border-zinc-800/60"
                                                  )}
                                                >
                                                  <div className="flex items-center justify-between">
                                                    <span className="font-semibold text-zinc-500 dark:text-zinc-400">
                                                      Execution #{idx + 1}
                                                    </span>
                                                    <span className={cn(
                                                      "font-semibold px-2 py-0.5 rounded-full text-[10px] tracking-wide inline-flex items-center gap-1",
                                                      status === 'success'
                                                        ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-300"
                                                        : status === 'error'
                                                          ? "bg-rose-100 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300"
                                                          : "bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300"
                                                    )}>
                                                      {status === 'success' && (
                                                        <>
                                                          <span className="w-1 h-1 rounded-full bg-emerald-500" />
                                                          Succeeded
                                                        </>
                                                      )}
                                                      {status === 'error' && (
                                                        <>
                                                          <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                                                          Failed
                                                        </>
                                                      )}
                                                      {status === 'loading' && (
                                                        <>
                                                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />
                                                          Executing...
                                                        </>
                                                      )}
                                                    </span>
                                                  </div>

                                                  {status === 'error' && tc.error && (
                                                    <div className="text-rose-600 dark:text-rose-400 bg-rose-500/5 p-2 rounded-lg border border-rose-500/10 font-normal leading-relaxed whitespace-pre-wrap">
                                                      {tc.error}
                                                    </div>
                                                  )}

                                                  {hasArgs ? (
                                                    <div className="grid grid-cols-2 gap-2 mt-1 pt-1.5 border-t border-zinc-200/50 dark:border-zinc-800/50">
                                                      {Object.entries(tc.args).map(([key, val]) => {
                                                        const displayKey = key.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
                                                        
                                                        if (val && Array.isArray(val)) {
                                                          return (
                                                            <div key={key} className="col-span-2 flex flex-col gap-1.5 mt-1 pt-1.5 border-t border-zinc-200/50 dark:border-zinc-800/40">
                                                              <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-semibold tracking-wide">
                                                                {displayKey} ({val.length})
                                                              </span>
                                                              <div className="flex flex-col gap-1.5">
                                                                {val.map((item: any, itemIdx: number) => {
                                                                  if (typeof item === 'object' && item !== null) {
                                                                    return (
                                                                      <div
                                                                        key={itemIdx}
                                                                        className="bg-white/60 dark:bg-zinc-800/55 border border-zinc-200/40 dark:border-zinc-700/40 rounded-[10px] p-2 flex flex-col gap-1.5 w-full"
                                                                      >
                                                                        <div className="flex items-center justify-between border-b border-zinc-200/30 dark:border-zinc-700/30 pb-1 mb-0.5">
                                                                          <span className="font-semibold text-zinc-800 dark:text-zinc-200 text-[11px]">
                                                                            {item.title || item.question || `Item #${itemIdx + 1}`}
                                                                          </span>
                                                                          {item.className && (
                                                                            <span className="bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 font-bold text-[9px] px-1.5 py-0.5 rounded-md">
                                                                              {item.className}
                                                                          </span>
                                                                          )}
                                                                        </div>
                                                                        <div className="grid grid-cols-2 gap-1.5 text-[10px]">
                                                                          {item.dueDate && (
                                                                            <div className="flex flex-col">
                                                                              <span className="text-zinc-400 dark:text-zinc-500 font-medium">Due Date</span>
                                                                              <span className="text-zinc-600 dark:text-zinc-400">{item.dueDate}</span>
                                                                            </div>
                                                                          )}
                                                                          {item.priority && (
                                                                            <div className="flex flex-col">
                                                                              <span className="text-zinc-400 dark:text-zinc-500 font-medium">Priority</span>
                                                                              <span className="text-zinc-600 dark:text-zinc-400 capitalize">{item.priority}</span>
                                                                            </div>
                                                                          )}
                                                                          {item.description && (
                                                                            <div className="col-span-2 flex flex-col">
                                                                              <span className="text-zinc-400 dark:text-zinc-500 font-medium">Description</span>
                                                                              <span className="text-zinc-600 dark:text-zinc-400 break-words font-light leading-snug">{item.description}</span>
                                                                            </div>
                                                                          )}
                                                                        </div>
                                                                      </div>
                                                                    );
                                                                  }
                                                                  return (
                                                                    <div key={itemIdx} className="text-zinc-600 dark:text-zinc-400 pl-2 border-l border-zinc-200 dark:border-zinc-700 font-light text-[10px]">
                                                                      {String(item)}
                                                                    </div>
                                                                  );
                                                                })}
                                                              </div>
                                                            </div>
                                                          );
                                                        }

                                                        let displayVal = '';
                                                        if (val === null || val === undefined) {
                                                          displayVal = 'None';
                                                        } else if (typeof val === 'object') {
                                                          displayVal = JSON.stringify(val);
                                                        } else {
                                                          displayVal = String(val);
                                                        }

                                                        return (
                                                          <div key={key} className="flex flex-col gap-0.5 min-w-0">
                                                            <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-medium tracking-wide">
                                                              {displayKey}
                                                            </span>
                                                            <span className="text-[11px] text-zinc-700 dark:text-zinc-300 font-normal truncate hover:text-clip hover:whitespace-normal break-words" title={displayVal}>
                                                              {displayVal}
                                                            </span>
                                                          </div>
                                                        );
                                                      })}
                                                    </div>
                                                  ) : (
                                                    <div className="text-[10px] text-zinc-400 dark:text-zinc-500 font-normal italic mt-0.5">
                                                      No parameters passed
                                                    </div>
                                                  )}
                                                </div>
                                              );
                                            })}
                                          </div>
                                        </motion.div>
                                      )}
                                    </AnimatePresence>
                                  </div>
                                );
                              })}
                            </div>
                          );
                        })()}

                        {msg.groundingMetadata?.webSearchQueries && msg.groundingMetadata.webSearchQueries.length > 0 && (
                          <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-2 text-[12px] font-medium text-sky-700 dark:text-sky-300 bg-sky-500/10 dark:bg-sky-500/20 border border-sky-500/20 dark:border-sky-500/10 rounded-[14px] w-fit px-3 py-1.5 backdrop-blur-sm">
                              <HugeIcon name="Search01" className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" size={14} />
                              <span>
                                Used Google Search: "{msg.groundingMetadata.webSearchQueries.join(', ')}"
                              </span>
                            </div>
                            {msg.groundingMetadata.groundingChunks && msg.groundingMetadata.groundingChunks.length > 0 && (
                              <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-zinc-500 dark:text-zinc-400 pl-3">
                                <span className="font-semibold text-sky-600/90 dark:text-sky-400/90">Sources:</span>
                                {msg.groundingMetadata.groundingChunks.map((chunk: any, i: number) => {
                                  if (!chunk.web) return null;
                                  return (
                                    <a
                                      key={i}
                                      href={chunk.web.uri}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center gap-1 bg-[#f5f9fc] dark:bg-zinc-800/80 border border-sky-100/50 dark:border-zinc-700/50 rounded-full px-2.5 py-0.5 hover:bg-sky-50 dark:hover:bg-zinc-700 text-sky-700 dark:text-sky-300 font-medium transition-colors"
                                    >
                                      <span>{chunk.web.title || new URL(chunk.web.uri).hostname}</span>
                                      <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                                      </svg>
                                    </a>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        )}
                        {msg.thought && (
                          <div className="flex flex-col gap-3 mt-1">
                            {msg.thought.split('\n\n').filter((p: string) => p.trim() !== '').map((para: string, pIdx: number) => (
                              <div
                                key={pIdx}
                                className="border-l border-zinc-200 dark:border-zinc-800 pl-3 text-zinc-600 dark:text-zinc-400 font-light"
                              >
                                {para}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>
      )}
      <div
        onClick={() => {
          if (msg.role === 'user' && msg.content.length > 120) {
            setExpandedUserMessages(prev => ({ ...prev, [msg.id]: !prev[msg.id] }));
          }
        }}
        className={cn(
          'transition-all duration-300',
          msg.role === 'user'
            ? 'max-w-[85%] rounded-[24px] px-4 py-2.5 text-sm text-white shadow-lg shadow-[#8A9AFF]/15 font-medium leading-relaxed'
            : cn('bg-transparent text-sky-900 dark:text-sky-100 text-[14.5px] leading-[1.6] px-1', (msg.bulkAddDisplay || msg.checklist) ? 'w-full max-w-full' : 'max-w-[90%]'),
          msg.role === 'user' && msg.content.length > 120 && 'cursor-pointer hover:brightness-105 active:scale-[0.99] transition-transform select-none',
          msg.isError &&
          'bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20 rounded-[24px] px-4 py-2.5'
        )}
        style={msg.role === 'user' && !msg.isError ? {
          background: 'linear-gradient(135deg, #94A2FF 0%, #7B8DFE 100%)'
        } : {}}
      >
        <div className="flex-1 min-w-0">
          {msg.images && msg.images.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-2">
              {msg.images.map((img, i) => (
                <img
                  key={i}
                  src={img}
                  alt={`Uploaded ${i}`}
                  className="max-w-full max-h-48 rounded-md border"
                />
              ))}
            </div>
          )}

          {/* Always render the content, even if it's just "Thinking..." */}
          {msg.isLoading ? (
            msg.content === "Thinking..." ? (
              <span className={cn("opacity-70", !msg.thought && "animate-pulse")}>
                {msg.thought ? "Generating response..." : "Thinking..."}
              </span>
            ) : (
              <div className="whitespace-pre-wrap">
                {msg.chunks ? (
                  msg.chunks.map((chunk, i) => (
                    <motion.span
                      key={i}
                      initial={{ opacity: 0, y: 1 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2 }}
                      className="inline"
                    >
                      {chunk}
                    </motion.span>
                  ))
                ) : (
                  <Markdown>{msg.content}</Markdown>
                )}
                {(msg.content.startsWith('Generating quiz') || msg.content.startsWith('Generating flashcards') || msg.content.startsWith('Generating checklist')) && (
                  <GenerationProgressBar />
                )}
              </div>
            )
          ) : (
            <Markdown>
              {msg.role === 'user' && msg.content.length > 120 && !expandedUserMessages[msg.id]
                ? msg.content.slice(0, 120) + '...'
                : msg.content}
            </Markdown>
          )}

          {/* Inline Checklist */}
          {msg.role === 'assistant' && msg.checklist && (
            <div className="mt-4 max-w-[90%]">
              <AIChecklist
                initialTitle={msg.checklist.title}
                initialItems={msg.checklist.items}
              />
            </div>
          )}

          {/* Bulk Add Display */}
          {msg.role === 'assistant' && msg.bulkAddDisplay && (
            <div className="mt-4 w-full max-w-full">
              <BulkAddHomeworkDisplay
                homeworks={msg.bulkAddDisplay.homeworks}
                classes={msg.bulkAddDisplay.classes}
              />
            </div>
          )}

          {/* Interactive Buttons */}
          {msg.role === 'assistant' && msg.interactiveButtons && msg.interactiveButtons.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {msg.interactiveButtons.map((button) => (
                <Button
                  key={button.id}
                  type="button"
                  onClick={(e: React.MouseEvent) => {
                    e.preventDefault();
                    handleInteractiveButtonClick(button);
                  }}
                  size="sm"
                  className={cn(
                    "text-xs h-8 px-3.5 rounded-full transition-all duration-200 font-medium shadow-xs select-none flex items-center justify-center gap-1.5 border",
                    button.style === 'primary'
                      ? "bg-sky-500 hover:bg-sky-600 text-white border-transparent shadow-sm shadow-sky-500/10 active:scale-95"
                      : button.style === 'outline'
                        ? "bg-transparent hover:bg-sky-50/50 dark:hover:bg-sky-500/5 text-sky-600 dark:text-sky-400 border-sky-200 dark:border-sky-800/80 active:scale-95"
                        : "bg-sky-50 dark:bg-sky-950/20 hover:bg-sky-100/80 dark:hover:bg-sky-950/40 text-sky-700 dark:text-sky-300 border-transparent active:scale-95"
                  )}
                >
                  {button.text}
                  {button.shortcut && (
                    <span className="ml-1 text-[10px] font-bold opacity-60 px-1 py-0.5 rounded-md bg-black/5 dark:bg-white/10">
                      {button.shortcut}
                    </span>
                  )}
                </Button>
              ))}
            </div>
          )}

          {/* Hover Toolbar for Assistant Messages (Icon-only, aligned left to AI text) */}
          {msg.role === 'assistant' && !msg.isLoading && (
            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center gap-1 mt-1 pl-0 select-none">
              <button
                type="button"
                onClick={handleCopy}
                className="p-1 rounded-md text-zinc-400 hover:text-sky-600 dark:hover:text-sky-300 hover:bg-sky-50 dark:hover:bg-zinc-800/80 transition-colors cursor-pointer"
                title={isCopied ? "Copied to clipboard" : "Copy response"}
              >
                <HugeIcon name={isCopied ? "CopyCheck" : "Copy01"} size={14} className="w-3.5 h-3.5" />
              </button>

              {onRetry && (
                <button
                  type="button"
                  onClick={() => onRetry(msg)}
                  className="p-1 rounded-md text-zinc-400 hover:text-sky-600 dark:hover:text-sky-300 hover:bg-sky-50 dark:hover:bg-zinc-800/80 transition-colors cursor-pointer"
                  title="Retry response"
                >
                  <HugeIcon name="Reload" size={14} className="w-3.5 h-3.5" />
                </button>
              )}

              {/* Token Breakdown Popover */}
              <div className="relative group/token border-l border-zinc-200/80 dark:border-zinc-800/80 pl-2 ml-1">
                <span className="text-[10.5px] font-medium text-zinc-400/90 dark:text-zinc-500/90 tracking-tight cursor-pointer hover:text-sky-600 dark:hover:text-sky-400 transition-colors">
                  {totalTokens} tokens
                </span>

                {/* Popup Breakdown */}
                <div className="absolute bottom-full left-0 mb-2 hidden group-hover/token:flex flex-col gap-1.5 p-2.5 rounded-xl bg-white/95 dark:bg-zinc-900/95 border border-sky-100 dark:border-zinc-800 shadow-xl backdrop-blur-md text-[11px] font-medium text-zinc-700 dark:text-zinc-300 whitespace-nowrap z-50 animate-in fade-in zoom-in-95 duration-150 pointer-events-none min-w-[130px]">
                  <div className="flex items-center justify-between gap-3 text-zinc-400 dark:text-zinc-500 font-semibold border-b border-zinc-100 dark:border-zinc-800/80 pb-1 text-[10px] uppercase tracking-wider">
                    <span>Token Count</span>
                    <span className="text-sky-600 dark:text-sky-400 font-bold">{totalTokens}</span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-zinc-400 dark:text-zinc-500 text-[10.5px]">Input Tokens</span>
                    <span className="font-semibold text-zinc-700 dark:text-zinc-200">{inputTokens}</span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-zinc-400 dark:text-zinc-500 text-[10.5px]">Output Tokens</span>
                    <span className="font-semibold text-zinc-700 dark:text-zinc-200">{outputTokens}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
