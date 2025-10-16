'use client';

import React, {
  useState,
  useRef,
  useEffect,
  ChangeEvent,
  FormEvent,
  KeyboardEvent,
} from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useHotkeys } from 'react-hotkeys-hook';
import { useAI } from '@/context/AIContext';
import { useClassContext } from '@/context/ClassContext';
import {
  Send,
  X,
  MessageSquare,
  Sparkles,
  Loader2,
  AlertCircle,
  Image as ImageIcon,
  Paperclip,
  X as XIcon,
  ArrowUp,
  BookOpen,
  CheckCircle,
  PlusCircle,
} from 'lucide-react';
import { Bot } from '@/components/animate-ui/icons/bot';
import { UserRound } from '@/components/animate-ui/icons/user-round';
import { AnimateIcon } from '@/components/animate-ui/animate-icon';
import { Button } from './ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { Textarea } from './ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { Markdown } from './markdown';
import { ResizablePanel } from './ui/resizable-panel';

/* -------------------------------------------------------------------------- */
/*                                   Types                                   */
/* -------------------------------------------------------------------------- */

interface Class {
  id: string;
  name: string;
}
interface Homework {
  id: string;
  title: string;
  classId: string;
  dueDate: string; // ISO string
  completed: boolean;
}
interface Message {
  id: number;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isLoading?: boolean;
  isError?: boolean;
  images?: string[];
}

/* -------------------------------------------------------------------------- */
/*                              Animation variants                           */
/* -------------------------------------------------------------------------- */

const messageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  exit: { opacity: 0, scale: 0.9, transition: { duration: 0.2 } },
};

