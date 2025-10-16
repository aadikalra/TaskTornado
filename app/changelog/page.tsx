'use client';

import { motion } from 'framer-motion';
import { Calendar, CheckCircle, Calculator, Globe, CheckCircle2, Sparkles, Zap, Brain, Cookie, Shield, Bot, BookOpen, Users, Moon, Smartphone, Palette, Gauge, HardDrive, FileText, AlertTriangle, Construction, TestTube, LogIn, Eye } from 'lucide-react';

export default function ChangelogPage() {
  const features = [
    {
      version: '0.9.3',
      date: '2025-10-1',
      title: 'Dark Mode & Stability Improvements',
      features: [
        { icon: <Moon className="h-4 w-4" />, text: 'Complete dark mode implementation across entire application' },
        { icon: <Palette className="h-4 w-4" />, text: 'Changelog page dark mode with proper contrast and styling' },
        { icon: <LogIn className="h-4 w-4" />, text: 'Dark mode support for login and signup pages' },
        { icon: <Eye className="h-4 w-4" />, text: 'Fixed navbar visibility issues on different pages' },
        { icon: <Shield className="h-4 w-4" />, text: 'Fixed React hook ordering issues for better stability' },
        { icon: <Zap className="h-4 w-4" />, text: 'Enhanced logout confirmation with home page redirect' },
        { icon: <Gauge className="h-4 w-4" />, text: 'Improved component performance and error handling' },
        { icon: <Sparkles className="h-4 w-4" />, text: 'Better accessibility with improved dark mode contrast' },
        { icon: <BookOpen className="h-4 w-4" />, text: 'Added recurring homework functionality' },
      ],
    },
    {
      version: '0.9.2',
      date: '2025-10-1',
      title: 'Enhanced Navigation & User Experience',
      features: [
        { icon: <FileText className="h-4 w-4" />, text: 'Redesigned floating pill-shaped navbar with modern aesthetics' },
        { icon: <Users className="h-4 w-4" />, text: 'Interactive hover card for Resources in the navbar' },
        { icon: <Sparkles className="h-4 w-4" />, text: 'Improved responsive design and mobile navigation experience' },
        { icon: <Zap className="h-4 w-4" />, text: 'Instant hover response for better user interaction' },
        { icon: <Palette className="h-4 w-4" />, text: 'Refined color scheme and professional visual hierarchy' },
        { icon: <Gauge className="h-4 w-4" />, text: 'Optimized spacing and proportions for cleaner layout' },
        { icon: <Calendar className="h-4 w-4" />, text: 'Complete changelog page redesign with beta status indicators' },
        { icon: <Shield className="h-4 w-4" />, text: 'Added customer feedback form integration (Google Forms)' },
        { icon: <HardDrive className="h-4 w-4" />, text: 'Implemented issue reporting system with direct form links' },
      ],
    },
    {
      version: '0.9.1',
      date: '2025-10-1',
      title: 'Development Transparency & User Experience',
      features: [
        { icon: <FileText className="h-4 w-4" />, text: 'Added comprehensive changelog page for development transparency' },
        { icon: <Users className="h-4 w-4" />, text: 'Integrated changelog link in main navigation for easy access' },
        { icon: <Calendar className="h-4 w-4" />, text: 'Professional development timeline with animated version cards' },
        { icon: <Sparkles className="h-4 w-4" />, text: 'Enhanced user experience with feature showcase and progress tracking' },
      ],
    },
    {
      version: '0.9.0',
      date: '2025-10-1',
      title: 'Professional AI Assistant & Usage Management',
      features: [
        { icon: <Moon className="h-4 w-4" />, text: 'Complete dark mode implementation across entire application' },
        { icon: <Bot className="h-4 w-4" />, text: 'Professional AI Assistant with Animate UI tabs interface' },
        { icon: <Zap className="h-4 w-4" />, text: 'Quick Mode: Gemma 3 12B model with 30 messages/day limit' },
        { icon: <Brain className="h-4 w-4" />, text: 'Deeper Mode: Gemini 2.5 Flash-Lite with 10 messages/day limit' },
        { icon: <Cookie className="h-4 w-4" />, text: 'Persistent message counters with browser cookie storage' },
        { icon: <Shield className="h-4 w-4" />, text: 'Hard limit enforcement preventing overuse with visual feedback' },
        { icon: <Gauge className="h-4 w-4" />, text: 'Real-time usage tracking displayed in AI Assistant header' },
        { icon: <Palette className="h-4 w-4" />, text: 'Enhanced glass morphism navbar with liquid effects' },
      ],
    },
    {
      version: '0.8.5',
      date: '2025-8-29',
      title: 'Point Scholar Program & Advanced Notifications',
      features: [
        { icon: <BookOpen className="h-4 w-4" />, text: 'Advanced homework management with full CRUD operations' },
        { icon: <Users className="h-4 w-4" />, text: 'Study groups functionality for collaborative learning' },
        { icon: <Calendar className="h-4 w-4" />, text: 'Comprehensive calendar integration with proper date handling' },
        { icon: <Smartphone className="h-4 w-4" />, text: 'Mobile-responsive design improvements across all pages' },
        { icon: <Sparkles className="h-4 w-4" />, text: 'Enhanced animations and micro-interactions' },
        { icon: <CheckCircle className="h-4 w-4" />, text: 'Point Scholar gamification program with achievement tracking' },
        { icon: <Bot className="h-4 w-4" />, text: 'Intelligent notification system for homework completion' },
        { icon: <Zap className="h-4 w-4" />, text: '"Good job on [subject]!" celebration notifications' },
        { icon: <Shield className="h-4 w-4" />, text: 'Overdue homework alerts with class-specific warnings' },
        { icon: <Palette className="h-4 w-4" />, text: 'Color-coded confetti animations matching class themes' },
        { icon: <Users className="h-4 w-4" />, text: 'New class enrollment notifications with homework suggestions' },
        { icon: <Gauge className="h-4 w-4" />, text: 'Progress tracking with visual achievement badges' },
      ],
    },
    {
      version: '0.8.0',
      date: '2025-8-20',
      title: 'Intelligent Class Setup & Onboarding',
      features: [
        { icon: <Users className="h-4 w-4" />, text: 'Comprehensive 5-step onboarding flow for new users' },
        { icon: <BookOpen className="h-4 w-4" />, text: 'Grade-based class suggestions (8th-12th grade)' },
        { icon: <Calculator className="h-4 w-4" />, text: 'Intelligent math acceleration detection and placement' },
        { icon: <Palette className="h-4 w-4" />, text: 'Comprehensive elective selection system (40+ options)' },
        { icon: <CheckCircle2 className="h-4 w-4" />, text: 'Automatic class creation with proper color-coding' },
        { icon: <Sparkles className="h-4 w-4" />, text: 'Smart class preview with real-time updates' },
        { icon: <Zap className="h-4 w-4" />, text: 'One-click class setup for instant productivity' },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto"
        >
          {/* Header */}
          <div className="text-center mb-12">
            <motion.h1
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-4xl font-bold text-gray-900 dark:text-white mb-4"
            >
              📋 Development Changelog
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-lg text-gray-600 dark:text-gray-300 mb-6"
            >
              Track the evolution of SchoolOrganizer - See what&apos;s new and improved!
            </motion.p>

            {/* Beta Status Notice */}
            <div className="inline-flex items-center gap-2 bg-orange-100 dark:bg-orange-900/20 border border-orange-300 dark:border-orange-700 rounded-full px-4 py-2">
              <TestTube className="w-4 h-4 text-orange-600 dark:text-orange-400" />
              <span className="text-orange-800 dark:text-orange-200 font-medium text-sm">BETA VERSION</span>
            </div>
          </div>

          {/* Changelog Timeline */}
          <div className="space-y-8">
            {features.map((version, versionIndex) => (
              <motion.div
                key={version.version}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: versionIndex * 0.1 }}
                className="relative"
              >
                {/* Version Card */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg dark:shadow-xl p-6 border-2 border-orange-200 dark:border-orange-800 relative overflow-hidden">
                  {/* Beta Badge */}
                  <div className="absolute top-3 right-3">
                    <span className="bg-orange-500 dark:bg-orange-400 text-white dark:text-gray-900 text-xs font-medium px-2 py-1 rounded-full">
                      BETA
                    </span>
                  </div>

                  {/* Version Header */}
                  <div className="flex items-center gap-4 mb-4 pr-20">
                    <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-orange-400 to-orange-600 dark:from-orange-500 dark:to-orange-700 text-white rounded-full font-bold text-lg shadow-lg">
                      {version.version.split('.')[0]}
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                        v{version.version}
                      </h2>
                      <p className="text-sm text-orange-600 dark:text-orange-400 font-medium flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(version.date).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                        <span className="ml-2 text-xs bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 px-2 py-0.5 rounded-full">
                          Development Build
                        </span>
                      </p>
                    </div>
                  </div>

                  {/* Version Title */}
                  <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-4">
                    {version.title}
                  </h3>

                  {/* Features List */}
                  <div className="space-y-3">
                    {version.features.map((feature, featureIndex) => (
                      <motion.div
                        key={featureIndex}
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.4, delay: featureIndex * 0.05 }}
                        className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300"
                      >
                        <div className="flex items-center justify-center w-6 h-6 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full border-2 border-green-200 dark:border-green-700">
                          {feature.icon}
                        </div>
                        <span>{feature.text}</span>
                      </motion.div>
                    ))}
                  </div>

                  {/* Decorative Beta Elements */}
                  <div className="absolute -bottom-1 -right-1 w-16 h-16 bg-gradient-to-br from-orange-100 dark:from-orange-900/20 to-transparent rounded-full opacity-30"></div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Beta Development Notice */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="mt-16 bg-orange-50 dark:bg-gray-800 rounded-xl p-6 border border-orange-200 dark:border-orange-800"
          >
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-4">
                <TestTube className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  Active Beta Development
                </h3>
                <Construction className="w-5 h-5 text-orange-600 dark:text-orange-400" />
              </div>

              <p className="text-gray-700 dark:text-gray-300 mb-4 max-w-2xl mx-auto">
                SchoolOrganizer is currently in <span className="font-semibold text-orange-600 dark:text-orange-400">beta testing</span>.
                We're actively developing new features and improvements based on user feedback.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <a
                  href="https://forms.gle/wjR1nJdg8vFYeNcd6"
                  className="bg-orange-500 dark:bg-orange-600 text-white font-medium px-4 py-2 rounded-lg hover:bg-orange-600 dark:hover:bg-orange-700 transition-colors"
                >
                  Send Feedback
                </a>
                <a
                  href="https://docs.google.com/forms/d/e/1FAIpQLScaYx0Gg30L_g3HiEE3um0MAE8OKlCN7naJrRTiVjSyBUt0og/viewform?usp=header"
                  className="bg-white dark:bg-gray-700 text-orange-600 dark:text-orange-400 font-medium px-4 py-2 rounded-lg border border-orange-300 dark:border-orange-700 hover:bg-orange-50 dark:hover:bg-gray-600 transition-colors"
                >
                  Report Issues
                </a>
              </div>
            </div>
          </motion.div>

          {/* Footer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="text-center mt-12 p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg dark:shadow-xl border-2 border-orange-200 dark:border-orange-800"
          >
            <p className="text-gray-700 dark:text-gray-300">
              🚀 Stay tuned for version 1.0 - The complete study companion!
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              Built with ❤️ for students everywhere • <span className="text-orange-600 dark:text-orange-400">Beta v0.9.1</span>
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
