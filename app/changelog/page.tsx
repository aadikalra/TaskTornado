'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import { useWideLayout } from '@/hooks/use-wide-layout';

type Version = {
  version: string;
  date: string;
  title: string;
  highlight: string;
  type: 'major' | 'Alpha' | 'minor';
  short: string[];
  full: string[];
};

export default function ChangelogPage() {
  const [open, setOpen] = useState<string | null>(null);
  const { getContainerClass } = useWideLayout();

  const versions: Version[] = [
    {
      version: '1.1.1',
      date: '2025-11-23',
      title: 'Changelog Redesign',
      highlight: 'Enhanced changelog page with better organization',
      type: 'minor',
      short: [
        'Improved changelog layout and organization',
        'Better version hierarchy and readability',
        'Enhanced visual presentation of updates'
      ],
      full: [
        'Redesigned changelog page for improved user experience',
        'Better organization of version information and features',
        'Enhanced readability and visual hierarchy',
        'Improved presentation of release notes and updates'
      ]
    },
    {
      version: '1.1.0',
      date: '2025-11-23',
      title: 'Landing Page & Dashboard Major Redesign',
      highlight: 'UI overhaul of homepage and dashboard',
      type: 'major',
      short: [
        'Modern landing page UI',
        'More visually clear onboarding and navigation',
        'Dashboard now redirects unauthenticated users',
        'Games: visual polish, progress stats',
        'Accessibility: OpenDyslexic font, better color contrast'
      ],
      full: [
        'Redesigned main landing page and dashboard for improved first impression and clarity',
        'Implemented a redirect to login if the user is not authenticated in dashboard',
        'Added dynamic homework completion stats to game unlock logic',
        'Enhanced accessibility through OpenDyslexic font and color variable upgrades in CSS',
        'Expanded UI animations and game center visuals',
        'Numerous style and component improvements to unify the look'
      ]
    },
    {
      version: '1.0.9',
      date: '2025-11-21',
      title: 'Game Center & Task Tower Game',
      highlight: 'First gamified study tools',
      type: 'major',
      short: [
        'Snake and Task Tower games for productivity',
        'New Game Center UI, stats on homework progress',
        'Bug fixes across homework, group chat, UI components'
      ],
      full: [
        'Introduced two games: Snake (difficulty scales with unfinished homework) and Task Tower (a Tetris-style game, organizing tasks)',
        'Created a new Game Center page that houses and unlocks games based on homework completion percent',
        'Enhanced visual feedback and unlock thresholds (75%+ homework for games unlock)',
        'Resolved major lingering bugs affecting homework pinning, group links, and component rendering',
        'Improved DockNav and sidebar navigation, refactored many components for maintainability'
      ]
    },
    {
      version: '1.0.8',
      date: '2025-11-20',
      title: 'AI Assistant Redesign & Snake',
      highlight: 'AIAssistant: Personalities, improved grading',
      type: 'major',
      short: [
        'AIAssistant supports personalities (friendly, nerdy, etc)',
        'Grading improvements and UI polish',
        'Snake game introduced (study break unlock)',
        'More theme and landing page polish'
      ],
      full: [
        'Refactored AIAssistant to support custom personalities (via cookies): professional, friendly, candid, quirky, efficient, nerdy, cynical, default',
        'Improved AI-powered grading and feedback accuracy for test/quiz entry',
        'Reworked landing page for visual impact (rotating headlines, decorative floating cards)',
        'Introduced Snake game as a reward for keeping up with homework',
        'Polished settings and main app view, improved accessibility of controls'
      ]
    },
    {
      version: '1.0.7',
      date: '2025-11-17',
      title: 'Dashboard Performance Optimization',
      highlight: 'Faster, leaner dashboard page',
      type: 'minor',
      short: [
        'Dashboard loads faster',
        'Reduced redundant API calls',
        'Better initial data loading for classes/homework'
      ],
      full: [
        'Refactored dashboard and context logic to only fetch data if necessary, reducing load times',
        'Moved Google Classroom integration to only apply for Google-auth users',
        'Optimized component tree for DashboardClient and main dashboard, minimized SSR waits',
        'Improved gamification state and logic for faster updates'
      ]
    },
    {
      version: '1.0',
      date: '2025-10-29',
      title: 'Public BETA!!',
      highlight: 'Complete /tests hub with stats, drag-and-drop calendar, AI priority, and full CRUD',
      type: 'major',
      short: [
        'Statistical overview dashboard (Total, Upcoming, Completed, Missed)',
        'Advanced filtering by status, type (ALPHA/BETA/Exam/Quiz), priority',
        'Drag-and-drop rescheduling from calendar view',
        'Three card views: default, compact, timeline',
        'AI-powered priority highlighting & caching',
        'Supabase backend with rich text editing',
        'Mark as taken modal with score tracking',
      ],
      full: [
        'Built new /tests page as central hub for managing all tests with statistical overview',
        'Added statistical cards for Total, Upcoming, Completed, and Missed tests with ALPHA/BETA indicators',
        'Implemented advanced filtering by status, type (ALPHA/BETA/Exam/Quiz), and priority levels',
        'Added drag-and-drop rescheduling of tests directly from the calendar view',
        'Created EnhancedTestCard with three view modes: default, compact, and timeline',
        'Developed StatusGroupedTestList for organizing tests by status (Upcoming/Taken)',
        'Built CompactTestList for space-efficient viewing of test schedules',
        'Added PriorityTestCard with AI-powered priority highlighting',
        'Implemented Supabase migrations for tests table with comprehensive fields',
        'Created CRUD operations in lib/supabase/db.ts for full test management',
        'Added AI priority caching in localStorage to optimize performance',
        'Enhanced dark mode support across all test components and modals',
        'Added global search integration for tests with class-based filtering',
        'Created dedicated test detail and edit pages with rich text editing',
        'Added MarkTestAsTakenModal for easy test completion with score tracking',
        'Integrated test management into ClassContext with real-time updates',
        'Added Tiptap rich text editor for test descriptions and study materials',
        'Enhanced calendar view with test type indicators and detailed tooltips',
        'Started building Writing Assist - AI-powered writing helper with rich text editing',
        'Optimized performance with efficient state management and data fetching',
        'Fixed date-offset issues in test scheduling',
        'Standardized test status to use "taken" instead of "completed"',
        'Improved UI consistency with updated component library',
        'Integrated AI assistant command menu with @ detection for seamless feature access',
        'Added Vercel Analytics for page view and visitor tracking',
        'Complete navbar overhaul with sticky design, dark mode support, and functional links',
        'Optimized navbar spacing, imports, and responsive design for better UX',
        'Enhanced dark mode implementation across all pages and components',
        'Fixed build issues, duplicate variables, and improved component performance',
        'Added Back to Home button and improved 404 page navigation',
        'Created Hero.tsx with interactive DotGrid background and floating cards',
        'Deployed to Render, Vercel, and Netlify for backups and redundancy',
        'Pushed all updates to GitHub repository for version control',
        'Updated AI guidelines with new Cloud Mode (Kimi-k2) and refined model options',
        'Refined color schemes, animations, and visual consistency',
        'Redesigned Hero section in landing page with optimized structure and animations',
        'Optimized overall app structure for better performance and maintainability',
        'Achieved 90+ scores in Google Lighthouse across all pages (Performance, Accessibility, SEO)',
        'Converted numerous icons to animate-ui for enhanced animations and interactions',
        'Implemented OAuth authentication and account linking with Google Classroom for secure access',
        'Added fetching and displaying of Google Classroom courses and coursework with real-time updates',
        'Integrated data syncing to save assignments and grades to local database for seamless management',
        'Added toast notifications for due soon alerts and completed homework celebrations',
        'Integrated confetti animations for homework completion with class-specific colors',
      ],
    },
    {
      version: '0.9.3',
      date: '2025-10-01',
      title: 'Dark Mode Complete',
      highlight: 'Full dark mode across entire app',
      type: 'Alpha',
      short: [
        'Dark mode for all pages & components',
        'Improved contrast & accessibility',
        'Fixed navbar visibility issues',
        'Enhanced logout flow',
        'Recurring homework support',
      ],
      full: [
        'Complete dark mode implementation across entire application',
        'Changelog page dark mode with proper contrast and styling',
        'Dark mode support for login and signup pages',
        'Fixed navbar visibility issues on different pages',
        'Fixed React hook ordering issues for better stability',
        'Enhanced logout confirmation with home page redirect',
        'Improved component performance and error handling',
        'Better accessibility with improved dark mode contrast',
        'Added recurring homework functionality',
      ],
    },
    {
      version: '0.9.2',
      date: '2025-10-01',
      title: 'Modern Navigation',
      highlight: 'Floating pill navbar with hover effects',
      type: 'Alpha',
      short: [
        'Redesigned sticky navbar',
        'Interactive resource hover cards',
        'Mobile-responsive navigation',
        'Customer feedback integration',
        'Issue reporting system',
      ],
      full: [
        'Redesigned floating pill-shaped navbar with modern aesthetics',
        'Interactive hover card for Resources in the navbar',
        'Improved responsive design and mobile navigation experience',
        'Instant hover response for better user interaction',
        'Refined color scheme and professional visual hierarchy',
        'Optimized spacing and proportions for cleaner layout',
        'Complete changelog page redesign with beta status indicators',
        'Added customer feedback form integration (Google Forms)',
        'Implemented issue reporting system with direct form links',
      ],
    },
    {
      version: '0.9.0',
      date: '2025-10-01',
      title: 'Professional AI Assistant',
      highlight: 'Quick Mode (Gemma 3) + Deep Mode (Gemini 2.5)',
      type: 'major',
      short: [
        'Tabbed AI interface with usage limits',
        '30 msg/day Quick Mode, 10 msg/day Deep Mode',
        'Real-time usage tracking',
        'Cookie-based message counters',
        'Glassmorphism navbar design',
      ],
      full: [
        'Complete dark mode implementation across entire application',
        'Professional AI Assistant with Animate UI tabs interface',
        'Quick Mode: Gemma 3 12B model with 30 messages/day limit',
        'Deep Mode: Gemini 2.5 Flash-Lite with 10 messages/day limit',
        'Persistent message counters with browser cookie storage',
        'Hard limit enforcement preventing overuse with visual feedback',
        'Real-time usage tracking displayed in AI Assistant header',
        'Enhanced glass morphism navbar with liquid effects',
      ],
    },
    {
      version: '0.8.5',
      date: '2025-08-29',
      title: 'Point Scholar & Notifications',
      highlight: 'Gamification + intelligent alerts',
      type: 'major',
      short: [
        'Point Scholar achievement system',
        'Class-themed confetti celebrations',
        'Overdue homework alerts',
        'Study groups collaboration',
        'Mobile-responsive calendar',
      ],
      full: [
        'Advanced homework management with full CRUD operations',
        'Study groups functionality for collaborative learning',
        'Comprehensive calendar integration with proper date handling',
        'Mobile-responsive design improvements across all pages',
        'Enhanced animations and micro-interactions',
        'Point Scholar gamification program with achievement tracking',
        'Intelligent notification system for homework completion',
        '"Good job on [subject]!" celebration notifications',
        'Overdue homework alerts with class-specific warnings',
        'Color-coded confetti animations matching class themes',
        'New class enrollment notifications with homework suggestions',
        'Progress tracking with visual achievement badges',
      ],
    },
    {
      version: '0.8.0',
      date: '2025-08-20',
      title: 'Intelligent Onboarding',
      highlight: '5-step auto class setup',
      type: 'major',
      short: [
        'Grade-based class suggestions',
        'Math acceleration detection',
        '40+ elective options',
        'One-click class creation',
        'Smart preview & color-coding',
      ],
      full: [
        'Comprehensive 5-step onboarding flow for new users',
        'Grade-based class suggestions (8th-12th grade)',
        'Intelligent math acceleration detection and placement',
        'Comprehensive elective selection system (40+ options)',
        'Automatic class creation with proper color-coding',
        'Smart class preview with real-time updates',
        'One-click class setup for instant productivity',
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <div className={getContainerClass() + ' py-16'}>
        
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }} 
          animate={{ opacity: 1, y: 0 }}
          className="mb-16"
        >
          <h1 className="text-4xl font-light text-gray-900 dark:text-white mb-3 tracking-tight">
            Changelog
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Product updates and improvements
          </p>
        </motion.div>

        {/* Versions */}
        <div className="space-y-12">
          {versions.map((v, i) => (
            <motion.div
              key={v.version}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="group"
            >
              {/* Version Header */}
              <div className="flex items-start justify-between mb-4 pb-4 border-b border-gray-200 dark:border-gray-800">
                <div className="flex-1">
                  <div className="flex items-baseline gap-3 mb-2">
                    <h2 className="text-xl font-medium text-gray-900 dark:text-white">
                      {v.title}
                    </h2>
                    <span className="text-sm font-mono text-gray-500 dark:text-gray-400">
                      v{v.version}
                    </span>
                    {v.type === 'major' && (
                      <span className="px-2 py-0.5 text-xs font-medium bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 rounded">
                        Major
                      </span>
                    )}
                    {v.type === 'minor' && (
                      <span className="px-2 py-0.5 text-xs font-medium bg-gray-50 dark:bg-gray-950 text-gray-600 dark:text-gray-400 rounded">
                        Minor
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                    <Calendar className="w-3.5 h-3.5" />
                    {new Date(v.date).toLocaleDateString('en-US', { 
                      month: 'long', 
                      day: 'numeric', 
                      year: 'numeric' 
                    })}
                  </div>
                </div>

                <button
                  onClick={() => setOpen(open === v.version ? null : v.version)}
                  className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                  {open === v.version ? (
                    <>
                      Hide
                      <ChevronUp className="w-4 h-4" />
                    </>
                  ) : (
                    <>
                      Details
                      <ChevronDown className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>

              {/* Highlight */}
              {v.highlight && (
                <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
                  {v.highlight}
                </p>
              )}

              {/* Short list */}
              <ul className="space-y-2">
                {v.short.map((txt, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-sm text-gray-600 dark:text-gray-400">
                    <span className="text-gray-400 dark:text-gray-600 mt-1.5">•</span>
                    <span className="leading-relaxed">{txt}</span>
                  </li>
                ))}
              </ul>

              {/* Full list */}
              <AnimatePresence>
                {open === v.version && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <ul className="mt-6 pt-6 space-y-2 border-t border-gray-100 dark:border-gray-900">
                      {v.full.map((txt, idx) => (
                        <motion.li
                          key={idx}
                          initial={{ opacity: 0, x: -5 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.02 }}
                          className="flex items-start gap-3 text-sm text-gray-500 dark:text-gray-500"
                        >
                          <span className="text-gray-300 dark:text-gray-700 mt-1.5">•</span>
                          <span className="leading-relaxed">{txt}</span>
                        </motion.li>
                      ))}
                    </ul>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-20 pt-8 border-t border-gray-200 dark:border-gray-800"
        >
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Built for students • Public Beta v1.0
            </p>
            <div className="flex gap-4">
              <a
                href="https://forms.gle/wjR1nJdg8vFYeNcd6"
                className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                Send Feedback
              </a>
              <a
                href="https://docs.google.com/forms/d/e/1FAIpQLScaYx0Gg30L_g3HiEE3um0MAE8OKlCN7naJrRTiVjSyBUt0og/viewform?usp=header"
                className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                Report Issue
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}