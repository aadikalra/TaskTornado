'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, X, ExternalLink, Loader2, ImageIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWebSaves } from '@/context/WebSavesContext';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LinkCard } from '@/components/LinkCard';
import { SplittingText } from '@/components/animate-ui/primitives/texts/splitting';

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
      <div className="w-8 h-8 bg-muted rounded flex items-center justify-center">
        <Loader2 className="h-3 w-3 animate-spin" />
      </div>
    );
  }

  if (error || !faviconUrl) {
    return (
      <div className="w-8 h-8 bg-muted rounded flex items-center justify-center">
        <ImageIcon className="h-3 w-3 text-muted-foreground" />
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

  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;

    setIsSubmitting(true);
    try {
      await addSave(url, title || undefined);
      setUrl('');
      setTitle('');
      setShowForm(false);
    } catch (err) {
      console.error('Error saving link:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="bg-red-50 border-l-4 border-red-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 px-4 max-w-4xl">
      <div className="flex justify-between items-center mb-6">
        <div className="relative text-left">
          <SplittingText
            text={'Web Saves'}
            aria-hidden="true"
            className="block text-4xl font-semibold text-neutral-200 dark:text-neutral-800"
            style={{ fontFamily: 'var(--font-header)' }}
            disableAnimation
          />
          <SplittingText
            text={'Web Saves'}
            className="block text-4xl font-semibold absolute inset-0"
            style={{ fontFamily: 'var(--font-header)' }}
            type="chars"
            alternateColors={['#ef4444', '#10b981']} // Red and Green colors
            inView
            initial={{ y: 0, opacity: 0, x: 0, filter: 'blur(10px)' }}
            animate={{ y: 0, opacity: 1, x: 0, filter: 'blur(0px)' }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          />
          <p className="text-sm text-muted-foreground mt-1">
            {saves.length} saved link{saves.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            setShowForm(true);
          }}
          className="border-2 border-[#264f84] text-[#264f84] hover:bg-[#264f84] hover:text-white hover:scale-105 rounded-xl h-10 px-5 text-sm font-semibold transition-all duration-200 shadow-sm hover:shadow dark:border-blue-400 dark:text-blue-400 dark:hover:bg-blue-400 dark:hover:text-white"
        >
          <Plus className="mr-2 h-4 w-4" /> Add Link
        </Button>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden mb-6"
          >
            <Card className="border-l-4 border-l-blue-500">
              <CardContent className="pt-4">
                <form onSubmit={handleSubmit} className="space-y-3">
                  <div className="flex gap-3">
                    <div className="flex-1">
                      <Input
                        id="url"
                        type="url"
                        placeholder="https://example.com"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        required
                        disabled={isSubmitting}
                        className="h-9"
                      />
                    </div>
                    <div className="flex-1">
                      <Input
                        id="title"
                        type="text"
                        placeholder="Optional title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        disabled={isSubmitting}
                        className="h-9"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setShowForm(false);
                        setUrl('');
                        setTitle('');
                      }}
                      disabled={isSubmitting}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" size="sm" disabled={isSubmitting || !url.trim()}>
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
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {loading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      ) : error ? (
        <div className="text-center py-8">
          <p className="text-destructive mb-4">Error loading your saved links</p>
          <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
            Retry
          </Button>
        </div>
      ) : saves.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed rounded-lg">
          <p className="text-muted-foreground mb-3">No saved links yet</p>
          <Button onClick={() => setShowForm(true)} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Your First Link
          </Button>
        </div>
      ) : (
        <div className="space-y-2">
          {saves.map((save, index) => (
            <motion.div
              key={save.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ delay: index * 0.02 }}
              className="group relative"
            >
              <div className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
                <SitePreview url={save.url} title={save.title} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-medium text-sm truncate">
                      {save.title || new URL(save.url).hostname}
                    </h3>
                    <span className="text-xs text-muted-foreground px-2 py-0.5 bg-muted rounded-full">
                      {new URL(save.url).hostname}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground truncate">
                    {save.url}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Saved {new Date(save.created_at).toLocaleDateString()}
                  </p>
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
                    className="h-8 w-8 p-0 text-destructive hover:text-destructive"
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
    </div>
  );
}