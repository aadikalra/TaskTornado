
'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import IconHouse from './glass-icons/IconHouse';
import IconGear from './glass-icons/IconGear';
import IconCalendar from './glass-icons/IconCalendar';
import IconBookOpen from './glass-icons/IconBookOpen';
import IconUsers from './glass-icons/IconUsers';
import IconPin from './glass-icons/IconPin';
import IconBox from './glass-icons/IconBox';
import IconFile from './glass-icons/IconFile';
import IconProgressBar from './glass-icons/IconProgressBar';
import IconSparkle from './glass-icons/IconSparkle';

interface CustomContextMenuProps {
  x: number;
  y: number;
  onClose: () => void;
  onDictionaryOpen?: (word: string) => void;
  hasSelection?: boolean;
  selectedText?: string;
}

export const CustomContextMenu: React.FC<CustomContextMenuProps> = ({ x, y, onClose, onDictionaryOpen, hasSelection, selectedText }) => {
  const menuRef = React.useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { user, loading } = useAuth();

  // Check if selected text is just one word
  const isSingleWord = hasSelection && selectedText ? selectedText.trim().split(/\s+/).length === 1 : false;

  // Menu items for logged out users - encouraging signup/login
  const loggedOutMenuItems = [
    // Dictionary - only show for single words (at top)
    ...(isSingleWord && selectedText && onDictionaryOpen ? [{
      label: 'Define',
      icon: IconBookOpen,
      action: () => {
        onClose();
        onDictionaryOpen(selectedText.trim());
      },
      description: `Define "${selectedText.trim()}"`
    }] : []),
    
    // Auth options with fun messages
    { 
      label: 'Login', 
      icon: IconUsers, 
      action: () => router.push('/login'), 
      description: '🚀 Unlock your superpowers!' 
    },
    { 
      label: 'Sign Up', 
      icon: IconSparkle, 
      action: () => router.push('/signup'), 
      description: '✨ Join the adventure!' 
    },
    
    // Preview features with encouraging messages
    { 
      label: 'Preview Dashboard', 
      icon: IconHouse, 
      action: () => {
        onClose();
        // Show a fun message instead of navigating
        alert('🎯 Want to see this amazing dashboard? Sign up to unlock your personal command center!');
      }, 
      description: '👀 Sneak peek (login required)' 
    },
    { 
      label: 'Preview Tests', 
      icon: IconProgressBar, 
      action: () => {
        onClose();
        alert('📚 Ace your tests! Sign up to track your academic journey and crush those exams!');
      }, 
      description: '🎓 Test your knowledge (login required)' 
    },
    { 
      label: 'Preview Calendar', 
      icon: IconCalendar, 
      action: () => {
        onClose();
        alert('📅 Never miss a deadline! Sign up to organize your schedule like a pro!');
      }, 
      description: '⏰ Plan your success (login required)' 
    },
    
    // Static info pages
    { label: 'Changelog', icon: IconFile, action: () => router.push('/changelog'), description: 'What\'s new' },
  ];

  // Menu items for logged in users (existing functionality)
  const loggedInMenuItems = [
    // Dictionary - only show for single words (at top)
    ...(isSingleWord && selectedText && onDictionaryOpen ? [{
      label: 'Define',
      icon: IconBookOpen,
      action: () => {
        onClose();
        onDictionaryOpen(selectedText.trim());
      },
      description: `Define "${selectedText.trim()}"`
    }] : []),

    // Main Navigation
    { label: 'Dashboard', icon: IconHouse, action: () => router.push('/dashboard'), description: 'Your personal dashboard' },

    // Academic Tools
    { label: 'Tests', icon: IconProgressBar, action: () => router.push('/tests'), description: 'Manage your tests' },
    { label: 'Calendar', icon: IconCalendar, action: () => router.push('/calendar'), description: 'View your calendar' },
    { label: 'Flashcards', icon: IconBookOpen, action: () => router.push('/flashcards'), description: 'Study with flashcards' },
    { label: 'Groups', icon: IconUsers, action: () => router.push('/groups'), description: 'Study groups' },

    // Tools & Features
    { label: 'Web Saves', icon: IconPin, action: () => router.push('/web-saves'), description: 'Saved web content' },
    { label: 'Games', icon: IconBox, action: () => router.push('/games'), description: 'Educational games' },

    // Settings & Info
    { label: 'Settings', icon: IconGear, action: () => router.push('/settings'), description: 'App settings' },
    { label: 'Changelog', icon: IconFile, action: () => router.push('/changelog'), description: 'What\'s new' },
  ];

  // Choose menu items based on auth state
  const menuItems = loading ? [] : (user ? loggedInMenuItems : loggedOutMenuItems);

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
                {menuItems.map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.03, duration: 0.1 }}
                    onClick={() => {
                      item.action();
                      onClose();
                    }}
                    className="flex items-center gap-3 px-3 py-2.5 text-sm text-gray-700 dark:text-gray-300 rounded-lg cursor-pointer transition-colors hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white group"
                    title={item.description}
                  >
                    <div className="w-4 h-4 flex items-center justify-center">
                      <item.icon />
                    </div>
                    <div className="flex-1">
                      <span className="font-medium">{item.label}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </>
  );
};
