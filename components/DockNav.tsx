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
import IconQuestion from './glass-icons/IconQuestions';
import { useAI } from '@/context/AIContext';
import IconBlog from './glass-icons/IconBlog';
import IconTranslate from './glass-icons/IconTranslate';

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
    // --- CORE GROUP ---
    {
      icon: <IconHouse />,
      label: 'Home',
      onClick: () => router.push(user ? '/dashboard' : '/'),
      priority: 'essential',
      isActive: pathname === '/dashboard' || pathname === '/',
      group: 'core'
    },
    {
      icon: <IconMagnifier />,
      label: 'Search',
      onClick: openSearch,
      priority: 'essential',
      group: 'core'
    },
    {
      icon: <IconSparkle />,
      label: 'Aurora',
      onClick: () => {
        if (!user) {
          router.push('/login');
          return;
        }
        setAIAssistantOpen(!isAIAssistantOpen);
      },
      priority: 'essential',
      isActive: isAIAssistantOpen,
      group: 'core'
    },
    {
      icon: <IconCalendar />,
      label: 'Calendar',
      onClick: () => router.push('/calendar'),
      priority: 'essential',
      isActive: pathname === '/calendar',
      group: 'core'
    },

    // --- TOOLS GROUP ---
    {
      icon: <IconBookOpen />,
      label: 'Flashcards',
      onClick: () => router.push('/flashcards'),
      priority: 'important',
      isActive: pathname === '/flashcards',
      group: 'tools'
    },
    {
      icon: <IconGrid2 />,
      label: "Interactive Quizzes",
      onClick: () => router.push('/quiz'),
      priority: 'important',
      isActive: pathname === '/quiz',
      group: 'tools'
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
      isActive: pathname === '/web-saves',
      group: 'tools'
    },
    {
      icon: <IconPen />,
      label: 'Writing Assist',
      onClick: () => router.push('/writing-assist'),
      priority: 'important',
      isActive: pathname === '/writing-assist',
      group: 'tools'
    },
    {
      icon: <IconTranslate />,
      label: 'Translate',
      onClick: () => {
        if (!user) {
          router.push('/login');
          return;
        }
        router.push('/translate');
      },
      priority: 'important',
      isActive: pathname === '/translate',
      group: 'tools'
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
      isActive: pathname === '/groups',
      group: 'tools'
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
      isActive: pathname === '/discussions',
      group: 'tools'
    },
    {
      icon: <IconBox />,
      label: "Games",
      onClick: () => router.push('/games'),
      priority: 'optional',
      isActive: pathname === '/games',
      group: 'tools'
    },
    {
      icon: <IconProgressBar />,
      label: 'Study Timer',
      onClick: () => setIsStudyTimerOpen(true),
      isActive: isStudyTimerOpen,
      priority: 'important',
      group: 'tools'
    },

    // --- SYSTEM / ACCOUNT GROUP ---
    {
      icon: <IconQuestion />,
      label: 'Tutorials',
      onClick: () => { router.push('/tutorials') },
      priority: 'essential',
      isActive: pathname === '/tutorials',
      group: 'system'
    },
    {
      icon: <IconBlog />,
      label: 'Blog',
      onClick: () => { router.push('/blog') },
      priority: 'important',
      isActive: pathname.startsWith('/blog'),
      group: 'system'
    },
    {
      icon: <IconTabOpen />,
      label: 'Login',
      onClick: () => router.push('/login'),
      priority: 'essential',
      group: 'system'
    },
    {
      icon: <IconCircleCopyPlus />,
      label: 'Sign Up',
      onClick: () => router.push('/signup'),
      priority: 'essential',
      group: 'system'
    },
    {
      icon: <IconFile />,
      label: "Changelog",
      onClick: () => router.push('/changelog'),
      priority: 'optional',
      isActive: pathname === '/changelog',
      group: 'system'
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
      isActive: pathname === '/settings',
      group: 'system'
    },
  ];

  // Filter items based on screen size and authentication
  const filteredItems = allItems.filter(item => {
    if (!user) {
      // Not signed in: show public links
      const itemLabel = item.label;
      return itemLabel === 'Home' || itemLabel === 'Login' || itemLabel === 'Sign Up' || itemLabel === 'Changelog' || itemLabel === 'Blog' || itemLabel === 'Tutorials';
    }

    // Signed in: exclude login and signup items
    const itemLabel = item.label;
    if (itemLabel === 'Login' || itemLabel === 'Sign Up') {
      return false;
    }

    if (isVerySmall) {
      return item.priority === 'essential';
    } else if (isMobile) {
      return item.priority === 'essential' || item.priority === 'important';
    }
    return true;
  });

  // Inject dividers between groups
  const itemsWithDividers: (any & { group?: string })[] = [];
  let currentGroup: string | null = null;

  filteredItems.forEach((item) => {
    if (currentGroup && item.group !== currentGroup) {
      itemsWithDividers.push({ type: 'divider' });
    }
    itemsWithDividers.push(item);
    currentGroup = (item as any).group || null;
  });

  const items = itemsWithDividers;

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