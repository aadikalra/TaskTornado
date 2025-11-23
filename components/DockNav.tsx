import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Sparkles, Calendar, BookOpen, Link2, Timer, Users, FileText, LogOut, LogIn, Settings } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useSearch } from '@/context/SearchContext';
import Dock from './Dock';
import { AIAssistant } from './AIAssistant';
import { MinimalistTimer } from './MinimalistTimer';
import IconMagnifier from './glass-icons/IconMagnifier';
import IconSparkle from './glass-icons/IconSparkle';
import IconCalendar from './glass-icons/IconCalendar';
import IconBookOpen from './glass-icons/IconBookOpen';
import IconPin from './glass-icons/IconPin';
import IconUsers from './glass-icons/IconUsers';
import IconFile from './glass-icons/IconFile';
import IconHouse from './glass-icons/IconHouse';
import IconGear from './glass-icons/IconGear';
import IconProgressBar from './glass-icons/IconProgressBar';
import IconBox from './glass-icons/IconBox';

export default function DockNav() {
  const router = useRouter();
  const { user, signOut } = useAuth() || {};
  const { openSearch } = useSearch();
  const [isAIAssistantOpen, setIsAIAssistantOpen] = useState(false);
  const [isMinimalistTimerOpen, setIsMinimalistTimerOpen] = useState(false);

  const items = [
    {
      icon: <IconHouse />,
      label: 'Home',
      onClick: () => router.push('/dashboard')
    },
    {
      icon: <IconMagnifier />,
      label: 'Search',
      onClick: openSearch
    },
    {
      icon: <IconSparkle />,
      label: 'AI Assistant',
      onClick: () => {
        if (!user) {
          router.push('/login');
          return;
        }
        setIsAIAssistantOpen(prev => !prev);
      }
    },
    {
      icon: <IconCalendar />,
      label: 'Calendar',
      onClick: () => router.push('/calendar')
    },
    {
      icon: <IconBookOpen />,
      label: 'Flashcards',
      onClick: () => router.push('/flashcards')
    },
    {
      icon: <IconPin />,
      label: 'Web Saves',
      onClick: () => {
        if (!user) {
          router.push('/login');
          return;
        }
        router.push('/web-saves');
      }
    },
    {
      icon: <IconProgressBar />,
      label: 'Study Timer',
      onClick: () => setIsMinimalistTimerOpen(prev => !prev)
    },
    {
      icon: <IconUsers />,
      label: 'Group Chats',
      onClick: () => {
        if (!user) {
          router.push('/login');
          return;
        }
        router.push('/groups');
      }
    },
    {
      icon: <IconFile />,
      label: "What's New",
      onClick: () => router.push('/changelog')
    },
    {
      icon: <IconBox />,
      label: "Games",
      onClick: () => router.push('/games')
    },
    {
      icon: <IconGear />,
      label: 'Settings',
      onClick: () => {
        if (!user) {
          router.push('/login');
          return;
        }
        router.push('/settings');
      }
    },
  ];

  return (
    <>
      <Dock
        items={items}
        panelHeight={68}
        baseItemSize={50}
        magnification={70}
      />
      <AIAssistant isOpen={isAIAssistantOpen} onClose={() => setIsAIAssistantOpen(false)} />
      <MinimalistTimer
        isVisible={isMinimalistTimerOpen}
        onClose={() => setIsMinimalistTimerOpen(false)}
      />
    </>
  );
}