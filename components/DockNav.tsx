import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Sparkles, Calendar, BookOpen, Link2, Timer, Users, FileText, LogOut, LogIn, Settings, PenLine } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useSearch } from '@/context/SearchContext';
import Dock from './Dock';
import { AIAssistant } from './AIAssistant';
import { StudyTimer } from './StudyTimer';
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
import IconGrid2 from './glass-icons/IconGrid2';
import IconPen from './glass-icons/IconPen';

export default function DockNav() {
  const router = useRouter();
  const { user, signOut } = useAuth() || {};
  const { openSearch } = useSearch();
  const [isAIAssistantOpen, setIsAIAssistantOpen] = useState(false);
  const [isStudyTimerOpen, setIsStudyTimerOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isVerySmall, setIsVerySmall] = useState(false);

  // Track screen size for responsive item visibility
  useEffect(() => {
    const checkScreenSize = () => {
      const width = window.innerWidth;
      setIsMobile(width < 768);
      setIsVerySmall(width < 640);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  const allItems = [
    {
      icon: <IconHouse />,
      label: 'Home',
      onClick: () => router.push('/dashboard'),
      priority: 'essential' // Always show
    },
    {
      icon: <IconMagnifier />,
      label: 'Search',
      onClick: openSearch,
      priority: 'essential'
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
      },
      priority: 'essential'
    },
    {
      icon: <IconCalendar />,
      label: 'Calendar',
      onClick: () => router.push('/calendar'),
      priority: 'essential'
    },
    {
      icon: <IconBookOpen />,
      label: 'Flashcards',
      onClick: () => router.push('/flashcards'),
      priority: 'important' // Hide on very small screens
    },
    {
      icon: <IconGrid2 />,
      label: "Interactive Quizzes",
      onClick: () => router.push('/quiz'),
      priority: 'important'
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
      },
      priority: 'important'
    },
    {
      icon: <IconPen />,
      label: 'Writing Assist',
      onClick: () => router.push('/writing-assist'),
      priority: 'important'
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
      },
      priority: 'important'
    },
    {
      icon: <IconBox />,
      label: "Games",
      onClick: () => router.push('/games'),
      priority: 'optional' // Hide on mobile
    },
    {
      icon: <IconProgressBar />,
      label: 'Study Timer',
      onClick: () => setIsStudyTimerOpen(true),
      priority: 'important'
    },
    {
      icon: <IconFile />,
      label: "Changelog",
      onClick: () => router.push('/changelog'),
      priority: 'optional'
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
      },
      priority: 'essential'
    },
  ];

  // Filter items based on screen size
  const items = allItems.filter(item => {
    if (isVerySmall) {
      // Very small screens: only essential items
      return item.priority === 'essential';
    } else if (isMobile) {
      // Mobile screens: essential + important items
      return item.priority === 'essential' || item.priority === 'important';
    }
    // Desktop: show all items
    return true;
  });

  return (
    <>
      <Dock
        items={items}
        panelHeight={68}
        baseItemSize={50}
        magnification={70}
      />
      <AIAssistant isOpen={isAIAssistantOpen} onClose={() => setIsAIAssistantOpen(false)} />
      <StudyTimer trigger={<div />} isOpen={isStudyTimerOpen} onOpenChange={setIsStudyTimerOpen} />
    </>
  );
}