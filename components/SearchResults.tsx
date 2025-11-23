'use client';

import { useState, useEffect } from 'react';
import { useSearch } from '@/context/SearchContext';
import { useClassContext } from '@/context/ClassContext';
import { Search, BookOpen, GraduationCap, FileText, Presentation, Target, Zap, CheckCircle, Home, Calendar, BarChart, Settings, Users, Shield, MessageSquare, CreditCard, Clock, MapPin, Star, Gamepad2, Trophy, PenTool, Bookmark, HelpCircle, FileQuestion, Scroll, User, History, Mail } from 'lucide-react';
import Link from 'next/link';
import Cookies from 'js-cookie';
import { useTheme } from 'next-themes';
import { useRouter } from 'next/navigation';

const getTestTypeIcon = (testType: string) => {
  const type = testType?.toLowerCase() || '';
  switch (type) {
    case 'alpha':
      return { icon: Target, color: 'text-purple-600 dark:text-purple-400' };
    case 'beta':
      return { icon: Zap, color: 'text-orange-600 dark:text-orange-400' };
    case 'quiz':
      return { icon: FileText, color: 'text-blue-600 dark:text-blue-400' };
    case 'exam':
    case 'midterm':
    case 'final':
      return { icon: GraduationCap, color: 'text-red-600 dark:text-red-400' };
    case 'project':
    case 'presentation':
      return { icon: Presentation, color: 'text-green-600 dark:text-green-400' };
    default:
      return { icon: BookOpen, color: 'text-gray-600 dark:text-gray-400' };
  }
};

const routeSearchItems = [
  // Main App Pages
  { title: 'Dashboard', href: '/dashboard', icon: Home, keywords: ['home', 'dashboard', 'main', 'overview'] },
  { title: 'Homework', href: '/homework', icon: FileText, keywords: ['homework', 'assignments', 'tasks', 'work'] },
  { title: 'Tests', href: '/tests', icon: GraduationCap, keywords: ['tests', 'exams', 'quiz', 'assessment'] },
  { title: 'Calendar', href: '/calendar', icon: Calendar, keywords: ['calendar', 'schedule', 'events', 'dates'] },
  { title: 'Settings', href: '/settings', icon: Settings, keywords: ['settings', 'preferences', 'config', 'options'] },
  
  // Study & Learning Tools
  { title: 'Flashcards', href: '/flashcards', icon: CreditCard, keywords: ['flashcards', 'cards', 'study', 'memorize'] },
  { title: 'Groups', href: '/groups', icon: Users, keywords: ['groups', 'study groups', 'team', 'collaborate'] },
  { title: 'Writing Assist', href: '/writing-assist', icon: PenTool, keywords: ['writing', 'essay', 'assist', 'help'] },
  { title: 'Web Saves', href: '/web-saves', icon: Bookmark, keywords: ['web saves', 'bookmarks', 'save', 'links'] },
  
  // Games & Fun
  { title: 'Games', href: '/games', icon: Gamepad2, keywords: ['games', 'fun', 'play'] },
  { title: 'Snake Game', href: '/snake', icon: Trophy, keywords: ['snake', 'game', 'retro'] },
  { title: 'Task Tower', href: '/task-tower', icon: BarChart, keywords: ['task tower', 'tower', 'game'] },
  
  // AI & Testing
  { title: 'AI Guidelines', href: '/ai-guidelines', icon: HelpCircle, keywords: ['ai', 'guidelines', 'assistant', 'help'] },
  
  // Legal & About
  { title: 'About Creator', href: '/about-creator', icon: User, keywords: ['about', 'creator', 'developer', 'info'] },
  { title: 'Changelog', href: '/changelog', icon: History, keywords: ['changelog', 'updates', 'version', 'history'] },
  { title: 'Privacy Policy', href: '/legal/privacy', icon: Shield, keywords: ['privacy', 'policy', 'legal'] },
  { title: 'Terms of Service', href: '/legal/terms', icon: Scroll, keywords: ['terms', 'service', 'legal'] },
];

