'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Plus, Trash2, BookOpen, Sparkle, Layers, AlertTriangle, Search, X, ChevronDown, PenLine, FileUp, HelpCircle } from 'lucide-react';
import { FlashcardDeck, Flashcard } from '@/components/Flashcard';
import { useAuth } from '@/context/AuthContext';
import { useRequireAuth } from '@/hooks/use-require-auth';
import { flashcardService } from '@/lib/supabase/flashcards';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouteIntro } from '@/hooks/use-route-intro';
import { RouteIntroPopup } from '@/components/RouteIntroPopup';
import { useAI } from '@/context/AIContext';
import { useUpgrade } from '@/context/UpgradeContext';
import Link from 'next/link';
import { getPlanTier, TIER_LIMITS, getTierLabel } from '@/lib/planTier';

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
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; title: string } | null>(null);

  const { showIntro, dismissIntro } = useRouteIntro('flashcards');
  const { setAIAssistantOpen, setAIInput } = useAI();
  const { promptUpgrade } = useUpgrade();

  // ── Search state ──
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const [searchExpanded, setSearchExpanded] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // ── Create dropdown & manual create state ──
  const [createDropdownOpen, setCreateDropdownOpen] = useState(false);
  const createDropdownRef = useRef<HTMLDivElement>(null);
  const csvInputRef = useRef<HTMLInputElement>(null);
  const [manualCreateOpen, setManualCreateOpen] = useState(false);
  const [manualDeckTitle, setManualDeckTitle] = useState('');
  const [manualCards, setManualCards] = useState<{ question: string; answer: string }[]>([
    { question: '', answer: '' },
  ]);
  const [savingManual, setSavingManual] = useState(false);

  const filteredDecks = useMemo(() => {
    if (!searchQuery) return savedDecks;
    const q = searchQuery.toLowerCase();
    return savedDecks.filter(d =>
      d.title.toLowerCase().includes(q) ||
      d.description?.toLowerCase().includes(q)
    );
  }, [savedDecks, searchQuery]);

  const openFlashcardAssistant = () => {
    setCreateDropdownOpen(false);
    setAIInput('@flashcard ');
    setAIAssistantOpen(true);
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (createDropdownRef.current && !createDropdownRef.current.contains(e.target as Node)) {
        setCreateDropdownOpen(false);
      }
    };
    if (createDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [createDropdownOpen]);

  // Manual deck helpers
  const addManualCard = () => {
    setManualCards(prev => [...prev, { question: '', answer: '' }]);
  };

  const removeManualCard = (index: number) => {
    setManualCards(prev => prev.filter((_, i) => i !== index));
  };

  const updateManualCard = (index: number, field: 'question' | 'answer', value: string) => {
    setManualCards(prev => prev.map((card, i) => (i === index ? { ...card, [field]: value } : card)));
  };

  const saveManualDeck = async () => {
    if (!user) return;
    const title = manualDeckTitle.trim();
    if (!title) { toast.error('Please enter a deck title'); return; }
    const validCards = manualCards.filter(c => c.question.trim() && c.answer.trim());
    if (validCards.length === 0) { toast.error('Add at least one card with a question and answer'); return; }

    // ─── Plan tier limit check ─────────────────────────────────────────
    const tier = getPlanTier();
    const limits = TIER_LIMITS[tier];
    if (limits.flashcardStorage !== Infinity) {
      try {
        const currentCount = await flashcardService.getTotalCardCount(user.id);
        if (currentCount + validCards.length > limits.flashcardStorage) {
          const remaining = Math.max(0, limits.flashcardStorage - currentCount);
          promptUpgrade({
            limitMessage: remaining === 0
              ? `The free plan includes up to ${limits.flashcardStorage} flashcards — upgrade to Pro for unlimited.`
              : `You have ${remaining} card${remaining !== 1 ? 's' : ''} left on the free plan (${currentCount}/${limits.flashcardStorage} used). Upgrade for unlimited.`
          });
          return;
        }
      } catch (err) {
        console.error('Error checking flashcard limit:', err);
      }
    }

    setSavingManual(true);
    try {
      await flashcardService.createDeck(user.id, { title, flashcards: validCards });
      const decks = await flashcardService.getDecks(user.id);
      setSavedDecks(decks);
      setManualCreateOpen(false);
      setManualDeckTitle('');
      setManualCards([{ question: '', answer: '' }]);
      toast.success('Deck created!');
    } catch (err) {
      console.error(err);
      toast.error('Failed to create deck');
    } finally {
      setSavingManual(false);
    }
  };

  // CSV import handler
  const handleCsvImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const text = event.target?.result as string;
      if (!text?.trim()) {
        toast.error('File is empty');
        return;
      }

      // Parse CSV — handle quoted fields, commas inside quotes, tabs, semicolons
      const parseCSVLine = (line: string): string[] => {
        const result: string[] = [];
        let current = '';
        let inQuotes = false;

        // Detect delimiter
        const delimiter = line.includes('\t') ? '\t' : line.includes(';') ? ';' : ',';

        for (let i = 0; i < line.length; i++) {
          const char = line[i];
          if (char === '"') {
            if (inQuotes && line[i + 1] === '"') {
              current += '"';
              i++; // skip escaped quote
            } else {
              inQuotes = !inQuotes;
            }
          } else if (char === delimiter && !inQuotes) {
            result.push(current.trim());
            current = '';
          } else {
            current += char;
          }
        }
        result.push(current.trim());
        return result;
      };

      const lines = text.split(/\r?\n/).filter(l => l.trim());
      if (lines.length === 0) {
        toast.error('No data found in file');
        return;
      }

      // Check if first line is a header
      const firstLine = parseCSVLine(lines[0]);
      const isHeader = firstLine.length >= 2 &&
        firstLine.slice(0, 2).every(cell =>
          /^(question|answer|front|back|term|definition|q|a|prompt|response)$/i.test(cell)
        );

      const dataLines = isHeader ? lines.slice(1) : lines;
      const cards: { question: string; answer: string }[] = [];

      for (const line of dataLines) {
        const cols = parseCSVLine(line);
        if (cols.length >= 2 && cols[0] && cols[1]) {
          cards.push({ question: cols[0], answer: cols[1] });
        }
      }

      if (cards.length === 0) {
        toast.error('No valid cards found. CSV needs at least 2 columns: Question, Answer');
        return;
      }

      // ─── Plan tier limit check ─────────────────────────────────────────
      const tier = getPlanTier();
      const limits = TIER_LIMITS[tier];
      if (limits.flashcardStorage !== Infinity && user) {
        try {
          const currentCount = await flashcardService.getTotalCardCount(user.id);
          if (currentCount + cards.length > limits.flashcardStorage) {
            const remaining = Math.max(0, limits.flashcardStorage - currentCount);
            promptUpgrade({
              limitMessage: remaining === 0
                ? `The free plan includes up to ${limits.flashcardStorage} flashcards — upgrade to Pro for unlimited.`
                : `You have ${remaining} card${remaining !== 1 ? 's' : ''} left on the free plan (${currentCount}/${limits.flashcardStorage} used). Upgrade for unlimited.`
            });
            return;
          }
        } catch (err) {
          console.error('Error checking flashcard limit:', err);
        }
      }

      // Pre-populate manual create modal with parsed cards
      const fileName = file.name.replace(/\.(csv|tsv|txt)$/i, '').replace(/[_-]/g, ' ');
      setManualDeckTitle(fileName.charAt(0).toUpperCase() + fileName.slice(1));
      setManualCards(cards);
      setManualCreateOpen(true);
      toast.success(`Imported ${cards.length} card${cards.length !== 1 ? 's' : ''} from CSV`);
    };

    reader.onerror = () => {
      toast.error('Failed to read file');
    };

    reader.readAsText(file);
    // Reset input so the same file can be re-imported
    e.target.value = '';
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

  const deleteDeck = (deckId: string, title: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeleteConfirm({ id: deckId, title });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirm || !user) return;
    try {
      await flashcardService.deleteDeck(deleteConfirm.id, user.id);
      setSavedDecks(prev => prev.filter(deck => deck.id !== deleteConfirm.id));
      toast.success('Deck deleted');
      if (studyingDeck?.id === deleteConfirm.id) {
        setStudyingDeck(null);
        setFlashcards([]);
      }
    } catch (error) {
      toast.error('Failed to delete deck');
    } finally {
      setDeleteConfirm(null);
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
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h1 className="text-4xl sm:text-5xl font-bold text-sky-500 dark:text-sky-400 tracking-tight mb-2">
                Flashcards
              </h1>
              <p className="text-sky-600/50 dark:text-sky-400/50 text-sm font-medium">
                {savedDecks.length} saved deck{savedDecks.length !== 1 ? 's' : ''}
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              {/* Expanding Search — icon left, bar slides right */}
              <motion.div
                initial={false}
                animate={{ width: searchExpanded ? 280 : 40 }}
                transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                className={`relative h-10 flex items-center rounded-full overflow-hidden bg-[#f5f9fc] dark:bg-zinc-800 border border-sky-200/60 dark:border-sky-800/30 ${!searchExpanded ? 'cursor-pointer hover:bg-sky-100 dark:hover:bg-zinc-700 hover:border-sky-300 dark:hover:border-sky-700' : ''
                  } ${searchFocused ? 'ring-2 ring-sky-400/30 shadow-lg shadow-sky-500/5' : ''}`}
                style={{ originX: 1 }}
                onClick={() => {
                  if (!searchExpanded) {
                    setSearchExpanded(true);
                    setTimeout(() => searchInputRef.current?.focus(), 80);
                  }
                }}
              >
                {/* Search icon — pinned left, slides with the edge */}
                <div className="w-10 h-10 flex items-center justify-center shrink-0">
                  <Search className="w-4 h-4 text-sky-500 dark:text-sky-400" />
                </div>

                {/* Input area — right of icon */}
                <div className={`flex items-center flex-1 min-w-0 overflow-hidden transition-opacity duration-200 ${searchExpanded ? 'opacity-100 pr-4' : 'opacity-0 w-0 pr-0'}`}>
                  <input
                    ref={searchInputRef}
                    type="text"
                    placeholder="Search decks..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => setSearchFocused(true)}
                    onBlur={() => {
                      setSearchFocused(false);
                      if (!searchQuery) {
                        setSearchExpanded(false);
                      }
                    }}
                    className="flex-1 bg-transparent text-[14px] text-sky-900 dark:text-sky-100 placeholder:text-sky-600/40 dark:placeholder:text-sky-400/40 outline-none w-full min-w-0"
                  />
                  {searchQuery && (
                    <button
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSearchQuery('');
                        searchInputRef.current?.focus();
                      }}
                      className="p-0.5 ml-1 rounded-full text-sky-400 hover:text-sky-600 dark:hover:text-sky-300 transition-colors shrink-0"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </motion.div>

              {/* Create dropdown */}
              <div ref={createDropdownRef} className="relative">
                <button
                  onClick={() => setCreateDropdownOpen(prev => !prev)}
                  className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-sky-700 bg-[#ebf6b5] hover:bg-[#e0efa0] border border-[#d4e88e] rounded-xl transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  Create
                  <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-200 ${createDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                  {createDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 6, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 6, scale: 0.96 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-gray-900 border border-sky-100 dark:border-gray-800 rounded-2xl shadow-2xl shadow-sky-500/5 overflow-hidden z-50 p-1.5"
                    >
                      <button
                        onClick={openFlashcardAssistant}
                        className="w-full flex items-center gap-3 px-3.5 py-2.5 text-sm text-sky-900 dark:text-white hover:bg-sky-50 dark:hover:bg-gray-800 rounded-xl transition-colors text-left"
                      >
                        <Sparkle className="h-4 w-4 text-sky-500 dark:text-sky-400 shrink-0" />
                        <div>
                          <div className="font-semibold text-[13px]">Smart Create</div>
                          <div className="text-[11px] text-sky-500/50 dark:text-sky-400/40">AI-powered with Aurora</div>
                        </div>
                      </button>
                      <div className="mx-2 my-0.5 border-t border-sky-100/60 dark:border-gray-800" />
                      <button
                        onClick={() => { setCreateDropdownOpen(false); setManualCreateOpen(true); }}
                        className="w-full flex items-center gap-3 px-3.5 py-2.5 text-sm text-sky-900 dark:text-white hover:bg-sky-50 dark:hover:bg-gray-800 rounded-xl transition-colors text-left"
                      >
                        <PenLine className="h-4 w-4 text-sky-500 dark:text-sky-400 shrink-0" />
                        <div>
                          <div className="font-semibold text-[13px]">Manual Create</div>
                          <div className="text-[11px] text-sky-500/50 dark:text-sky-400/40">Write your own cards</div>
                        </div>
                      </button>
                      <div className="mx-2 my-0.5 border-t border-sky-100/60 dark:border-gray-800" />
                      <button
                        onClick={() => { setCreateDropdownOpen(false); csvInputRef.current?.click(); }}
                        className="w-full flex items-center gap-3 px-3.5 py-2.5 text-sm text-sky-900 dark:text-white hover:bg-sky-50 dark:hover:bg-gray-800 rounded-xl transition-colors text-left"
                      >
                        <FileUp className="h-4 w-4 text-sky-500 dark:text-sky-400 shrink-0" />
                        <div className="flex-1">
                          <div className="font-semibold text-[13px]">Import CSV</div>
                          <div className="text-[11px] text-sky-500/50 dark:text-sky-400/40">Upload a spreadsheet</div>
                        </div>
                        <Link
                          href="/tutorials/csv-import"
                          target="_blank"
                          onClick={(e) => e.stopPropagation()}
                          className="p-1 rounded-lg text-sky-400 hover:text-sky-600 dark:hover:text-sky-300 hover:bg-sky-100 dark:hover:bg-gray-700 transition-colors shrink-0"
                          title="How to format your CSV"
                        >
                          <HelpCircle className="h-3.5 w-3.5" />
                        </Link>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
                <input
                  ref={csvInputRef}
                  type="file"
                  accept=".csv,.tsv,.txt"
                  className="hidden"
                  onChange={handleCsvImport}
                />
              </div>
            </div>
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
            <div className="flex items-center gap-3 mb-6">
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-sky-500 dark:text-sky-400 px-1">
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
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-sky-500 dark:text-sky-400 mb-6 px-1">
              Your Decks
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredDecks.map((deck, index) => (
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
                      onClick={(e) => deleteDeck(deck.id, deck.title, e)}
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

      {/* ── Manual Create Modal ── */}
      <AnimatePresence>
        {manualCreateOpen && (
          <div
            className="fixed inset-0 bg-[#fffaf4]/80 dark:bg-gray-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-[100] fixed-padding-adjust"
            onClick={() => setManualCreateOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 20 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-gray-900 rounded-[28px] shadow-2xl shadow-sky-500/5 w-full max-w-md relative border border-sky-100 dark:border-gray-800 max-h-[90vh] overflow-y-auto"
            >
              {/* Header */}
              <div className="sticky top-0 bg-white dark:bg-gray-900 flex items-center justify-between px-6 py-4 border-b border-sky-100 dark:border-gray-800 rounded-t-[28px] z-10">
                <h2 className="text-lg font-bold text-sky-900 dark:text-white">
                  Create Flashcard Deck
                </h2>
                <button
                  onClick={() => setManualCreateOpen(false)}
                  className="p-2 text-sky-400 hover:text-sky-900 dark:text-sky-500 dark:hover:text-white hover:bg-sky-50 rounded-full transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6 space-y-5">
                {/* Deck Title */}
                <div>
                  <label className="block text-[11px] font-semibold text-sky-600 dark:text-sky-400 uppercase tracking-wider mb-2">
                    Deck Title
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Biology Chapter 5"
                    value={manualDeckTitle}
                    onChange={(e) => setManualDeckTitle(e.target.value)}
                    className="w-full h-11 px-3 text-sm bg-white dark:bg-gray-900 border border-sky-200 dark:border-gray-700 rounded-xl text-sky-900 dark:text-white placeholder-sky-400 dark:placeholder-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                  />
                </div>

                {/* Cards */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-[11px] font-semibold text-sky-600 dark:text-sky-400 uppercase tracking-wider">
                      Cards
                    </label>
                    <span className="text-[11px] text-sky-500 dark:text-sky-400 font-medium">
                      {manualCards.length} card{manualCards.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                  <div className="space-y-3">
                    {manualCards.map((card, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-sky-50/40 dark:bg-gray-800 border border-sky-100/50 dark:border-gray-700 rounded-2xl p-4 relative group"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-[10px] font-bold text-sky-500/40 dark:text-sky-400/30 uppercase tracking-widest">Card {index + 1}</span>
                          {manualCards.length > 1 && (
                            <button
                              onClick={() => removeManualCard(index)}
                              className="p-1 rounded-lg text-red-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-all"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>
                        <div className="space-y-2.5">
                          <div>
                            <label className="block text-[11px] font-semibold text-sky-600 dark:text-sky-400 uppercase tracking-wider mb-1.5">
                              Question
                            </label>
                            <input
                              type="text"
                              placeholder="Enter a question..."
                              value={card.question}
                              onChange={(e) => updateManualCard(index, 'question', e.target.value)}
                              className="w-full h-11 px-3 text-sm bg-white dark:bg-gray-900 border border-sky-200 dark:border-gray-700 rounded-xl text-sky-900 dark:text-white placeholder-sky-400 dark:placeholder-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] font-semibold text-sky-600 dark:text-sky-400 uppercase tracking-wider mb-1.5">
                              Answer
                            </label>
                            <textarea
                              placeholder="Enter the answer..."
                              value={card.answer}
                              onChange={(e) => updateManualCard(index, 'answer', e.target.value)}
                              rows={2}
                              className="w-full px-3 py-2.5 text-sm bg-white dark:bg-gray-900 border border-sky-200 dark:border-gray-700 rounded-xl text-sky-900 dark:text-white placeholder-sky-400 dark:placeholder-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 resize-none"
                            />
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                  <button
                    onClick={addManualCard}
                    className="mt-3 flex items-center gap-2 h-10 px-4 text-[13px] font-semibold text-sky-600 dark:text-sky-400 hover:text-sky-900 dark:hover:text-white hover:bg-sky-50 dark:hover:bg-gray-800 border border-dashed border-sky-200 dark:border-gray-700 rounded-full transition-colors w-full justify-center"
                  >
                    <Plus className="h-4 w-4" />
                    Add Card
                  </button>
                </div>
              </div>

              {/* Footer */}
              <div className="sticky bottom-0 bg-white dark:bg-gray-900 flex items-center justify-end gap-2.5 px-6 py-4 border-t border-sky-100 dark:border-gray-800 rounded-b-[28px]">
                <button
                  onClick={() => setManualCreateOpen(false)}
                  className="h-10 px-5 text-[13px] font-semibold text-sky-600 dark:text-sky-400 hover:text-sky-900 dark:hover:text-white hover:bg-sky-50 dark:hover:bg-gray-800 border border-sky-200 dark:border-gray-700 rounded-full transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={saveManualDeck}
                  disabled={savingManual || !manualDeckTitle.trim()}
                  className="h-10 px-6 text-[13px] font-semibold text-sky-700 dark:text-sky-300 bg-[#ebf6b5]/60 dark:bg-[#ebf6b5]/10 hover:bg-[#ebf6b5] border border-[#d4e88e]/50 dark:border-[#d4e88e]/20 rounded-full disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                >
                  {savingManual ? (
                    <><div className="w-4 h-4 border-2 border-sky-700/30 border-t-sky-700 rounded-full animate-spin" /> Saving...</>
                  ) : (
                    'Save Deck'
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Deck Confirmation */}
      <AnimatePresence>
        {deleteConfirm && (
          <div className="fixed inset-0 bg-[#fffaf4]/80 dark:bg-gray-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-[100] fixed-padding-adjust">
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 10 }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-[28px] p-7 max-w-md w-full border border-sky-100 dark:border-gray-800 shadow-2xl shadow-sky-500/5"
            >
              <h3 className="text-lg font-bold text-sky-900 dark:text-white mb-2">
                Delete Deck
              </h3>
              <p className="text-sm text-sky-600/50 dark:text-sky-400/50 mb-6">
                Are you sure you want to delete &quot;<span className="font-semibold text-sky-800 dark:text-sky-200">{deleteConfirm.title}</span>&quot;? This action cannot be undone.
              </p>

              <div className="flex items-center justify-end gap-2.5">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="h-10 px-5 text-[13px] font-semibold text-sky-600 dark:text-sky-400 hover:text-sky-900 dark:hover:text-white hover:bg-sky-50 dark:hover:bg-gray-800 border border-sky-200 dark:border-gray-700 rounded-full transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  className="h-10 px-6 text-[13px] font-semibold text-white bg-red-500 hover:bg-red-600 border border-red-500 hover:border-red-600 rounded-full transition-colors"
                >
                  Delete Deck
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
