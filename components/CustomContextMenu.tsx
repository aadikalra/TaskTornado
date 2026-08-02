'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { HugeIcon } from '@/lib/huge-icon-map';

interface CustomContextMenuProps {
  x: number;
  y: number;
  onClose: () => void;
  onDictionaryOpen?: (word: string) => void;
  hasSelection?: boolean;
  selectedText?: string;
  isAiChat?: boolean;
}

export const CustomContextMenu: React.FC<CustomContextMenuProps> = ({ x, y, onClose, onDictionaryOpen, hasSelection, selectedText, isAiChat }) => {
  const menuRef = React.useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { user, loading } = useAuth();
  const { info } = useToast();

  // Check if selected text is just one word
  const isSingleWord = hasSelection && selectedText ? selectedText.trim().split(/\s+/).length === 1 : false;

  // Dedicated context menu items ONLY for AI Chat
  const aiChatMenuItems = [
    // Define word if single word selected
    ...(isSingleWord && selectedText && onDictionaryOpen ? [{
      label: `Define "${selectedText.trim()}"`,
      icon: 'Cards01',
      action: () => {
        onClose();
        onDictionaryOpen(selectedText.trim());
      },
      description: `Define "${selectedText.trim()}"`
    }] : []),

    // Copy action
    {
      label: hasSelection ? 'Copy Selected Text' : 'Copy',
      icon: 'Copy01',
      action: () => {
        if (selectedText) {
          navigator.clipboard.writeText(selectedText);
          info('Copied', 'Selected text copied to clipboard 📋');
        } else {
          info('Copy', 'Highlight text to copy');
        }
      },
      description: 'Copy text to clipboard'
    },

    // Paste action into AI prompt input
    {
      label: 'Paste',
      icon: 'ClipboardPaste',
      action: async () => {
        try {
          const text = await navigator.clipboard.readText();
          if (text) {
            const textarea = document.querySelector<HTMLTextAreaElement>('[data-ai-chat-input]');
            if (textarea) {
              const start = textarea.selectionStart || 0;
              const end = textarea.selectionEnd || 0;
              const val = textarea.value;
              const newVal = val.substring(0, start) + text + val.substring(end);
              const setter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value')?.set;
              if (setter) {
                setter.call(textarea, newVal);
              } else {
                textarea.value = newVal;
              }
              textarea.dispatchEvent(new Event('input', { bubbles: true }));
              textarea.focus();
              textarea.setSelectionRange(start + text.length, start + text.length);
              info('Pasted', 'Clipboard text inserted 📋');
            }
          }
        } catch (err) {
          console.error('Paste error:', err);
        }
      },
      description: 'Paste clipboard content into prompt'
    },

    // Cut action (if text selection)
    ...(hasSelection ? [{
      label: 'Cut',
      icon: 'Scissors',
      action: () => {
        if (selectedText) {
          navigator.clipboard.writeText(selectedText);
          const textarea = document.querySelector<HTMLTextAreaElement>('[data-ai-chat-input]');
          if (textarea && document.activeElement === textarea) {
            const start = textarea.selectionStart || 0;
            const end = textarea.selectionEnd || 0;
            const val = textarea.value;
            const newVal = val.substring(0, start) + val.substring(end);
            const setter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value')?.set;
            if (setter) setter.call(textarea, newVal);
            else textarea.value = newVal;
            textarea.dispatchEvent(new Event('input', { bubbles: true }));
            textarea.focus();
          }
          info('Cut', 'Selection cut to clipboard ✂️');
        }
      },
      description: 'Cut selection to clipboard'
    }] : []),

    // Select All action
    {
      label: 'Select All',
      icon: 'SelectMultiple',
      action: () => {
        const textarea = document.querySelector<HTMLTextAreaElement>('[data-ai-chat-input]');
        if (textarea) {
          textarea.focus();
          textarea.select();
        }
      },
      description: 'Select prompt text'
    },

    { isDivider: true },

    // Clear prompt input
    {
      label: 'Clear Input',
      icon: 'Delete02',
      action: () => {
        const textarea = document.querySelector<HTMLTextAreaElement>('[data-ai-chat-input]');
        if (textarea) {
          const setter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value')?.set;
          if (setter) setter.call(textarea, '');
          else textarea.value = '';
          textarea.dispatchEvent(new Event('input', { bubbles: true }));
          textarea.focus();
        }
      },
      description: 'Clear prompt input'
    },
  ];

  // Menu items for logged out users - encouraging signup/login
  const loggedOutMenuItems = [
    // Dictionary - only show for single words (at top)
    ...(isSingleWord && selectedText && onDictionaryOpen ? [{
      label: 'Define',
      icon: 'Cards01',
      action: () => {
        onClose();
        onDictionaryOpen(selectedText.trim());
      },
      description: `Define "${selectedText.trim()}"`
    }] : []),

    // Auth options with fun messages
    {
      label: 'Login',
      icon: 'UserGroup03',
      action: () => router.push('/login'),
      description: '🚀 Unlock your superpowers!'
    },
    {
      label: 'Sign Up',
      icon: 'AiContentGenerator02',
      action: () => router.push('/signup'),
      description: '✨ Join the adventure!'
    },

    // Static info pages
    { label: 'Changelog', icon: 'GoogleDoc', action: () => router.push('/changelog'), description: 'What\'s new' },
    // Preview features with encouraging messages
    {
      label: 'You should def sign up! :)',
      action: () => {
        onClose();
      },
      description: '👀 Sneak peek (login required)'
    },
  ];

  // Menu items for logged in users (existing functionality)
  const loggedInMenuItems = [
    // Dictionary - only show for single words (at top)
    ...(isSingleWord && selectedText && onDictionaryOpen ? [{
      label: 'Define',
      icon: 'Cards01',
      action: () => {
        onClose();
        onDictionaryOpen(selectedText.trim());
      },
      description: `Define "${selectedText.trim()}"`
    }] : []),

    // Main Navigation
    { label: 'Dashboard', icon: 'Home02', action: () => router.push('/dashboard'), description: 'Your personal dashboard' },

    // Academic Tools
    { label: 'Calendar', icon: 'Calendar02', action: () => router.push('/calendar'), description: 'View your calendar' },
    { label: 'Discussion Boards', icon: 'Chat', action: () => router.push('/discussions'), description: 'Community forums' },
    { label: 'Flashcards', icon: 'Cards01', action: () => router.push('/flashcards'), description: 'Study with flashcards' },
    { label: 'Groups', icon: 'UserGroup03', action: () => router.push('/groups'), description: 'Study groups' },

    // Tools & Features
    { label: 'Web Saves', icon: 'Bookmark03', action: () => router.push('/web-saves'), description: 'Saved web content' },
    { label: 'Games', icon: 'Gameboy', action: () => router.push('/games'), description: 'Educational games' },

    // Settings & Info
    { label: 'Settings', icon: 'Settings02', action: () => router.push('/settings'), description: 'App settings' },
    { label: 'Changelog', icon: 'GoogleDoc', action: () => router.push('/changelog'), description: 'What\'s new' },
  ];

  // Common developer tool
  const devToolItem = {
    label: 'Developer Tools',
    icon: 'CommandLine',
    action: () => {
      const isDebug = document.body.classList.toggle('debug-mode');
      if (isDebug) {
        info('Developer Mode Enabled', 'Layout inspection active 🚀');
        console.log('%c[Developer Tools] Layout Inspection: ON', 'color: #275085; font-weight: bold; font-size: 14px;');
      } else {
        info('Developer Mode Disabled', 'Restoring normal view');
        console.log('%c[Developer Tools] Layout Inspection: OFF', 'color: #ef4444; font-weight: bold; font-size: 14px;');
      }
    },
    description: 'Toggle layout inspection'
  };

  // Choose menu items based on auth state and AI Chat context
  const baseItems = isAiChat
    ? aiChatMenuItems
    : (loading ? [] : (user ? loggedInMenuItems : loggedOutMenuItems));

  // Add dev tools only if not in AI Chat mode
  const menuItems = (!isAiChat && baseItems.length > 0) ? [...baseItems, { isDivider: true }, devToolItem] : baseItems;

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  return (
    <>
      <AnimatePresence>
        <motion.div
          ref={menuRef}
          initial={{ opacity: 0, scale: 0.95, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -10 }}
          transition={{ duration: 0.15, ease: 'easeOut' }}
          className="fixed z-50"
          style={{ top: y, left: x }}
        >
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-lg overflow-hidden min-w-[200px]">
            <div className="max-h-[400px] overflow-y-auto">
              <div className="p-1">
                {menuItems.map((item: any, index) => (
                  item.isDivider ? (
                    <div key={`divider-${index}`} className="h-px bg-gray-100 dark:bg-gray-800 my-1 mx-2" />
                  ) : (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.03, duration: 0.1 }}
                      onClick={() => {
                        item.action();
                        onClose();
                      }}
                      className="flex items-center gap-3 px-3 py-1.5 text-sm text-sky-600 dark:text-sky-400 rounded-lg cursor-pointer transition-colors hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-sky-700 dark:hover:text-sky-300 group"
                      title={item.description}
                    >
                      {item.icon && (
                        <div className="w-4 h-4 flex items-center justify-center">
                          <HugeIcon name={item.icon as any} size={16} className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                        </div>
                      )}
                      <div className="flex-1">
                        <span className="font-medium">{item.label}</span>
                      </div>
                    </motion.div>
                  )
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </>
  );
};
