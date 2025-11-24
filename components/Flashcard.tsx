'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FlipHorizontal, ArrowLeft, ArrowRight, Save, Loader2, X } from 'lucide-react';
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
    // Set a default title based on the topic or current date
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

      // Close the save dialog
      setShowSaveDialog(false);
    } catch (error) {
      console.error('Error saving flashcard deck:', error);
      toast.error('Failed to save flashcard deck. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  if (!currentCard) return null;

  return (
    <div className="flex flex-col items-center gap-8 w-full max-w-4xl mx-auto">
      {/* Progress Indicator */}
      <div className="w-full">
        <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-2">
          <span>Question {currentIndex + 1}</span>
          <span>{cards.length}</span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1">
          <motion.div
            className="bg-gray-900 dark:bg-white h-1 rounded-full"
            initial={{ width: `${((currentIndex + 1) / cards.length) * 100}%` }}
            animate={{ width: `${((currentIndex + 1) / cards.length) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {/* Flashcard */}
      <div className="w-full">
        <motion.div
          className="relative w-full aspect-3/2 cursor-pointer"
          initial={false}
          animate={{ rotateY: isFlipped ? 180 : 0 }}
          transition={{ duration: 0.6 }}
          onClick={() => setIsFlipped(!isFlipped)}
          style={{
            transformStyle: 'preserve-3d',
            position: 'relative',
            width: '100%',
          }}
        >
          {/* Front of card */}
          <motion.div
            className="absolute inset-0 backface-hidden"
            style={{
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
            }}
            initial={false}
            animate={{ opacity: isFlipped ? 0 : 1 }}
          >
            <div className="w-full h-full bg-white dark:bg-gray-900 rounded-2xl flex flex-col">
              <div className="flex items-center justify-between mb-6 px-8 pt-8">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Question
                </span>
                <span className="text-xs text-gray-400 dark:text-gray-500">
                  Click to reveal
                </span>
              </div>
              <div className="flex-1 flex items-center justify-center px-8 pb-8">
                <p className="text-xl text-center text-gray-900 dark:text-white leading-relaxed wrap-break-word">
                  {currentCard.question}
                </p>
              </div>
            </div>
          </motion.div>

          {/* Back of card */}
          <motion.div
            className="absolute inset-0 backface-hidden"
            style={{
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
            }}
            initial={false}
            animate={{ opacity: isFlipped ? 1 : 0 }}
          >
            <div className="w-full h-full bg-gray-50 dark:bg-gray-800 rounded-2xl flex flex-col">
              <div className="flex items-center justify-between mb-6 px-8 pt-8">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Answer
                </span>
                <span className="text-xs text-gray-400 dark:text-gray-500">
                  Click to flip back
                </span>
              </div>
              <div className="flex-1 flex items-center justify-center px-8 pb-8">
                <p className="text-xl text-center text-gray-900 dark:text-white leading-relaxed wrap-break-word whitespace-pre-line">
                  {currentCard.answer}
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between w-full">
        <Button
          variant="ghost"
          size="sm"
          onClick={handlePrevious}
          disabled={cards.length <= 1}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Previous
        </Button>

        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsFlipped(!isFlipped)}
            className="gap-2"
          >
            <FlipHorizontal className="h-4 w-4" />
            {isFlipped ? 'Question' : 'Answer'}
          </Button>

          {onSave && (
            <Button
              variant="default"
              size="sm"
              onClick={() => setShowSaveDialog(true)}
              disabled={isSaving}
              className="gap-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100"
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Save
                </>
              )}
            </Button>
          )}
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={handleNext}
          disabled={cards.length <= 1}
          className="gap-2"
        >
          Next
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Save Deck Modal */}
      <AnimatePresence>
        {showSaveDialog && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50"
              onClick={() => setShowSaveDialog(false)}
            />
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="w-full max-w-md bg-white dark:bg-gray-800 rounded-xl shadow-xl"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-medium text-gray-900 dark:text-white">
                      Save Flashcard Deck
                    </h2>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowSaveDialog(false)}
                      className="h-8 w-8 p-0"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label htmlFor="deckTitle" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Deck Title
                      </label>
                      <Input
                        id="deckTitle"
                        type="text"
                        value={deckTitle}
                        onChange={(e) => setDeckTitle(e.target.value)}
                        className="border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900"
                        placeholder="Enter a title for your deck"
                        autoFocus
                      />
                    </div>
                    <div className="flex justify-end gap-3 pt-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowSaveDialog(false)}
                        disabled={isSaving}
                        className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleSave}
                        disabled={isSaving || !deckTitle.trim()}
                        size="sm"
                        className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100"
                      >
                        {isSaving ? (
                          <>
                            <Loader2 className="h-3 w-3 mr-2 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          'Save Deck'
                        )}
                      </Button>
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
