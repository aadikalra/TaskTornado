'use client';

import { useState, useEffect } from 'react';
import { useSearch } from '@/context/SearchContext';
import { useClassContext } from '@/context/ClassContext';
import {
  Search, BookOpen, GraduationCap, FileText, Presentation, Target,
  Zap, CheckCircle, Home, Calendar, BarChart, Settings, Users, Shield,
  PenTool, Bookmark, HelpCircle, Scroll, User, History,
  CreditCard, Gamepad2, Trophy, MessageSquare
} from 'lucide-react';
import Link from 'next/link';
import Cookies from 'js-cookie';
import { useTheme } from 'next-themes';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

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
  { title: 'Dashboard', href: '/dashboard', icon: Home, keywords: ['home', 'dashboard', 'overview'] },
  { title: 'Tests', href: '/tests', icon: GraduationCap, keywords: ['tests', 'exams', 'quiz'] },
  { title: 'Interactive Quizzes', href: '/quiz', icon: FileText, keywords: ['quiz', 'quizzes', 'interactive'] },
  { title: 'Calendar', href: '/calendar', icon: Calendar, keywords: ['calendar', 'schedule', 'events'] },
  { title: 'Discussion Boards', href: '/discussions', icon: MessageSquare, keywords: ['discussion', 'boards', 'forums', 'community', 'threads'] },
  { title: 'Settings', href: '/settings', icon: Settings, keywords: ['settings', 'preferences'] },

  { title: 'Flashcards', href: '/flashcards', icon: CreditCard, keywords: ['flashcards'] },
  { title: 'Groups', href: '/groups', icon: Users, keywords: ['groups'] },
  { title: 'Writing Assist', href: '/writing-assist', icon: PenTool, keywords: ['writing', 'essay'] },
  { title: 'Web Saves', href: '/web-saves', icon: Bookmark, keywords: ['web saves', 'links'] },

  { title: 'Games', href: '/games', icon: Gamepad2, keywords: ['games'] },
  { title: 'Snake Game', href: '/snake', icon: Trophy, keywords: ['snake'] },
  { title: 'Task Tower', href: '/task-tower', icon: BarChart, keywords: ['task tower'] },

  { title: 'AI Guidelines', href: '/ai-guidelines', icon: HelpCircle, keywords: ['ai', 'guidelines'] },

  { title: 'About Creator', href: '/about-creator', icon: User, keywords: ['about'] },
  { title: 'Changelog', href: '/changelog', icon: History, keywords: ['changelog'] },
  { title: 'Privacy Policy', href: '/legal/privacy', icon: Shield, keywords: ['privacy'] },
  { title: 'Terms of Service', href: '/legal/terms', icon: Scroll, keywords: ['terms'] },
];

