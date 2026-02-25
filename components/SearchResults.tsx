'use client';

import { useState, useEffect } from 'react';
import { useSearch } from '@/context/SearchContext';
import { useClassContext } from '@/context/ClassContext';
import {
  Search, BookOpen, GraduationCap, FileText, Presentation, Target,
  Zap, CheckCircle, Home, Calendar, BarChart, Settings, Users, Shield,
  PenTool, Bookmark, HelpCircle, Scroll, User, History,
  CreditCard, Gamepad2, Trophy, MessageSquare, Video,  CornerDownLeft,
  Calculator, Languages, Newspaper, Fingerprint,  Star, Repeat, ClipboardList, Sparkles
} from 'lucide-react';
import Link from 'next/link';
import Cookies from 'js-cookie';
import { useTheme } from 'next-themes';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/animate-ui/components/buttons/button';

// Test Type Icons
const getTestTypeIcon = (testType: string) => {
  const type = testType?.toLowerCase() || '';
  switch (type) {
    case 'alpha':
      return { icon: Target, color: 'text-purple-500 dark:text-purple-400' };
    case 'beta':
      return { icon: Zap, color: 'text-orange-500 dark:text-orange-400' };
    case 'quiz':
      return { icon: FileText, color: 'text-blue-500 dark:text-blue-400' };
    case 'exam':
    case 'midterm':
    case 'final':
      return { icon: GraduationCap, color: 'text-red-500 dark:text-red-400' };
    case 'project':
    case 'presentation':
      return { icon: Presentation, color: 'text-green-500 dark:text-green-400' };
    default:
      return { icon: BookOpen, color: 'text-gray-500 dark:text-gray-400' };
  }
};

// Default search route shortcuts
const routeSearchItems = [
  // ── Core ──
  { title: 'Dashboard', href: '/dashboard', icon: Home, keywords: ['home', 'dashboard', 'overview', 'main'] },
  { title: 'Tests', href: '/tests', icon: GraduationCap, keywords: ['tests', 'exams', 'quiz', 'assessments'] },
  { title: 'Interactive Quizzes', href: '/quiz', icon: FileText, keywords: ['quiz', 'quizzes', 'interactive', 'practice', 'study'] },
  { title: 'Calendar', href: '/calendar', icon: Calendar, keywords: ['calendar', 'schedule', 'events', 'dates', 'planner'] },
  { title: 'Discussion Boards', href: '/discussions', icon: MessageSquare, keywords: ['discussion', 'boards', 'forums', 'community', 'threads', 'chat'] },
  { title: 'Flashcards', href: '/flashcards', icon: CreditCard, keywords: ['flashcards', 'study', 'memorize', 'cards', 'review'] },
  { title: 'Groups', href: '/groups', icon: Users, keywords: ['groups', 'study groups', 'collaborate', 'team'] },

  // ── Tools ──
  { title: 'Writing Assist', href: '/writing-assist', icon: PenTool, keywords: ['writing', 'essay', 'assist', 'compose', 'editor'] },
  { title: 'Web Saves', href: '/web-saves', icon: Bookmark, keywords: ['web saves', 'links', 'bookmarks', 'saved'] },
  { title: 'Grade Calculator', href: '/grade-calculator', icon: Calculator, keywords: ['grade', 'calculator', 'gpa', 'grades', 'score', 'average'] },
  { title: 'Translate', href: '/translate', icon: Languages, keywords: ['translate', 'translation', 'language', 'languages', 'convert'] },

  // ── Games ──
  { title: 'Games', href: '/games', icon: Gamepad2, keywords: ['games', 'play', 'fun'] },
  { title: 'Snake Game', href: '/snake', icon: Trophy, keywords: ['snake', 'game', 'arcade'] },
  { title: 'Task Tower', href: '/task-tower', icon: BarChart, keywords: ['task tower', 'tower', 'productivity'] },

  // ── Tutorials ──
  { title: 'Tutorials', href: '/tutorials', icon: Video, keywords: ['tutorials', 'guides', 'help', 'learn', 'how to'] },
  { title: 'Aurora Assistant Tutorial', href: '/tutorials/aurora-assistant', icon: Sparkles, keywords: ['aurora', 'assistant', 'ai', 'tutorial', 'guide'] },
  { title: 'Onboarding Tutorial', href: '/tutorials/onboarding', icon: Video, keywords: ['onboarding', 'getting started', 'tutorial', 'setup'] },
  { title: 'Recurring Homeworks Tutorial', href: '/tutorials/recurring-homeworks', icon: Repeat, keywords: ['recurring', 'homework', 'repeat', 'tutorial'] },
  { title: 'Starring Homeworks Tutorial', href: '/tutorials/starring-homeworks', icon: Star, keywords: ['starring', 'pin', 'favorite', 'homework', 'tutorial'] },
  { title: 'Test Details Tutorial', href: '/tutorials/test-details', icon: ClipboardList, keywords: ['test', 'details', 'view', 'tutorial'] },

  // ── Info & Legal ──
  { title: 'Blog', href: '/blog', icon: Newspaper, keywords: ['blog', 'articles', 'journal', 'news', 'posts'] },
  { title: 'FaceHash', href: '/hash', icon: Fingerprint, keywords: ['facehash', 'hash', 'face', 'identity'] },
  { title: 'AI Guidelines', href: '/ai-guidelines', icon: HelpCircle, keywords: ['ai', 'guidelines', 'rules', 'safety'] },
  { title: 'About Creator', href: '/about-creator', icon: User, keywords: ['about', 'creator', 'developer'] },
  { title: 'Changelog', href: '/changelog', icon: History, keywords: ['changelog', 'updates', 'version', 'release notes'] },
  { title: 'Guardians', href: '/guardians', icon: Shield, keywords: ['guardians', 'parents', 'family'] },
  { title: 'Teachers', href: '/teachers', icon: GraduationCap, keywords: ['teachers', 'educators', 'instructors'] },
  { title: 'Settings', href: '/settings', icon: Settings, keywords: ['settings', 'preferences', 'account', 'profile'] },
  { title: 'Privacy Policy', href: '/legal/privacy', icon: Shield, keywords: ['privacy', 'policy', 'data'] },
  { title: 'Terms of Service', href: '/legal/terms', icon: Scroll, keywords: ['terms', 'service', 'legal'] },
];

