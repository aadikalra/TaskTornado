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
      version: '1.1.9.1',
      date: '2025-11-28',
      title: 'Mobile Layout Improvements',
      highlight: 'Enhanced mobile experience with better button placement and calendar responsiveness',
      type: 'minor',
      short: [
        'Improved mobile button placement in MainApp sections',
        'Enhanced calendar responsiveness for smaller screens',
        'Better navigation layout on mobile devices',
        'Optimized spacing and sizing for touch interfaces'
      ],
      full: [
        'Redesigned mobile layout for MainApp sections with chevron toggles moved to header line',
        'Improved button placement in pinned, classes, and tests sections for better mobile UX',
        'Enhanced calendar grid responsiveness with adaptive sizing and spacing',
        'Optimized calendar event items for smaller screens with smart text truncation',
        'Improved calendar header layout with navigation buttons below title on mobile only',
        'Better touch targets and spacing throughout mobile interface',
        'Enhanced responsive design consistency across all components',
        'Optimized text sizes and padding for better readability on small screens'
      ]
    },
    {
      version: '1.1.9',
      date: '2025-11-28',
      title: 'Google Classroom Integration',
      highlight: 'Complete Google Classroom integration with automatic sync, real-time updates, and seamless data management',
      type: 'major',
      short: [
        'Full Google Classroom OAuth integration',
        'Automatic sync of classes and assignments',
        'Real-time connection status detection',
        'Google Classroom data in AI Assistant @data commands',
        'Seamless authentication flow',
        'Enhanced settings UI for Classroom management',
        'Fixed duplicate button key generation',
        'Updated UI components for better consistency'
      ],
      full: [
        'Implemented complete Google Classroom OAuth integration with secure authentication flow',
        'Added automatic syncing of Google Classroom classes and assignments to local database',
        'Created real-time connection status detection using multiple API validation methods',
        'Fixed Google Classroom data availability in AI Assistant @data commands by updating ClassContext',
        'Enhanced GoogleClassroomSection component with robust authentication checking and fallback methods',
        'Implemented proper cookie-based session management for Google Classroom access tokens',
        'Added comprehensive error handling and user feedback for Classroom connection issues',
        'Fixed duplicate React key warning in interactive buttons by adding index to unique ID generation',
        'Updated deprecated Tailwind classes from bg-gradient-to-br to bg-linear-to-br for modern compliance',
        'Resolved data loading issue where Google users were not fetching from Supabase database',
        'Enhanced AI Assistant with proper Google Classroom data context for better homework management',
        'Improved settings page UI with better connection status indicators and user guidance',
        'Added comprehensive logging and debugging tools for Google Classroom integration troubleshooting',
        'Implemented fallback authentication methods using both debug-log and courses APIs',
        'Enhanced data consistency across all components that rely on ClassContext state'
      ]
    },
    {
      version: '1.1.8',
      date: '2025-11-27',
      title: 'Dictionary Popup & AI Assistant Overhaul',
      highlight: 'Interactive dictionary lookup, advanced AI features with persistent storage, and enhanced UI polish',
      type: 'major',
      short: [
        'Dictionary popup for instant word definitions',
        'Enhanced right-click context menu with "Define" option',
        'Advanced AI Assistant with persistent conversation storage',
        'Interactive teaching buttons with keyboard shortcuts',
        'Command detection system for special AI modes',
        'Model-specific message limits and usage tracking',
        'Redesigned dashboard loading spinner with new 3 dots animation',
        'Console log cleanup for better performance'
      ],
      full: [
        'Created DictionaryPopup.tsx component from scratch (143 lines) with single-word text selection detection',
        'Integrated Dictionary API (dictionaryapi.dev) for comprehensive word definitions including phonetics, parts of speech, examples',
        'Added ESC key binding and smooth animations for better user experience',
        'Enhanced ClientLayout.tsx (+40 lines) to detect selected text and pass it to context menu',
        'Redesigned CustomContextMenu.tsx (+49, -31 lines) with onDictionaryOpen handler and "Define" menu option for single-word selections',
        'Updated menu items with better icons (Trophy for Tests, BookOpen for Define) and reorganized navigation structure',
        'Overhauled AI Assistant with persistent storage using cookies (4KB limit, last 10 messages) and localStorage for input recovery',
        'Implemented interactive teaching buttons system with JSON parsing, keyboard shortcuts, and usage tracking for quick/deeper/cloud modes',
        'Added advanced command detection system with / commands for quiz, flashcards, therapist, grade modes and real-time filtering',
        'Enhanced system prompt with detailed Socratic questioning methodology, homework detection, and therapist mode guidelines',
        'Improved streaming response handling with TextDecoder for real-time processing and dynamic loading messages',
        'Added model-specific message limits: Quick mode (Gemma): 100 messages, Deep mode (Gemini): 10 messages, Cloud mode (Kimi): 10 messages',
        'Enhanced UI with "New Chat" button, close button, SplittingText component, and shimmering loading states',
        'Redesigned dashboard loading spinner in DashboardClient.tsx (+13, -2 lines) with gradient background and bouncing animation',
        'Updated loading spinner colors to red-500 across authentication components for better visual consistency',
        'Cleaned up console logs by commenting out debug statements in calendar/page.tsx, MainApp.tsx, and PlayfulHomeworkList.tsx',
        'Enhanced performance with dual persistence approach using cookies for cross-session messages and localStorage for input recovery',
        'Improved accessibility with markdown rendering, proper error handling, and comprehensive keyboard shortcuts'
      ]
    },
    {
      version: '1.1.7',
      date: '2025-11-26',
      title: 'AI Worthiness & Timer Redesign',
      highlight: 'Smart game validation and minimalist study timer experience',
      type: 'major',
      short: [
        'AI worthiness check for game access',
        'Students must prove they deserve to play games',
        '5-minute block system for unworthy attempts',
        'Intelligent evaluation using Gemma 3 model',
        'Fair but strict judgment criteria',
        'Enhanced game access control and responsibility',
        'Minimalist study timer redesign',
        'Clean and focused timer interface',
        'Improved timer visual hierarchy'
      ],
      full: [
        'Implemented AI-powered worthiness check system for all games',
        'Students must explain why they deserve to play before accessing games',
        'AI evaluates responses based on homework completion, intent, and honesty',
        'Uses Gemma 3 model for intelligent and contextual judgment',
        '5-minute temporary block for students judged unworthy',
        'Persistent blocking system remembers failed attempts across sessions',
        'Fair criteria: rewards completed homework, legitimate study breaks, and honesty',
        'Blocks procrastination, avoidance, and dishonest behavior',
        'Seamless integration with existing game unlock system',
        'Enhanced user accountability and responsible gaming habits',
        'Redesigned study timer with minimalistic approach',
        'Clean, focused interface with larger time display and simplified controls',
        'Removed visual clutter while maintaining core functionality',
        'Improved typography and spacing for better readability',
        'Streamlined input fields and circular control buttons',
        'Enhanced progress visualization with subtle progress bar'
      ]
    },
    {
      version: '1.1.6',
      date: '2025-11-25',
      title: 'Interactive Quiz & Enhanced AI Experience',
      highlight: 'New interactive quiz feature, upgraded AI models, improved navigation and search capabilities',
      type: 'major',
      short: [
        'Interactive quiz feature with engaging study tools',
        'Upgraded AI quick models for more intelligent help',
        'Faster AI response times and improved performance',
        'Enhanced right-click menu for better navigation',
        'Delete account feature for user control',
        'Improved search bar with route searching capabilities'
      ],
      full: [
        'Added comprehensive interactive quiz feature with multiple question types and instant feedback',
        'Upgraded AI quick models to provide more intelligent and contextual assistance',
        'Optimized AI response times for faster help and improved user experience',
        'Redesigned right-click context menu with improved navigation options and better organization',
        'Implemented secure delete account feature with proper data removal and confirmation flow',
        'Enhanced search bar to support route searching in addition to content search',
        'Improved search algorithm for better results and faster query processing',
        'Added keyboard shortcuts and accessibility improvements to navigation menus',
        'Enhanced user control with comprehensive account management options',
        'Optimized performance across all AI-powered features for smoother interactions'
      ]
    },
    {
      version: '1.1.5',
      date: '2025-11-24',
      title: 'Global UI Refactor & Layout Unification',
      highlight: 'Massive refactor focused on layout standardization, wide-layout support, and visual consistency',
      type: 'major',
      short: [
        'Complete UI overhaul giving the app a fresh new look',
        'Added useWideLayout hook across entire app for unified layout system',
        'Replaced gradient utilities (bg-gradient-to-*) with cleaner bg-linear syntax',
        'Major UI modernization with better spacing and cleaner headers',
        'Settings page completely redesigned with delete account flow',
        'Removed redundant JSX wrappers and simplified animations',
        'Significant line reduction and cleanup across multiple pages'
      ],
      full: [
        'Injected useWideLayout hook into almost all pages: About Creator, AI Guidelines, Changelog, Settings, Legal pages, Flashcards, Games, Groups, Calendar, and more',
        'Replaced hardcoded container classes (max-w-4xl, max-w-6xl, max-w-7xl) with unified getContainerClass() system',
        'Standardized gradient syntax across entire app from bg-gradient-to-* to bg-linear-to-r and bg-linear-to-br',
        'Modernized UI across nearly every page with better spacing (space-y-*), cleaner headers, and simpler motion animations',
        'Removed cluttered Cards around sections and converted to non-card layouts with modern headers',
        'Completely redesigned Settings page with delete account flow, wide layout toggle, and motion-div grouped sections',
        'Added Maximize2 icon import and fixed missing state variables in Settings',
        'Removed redundant JSX wrappers, old transition variants, excessive borders, and outdated container divs',
        'Achieved significant line reduction in Calendar, Flashcards, Games, Groups, and Legal pages',
        'Simplified animations and improved visual consistency throughout the application'
      ]
    },
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

  // Filter versions based on current date
  const getVisibleVersions = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalize to start of day
    
    return versions.filter(version => {
      const versionDate = new Date(version.date + 'T00:00:00');
      const oneDayBefore = new Date(versionDate);
      oneDayBefore.setDate(oneDayBefore.getDate() - 1);
      oneDayBefore.setHours(0, 0, 0, 0);
      
      // Show if today is the release date or one day before
      return today >= oneDayBefore;
    });
  };

  const visibleVersions = getVisibleVersions();

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <div className={getContainerClass() + ' py-16'}>
        
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }} 
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-light text-gray-900 dark:text-white mb-3 tracking-tight">
            Changelog
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Product updates and improvements
          </p>
        </motion.div>

        {/* Thanksgiving Message - Minimalist */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-12 text-center p-4 border border-gray-200 dark:border-gray-800 rounded-lg"
        >
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
            🦃 Thanksgiving Special
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            One major release every day until end of November!
          </p>
        </motion.div>

        {/* Versions */}
        <div className="space-y-12">
          {visibleVersions.map((v, i) => {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const versionDate = new Date(v.date + 'T00:00:00');
            const isFuture = today < versionDate;
            
            return (
            <div key={v.version} className="relative">
              {/* FUTURE tag outside the opacity container */}
              {isFuture && (
                <div className="absolute -top-2.5 -left-1 bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-xs font-medium px-2 py-0.5 rounded z-10">
                  FUTURE
                </div>
              )}
              
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: isFuture ? 0.5 : 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className={`group ${isFuture ? 'relative bg-blue-50/30 dark:bg-blue-950/20 p-4 -mx-4 rounded-xl' : ''}`}
              >
              {/* Special styling for future versions */}
              {isFuture && (
                <div className="absolute inset-0 border-2 border-dashed border-blue-200 dark:border-blue-800 rounded-xl opacity-40 pointer-events-none" />
              )}

              {/* Version Header */}
              <div className={`relative flex items-start justify-between mb-4 pb-4 border-b ${isFuture ? 'border-gray-300 dark:border-gray-700' : 'border-gray-200 dark:border-gray-800'}`}>
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
                    {(['1.1.9.1', '1.1.9', '1.1.8', '1.1.7', '1.1.6', '1.1.5'].includes(v.version)) && (
                      <span className="px-2 py-0.5 text-xs font-medium bg-orange-50 dark:bg-orange-950 text-orange-600 dark:text-orange-400 rounded">
                        🦃 Thanksgiving
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                    <Calendar className="w-3.5 h-3.5" />
                    {new Date(v.date + 'T00:00:00').toLocaleDateString('en-US', { 
                      month: 'long', 
                      day: 'numeric', 
                      year: 'numeric',
                      timeZone: 'UTC'
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
                <p className={`relative text-gray-600 dark:text-gray-300 mb-6 leading-relaxed ${isFuture ? 'text-gray-700 dark:text-gray-200' : ''}`}>
                  {v.highlight}
                </p>
              )}

              {/* Short list */}
              <ul className="space-y-2">
                {v.short.map((txt, idx) => (
                  <li key={idx} className={`relative flex items-start gap-3 text-sm ${isFuture ? 'text-gray-700 dark:text-gray-300' : 'text-gray-600 dark:text-gray-400'}`}>
                    <span className="text-gray-400 dark:text-gray-600 mt-0.5">•</span>
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
                          className={`relative flex items-start gap-3 text-sm ${isFuture ? 'text-gray-600 dark:text-gray-400' : 'text-gray-500 dark:text-gray-500'}`}
                        >
                          <span className="text-gray-300 dark:text-gray-700 mt-0.5">•</span>
                          <span className="leading-relaxed">{txt}</span>
                        </motion.li>
                      ))}
                    </ul>
                  </motion.div>
                )}
              </AnimatePresence>
              </motion.div>
            </div>
            );
          })}
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
              Built for students • Public Beta v1.1.9
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