export function SearchResults() {
  const { query, closeSearch } = useSearch();
  const { classes, homeworks, tests } = useClassContext();
  const { theme } = useTheme();
  const router = useRouter();
  const [colorMap, setColorMap] = useState<{ [key: string]: string }>({});
  const isDark = theme === 'dark';

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

  // Handle Enter key to navigate to top result
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && query.trim()) {
        e.preventDefault();
        const searchTerm = query.toLowerCase();

        // Check routes first
        const matchedRoute = routeSearchItems.find(item =>
          item.title.toLowerCase().includes(searchTerm) ||
          item.keywords.some(keyword => keyword.includes(searchTerm))
        );

        if (matchedRoute) {
          router.push(matchedRoute.href);
          closeSearch();
          return;
        }

        // Check homework
        const filteredHomeworks = homeworks.filter(homework =>
          homework.title.toLowerCase().includes(searchTerm) ||
          homework.description?.toLowerCase().includes(searchTerm) ||
          classes.find(c => c.id === homework.classId)?.name.toLowerCase().includes(searchTerm)
        );

        if (filteredHomeworks.length > 0) {
          router.push(`/homework/${filteredHomeworks[0].id}`);
          closeSearch();
          return;
        }

        // Check tests
        const filteredTests = tests.filter(test =>
          test.title.toLowerCase().includes(searchTerm) ||
          test.description?.toLowerCase().includes(searchTerm) ||
          classes.find(c => c.id === test.classId)?.name.toLowerCase().includes(searchTerm) ||
          test.testType?.toLowerCase().includes(searchTerm)
        );

        if (filteredTests.length > 0) {
          router.push(`/tests/${filteredTests[0].id}`);
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
      <div className="mt-4 text-center bg-white dark:bg-gray-800">
        <Search className="mx-auto h-8 w-8 text-gray-300 dark:text-gray-500" />
        <p className="mt-2 text-gray-500 dark:text-gray-400">Search for assignments, tests, or classes</p>
      </div>
    );
  }

  const searchTerm = query.toLowerCase();

  // Filter routes
  const filteredRoutes = routeSearchItems.filter(item =>
    item.title.toLowerCase().includes(searchTerm) ||
    item.keywords.some(keyword => keyword.includes(searchTerm))
  );

  const filteredHomeworks = homeworks.filter(homework =>
    homework.title.toLowerCase().includes(searchTerm) ||
    homework.description?.toLowerCase().includes(searchTerm) ||
    classes.find(c => c.id === homework.classId)?.name.toLowerCase().includes(searchTerm)
  );

  const filteredTests = tests.filter(test =>
    test.title.toLowerCase().includes(searchTerm) ||
    test.description?.toLowerCase().includes(searchTerm) ||
    classes.find(c => c.id === test.classId)?.name.toLowerCase().includes(searchTerm) ||
    test.testType?.toLowerCase().includes(searchTerm)
  );

  const hasResults = filteredRoutes.length > 0 || filteredHomeworks.length > 0 || filteredTests.length > 0;

  if (!hasResults) {
    return (
      <div className="text-center p-4 text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800">
        <p>No results found for &quot;{query}&quot;</p>
      </div>
    );
  }

  return (
    <div className="max-h-96 overflow-y-auto bg-white dark:bg-gray-800">
      {filteredRoutes.length > 0 && (
        <div className="mb-4">
          <h3 className="px-4 py-2 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            Pages
          </h3>
          <ul className="divide-y divide-gray-200 dark:divide-gray-700">
            {filteredRoutes.map((route) => {
              const RouteIcon = route.icon;
              return (
                <li key={`route-${route.href}`} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                  <Link
                    href={route.href}
                    className="block px-4 py-3"
                    onClick={closeSearch}
                  >
                    <div className="flex items-center">
                      <RouteIcon className="h-4 w-4 text-gray-500 dark:text-gray-400 mr-3" />
                      <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {route.title}
                      </h3>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {filteredHomeworks.length > 0 && (
        <div className="mb-4">
          <h3 className="px-4 py-2 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            Assignments
          </h3>
          <ul className="divide-y divide-gray-200 dark:divide-gray-700">
            {filteredHomeworks.map((homework) => {
              const classItem = classes.find(c => c.id === homework.classId);
              const color = classItem ? colorMap[classItem.id] ?? '#808080' : '#808080';
              return (
                <li key={`hw-${homework.id}`} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                  <Link
                    href={`/homework/${homework.id}`}
                    className="block px-4 py-3"
                    onClick={closeSearch}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        {homework.completed && (
                          <CheckCircle className="h-4 w-4 text-green-500 dark:text-green-400 mr-2" />
                        )}
                        <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {homework.title}
                        </h3>
                      </div>
                      {classItem && (
                        <span
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium transition-colors"
                          style={{
                            backgroundColor: isDark ? `${color}22` : `${color}33`,
                            color: color,
                            border: `1px solid ${isDark ? `${color}44` : `${color}66`}`,
                            backdropFilter: isDark ? 'brightness(0.9)' : 'none'
                          }}
                        >
                          {classItem.name}
                        </span>
                      )}
                    </div>
                    {homework.description && (
                      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                        {homework.description}
                      </p>
                    )}
                    <div className="mt-1 flex items-center text-xs text-gray-500 dark:text-gray-400">
                      <span>Due: {new Date(homework.dueDate).toLocaleDateString()}</span>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {filteredTests.length > 0 && (
        <div>
          <h3 className="px-4 py-2 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            Tests & Exams
          </h3>
          <ul className="divide-y divide-gray-200 dark:divide-gray-700">
            {filteredTests.map((test) => {
              const classItem = classes.find(c => c.id === test.classId);
              const testType = getTestTypeIcon(test.testType);
              const TestIcon = testType.icon;
              const color = classItem ? colorMap[classItem.id] ?? '#808080' : '#808080';

              return (
                <li key={`test-${test.id}`} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                  <Link
                    href={`/tests/${test.id}`}
                    className="block px-4 py-3"
                    onClick={closeSearch}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <TestIcon className={`h-4 w-4 mr-2 ${testType.color}`} />
                        <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {test.title}
                        </h3>
                      </div>
                      {classItem && (
                        <span
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium transition-colors"
                          style={{
                            backgroundColor: isDark ? `${color}22` : `${color}33`,
                            color: color,
                            border: `1px solid ${isDark ? `${color}44` : `${color}66`}`,
                            backdropFilter: isDark ? 'brightness(0.9)' : 'none'
                          }}
                        >
                          {classItem.name}
                        </span>
                      )}
                    </div>
                    <div className="mt-1 flex items-center text-xs text-gray-500 dark:text-gray-400 space-x-4">
                      <span>Test: {test.testType}</span>
                      <span>Date: {new Date(test.testDate).toLocaleDateString()}</span>
                      {test.testTime && (
                        <span>Time: {test.testTime}</span>
                      )}
                    </div>
                    {test.description && (
                      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                        {test.description}
                      </p>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}