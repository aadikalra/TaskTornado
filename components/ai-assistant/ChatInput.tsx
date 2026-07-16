'use client';

import React, { RefObject } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { HugeIcon } from '@/lib/huge-icon-map';
import { Textarea } from '../ui/textarea';

interface ChatInputProps {
  input: string;
  setInput: (val: string) => void;
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void | Promise<void>;
  handleKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  inputRef: RefObject<HTMLTextAreaElement | null>;
  fileInputRef: RefObject<HTMLInputElement | null>;
  hasWiped: boolean;
  setHasWiped: (val: boolean) => void;
  selectedImages: string[];
  removeImage: (index: number) => void;
  handleImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isAILoading: boolean;
  handleStopResponse: (e: any) => void;
  selectedModel: string;
  quickLimit: number;
  quickMessageCounter: number;
  deepLimit: number;
  deeperMessageCounter: number;
  cloudLimit: number;
  cloudMessageCounter: number;
  setIsInputFocused: (val: boolean) => void;
  setChipRotation: (val: number) => void;
}

export const ChatInput = ({
  input,
  setInput,
  handleSubmit,
  handleKeyDown,
  inputRef,
  fileInputRef,
  hasWiped,
  setHasWiped,
  selectedImages,
  removeImage,
  handleImageUpload,
  isAILoading,
  handleStopResponse,
  selectedModel,
  quickLimit,
  quickMessageCounter,
  deepLimit,
  deeperMessageCounter,
  cloudLimit,
  cloudMessageCounter,
  setIsInputFocused,
  setChipRotation
}: ChatInputProps) => {
  const isQuickLimitReached = selectedModel === 'gemma-4-26b-a4b-it' && quickLimit !== Infinity && quickMessageCounter >= quickLimit;
  const isDeepLimitReached = selectedModel === 'gemini-2.5-flash-lite' && (deepLimit === 0 || (deepLimit !== Infinity && deeperMessageCounter >= deepLimit));
  const isCloudLimitReached = selectedModel === 'gpt-oss:20b-cloud' && (cloudLimit === 0 || (cloudLimit !== Infinity && cloudMessageCounter >= cloudLimit));
  
  const isLimitReached = isQuickLimitReached || isDeepLimitReached || isCloudLimitReached;
  const safeInput = input || '';

  return (
    <form
      onSubmit={handleSubmit}
      className={cn(
        "pointer-events-auto bg-white/50 dark:bg-gray-900/50 backdrop-blur-md shadow-xl relative z-20 transition-all duration-300",
        ((safeInput.length) > 80 || (safeInput.split('\n').length) > 1) ? "rounded-[20px]" : "rounded-[28px]",
        "border border-sky-100 dark:border-white/5"
      )}
    >
      {!hasWiped && (
        <svg className="absolute inset-0 w-full h-full pointer-events-none rounded-[28px] overflow-visible z-10">
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
            rx="28" ry="28"
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
      <div className="flex items-end gap-2 p-1 relative z-20">
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
                    <HugeIcon name="Cancel01" className="h-3 w-3" size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Textarea container */}
          <div className="relative">
            <div className="relative">
              <Textarea
                ref={inputRef}
                value={safeInput}
                onChange={(e) => {
                  const value = e.target.value;
                  setInput(value);
                }}
                placeholder={
                  isLimitReached
                    ? `Daily limit reached for ${selectedModel === 'gemma-4-26b-a4b-it' ? 'Quick' : selectedModel === 'gemini-2.5-flash-lite' ? 'Deep' : 'Max'} mode - try again tomorrow`
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
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageUpload}
                accept="image/*"
                multiple
                className="hidden"
              />

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="submit"
                onClick={(e) => {
                  if (isAILoading) {
                    handleStopResponse(e);
                  }
                }}
                disabled={(!isAILoading && (!safeInput.trim() && selectedImages.length === 0)) || isLimitReached}
                className={cn(
                  `p-2 rounded-3xl transition-all duration-300 shadow-sm relative text-white`,
                  (!safeInput.trim() && selectedImages.length === 0)
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
                    (safeInput.trim() || selectedImages.length > 0) ? "text-white" : "text-zinc-400 dark:text-zinc-500"
                  )} size={16} />
                )}
              </motion.button>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
};
