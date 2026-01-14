import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
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
import IconTabOpen from './glass-icons/IconTabOpen';
import IconCircleCopyPlus from './glass-icons/IconCircleCopyPlus';
import IconMessageSquare from './glass-icons/IconMessageSquare';
import { useAI } from '@/context/AIContext';

export default function DockNav() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, signOut } = useAuth() || {};
  const { openSearch } = useSearch();
  const { isAIAssistantOpen, setAIAssistantOpen } = useAI();
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
      onClick: () => router.push(user ? '/dashboard' : '/'),
      priority: 'essential', // Always show
      isActive: pathname === '/dashboard' || pathname === '/'
    },
    {
      icon: <IconTabOpen />,
      label: 'Login',
      onClick: () => router.push('/login'),
      priority: 'essential'
    },
    {
      icon: <IconCircleCopyPlus />,
      label: 'Sign Up',
      onClick: () => router.push('/signup'),
      priority: 'essential'
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
        setAIAssistantOpen(!isAIAssistantOpen);
      },
      priority: 'essential',
      isActive: isAIAssistantOpen
    },
    {
      icon: <IconCalendar />,
      label: 'Calendar',
      onClick: () => router.push('/calendar'),
      priority: 'essential',
      isActive: pathname === '/calendar'
    },
    {
      icon: <IconBookOpen />,
      label: 'Flashcards',
      onClick: () => router.push('/flashcards'),
      priority: 'important', // Hide on very small screens
      isActive: pathname === '/flashcards'
    },
    {
      icon: <IconGrid2 />,
      label: "Interactive Quizzes",
      onClick: () => router.push('/quiz'),
      priority: 'important',
      isActive: pathname === '/quiz'
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
      priority: 'important',
      isActive: pathname === '/web-saves'
    },
    {
      icon: <IconPen />,
      label: 'Writing Assist',
      onClick: () => router.push('/writing-assist'),
      priority: 'important',
      isActive: pathname === '/writing-assist'
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
      priority: 'important',
      isActive: pathname === '/groups'
    },
    {
      icon: <IconMessageSquare />,
      label: 'Discussion Boards',
      onClick: () => {
        if (!user) {
          router.push('/login');
          return;
        }
        router.push('/discussions');
      },
      priority: 'important',
      isActive: pathname === '/discussions'
    },
    {
      icon: <IconBox />,
      label: "Games",
      onClick: () => router.push('/games'),
      priority: 'optional', // Hide on mobile
      isActive: pathname === '/games'
    },
    {
      icon: <IconProgressBar />,
      label: 'Study Timer',
      onClick: () => setIsStudyTimerOpen(true),
      isActive: isStudyTimerOpen,
      priority: 'important'
    },
    {
      icon: <IconFile />,
      label: "Changelog",
      onClick: () => router.push('/changelog'),
      priority: 'optional',
      isActive: pathname === '/changelog'
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
      priority: 'essential',
      isActive: pathname === '/settings'
    },
  ];

  // Filter items based on screen size and authentication
  const items = allItems.filter(item => {
    if (!user) {
      // Not signed in: only show home, login, signup, changelog
      const itemLabel = item.label;
      return itemLabel === 'Home' || itemLabel === 'Login' || itemLabel === 'Sign Up' || itemLabel === 'Changelog';
    }

    // Signed in: exclude login and signup items
    const itemLabel = item.label;
    if (itemLabel === 'Login' || itemLabel === 'Sign Up') {
      return false;
    }

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
      <AIAssistant isOpen={isAIAssistantOpen} onClose={() => setAIAssistantOpen(false)} />
      <StudyTimer trigger={<div />} isOpen={isStudyTimerOpen} onOpenChange={setIsStudyTimerOpen} />
    </>
  );
}