export function SearchResults() {
  const { query, closeSearch } = useSearch();
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
      <div className="py-8 text-center">
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          No results for “{query}”
        </p>
      </div>
    );
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="pb-2"
      >

        {/* ROUTES */}
        {filteredRoutes.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.15, delay: 0.05 }}
            className="pt-3 pb-6"
          >
            <h3 className="px-5 pb-1 text-[11px] uppercase tracking-wider 
                         text-gray-500 dark:text-gray-400 font-medium">
              Pages
            </h3>
            <motion.ul>
              {filteredRoutes.map((route, index) => {
                const Icon = route.icon;
                return (
                  <motion.li
                    key={route.href}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.15, delay: 0.1 + index * 0.05 }}
                    whileHover={{ scale: 1.02, x: 4 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Link
                      href={route.href}
                      onClick={closeSearch}
                      className="flex items-center px-5 py-3 text-sm
                               hover:bg-gray-50/60 dark:hover:bg-gray-800/70
                               transition rounded-md"
                    >
                      <motion.div
                        initial={{ rotate: 0 }}
                        whileHover={{ rotate: 5 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Icon className="h-4 w-4 mr-3 text-gray-500 dark:text-gray-400" />
                      </motion.div>
                      <span className="text-gray-900 dark:text-gray-100">
                        {route.title}
                      </span>
                    </Link>
                  </motion.li>
                );
              })}
            </motion.ul>
          </motion.div>
        )}

        {/* HOMEWORKS */}
        {filteredHomeworks.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.15, delay: 0.1 + filteredRoutes.length * 0.05 }}
            className="pt-3 pb-6"
          >
            <h3 className="px-5 pb-1 text-[11px] uppercase tracking-wider 
                         text-gray-500 dark:text-gray-400 font-medium">
              Assignments
            </h3>

            <motion.ul>
              {filteredHomeworks.map((hw, index) => {
                const c = classes.find(x => x.id === hw.classId);
                const color = c ? colorMap[c.id] ?? '#808080' : '#808080';

                return (
                  <motion.li
                    key={hw.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.15, delay: 0.15 + filteredRoutes.length * 0.05 + index * 0.05 }}
                    whileHover={{ scale: 1.02, x: 4 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Link
                      href={`/homework/${hw.id}`}
                      onClick={closeSearch}
                      className="block px-5 py-3 hover:bg-gray-50/60 dark:hover:bg-gray-800/70
                               transition rounded-md"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          {hw.completed && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ duration: 0.2, delay: 0.2 + index * 0.05 }}
                            >
                              <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                            </motion.div>
                          )}
                          <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {hw.title}
                          </span>
                        </div>

                        {c && (
                          <motion.span
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 0.2, delay: 0.25 + index * 0.05 }}
                            whileHover={{ scale: 1.05 }}
                            className="px-2.5 py-0.5 text-xs rounded-full border font-medium"
                            style={{
                              background: isDark ? `${color}22` : `${color}20`,
                              color,
                              borderColor: `${color}55`,
                            }}
                          >
                            {c.name}
                          </motion.span>
                        )}
                      </div>

                      {hw.description && (
                        <motion.p
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.2, delay: 0.3 + index * 0.05 }}
                          className="mt-1 text-sm text-gray-500 dark:text-gray-400 line-clamp-2"
                        >
                          {hw.description}
                        </motion.p>
                      )}

                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.2, delay: 0.35 + index * 0.05 }}
                        className="mt-1 text-xs text-gray-500 dark:text-gray-400"
                      >
                        Due: {new Date(hw.dueDate).toLocaleDateString()}
                      </motion.p>
                    </Link>
                  </motion.li>
                );
              })}
            </motion.ul>
          </motion.div>
        )}

        {/* TESTS */}
        {filteredTests.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.15, delay: 0.15 + (filteredRoutes.length + filteredHomeworks.length) * 0.05 }}
            className="pt-3 pb-6"
          >
            <h3 className="px-5 pb-1 text-[11px] uppercase tracking-wider 
                         text-gray-500 dark:text-gray-400 font-medium">
              Tests & Exams
            </h3>

            <motion.ul>
              {filteredTests.map((t, index) => {
                const c = classes.find(x => x.id === t.classId);
                const { icon: TestIcon, color: testColor } = getTestTypeIcon(t.testType);
                const badgeColor = c ? colorMap[c.id] ?? '#808080' : '#808080';

                return (
                  <motion.li
                    key={t.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.15, delay: 0.2 + (filteredRoutes.length + filteredHomeworks.length) * 0.05 + index * 0.05 }}
                    whileHover={{ scale: 1.02, x: 4 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Link
                      href={`/tests/${t.id}`}
                      onClick={closeSearch}
                      className="block px-5 py-3 hover:bg-gray-50/60 dark:hover:bg-gray-800/70
                               transition rounded-md"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <motion.div
                            initial={{ rotate: 0 }}
                            whileHover={{ rotate: 10 }}
                            transition={{ duration: 0.2 }}
                          >
                            <TestIcon className={`h-4 w-4 mr-2 ${testColor}`} />
                          </motion.div>
                          <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {t.title}
                          </span>
                        </div>

                        {c && (
                          <motion.span
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 0.2, delay: 0.25 + index * 0.05 }}
                            whileHover={{ scale: 1.05 }}
                            className="px-2.5 py-0.5 text-xs rounded-full border font-medium"
                            style={{
                              background: isDark ? `${badgeColor}22` : `${badgeColor}20`,
                              color: badgeColor,
                              borderColor: `${badgeColor}55`,
                            }}
                          >
                            {c.name}
                          </motion.span>
                        )}
                      </div>

                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.2, delay: 0.3 + index * 0.05 }}
                        className="mt-1 flex items-center text-xs text-gray-500 dark:text-gray-400 space-x-4"
                      >
                        <span>Type: {t.testType}</span>
                        <span>Date: {new Date(t.testDate).toLocaleDateString()}</span>
                        {t.testTime && <span>Time: {t.testTime}</span>}
                      </motion.div>

                      {t.description && (
                        <motion.p
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.2, delay: 0.35 + index * 0.05 }}
                          className="mt-1 text-sm text-gray-500 dark:text-gray-400 line-clamp-2"
                        >
                          {t.description}
                        </motion.p>
                      )}
                    </Link>
                  </motion.li>
                );
              })}
            </motion.ul>
          </motion.div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}