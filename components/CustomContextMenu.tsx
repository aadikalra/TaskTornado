
'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { Home, Settings, Calendar } from 'lucide-react';
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

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  const menuItems = [
    { label: 'Home', icon: Home, action: () => router.push('/dashboard') },
    { label: 'Settings', icon: Settings, action: () => router.push('/settings') },
    { label: 'Calendar', icon: Calendar, action: () => router.push('/calendar') },
  ];

  return (
    <motion.div
      ref={menuRef}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.1 }}
      className="fixed z-50 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-2"
      style={{ top: y, left: x }}
    >
      <ul>
        {menuItems.map((item, index) => (
          <li
            key={index}
            onClick={() => {
              item.action();
              onClose();
            }}
            className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md cursor-pointer"
          >
            <item.icon className="w-4 h-4 mr-2" />
            {item.label}
          </li>
        ))}
      </ul>
    </motion.div>
  );
};
