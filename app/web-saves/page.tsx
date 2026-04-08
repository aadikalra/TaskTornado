'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { HugeIcon } from '@/lib/huge-icon-map';
import { motion, AnimatePresence } from 'framer-motion';
import { useWebSaves } from '@/context/WebSavesContext';
import { useAuth } from '@/context/AuthContext';
import { useRequireAuth } from '@/hooks/use-require-auth';
import { Input } from '@/components/ui/input';
import { useRouteIntro } from '@/hooks/use-route-intro';
import { RouteIntroPopup } from '@/components/RouteIntroPopup';
import { POPULAR_SITES } from '@/data/popular-sites';
import { useUpgrade } from '@/context/UpgradeContext';

// ── Favicon component ──
const SitePreview = ({ url, title }: { url: string; title?: string | null }) => {
  const [faviconUrl, setFaviconUrl] = useState<string | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    try {
      setError(false);
      const domain = new URL(url).hostname;
      setFaviconUrl(`https://www.google.com/s2/favicons?domain=${domain}&sz=32`);
    } catch {
      setError(true);
    }
  }, [url]);

  if (error || !faviconUrl) {
    return (
      <div className="w-9 h-9 bg-sky-100 dark:bg-sky-500/10 rounded-xl flex items-center justify-center shrink-0">
        <HugeIcon name="Globe" className="h-3.5 w-3.5 text-sky-500/40" />
      </div>
    );
  }

  return (
    <div className="w-9 h-9 bg-sky-100 dark:bg-sky-500/10 rounded-xl flex items-center justify-center overflow-hidden shrink-0">
      <img
        src={faviconUrl}
        alt={`${title || 'site'} favicon`}
        className="w-5 h-5 object-contain"
        onError={() => setError(true)}
      />
    </div>
  );
};

// ── Tiny favicon for previews ──
const TinyFavicon = ({ url }: { url: string }) => {
  const [src, setSrc] = useState<string | null>(null);
  const [err, setErr] = useState(false);
  useEffect(() => {
    try {
      setSrc(`https://www.google.com/s2/favicons?domain=${new URL(url).hostname}&sz=32`);
    } catch { setErr(true); }
  }, [url]);
  if (err || !src) return <div className="w-5 h-5 rounded-md bg-sky-200/60 dark:bg-sky-500/15" />;
  return (
    <img
      src={src}
      alt=""
      className="w-5 h-5 rounded-md object-contain bg-white dark:bg-gray-800"
      onError={() => setErr(true)}
    />
  );
};

const BackgroundOrbs = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-sky-200/20 dark:bg-sky-500/[0.06] rounded-full blur-[140px]" />
    <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-[#ebf6b5]/30 dark:bg-emerald-500/[0.04] rounded-full blur-[120px]" />
    <div className="absolute top-1/3 right-0 w-[300px] h-[300px] bg-[#ebf6b5]/20 dark:bg-emerald-500/[0.04] rounded-full blur-[100px]" />
  </div>
);

// ── Folder back SVG ──
const FolderBack = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 80" className={className} preserveAspectRatio="none">
    <defs>
      <linearGradient id="backGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#e0efa0" />
        <stop offset="100%" stopColor="#d4e88e" />
      </linearGradient>
    </defs>
    <path d="M6,22 C6,18.7 8.7,16 12,16 H33 C35.2,16 37.1,17.2 38,19.1 L41.5,26 H88 C91.3,26 94,28.7 94,32 V70 C94,73.3 91.3,76 88,76 H12 C8.7,76 6,73.3 6,70 V22 Z" fill="url(#backGrad)" />
  </svg>
);

// ── Folder front SVG (flaps forward) ──
const FolderFront = ({ className, style }: { className?: string; style?: React.CSSProperties }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 80" className={className} style={style} preserveAspectRatio="none">
    <defs>
      <linearGradient id="frontGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#f8fde3" />
        <stop offset="100%" stopColor="#ebf6b5" />
      </linearGradient>
    </defs>
    <path d="M6,36 C6,32.7 8.7,30 12,30 H88 C91.3,30 94,32.7 94,36 V70 C94,73.3 91.3,76 88,76 H12 C8.7,76 6,73.3 6,70 V36 Z" fill="url(#frontGrad)" />
    <path d="M11,30.5 H89 C92,30.5 93.5,32.5 93.5,35" fill="none" stroke="#ffffff" strokeWidth="1" strokeOpacity="0.6" vectorEffect="non-scaling-stroke" />
  </svg>
);

