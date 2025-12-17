'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, X, ExternalLink, Loader2, ImageIcon, Home, AlertTriangle, Bookmark } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWebSaves } from '@/context/WebSavesContext';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useWideLayout } from '@/hooks/use-wide-layout';
import { useRouteIntro } from '@/hooks/use-route-intro';
import { RouteIntroPopup } from '@/components/RouteIntroPopup';

// Favicon preview component
const SitePreview = ({ url, title }: { url: string; title?: string | null }) => {
  const [faviconUrl, setFaviconUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchFavicon = async () => {
      try {
        setLoading(true);
        setError(false);

        const domain = new URL(url).hostname;

        // Try multiple favicon sources
        const faviconSources = [
          `https://${domain}/favicon.ico`,
          `https://${domain}/favicon.png`,
          `https://www.google.com/s2/favicons?domain=${domain}&sz=32`,
        ];

        for (const source of faviconSources) {
          try {
            // For Google favicon service, we can use it directly
            if (source.includes('google.com/s2/favicons')) {
              setFaviconUrl(source);
              return;
            }

            // For direct favicon requests, we'll set a fallback since we can't actually fetch cross-origin
            const faviconUrl = `https://${domain}/favicon.ico`;
            setFaviconUrl(faviconUrl);
            return;
          } catch (err) {
            continue;
          }
        }

        // If all sources fail, use a fallback
        setError(true);
      } catch (err) {
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    if (url) {
      fetchFavicon();
    }
  }, [url]);

  if (loading) {
    return (
      <div className="w-8 h-8 bg-gray-100 dark:bg-gray-800 rounded flex items-center justify-center">
        <Loader2 className="h-3 w-3 animate-spin" />
      </div>
    );
  }

  if (error || !faviconUrl) {
    return (
      <div className="w-8 h-8 bg-gray-100 dark:bg-gray-800 rounded flex items-center justify-center">
        <ImageIcon className="h-3 w-3 text-gray-400" />
      </div>
    );
  }

  return (
    <img
      src={faviconUrl}
      alt={`${title || new URL(url).hostname} favicon`}
      className="w-8 h-8 rounded object-cover"
      onError={() => setError(true)}
    />
  );
};

export default function WebSavesPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { saves, loading, error, addSave, deleteSave } = useWebSaves();
  const { getContainerClass } = useWideLayout();
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

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-950">
        <div className={getContainerClass() + ' py-16'}>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-16"
          >
            <h1 className="text-4xl font-light text-gray-900 dark:text-white mb-3 tracking-tight">
              Web Saves
            </h1>
            <p className="text-gray-500 dark:text-gray-400">
              Save and organize important links
            </p>
          </motion.div>

          <div className="space-y-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="border-b border-gray-200 dark:border-gray-800 pb-6">
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />
                  <div className="flex-1">
                    <div className="h-4 w-48 bg-gray-100 dark:bg-gray-800 rounded mb-2 animate-pulse" />
                    <div className="h-3 w-32 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-950">
        <div className={getContainerClass() + ' py-16'}>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-16"
          >
            <h1 className="text-4xl font-light text-gray-900 dark:text-white mb-3 tracking-tight">
              Web Saves
            </h1>
            <p className="text-gray-500 dark:text-gray-400">
              Save and organize important links
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
          >
            <div className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-red-900 dark:text-red-100">
                  Error loading saves
                </p>
                <p className="text-xs text-red-700 dark:text-red-300 mt-1">
                  {error}
                </p>
              </div>
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
                Web Saves
              </h1>
              <p className="text-gray-500 dark:text-gray-400">
                {saves.length} saved link{saves.length !== 1 ? 's' : ''}
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={openModal}
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Link
            </Button>
          </div>
        </motion.div>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
        >
          {saves.length === 0 ? (
            <div className="text-center py-16">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full mb-4">
                <ImageIcon className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
                No saved links yet
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6">
                Start building your collection of important links.
              </p>
              <Button onClick={openModal} className="gap-2">
                <Plus className="h-4 w-4" />
                Add Your First Link
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {saves.map((save, index) => (
                <motion.div
                  key={save.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ delay: 0.1 + index * 0.05 }}
                  className="border-b border-gray-200 dark:border-gray-800 pb-6 last:border-0 group"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <SitePreview url={save.url} title={save.title} />
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2 truncate">
                          {save.title || new URL(save.url).hostname}
                        </h3>
                        <div className="space-y-1">
                          <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                            {save.url}
                          </p>
                          <div className="flex items-center gap-4 text-xs text-gray-400 dark:text-gray-500">
                            <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-800 rounded-full">
                              {new URL(save.url).hostname}
                            </span>
                            <span>
                              Saved {save.created_at ? new Date(save.created_at).toLocaleDateString() : 'N/A'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="sm"
                        asChild
                        className="h-8 w-8 p-0"
                      >
                        <a href={save.url} target="_blank" rel="noopener noreferrer" aria-label="Open link">
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteSave(save.id)}
                        className="h-8 w-8 p-0 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
                        aria-label="Delete link"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Add Link Modal */}
        <AnimatePresence>
          {showModal && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 z-50"
                onClick={closeModal}
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
                        Add New Link
                      </h2>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={closeModal}
                        className="h-8 w-8 p-0"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="space-y-4">
                        <div>
                          <label htmlFor="url" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
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
                            className="border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900"
                            autoFocus
                          />
                        </div>
                        <div>
                          <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Title (optional)
                          </label>
                          <Input
                            id="title"
                            type="text"
                            placeholder="Add a custom title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            disabled={isSubmitting}
                            className="border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900"
                          />
                        </div>
                      </div>
                      <div className="flex justify-end gap-3 pt-2">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={closeModal}
                          disabled={isSubmitting}
                          className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                        >
                          Cancel
                        </Button>
                        <Button
                          type="submit"
                          size="sm"
                          disabled={isSubmitting || !url.trim()}
                          className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100"
                        >
                          {isSubmitting ? (
                            <>
                              <Loader2 className="h-3 w-3 mr-2 animate-spin" />
                              Saving...
                            </>
                          ) : (
                            'Save Link'
                          )}
                        </Button>
                      </div>
                    </form>
                  </div>
                </motion.div>
              </div>
            </>
          )}
        </AnimatePresence>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-20 pt-8 border-t border-gray-200 dark:border-gray-800"
        >
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Built for students • Public Beta v2.0.3
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

      {/* Route Intro Popup */}
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