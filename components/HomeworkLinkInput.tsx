'use client';

import React, { useState } from 'react';
import { HugeIcon } from '@/lib/huge-icon-map';
import { Input } from '@/components/ui/input';
import { motion, AnimatePresence } from 'framer-motion';

type HomeworkLink = {
  id: string;
  url: string;
  title?: string;
};

type HomeworkLinkInputProps = {
  links: HomeworkLink[];
  onChange: (links: HomeworkLink[]) => void;
};

export const HomeworkLinkInput: React.FC<HomeworkLinkInputProps> = ({ links = [], onChange }) => {
  const [newLink, setNewLink] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const inputId = React.useId();

  const handleAddLink = () => {
    if (!newLink.trim()) return;

    const newLinkObj: HomeworkLink = {
      id: Date.now().toString(),
      url: newLink.startsWith('http') ? newLink : `https://${newLink}`,
      title: newTitle.trim() || undefined
    };

    onChange([...links, newLinkObj]);
    setNewLink('');
    setNewTitle('');
    setIsAdding(false);
  };

  const removeLink = (id: string) => {
    onChange(links.filter(link => link.id !== id));
  };

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-medium text-sky-700 dark:text-sky-300 ml-1">
          Links
        </label>
        <button
          type="button"
          onClick={() => setIsAdding(!isAdding)}
          aria-expanded={isAdding}
          aria-controls={`${inputId}-editor`}
          className={`text-xs font-medium flex items-center gap-1.5 px-2 py-1 rounded-lg transition-colors ${
            isAdding 
              ? 'bg-red-50 text-red-500 dark:bg-red-500/10' 
              : 'text-sky-500 hover:bg-sky-50 dark:hover:bg-sky-500/10'
          }`}
        >
          <motion.div animate={{ rotate: isAdding ? 45 : 0 }}>
            <HugeIcon name="PlusSign" size={12} className="h-3 w-3" />
          </motion.div>
          {isAdding ? 'Cancel' : 'Add Link'}
        </button>
      </div>

      <AnimatePresence>
        {isAdding && (
          <motion.div
            id={`${inputId}-editor`}
            initial={{ opacity: 0, y: -10, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -10, height: 0 }}
            className="overflow-hidden"
          >
            <div className="space-y-3 p-3 bg-sky-50/30 dark:bg-gray-800/30 rounded-xl border border-sky-100 dark:border-gray-700">
              <div className="space-y-1.5">
                <label htmlFor={`${inputId}-url`} className="block text-xs font-medium text-sky-700 dark:text-sky-300">URL</label>
                <Input
                  id={`${inputId}-url`}
                  type="url"
                  value={newLink}
                  onChange={(e) => setNewLink(e.target.value)}
                  placeholder="https://…"
                  autoFocus
                  onKeyDown={(event) => { if (event.key === 'Enter') { event.preventDefault(); handleAddLink(); } }}
                  className="h-9 px-3 text-sm bg-white dark:bg-gray-900 border border-sky-100 dark:border-gray-700 text-sky-800 dark:text-sky-100 placeholder:text-sky-400/50 dark:placeholder:text-sky-500/50 rounded-lg focus:ring-2 focus:ring-[#ebf6b5]/40 focus:border-[#d4e88e] outline-none transition-all"
                />
              </div>
              <div className="flex items-end gap-2.5">
                <div className="min-w-0 flex-1 space-y-1.5">
                  <label htmlFor={`${inputId}-label`} className="block text-xs font-medium text-sky-700 dark:text-sky-300">Label <span className="font-normal text-sky-500/70 dark:text-sky-400/70">(optional)</span></label>
                  <Input
                    id={`${inputId}-label`}
                    type="text"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="e.g. Worksheet"
                    onKeyDown={(event) => { if (event.key === 'Enter') { event.preventDefault(); handleAddLink(); } }}
                    className="h-9 px-3 text-sm bg-white dark:bg-gray-900 border border-sky-100 dark:border-gray-700 text-sky-800 dark:text-sky-100 placeholder:text-sky-400/50 dark:placeholder:text-sky-500/50 rounded-lg focus:ring-2 focus:ring-[#ebf6b5]/40 focus:border-[#d4e88e] outline-none transition-all"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleAddLink}
                  disabled={!newLink.trim()}
                  className="h-9 shrink-0 px-3 text-xs font-medium text-sky-700 dark:text-sky-300 bg-[#ebf6b5]/60 dark:bg-[#ebf6b5]/15 hover:bg-[#ebf6b5] dark:hover:bg-[#ebf6b5]/25 border border-[#d4e88e]/50 dark:border-[#ebf6b5]/20 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  Attach Link
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-wrap gap-2">
        <AnimatePresence mode="popLayout">
          {links.map((link) => (
            <motion.div
              key={link.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="group flex items-center gap-1.5 pl-3 pr-1.5 py-1 bg-white dark:bg-gray-900 border border-sky-100 dark:border-gray-800 rounded-full shadow-xs hover:border-sky-300 dark:hover:border-sky-500 transition-all max-w-[200px]"
            >
              <HugeIcon name="Link" size={14} className="h-3.5 w-3.5 text-sky-500 flex-shrink-0" />
              <span className="text-[11px] font-medium text-sky-700 dark:text-sky-300 truncate">
                {link.title || link.url.replace(/^https?:\/\/(www\.)?/, '')}
              </span>
              <button
                type="button"
                onClick={() => removeLink(link.id)}
                className="h-5 w-5 flex items-center justify-center rounded-full text-sky-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                title="Remove"
              >
                <HugeIcon name="Cancel01" size={12} className="h-3 w-3" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};
