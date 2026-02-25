'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Plus, Trash2, BookOpen, Sparkle, Layers, AlertTriangle } from 'lucide-react';
import { FlashcardDeck, Flashcard } from '@/components/Flashcard';
import { useAuth } from '@/context/AuthContext';
import { useRequireAuth } from '@/hooks/use-require-auth';
import { flashcardService } from '@/lib/supabase/flashcards';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { useRouteIntro } from '@/hooks/use-route-intro';
import { RouteIntroPopup } from '@/components/RouteIntroPopup';
import { useAI } from '@/context/AIContext';

interface FlashcardDeckType {
  id: string;
  title: string;
  description: string | null;
  created_at: string | null;
  updated_at: string | null;
  flashcards?: Flashcard[];
}

export default function FlashcardsPage() {
  const { authenticated } = useRequireAuth();
  if (!authenticated) return null;
  const router = useRouter();
  const { user } = useAuth();
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [savedDecks, setSavedDecks] = useState<FlashcardDeckType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [studyingDeck, setStudyingDeck] = useState<FlashcardDeckType | null>(null);
  const [studyingTemp, setStudyingTemp] = useState(false);
  const [tempFlashcards, setTempFlashcards] = useState<Flashcard[]>([]);

  const { showIntro, dismissIntro } = useRouteIntro('flashcards');
  const { setAIAssistantOpen, setAIInput } = useAI();

  const openFlashcardAssistant = () => {
    setAIInput('@flashcard ');
    setAIAssistantOpen(true);
  };

  // Fetch saved decks
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

  // Check for temp flashcards in localStorage
  useEffect(() => {
    const saved = localStorage.getItem('currentFlashcards');
    if (saved) {
      try {
        setTempFlashcards(JSON.parse(saved));
      } catch { }
    }
    setIsLoading(false);
  }, []);

  const loadDeck = async (deckId: string) => {
    if (!user) return;
    try {
      const deck = await flashcardService.getDeckWithCards(deckId, user.id);
      const formattedCards = (deck.flashcards || []).map((card: any) => ({
        ...card,
        topic: deck.title,
      }));
      setStudyingDeck({ ...deck, flashcards: formattedCards });
      setFlashcards(formattedCards);
      setStudyingTemp(false);
    } catch (error) {
      console.error('Error loading flashcard deck:', error);
      toast.error('Failed to load flashcard deck');
    }
  };

  const studyTempDeck = () => {
    setFlashcards(tempFlashcards);
    setStudyingTemp(true);
    setStudyingDeck(null);
  };

  const deleteDeck = async (deckId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) return;
    if (!confirm('Delete this deck? This cannot be undone.')) return;
    try {
      await flashcardService.deleteDeck(deckId, user.id);
      setSavedDecks(prev => prev.filter(deck => deck.id !== deckId));
      toast.success('Deck deleted');
      if (studyingDeck?.id === deckId) {
        setStudyingDeck(null);
        setFlashcards([]);
      }
    } catch (error) {
      toast.error('Failed to delete deck');
    }
  };

  const handleSave = (updatedCards: Flashcard[]) => {
    setFlashcards(updatedCards);
    if (studyingDeck) {
      setStudyingDeck(prev => ({ ...prev!, flashcards: updatedCards }));
    }
  };

  const BackgroundOrbs = () => (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-sky-200/20 dark:bg-sky-500/[0.06] rounded-full blur-[140px]" />
      <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-[#ebf6b5]/30 dark:bg-emerald-500/[0.04] rounded-full blur-[120px]" />
      <div className="absolute top-1/3 right-0 w-[300px] h-[300px] bg-[#ebf6b5]/20 dark:bg-emerald-500/[0.04] rounded-full blur-[100px]" />
    </div>
  );

  // ── Loading ──
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#fffaf4] dark:bg-gray-950 relative">
        <BackgroundOrbs />
        <div className="relative z-10 w-full mx-auto px-4 sm:px-6 md:px-12 lg:px-16 pt-28 pb-16">
          <h1 className="text-4xl sm:text-5xl font-bold text-sky-500 dark:text-sky-400 tracking-tight mb-6">
            Flashcards
          </h1>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-[#f5f9fc] dark:bg-gray-900 rounded-2xl border border-sky-100 dark:border-gray-800 p-6">
                <div className="h-5 w-32 bg-sky-100 rounded-lg mb-3 animate-pulse" />
                <div className="h-4 w-24 bg-sky-50 rounded-lg mb-4 animate-pulse" />
                <div className="h-8 w-20 bg-sky-50 rounded-lg animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ── Studying a deck ──
  if (flashcards.length > 0 && (studyingDeck || studyingTemp)) {
    return (
      <div className="min-h-screen bg-[#fffaf4] dark:bg-gray-950 relative">
        <BackgroundOrbs />
        <div className="relative z-10 w-full mx-auto px-4 sm:px-6 md:px-12 lg:px-16 pt-28 pb-16">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-4xl sm:text-5xl font-bold text-sky-500 dark:text-sky-400 tracking-tight mb-2">
                  {studyingDeck ? studyingDeck.title : 'Temporarily Saved'}
                </h1>
                {studyingDeck?.description && (
                  <p className="text-sky-600/50 dark:text-sky-400/50 text-sm font-medium">
                    {studyingDeck.description}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => { setStudyingDeck(null); setStudyingTemp(false); setFlashcards([]); }}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-sky-600 dark:text-sky-400 hover:bg-sky-500/5 rounded-xl transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" />
                  All Decks
                </button>
                <button
                  onClick={openFlashcardAssistant}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-sky-700 bg-[#ebf6b5] hover:bg-[#e0efa0] border border-[#d4e88e] rounded-xl transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  New
                </button>
              </div>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
            <FlashcardDeck cards={flashcards} onSave={handleSave} />
          </motion.div>
        </div>

        <RouteIntroPopup
          isOpen={showIntro}
          onClose={dismissIntro}
          title="Welcome to Flashcards!"
          description="Master any subject with interactive flashcards powered by AI"
          icon={<BookOpen className="h-6 w-6" />}
          features={[
            'Create flashcard decks using the AI Aurora',
            'Flip cards to reveal answers and test your knowledge',
            'Save decks to review anytime',
            'Track your progress as you study',
          ]}
        />
      </div>
    );
  }

  // ── Default: All Decks view ──
  const hasTempCards = tempFlashcards.length > 0;
  const hasSavedDecks = savedDecks.length > 0;
  const isEmpty = !hasTempCards && !hasSavedDecks;

  return (
    <div className="min-h-screen bg-[#fffaf4] dark:bg-gray-950 relative">
      <BackgroundOrbs />
      <div className="relative z-10 w-full mx-auto px-4 sm:px-6 md:px-12 lg:px-16 pt-28 pb-16">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-4xl sm:text-5xl font-bold text-sky-500 dark:text-sky-400 tracking-tight mb-2">
                Flashcards
              </h1>
              <p className="text-sky-600/50 dark:text-sky-400/50 text-sm font-medium">
                {savedDecks.length} saved deck{savedDecks.length !== 1 ? 's' : ''}
              </p>
            </div>
            <button
              onClick={openFlashcardAssistant}
              className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-sky-700 bg-[#ebf6b5] hover:bg-[#e0efa0] border border-[#d4e88e] rounded-xl transition-colors"
            >
              <Sparkle className="h-4 w-4" />
              Create with Aurora
            </button>
          </div>
        </motion.div>

        {/* Empty state */}
        {isEmpty && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="flex flex-col items-center justify-center py-24"
          >
            <div className="w-20 h-20 bg-[#f5f9fc] dark:bg-gray-800 rounded-3xl border border-sky-100 dark:border-gray-700 flex items-center justify-center mb-6">
              <BookOpen className="h-9 w-9 text-sky-500/30 dark:text-sky-400/30" />
            </div>
            <h3 className="text-xl font-bold text-sky-900 dark:text-white mb-2">
              No Flashcards Yet
            </h3>
            <p className="text-sm text-sky-600/50 dark:text-sky-400/50 mb-8 max-w-sm text-center">
              Generate flashcards with Aurora AI to start studying
            </p>
            <button
              onClick={openFlashcardAssistant}
              className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-sky-700 bg-[#ebf6b5] hover:bg-[#e0efa0] border border-[#d4e88e] rounded-xl transition-colors"
            >
              <Sparkle className="h-4 w-4" />
              Open Aurora
            </button>
          </motion.div>
        )}

        {/* Temporarily Saved section */}
        {hasTempCards && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="mb-10"
          >
            <div className="flex items-center gap-2 mb-4">
              <h2 className="text-sm font-bold text-sky-500 dark:text-sky-400 uppercase tracking-widest">
                Temporarily Saved
              </h2>
              <div className="flex items-center gap-1 px-2 py-0.5 bg-amber-100 dark:bg-amber-500/20 rounded-full">
                <AlertTriangle className="w-2.5 h-2.5 text-amber-600 dark:text-amber-400" />
                <span className="text-[9px] font-bold text-amber-600 dark:text-amber-400 uppercase">Clears on logout</span>
              </div>
            </div>
            <div
              onClick={studyTempDeck}
              className="group cursor-pointer bg-[#ebf6b5]/40 dark:bg-gray-900 rounded-2xl border border-[#d4e88e]/60 dark:border-gray-800 p-5 hover:shadow-lg hover:border-[#d4e88e] dark:hover:border-gray-700 transition-all max-w-sm"
            >
              <div className="flex items-start gap-3 mb-3">
                <div className="w-9 h-9 bg-[#ebf6b5] dark:bg-emerald-500/10 rounded-xl flex items-center justify-center border border-[#d4e88e]/50">
                  <Layers className="h-4 w-4 text-sky-700 dark:text-emerald-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-bold text-sky-900 dark:text-white truncate">
                    {tempFlashcards[0]?.topic || 'Recent Session'}
                  </h3>
                  <p className="text-xs text-sky-600/50 dark:text-sky-400/50">
                    {tempFlashcards.length} card{tempFlashcards.length !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Saved Decks */}
        {hasSavedDecks && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: hasTempCards ? 0.1 : 0.05 }}
          >
            <h2 className="text-sm font-bold text-sky-500 dark:text-sky-400 uppercase tracking-widest mb-4">
              Your Decks
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {savedDecks.map((deck, index) => (
                <motion.div
                  key={deck.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 + index * 0.03 }}
                  onClick={() => loadDeck(deck.id)}
                  className="group cursor-pointer bg-[#f5f9fc] dark:bg-gray-900 rounded-2xl border border-sky-100 dark:border-gray-800 p-5 hover:shadow-lg hover:border-sky-200 dark:hover:border-gray-700 transition-all"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-9 h-9 bg-sky-100 dark:bg-sky-500/10 rounded-xl flex items-center justify-center">
                      <Layers className="h-4 w-4 text-sky-500 dark:text-sky-400" />
                    </div>
                    <button
                      onClick={(e) => deleteDeck(deck.id, e)}
                      className="p-1.5 rounded-lg text-red-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <h3 className="text-base font-bold text-sky-900 dark:text-white mb-1 truncate group-hover:text-sky-600 dark:group-hover:text-sky-300 transition-colors">
                    {deck.title}
                  </h3>
                  {deck.description && (
                    <p className="text-xs text-sky-600/50 dark:text-sky-400/50 mb-3 line-clamp-2">
                      {deck.description}
                    </p>
                  )}
                  <p className="text-[10px] font-medium text-sky-500/30 dark:text-sky-400/30 uppercase tracking-wider">
                    {deck.created_at ? new Date(deck.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </div>

      <RouteIntroPopup
        isOpen={showIntro}
        onClose={dismissIntro}
        title="Welcome to Flashcards!"
        description="Master any subject with interactive flashcards powered by AI"
        icon={<BookOpen className="h-6 w-6" />}
        features={[
          'Create flashcard decks using the AI Aurora',
          'Flip cards to reveal answers and test your knowledge',
          'Save decks to review anytime',
          'Track your progress as you study',
        ]}
      />
    </div>
  );
}
