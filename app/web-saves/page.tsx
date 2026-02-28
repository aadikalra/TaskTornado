'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, X, ExternalLink, Loader2, ImageIcon, AlertTriangle, Bookmark, Trash2, Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWebSaves } from '@/context/WebSavesContext';
import { useAuth } from '@/context/AuthContext';
import { useRequireAuth } from '@/hooks/use-require-auth';
import { Input } from '@/components/ui/input';
import { useRouteIntro } from '@/hooks/use-route-intro';
import { RouteIntroPopup } from '@/components/RouteIntroPopup';
import { POPULAR_SITES } from '@/data/popular-sites';


// Favicon preview component
const SitePreview = ({ url, title }: { url: string; title?: string | null }) => {
  const [faviconUrl, setFaviconUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    try {
      setLoading(true);
      setError(false);
      const domain = new URL(url).hostname;
      setFaviconUrl(`https://www.google.com/s2/favicons?domain=${domain}&sz=32`);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [url]);

  if (loading) {
    return (
      <div className="w-9 h-9 bg-sky-100 dark:bg-sky-500/10 rounded-xl flex items-center justify-center">
        <Loader2 className="h-3.5 w-3.5 animate-spin text-sky-500/40" />
      </div>
    );
  }

  if (error || !faviconUrl) {
    return (
      <div className="w-9 h-9 bg-sky-100 dark:bg-sky-500/10 rounded-xl flex items-center justify-center">
        <ImageIcon className="h-3.5 w-3.5 text-sky-500/40" />
      </div>
    );
  }

  return (
    <div className="w-9 h-9 bg-sky-100 dark:bg-sky-500/10 rounded-xl flex items-center justify-center overflow-hidden">
      <img
        src={faviconUrl}
        alt={`${title || new URL(url).hostname} favicon`}
        className="w-5 h-5 object-contain"
        onError={() => setError(true)}
      />
    </div>
  );
};

const BackgroundOrbs = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-sky-200/20 dark:bg-sky-500/[0.06] rounded-full blur-[140px]" />
    <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-[#ebf6b5]/30 dark:bg-emerald-500/[0.04] rounded-full blur-[120px]" />
    <div className="absolute top-1/3 right-0 w-[300px] h-[300px] bg-[#ebf6b5]/20 dark:bg-emerald-500/[0.04] rounded-full blur-[100px]" />
  </div>
);

export default function WebSavesPage() {
  const { authenticated } = useRequireAuth();
  if (!authenticated) return null;
  const { user } = useAuth();
  const router = useRouter();
  const { saves, loading, error, addSave, deleteSave } = useWebSaves();
  const { showIntro, dismissIntro } = useRouteIntro('web-saves');

  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showModal, setShowModal] = useState(false);

  // ── Autocomplete state ──
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const urlInputRef = useRef<HTMLInputElement>(null);

  // Filter suggestions based on user input
  const getFilteredSuggestions = useCallback((input: string) => {
    if (!input || input.length < 2) return [];
    const query = input.toLowerCase()
      .replace(/^https?:\/\//, '')
      .replace(/^www\./, '');
    return POPULAR_SITES.filter(site => {
      const domain = site.url.replace(/^https?:\/\//, '').replace(/^www\./, '');
      return site.name.toLowerCase().includes(query) || domain.includes(query);
    }).slice(0, 6);
  }, []);

  const filteredSuggestions = getFilteredSuggestions(url);

  // Handle selecting a suggestion
  const selectSuggestion = useCallback((site: typeof POPULAR_SITES[0]) => {
    setUrl(site.url);
    if (!title) setTitle(site.name);
    setShowSuggestions(false);
    setSelectedSuggestionIndex(-1);
  }, [title]);

  // Keyboard navigation for suggestions
  const handleUrlKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions || filteredSuggestions.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedSuggestionIndex(prev =>
        prev < filteredSuggestions.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedSuggestionIndex(prev =>
        prev > 0 ? prev - 1 : filteredSuggestions.length - 1
      );
    } else if (e.key === 'Enter' && selectedSuggestionIndex >= 0) {
      e.preventDefault();
      selectSuggestion(filteredSuggestions[selectedSuggestionIndex]);
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
      setSelectedSuggestionIndex(-1);
    }
  }, [showSuggestions, filteredSuggestions, selectedSuggestionIndex, selectSuggestion]);

  // Close suggestions on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(e.target as Node) &&
        urlInputRef.current &&
        !urlInputRef.current.contains(e.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;

    setIsSubmitting(true);
    try {
      await addSave(url, title || undefined);
      setUrl('');
      setTitle('');
      setShowModal(false);
      setShowSuggestions(false);
    } catch (err) {
      console.error('Error saving link:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const openModal = () => setShowModal(true);
  const closeModal = () => {
    setShowModal(false);
    setUrl('');
    setTitle('');
    setShowSuggestions(false);
    setSelectedSuggestionIndex(-1);
  };

  // ── Loading ──
  if (loading) {
    return (
      <div className="min-h-screen bg-[#fffaf4] dark:bg-gray-950 relative">
        <BackgroundOrbs />
        <div className="relative z-10 w-full mx-auto px-4 sm:px-6 md:px-12 lg:px-16 pt-28 pb-16">
          <h1 className="text-4xl sm:text-5xl font-bold text-sky-500 dark:text-sky-400 tracking-tight mb-2">
            Web Saves
          </h1>
          <p className="text-sky-600/50 dark:text-sky-400/50 text-sm font-medium mb-8">
            Save and organize important links
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-[#f5f9fc] dark:bg-gray-900 rounded-2xl border border-sky-100 dark:border-gray-800 p-5">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 bg-sky-100 rounded-xl animate-pulse" />
                  <div className="flex-1">
                    <div className="h-4 w-32 bg-sky-100 rounded-lg mb-2 animate-pulse" />
                    <div className="h-3 w-48 bg-sky-50 rounded-lg animate-pulse" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ── Error ──
  if (error) {
    return (
      <div className="min-h-screen bg-[#fffaf4] dark:bg-gray-950 relative">
        <BackgroundOrbs />
        <div className="relative z-10 w-full mx-auto px-4 sm:px-6 md:px-12 lg:px-16 pt-28 pb-16">
          <h1 className="text-4xl sm:text-5xl font-bold text-sky-500 dark:text-sky-400 tracking-tight mb-2">
            Web Saves
          </h1>
          <p className="text-sky-600/50 dark:text-sky-400/50 text-sm font-medium mb-8">
            Save and organize important links
          </p>
          <div className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-2xl">
            <AlertTriangle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-red-800 dark:text-red-300">Error loading saves</p>
              <p className="text-xs text-red-600 dark:text-red-400 mt-1">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fffaf4] dark:bg-gray-950 relative">
      <BackgroundOrbs />
      <div className="relative z-10 w-full mx-auto px-4 sm:px-6 md:px-12 lg:px-16 pt-28 pb-16">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-4xl sm:text-5xl font-bold text-sky-500 dark:text-sky-400 tracking-tight mb-2">
                Web Saves
              </h1>
              <p className="text-sky-600/50 dark:text-sky-400/50 text-sm font-medium">
                {saves.length} saved link{saves.length !== 1 ? 's' : ''}
              </p>
            </div>
            <button
              onClick={openModal}
              className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-sky-700 bg-[#ebf6b5] hover:bg-[#e0efa0] border border-[#d4e88e] rounded-xl transition-colors"
            >
              <Plus className="h-4 w-4" />
              Add Link
            </button>
          </div>
        </motion.div>

        {/* Empty state */}
        {saves.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="flex flex-col items-center justify-center py-24"
          >
            <div className="w-20 h-20 bg-[#f5f9fc] dark:bg-gray-800 rounded-3xl border border-sky-100 dark:border-gray-700 flex items-center justify-center mb-6">
              <Bookmark className="h-9 w-9 text-sky-500/30 dark:text-sky-400/30" />
            </div>
            <h3 className="text-xl font-bold text-sky-900 dark:text-white mb-2">
              No Saved Links Yet
            </h3>
            <p className="text-sm text-sky-600/50 dark:text-sky-400/50 mb-8 max-w-sm text-center">
              Save important links for quick access and study resources
            </p>
            <button
              onClick={openModal}
              className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-sky-700 bg-[#ebf6b5] hover:bg-[#e0efa0] border border-[#d4e88e] rounded-xl transition-colors"
            >
              <Plus className="h-4 w-4" />
              Add Your First Link
            </button>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
          >
            <div className="space-y-0">
              {saves.map((save, index) => {
                let hostname = '';
                try { hostname = new URL(save.url).hostname; } catch { hostname = save.url; }
                return (
                  <motion.div
                    key={save.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 + index * 0.03 }}
                    className="group border-b border-sky-100 dark:border-gray-800 py-5 first:pt-0 last:border-0"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4 flex-1 min-w-0">
                        <SitePreview url={save.url} title={save.title} />
                        <div className="flex-1 min-w-0">
                          <a
                            href={save.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block group/link"
                          >
                            <h3 className="text-base font-semibold text-sky-900 dark:text-white mb-1 truncate group-hover/link:text-sky-600 dark:group-hover/link:text-sky-300 transition-colors">
                              {save.title || hostname}
                            </h3>
                          </a>
                          <p className="text-sm text-sky-800/50 dark:text-sky-300/50 truncate mb-2">
                            {save.url}
                          </p>
                          <div className="flex items-center gap-3">
                            <span className="inline-flex items-center px-2 py-0.5 bg-[#ebf6b5]/50 dark:bg-emerald-500/10 border border-[#d4e88e]/40 rounded-full text-[11px] font-semibold text-sky-700 dark:text-sky-400">
                              {hostname}
                            </span>
                            <span className="text-[11px] text-sky-600/50 dark:text-sky-400/50">
                              Saved {save.created_at ? new Date(save.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : ''}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 ml-3">
                        <a
                          href={save.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-500/10 hover:bg-sky-100 dark:hover:bg-sky-500/20 rounded-lg transition-colors"
                          aria-label="Open link"
                        >
                          <ExternalLink className="h-3 w-3" />
                          Open
                        </a>
                        <button
                          onClick={() => deleteSave(save.id)}
                          className="p-1.5 rounded-lg text-red-400/60 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors opacity-0 group-hover:opacity-100"
                          aria-label="Delete link"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Add Link Modal */}
        <AnimatePresence>
          {showModal && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-[#fffaf4]/80 dark:bg-gray-950/80 backdrop-blur-sm z-50"
                onClick={closeModal}
              />
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <motion.div
                  initial={{ opacity: 0, scale: 0.96, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.96, y: 20 }}
                  transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                  className="bg-white dark:bg-gray-900 rounded-[28px] shadow-2xl shadow-sky-500/5 w-full max-w-md relative border border-sky-100 dark:border-gray-800 max-h-[90vh] overflow-y-auto"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Header */}
                  <div className="sticky top-0 bg-white dark:bg-gray-900 flex items-center justify-between px-6 py-4 border-b border-sky-100 dark:border-gray-800 rounded-t-[28px] z-10">
                    <h2 className="text-lg font-bold text-sky-900 dark:text-white">
                      Add New Link
                    </h2>
                    <button
                      onClick={closeModal}
                      className="p-2 text-sky-400 hover:text-sky-900 dark:text-sky-500 dark:hover:text-white hover:bg-sky-50 rounded-full transition-colors"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>

                  {/* Content */}
                  <div className="p-6 space-y-5">
                    <form onSubmit={handleSubmit} className="space-y-5">
                      <div className="relative">
                        <label htmlFor="url" className="block text-[11px] font-semibold text-sky-600 dark:text-sky-400 uppercase tracking-wider mb-2">
                          URL
                        </label>
                        <Input
                          ref={urlInputRef}
                          id="url"
                          type="text"
                          placeholder="https://example.com"
                          value={url}
                          onChange={(e) => {
                            setUrl(e.target.value);
                            setShowSuggestions(true);
                            setSelectedSuggestionIndex(-1);
                          }}
                          onFocus={() => {
                            if (url.length >= 2) setShowSuggestions(true);
                          }}
                          onKeyDown={handleUrlKeyDown}
                          required
                          disabled={isSubmitting}
                          className="w-full h-11 bg-white dark:bg-gray-900 border-sky-200 dark:border-gray-700 text-sky-900 dark:text-white placeholder-sky-400 dark:placeholder-sky-500 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                          autoComplete="off"
                          autoFocus
                        />

                        {/* Autocomplete dropdown */}
                        <AnimatePresence>
                          {showSuggestions && filteredSuggestions.length > 0 && (
                            <motion.div
                              ref={suggestionsRef}
                              initial={{ opacity: 0, y: -4 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -4 }}
                              transition={{ duration: 0.15 }}
                              className="absolute left-0 right-0 top-[calc(100%+6px)] z-[60] bg-white dark:bg-gray-800 border border-sky-100 dark:border-gray-700 rounded-xl shadow-xl overflow-hidden"
                            >
                              {filteredSuggestions.map((site, index) => {
                                const domain = site.url.replace(/^https?:\/\//, '');
                                return (
                                  <button
                                    key={site.url}
                                    type="button"
                                    onClick={() => selectSuggestion(site)}
                                    onMouseEnter={() => setSelectedSuggestionIndex(index)}
                                    className={`w-full flex items-center gap-3 px-3.5 py-2.5 text-left transition-colors ${index === selectedSuggestionIndex
                                      ? 'bg-sky-50 dark:bg-sky-500/10'
                                      : 'hover:bg-sky-50/60 dark:hover:bg-sky-500/5'
                                      }`}
                                  >
                                    <div className="w-7 h-7 bg-sky-100 dark:bg-sky-500/10 rounded-lg flex items-center justify-center shrink-0 overflow-hidden">
                                      <img
                                        src={`https://www.google.com/s2/favicons?domain=${domain}&sz=32`}
                                        alt=""
                                        className="w-4 h-4 object-contain"
                                        onError={(e) => {
                                          (e.target as HTMLImageElement).style.display = 'none';
                                          (e.target as HTMLImageElement).parentElement!.innerHTML = '<svg class="w-3.5 h-3.5 text-sky-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>';
                                        }}
                                      />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <p className="text-sm font-semibold text-sky-900 dark:text-white truncate">
                                        {site.name}
                                      </p>
                                      <p className="text-xs text-sky-500/50 dark:text-sky-400/50 truncate">
                                        {domain}
                                      </p>
                                    </div>
                                    <span className="text-[10px] font-medium text-sky-400/40 dark:text-sky-500/40 shrink-0 uppercase tracking-wider">
                                      ↵
                                    </span>
                                  </button>
                                );
                              })}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>

                      <div>
                        <label htmlFor="title" className="block text-[11px] font-semibold text-sky-600 dark:text-sky-400 uppercase tracking-wider mb-2">
                          Title <span className="text-sky-400 font-normal normal-case tracking-normal">(Optional)</span>
                        </label>
                        <Input
                          id="title"
                          type="text"
                          placeholder="Add a custom title"
                          value={title}
                          onChange={(e) => setTitle(e.target.value)}
                          disabled={isSubmitting}
                          className="w-full h-11 bg-white dark:bg-gray-900 border-sky-200 dark:border-gray-700 text-sky-900 dark:text-white placeholder-sky-400 dark:placeholder-sky-500 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                        />
                      </div>

                      {/* Footer */}
                      <div className="sticky bottom-0 bg-white dark:bg-gray-900 flex items-center justify-end gap-2.5 pt-4 mt-2">
                        <button
                          type="button"
                          onClick={closeModal}
                          disabled={isSubmitting}
                          className="h-10 px-5 text-[13px] font-semibold text-sky-600 dark:text-sky-400 hover:text-sky-900 dark:hover:text-white hover:bg-sky-50 dark:hover:bg-gray-800 border border-sky-200 dark:border-gray-700 rounded-full transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={isSubmitting || !url.trim()}
                          className="h-10 px-6 flex items-center justify-center gap-2 text-[13px] font-semibold text-sky-700 dark:text-sky-300 bg-[#ebf6b5]/60 dark:bg-[#ebf6b5]/10 hover:bg-[#ebf6b5] border border-[#d4e88e]/50 dark:border-[#d4e88e]/20 rounded-full disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                        >
                          {isSubmitting ? (
                            <>
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              Saving...
                            </>
                          ) : (
                            'Save Link'
                          )}
                        </button>
                      </div>
                    </form>
                  </div>
                </motion.div>
              </div>
            </>
          )}
        </AnimatePresence>
      </div>

      <RouteIntroPopup
        isOpen={showIntro}
        onClose={dismissIntro}
        title="Welcome to Web Saves!"
        description="Save and organize important links for quick access"
        icon={<Bookmark className="h-6 w-6" />}
        features={[
          'Save important links with custom titles',
          'Organize research and study resources',
          'Quick access to frequently visited sites',
          'Automatic favicon preview for easy recognition',
        ]}
      />
    </div>
  );
}