export function SearchResults() {
  const { query, setQuery, closeSearch } = useSearch();
  const { classes, homeworks, tests } = useClassContext();
  const { theme } = useTheme();
  const router = useRouter();
  const [colorMap, setColorMap] = useState<{ [key: string]: string }>({});
  const isDark = theme === 'dark';

  // Load class badge colors
  useEffect(() => {
    const cookieColors = Cookies.get('classColors');
    if (cookieColors) {
      try {
        setColorMap(JSON.parse(cookieColors));
      } catch (e) {
        console.error('Error parsing classColors cookie:', e);
      }
    }
  }, []);

  // ENTER-to-go-first-result
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && query.trim()) {
        e.preventDefault();
        const term = query.toLowerCase();

        const matchRoute = routeSearchItems.find(item =>
          item.title.toLowerCase().includes(term) ||
          item.keywords.some(k => k.includes(term))
        );

        if (matchRoute) {
          router.push(matchRoute.href);
          closeSearch();
          return;
        }

        const hw = homeworks.filter(h =>
          h.title.toLowerCase().includes(term) ||
          h.description?.toLowerCase().includes(term) ||
          classes.find(c => c.id === h.classId)?.name.toLowerCase().includes(term)
        );
        if (hw.length) {
          router.push(`/homework/${hw[0].id}`);
          closeSearch();
          return;
        }

        const ts = tests.filter(t =>
          t.title.toLowerCase().includes(term) ||
          t.description?.toLowerCase().includes(term) ||
          classes.find(c => c.id === t.classId)?.name.toLowerCase().includes(term) ||
          t.testType?.toLowerCase().includes(term)
        );
        if (ts.length) {
          router.push(`/tests/${ts[0].id}`);
          closeSearch();
          return;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [query, homeworks, tests, classes, router, closeSearch]);

  if (!query.trim()) {
    return (
      <div className="flex flex-col items-center text-center py-8">
        <Search className="h-8 w-8 text-gray-300 dark:text-gray-600" />
        <p className="mt-2 text-gray-500 dark:text-gray-400 text-sm">
          Search assignments, tests, or pages
        </p>
      </div>
    );
  }

  const term = query.toLowerCase();

  const filteredRoutes = routeSearchItems.filter(item =>
    item.title.toLowerCase().includes(term) ||
    item.keywords.some(k => k.includes(term))
  );

  const filteredHomeworks = homeworks.filter(h =>
    h.title.toLowerCase().includes(term) ||
    h.description?.toLowerCase().includes(term) ||
    classes.find(c => c.id === h.classId)?.name.toLowerCase().includes(term)
  );

  const filteredTests = tests.filter(t =>
    t.title.toLowerCase().includes(term) ||
    t.description?.toLowerCase().includes(term) ||
    classes.find(c => c.id === t.classId)?.name.toLowerCase().includes(term) ||
    t.testType?.toLowerCase().includes(term)
  );

  const hasResults =
    filteredRoutes.length ||
    filteredHomeworks.length ||
    filteredTests.length;

  if (!hasResults) {
    return (
      <div className="py-16 px-6 text-center flex flex-col items-center justify-center">
        <h3 className="text-gray-900 dark:text-gray-100 font-semibold text-lg mb-1">
          No results found
        </h3>

        <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-xs mx-auto text-sm">
          "{query}" did not match any classes, assignments, or tests.
        </p>

        <Button
          variant="outline"
          size="sm"
          onClick={() => setQuery('')}
        >
          Clear search
        </Button>
      </div>
    );
  }

  return (
    <div className="pb-2">
      {/* ROUTES / PAGES */}
      {filteredRoutes.length > 0 && (
        <div className="py-2">
          <div className="px-4 py-2 text-xs font-medium text-gray-500 flex justify-between items-center bg-gray-50/50 dark:bg-neutral-800/30 mb-1">
            <span>Pages</span>
            {query === '' && (
              <span className="text-gray-400 cursor-pointer hover:text-gray-600 dark:hover:text-gray-200 underline">
                Customize
              </span>
            )}
          </div>

          <div className="flex flex-col">
            {filteredRoutes.map((route) => {
              const Icon = route.icon;
              return (
                <Link
                  key={route.href}
                  href={route.href}
                  onClick={closeSearch}
                  className="group px-4 py-2 flex items-center gap-4 cursor-default transition-colors hover:bg-gray-100/60 dark:hover:bg-neutral-800/60"
                >
                  {/* Icon Box */}
                  <div className="p-2 bg-white dark:bg-neutral-800 border border-gray-100 dark:border-gray-700 rounded-lg shadow-sm shrink-0">
                    <Icon className="w-5 h-5 text-gray-500 dark:text-gray-400" strokeWidth={1.5} />
                  </div>

                  {/* Text Content */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-sm text-gray-900 dark:text-gray-100 truncate">
                      {route.title}
                    </h3>
                    <p className="text-xs text-gray-400 dark:text-gray-500 truncate">
                      Navigate to {route.title.toLowerCase()}
                    </p>
                  </div>

                  {/* "Jump to" Button (Visible on group hover) */}
                  <div className="hidden group-hover:flex items-center gap-2 text-gray-400 dark:text-gray-500 text-[10px] font-semibold bg-white dark:bg-neutral-700 px-2 py-1 rounded shadow-sm border border-gray-100 dark:border-gray-600">
                    Jump to...
                    <CornerDownLeft className="w-2.5 h-2.5" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* HOMEWORKS / ASSIGNMENTS */}
      {filteredHomeworks.length > 0 && (
        <div className="py-2">
          <div className="px-4 py-2 text-xs font-medium text-gray-500 bg-gray-50/50 dark:bg-neutral-800/30 mb-1">
            Assignments
          </div>

          <div className="flex flex-col">
            {filteredHomeworks.map((hw) => {
              const c = classes.find((x) => x.id === hw.classId);
              const color = c ? colorMap[c.id] ?? '#808080' : '#808080';

              return (
                <Link
                  key={hw.id}
                  href={`/homework/${hw.id}`}
                  onClick={closeSearch}
                  className="group px-4 py-2 flex items-center gap-4 cursor-default transition-colors hover:bg-gray-100/60 dark:hover:bg-neutral-800/60"
                >
                  {/* Icon Box */}
                  <div className="p-2 bg-white dark:bg-neutral-800 border border-gray-100 dark:border-gray-700 rounded-lg shadow-sm shrink-0">
                    {hw.completed ? (
                      <CheckCircle className="w-5 h-5 text-green-500" strokeWidth={1.5} />
                    ) : (
                      <div
                        className="w-5 h-5 rounded-full border-2"
                        style={{ borderColor: color, opacity: 0.6 }}
                      />
                    )}
                  </div>

                  {/* Text Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium text-sm text-gray-900 dark:text-gray-100 truncate">
                        {hw.title}
                      </h3>
                      {c && (
                        <span
                          className="text-[10px] px-1.5 py-0.5 rounded-full border shrink-0 ml-2"
                          style={{ borderColor: `${color}44`, color: color, background: `${color}11` }}
                        >
                          {c.name}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 dark:text-gray-500 truncate">
                      Due: {new Date(hw.dueDate).toLocaleDateString()} • {hw.description || 'No description'}
                    </p>
                  </div>

                  {/* "Jump to" Button */}
                  <div className="hidden group-hover:flex items-center gap-2 text-gray-400 dark:text-gray-500 text-[10px] font-semibold bg-white dark:bg-neutral-700 px-2 py-1 rounded shadow-sm border border-gray-100 dark:border-gray-600">
                    View task
                    <CornerDownLeft className="w-2.5 h-2.5" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* TESTS / EXAMS */}
      {filteredTests.length > 0 && (
        <div className="py-2">
          <div className="px-4 py-2 text-xs font-medium text-gray-500 bg-gray-50/50 dark:bg-neutral-800/30 mb-1">
            Tests & Exams
          </div>

          <div className="flex flex-col">
            {filteredTests.map((t) => {
              const c = classes.find((x) => x.id === t.classId);
              const { icon: TestIcon, color: testColorIcon } = getTestTypeIcon(t.testType);
              const badgeColor = c ? colorMap[c.id] ?? '#808080' : '#808080';

              return (
                <Link
                  key={t.id}
                  href={`/tests/${t.id}`}
                  onClick={closeSearch}
                  className="group px-4 py-2 flex items-center gap-4 cursor-default transition-colors hover:bg-gray-100/60 dark:hover:bg-neutral-800/60"
                >
                  {/* Icon Box */}
                  <div className="p-2 bg-white dark:bg-neutral-800 border border-gray-100 dark:border-gray-700 rounded-lg shadow-sm shrink-0">
                    <TestIcon className={`w-5 h-5 ${testColorIcon}`} strokeWidth={1.5} />
                  </div>

                  {/* Text Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium text-sm text-gray-900 dark:text-gray-100 truncate">
                        {t.title}
                      </h3>
                      {c && (
                        <span
                          className="text-[10px] px-1.5 py-0.5 rounded-full border shrink-0 ml-2"
                          style={{ borderColor: `${badgeColor}44`, color: badgeColor, background: `${badgeColor}11` }}
                        >
                          {c.name}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 dark:text-gray-500 truncate">
                      {t.testType} • {new Date(t.testDate).toLocaleDateString()} {t.testTime && `at ${t.testTime}`}
                    </p>
                  </div>

                  {/* "Jump to" Button */}
                  <div className="hidden group-hover:flex items-center gap-2 text-gray-400 dark:text-gray-500 text-[10px] font-semibold bg-white dark:bg-neutral-700 px-2 py-1 rounded shadow-sm border border-gray-100 dark:border-gray-600">
                    View test
                    <CornerDownLeft className="w-2.5 h-2.5" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}