export function FullScreenAIAssistant() {
  // Context hooks with error handling - must be called unconditionally at the top level
  const aiContext = useAI();
  const classContext = useClassContext();
  
  // Destructure context values with defaults to avoid runtime errors
  const { 
    chat, 
    isLoading: isAILoadingProp = false, 
    error: aiError, 
    setError = () => {}
  } = aiContext || {};
  
  const { 
    homeworks = [], 
    classes = [], 
    addHomework = () => Promise.resolve(), 
    toggleHomework = () => Promise.resolve() 
  } = classContext || {};

  /* ---------------------------------------------------------------------- */
  /*                                 State                                    */
  /* ---------------------------------------------------------------------- */
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isAILoading, setIsAILoading] = useState(false);
  const [showHomeworkEffect, setShowHomeworkEffect] = useState(false);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [activeCommand, setActiveCommand] = useState<'homework' | 'control' | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  /* ---------------------------------------------------------------------- */
  /*                         Image upload handlers                          */
  /* ---------------------------------------------------------------------- */
  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach((file) => {
      if (!file.type.startsWith('image/')) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        setSelectedImages((prev) => [...prev, ev.target?.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setSelectedImages((prev) => prev.filter((_, i) => i !== index));
  };

  /* ---------------------------------------------------------------------- */
  /*                              Effects                                    */
  /* ---------------------------------------------------------------------- */
  // Detect @ commands
  useEffect(() => {
    const inputLower = input.toLowerCase();
    const hasHomework = inputLower.includes('@homework');
    const hasControl = inputLower.includes('@control');

    if (hasHomework) {
      setActiveCommand('homework');
      setShowHomeworkEffect(true);
    } else if (hasControl) {
      setActiveCommand('control');
      setShowHomeworkEffect(false);
    } else {
      setActiveCommand(null);
      setShowHomeworkEffect(false);
    }
  }, [input]);

  // Show AI error as a message
  useEffect(() => {
    if (aiError) {
      const errorMessage =
        typeof aiError === 'string'
          ? aiError
          : (aiError as Error)?.message || 'An error occurred';

      setMessages((prev) => [
        ...prev,
        {
          id: prev.length,
          role: 'assistant',
          content: `Error: ${errorMessage}`,
          timestamp: new Date(),
          isError: true,
        },
      ]);
      setError(null);
    }
  }, [aiError, setError]);

  // Auto‑scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  /* ---------------------------------------------------------------------- */
  /*                         Helper & Parsing Functions                      */
  /* ---------------------------------------------------------------------- */
  const toggleHomeworkStatus = async (
    homeworkId: string,
    markAsDone: boolean
  ): Promise<boolean> => {
    try {
      const homework = homeworks.find((hw) => hw.id === homeworkId);
      if (homework && homework.completed !== markAsDone) {
        await toggleHomework(homeworkId);
      }
      return true;
    } catch (error) {
      console.error(
        `Error ${markAsDone ? 'marking' : 'unmarking'} homework:`,
        error
      );
      return false;
    }
  };

  // --------------------------------------------------------------
  // (Parsing, control command handling and all the other helper
  //   functions stay exactly the same – they have been omitted for brevity)
  // --------------------------------------------------------------

  /* ---------------------------------------------------------------------- */
  /*                            Submit handling                               */
  /* ---------------------------------------------------------------------- */
  // (handleSubmit, handleKeyDown, toggleChat stay the same)

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    /* … unchanged – copy‑paste the original function … */
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (input.trim() && !isAILoading) {
        handleSubmit(e as unknown as FormEvent<HTMLFormElement>);
      }
    }
  };

  const toggleChat = () => setIsOpen((prev) => !prev);

  /* ---------------------------------------------------------------------- */
  /*                     Group messages for UI rendering                     */
  /* ---------------------------------------------------------------------- */
  const getMessageGroups = () => {
    const groups: Array<{
      role: 'user' | 'assistant';
      messages: Message[];
    }> = [];

    if (messages.length === 0) return groups;

    let current = {
      role: messages[0].role,
      messages: [messages[0]] as Message[],
    };

    for (let i = 1; i < messages.length; i++) {
      if (messages[i].role === current.role) {
        current.messages.push(messages[i]);
      } else {
        groups.push(current);
        current = {
          role: messages[i].role,
          messages: [messages[i]],
        };
      }
    }
    groups.push(current);
    return groups;
  };

  const messageGroups = getMessageGroups();

  /* ---------------------------------------------------------------------- */
  /*                                 Render                                   */
  /* ---------------------------------------------------------------------- */
  return (
    <div>
      {/* ----------  FULL‑SCREEN DIALOG ---------- */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop (click = close) */}
            <motion.div
              className="fixed inset-0 bg-black/30 backdrop-blur-sm pointer-events-auto"
              onClick={() => setIsOpen(false)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />

            {/* Full‑screen panel */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 40 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed inset-0 flex flex-col bg-background border-t border-border pointer-events-auto"
            >
              {/* Header */}
              <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm p-4 flex justify-between items-center border-b border-gray-200/50 dark:border-gray-800/50">
                <div className="flex items-center space-x-3">
                  <AnimateIcon animateOnHover>
                    <div className="p-1.5 rounded-lg bg-gradient-to-br from-primary to-primary/80">
                      <Bot className="h-5 w-5 text-white" />
                    </div>
                  </AnimateIcon>
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">
                      Study Assistant
                    </h3>
                    <div className="flex items-center space-x-2">
                      <p className="text-xs text-muted-foreground">
                        AI‑powered learning guide
                      </p>
                      <Link
                        href="/ai-guidelines"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline text-xs"
                        onClick={(e) => e.stopPropagation()}
                      >
                        Guidelines
                      </Link>
                    </div>
                  </div>
                </div>

                {/* Close button */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-full text-muted-foreground hover:bg-gray-100 dark:hover:bg-gray-800/50"
                  onClick={() => setIsOpen(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700 scrollbar-track-transparent">
                {messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-6">
                    <div className="mb-4 p-3.5 rounded-2xl bg-gradient-to-br from-primary/5 to-primary/10 dark:from-primary/10 dark:to-primary/20">
                      <Sparkles className="h-7 w-7 text-primary" />
                    </div>
                    <h3 className="text-lg font-medium text-foreground mb-2">
                      How can I help you study today?
                    </h3>
                    <p className="text-sm text-muted-foreground max-w-xs mb-6">
                      Ask me anything about your school work, or try one of
                      these:
                    </p>
                    <div className="w-full max-w-xs grid grid-cols-1 gap-2">
                      <button
                        type="button"
                        onClick={() => setInput('@homework')}
                        className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-xl bg-primary/5 hover:bg-primary/10 text-foreground transition-colors border border-border/50 hover:border-primary/30"
                      >
                        <BookOpen className="h-4 w-4 text-primary" />
                        View my homework
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setInput('@control mark "math" as done')
                        }
                        className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-xl bg-primary/5 hover:bg-primary/10 text-foreground transition-colors border border-border/50 hover:border-primary/30"
                      >
                        <CheckCircle className="h-4 w-4 text-primary" />
                        Mark assignment as complete
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setInput(
                            '@control create homework for "math" due tomorrow: "Complete exercises 1-5"'
                          )
                        }
                        className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-xl bg-primary/5 hover:bg-primary/10 text-foreground transition-colors border border-border/50 hover:border-primary/30"
                      >
                        <PlusCircle className="h-4 w-4 text-primary" />
                        Add new homework
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {messages.map((msg, idx) => (
                      <div
                        key={`${msg.id}-${idx}`}
                        className={cn(
                          'group flex items-start gap-3',
                          msg.role === 'user' ? 'justify-end' : 'justify-start'
                        )}
                      >
                        {msg.role === 'assistant' && (
                          <AnimateIcon animateOnHover>
                            <div className="p-1.5 rounded-lg bg-gradient-to-br from-primary/5 to-primary/10 dark:from-primary/10 dark:to-primary/20">
                              <Bot className="h-4 w-4 text-primary" />
                            </div>
                          </AnimateIcon>
                        )}
                        <div
                          className={cn(
                            'max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed',
                            msg.role === 'user'
                              ? 'bg-primary text-white rounded-tr-sm'
                              : 'bg-gray-50 text-gray-900 dark:bg-gray-800 dark:text-gray-100 rounded-tl-sm',
                            msg.isError
                              ? 'bg-destructive/10 text-destructive dark:text-destructive-foreground'
                              : 'shadow-sm'
                          )}
                        >
                          {msg.isLoading ? (
                            <div className="flex items-center space-x-1.5 py-1">
                              <div
                                className="h-1.5 w-1.5 rounded-full bg-primary dark:bg-primary-foreground/80 animate-bounce"
                                style={{ animationDelay: '0ms' }}
                              />
                              <div
                                className="h-1.5 w-1.5 rounded-full bg-primary dark:bg-primary-foreground/80 animate-bounce"
                                style={{ animationDelay: '150ms' }}
                              />
                              <div
                                className="h-1.5 w-1.5 rounded-full bg-primary dark:bg-primary-foreground/80 animate-bounce"
                                style={{ animationDelay: '300ms' }}
                              />
                            </div>
                          ) : (
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
                              <Markdown>{msg.content}</Markdown>
                            </div>
                          )}
                        </div>
                        {msg.role === 'user' && (
                          <AnimateIcon animateOnHover>
                            <div className="p-1.5 rounded-lg bg-primary/5 dark:bg-primary/20">
                              <UserRound className="h-4 w-4 text-primary" />
                            </div>
                          </AnimateIcon>
                        )}
                      </div>
                    ))}
                    <div ref={messagesEndRef} className="h-4" />
                  </div>
                )}
              </div>

              {/* Input area */}
              <div className="border-t border-gray-100/50 dark:border-gray-800/50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
                <form onSubmit={handleSubmit} className="flex items-end gap-2 p-3">
                  <div className="flex-1">
                    {/* Image preview */}
                    {selectedImages.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-2">
                        {selectedImages.map((img, i) => (
                          <div key={i} className="relative group">
                            <img
                              src={img}
                              alt={`Uploaded ${i}`}
                              className="h-16 w-16 object-cover rounded-md border"
                            />
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                removeImage(i);
                              }}
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <XIcon className="h-3 w-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="relative">
                      {/* Command tooltips */}
                      {activeCommand === 'homework' && (
                        <div className="absolute -top-8 left-0 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 text-xs px-2 py-1 rounded-md flex items-center">
                          <Sparkles className="h-3 w-3 mr-1" />
                          <span>Homework context will be included</span>
                        </div>
                      )}
                      {activeCommand === 'control' && (
                        <div className="absolute -top-8 left-0 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs px-2 py-1 rounded-md flex items-center">
                          <Sparkles className="h-3 w-3 mr-1" />
                          <span>Control command detected</span>
                        </div>
                      )}

                      <div
                        className={cn(
                          `relative bg-gray-50/50 dark:bg-gray-800/50 rounded-xl border transition-all duration-200`,
                          activeCommand === 'homework'
                            ? 'border-yellow-400 ring-2 ring-yellow-400/30'
                            : activeCommand === 'control'
                              ? 'border-blue-400 ring-2 ring-blue-400/30'
                              : 'border-gray-100 dark:border-gray-800/50'
                        )}
                      >
                        <Textarea
                          ref={inputRef}
                          value={input}
                          onChange={(e) => setInput(e.target.value)}
                          placeholder="Ask me anything..."
                          className={cn(
                            `min-h-[60px] w-full resize-none border-0 bg-transparent p-3 pr-24 focus-visible:ring-0 focus-visible:ring-offset-0`,
                            activeCommand === 'homework'
                              ? 'text-yellow-700 dark:text-yellow-200'
                              : activeCommand === 'control'
                                ? 'text-blue-700 dark:text-blue-200'
                                : 'text-foreground'
                          )}
                          rows={1}
                          onKeyDown={handleKeyDown}
                        />
                      </div>

                      {/* Action buttons */}
                      <div className="absolute right-2 bottom-2 flex items-center gap-1">
                        <input
                          type="file"
                          ref={fileInputRef}
                          onChange={handleImageUpload}
                          accept="image/*"
                          multiple
                          className="hidden"
                        />
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="p-1.5 rounded-full hover:bg-gray-200/50 dark:hover:bg-gray-700/50 text-gray-500 dark:text-gray-400"
                          title="Attach image"
                        >
                          <Paperclip className="h-4 w-4" />
                        </button>

                        <button
                          type="submit"
                          disabled={!input.trim() && selectedImages.length === 0}
                          className={cn(
                            `p-1.5 rounded-full transition-colors duration-200`,
                            activeCommand === 'homework'
                              ? 'bg-yellow-500 hover:bg-yellow-600 text-white'
                              : activeCommand === 'control'
                                ? 'bg-blue-500 hover:bg-blue-600 text-white'
                                : 'bg-primary hover:bg-primary/90 text-primary-foreground',
                            (!input.trim() && selectedImages.length === 0) &&
                            'opacity-50 pointer-events-none'
                          )}
                        >
                          <ArrowUp className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </form>
                <p className="text-xs text-center text-muted-foreground/60 pb-2 px-4">
                  AI may produce inaccurate information. Press ⏎ to send
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ----------  OPEN‑CHAT BUTTON (unchanged) ---------- */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 h-12 w-12 rounded-xl bg-gradient-to-br from-primary to-primary/90 text-white flex items-center justify-center shadow-xl hover:shadow-2xl transition-all duration-200 group"
          >
            <span className="sr-only">Open chat</span>
            <AnimatePresence mode="wait">
              {messages.length > 0 ? (
                <motion.div
                  key="message"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute"
                >
                  <MessageSquare className="h-6 w-6" />
                </motion.div>
              ) : (
                <motion.div
                  key="sparkles"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.2 }}
                  className="absolute"
                >
                  <Sparkles className="h-6 w-6" />
                </motion.div>
              )}
            </AnimatePresence>
            {messages.length > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-destructive text-white text-xs flex items-center justify-center font-medium"
              >
                {Math.min(messages.length, 9)}
                {messages.length > 9 ? '+' : ''}
              </motion.span>
            )}
            <motion.div
              className="absolute -z-10 inset-0 bg-primary/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              animate={{
                scale: [1, 1.05, 1],
                opacity: [0, 0.2, 0],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
