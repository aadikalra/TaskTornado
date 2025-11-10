'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FlipHorizontal, ArrowLeft, ArrowRight, Save, Loader2 } from 'lucide-react';
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
    <div className="flex flex-col items-center space-y-6 w-full max-w-3xl mx-auto">
      <div className="w-full relative" style={{ height: '400px' }}>
        <motion.div
          className="w-full h-full"
          initial={false}
          animate={{ rotateY: isFlipped ? 180 : 0 }}
          transition={{ duration: 0.6 }}
          onClick={() => setIsFlipped(!isFlipped)}
          style={{
            transformStyle: 'preserve-3d',
            position: 'relative',
            width: '100%',
            height: '100%',
            cursor: 'pointer',
          }}
        >
          {/* Front of card */}
          <motion.div
            className="absolute w-full h-full backface-hidden"
            style={{
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
            }}
            initial={false}
            animate={{ opacity: isFlipped ? 0 : 1 }}
          >
            <Card className="h-full flex flex-col">
              <CardHeader className="border-b p-4">
                <CardTitle className="text-lg text-muted-foreground">
                  Question {currentIndex + 1} of {cards.length}
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-grow flex items-center justify-center p-6 overflow-y-auto">
                <p className="text-xl text-center break-words max-w-full">{currentCard.question}</p>
              </CardContent>
              <div className="p-3 text-center text-sm text-muted-foreground border-t">
                Click to reveal answer
              </div>
            </Card>
          </motion.div>

          {/* Back of card */}
          <motion.div
            className="absolute w-full h-full backface-hidden"
            style={{
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
            }}
            initial={false}
            animate={{ opacity: isFlipped ? 1 : 0 }}
          >
            <Card className="h-full flex flex-col bg-muted/50">
              <CardHeader className="border-b p-4">
                <CardTitle className="text-lg">Answer</CardTitle>
              </CardHeader>
              <CardContent className="flex-grow flex items-center p-6 overflow-y-auto">
                <div className="prose prose-sm sm:prose lg:prose-lg xl:prose-xl max-w-none w-full">
                  <p className="text-xl text-center break-words whitespace-pre-line">
                    {currentCard.answer}
                  </p>
                </div>
              </CardContent>
              <div className="p-3 text-center text-sm text-muted-foreground border-t">
                Click to see question
              </div>
            </Card>
          </motion.div>
        </motion.div>
      </div>

      <div className="flex justify-between w-full items-center">
        <Button
          variant="outline"
          size="icon"
          onClick={handlePrevious}
          disabled={cards.length <= 1}
          aria-label="Previous card"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsFlipped(!isFlipped)}
            className="flex items-center"
          >
            <FlipHorizontal className="h-4 w-4 mr-2" />
            {isFlipped ? 'Show Question' : 'Show Answer'}
          </Button>
          
          {onSave && (
            <>
              <Button
                variant="default"
                size="sm"
                onClick={() => setShowSaveDialog(true)}
                disabled={isSaving}
                className="flex items-center"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Deck
                  </>
                )}
              </Button>
              
              {/* Save Deck Dialog */}
              {showSaveDialog && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
                    <h3 className="text-lg font-semibold mb-4">Save Flashcard Deck</h3>
                    <div className="space-y-4">
                      <div>
                            <label htmlFor="deckTitle" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                              Deck Title
                            </label>
                            <input
                              type="text"
                              id="deckTitle"
                              value={deckTitle}
                              onChange={(e) => setDeckTitle(e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                              placeholder="Enter a title for your deck"
                            />
                          </div>
                      <div className="flex justify-end space-x-3 pt-2">
                        <Button
                          variant="outline"
                          onClick={() => setShowSaveDialog(false)}
                          disabled={isSaving}
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={handleSave}
                          disabled={isSaving || !deckTitle.trim()}
                          className="bg-primary hover:bg-primary/90"
                        >
                          {isSaving ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Saving...
                            </>
                          ) : (
                            'Save Deck'
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        <Button
          variant="outline"
          size="icon"
          onClick={handleNext}
          disabled={cards.length <= 1}
          aria-label="Next card"
        >
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="text-sm text-muted-foreground">
        Card {currentIndex + 1} of {cards.length}
      </div>
    </div>
  );
}
