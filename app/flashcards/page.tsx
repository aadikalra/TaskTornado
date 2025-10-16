'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Plus, Trash2, BookOpen } from 'lucide-react';
import { FlashcardDeck, Flashcard } from '@/components/Flashcard';
import { useAuth } from '@/context/AuthContext';
import { flashcardService } from '@/lib/supabase/flashcards';
import { toast } from 'sonner';
import Link from 'next/link';

interface FlashcardDeckType {
  id: string;
  title: string;
  description: string | null;
  created_at: string;
  updated_at: string | null;
  flashcards?: Flashcard[];
}

export default function FlashcardsPage() {
  const router = useRouter();
  const { user } = useAuth();
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
      setSelectedDeck(deck);
      setView('saved');
      
      // Convert to the format expected by the FlashcardDeck component
      const formattedCards = (deck.flashcards || []).map((card: Flashcard) => ({
        id: card.id,
        question: card.question,
        answer: card.answer,
        topic: deck.title,
        deck_id: deck.id,
        created_at: card.created_at,
        updated_at: card.updated_at,
        user_id: card.user_id
      }));
      
      setFlashcards(formattedCards);
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
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Show the saved decks list
  if (view === 'saved' && !selectedDeck) {
    return (
      <div className="container mx-auto p-4 max-w-4xl">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">My Flashcard Decks</h1>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={() => setView('current')}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Current Session
            </Button>
            <Button asChild>
              <Link href="/study-assistant">
                <Plus className="mr-2 h-4 w-4" />
                Create New with AI
              </Link>
            </Button>
          </div>
        </div>

        {savedDecks.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">No flashcard decks yet</h3>
            <p className="text-muted-foreground mt-2">
              Create your first flashcard deck using the Study Assistant!
            </p>
            <Button className="mt-6" asChild>
              <Link href="/study-assistant">
                Go to Study Assistant
              </Link>
            </Button>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {savedDecks.map((deck) => (
              <div 
                key={deck.id}
                onClick={() => loadDeck(deck.id)}
                className="relative p-4 border rounded-lg hover:border-primary transition-colors cursor-pointer group"
              >
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:bg-destructive/10"
                    onClick={(e) => deleteDeck(deck.id, e)}
                  >
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">Delete deck</span>
                  </Button>
                </div>
                <h3 className="font-semibold line-clamp-1">{deck.title}</h3>
                {deck.description && (
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                    {deck.description}
                  </p>
                )}
                <div className="mt-3 text-xs text-muted-foreground">
                  Created: {new Date(deck.created_at).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // If we have no flashcards to display
  if (flashcards.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-4 text-center">
        <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
        <h1 className="text-2xl font-bold mb-2">No Flashcards Found</h1>
        <p className="text-muted-foreground mb-6 max-w-md">
          {view === 'current' 
            ? "It looks like you don't have any flashcards to review. Generate some from the Study Assistant!"
            : "This flashcard deck is empty."}
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          {view === 'saved' ? (
            <>
              <Button variant="outline" onClick={() => setView('saved')}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to My Decks
              </Button>
              <Button asChild>
                <Link href="/study-assistant">
                  <Plus className="mr-2 h-4 w-4" />
                  Create New with AI
                </Link>
              </Button>
            </>
          ) : (
            <Button onClick={() => router.push('/study-assistant')}>
              Go to Study Assistant
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <div className="flex justify-between items-center mb-6">
        <Button 
          variant="ghost" 
          onClick={() => view === 'saved' ? setView('saved') : router.back()}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          {view === 'saved' ? 'Back to My Decks' : 'Back'}
        </Button>
        
        <div className="text-center">
          <h1 className="text-2xl font-bold">
            {selectedDeck ? selectedDeck.title : 'Flashcards'}
          </h1>
          {selectedDeck?.description && (
            <p className="text-sm text-muted-foreground">
              {selectedDeck.description}
            </p>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          {savedDecks.length > 0 && view !== 'saved' && (
            <Button 
              variant="outline" 
              onClick={() => setView('saved')}
              className="hidden sm:flex"
            >
              <BookOpen className="mr-2 h-4 w-4" />
              My Decks
            </Button>
          )}
          <Button asChild>
            <Link href="/study-assistant">
              <Plus className="mr-2 h-4 w-4" />
              New with AI
            </Link>
          </Button>
        </div>
      </div>

      <div className="bg-card rounded-lg shadow-sm border p-4">
        <FlashcardDeck cards={flashcards} onSave={handleSave} />
      </div>
    </div>
  );
}