// ── Folder card with hover favicon reveal ──
const FolderCard = ({
  name,
  saves,
  onClick,
  onDelete,
}: {
  name: string;
  saves: { id: string; url: string; title: string | null }[];
  onClick: () => void;
  onDelete: () => void;
}) => {
  const [hovered, setHovered] = useState(false);
  const previewSaves = saves.slice(0, 4);

  // Position favicons inside the folder body area (roughly centered)
  const faviconPositions = [
    { left: '28%', top: '52%' },
    { left: '52%', top: '52%' },
    { left: '28%', top: '72%' },
    { left: '52%', top: '72%' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative group h-full"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <button
        onClick={onClick}
        className="w-full h-full flex flex-col text-left bg-white dark:bg-gray-900 rounded-[22px] border border-sky-100 dark:border-gray-800 p-4 pb-3 hover:shadow-lg hover:shadow-sky-500/5 transition-all duration-300"
      >
        {/* Title */}
        <h3 className="w-full text-[16px] font-bold text-sky-900 dark:text-white truncate mb-1 text-left">
          {name}
        </h3>

        {/* Big folder icon with favicon reveal */}
        <div className="relative flex-1 w-full flex items-center justify-center my-1.5">
          <div className="relative w-[150px] h-[140px]" style={{ perspective: '800px' }}>
            {/* Back piece of folder */}
            <FolderBack className="absolute inset-0 w-full h-full" />

            {/* Business cards sandwiched between back and front */}
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center pt-8">
              <AnimatePresence>
                {hovered && previewSaves.length > 0 && (
                  <>
                    {previewSaves.map((s, i) => {
                      // Fan-out target positions
                      const cardTransforms = [
                        { y: -48, x: -12, rotate: -8 },
                        { y: -26, x: 14, rotate: 6 },
                        { y: -4, x: -8, rotate: -3 },
                        { y: 16, x: 10, rotate: 7 },
                      ];

                      const transform = cardTransforms[i] || { y: 25, x: 0, rotate: 0 };
                      let hostname = '';
                      try { hostname = new URL(s.url).hostname.replace(/^www\./, ''); } catch { hostname = s.url; }

                      return (
                        <div key={s.id} className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ zIndex: 40 - i * 10 }}>
                          <motion.div
                            initial={{ opacity: 0, scale: 0.6, y: 30, x: 0, rotate: 0 }}
                            animate={{ opacity: 1, scale: 1, y: transform.y, x: transform.x, rotate: transform.rotate }}
                            exit={{ opacity: 0, scale: 0.6, y: 30, x: 0, rotate: 0 }}
                            transition={{
                              type: 'spring',
                              stiffness: 350,
                              damping: 25,
                              delay: i * 0.08, // 1-by-1 stagger
                            }}
                            className="w-28 h-8 bg-white dark:bg-gray-800 rounded-lg shadow-[0_4px_12px_rgba(0,0,0,0.1)] border border-sky-100/50 dark:border-gray-600 flex items-center px-2 gap-2 origin-bottom shadow-black/5"
                          >
                            <div className="w-4 h-4 rounded shrink-0 overflow-hidden flex items-center justify-center">
                              <TinyFavicon url={s.url} />
                            </div>
                            <span className="text-[9px] font-bold text-sky-800 dark:text-gray-200 truncate leading-none mt-[1px]">
                              {hostname}
                            </span>
                          </motion.div>
                        </div>
                      );
                    })}
                    {saves.length > 4 && (
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ zIndex: 0 }}>
                        <motion.div
                          initial={{ opacity: 0, y: 30, scale: 0.6 }}
                          animate={{ opacity: 1, y: 32, scale: 1, x: 22, rotate: 12 }}
                          exit={{ opacity: 0, y: 30, scale: 0.6 }}
                          transition={{ type: 'spring', stiffness: 350, damping: 25, delay: 0.35 }}
                          className="w-10 h-6 bg-white/90 dark:bg-gray-700 rounded-lg shadow-md border border-white/80 dark:border-gray-600 flex items-center justify-center shadow-black/5"
                        >
                          <span className="text-[9px] font-bold text-sky-600 dark:text-sky-300">+{saves.length - 4}</span>
                        </motion.div>
                      </div>
                    )}
                  </>
                )}
              </AnimatePresence>
            </div>

            {/* Front piece of folder (opens on hover) */}
            <FolderFront
              className="absolute inset-0 w-full h-full origin-bottom transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] z-20 pointer-events-none"
              style={{ transform: hovered ? 'rotateX(-25deg) translateY(2px) scaleY(1.02)' : 'rotateX(0deg)' }}
            />
          </div>
        </div>

        {/* Link count pill */}
        <div className="w-full flex justify-center mt-auto pt-1">
          <span className="text-[11px] font-semibold text-sky-500/60 dark:text-sky-400/50 bg-sky-50/50 dark:bg-gray-800/50 px-3 py-1 rounded-full">
            {saves.length} link{saves.length !== 1 ? 's' : ''}
          </span>
        </div>
      </button>

      {/* Delete folder (appears on hover) */}
      <AnimatePresence>
        {hovered && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="absolute top-3 right-3 p-1.5 rounded-lg text-red-400/60 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
            title="Delete folder"
          >
            <HugeIcon name="Delete02" className="h-3.5 w-3.5" />
          </motion.button>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// MoveToFolderModal will be injected later


export default function WebSavesPage() {
  const { authenticated } = useRequireAuth();
  if (!authenticated) return null;
  const { user } = useAuth();
  const router = useRouter();
  const { saves, folders, loading, error, addSave, updateSave, deleteSave, createFolder, deleteFolder } = useWebSaves();
  const { showIntro, dismissIntro } = useRouteIntro('web-saves');
  const { handlePlanLimitError } = useUpgrade();

  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showModal, setShowModal] = useState(false);

  // ── Folders state ──
  // activeFolder stores the folder's `id`
  const [activeFolder, setActiveFolder] = useState<string | null>(null);
  const [showNewFolderModal, setShowNewFolderModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [moveMenuOpenFor, setMoveMenuOpenFor] = useState<string | null>(null);
  const [saveFolderTarget, setSaveFolderTarget] = useState<string>(''); // folder id to save into from add modal

  const assignToFolder = useCallback(async (saveId: string, folderId: string | null) => {
    try {
      await updateSave(saveId, { folder_id: folderId });
    } catch (err: any) {
      if (!handlePlanLimitError(err)) {
        console.error('Failed to assign folder', err);
      }
    }
  }, [updateSave]);

  const handleRemoveFolder = useCallback(async (folderId: string) => {
    try {
      if (activeFolder === folderId) setActiveFolder(null);
      await deleteFolder(folderId);
    } catch (err) {
      console.error('Failed to delete folder', err);
    }
  }, [activeFolder, deleteFolder]);

  const handleCreateFolder = useCallback(async (name: string) => {
    try {
      await createFolder(name);
      setShowNewFolderModal(false);
      setNewFolderName('');
    } catch (err: any) {
      if (!handlePlanLimitError(err)) {
        console.error('Failed to create folder', err);
      }
    }
  }, [createFolder]);

  // Group saves by folder
  const foldersWithSaves = useMemo(() => {
    const map: Record<string, typeof saves> = {};
    for (const folder of folders) {
      map[folder.id] = [];
    }
    for (const save of saves) {
      if (save.folder_id) {
        if (!map[save.folder_id]) map[save.folder_id] = [];
        map[save.folder_id].push(save);
      }
    }
    return map;
  }, [saves, folders]);

  const unfolderedSaves = useMemo(() => {
    return saves.filter(s => !s.folder_id);
  }, [saves]);

  const activeFolderData = useMemo(() => {
    if (!activeFolder) return null;
    return folders.find(f => f.id === activeFolder) || null;
  }, [activeFolder, folders]);

  const activeFolderSaves = useMemo(() => {
    if (!activeFolder) return null;
    return foldersWithSaves[activeFolder] || [];
  }, [activeFolder, foldersWithSaves]);

  // ── Search state ──
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const [searchExpanded, setSearchExpanded] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const filteredFolders = useMemo(() => {
    if (!searchQuery) return folders;
    return folders.filter(folder => folder.name.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [folders, searchQuery]);

  const filteredUnfolderedSaves = useMemo(() => {
    if (!searchQuery) return unfolderedSaves;
    return unfolderedSaves.filter(s =>
      s.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.url.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [unfolderedSaves, searchQuery]);

  const filteredActiveFolderSaves = useMemo(() => {
    if (!activeFolderSaves) return null;
    if (!searchQuery) return activeFolderSaves;
    return activeFolderSaves.filter(s =>
      s.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.url.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [activeFolderSaves, searchQuery]);

  // ── Autocomplete state ──
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const urlInputRef = useRef<HTMLInputElement>(null);

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

  const selectSuggestion = useCallback((site: typeof POPULAR_SITES[0]) => {
    setUrl(site.url);
    if (!title) setTitle(site.name);
    setShowSuggestions(false);
    setSelectedSuggestionIndex(-1);
  }, [title]);

  const handleUrlKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions || filteredSuggestions.length === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedSuggestionIndex(prev => prev < filteredSuggestions.length - 1 ? prev + 1 : 0);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedSuggestionIndex(prev => prev > 0 ? prev - 1 : filteredSuggestions.length - 1);
    } else if (e.key === 'Enter' && selectedSuggestionIndex >= 0) {
      e.preventDefault();
      selectSuggestion(filteredSuggestions[selectedSuggestionIndex]);
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
      setSelectedSuggestionIndex(-1);
    }
  }, [showSuggestions, filteredSuggestions, selectedSuggestionIndex, selectSuggestion]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        suggestionsRef.current && !suggestionsRef.current.contains(e.target as Node) &&
        urlInputRef.current && !urlInputRef.current.contains(e.target as Node)
      ) {
        setShowSuggestions(false);
      }
      // Close move menu
      if (moveMenuOpenFor) setMoveMenuOpenFor(null);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [moveMenuOpenFor]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;
    setIsSubmitting(true);
    try {
      // Normalize URL — auto-prepend https:// if no protocol
      let normalizedUrl = url.trim();
      if (!/^https?:\/\//i.test(normalizedUrl)) {
        normalizedUrl = `https://${normalizedUrl}`;
      }
      const targetFolderId = saveFolderTarget || activeFolder || null;
      await addSave(normalizedUrl, title || undefined, targetFolderId);
      setUrl('');
      setTitle('');
      setSaveFolderTarget('');
      setShowModal(false);
      setShowSuggestions(false);
    } catch (err: any) {
      if (!handlePlanLimitError(err)) {
        console.error('Error saving link:', err);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const openModal = () => setShowModal(true);
  const closeModal = () => {
    setShowModal(false);
    setUrl('');
    setTitle('');
    setSaveFolderTarget('');
    setShowSuggestions(false);
    setSelectedSuggestionIndex(-1);
  };

  // ── Renders ──

  const renderSaveRow = (save: typeof saves[0], index: number) => {
    let hostname = '';
    try { hostname = new URL(save.url).hostname; } catch { hostname = save.url; }
    const saveFolder = folders.find(f => f.id === save.folder_id);
    const folderName = saveFolder ? saveFolder.name : null;

    return (
      <motion.div
        key={save.id}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.03 + index * 0.02 }}
        className="group border-b border-sky-100/60 dark:border-gray-800 py-4 first:pt-0 last:border-0"
      >
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3.5 flex-1 min-w-0">
            <SitePreview url={save.url} title={save.title} />
            <div className="flex-1 min-w-0">
              <a
                href={save.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block group/link"
              >
                <h3 className="text-[15px] font-semibold text-sky-900 dark:text-white mb-0.5 truncate group-hover/link:text-sky-600 dark:group-hover/link:text-sky-300 transition-colors">
                  {save.title || hostname}
                </h3>
              </a>
              <p className="text-xs text-sky-800/40 dark:text-sky-300/40 truncate mb-1.5">
                {save.url}
              </p>
              <div className="flex items-center gap-2.5">
                <span className="inline-flex items-center px-2 py-0.5 bg-[#ebf6b5]/50 dark:bg-emerald-500/10 border border-[#d4e88e]/40 rounded-full text-[10px] font-semibold text-sky-700 dark:text-sky-400">
                  {hostname}
                </span>
                <span className="text-[10px] text-sky-600/40 dark:text-sky-400/40">
                  {save.created_at ? new Date(save.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : ''}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0 ml-3">
            <a
              href={save.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-semibold text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-500/10 hover:bg-sky-100 dark:hover:bg-sky-500/20 rounded-lg transition-colors"
            >
              <HugeIcon name="LinkSquare02" className="h-3 w-3" />
              Open
            </a>
            {/* Move to folder */}
            <button
              onClick={() => setMoveMenuOpenFor(save.id)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] font-semibold rounded-lg transition-colors opacity-0 group-hover:opacity-100 ${folderName
                ? 'text-sky-700 dark:text-sky-300 bg-sky-100/80 dark:bg-sky-500/20 hover:bg-sky-200/80'
                : 'text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-500/10 hover:bg-sky-100 dark:hover:bg-sky-500/20'
                }`}
            >
              {folderName ? <HugeIcon name="Folder03" className="h-3 w-3" /> : <HugeIcon name="FolderAdd" className="h-3 w-3" />}
              <span className="max-w-[80px] truncate">{folderName || 'Folder'}</span>
            </button>
            <button
              onClick={() => deleteSave(save.id)}
              className="p-1.5 rounded-lg text-red-400/40 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors opacity-0 group-hover:opacity-100"
              title="Delete"
            >
              <HugeIcon name="Delete02" className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </motion.div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fffaf4] dark:bg-gray-950 relative">
        <BackgroundOrbs />
        <div className="relative z-10 w-full mx-auto px-4 sm:px-6 md:px-12 lg:px-16 pt-28 pb-16">
          <h1 className="text-4xl sm:text-5xl font-bold text-sky-500 dark:text-sky-400 tracking-tight mb-2">Web Saves</h1>
          <p className="text-sky-600/50 dark:text-sky-400/50 text-sm font-medium mb-8">Save and organize important links</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="bg-white dark:bg-gray-900 rounded-[22px] border border-sky-100 dark:border-gray-800 p-5 h-36 animate-pulse">
                <div className="w-10 h-10 bg-sky-100 rounded-xl mb-3" />
                <div className="h-4 w-20 bg-sky-100 rounded-lg mb-2" />
                <div className="h-3 w-14 bg-sky-50 rounded-lg" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#fffaf4] dark:bg-gray-950 relative">
        <BackgroundOrbs />
        <div className="relative z-10 w-full mx-auto px-4 sm:px-6 md:px-12 lg:px-16 pt-28 pb-16">
          <h1 className="text-4xl sm:text-5xl font-bold text-sky-500 dark:text-sky-400 tracking-tight mb-2">Web Saves</h1>
          <div className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-2xl mt-6">
            <HugeIcon name="AlertCircle" className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
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
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex-1">
              {activeFolder ? (
                <div>
                  <button
                    onClick={() => setActiveFolder(null)}
                    className="inline-flex items-center gap-1.5 text-sm text-sky-500 hover:text-sky-700 dark:text-sky-400 dark:hover:text-sky-300 transition-colors mb-3"
                  >
                    <HugeIcon name="ArrowLeft01" className="h-3.5 w-3.5" />
                    All Saves
                  </button>
                  <h1 className="text-4xl sm:text-5xl font-bold text-sky-500 dark:text-sky-400 tracking-tight mb-2 flex items-center gap-3">
                    <HugeIcon name="Folder03" className="h-9 w-9" />
                    {activeFolderData?.name}
                  </h1>
                  <p className="text-sky-600/50 dark:text-sky-400/50 text-sm font-medium">
                    {activeFolderSaves?.length || 0} link{(activeFolderSaves?.length || 0) !== 1 ? 's' : ''}
                  </p>
                </div>
              ) : (
                <div>
                  <h1 className="text-4xl sm:text-5xl font-bold text-sky-500 dark:text-sky-400 tracking-tight mb-2">
                    Web Saves
                  </h1>
                  <p className="text-sky-600/50 dark:text-sky-400/50 text-sm font-medium">
                    {saves.length} saved link{saves.length !== 1 ? 's' : ''} · {folders.length} folder{folders.length !== 1 ? 's' : ''}
                  </p>
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full md:w-auto shrink-0">
              {/* Expanding Search — icon stays right, bar slides left */}
              <motion.div
                initial={false}
                animate={{ width: searchExpanded ? 320 : 40 }}
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
                  <HugeIcon name="Search01" className="w-4 h-4 text-sky-500 dark:text-sky-400" />
                </div>

                {/* Input area — right of icon */}
                <div className={`flex items-center flex-1 min-w-0 overflow-hidden transition-opacity duration-200 ${searchExpanded ? 'opacity-100 pr-4' : 'opacity-0 w-0 pr-0'}`}>
                  <input
                    ref={searchInputRef}
                    type="text"
                    placeholder={activeFolder ? "Search inside folder..." : "Search saves & folders..."}
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
                      <HugeIcon name="Cancel01" className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </motion.div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                {!activeFolder && (
                  <button
                    onClick={() => setShowNewFolderModal(true)}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-sky-600 dark:text-sky-400 hover:text-sky-900 dark:hover:text-white bg-white dark:bg-gray-900 hover:bg-sky-50 dark:hover:bg-gray-800 border border-sky-200 dark:border-gray-700 rounded-xl transition-colors"
                  >
                    <HugeIcon name="FolderAdd" className="h-4 w-4" />
                    Folder
                  </button>
                )}
                <button
                  onClick={openModal}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-sky-700 bg-[#ebf6b5] hover:bg-[#e0efa0] border border-[#d4e88e] rounded-xl transition-colors"
                >
                  <HugeIcon name="PlusSign" className="h-4 w-4" />
                  Add Link
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Content */}
        {activeFolder ? (
          /* ── Inside a folder ── */
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
          >
            {filteredActiveFolderSaves && filteredActiveFolderSaves.length > 0 ? (
              <div className="bg-white dark:bg-gray-900 rounded-[22px] border border-sky-100 dark:border-gray-800 px-5 py-3">
                {filteredActiveFolderSaves.map((save, i) => renderSaveRow(save, i))}
              </div>
            ) : searchQuery ? (
              <div className="py-20 text-center">
                <p className="text-sky-600/50 dark:text-sky-400/50 text-sm">No links in this folder match "{searchQuery}"</p>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20">
                <div className="w-16 h-16 bg-[#f5f9fc] dark:bg-gray-800 rounded-2xl border border-sky-100 dark:border-gray-700 flex items-center justify-center mb-5">
                  <HugeIcon name="Folder03" className="h-7 w-7 text-sky-500/30" />
                </div>
                <h3 className="text-lg font-bold text-sky-900 dark:text-white mb-1.5">Empty folder</h3>
                <p className="text-sm text-sky-600/50 dark:text-sky-400/50 mb-6">Move links here or add a new one</p>
                <button
                  onClick={openModal}
                  className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-sky-700 bg-[#ebf6b5] hover:bg-[#e0efa0] border border-[#d4e88e] rounded-xl transition-colors"
                >
                  <HugeIcon name="PlusSign" className="h-4 w-4" />
                  Add Link
                </button>
              </div>
            )}
          </motion.div>
        ) : (
          /* ── Root view: folders then loose links ── */
          <>
            {/* Folder grid */}
            {filteredFolders.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.03 }}
                className="mb-10"
              >
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-sky-500 dark:text-sky-400 mb-6 px-1">
                  Folders
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3.5">
                  {filteredFolders.map(folder => (
                    <FolderCard
                      key={folder.id}
                      name={folder.name}
                      saves={foldersWithSaves[folder.id] || []}
                      onClick={() => setActiveFolder(folder.id)}
                      onDelete={() => handleRemoveFolder(folder.id)}
                    />
                  ))}
                </div>
              </motion.div>
            )}

            {/* Unfoldered saves */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.06 }}
            >
              {filteredFolders.length > 0 && filteredUnfolderedSaves.length > 0 && (
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-sky-500 dark:text-sky-400 mb-6 px-1">
                  Unsorted Links
                </h2>
              )}

              {saves.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24">
                  <div className="w-20 h-20 bg-[#f5f9fc] dark:bg-gray-800 rounded-3xl border border-sky-100 dark:border-gray-700 flex items-center justify-center mb-6">
                    <HugeIcon name="Bookmark03" className="h-9 w-9 text-sky-500/30 dark:text-sky-400/30" />
                  </div>
                  <h3 className="text-xl font-bold text-sky-900 dark:text-white mb-2">No Saved Links Yet</h3>
                  <p className="text-sm text-sky-600/50 dark:text-sky-400/50 mb-8 max-w-sm text-center">
                    Save important links for quick access and study resources
                  </p>
                  <button
                    onClick={openModal}
                    className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-sky-700 bg-[#ebf6b5] hover:bg-[#e0efa0] border border-[#d4e88e] rounded-xl transition-colors"
                  >
                    <HugeIcon name="PlusSign" className="h-4 w-4" />
                    Add Your First Link
                  </button>
                </div>
              ) : searchQuery && filteredUnfolderedSaves.length === 0 && filteredFolders.length === 0 ? (
                <div className="py-20 text-center">
                  <p className="text-sky-600/50 dark:text-sky-400/50 text-sm">No folders or links match "{searchQuery}"</p>
                </div>
              ) : filteredUnfolderedSaves.length > 0 ? (
                <div className="bg-white dark:bg-gray-900 rounded-[22px] border border-sky-100 dark:border-gray-800 px-5 py-3">
                  {filteredUnfolderedSaves.map((save, i) => renderSaveRow(save, i))}
                </div>
              ) : filteredFolders.length > 0 ? (
                <div className="text-center py-10">
                  <p className="text-sm text-sky-500/30 dark:text-sky-400/25">All links are organized in folders ✨</p>
                </div>
              ) : null}
            </motion.div>
          </>
        )}

        {/* ═══ Add Link Modal ═══ */}
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
                  <div className="sticky top-0 bg-white dark:bg-gray-900 flex items-center justify-between px-6 py-4 border-b border-sky-100 dark:border-gray-800 rounded-t-[28px] z-10">
                    <h2 className="text-lg font-bold text-sky-900 dark:text-white">Add New Link</h2>
                    <button
                      onClick={closeModal}
                      className="p-2 text-sky-400 hover:text-sky-900 dark:text-sky-500 dark:hover:text-white hover:bg-sky-50 rounded-full transition-colors"
                    >
                      <HugeIcon name="Cancel01" className="h-5 w-5" />
                    </button>
                  </div>

                  <div className="p-6 space-y-5">
                    <form onSubmit={handleSubmit} className="space-y-5">
                      <div className="relative">
                        <label htmlFor="url" className="block text-[11px] font-semibold text-sky-600 dark:text-sky-400 uppercase tracking-wider mb-2">URL</label>
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
                          onFocus={() => { if (url.length >= 2) setShowSuggestions(true); }}
                          onKeyDown={handleUrlKeyDown}
                          required
                          disabled={isSubmitting}
                          className="w-full h-11 bg-white dark:bg-gray-900 border-sky-200 dark:border-gray-700 text-sky-900 dark:text-white placeholder-sky-400 dark:placeholder-sky-500 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                          autoComplete="off"
                          autoFocus
                        />
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
                                    className={`w-full flex items-center gap-3 px-3.5 py-2.5 text-left transition-colors ${index === selectedSuggestionIndex ? 'bg-sky-50 dark:bg-sky-500/10' : 'hover:bg-sky-50/60 dark:hover:bg-sky-500/5'}`}
                                  >
                                    <div className="w-7 h-7 bg-sky-100 dark:bg-sky-500/10 rounded-lg flex items-center justify-center shrink-0 overflow-hidden">
                                      <img
                                        src={`https://www.google.com/s2/favicons?domain=${domain}&sz=32`}
                                        alt=""
                                        className="w-4 h-4 object-contain"
                                        onError={(e) => {
                                          (e.target as HTMLImageElement).style.display = 'none';
                                        }}
                                      />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <p className="text-sm font-semibold text-sky-900 dark:text-white truncate">{site.name}</p>
                                      <p className="text-xs text-sky-500/50 dark:text-sky-400/50 truncate">{domain}</p>
                                    </div>
                                    <span className="text-[10px] font-medium text-sky-400/40 shrink-0">↵</span>
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

                      {/* Folder assignment (optional) */}
                      {folders.length > 0 && (
                        <div>
                          <label className="block text-[11px] font-semibold text-sky-600 dark:text-sky-400 uppercase tracking-wider mb-2">
                            Folder <span className="text-sky-400 font-normal normal-case tracking-normal">(Optional)</span>
                          </label>
                          <div className="flex flex-wrap gap-1.5">
                            {folders.map(f => (
                              <button
                                key={f.id}
                                type="button"
                                onClick={() => setSaveFolderTarget(saveFolderTarget === f.id ? '' : f.id)}
                                className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${saveFolderTarget === f.id
                                  ? 'bg-sky-100 dark:bg-sky-500/15 text-sky-700 dark:text-sky-300 border border-sky-300 dark:border-sky-500/30'
                                  : 'bg-sky-50 dark:bg-gray-800 text-sky-600/60 dark:text-sky-400/50 border border-sky-100 dark:border-gray-700 hover:border-sky-200'
                                  }`}
                              >
                                <HugeIcon name="Folder03" className="h-3 w-3" />
                                {f.name}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

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
                              <HugeIcon name="LoaderPinwheel" className="h-3.5 w-3.5 animate-spin" />
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

        {/* ═══ New Folder Modal ═══ */}
        <AnimatePresence>
          {showNewFolderModal && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-[#fffaf4]/80 dark:bg-gray-950/80 backdrop-blur-sm z-50"
                onClick={() => setShowNewFolderModal(false)}
              />
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <motion.div
                  initial={{ opacity: 0, scale: 0.96, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.96, y: 20 }}
                  transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                  className="bg-white dark:bg-gray-900 rounded-[28px] shadow-2xl shadow-sky-500/5 w-full max-w-sm relative border border-sky-100 dark:border-gray-800"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="p-7">
                    <div className="w-12 h-12 bg-[#ebf6b5]/50 dark:bg-[#ebf6b5]/10 border border-[#d4e88e]/40 dark:border-[#d4e88e]/15 rounded-2xl flex items-center justify-center mb-4">
                      <HugeIcon name="FolderAdd" className="h-6 w-6 text-sky-700 dark:text-sky-300" />
                    </div>
                    <h2 className="text-xl font-bold text-sky-900 dark:text-white mb-1.5">New Folder</h2>
                    <p className="text-sm text-sky-600/50 dark:text-sky-400/50 mb-5">Organize your saved links into folders</p>

                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        if (newFolderName.trim()) handleCreateFolder(newFolderName.trim());
                      }}
                    >
                      <Input
                        placeholder="Folder name"
                        value={newFolderName}
                        onChange={(e) => setNewFolderName(e.target.value)}
                        className="w-full h-11 bg-white dark:bg-gray-900 border-sky-200 dark:border-gray-700 text-sky-900 dark:text-white placeholder-sky-400 rounded-xl focus:ring-2 focus:ring-sky-500 mb-5"
                        autoFocus
                      />
                      <div className="flex items-center justify-end gap-2.5">
                        <button
                          type="button"
                          onClick={() => { setShowNewFolderModal(false); setNewFolderName(''); }}
                          className="h-10 px-5 text-[13px] font-semibold text-sky-600 dark:text-sky-400 hover:text-sky-900 dark:hover:text-white hover:bg-sky-50 dark:hover:bg-gray-800 border border-sky-200 dark:border-gray-700 rounded-full transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={!newFolderName.trim()}
                          className="h-10 px-6 text-[13px] font-semibold text-sky-700 dark:text-sky-300 bg-[#ebf6b5]/60 dark:bg-[#ebf6b5]/10 hover:bg-[#ebf6b5] border border-[#d4e88e]/50 dark:border-[#d4e88e]/20 rounded-full disabled:opacity-40 transition-colors"
                        >
                          Create Folder
                        </button>
                      </div>
                    </form>
                  </div>
                </motion.div>
              </div>
            </>
          )}
        </AnimatePresence>
        {/* ═══ Move to Folder Modal ═══ */}
        <AnimatePresence>
          {moveMenuOpenFor && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-[#fffaf4]/80 dark:bg-gray-950/80 backdrop-blur-sm z-50"
                onClick={() => setMoveMenuOpenFor(null)}
              />
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <motion.div
                  initial={{ opacity: 0, scale: 0.96, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.96, y: 20 }}
                  transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                  className="bg-white dark:bg-gray-900 rounded-[28px] shadow-2xl shadow-sky-500/5 w-full max-w-sm relative border border-sky-100 dark:border-gray-800 flex flex-col max-h-[85vh]"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center justify-between px-6 py-5 border-b border-sky-50 dark:border-gray-800 shrink-0">
                    <div>
                      <h2 className="text-lg font-bold text-sky-900 dark:text-white">Select Folder</h2>
                      <p className="text-xs font-semibold text-sky-500/60 dark:text-sky-400/50 uppercase tracking-wider mt-0.5">Move saved link</p>
                    </div>
                    <button
                      onClick={() => setMoveMenuOpenFor(null)}
                      className="p-2 -mr-2 text-sky-400 hover:text-sky-900 dark:text-sky-500 dark:hover:text-white hover:bg-sky-50 dark:hover:bg-gray-800 rounded-full transition-colors"
                    >
                      <HugeIcon name="Cancel01" className="h-5 w-5" />
                    </button>
                  </div>

                  <div className="p-3 overflow-y-auto">
                    {/* Folders List */}
                    <div className="space-y-1">
                      {folders.map(f => {
                        const targetSave = saves.find(s => s.id === moveMenuOpenFor);
                        const isCurrent = targetSave?.folder_id === f.id;
                        return (
                          <button
                            key={f.id}
                            onClick={() => {
                              assignToFolder(moveMenuOpenFor!, f.id);
                              setMoveMenuOpenFor(null);
                            }}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isCurrent
                              ? 'bg-sky-50/50 dark:bg-sky-500/10 border border-sky-200/50 dark:border-sky-500/20'
                              : 'hover:bg-sky-50/50 dark:hover:bg-gray-800 border border-transparent'
                              }`}
                          >
                            <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${isCurrent ? 'bg-sky-100 dark:bg-sky-500/20 text-sky-600 dark:text-sky-300' : 'bg-[#ebf6b5]/50 dark:bg-[#ebf6b5]/10 text-sky-700 dark:text-sky-400 border border-[#d4e88e]/40'
                              }`}>
                              <HugeIcon name="Folder03" className="h-4 w-4" />
                            </div>
                            <span className={`text-[15px] font-semibold truncate ${isCurrent ? 'text-sky-700 dark:text-sky-300' : 'text-sky-900 dark:text-white'
                              }`}>
                              {f.name}
                            </span>
                            {isCurrent && (
                              <span className="ml-auto text-[10px] font-bold text-sky-500 bg-sky-100 dark:bg-sky-500/20 px-2 py-0.5 rounded-full uppercase tracking-widest">
                                Current
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>

                    {folders.length === 0 && (
                      <div className="py-8 text-center text-sky-600/50 dark:text-sky-400/50 text-sm">
                        No folders created yet.
                      </div>
                    )}
                  </div>

                  {/* Remove from folder action */}
                  {saves.find(s => s.id === moveMenuOpenFor)?.folder_id && (
                    <div className="p-3 border-t border-sky-50 dark:border-gray-800 shrink-0">
                      <button
                        onClick={() => {
                          assignToFolder(moveMenuOpenFor!, null);
                          setMoveMenuOpenFor(null);
                        }}
                        className="w-full flex items-center justify-center gap-2 py-2.5 text-xs font-bold text-red-500 bg-red-50 dark:bg-red-500/10 hover:bg-red-100 dark:hover:bg-red-500/20 rounded-xl transition-colors"
                      >
                        Remove from folder
                      </button>
                    </div>
                  )}
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
        description="Save and organize important links in folders for quick access"
        icon={<HugeIcon name="Bookmark03" size={24} className="h-6 w-6" />}
        features={[
          'Save important links with custom titles',
          'Organize into folders for easy navigation',
          'Hover folders to preview contents',
          'Automatic favicon preview for easy recognition',
        ]}
      />
    </div>
  );
}