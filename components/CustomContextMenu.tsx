
'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  Settings, 
  Calendar, 
  FileText, 
  Brain, 
  Users, 
  Zap,
  Heart,
  Terminal,
  BookOpen,
  X,
  Globe,
  Trophy,
  Gamepad2,
  ScrollText
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

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

  // Check if selected text is just one word
  const isSingleWord = hasSelection && selectedText ? selectedText.trim().split(/\s+/).length === 1 : false;

  const menuItems = [
    // Dictionary - only show for single words (at top)
    ...(isSingleWord && selectedText && onDictionaryOpen ? [{
      label: 'Define',
      icon: BookOpen,
      action: () => {
        onClose();
        onDictionaryOpen(selectedText.trim());
      },
      description: `Define "${selectedText.trim()}"`
    }] : []),
    
    // Main Navigation
    { label: 'Dashboard', icon: LayoutDashboard, action: () => router.push('/dashboard'), description: 'Your personal dashboard' },
    
    // Academic Tools
    { label: 'Tests', icon: Trophy, action: () => router.push('/tests'), description: 'Manage your tests' },
    { label: 'Calendar', icon: Calendar, action: () => router.push('/calendar'), description: 'View your calendar' },
    { label: 'Flashcards', icon: Brain, action: () => router.push('/flashcards'), description: 'Study with flashcards' },
    { label: 'Groups', icon: Users, action: () => router.push('/groups'), description: 'Study groups' },
    
    // Tools & Features
    { label: 'Web Saves', icon: Globe, action: () => router.push('/web-saves'), description: 'Saved web content' },
    { label: 'Games', icon: Gamepad2, action: () => router.push('/games'), description: 'Educational games' },
    
    // Settings & Info
    { label: 'Settings', icon: Settings, action: () => router.push('/settings'), description: 'App settings' },
    { label: 'Changelog', icon: ScrollText, action: () => router.push('/changelog'), description: 'What\'s new' },
  ];

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
                  <item.icon className="w-4 h-4 text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors" />
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
