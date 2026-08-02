import React, { RefObject } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { HugeIcon } from '@/lib/huge-icon-map';
import { Textarea } from '../ui/textarea';

interface ChatInputProps {
  input: string;
  setInput: (val: string) => void;
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void | Promise<void>;
  handleKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  inputRef: RefObject<HTMLTextAreaElement | null>;
  hasWiped: boolean;
  setHasWiped: (val: boolean) => void;
  isAILoading: boolean;
  handleStopResponse: (e: React.MouseEvent<HTMLButtonElement>) => void;
  selectedModel: string;
  quickLimit: number;
  quickMessageCounter: number;
  deepLimit: number;
  deeperMessageCounter: number;
  cloudLimit?: number;
  cloudMessageCounter?: number;
  combinedLimitReached?: boolean;
  setIsInputFocused: (val: boolean) => void;
  setChipRotation: (val: number) => void;
  activeQuestion?: { question: string; options: string[] } | null;
  onSelectQuestionOption?: (option: string) => void;
  onDismissQuestion?: () => void;
}

export const ChatInput = ({
  input,
  setInput,
  handleSubmit,
  handleKeyDown,
  inputRef,
  hasWiped,
  setHasWiped,
  isAILoading,
  handleStopResponse,
  selectedModel,
  quickLimit,
  quickMessageCounter,
  deepLimit,
  deeperMessageCounter,
  combinedLimitReached = false,
  setIsInputFocused,
  setChipRotation,
  activeQuestion,
  onSelectQuestionOption,
  onDismissQuestion,
}: ChatInputProps) => {
  const isQuick =
    selectedModel === 'quick' || selectedModel === 'gemma-4-26b-a4b-it';
  const isDeep =
    selectedModel === 'tutor' || selectedModel.includes('gemini');
  const isQuickLimitReached = isQuick && quickLimit !== Infinity && quickMessageCounter >= quickLimit;
  const isDeepLimitReached = isDeep && (deepLimit === 0 || (deepLimit !== Infinity && deeperMessageCounter >= deepLimit));
  
  const isLimitReached =
    combinedLimitReached || isQuickLimitReached || isDeepLimitReached;
  const safeInput = input || '';

  return (
    <form
      onSubmit={handleSubmit}
      className={cn(
        "pointer-events-auto bg-white/60 dark:bg-gray-900/60 backdrop-blur-md shadow-sm relative z-20 transition-all duration-300 rounded-[20px]",
        "border border-sky-100 dark:border-white/5 overflow-hidden"
      )}
    >
      {!hasWiped && (
        <svg className="absolute inset-0 w-full h-full pointer-events-none rounded-[20px] overflow-visible z-10">
          <defs>
            <linearGradient id="border-glow-wipe" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#165df9" stopOpacity="0" />
              <stop offset="50%" stopColor="#165df9" stopOpacity="1" />
              <stop offset="100%" stopColor="#165df9" stopOpacity="0" />
            </linearGradient>
            <filter id="glow-filter" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>
          <motion.rect
            x="0" y="0"
            width="100%" height="100%"
            rx="20" ry="20"
            fill="none"
            stroke="url(#border-glow-wipe)"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeDasharray="1 1"
            filter="url(#glow-filter)"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{
              pathLength: 1,
              opacity: [0, 1, 1, 0]
            }}
            transition={{
              pathLength: { duration: 3.5, ease: [0.65, 0, 0.35, 1] },
              opacity: { times: [0, 0.1, 0.85, 1], duration: 3.5 }
            }}
            onAnimationComplete={() => setHasWiped(true)}
          />
        </svg>
      )}

      <AnimatePresence mode="wait">
        {activeQuestion ? (
          <motion.div
            key="question-morph"
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="p-3.5 flex flex-col gap-3 relative z-20"
          >
            <div className="flex items-center justify-between gap-2 px-1">
              <div className="flex items-center gap-2 text-xs font-semibold text-sky-700 dark:text-sky-300">
                <HugeIcon name="HelpCircle" className="h-4 w-4 text-sky-500" size={16} />
                <span>{activeQuestion.question}</span>
              </div>
              {onDismissQuestion && (
                <button
                  type="button"
                  onClick={onDismissQuestion}
                  className="text-xs text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition font-medium"
                >
                  Type manually
                </button>
              )}
            </div>

            <div className="flex flex-wrap gap-2 pt-0.5">
              {activeQuestion.options.map((option, idx) => (
                <motion.button
                  key={idx}
                  whileHover={{ scale: 1.02, y: -1 }}
                  whileTap={{ scale: 0.97 }}
                  type="button"
                  onClick={() => onSelectQuestionOption?.(option)}
                  className="flex-1 min-w-[120px] rounded-xl border border-sky-200/80 bg-sky-50/90 px-3.5 py-2.5 text-xs font-medium text-sky-950 shadow-sm backdrop-blur-md transition-all hover:border-sky-400 hover:bg-sky-100 hover:shadow-sky-500/10 dark:border-sky-800/60 dark:bg-sky-950/60 dark:text-sky-100 dark:hover:border-sky-500 dark:hover:bg-sky-900/80"
                >
                  {option}
                </motion.button>
              ))}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="chat-input-normal"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            transition={{ duration: 0.2 }}
            className="flex items-end gap-2 p-1 relative z-20"
          >
            <div className="flex-1">
              <div className="relative">
                <Textarea
                  data-ai-chat-input="true"
                  ref={inputRef}
                  value={safeInput}
                  onChange={(e) => {
                    const value = e.target.value;
                    setInput(value);
                  }}
                  placeholder={
                    combinedLimitReached
                      ? 'Daily AI allowance reached — resets tomorrow'
                      : isLimitReached
                      ? `Daily limit reached for ${isQuick ? 'Quick' : 'Deep'} mode - try again tomorrow`
                      : "Ask away..."
                  }
                  disabled={isLimitReached}
                  className={cn(
                    `min-h-[44px] max-h-[160px] w-full resize-none border-0 bg-transparent dark:bg-transparent p-3 pr-24 focus-visible:ring-0 focus-visible:ring-offset-0 overflow-y-auto`,
                    isLimitReached && 'opacity-50 cursor-not-allowed',
                    'text-foreground'
                  )}
                  rows={(safeInput.length > 80 || safeInput.split('\n').length > 1) ? Math.min(6, Math.max(3, safeInput.split('\n').length)) : 1}
                  onKeyDown={handleKeyDown}
                  onFocus={() => {
                    setIsInputFocused(true);
                    setChipRotation(Math.random()); // Rotate chips on focus
                  }}
                  onBlur={() => {
                    // Delay slightly so clicking a chip works before blur hides it
                    setTimeout(() => setIsInputFocused(false), 200);
                  }}
                />
              </div>

              {/* Action buttons */}
              <div className="absolute right-2 inset-y-0 flex items-center gap-0">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="submit"
                  onClick={(e) => {
                    if (isAILoading) {
                      handleStopResponse(e);
                    }
                  }}
                  disabled={(!isAILoading && !safeInput.trim()) || isLimitReached}
                  className={cn(
                    `p-2 rounded-xl transition-all duration-300 shadow-sm relative text-white`,
                    !safeInput.trim()
                      ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-500 shadow-none'
                      : 'bg-sky-500 hover:bg-sky-600 shadow-sky-500/20',
                    isLimitReached && 'opacity-30 grayscale pointer-events-none'
                  )}
                >
                  {isAILoading ? (
                    <div className="h-4 w-4 relative flex items-center justify-center">
                      <div className="h-3 w-3 bg-white transition-colors" />
                    </div>
                  ) : (
                    <HugeIcon name="ArrowUp02" className={cn(
                      "h-4 w-4",
                      safeInput.trim() ? "text-white" : "text-zinc-400 dark:text-zinc-500"
                    )} size={16} />
                  )}
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </form>
  );
};
