'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { ChevronLeft, ChevronRight, RotateCcw, Save, Loader2, X, Sparkle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { flashcardService } from '@/lib/supabase/flashcards';
import { toast } from 'sonner';

export interface Flashcard {
  id: string;
  question: string;
  answer: string;
  topic: string;
  deck_id?: string;
  created_at?: string | Date | null;
  updated_at?: string | Date | null;
  user_id?: string;
}

interface FlashcardProps {
  cards: Flashcard[];
  onSave?: (cards: Flashcard[]) => void;
}

export function FlashcardDeck({ cards, onSave }: FlashcardProps) {
  const { user } = useAuth();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [deckTitle, setDeckTitle] = useState('');
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const currentCard = cards[currentIndex];

  useEffect(() => {
    if (cards.length > 0) {
      const topic = cards[0]?.topic || 'Study Session';
      setDeckTitle(`${topic} - ${new Date().toLocaleDateString()}`);
    }
  }, [cards]);

  const handleNext = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev + 1) % cards.length);
  };

  const handlePrevious = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev - 1 + cards.length) % cards.length);
  };

  const handleSave = async () => {
    if (!user) {
      toast.error('Please sign in to save flashcard decks');
      return;
    }

    if (cards.length === 0) {
      toast.error('No flashcards to save');
      return;
    }

    try {
      setIsSaving(true);

      const deckData = {
        title: deckTitle,
        description: `Flashcards about ${cards[0]?.topic || 'various topics'}`,
        flashcards: cards.map(card => ({
          question: card.question,
          answer: card.answer,
          topic: card.topic
        }))
      };

      const savedDeck = await flashcardService.createDeck(user.id, deckData);

      toast.success('Flashcard deck saved successfully!');

      if (onSave) {
        onSave(cards);
      }

      setShowSaveDialog(false);
    } catch (error) {
      console.error('Error saving flashcard deck:', error);
      toast.error('Failed to save flashcard deck. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  if (!currentCard) return null;

  const progress = ((currentIndex + 1) / cards.length) * 100;

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-3xl mx-auto">
      {/* Top bar — counter + progress */}
      <div className="w-full flex items-center gap-4">
        <span className="text-sm font-bold text-sky-500 dark:text-sky-400 shrink-0 tabular-nums">
          {currentIndex + 1} / {cards.length}
        </span>
        <div className="flex-1 h-1.5 bg-sky-500/10 dark:bg-sky-400/10 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-sky-500 dark:bg-sky-400 rounded-full"
            initial={{ width: `${progress}%` }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          />
        </div>
      </div>

      {/* Flashcard */}
      <div className="w-full">
        <motion.div
          className="relative w-full cursor-pointer"
          style={{ perspective: 1200 }}
          onClick={() => setIsFlipped(!isFlipped)}
        >
          <motion.div
            className="relative w-full h-[380px]"
            initial={false}
            animate={{ rotateY: isFlipped ? 180 : 0 }}
            transition={{ duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
            style={{ transformStyle: 'preserve-3d' }}
          >
            {/* Front — Question */}
            <div
              className="absolute inset-0 w-full h-full"
              style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}
            >
              <div className="w-full h-full bg-white dark:bg-gray-800 rounded-2xl border border-sky-100 dark:border-gray-700 shadow-sm flex flex-col overflow-hidden">
                {/* Card header */}
                <div className="flex items-center justify-between px-6 pt-5 pb-3">
                  <div className="flex items-center gap-2">
                    <Sparkle className="w-3.5 h-3.5 text-sky-500/40 dark:text-sky-400/40" />
                    <span className="text-[11px] font-bold text-sky-500/40 dark:text-sky-400/40 uppercase tracking-widest">
                      Question
                    </span>
                  </div>
                  <span className="text-[10px] font-medium text-sky-500/30 dark:text-sky-400/30">
                    Tap to reveal
                  </span>
                </div>
                {/* Card body */}
                <div className="flex-1 flex items-center justify-center px-8 pb-8">
                  <p className="text-lg sm:text-xl text-center text-sky-900 dark:text-white leading-relaxed font-medium break-words">
                    {currentCard.question}
                  </p>
                </div>
              </div>
            </div>

            {/* Back — Answer */}
            <div
              className="absolute inset-0 w-full h-full"
              style={{
                backfaceVisibility: 'hidden',
                WebkitBackfaceVisibility: 'hidden',
                transform: 'rotateY(180deg)',
              }}
            >
              <div className="w-full h-full bg-[#ebf6b5] dark:bg-gray-800 rounded-2xl border border-[#d4e88e] dark:border-gray-700 shadow-sm flex flex-col overflow-hidden">
                {/* Card header */}
                <div className="flex items-center justify-between px-6 pt-5 pb-3">
                  <div className="flex items-center gap-2">
                    <Sparkle className="w-3.5 h-3.5 text-sky-700/40 dark:text-sky-400/40" />
                    <span className="text-[11px] font-bold text-sky-700/40 dark:text-sky-400/40 uppercase tracking-widest">
                      Answer
                    </span>
                  </div>
                  <span className="text-[10px] font-medium text-sky-700/30 dark:text-sky-400/30">
                    Tap to flip back
                  </span>
                </div>
                {/* Card body */}
                <div className="flex-1 flex items-center justify-center px-8 pb-8 overflow-y-auto">
                  <p className="text-lg sm:text-xl text-center text-sky-900 dark:text-white leading-relaxed font-medium break-words whitespace-pre-line">
                    {currentCard.answer}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between w-full">
        <button
          onClick={handlePrevious}
          disabled={cards.length <= 1}
          className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-sky-600 dark:text-sky-400 hover:bg-sky-500/5 dark:hover:bg-sky-400/5 rounded-xl transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="h-4 w-4" />
          Prev
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsFlipped(!isFlipped)}
            className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-sky-600 dark:text-sky-400 hover:bg-sky-500/5 dark:hover:bg-sky-400/5 rounded-xl transition-colors"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Flip
          </button>

          {onSave && (
            <button
              onClick={() => setShowSaveDialog(true)}
              disabled={isSaving}
              className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-sky-700 bg-[#ebf6b5] hover:bg-[#e0efa0] border border-[#d4e88e] rounded-xl transition-colors disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Saving
                </>
              ) : (
                <>
                  <Save className="h-3.5 w-3.5" />
                  Save
                </>
              )}
            </button>
          )}
        </div>

        <button
          onClick={handleNext}
          disabled={cards.length <= 1}
          className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-sky-600 dark:text-sky-400 hover:bg-sky-500/5 dark:hover:bg-sky-400/5 rounded-xl transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          Next
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* Dot nav */}
      {cards.length > 1 && cards.length <= 20 && (
        <div className="flex items-center gap-1.5">
          {cards.map((_, idx) => (
            <button
              key={idx}
              onClick={() => { setIsFlipped(false); setCurrentIndex(idx); }}
              className={`w-2 h-2 rounded-full transition-all ${idx === currentIndex
                ? 'bg-sky-500 dark:bg-sky-400 scale-125'
                : 'bg-sky-500/20 dark:bg-sky-400/20 hover:bg-sky-500/40 dark:hover:bg-sky-400/40'
                }`}
            />
          ))}
        </div>
      )}

      {/* Save Dialog */}
      <AnimatePresence>
        {showSaveDialog && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
              onClick={() => setShowSaveDialog(false)}
            />
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                transition={{ duration: 0.2 }}
                className="w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-sky-100 dark:border-gray-700"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-5">
                    <h2 className="text-lg font-bold text-sky-900 dark:text-white">
                      Save Deck
                    </h2>
                    <button
                      onClick={() => setShowSaveDialog(false)}
                      className="p-1.5 rounded-lg text-sky-500/40 hover:text-sky-600 dark:text-sky-400/40 dark:hover:text-sky-400 hover:bg-sky-500/5 dark:hover:bg-sky-400/5 transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label htmlFor="deckTitle" className="block text-xs font-bold text-sky-500/50 dark:text-sky-400/50 mb-2 uppercase tracking-wider">
                        Deck Title
                      </label>
                      <Input
                        id="deckTitle"
                        type="text"
                        value={deckTitle}
                        onChange={(e) => setDeckTitle(e.target.value)}
                        className="border-sky-100 dark:border-gray-700 bg-[#f5f9fc] dark:bg-gray-900 text-sky-900 dark:text-white rounded-xl focus:border-sky-500 dark:focus:border-sky-400"
                        placeholder="Enter a title for your deck"
                        autoFocus
                      />
                    </div>
                    <div className="flex justify-end gap-2 pt-1">
                      <button
                        onClick={() => setShowSaveDialog(false)}
                        disabled={isSaving}
                        className="px-4 py-2 text-sm font-semibold text-sky-600 dark:text-sky-400 hover:bg-sky-500/5 dark:hover:bg-sky-400/5 rounded-xl transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSave}
                        disabled={isSaving || !deckTitle.trim()}
                        className="flex items-center gap-2 px-5 py-2 text-sm font-semibold text-sky-700 bg-[#ebf6b5] hover:bg-[#e0efa0] border border-[#d4e88e] rounded-xl transition-colors disabled:opacity-50"
                      >
                        {isSaving ? (
                          <>
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          'Save Deck'
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
