'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, X, ExternalLink, Loader2, ImageIcon, AlertTriangle, Bookmark, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWebSaves } from '@/context/WebSavesContext';
import { useAuth } from '@/context/AuthContext';
import { useRequireAuth } from '@/hooks/use-require-auth';
import { Input } from '@/components/ui/input';
import { useRouteIntro } from '@/hooks/use-route-intro';
import { RouteIntroPopup } from '@/components/RouteIntroPopup';

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;

    setIsSubmitting(true);
    try {
      await addSave(url, title || undefined);
      setUrl('');
      setTitle('');
      setShowModal(false);
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
                className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
                onClick={closeModal}
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
                        Add New Link
                      </h2>
                      <button
                        onClick={closeModal}
                        className="p-1.5 rounded-lg text-sky-500/40 hover:text-sky-600 hover:bg-sky-500/5 transition-colors"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div>
                        <label htmlFor="url" className="block text-xs font-bold text-sky-500/50 dark:text-sky-400/50 mb-2 uppercase tracking-wider">
                          URL
                        </label>
                        <Input
                          id="url"
                          type="url"
                          placeholder="https://example.com"
                          value={url}
                          onChange={(e) => setUrl(e.target.value)}
                          required
                          disabled={isSubmitting}
                          className="border-sky-100 dark:border-gray-700 bg-[#f5f9fc] dark:bg-gray-900 text-sky-900 dark:text-white rounded-xl focus:border-sky-500 dark:focus:border-sky-400"
                          autoFocus
                        />
                      </div>
                      <div>
                        <label htmlFor="title" className="block text-xs font-bold text-sky-500/50 dark:text-sky-400/50 mb-2 uppercase tracking-wider">
                          Title (optional)
                        </label>
                        <Input
                          id="title"
                          type="text"
                          placeholder="Add a custom title"
                          value={title}
                          onChange={(e) => setTitle(e.target.value)}
                          disabled={isSubmitting}
                          className="border-sky-100 dark:border-gray-700 bg-[#f5f9fc] dark:bg-gray-900 text-sky-900 dark:text-white rounded-xl focus:border-sky-500 dark:focus:border-sky-400"
                        />
                      </div>
                      <div className="flex justify-end gap-2 pt-1">
                        <button
                          type="button"
                          onClick={closeModal}
                          disabled={isSubmitting}
                          className="px-4 py-2 text-sm font-semibold text-sky-600 dark:text-sky-400 hover:bg-sky-500/5 rounded-xl transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={isSubmitting || !url.trim()}
                          className="flex items-center gap-2 px-5 py-2 text-sm font-semibold text-sky-700 bg-[#ebf6b5] hover:bg-[#e0efa0] border border-[#d4e88e] rounded-xl transition-colors disabled:opacity-50"
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