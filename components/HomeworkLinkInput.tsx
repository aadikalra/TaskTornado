'use client';

import React, { useState } from 'react';
import { X, Plus, Link as LinkIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Links (Optional)</label>
        {!isAdding && (
          <button
            type="button"
            onClick={() => setIsAdding(true)}
            className="text-xs text-[#264f84] hover:text-[#1f3f6b] flex items-center"
          >
            <Plus className="h-3 w-3 mr-1" /> Add Link
          </button>
        )}
      </div>

      {isAdding && (
        <div className="space-y-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-600">
          <div className="space-y-2">
            <Input
              type="url"
              value={newLink}
              onChange={(e) => setNewLink(e.target.value)}
              placeholder="https://example.com"
              className="text-sm bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
            />
            <Input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Link title (optional)"
              className="text-sm bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
            />
          </div>
          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                setIsAdding(false);
                setNewLink('');
                setNewTitle('');
              }}
              className="text-xs h-8 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleAddLink}
              size="sm"
              className="bg-[#264f84] hover:bg-[#1f3f6b] text-white text-xs h-8"
              disabled={!newLink.trim()}
            >
              Add Link
            </Button>
          </div>
        </div>
      )}

      {links.length > 0 && (
        <div className="space-y-2 mt-2">
          {links.map((link) => (
            <div key={link.id} className="flex items-center justify-between group bg-gray-50 dark:bg-gray-700 p-2 rounded-md">
              <a
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-[#264f84] hover:underline flex items-center flex-1 min-w-0"
                title={link.url}
              >
                <LinkIcon className="h-3.5 w-3.5 mr-2 flex-shrink-0" />
                <span className="truncate">{link.title || link.url}</span>
              </a>
              <button
                type="button"
                onClick={() => removeLink(link.id)}
                className="text-gray-400 hover:text-red-500 dark:text-gray-500 dark:hover:text-red-400 p-1 -mr-1"
                title="Remove link"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
