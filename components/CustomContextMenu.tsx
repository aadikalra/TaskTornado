
'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Home, 
  Settings, 
  Calendar, 
  FileText, 
  Brain, 
  Users, 
  Zap,
  Heart,
  Shield,
  Terminal
} from 'lucide-react';
import { useRouter } from 'next/navigation';

interface CustomContextMenuProps {
  x: number;
  y: number;
  onClose: () => void;
}

export const CustomContextMenu: React.FC<CustomContextMenuProps> = ({ x, y, onClose }) => {
  const menuRef = React.useRef<HTMLDivElement>(null);
  const router = useRouter();

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

  const menuItems = [
    // Main Navigation
    { label: 'Dashboard', icon: Zap, action: () => router.push('/dashboard'), description: 'Your personal dashboard' },
    
    // Academic Tools
    { label: 'Tests', icon: FileText, action: () => router.push('/tests'), description: 'Manage your tests' },
    { label: 'Calendar', icon: Calendar, action: () => router.push('/calendar'), description: 'View your calendar' },
    { label: 'Flashcards', icon: Brain, action: () => router.push('/flashcards'), description: 'Study with flashcards' },
    { label: 'Groups', icon: Users, action: () => router.push('/groups'), description: 'Study groups' },
    
    // Tools & Features
    { label: 'Web Saves', icon: Heart, action: () => router.push('/web-saves'), description: 'Saved web content' },
    { label: 'Games', icon: Terminal, action: () => router.push('/games'), description: 'Educational games' },
    
    // Settings & Info
    { label: 'Settings', icon: Settings, action: () => router.push('/settings'), description: 'App settings' },
    { label: 'Changelog', icon: Terminal, action: () => router.push('/changelog'), description: 'What\'s new' },
  ];

  return (
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
          
          <div className="border-t border-gray-200 dark:border-gray-800 px-3 py-2">
            <div className="text-xs text-gray-400 dark:text-gray-500 flex items-center gap-2">
              <Shield className="w-3 h-3" />
              Press ESC to close
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
