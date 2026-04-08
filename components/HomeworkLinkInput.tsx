'use client';

import React, { useState } from 'react';
import { HugeIcon } from '@/lib/huge-icon-map';
import { Input } from '@/components/ui/input';

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
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="block text-[11px] font-semibold text-sky-600 dark:text-sky-400 uppercase tracking-wider">Links <span className="text-sky-400 font-normal normal-case tracking-normal">(Optional)</span></label>
        {!isAdding && (
          <button
            type="button"
            onClick={() => setIsAdding(true)}
            className="text-xs font-semibold text-sky-500 hover:text-sky-600 flex items-center gap-1 transition-colors"
          >
            <HugeIcon name="PlusSign" size={12} className="h-3 w-3" /> Add Link
          </button>
        )}
      </div>

      {isAdding && (
        <div className="space-y-2 p-3 bg-sky-50 dark:bg-gray-800 rounded-xl border border-sky-100 dark:border-gray-700">
          <div className="space-y-2">
            <Input
              type="url"
              value={newLink}
              onChange={(e) => setNewLink(e.target.value)}
              placeholder="https://example.com"
              className="text-sm bg-white dark:bg-gray-900 border-sky-200 dark:border-gray-700 text-sky-900 dark:text-white placeholder-sky-400 dark:placeholder-sky-500 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
            />
            <Input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Link title (optional)"
              className="text-sm bg-white dark:bg-gray-900 border-sky-200 dark:border-gray-700 text-sky-900 dark:text-white placeholder-sky-400 dark:placeholder-sky-500 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
            />
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => {
                setIsAdding(false);
                setNewLink('');
                setNewTitle('');
              }}
              className="h-8 px-3 text-xs font-semibold text-sky-600 dark:text-sky-400 hover:text-sky-900 dark:hover:text-white hover:bg-sky-100 dark:hover:bg-gray-700 rounded-full transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleAddLink}
              disabled={!newLink.trim()}
              className="h-8 px-4 text-xs font-semibold text-sky-700 dark:text-sky-300 bg-[#ebf6b5]/60 dark:bg-[#ebf6b5]/10 hover:bg-[#ebf6b5] border border-[#d4e88e]/50 dark:border-[#d4e88e]/20 rounded-full disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Add Link
            </button>
          </div>
        </div>
      )}

      {links.length > 0 && (
        <div className="space-y-2 mt-2">
          {links.map((link, index) => (
            <div key={link.id || `link-input-${index}`} className="flex items-center justify-between group bg-sky-50 dark:bg-gray-800 p-2.5 rounded-xl border border-sky-100 dark:border-gray-700">
              <a
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-sky-600 hover:text-sky-700 hover:underline flex items-center flex-1 min-w-0"
                title={link.url}
              >
                <HugeIcon name="Globe" size={14} className="h-3.5 w-3.5 mr-2 flex-shrink-0 text-sky-500" />
                <span className="truncate">{link.title || link.url}</span>
              </a>
              <button
                type="button"
                onClick={() => removeLink(link.id)}
                className="text-sky-400 hover:text-red-500 dark:text-sky-500 dark:hover:text-red-400 p-1 -mr-1 transition-colors"
                title="Remove link"
              >
                <HugeIcon name="Cancel01" size={14} className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
