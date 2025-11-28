'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Plus, Trash2, BookOpen, Home } from 'lucide-react';
import { FlashcardDeck, Flashcard } from '@/components/Flashcard';
import { useAuth } from '@/context/AuthContext';
import { flashcardService } from '@/lib/supabase/flashcards';
import { toast } from 'sonner';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useWideLayout } from '@/hooks/use-wide-layout';

interface FlashcardDeckType {

  id: string;

  title: string;

  description: string | null;

  created_at: string | null;

  updated_at: string | null;

  flashcards?: Flashcard[];

}

export default function FlashcardsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { getContainerClass } = useWideLayout();
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [savedDecks, setSavedDecks] = useState<FlashcardDeckType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [view, setView] = useState<'current' | 'saved'>('current');
  const [selectedDeck, setSelectedDeck] = useState<FlashcardDeckType | null>(null);

  // Fetch saved decks from the database
  useEffect(() => {
    const fetchDecks = async () => {
      if (!user) return;

      try {
        const decks = await flashcardService.getDecks(user.id);
        setSavedDecks(decks);
      } catch (error) {
        console.error('Error fetching flashcard decks:', error);
        toast.error('Failed to load your flashcard decks');
      }
    };

    fetchDecks();
  }, [user]);

  // Check for flashcards in localStorage
  useEffect(() => {
    const savedFlashcards = localStorage.getItem('currentFlashcards');
    if (savedFlashcards) {
      try {
        setFlashcards(JSON.parse(savedFlashcards));
      } catch (error) {
        console.error('Error parsing flashcards:', error);
      }
    }
    setIsLoading(false);
  }, []);

  const loadDeck = async (deckId: string) => {
    if (!user) return;

    try {
      const deck = await flashcardService.getDeckWithCards(deckId, user.id);

      // Convert to the format expected by the FlashcardDeck component
      // Convert to the format expected by the FlashcardDeck component
      const formattedCards = (deck.flashcards || []).map((card: any) => ({
        ...card,
        topic: deck.title,
      }));

      setSelectedDeck({ ...deck, flashcards: formattedCards });
      setFlashcards(formattedCards);
      setView('saved');
    } catch (error) {
      console.error('Error loading flashcard deck:', error);
      toast.error('Failed to load flashcard deck');
    }
  };

  const deleteDeck = async (deckId: string, e: React.MouseEvent) => {
    e.stopPropagation();

    if (!user) return;

    if (!confirm('Are you sure you want to delete this deck? This action cannot be undone.')) {
      return;
    }

    try {
      await flashcardService.deleteDeck(deckId, user.id);
      setSavedDecks(prev => prev.filter(deck => deck.id !== deckId));
      toast.success('Deck deleted successfully');

      // If the deleted deck is currently selected, clear the selection
      if (selectedDeck?.id === deckId) {
        setSelectedDeck(null);
        setView('current');
      }
    } catch (error) {
      console.error('Error deleting flashcard deck:', error);
      toast.error('Failed to delete flashcard deck');
    }
  };

  const handleSave = (updatedCards: Flashcard[]) => {
    // Update the local state to reflect any changes
    setFlashcards(updatedCards);

    // If we're viewing a saved deck, update the selectedDeck state
    if (selectedDeck) {
      setSelectedDeck(prev => ({
        ...prev!,
        flashcards: updatedCards
      }));
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-950">
        <div className={getContainerClass() + ' py-16'}>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-16"
          >
            <h1 className="text-4xl font-light text-gray-900 dark:text-white mb-3 tracking-tight">
              Flashcards
            </h1>
            <p className="text-gray-500 dark:text-gray-400">
              Study and review your flashcard decks
            </p>
          </motion.div>

          <div className="space-y-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="border-b border-gray-200 dark:border-gray-800 pb-6">
                <div className="h-6 w-48 bg-gray-100 dark:bg-gray-800 rounded mb-2 animate-pulse" />
                <div className="h-4 w-32 bg-gray-100 dark:bg-gray-800 rounded mb-4 animate-pulse" />
                <div className="h-10 w-24 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Show the saved decks list
  if (view === 'saved' && !selectedDeck) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-950">
        <div className={getContainerClass() + ' py-16'}>

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-16"
          >
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-4xl font-light text-gray-900 dark:text-white mb-3 tracking-tight">
                  Saved Flashcards
                </h1>
                <p className="text-gray-500 dark:text-gray-400">
                  {savedDecks.length} deck{savedDecks.length !== 1 ? 's' : ''}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={() => setView('current')} className="gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Back to Current
                </Button>
                <Button asChild>
                  <Link href="/study-assistant" className="gap-2">
                    <Plus className="h-4 w-4" />
                    Create New
                  </Link>
                </Button>
              </div>
            </div>
          </motion.div>

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
          >
            {savedDecks.length === 0 ? (
              <div className="text-center py-16">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full mb-4">
                  <BookOpen className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
                  No flashcard decks yet
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mb-6">
                  Create your first flashcard deck using the Study Assistant!
                </p>
                <Button asChild>
                  <Link href="/study-assistant" className="gap-2">
                    <Plus className="h-4 w-4" />
                    Go to Study Assistant
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                {savedDecks.map((deck, index) => (
                  <motion.div
                    key={deck.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 + index * 0.05 }}
                    className="border-b border-gray-200 dark:border-gray-800 pb-6 last:border-0 group"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2 cursor-pointer hover:text-gray-700 dark:hover:text-gray-300" onClick={() => loadDeck(deck.id)}>
                          {deck.title}
                        </h3>
                        {deck.description && (
                          <p className="text-sm text-gray-500 dark:text-gray-400 mb-3 line-clamp-2">
                            {deck.description}
                          </p>
                        )}
                        <p className="text-xs text-gray-400 dark:text-gray-500">
                          Created {deck.created_at ? new Date(deck.created_at).toLocaleDateString() : 'N/A'}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" onClick={() => loadDeck(deck.id)} className="gap-2">
                          Study
                          <ArrowLeft className="h-4 w-4 rotate-180" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => deleteDeck(deck.id, e)}
                          className="h-8 w-8 p-0 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>

          {/* Footer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-20 pt-8 border-t border-gray-200 dark:border-gray-800"
          >
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Built for students • Public Beta v1.1.8
              </p>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/')}
                className="gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              >
                <Home className="h-4 w-4" />
                <span>Home</span>
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  // If we have no flashcards to display
  if (flashcards.length === 0) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-950">
        <div className={getContainerClass() + ' py-16'}>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-16"
          >
            <h1 className="text-4xl font-light text-gray-900 dark:text-white mb-3 tracking-tight">
              Flashcards
            </h1>
            <p className="text-gray-500 dark:text-gray-400">
              Study and review your flashcard decks
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
          >
            <div className="text-center py-16">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full mb-4">
                <BookOpen className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
                No Flashcards Found
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md text-center">
                {view === 'current'
                  ? "It looks like you don't have any flashcards to review. Generate some from the Study Assistant!"
                  : "This flashcard deck is empty."}
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                {view === 'saved' ? (
                  <>
                    <Button variant="ghost" size="sm" onClick={() => setView('saved')} className="gap-2">
                      <ArrowLeft className="h-4 w-4" />
                      Back to Saved
                    </Button>
                    <Button asChild>
                      <Link href="/study-assistant" className="gap-2">
                        <Plus className="h-4 w-4" />
                        Create New
                      </Link>
                    </Button>
                  </>
                ) : (
                  <Button onClick={() => router.push('/study-assistant')} className="gap-2">
                    <Plus className="h-4 w-4" />
                    Go to Study Assistant
                  </Button>
                )}
              </div>
            </div>
          </motion.div>

          {/* Footer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-20 pt-8 border-t border-gray-200 dark:border-gray-800"
          >
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Built for students • Public Beta v1.1.8
              </p>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/')}
                className="gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              >
                <Home className="h-4 w-4" />
                <span>Home</span>
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <div className={getContainerClass() + ' py-16'}>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-16"
        >
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-4xl font-light text-gray-900 dark:text-white mb-3 tracking-tight">
                {selectedDeck ? selectedDeck.title : 'Flashcards'}
              </h1>
              {selectedDeck?.description && (
                <p className="text-gray-500 dark:text-gray-400">
                  {selectedDeck.description}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => view === 'saved' ? setView('saved') : router.back()}
                className="gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                {view === 'saved' ? 'Back to Saved' : 'Back'}
              </Button>
              {savedDecks.length > 0 && view !== 'saved' && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setView('saved')}
                  className="gap-2"
                >
                  <BookOpen className="h-4 w-4" />
                  Saved
                </Button>
              )}
              <Button asChild>
                <Link href="/study-assistant" className="gap-2">
                  <Plus className="h-4 w-4" />
                  New
                </Link>
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Flashcard Deck */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
        >
          <div className="border border-gray-200 dark:border-gray-800 rounded-xl p-6 bg-white dark:bg-gray-900">
            <FlashcardDeck cards={flashcards} onSave={handleSave} />
          </div>
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-20 pt-8 border-t border-gray-200 dark:border-gray-800"
        >
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Built for students • Public Beta v1.1.8
            </p>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/')}
              className="gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            >
              <Home className="h-4 w-4" />
              <span>Home</span>
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
