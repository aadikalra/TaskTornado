import { supabase } from './client';
import { Database } from '@/types/database.types';

type FlashcardDeck = Database['public']['Tables']['flashcard_decks']['Row'] & {
  flashcards?: Flashcard[];
};

type Flashcard = Database['public']['Tables']['flashcards']['Row'];

type CreateDeckData = {
  title: string;
  description?: string;
  flashcards: Array<{ question: string; answer: string }>;
};

export const flashcardService = {
  // Get total flashcard count for a user (for plan tier limit checks)
  getTotalCardCount: async (userId: string): Promise<number> => {
    const { count, error } = await supabase
      .from('flashcards')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    if (error) throw error;
    return count ?? 0;
  },

  // Deck operations
  getDecks: async (userId: string) => {
    const { data, error } = await supabase
      .from('flashcard_decks')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  getDeckWithCards: async (deckId: string, userId: string) => {
    const { data: deck, error: deckError } = await supabase
      .from('flashcard_decks')
      .select('*')
      .eq('id', deckId)
      .eq('user_id', userId)
      .single();

    if (deckError) throw deckError;

    const { data: flashcards, error: cardsError } = await supabase
      .from('flashcards')
      .select('*')
      .eq('deck_id', deckId)
      .order('created_at');

    if (cardsError) throw cardsError;

    return { ...deck, flashcards };
  },

  createDeck: async (userId: string, deckData: CreateDeckData) => {
    // Start a transaction
    const { data: deck, error: deckError } = await supabase
      .rpc('create_flashcard_deck_with_cards', {
        p_user_id: userId,
        p_title: deckData.title,
        p_description: deckData.description || '',
        p_flashcards: deckData.flashcards
      });

    if (deckError) throw deckError;
    return deck;
  },

  updateDeck: async (deckId: string, updates: Partial<FlashcardDeck>, userId: string) => {
    const { data, error } = await supabase
      .from('flashcard_decks')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', deckId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  deleteDeck: async (deckId: string, userId: string) => {
    // This will cascade delete all flashcards due to the foreign key constraint
    const { error } = await supabase
      .from('flashcard_decks')
      .delete()
      .eq('id', deckId)
      .eq('user_id', userId);

    if (error) throw error;
    return true;
  },

  // Flashcard operations
  createFlashcard: async (flashcard: Omit<Flashcard, 'id' | 'created_at' | 'updated_at'>) => {
    const { data, error } = await supabase
      .from('flashcards')
      .insert(flashcard)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  updateFlashcard: async (id: string, updates: Partial<Flashcard>, userId: string) => {
    const { data, error } = await supabase
      .from('flashcards')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  deleteFlashcard: async (id: string, userId: string) => {
    const { error } = await supabase
      .from('flashcards')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) throw error;
    return true;
  },

  // Batch operations
  saveFlashcardDeck: async (userId: string, deckId: string | null, deckData: CreateDeckData) => {
    if (deckId) {
      // Update existing deck
      await flashcardService.updateDeck(deckId, {
        title: deckData.title,
        description: deckData.description
      }, userId);

      // Delete existing flashcards and create new ones
      await supabase
        .from('flashcards')
        .delete()
        .eq('deck_id', deckId);

      const newFlashcards = deckData.flashcards.map(card => ({
        ...card,
        deck_id: deckId,
        user_id: userId
      }));

      const { data, error } = await supabase
        .from('flashcards')
        .insert(newFlashcards)
        .select();

      if (error) throw error;
      return { id: deckId, flashcards: data };
    } else {
      // Create new deck with cards
      return flashcardService.createDeck(userId, deckData);
    }
  }
};
