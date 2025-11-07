'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Zap, ChevronDown, ChevronUp, TestTube, Sparkles, CheckCircle2 } from 'lucide-react';
import { useState } from 'react';

type Version = {
  version: string;
  date: string;
  title: string;
  highlight: string;
  type: 'major' | 'Alpha';
  short: string[];
  full: { icon: React.ReactNode; text: string }[];
};

export default function ChangelogPage() {
  const [open, setOpen] = useState<string | null>(null);

  const versions: Version[] = [
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
        { icon: <TestTube className="h-4 w-4" />, text: 'Built new /tests page as central hub for managing all tests with statistical overview' },
        { icon: <Zap className="h-4 w-4" />, text: 'Added statistical cards for Total, Upcoming, Completed, and Missed tests with ALPHA/BETA indicators' },
        { icon: <ChevronDown className="h-4 w-4" />, text: 'Implemented advanced filtering by status, type (ALPHA/BETA/Exam/Quiz), and priority levels' },
        { icon: <Calendar className="h-4 w-4" />, text: 'Added drag-and-drop rescheduling of tests directly from the calendar view' },
        { icon: <Sparkles className="h-4 w-4" />, text: 'Created EnhancedTestCard with three view modes: default, compact, and timeline' },
        { icon: <ChevronUp className="h-4 w-4" />, text: 'Developed StatusGroupedTestList for organizing tests by status (Upcoming/Taken)' },
        { icon: <ChevronDown className="h-4 w-4" />, text: 'Built CompactTestList for space-efficient viewing of test schedules' },
        { icon: <CheckCircle2 className="h-4 w-4" />, text: 'Added PriorityTestCard with AI-powered priority highlighting' },
        { icon: <Zap className="h-4 w-4" />, text: 'Implemented Supabase migrations for tests table with comprehensive fields' },
        { icon: <ChevronDown className="h-4 w-4" />, text: 'Created CRUD operations in lib/supabase/db.ts for full test management' },
        { icon: <Sparkles className="h-4 w-4" />, text: 'Added AI priority caching in localStorage to optimize performance' },
        { icon: <ChevronUp className="h-4 w-4" />, text: 'Enhanced dark mode support across all test components and modals' },
        { icon: <ChevronDown className="h-4 w-4" />, text: 'Added global search integration for tests with class-based filtering' },
        { icon: <TestTube className="h-4 w-4" />, text: 'Created dedicated test detail and edit pages with rich text editing' },
        { icon: <CheckCircle2 className="h-4 w-4" />, text: 'Added MarkTestAsTakenModal for easy test completion with score tracking' },
        { icon: <Zap className="h-4 w-4" />, text: 'Integrated test management into ClassContext with real-time updates' },
        { icon: <ChevronDown className="h-4 w-4" />, text: 'Added Tiptap rich text editor for test descriptions and study materials' },
        { icon: <Calendar className="h-4 w-4" />, text: 'Enhanced calendar view with test type indicators and detailed tooltips' },
        { icon: <Sparkles className="h-4 w-4" />, text: 'Started building Writing Assist - AI-powered writing helper with rich text editing' },
        { icon: <ChevronUp className="h-4 w-4" />, text: 'Optimized performance with efficient state management and data fetching' },
        { icon: <TestTube className="h-4 w-4" />, text: 'Fixed date-offset issues in test scheduling' },
        { icon: <CheckCircle2 className="h-4 w-4" />, text: 'Standardized test status to use "taken" instead of "completed"' },
        { icon: <Sparkles className="h-4 w-4" />, text: 'Improved UI consistency with updated component library' },
        { icon: <Zap className="h-4 w-4" />, text: 'Integrated AI assistant command menu with @ detection for seamless feature access' },
        { icon: <ChevronDown className="h-4 w-4" />, text: 'Added Vercel Analytics for page view and visitor tracking' },
        { icon: <TestTube className="h-4 w-4" />, text: 'Complete navbar overhaul with sticky design, dark mode support, and functional links' },
        { icon: <Sparkles className="h-4 w-4" />, text: 'Optimized navbar spacing, imports, and responsive design for better UX' },
        { icon: <ChevronUp className="h-4 w-4" />, text: 'Enhanced dark mode implementation across all pages and components' },
        { icon: <CheckCircle2 className="h-4 w-4" />, text: 'Fixed build issues, duplicate variables, and improved component performance' },
        { icon: <Zap className="h-4 w-4" />, text: 'Added Back to Home button and improved 404 page navigation' },
        { icon: <TestTube className="h-4 w-4" />, text: 'Created Hero.tsx with interactive DotGrid background and floating cards' },
        { icon: <Sparkles className="h-4 w-4" />, text: 'Deployed to Render, Vercel, and Netlify for backups and redundancy' },
        { icon: <ChevronDown className="h-4 w-4" />, text: 'Pushed all updates to GitHub repository for version control' },
        { icon: <CheckCircle2 className="h-4 w-4" />, text: 'Updated AI guidelines with new Cloud Mode (Kimi-k2) and refined model options' },
        { icon: <Zap className="h-4 w-4" />, text: 'Refined color schemes, animations, and visual consistency' },
        { icon: <Sparkles className="h-4 w-4" />, text: 'Redesigned Hero section in landing page with optimized structure and animations' },
        { icon: <TestTube className="h-4 w-4" />, text: 'Optimized overall app structure for better performance and maintainability' },
        { icon: <ChevronUp className="h-4 w-4" />, text: 'Achieved 90+ scores in Google Lighthouse across all pages (Performance, Accessibility, SEO)' },
        { icon: <CheckCircle2 className="h-4 w-4" />, text: 'Converted numerous icons to animate-ui for enhanced animations and interactions' },
        { icon: <Zap className="h-4 w-4" />, text: 'Implemented OAuth authentication and account linking with Google Classroom for secure access' },
        { icon: <Sparkles className="h-4 w-4" />, text: 'Added fetching and displaying of Google Classroom courses and coursework with real-time updates' },
        { icon: <ChevronDown className="h-4 w-4" />, text: 'Integrated data syncing to save assignments and grades to local database for seamless management' },
        { icon: <TestTube className="h-4 w-4" />, text: 'Added toast notifications for due soon alerts and completed homework celebrations' },
        { icon: <CheckCircle2 className="h-4 w-4" />, text: 'Integrated confetti animations for homework completion with class-specific colors' },
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
        { icon: <ChevronDown className="h-4 w-4" />, text: 'Complete dark mode implementation across entire application' },
        { icon: <Sparkles className="h-4 w-4" />, text: 'Changelog page dark mode with proper contrast and styling' },
        { icon: <TestTube className="h-4 w-4" />, text: 'Dark mode support for login and signup pages' },
        { icon: <CheckCircle2 className="h-4 w-4" />, text: 'Fixed navbar visibility issues on different pages' },
        { icon: <Zap className="h-4 w-4" />, text: 'Fixed React hook ordering issues for better stability' },
        { icon: <ChevronUp className="h-4 w-4" />, text: 'Enhanced logout confirmation with home page redirect' },
        { icon: <Sparkles className="h-4 w-4" />, text: 'Improved component performance and error handling' },
        { icon: <TestTube className="h-4 w-4" />, text: 'Better accessibility with improved dark mode contrast' },
        { icon: <CheckCircle2 className="h-4 w-4" />, text: 'Added recurring homework functionality' },
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
        { icon: <Zap className="h-4 w-4" />, text: 'Redesigned floating pill-shaped navbar with modern aesthetics' },
        { icon: <Sparkles className="h-4 w-4" />, text: 'Interactive hover card for Resources in the navbar' },
        { icon: <ChevronDown className="h-4 w-4" />, text: 'Improved responsive design and mobile navigation experience' },
        { icon: <TestTube className="h-4 w-4" />, text: 'Instant hover response for better user interaction' },
        { icon: <CheckCircle2 className="h-4 w-4" />, text: 'Refined color scheme and professional visual hierarchy' },
        { icon: <ChevronUp className="h-4 w-4" />, text: 'Optimized spacing and proportions for cleaner layout' },
        { icon: <Sparkles className="h-4 w-4" />, text: 'Complete changelog page redesign with beta status indicators' },
        { icon: <Zap className="h-4 w-4" />, text: 'Added customer feedback form integration (Google Forms)' },
        { icon: <TestTube className="h-4 w-4" />, text: 'Implemented issue reporting system with direct form links' },
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
        { icon: <ChevronDown className="h-4 w-4" />, text: 'Complete dark mode implementation across entire application' },
        { icon: <Sparkles className="h-4 w-4" />, text: 'Professional AI Assistant with Animate UI tabs interface' },
        { icon: <Zap className="h-4 w-4" />, text: 'Quick Mode: Gemma 3 12B model with 30 messages/day limit' },
        { icon: <TestTube className="h-4 w-4" />, text: 'Deep Mode: Gemini 2.5 Flash-Lite with 10 messages/day limit' },
        { icon: <CheckCircle2 className="h-4 w-4" />, text: 'Persistent message counters with browser cookie storage' },
        { icon: <ChevronUp className="h-4 w-4" />, text: 'Hard limit enforcement preventing overuse with visual feedback' },
        { icon: <Sparkles className="h-4 w-4" />, text: 'Real-time usage tracking displayed in AI Assistant header' },
        { icon: <Zap className="h-4 w-4" />, text: 'Enhanced glass morphism navbar with liquid effects' },
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
        { icon: <TestTube className="h-4 w-4" />, text: 'Advanced homework management with full CRUD operations' },
        { icon: <Sparkles className="h-4 w-4" />, text: 'Study groups functionality for collaborative learning' },
        { icon: <Zap className="h-4 w-4" />, text: 'Comprehensive calendar integration with proper date handling' },
        { icon: <ChevronDown className="h-4 w-4" />, text: 'Mobile-responsive design improvements across all pages' },
        { icon: <CheckCircle2 className="h-4 w-4" />, text: 'Enhanced animations and micro-interactions' },
        { icon: <ChevronUp className="h-4 w-4" />, text: 'Point Scholar gamification program with achievement tracking' },
        { icon: <Sparkles className="h-4 w-4" />, text: 'Intelligent notification system for homework completion' },
        { icon: <TestTube className="h-4 w-4" />, text: '"Good job on [subject]!" celebration notifications' },
        { icon: <Zap className="h-4 w-4" />, text: 'Overdue homework alerts with class-specific warnings' },
        { icon: <CheckCircle2 className="h-4 w-4" />, text: 'Color-coded confetti animations matching class themes' },
        { icon: <ChevronDown className="h-4 w-4" />, text: 'New class enrollment notifications with homework suggestions' },
        { icon: <Sparkles className="h-4 w-4" />, text: 'Progress tracking with visual achievement badges' },
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
        { icon: <TestTube className="h-4 w-4" />, text: 'Comprehensive 5-step onboarding flow for new users' },
        { icon: <Sparkles className="h-4 w-4" />, text: 'Grade-based class suggestions (8th-12th grade)' },
        { icon: <Zap className="h-4 w-4" />, text: 'Intelligent math acceleration detection and placement' },
        { icon: <ChevronDown className="h-4 w-4" />, text: 'Comprehensive elective selection system (40+ options)' },
        { icon: <CheckCircle2 className="h-4 w-4" />, text: 'Automatic class creation with proper color-coding' },
        { icon: <ChevronUp className="h-4 w-4" />, text: 'Smart class preview with real-time updates' },
        { icon: <Sparkles className="h-4 w-4" />, text: 'One-click class setup for instant productivity' },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-orange-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-12 max-w-4xl">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4 bg-gradient-to-r from-orange-600 to-sky-600 bg-clip-text text-transparent">
            TaskTornado Changelog
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
            Track every major update and improvement
          </p>
          <div className="inline-flex items-center gap-2 bg-sky-100 dark:bg-sky-900/20 border border-sky-300 dark:border-sky-700 rounded-full px-4 py-2">
            <TestTube className="w-4 h-4 text-sky-600 dark:text-sky-400" />
            <span className="text-sky-800 dark:text-sky-200 font-medium text-sm">PUBLIC BETA</span>
          </div>
        </motion.div>

        {/* Versions */}
        <div className="space-y-8">
          {versions.map((v, i) => (
            <motion.div
              key={v.version}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="group"
            >
              <div
                className={`rounded-xl p-6 border transition-all ${
                  v.version === '1.0'
                    ? 'bg-gradient-to-r from-sky-50/50 to-blue-50/50 dark:from-sky-900/20 dark:to-blue-900/20 border-sky-200 dark:border-sky-800 shadow-lg'
                    : 'bg-white/50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 shadow-sm'
                }`}
              >
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 mb-6 pb-6 border-b border-gray-200/60 dark:border-gray-700/60">
                  <div
                    className={`flex items-center justify-center w-14 h-14 rounded-full font-bold text-sm transition-all ${
                      v.version === '1.0'
                        ? 'bg-gradient-to-br from-sky-500 to-blue-600 text-white shadow-lg'
                        : 'bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    v{v.version}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h2 className="text-xl font-semibold text-gray-900 dark:text-white truncate">{v.title}</h2>
                      <span className="px-2 py-1 bg-sky-100 dark:bg-sky-900/30 text-sky-700 dark:text-sky-300 text-xs font-medium rounded-full">
                        {v.type === 'major' ? 'Major' : 'Alpha'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-4">
                      <Calendar className="w-3 h-3" />
                      {new Date(v.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>

                  <button
                    onClick={() => setOpen(open === v.version ? null : v.version)}
                    className="ml-auto flex items-center gap-1 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                  >
                    {open === v.version ? (
                      <>Hide details <ChevronUp className="w-4 h-4" /></>
                    ) : (
                      <>Show details <ChevronDown className="w-4 h-4" /></>
                    )}
                  </button>
                </div>

                {/* Version 1.0 Image */}
                {v.version === '1.0' && (
                  <div className="mb-6 rounded-xl overflow-hidden border shadow-lg">
                    <img 
                      src="/TaskTornado-1.0.png" 
                      alt="TaskTornado 1.0 - Public BETA!!"
                      className="w-full h-auto"
                    />
                  </div>
                )}

                {/* Highlight */}
                {v.highlight && (
                  <div className="mb-6 p-4 bg-gradient-to-r from-sky-50/30 to-blue-50/30 dark:from-sky-500/10 dark:to-blue-500/10 rounded-lg border border-sky-200/30 dark:border-sky-800/30">
                    <p className="text-sm font-medium text-sky-800 dark:text-sky-200">
                      {v.highlight}
                    </p>
                  </div>
                )}

                {/* Short list */}
                <div className="space-y-3">
                  {v.short.map((txt, idx) => (
                    <div key={idx} className="flex items-start gap-3 text-sm text-gray-600 dark:text-gray-300">
                      <Zap className="w-4 h-4 mt-0.5 text-sky-500 flex-shrink-0" />
                      <span>{txt}</span>
                    </div>
                  ))}
                </div>

                {/* Full list – collapsible */}
                <AnimatePresence>
                  {open === v.version && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="mt-6 pt-6 border-t border-gray-200/60 dark:border-gray-700/60 overflow-hidden"
                    >
                      <div className="space-y-3">
                        {v.full.map((f, fi) => (
                          <motion.div
                            key={fi}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: fi * 0.03 }}
                            className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300"
                          >
                            <div className="flex items-center justify-center w-6 h-6 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full border-2 border-green-200 dark:border-green-700">
                              {f.icon}
                            </div>
                            <span>{f.text}</span>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA Footer */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-12 p-8 bg-gradient-to-r from-orange-50 to-sky-50/30 dark:from-gray-800/50 dark:to-sky-900/20 rounded-xl border border-orange-200/60 dark:border-sky-800/60"
        >
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center justify-center gap-2">
              <TestTube className="w-5 h-5 text-orange-600 dark:text-orange-400" />
              Active Beta Development
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-2xl mx-auto">
              We're building fast based on your feedback. Help shape v1.0!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="https://forms.gle/wjR1nJdg8vFYeNcd6"
                className="flex items-center justify-center gap-2 bg-orange-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-orange-600 transition-colors"
              >
                <Sparkles className="w-4 h-4" />
                Send Feedback
              </a>
              <a
                href="https://docs.google.com/forms/d/e/1FAIpQLScaYx0Gg30L_g3HiEE3um0MAE8OKlCN7naJrRTiVjSyBUt0og/viewform?usp=header"
                className="flex items-center justify-center gap-2 bg-white dark:bg-gray-700 text-orange-600 dark:text-orange-400 px-6 py-3 rounded-lg font-medium border border-orange-300 dark:border-orange-700 hover:bg-orange-50 dark:hover:bg-gray-600/50 transition-colors"
              >
                <CheckCircle2 className="w-4 h-4" />
                Report Issue
              </a>
            </div>
          </div>
        </motion.div>

        {/* Final Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-12 text-center pt-8 border-t border-gray-200/30 dark:border-gray-700/30"
        >
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Built for students • Public Beta v1.0
          </p>
        </motion.div>
      </div>
    </div>
  );
}