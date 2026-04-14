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
        <label className="block text-[10px] font-bold text-sky-500/60 dark:text-sky-400/60 uppercase tracking-widest ml-1">
          Links
        </label>
        <button
          type="button"
          onClick={() => setIsAdding(!isAdding)}
          className={`text-[11px] font-bold flex items-center gap-1.5 px-2.5 py-1 rounded-full transition-all ${
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
            initial={{ opacity: 0, y: -10, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -10, height: 0 }}
            className="overflow-hidden"
          >
            <div className="space-y-2.5 p-3.5 bg-sky-50/50 dark:bg-gray-800/50 rounded-2xl border border-sky-100/60 dark:border-gray-700/50">
              <div className="grid grid-cols-2 gap-2">
                <Input
                  type="url"
                  value={newLink}
                  onChange={(e) => setNewLink(e.target.value)}
                  placeholder="Paste URL..."
                  className="h-9 px-3 text-xs bg-white dark:bg-gray-900 border border-sky-100 dark:border-gray-700 text-sky-800 dark:text-sky-100 placeholder:text-sky-200 dark:placeholder:text-sky-700 rounded-xl focus:ring-2 focus:ring-[#ebf6b5]/40 focus:border-[#d4e88e] outline-none transition-all"
                />
                <Input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Label (e.g. Canvas)"
                  className="h-9 px-3 text-xs bg-white dark:bg-gray-900 border border-sky-100 dark:border-gray-700 text-sky-800 dark:text-sky-100 placeholder:text-sky-200 dark:placeholder:text-sky-700 rounded-xl focus:ring-2 focus:ring-[#ebf6b5]/40 focus:border-[#d4e88e] outline-none transition-all"
                />
              </div>
              <button
                type="button"
                onClick={handleAddLink}
                disabled={!newLink.trim()}
                className="w-full h-9 text-[11px] font-bold text-sky-700 dark:text-sky-300 bg-[#ebf6b5] dark:bg-[#ebf6b5]/20 hover:bg-[#d4e88e] dark:hover:bg-[#ebf6b5]/30 border border-[#d4e88e]/50 dark:border-[#ebf6b5]/30 rounded-xl disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm shadow-lime-900/5"
              >
                Attach Link
              </button>
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
              className="group flex items-center gap-1.5 pl-3 pr-1.5 py-1.5 bg-white dark:bg-gray-900 border border-sky-100 dark:border-gray-800 rounded-2xl shadow-sm hover:border-sky-300 dark:hover:border-sky-500 transition-all max-w-[200px]"
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
