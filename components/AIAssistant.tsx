'use client';

import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  FormEvent,
  KeyboardEvent,
} from 'react';

import { useHotkeys } from 'react-hotkeys-hook';

import { useAI } from '@/context/AIContext';

import { useRateLimitReset } from '@/hooks/useRateLimitReset';
import { useDarkMode } from '@/context/DarkModeContext';

import { HugeIcon } from '@/lib/huge-icon-map';
import { PanelRight } from 'lucide-react';
import { Button } from './ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { Textarea } from './ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { Markdown } from './markdown';
import { FlashcardDeck } from './Flashcard';
import { QuizQuestion } from './Quiz';
import { Class, Homework, Test } from '@/context/ClassContext';
import { useClassContext } from '@/context/ClassContext';
import { useHomeworkContext } from '@/context/HomeworkContext';
import { useTestContext } from '@/context/TestContext';
import { useAuth } from '@/context/AuthContext';
import { Toast, ToastContainer } from './Toast';
import { AIChecklist } from '@/components/ai-checklist';
import { useUpgrade } from '@/context/UpgradeContext';
import BulkAddHomeworkDisplay from '@/components/BulkAddHomeworkDisplay';
import { Message, InteractiveButton, AIChecklistData } from './ai-assistant/types';
import { parseInteractiveButtons, parseChecklist, getCookie, setCookie, deleteCookie, getMessageGroups } from './ai-assistant/utils';
import { GenerationProgressBar } from './ai-assistant/GenerationProgressBar';
import { AuraVideoIcon } from './ai-assistant/AuraVideoIcon';
import { ChatInput } from './ai-assistant/ChatInput';
import { ContextChips } from './ai-assistant/ContextChips';
import { MessageItem } from './ai-assistant/MessageItem';
import {
  AIQuotaPopover,
  type AIUsageSummary,
} from './ai-assistant/AIQuotaPopover';
import { AI_PLAN_LIMITS } from '@/lib/ai/config';

/* -------------------------------------------------------------------------- */
/* Animation variants                          */
/* -------------------------------------------------------------------------- */

const messageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  exit: { opacity: 0, scale: 0.9, transition: { duration: 0.2 } },
};

const handwritingSentenceVariants = {
  hidden: { opacity: 1 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.3,
    },
  },
} as const;

const handwritingCharVariants = {
  hidden: { opacity: 0, scale: 0.8, filter: 'blur(2px)' },
  visible: {
    opacity: 1,
    scale: 1,
    filter: 'blur(0px)',
    transition: {
      duration: 0.25,
      ease: 'easeOut',
    },
  },
} as const;

interface AIAssistantProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function AIAssistant({ isOpen: propIsOpen, onClose }: AIAssistantProps = {}) {
  /* ---------------------------------------------------------------------- */
  /* Cookie Helper Functions                 */
  /* ---------------------------------------------------------------------- */

  // Cookie functions moved to utils

  /* -------------------------------------------------------------------------- */
  /* State                               */
  /* -------------------------------------------------------------------------- */
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const isOpen = propIsOpen !== undefined ? propIsOpen : internalIsOpen;
  const setIsOpen = onClose || setInternalIsOpen;

  // State management moved to AIContext for global sync
  const { aiInput: input, setAIInput: setInput } = useAI();
  const [expandedThoughts, setExpandedThoughts] = useState<Record<string, boolean>>({});
  const [expandedUserMessages, setExpandedUserMessages] = useState<Record<string, boolean>>({});
  const [expandedToolDetails, setExpandedToolDetails] = useState<Record<string, boolean>>({});

  const [messages, setMessages] = useState<Message[]>(() => {
    // Restore messages from cookies on initial load
    if (typeof window !== 'undefined') {
      try {
        console.log('Attempting to restore messages from cookies');
        const savedMessages = getCookie('ai-assistant-messages');
        if (savedMessages) {
          const parsed = JSON.parse(savedMessages);
          // Convert timestamp strings back to Date objects
          return parsed.map((msg: any) => ({
            ...msg,
            timestamp: new Date(msg.timestamp)
          }));
        }
      } catch (error) {
        console.warn('Failed to restore messages from cookies:', error);
      }
    }
    console.log('No saved messages found, starting with empty array');
    return [];
  });

  useEffect(() => {
    const activeMsg = messages.find(m => m.isLoading && m.role === 'assistant');
    if (!activeMsg) return;

    const hasThoughtsOrTools = !!(activeMsg.thought || activeMsg.toolCall);
    const hasActualResponseContent = !!(activeMsg.content && activeMsg.content !== 'Thinking...');

    if (hasThoughtsOrTools) {
      setExpandedThoughts(prev => {
        const currentVal = prev[activeMsg.id];
        const nextVal = !hasActualResponseContent;
        if (currentVal !== nextVal) {
          return { ...prev, [activeMsg.id]: nextVal };
        }
        return prev;
      });
    }
  }, [messages]);
  const [isAILoading, setIsAILoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showFlashcards, setShowFlashcards] = useState(false);
  const [showHomeworkEffect, setShowHomeworkEffect] = useState(false);
  const [flashcards, setFlashcards] = useState<import('./Flashcard').Flashcard[]>([]);
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  // Message counters for tracking AI usage by model
  const [quickMessageCounter, setQuickMessageCounter] = useState(0);
  const [deeperMessageCounter, setDeeperMessageCounter] = useState(0);
  const [quotaSummary, setQuotaSummary] = useState<AIUsageSummary | null>(null);
  const [quotaLoading, setQuotaLoading] = useState(true);
  const { user } = useAuth();



  // Model selection state
  const [selectedModel, setSelectedModel] = useState<'quick' | 'tutor'>('quick');

  // Input wipe animation state
  const [hasWiped, setHasWiped] = useState(false);

  const [isInputFocused, setIsInputFocused] = useState(false);

  // Resize state and refs
  const [panelSize, setPanelSize] = useState({ width: 500, height: 600 });
  const resizeRef = useRef<HTMLDivElement>(null);
  const isResizingRef = useRef(false);

  // Context hooks – must be called unconditionally
  const aiContext = useAI();
  const classContext = useClassContext();
  const homeworkContext = useHomeworkContext();
  const testContext = useTestContext();

  // Refs
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null); // Added abortControllerRef

  // Safeguard destructuring
  const { chat, error: aiError, setError: setAIError = () => { }, setAIInput, isAISidebarMode, setAISidebarMode } = aiContext || {};

  const { classes = [] } = classContext || {};
  const { homeworks = [], addHomework = async () => { } } = homeworkContext || {};
  const { tests = [], addTest = async () => { } } = testContext || {};

  const parseDueDate = (dateStr?: string): Date => {
    if (!dateStr) return new Date();
    const trimmed = dateStr.trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
      const d = new Date(trimmed + 'T12:00:00');
      if (!isNaN(d.getTime())) return d;
    }
    const direct = new Date(trimmed);
    if (!isNaN(direct.getTime())) return direct;
    const now = new Date();
    const lower = trimmed.toLowerCase();
    if (lower.includes('tomorrow')) {
      const d = new Date(now);
      d.setDate(d.getDate() + 1);
      return d;
    }
    if (lower.includes('today')) return now;
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const targetIdx = days.findIndex(day => lower.includes(day));
    if (targetIdx !== -1) {
      const d = new Date(now);
      let diff = targetIdx - d.getDay();
      if (diff < 0) diff += 7;
      d.setDate(d.getDate() + diff);
      return d;
    }
    return now;
  };

  // State to trigger chip rotation
  const [chipRotation, setChipRotation] = useState(0);

  // Active interactive question state for ChatInput morphing
  const [activeClarificationQuestion, setActiveClarificationQuestion] = useState<{ question: string; options: string[] } | null>(null);

  // ContextChips data generation moved to components/ai-assistant/ContextChips.tsx

  // Toast state
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Dark mode
  const { isDark } = useDarkMode();
  const { handlePlanLimitError, promptUpgrade } = useUpgrade();

  // The server-managed plan and atomic quota are authoritative. Keep free-tier
  // values only as a brief loading fallback.
  const quickLimit =
    quotaSummary?.limits.quick ?? AI_PLAN_LIMITS.free.quick;
  const deepLimit =
    quotaSummary?.limits.tutor ?? AI_PLAN_LIMITS.free.tutor;
  const combinedLimitReached = Boolean(
    quotaSummary &&
    quotaSummary.usage.combined >= quotaSummary.limits.combined
  );

  // AI Personality setting
  type AIPersonality = 'default' | 'professional' | 'friendly' | 'candid' | 'quirky' | 'efficient' | 'nerdy' | 'cynical';
  const [aiPersonality, setAIPersonality] = useState<AIPersonality>('default');

  // Load AI personality from cookie
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedPersonality = document.cookie
        .split('; ')
        .find(row => row.startsWith('aiPersonality='))
        ?.split('=')[1];

      if (savedPersonality) {
        setAIPersonality(savedPersonality as AIPersonality);
      }
    }
  }, []);

  // Automatically clear rate-limit cookies at midnight
  useRateLimitReset();

  // Reset wipe animation whenever the assistant is opened
  useEffect(() => {
    if (isOpen) {
      setHasWiped(false);
    }
  }, [isOpen]);

  // Scroll visibility for top controls
  const [showHeader, setShowHeader] = useState(true);
  const lastScrollY = useRef(0);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const currentScrollY = e.currentTarget.scrollTop;
    if (currentScrollY <= 10) {
      setShowHeader(true);
    } else if (currentScrollY > lastScrollY.current) {
      setShowHeader(false); // Scrolling down
    } else if (currentScrollY < lastScrollY.current) {
      setShowHeader(true); // Scrolling up
    }
    lastScrollY.current = currentScrollY;
  };



  const clearConversation = () => {
    setMessages([]);
    setFlashcards([]);
    setQuizQuestions([]);
    setShowFlashcards(false);
    setShowQuiz(false);
    setError(null);
    setShowHomeworkEffect(false);

    // Clear cookies and localStorage
    if (typeof window !== 'undefined') {
      deleteCookie('ai-assistant-messages');
      localStorage.removeItem('ai-assistant-input');
    }
  };

  const addToast = (toast: Omit<Toast, 'id'>) => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { ...toast, id }]);
  };

  /* ---------------------------------------------------------------------- */
  /* Effects                               */
  /* ---------------------------------------------------------------------- */

  // Save input to localStorage moved to AIContext


  // Save messages to cookies whenever they change
  useEffect(() => {
    console.log('Cookie save effect triggered, messages length:', messages.length);
    if (typeof window !== 'undefined' && messages.length > 0) {
      try {
        // Convert Date objects to strings for JSON serialization
        const serializedMessages = messages.map(msg => ({
          ...msg,
          timestamp: msg.timestamp.toISOString()
        }));

        const jsonString = JSON.stringify(serializedMessages);
        console.log('Attempting to save messages to cookie, size:', jsonString.length);

        // Check if the data fits within cookie size limits (roughly 4KB)
        if (jsonString.length < 3800) {
          setCookie('ai-assistant-messages', jsonString, 30);
          console.log('Messages saved to cookie successfully');
        } else {
          console.warn('Message history too large for cookies, clearing old messages');
          // Keep only the last 10 messages
          const recentMessages = messages.slice(-10);
          const truncatedSerialized = recentMessages.map(msg => ({
            ...msg,
            timestamp: msg.timestamp.toISOString()
          }));
          setCookie('ai-assistant-messages', JSON.stringify(truncatedSerialized), 30);
          console.log('Truncated messages saved to cookie');
        }
      } catch (error) {
        console.warn('Failed to save messages to cookies:', error);
      }
    }
  }, [messages]);



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

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle keyboard shortcuts for interactive buttons
  useEffect(() => {
    const handleKeyDown = (e: Event) => {
      // Only handle shortcuts when not typing in the input
      if (document.activeElement?.tagName === 'TEXTAREA' || document.activeElement?.tagName === 'INPUT') {
        return;
      }

      // Find the last assistant message with interactive buttons
      const lastAssistantMessage = messages
        .filter(msg => msg.role === 'assistant' && msg.interactiveButtons && msg.interactiveButtons.length > 0)
        .pop();

      if (!lastAssistantMessage) return;

      // Check if it's a keyboard event and has a key property
      if ('key' in e) {
        const keyboardEvent = e as unknown as KeyboardEvent;

        // Check if any button shortcut matches the pressed key
        const matchingButton = lastAssistantMessage.interactiveButtons?.find(
          button => button.shortcut && button.shortcut.toLowerCase() === keyboardEvent.key.toLowerCase()
        );

        if (matchingButton) {
          keyboardEvent.preventDefault();
          handleInteractiveButtonClick(matchingButton);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [messages]);

  const loadQuotaSummary = useCallback(async (showLoading = false) => {
    if (!user) return;
    if (showLoading) setQuotaLoading(true);

    try {
      const response = await fetch('/api/ai/usage', { cache: 'no-store' });
      if (!response.ok) return;

      const summary = (await response.json()) as AIUsageSummary;
      setQuotaSummary(summary);
      setQuickMessageCounter(summary.usage.actions.quick);
      setDeeperMessageCounter(summary.usage.actions.tutor);
    } catch (quotaError) {
      console.warn('AI allowance could not be refreshed:', quotaError);
    } finally {
      if (showLoading) setQuotaLoading(false);
    }
  }, [user]);

  // Refresh when Aurora opens and periodically while it stays open. This keeps
  // usage from the grader, translator, and other AI tools reflected here too.
  useEffect(() => {
    if (!user || !isOpen) return;

    void loadQuotaSummary(true);
    const refreshTimer = window.setInterval(
      () => void loadQuotaSummary(false),
      60_000
    );
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        void loadQuotaSummary(false);
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      window.clearInterval(refreshTimer);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [isOpen, loadQuotaSummary, user]);



  /* ---------------------------------------------------------------------- */
  /* Helper & Parsing Functions                      */
  /* ---------------------------------------------------------------------- */
  /* Submit handling                           */
  /* ---------------------------------------------------------------------- */
  const handleMouseDown = (e: React.MouseEvent, direction: string) => {
    e.preventDefault();
    isResizingRef.current = true;

    const startX = e.clientX;
    const startY = e.clientY;
    const startWidth = panelSize.width;
    const startHeight = panelSize.height;

    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizingRef.current) return;

      if (direction.includes('left')) {
        const newWidth = startWidth - (e.clientX - startX);
        setPanelSize(prev => ({ ...prev, width: Math.max(300, Math.min(800, newWidth)) }));
      }
      if (direction.includes('right')) {
        const newWidth = startWidth + (e.clientX - startX);
        setPanelSize(prev => ({ ...prev, width: Math.max(300, Math.min(800, newWidth)) }));
      }
      if (direction.includes('top')) {
        const newHeight = startHeight - (e.clientY - startY);
        setPanelSize(prev => ({ ...prev, height: Math.max(400, Math.min(900, newHeight)) }));
      }
      if (direction.includes('bottom')) {
        const newHeight = startHeight + (e.clientY - startY);
        setPanelSize(prev => ({ ...prev, height: Math.max(400, Math.min(900, newHeight)) }));
      }
    };

    const handleMouseUp = () => {
      isResizingRef.current = false;
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleInteractiveButtonClick = async (button: InteractiveButton) => {
    if (button.action === 'copy') {
      if (button.payload) {
        const fallbackCopy = (text: string) => {
          const textArea = document.createElement('textarea');
          textArea.value = text;
          // Avoid scrolling to bottom
          textArea.style.top = '0';
          textArea.style.left = '0';
          textArea.style.position = 'fixed';
          document.body.appendChild(textArea);
          textArea.focus();
          textArea.select();
          try {
            const successful = document.execCommand('copy');
            document.body.removeChild(textArea);
            if (!successful) throw new Error('Fallback string copy failed');
          } catch (err) {
            document.body.removeChild(textArea);
            throw err;
          }
        };

        try {
          if (navigator.clipboard && navigator.clipboard.writeText) {
            try {
              await navigator.clipboard.writeText(button.payload);
            } catch (err) {
              // If modern clipboard API fails (e.g. insecure local context), try fallback
              fallbackCopy(button.payload);
            }
          } else {
            fallbackCopy(button.payload);
          }

          addToast({
            type: 'success',
            title: 'Copied!',
            message: 'AI response copied to clipboard.',
            duration: 3000
          });
        } catch (err) {
          console.error('Failed to copy text:', err);
          addToast({
            type: 'error',
            title: 'Copy Failed',
            message: 'Could not copy to clipboard. Please check browser permissions.',
            duration: 4000
          });
        }
      }
      return;
    }

    // Create a user message directly with the button's prompt
    const userMessage: Message = {
      id: Date.now(),
      role: 'user',
      content: button.prompt,
      timestamp: new Date(),
    };

    setInput(''); // Clear input

    // Trigger AI response (handles adding both user and assistant messages)
    await triggerAIResponse(button.prompt);
  };

  const triggerAIResponse = async (userInput: string) => {

    if (combinedLimitReached) {
      try {
        throw new Error(
          `PLAN_LIMIT:You've used today's shared AI allowance. It resets tomorrow.`
        );
      } catch (err: any) {
        handlePlanLimitError(err);
      }
      return;
    }

    // Check daily message limit
    const currentCounter =
      selectedModel === 'quick' ? quickMessageCounter : deeperMessageCounter;
    const maxLimit = selectedModel === 'quick' ? quickLimit : deepLimit;

    if (maxLimit !== Infinity && currentCounter >= maxLimit) {
      try {
        throw new Error(`PLAN_LIMIT:You've used all ${maxLimit} ${selectedModel === 'quick' ? 'Quick' : 'Deep'} messages for today — upgrade for more.`);
      } catch (err: any) { handlePlanLimitError(err); }
      return;
    }

    // Set loading state
    setIsAILoading(true);

    // Create user and loading messages
    const userMessage: Message = {
      id: Date.now(),
      role: 'user',
      content: userInput,
      timestamp: new Date(),
    };

    const loadingMsg: Message = {
      id: Date.now() + 1,
      role: 'assistant',
      content: 'Thinking...',
      timestamp: new Date(),
      isLoading: true,
      chunks: []
    };

    // Add both messages to state simultaneously (preserves Aurora morph animation)
    setMessages(prev => [...prev, userMessage, loadingMsg]);

    // Create a new AbortController for this request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort(); // Abort any previous pending request
    }
    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    try {
      const chatMessages = messages.concat({
        id: Date.now(),
        role: 'user',
        content: userInput,
        timestamp: new Date(),
      } as Message).map(msg => ({
        role: msg.role,
        content: msg.content,
      }));

      // Call AI API
      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: selectedModel,
          messages: chatMessages,
        }),
        signal, // Pass the abort signal to the fetch request
      });

      if (!response.ok) {
        let errorMessage = 'Failed to get response from AI service';
        try {
          const errorData = await response.json();
          errorMessage = errorData.details || errorData.error || errorMessage;
        } catch {
          errorMessage += ` (${response.status})`;
        }
        const requestError = new Error(errorMessage) as Error & {
          status?: number;
          retryAfter?: string | null;
        };
        requestError.status = response.status;
        requestError.retryAfter = response.headers.get('Retry-After');
        throw requestError;
      }

      // Only count requests accepted by the server. Authentication, rate-limit,
      // or provider errors should not use up the client's displayed allowance.
      if (selectedModel === 'quick') {
        setQuickMessageCounter(prev => prev + 1);
      } else {
        setDeeperMessageCounter(prev => prev + 1);
      }
      setQuotaSummary((current) => {
        if (!current) return current;
        const action = selectedModel === 'quick' ? 'quick' : 'tutor';
        return {
          ...current,
          usage: {
            combined: current.usage.combined + 1,
            actions: {
              ...current.usage.actions,
              [action]: current.usage.actions[action] + 1,
            },
          },
        };
      });

      // Handle streaming response (simplified version)
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let accumulatedResponse = '';
      let eventBuffer = '';
      const accumulatedToolCalls: { name: string, args: any, status?: 'loading' | 'success' | 'error', error?: string }[] = [];

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          eventBuffer += decoder.decode(value, { stream: true });
          const frames = eventBuffer.split('\n\n');
          eventBuffer = frames.pop() || '';

          for (const frame of frames) {
            const line = frame
              .split('\n')
              .find((candidate) => candidate.startsWith('data: '));
            if (line) {
              try {
                const data = JSON.parse(line.slice(6));
                const content = data.response || data.message?.content || data.delta?.content || '';

                if (content) {
                  accumulatedResponse += content;

                  // Update the loading message
                  setMessages(prev => {
                    const copy = [...prev];
                    const idx = copy.findIndex(m => m.isLoading);
                    if (idx !== -1) {
                      copy[idx] = {
                        ...copy[idx],
                        content: accumulatedResponse,
                        chunks: [...(copy[idx].chunks || []), content],
                        isLoading: true,
                      };
                    }
                    return copy;
                  });
                }

                if (data.groundingMetadata) {
                  setMessages(prev => {
                    const copy = [...prev];
                    const idx = copy.findIndex(m => m.isLoading);
                    if (idx !== -1) {
                      copy[idx] = {
                        ...copy[idx],
                        groundingMetadata: data.groundingMetadata,
                      };
                    }
                    return copy;
                  });
                }

                if (data.usage) {
                  setMessages(prev => {
                    const copy = [...prev];
                    const idx = copy.findIndex(m => m.isLoading);
                    if (idx !== -1) {
                      copy[idx] = {
                        ...copy[idx],
                        usage: data.usage,
                      };
                    }
                    return copy;
                  });
                }

                if (data.toolCall) {
                  if (data.toolCall === 'ask_user_question' && data.toolArgs?.question && Array.isArray(data.toolArgs?.options)) {
                    setActiveClarificationQuestion({
                      question: data.toolArgs.question,
                      options: data.toolArgs.options,
                    });
                  }
                  const initialStatus: 'loading' | 'success' = (data.toolCall === 'add_homework' || data.toolCall === 'add_multiple_homeworks' || data.toolCall === 'add_test') ? 'loading' : 'success';
                  const exists = accumulatedToolCalls.some(tc => tc.name === data.toolCall);
                  if (exists) {
                    const target = accumulatedToolCalls.find(tc => tc.name === data.toolCall);
                    if (target) target.args = data.toolArgs || target.args;
                  } else {
                    accumulatedToolCalls.push({ name: data.toolCall, args: data.toolArgs, status: initialStatus });
                  }

                  setMessages(prev => {
                    const copy = [...prev];
                    const idx = copy.findIndex(m => m.isLoading);
                    if (idx !== -1) {
                      const currentCalls = copy[idx].toolCalls || [];
                      const existsInState = currentCalls.some(tc => tc.name === data.toolCall);
                      const updatedCalls = existsInState
                        ? currentCalls.map(tc => tc.name === data.toolCall ? { ...tc, args: data.toolArgs || tc.args } : tc)
                        : [...currentCalls, { name: data.toolCall as string, args: data.toolArgs, status: initialStatus }];

                      copy[idx] = {
                        ...copy[idx],
                        toolCall: data.toolCall,
                        toolArgs: data.toolArgs || copy[idx].toolArgs,
                        toolCalls: updatedCalls
                      };
                    }
                    return copy;
                  });
                }

                if (data.thought) {
                  setMessages(prev => {
                    const copy = [...prev];
                    const idx = copy.findIndex(m => m.isLoading);
                    if (idx !== -1) {
                      copy[idx] = {
                        ...copy[idx],
                        thought: (copy[idx].thought || '') + data.thought,
                      };
                    }
                    return copy;
                  });
                }

                if (data.done) {
                  // Final update - parse buttons and remove loading
                  const { content: cleanContent, buttons } = parseInteractiveButtons(accumulatedResponse);
                  const { content: finalCleanContent, checklist } = parseChecklist(cleanContent);

                  let messageIdToUpdate: number | undefined = loadingMsg.id;

                  setMessages(prev => {
                    const copy = [...prev];
                    const idx = copy.findIndex(m => m.isLoading);
                    if (idx !== -1) {
                      const finalMsg = {
                        ...copy[idx],
                        content: finalCleanContent,
                        interactiveButtons: buttons,
                        checklist: checklist,
                        isLoading: false,
                        timestamp: new Date(),
                      };
                      copy[idx] = finalMsg;

                      // Handle tools that need UI triggers
                      if (finalMsg.toolCall === 'start_flashcards' && finalMsg.toolArgs?.flashcards) {
                        const topic = finalMsg.toolArgs.topic || 'Flashcards';
                        const cards = finalMsg.toolArgs.flashcards.map((card: any, index: number) => ({
                          id: `card-${Date.now()}-${index}`,
                          question: card.front || card.question || `Question ${index + 1}`,
                          answer: card.back || card.answer || 'No answer provided',
                          topic: topic,
                          createdAt: new Date()
                        }));

                        if (typeof window !== 'undefined') {
                          localStorage.setItem('currentFlashcards', JSON.stringify(cards));
                        }

                        finalMsg.content = `# 🗂️ Flashcard Set: ${topic}\n\nI've created ${cards.length} flashcards for you to study. \n\n[Open Flashcards](/flashcards?t=${Date.now()}) to start reviewing them!\n\n*The flashcards will be saved for this session. You can access them later from the navigation menu.*`;
                      }

                      // Handle start_quiz tool
                      if (finalMsg.toolCall === 'start_quiz' && finalMsg.toolArgs?.questions) {
                        const topic = finalMsg.toolArgs.topic || 'Quiz';
                        const questions = finalMsg.toolArgs.questions.map((q: any, index: number) => {
                          const options = q.options || ['Option A', 'Option B', 'Option C', 'Option D'];
                          const correctIndex = Array.isArray(options) ? options.indexOf(q.correctAnswer) : 0;
                          return {
                            id: `question-${Date.now()}-${index}`,
                            question: q.question || `Question ${index + 1}`,
                            options: options,
                            correctAnswer: correctIndex === -1 ? 0 : correctIndex,
                            explanation: q.explanation || '',
                            topic: topic
                          };
                        });

                        if (typeof window !== 'undefined') {
                          localStorage.setItem('currentQuiz', JSON.stringify(questions));
                        }

                        finalMsg.content = `# 📝 Quiz: ${topic}\n\nI've created ${questions.length} multiple-choice questions for you to test your knowledge.\n\n[Start Quiz](/quiz?t=${Date.now()}) to begin!\n\n*The quiz will be saved for this session. Good luck!*`;
                      }
                    }
                    return copy;
                  });

                  // Execute state-modifying database updates completely outside of the render cycle
                  for (const tc of accumulatedToolCalls) {
                    const toolCall = tc.name;
                    const toolArgs = tc.args;

                    setTimeout(async () => {
                      if (toolCall === 'add_homework' && toolArgs) {
                        const itemsToAdd: Array<{
                          className?: string;
                          title?: string;
                          dueDate?: string;
                          priority?: string;
                          description?: string;
                          links?: string[];
                        }> = Array.isArray(toolArgs.assignments) && toolArgs.assignments.length > 0
                          ? toolArgs.assignments
                          : (toolArgs.title ? [toolArgs] : []);

                        if (itemsToAdd.length > 0) {
                          const addedHomeworks: any[] = [];
                          const usedClasses: any[] = [];
                          const usedClassIds = new Set<string>();

                          for (const item of itemsToAdd) {
                            const { className, title, dueDate, priority, description, links } = item;
                            if (!title) continue;
                            const matchedClass = classes.find((c: any) => {
                              const cName = (c.name || '').toLowerCase();
                              const reqName = (className || '').toLowerCase();
                              if (!cName || !reqName) return false;
                              return (
                                cName === reqName ||
                                cName.includes(reqName) ||
                                reqName.includes(cName) ||
                                (reqName.includes('math') && (cName.includes('calc') || cName.includes('algebra') || cName.includes('geom') || cName.includes('math') || cName.includes('trig'))) ||
                                (reqName.includes('english') && (cName.includes('english') || cName.includes('lit') || cName.includes('lang') || cName.includes('ela'))) ||
                                (reqName.includes('science') && (cName.includes('bio') || cName.includes('chem') || cName.includes('phys') || cName.includes('sci')))
                              );
                            });

                            if (matchedClass) {
                              const parsedDate = parseDueDate(dueDate);
                              const formattedLinks = Array.isArray(links)
                                ? links.map((l: any) =>
                                    typeof l === 'string'
                                      ? { id: `link-${Math.random().toString(36).substring(2, 9)}`, title: 'Reference Link', url: l }
                                      : { id: l.id || `link-${Math.random().toString(36).substring(2, 9)}`, title: l.title || 'Reference Link', url: l.url || '' }
                                  ).filter((l: any) => Boolean(l.url))
                                : [];
                              try {
                                await addHomework(matchedClass.id, title, parsedDate, (priority as any) || 'medium', formattedLinks, description || '');
                                addedHomeworks.push({
                                  id: `temp-${Math.random()}`,
                                  title,
                                  dueDate: parsedDate.toISOString(),
                                  priority: priority || 'medium',
                                  description: description || '',
                                  links: formattedLinks,
                                  classId: matchedClass.id,
                                  className: matchedClass.name,
                                  pinned: false,
                                  completed: false,
                                });
                                if (!usedClassIds.has(matchedClass.id)) {
                                  usedClassIds.add(matchedClass.id);
                                  usedClasses.push(matchedClass);
                                }
                              } catch (err: any) {
                                console.error('Error adding homework from AI:', err);
                              }
                            }
                          }

                          if (addedHomeworks.length > 0 && messageIdToUpdate !== undefined) {
                            setMessages(prev => {
                              const copy = [...prev];
                              const idx = copy.findIndex(m => m.id === messageIdToUpdate);
                              if (idx !== -1) {
                                const updatedCalls = (copy[idx].toolCalls || []).map(tc => 
                                  tc.name === 'add_homework' ? { ...tc, status: 'success' as const } : tc
                                );
                                copy[idx] = {
                                  ...copy[idx],
                                  toolCalls: updatedCalls,
                                  bulkAddDisplay: {
                                    homeworks: addedHomeworks,
                                    classes: usedClasses,
                                  },
                                };
                              }
                              return copy;
                            });
                          }
                        }
                      }

                      if (toolCall === 'add_multiple_homeworks' && toolArgs?.homeworks) {
                        const homeworksToAdd = toolArgs.homeworks;
                        const addedHomeworks: Homework[] = [];
                        const matchedClassesSet = new Set<Class>();
                        let hasFailures = false;
                        let lastErrorMessage = '';

                        for (const hw of homeworksToAdd) {
                          const { className, title, dueDate, priority, description } = hw;
                          const matchedClass = classes.find((c: any) => c.name.toLowerCase() === className?.toLowerCase());
                          if (matchedClass) {
                            const parsedDate = dueDate ? new Date(dueDate + 'T12:00:00') : new Date();
                            try {
                              await addHomework(matchedClass.id, title, parsedDate, priority || 'medium', [], description || '');
                              
                              addedHomeworks.push({
                                id: `hw-${Date.now()}-${Math.random()}`,
                                title,
                                dueDate: dueDate || new Date().toISOString(),
                                priority: priority || 'medium',
                                description: description || '',
                                links: [],
                                className: matchedClass.name,
                                classId: matchedClass.id
                              } as any);
                              matchedClassesSet.add(matchedClass);
                            } catch (err: any) {
                              console.error('Error adding multiple homework item:', err);
                              hasFailures = true;
                              lastErrorMessage = err.message || `Failed to add "${title}"`;
                            }
                          } else {
                            hasFailures = true;
                            lastErrorMessage = `Class "${className}" not found for "${title}"`;
                          }
                        }

                        if (messageIdToUpdate !== undefined) {
                          setMessages(prev => {
                            const copy = [...prev];
                            const idx = copy.findIndex(m => m.id === messageIdToUpdate);
                            if (idx !== -1) {
                              const updatedCalls = (copy[idx].toolCalls || []).map(tc => {
                                if (tc.name === 'add_multiple_homeworks') {
                                  if (hasFailures && addedHomeworks.length === 0) {
                                    return { ...tc, status: 'error' as const, error: lastErrorMessage };
                                  } else if (hasFailures) {
                                    return { ...tc, status: 'success' as const, error: `Partially added: ${lastErrorMessage}` };
                                  } else {
                                    return { ...tc, status: 'success' as const };
                                  }
                                }
                                return tc;
                              });

                              copy[idx] = {
                                ...copy[idx],
                                toolCalls: updatedCalls,
                                bulkAddDisplay: addedHomeworks.length > 0 ? {
                                  homeworks: addedHomeworks,
                                  classes: Array.from(matchedClassesSet)
                                } : copy[idx].bulkAddDisplay
                              };
                            }
                            return copy;
                          });
                        }
                      }

                      if (toolCall === 'add_test' && toolArgs) {
                        const itemsToAdd = Array.isArray(toolArgs.tests)
                          ? toolArgs.tests
                          : toolArgs.title
                          ? [toolArgs]
                          : [];

                        const addedTests: any[] = [];
                        const usedClasses: any[] = [];
                        const usedClassIds = new Set<string>();

                        for (const item of itemsToAdd) {
                          const { className, title, date, testType, description } = item;
                          if (!title) continue;
                          const matchedClass = classes.find((c: any) => {
                            const cName = (c.name || '').toLowerCase();
                            const reqName = (className || '').toLowerCase();
                            if (!cName || !reqName) return false;
                            return (
                              cName === reqName ||
                              cName.includes(reqName) ||
                              reqName.includes(cName) ||
                              (reqName.includes('math') && (cName.includes('calc') || cName.includes('algebra') || cName.includes('geom') || cName.includes('math') || cName.includes('trig'))) ||
                              (reqName.includes('english') && (cName.includes('english') || cName.includes('lit') || cName.includes('lang') || cName.includes('ela'))) ||
                              (reqName.includes('science') && (cName.includes('bio') || cName.includes('chem') || cName.includes('phys') || cName.includes('sci')))
                            );
                          });

                          if (matchedClass) {
                            const parsedDate = parseDueDate(date);
                            try {
                              await addTest(matchedClass.id, title, parsedDate, (testType || 'exam') as any, { description: description || '', priority: 'high' });
                              addedTests.push({
                                id: `temp-test-${Math.random()}`,
                                title,
                                dueDate: parsedDate.toISOString(),
                                priority: 'high',
                                testType: testType || 'exam',
                                description: description || '',
                                links: [],
                                classId: matchedClass.id,
                                className: matchedClass.name,
                              });
                              if (!usedClassIds.has(matchedClass.id)) {
                                usedClassIds.add(matchedClass.id);
                                usedClasses.push(matchedClass);
                              }
                            } catch (err: any) {
                              console.error('Error adding test from AI:', err);
                            }
                          }
                        }

                        if (messageIdToUpdate !== undefined) {
                          setMessages(prev => {
                            const copy = [...prev];
                            const idx = copy.findIndex(m => m.id === messageIdToUpdate);
                            if (idx !== -1) {
                              const updatedCalls = (copy[idx].toolCalls || []).map(tc => 
                                tc.name === 'add_test' ? { ...tc, status: 'success' as const } : tc
                              );
                              copy[idx] = {
                                ...copy[idx],
                                toolCalls: updatedCalls,
                                bulkAddDisplay: addedTests.length > 0 ? {
                                  homeworks: addedTests,
                                  classes: usedClasses,
                                } : copy[idx].bulkAddDisplay,
                              };
                            }
                            return copy;
                          });
                        }
                      }
                    }, 0);
                  }
                  break;
                }
              } catch (error) {
                console.error('Failed to parse streaming data:', error);
              }
            }
          }
        }
      }
    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.log('Request aborted by user');
        // Update the loading message to indicate stopped
        setMessages(prev => {
          const copy = [...prev];
          const idx = copy.findIndex(m => m.isLoading);
          if (idx !== -1) {
            copy[idx] = {
              ...copy[idx],
              content: copy[idx].content === 'Thinking...' ? 'Stopped.' : copy[idx].content, // Keep accumulated content if any
              isLoading: false,
            };
          }
          return copy;
        });
      } else {
        // Expected 4xx responses are presented in the assistant UI. Logging
        // them as console errors makes Next.js show a development error overlay
        // even though the app handled the response correctly.
        if (!error?.status || error.status >= 500) {
          console.error('Error generating AI response:', error);
        }
        setError(error instanceof Error ? error.message : 'An error occurred');

        // Remove loading state from messages on error (not abort)
        setMessages((prev) => {
          const copy = [...prev];
          const idx = copy.findIndex((m) => m.isLoading);
          if (idx !== -1) {
            const newMsgs = [...copy];
            newMsgs.splice(idx, 1);
            return newMsgs;
          }
          return copy;
        });
      }
    } finally {
      setIsAILoading(false);
      abortControllerRef.current = null; // Clear the controller reference
    }
  };

  const handleStopResponse = (e: any) => {
    e.preventDefault();
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  };

  const handleRetryMessage = (targetMsg: Message) => {
    if (isAILoading) return;
    const targetIdx = messages.findIndex(m => m.id === targetMsg.id);
    if (targetIdx !== -1) {
      const prevUserMsg = messages.slice(0, targetIdx).reverse().find(m => m.role === 'user');
      if (prevUserMsg) {
        setMessages(prev => prev.slice(0, targetIdx));
        triggerAIResponse(prevUserMsg.content);
      }
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const userInput = input.trim();

    if (!userInput || isAILoading) return;

    if (combinedLimitReached) {
      try {
        throw new Error(
          `PLAN_LIMIT:You've used today's shared AI allowance. It resets tomorrow.`
        );
      } catch (err: any) {
        handlePlanLimitError(err);
      }
      return;
    }

    // Check daily message limit based on selected model
    const currentCounter =
      selectedModel === 'quick' ? quickMessageCounter : deeperMessageCounter;
    const maxLimit = selectedModel === 'quick' ? quickLimit : deepLimit;

    if (maxLimit !== Infinity && currentCounter >= maxLimit) {
      try {
        throw new Error(`PLAN_LIMIT:You've used all ${maxLimit} ${selectedModel === 'quick' ? 'Quick' : 'Deep'} messages for today — upgrade for more.`);
      } catch (err: any) { handlePlanLimitError(err); }
      return;
    }

    // --------------------------------------------------------------
    // Prepare Messages
    // --------------------------------------------------------------
    const userMessage: Message = {
      id: messages.length,
      role: 'user',
      content: userInput,
      timestamp: new Date(),
    };

    // Reset UI
    setInput('');

    // Clear saved input from localStorage after submission
    if (typeof window !== 'undefined') {
      localStorage.removeItem('ai-assistant-input');
    }

    // Regular AI chat — triggerAIResponse handles adding both user and assistant messages
    await triggerAIResponse(userInput);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (input.trim() && !isAILoading) {
        handleSubmit(e as unknown as FormEvent<HTMLFormElement>);
      }
    }
  };

  // Toggle Aurora
  const toggleAIAssistant = () => {
    if (onClose && !isOpen) {
      onClose();
    } else if (!onClose) {
      setInternalIsOpen(!isOpen);
    }
  };

  const messageGroups = getMessageGroups(messages);

  useHotkeys(
    'esc',
    () => {
      if (onClose) {
        onClose();
      } else {
        setInternalIsOpen(false);
      }
    },
    { enableOnFormTags: true }
  );

  const renderToggleButton = () => {
    if (onClose !== undefined) return null; // Controlled component – no toggle button

    return (
      <div className="fixed bottom-4 left-4 z-50 flex flex-col items-start md:items-start">
        <motion.button
          onClick={toggleAIAssistant}
          className={cn(
            'p-3 rounded-full shadow-lg duration-300',
            'bg-linear-to-br from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800',
            'text-white',
            'flex items-center justify-center',
            'relative',
            'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
            'transform hover:scale-105 active:scale-95',
            'w-14 h-14',
            'overflow-hidden'
          )}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          aria-label="Aurora"
        >
          <AnimatePresence mode="wait">
            {messages.length > 0 ? (
              <motion.div
                key="message"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute"
              >
                <HugeIcon name="Chat" size={24} className="h-6 w-6" />
              </motion.div>
            ) : (
              <motion.div
                key="sparkles"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.2 }}
                className="absolute"
              >
                <HugeIcon name="Sparkles" size={24} className="h-6 w-6" />
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
        </motion.button>
      </div>
    );
  };

  return (
    <>
      {onClose === undefined && renderToggleButton()}

      {/* Aurora Panel */}
      <AnimatePresence>
        {isOpen && (
          <div
            style={{
              width: window.innerWidth < 768
                ? '100vw'
                : isAISidebarMode ? '420px' : `${panelSize.width}px`,
              height: window.innerWidth < 768
                ? '100vh'
                : isAISidebarMode ? '100vh' : `${panelSize.height}px`,
            }}
            className={cn(
              'fixed z-50 pointer-events-none drop-shadow-[0_20px_40px_rgba(0,0,0,0.2)] dark:drop-shadow-[0_20px_40px_rgba(0,0,0,0.5)]',
              // Mobile (full-screen)
              'inset-0 rounded-none',
              // Desktop
              isAISidebarMode
                ? 'md:right-0 md:top-0 md:bottom-0 md:rounded-none md:left-auto'
                : 'md:right-6 md:bottom-6 md:rounded-[36px] md:left-auto md:top-auto',
            )}
          >
            <motion.div
              initial={{
                clipPath: isAISidebarMode
                  ? 'inset(0% 0% 0% 100% round 0px)'
                  : 'inset(100% 0% 0% 100% round 36px)',
                filter: 'blur(12px)',
              }}
              animate={{
                clipPath: isAISidebarMode
                  ? 'inset(0% 0% 0% 0% round 0px)'
                  : 'inset(0% 0% 0% 0% round 36px)',
                filter: 'blur(0px)',
              }}
              exit={{
                clipPath: isAISidebarMode
                  ? 'inset(0% 0% 0% 100% round 0px)'
                  : 'inset(100% 0% 0% 100% round 36px)',
                filter: 'blur(12px)',
              }}
              transition={{
                duration: 0.5,
                ease: [0.16, 1, 0.3, 1],
              }}
              data-ai-chat="true"
              className={cn(
                'pointer-events-auto w-full h-full flex flex-col overflow-hidden bg-[#f8fbfd] dark:bg-[#0a0a0a] border border-sky-100 dark:border-white/5',
                // Mobile (full-screen)
                'rounded-none',
                // Desktop
                isAISidebarMode
                  ? 'md:rounded-none md:border-r-0 md:border-t-0 md:border-b-0'
                  : 'md:rounded-[36px]',
              )}
            >
            {/* Resize handles - only on desktop, not in sidebar mode */}
            {!isAISidebarMode && (
              <div className="hidden md:block">
                {/* Top edge */}
                <div
                  onMouseDown={(e) => handleMouseDown(e, 'top')}
                  className="absolute top-0 left-0 right-0 h-1 cursor-ns-resize hover:bg-primary/20 transition-colors"
                />
                {/* Bottom edge */}
                <div
                  onMouseDown={(e) => handleMouseDown(e, 'bottom')}
                  className="absolute bottom-0 left-0 right-0 h-1 cursor-ns-resize hover:bg-primary/20 transition-colors"
                />
                {/* Left edge */}
                <div
                  onMouseDown={(e) => handleMouseDown(e, 'left')}
                  className="absolute top-0 bottom-0 left-0 w-1 cursor-ew-resize hover:bg-primary/20 transition-colors"
                />
                {/* Right edge */}
                <div
                  onMouseDown={(e) => handleMouseDown(e, 'right')}
                  className="absolute top-0 bottom-0 right-0 w-1 cursor-ew-resize hover:bg-primary/20 transition-colors"
                />
                {/* Corner handles */}
                <div
                  onMouseDown={(e) => handleMouseDown(e, 'top-left')}
                  className="absolute top-0 left-0 w-3 h-3 cursor-nwse-resize hover:bg-primary/30 transition-colors"
                />
                <div
                  onMouseDown={(e) => handleMouseDown(e, 'top-right')}
                  className="absolute top-0 right-0 w-3 h-3 cursor-nesw-resize hover:bg-primary/30 transition-colors"
                />
                <div
                  onMouseDown={(e) => handleMouseDown(e, 'bottom-left')}
                  className="absolute bottom-0 left-0 w-3 h-3 cursor-nesw-resize hover:bg-primary/30 transition-colors"
                />
                <div
                  onMouseDown={(e) => handleMouseDown(e, 'bottom-right')}
                  className="absolute bottom-0 right-0 w-3 h-3 cursor-nwse-resize hover:bg-primary/30 transition-colors"
                />
              </div>
            )}
            {/* Floating Top Controls */}
            <motion.div
              initial={{ y: 0, opacity: 1 }}
              animate={{
                y: showHeader ? 0 : -100,
                opacity: showHeader ? 1 : 0
              }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="absolute top-0 inset-x-0 z-50 pointer-events-none p-4 flex justify-between items-start"
            >
              {/* Floating Usage Badge */}
              <div className="pointer-events-auto flex items-center gap-2">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedModel(selectedModel === 'quick' ? 'tutor' : 'quick')}
                  className="h-9 px-3 flex items-center justify-center rounded-xl border border-sky-100/50 bg-white/50 text-[13px] font-medium text-sky-400 hover:text-sky-900 dark:text-sky-500 dark:hover:text-white shadow-sm backdrop-blur-md dark:border-white/5 dark:bg-gray-900/50 transition-colors select-none"
                  title="Click to toggle between Quick and Deep mode"
                >
                  <AnimatePresence mode="wait" initial={false}>
                    <motion.span
                      key={selectedModel}
                      initial={{ opacity: 0, y: -6, filter: 'blur(2px)' }}
                      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                      exit={{ opacity: 0, y: 6, filter: 'blur(2px)' }}
                      transition={{ duration: 0.15, ease: 'easeOut' }}
                      className="inline-block"
                    >
                      {selectedModel === 'quick' ? 'Quick' : 'Deep'}
                    </motion.span>
                  </AnimatePresence>
                </motion.button>
                <AIQuotaPopover
                  summary={quotaSummary}
                  loading={quotaLoading}
                  selectedAction={selectedModel}
                  onUpgrade={() =>
                    promptUpgrade({
                      featureLabel: 'increase your daily AI allowance',
                    })
                  }
                />
              </div>

              {/* Floating Action Capsule */}
              <div className="pointer-events-auto flex items-center h-9 p-0.5 rounded-xl bg-white/50 dark:bg-gray-900/50 border border-sky-100/50 dark:border-white/5 shadow-sm backdrop-blur-md">
                {messages.length > 0 && (
                  <>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={clearConversation}
                      className="h-8 w-8 flex items-center justify-center rounded-lg text-sky-400 hover:text-sky-900 dark:text-sky-500 dark:hover:text-white hover:bg-sky-50 dark:hover:bg-gray-800"
                      title="New Chat"
                    >
                      <HugeIcon name="PlusSign" size={18} />
                    </motion.button>

                    <div className="w-[1px] h-4 bg-sky-100 dark:bg-gray-800 mx-0.5" />
                  </>
                )}

                {/* Sidebar toggle — desktop only */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setAISidebarMode(!isAISidebarMode)}
                  className="hidden md:flex h-8 w-8 items-center justify-center rounded-lg text-sky-400 hover:text-sky-900 dark:text-sky-500 dark:hover:text-white hover:bg-sky-50 dark:hover:bg-gray-800"
                  title={isAISidebarMode ? 'Floating panel' : 'Sidebar mode'}
                >
                  <PanelRight className="w-4 h-4" />
                </motion.button>

                <div className="hidden md:block w-[1px] h-4 bg-sky-100 dark:bg-gray-800 mx-0.5" />

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onClose || (() => setInternalIsOpen(false))}
                  className="h-8 w-8 flex items-center justify-center rounded-lg text-sky-400 hover:text-sky-900 dark:text-sky-500 dark:hover:text-white hover:bg-sky-50 dark:hover:bg-gray-800 font-medium"
                >
                  <HugeIcon name="Cancel01" size={18} />
                </motion.button>
              </div>
            </motion.div>

            {/* Messages */}
            <div
              onScroll={handleScroll}
              className="flex-1 min-h-0 overflow-y-auto p-4 pt-20 pb-24 space-y-4 scrollbar-thin scrollbar-thumb-sky-200 dark:scrollbar-thumb-gray-700 scrollbar-track-transparent scroll-smooth relative"
            >
              <AnimatePresence>


                {messages.length === 0 ? (
                  <motion.div
                    key="landing"
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="h-full flex flex-col items-center justify-center text-center p-8 absolute inset-0"
                  >
                    <motion.div
                      layoutId="aurora-sphere"
                      className="mb-2 pointer-events-none select-none"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    >
                      <video
                        key={isDark ? 'dark' : 'light'}
                        autoPlay
                        loop
                        muted
                        playsInline
                        className="w-32 h-32 object-contain"
                      >
                        <source src={isDark ? "/AI SphereDark2.mp4" : "/AI SphereNew.mp4"} type="video/mp4" />
                      </video>
                    </motion.div>

                    <motion.div
                      key="landing-text"
                      initial="hidden"
                      animate="visible"
                      variants={handwritingSentenceVariants}
                      className="relative -top-10 max-w-[450px]"
                    >
                      <h2 className="block text-3xl font-medium font-cursive text-center text-sky-900 dark:text-sky-200">
                        {`Hey, ${user?.user_metadata?.name?.split(' ')[0] || user?.email?.split('@')[0] || 'there'}!`.split('').map((char, index) => (
                          <motion.span
                            key={`${char}-${index}`}
                            variants={handwritingCharVariants}
                            style={{ display: 'inline-block', whiteSpace: 'pre' }}
                          >
                            {char}
                          </motion.span>
                        ))}
                      </h2>
                    </motion.div>
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
                        selectedModel={selectedModel}
                        expandedThoughts={expandedThoughts}
                        setExpandedThoughts={setExpandedThoughts}
                        expandedToolDetails={expandedToolDetails}
                        setExpandedToolDetails={setExpandedToolDetails}
                        expandedUserMessages={expandedUserMessages}
                        setExpandedUserMessages={setExpandedUserMessages}
                        handleInteractiveButtonClick={handleInteractiveButtonClick}
                        onRetry={handleRetryMessage}
                      />
                    ))}
                    <div ref={messagesEndRef} className="h-4" />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Input */}
            <div className="absolute bottom-0 inset-x-0 z-50 pointer-events-none p-4 bg-gradient-to-t from-[#f8fbfd] via-[#f8fbfd]/80 to-transparent dark:from-[#0a0a0a] dark:via-[#0a0a0a]/80 dark:to-transparent pt-10 flex flex-col justify-end gap-2">
              {/* Context Chips */}
              <AnimatePresence>
                {isInputFocused && !input.trim() && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, height: 0 }}
                    animate={{ opacity: 1, y: 0, height: 'auto' }}
                    exit={{ opacity: 0, y: 8, height: 0 }}
                    transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                    className="pointer-events-auto z-10 w-full overflow-x-auto scrollbar-none px-0.5"
                  >
                    <ContextChips 
                      onChipClick={(prompt) => {
                        setInput(prompt);
                        inputRef.current?.focus();
                      }}
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              <ChatInput 
                input={input}
                setInput={setInput}
                handleSubmit={handleSubmit}
                handleKeyDown={handleKeyDown}
                inputRef={inputRef}
                hasWiped={hasWiped}
                setHasWiped={setHasWiped}
                isAILoading={isAILoading}
                handleStopResponse={handleStopResponse}
                selectedModel={selectedModel}
                quickLimit={quickLimit}
                quickMessageCounter={quickMessageCounter}
                deepLimit={deepLimit}
                deeperMessageCounter={deeperMessageCounter}
                combinedLimitReached={combinedLimitReached}
                setIsInputFocused={setIsInputFocused}
                setChipRotation={setChipRotation}
                activeQuestion={activeClarificationQuestion}
                onSelectQuestionOption={(selectedOption) => {
                  setActiveClarificationQuestion(null);
                  triggerAIResponse(selectedOption);
                }}
                onDismissQuestion={() => setActiveClarificationQuestion(null)}
              />
            </div>
          </motion.div>
          </div>
        )}
      </AnimatePresence>

      <ToastContainer toasts={toasts} onDismiss={(id) => setToasts(prev => prev.filter(t => t.id !== id))} />
    </>
  );
}
