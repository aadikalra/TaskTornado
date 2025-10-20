'use client';

import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { ArrowUpRight, Plus, FileText, BarChart2, Signal, Star, Layers, Wrench, Shield, Box, TrendingUp, BookOpen, CalendarDays, ClipboardList, Bell, Check, Factory, BarChart3, MoreVertical, ArrowUp, Sparkles, MessageSquare, CheckCircle, ShieldAlert, CheckCircle2, Users, Clock, Brain, Image as ImageIcon } from 'lucide-react';
import React, { useState } from 'react';
import LandingNavbar from '@/components/LandingNavbar';
import Hero from './Hero';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#F8FBF9] dark:bg-gray-900 overflow-x-hidden font-sans pt-12">
      {/* Background Gradient */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-[#E6F5D8] via-[#F8FBF9] to-[#F8FBF9] dark:from-gray-900 dark:via-gray-900 dark:to-gray-900 -z-10" />

      <LandingNavbar/>

      {/* Hero Section */}
      <Hero/>

      {/* Services Section */}
      <section id="features" className="min-h-screen flex items-center bg-[#0d363c] dark:bg-gray-800 text-white py-20">
        <div className="w-full">
          <div className="max-w-5xl mx-auto text-center mb-20">
            <h2 className="text-5xl font-bold mb-6 text-white">Everything You Need to Succeed</h2>
            <p className="text-gray-400 dark:text-gray-300 text-xl max-w-3xl mx-auto">Powerful tools designed for serious students, from homework tracking to AI-powered assistance.</p>
          </div>

          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-6">
            {/* Feature Card 1 */}
            <ServiceCard
              icon={<MessageSquare className="w-6 h-6 stroke-1" />}
              title="AI Study Assistant"
              description="Get instant help with homework, explanations, and study guidance powered by advanced AI technology."
            />

            {/* Feature Card 2 */}
            <ServiceCard
              icon={<ClipboardList className="w-6 h-6 stroke-1" />}
              title="Homework Tracker"
              description="Organize assignments with priority levels, due dates, and progress tracking for all your classes."
            />

            {/* Feature Card 3 */}
            <ServiceCard
              icon={<BookOpen className="w-6 h-6 stroke-1" />}
              title="Flashcard System"
              description="Create, study, and master subjects with our intelligent flashcard system and spaced repetition."
            />

            {/* Feature Card 4 */}
            <ServiceCard
              icon={<Users className="w-6 h-6 stroke-1" />}
              title="Study Groups"
              description="Collaborate with classmates, share resources, and study together in virtual study rooms."
            />

            {/* Feature Card 5 */}
            <ServiceCard
              icon={<Clock className="w-6 h-6 stroke-1" />}
              title="Study Timer"
              description="Track your study sessions with customizable timers and productivity analytics."
            />

            {/* Feature Card 6 */}
            <ServiceCard
              icon={<CalendarDays className="w-6 h-6 stroke-1" />}
              title="Calendar Integration"
              description="Sync assignments and deadlines with your calendar to never miss important dates."
            />
          </div>
        </div>
      </section>

      {/* AI Features Section */}
      <section id="ai-assistant" className="pt-16 pb-16 bg-gradient-to-b from-white to-teal-50 dark:from-gray-800 dark:to-gray-900">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              AI-Powered Study Assistant
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Get instant help with your studies using our advanced AI assistant
            </p>
          </div>

          {/* AI Commands Card */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mb-16 border border-gray-100 dark:border-gray-700">
            <div className="flex flex-col md:flex-row gap-8">
              <div className="md:w-1/2">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">AI Assistant Commands</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  Use these special commands to quickly access powerful features:
                </p>
                <div className="space-y-4">
                  {[
                    {
                      command: '@homework',
                      description: 'Get help with assignments and track due dates',
                      example: '@homework What do I have due this week?'
                    },
                    {
                      command: '@control',
                      description: 'Manage your tasks and assignments',
                      example: '@control mark math homework as done'
                    },
                    {
                      command: '@resources',
                      description: 'Find study materials and learning resources',
                      example: '@resources for calculus 2'
                    },
                    {
                      command: '@flashcards',
                      description: 'Create and study with AI-generated flashcards',
                      example: '@flashcards for biology chapter 3'
                    },
                    {
                      command: '@therapist',
                      description: 'Get support for stress and mental health',
                      example: '@therapist I\'m feeling overwhelmed'
                    }
                  ].map((item, index) => (
                    <div key={index} className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg border border-gray-100 dark:border-gray-600">
                      <div className="font-mono text-teal-600 dark:text-teal-400 font-medium mb-1">{item.command}</div>
                      <p className="text-gray-600 dark:text-gray-300 text-sm mb-1">{item.description}</p>
                      <div className="text-xs text-gray-500 dark:text-gray-400 font-mono bg-gray-100 dark:bg-gray-600 px-2 py-1 rounded">
                        {item.example}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="md:w-1/2 bg-gray-50 dark:bg-gray-700 rounded-xl p-6 flex items-center justify-center">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-teal-100 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400 mb-4">
                    <MessageSquare className="w-8 h-8" />
                  </div>
                  <h4 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Try it out!</h4>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    Open the AI Assistant and type any of these commands to get started.
                  </p>
                  <a
                    href="/signin"
                    className="inline-flex items-center px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white font-medium rounded-lg transition-colors"
                  >
                    Sign In to Get Started
                    <ArrowUpRight className="w-4 h-4 ml-2" />
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* AI Feature 1 */}
            <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-teal-100 dark:bg-teal-900/30 rounded-lg flex items-center justify-center mb-6">
                <MessageSquare className="w-6 h-6 text-teal-700 dark:text-teal-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">Interactive Chat</h3>
              <p className="text-gray-600 dark:text-gray-300">Get instant answers to your questions and explanations for difficult concepts with our AI tutor.</p>
            </div>

            {/* AI Feature 2 */}
            <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-teal-100 dark:bg-teal-900/30 rounded-lg flex items-center justify-center mb-6">
                <Brain className="w-6 h-6 text-teal-700 dark:text-teal-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">Smart AI Models</h3>
              <p className="text-gray-600 dark:text-gray-300">Choose between Quick mode (Gemma) for fast responses or Deep mode (Gemini) for more thoughtful analysis.</p>
            </div>

            {/* AI Feature 3 */}
            <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-teal-100 dark:bg-teal-900/30 rounded-lg flex items-center justify-center mb-6">
                <ImageIcon className="w-6 h-6 text-teal-700 dark:text-teal-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">Visual Learning</h3>
              <p className="text-gray-600 dark:text-gray-300">Upload images of homework problems and get AI-powered explanations and solutions.</p>
            </div>

            {/* AI Feature 4 */}
            <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-teal-100 dark:bg-teal-900/30 rounded-lg flex items-center justify-center mb-6">
                <BookOpen className="w-6 h-6 text-teal-700 dark:text-teal-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">Smart Flashcards</h3>
              <p className="text-gray-600 dark:text-gray-300">Generate and study with AI-created flashcards that adapt to your learning progress.</p>
            </div>

            {/* AI Feature 5 */}
            <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-teal-100 dark:bg-teal-900/30 rounded-lg flex items-center justify-center mb-6">
                <CheckCircle className="w-6 h-6 text-teal-700 dark:text-teal-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">Rate Limits</h3>
              <p className="text-gray-600 dark:text-gray-300">Daily usage limits ensure fair access - 30 messages in Quick mode, 10 in Deep mode per day.</p>
            </div>

            {/* AI Feature 6 */}
            <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-teal-100 dark:bg-teal-900/30 rounded-lg flex items-center justify-center mb-6">
                <Sparkles className="w-6 h-6 text-teal-700 dark:text-teal-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">Therapist Mode</h3>
              <p className="text-gray-600 dark:text-gray-300">Access mental health support and stress management guidance when you need it most.</p>
            </div>
          </div>

          <div className="mt-12 bg-teal-50 dark:bg-teal-900/20 rounded-2xl p-8 md:p-12 border border-teal-100 dark:border-teal-800">
            <div className="max-w-4xl mx-auto">
              <div className="flex flex-col md:flex-row items-center gap-8">
                <div className="md:w-1/2">
                  <h3 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-4">Try Our AI Tutor</h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-6">
                    Experience the future of learning with our AI-powered tutor. Get instant help with homework, exam prep, and concept explanations.
                  </p>
                  <ul className="space-y-3 mb-8">
                    {[
                      '24/7 availability',
                      'Personalized learning',
                      'Instant feedback',
                      'Multi-subject support'
                    ].map((feature, i) => (
                      <li key={i} className="flex items-center">
                        <CheckCircle className="w-5 h-5 text-teal-600 dark:text-teal-500 mt-0.5 mr-2" />
                        <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Link
                    href="/login"
                    className="bg-teal-700 hover:bg-teal-800 dark:bg-teal-600 dark:hover:bg-teal-700 text-white font-medium py-2.5 px-6 rounded-lg transition-colors inline-flex items-center cursor-pointer"
                  >
                    Sign In to Get Started
                  </Link>
                </div>
                <div className="md:w-1/2 mt-8 md:mt-0">
                  <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-full bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center">
                        <Sparkles className="w-5 h-5 text-teal-700 dark:text-teal-600" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white">AI Tutor</h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Online</p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                        <p className="text-sm text-gray-700 dark:text-gray-300">How can I help with your studies today?</p>
                      </div>
                      <div className="bg-teal-50 dark:bg-teal-900/20 p-3 rounded-lg border border-teal-100 dark:border-teal-800">
                        <p className="text-sm text-gray-700 dark:text-gray-300">I can help explain concepts, create study materials, or help with homework. Just ask me anything!</p>
                      </div>
                    </div>
                    <div className="mt-4 flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="Ask me anything..."
                        className="flex-1 text-sm border border-gray-200 dark:border-gray-600 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                      />
                      <button className="p-2.5 bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-600 rounded-lg hover:bg-teal-200 dark:hover:bg-teal-900/50 transition-colors">
                        <ArrowUp className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* AI Guidelines Mini-Section */}
      <section className="py-16 bg-white dark:bg-gray-900">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-teal-50 dark:bg-teal-900/30 mb-5 border border-teal-100 dark:border-teal-800">
            <ShieldAlert className="w-6 h-6 text-teal-700 dark:text-teal-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Responsible AI Use</h3>
          <p className="text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto text-lg">
            We're committed to ethical AI that enhances learning while maintaining academic integrity.
            Our AI tools are designed to support your education, not replace your learning journey.
          </p>
          <a
            href="/ai-guidelines"
            className="inline-flex items-center px-6 py-3 text-sm font-medium text-teal-700 dark:text-teal-400 hover:text-teal-800 dark:hover:text-teal-300 hover:bg-teal-50 dark:hover:bg-teal-900/30 rounded-lg border border-teal-200 dark:border-teal-700 transition-colors"
          >
            Read our AI Guidelines
            <ArrowUpRight className="w-4 h-4 ml-1.5" />
          </a>
        </div>
      </section>

      {/* Divider */}
      <div className="h-px bg-gradient-to-r from-transparent via-gray-200 dark:via-gray-700 to-transparent"></div>

      {/* Features Section */}
      <section id="pricing" className="py-20 bg-gray-900 dark:bg-gray-800 text-white">
        <div className="max-w-7xl mx-auto px-6">
          {/* Section Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-4 py-1.5 rounded-full text-sm font-medium bg-teal-900/30 text-teal-400 mb-4 border border-teal-500/30">
              <Sparkles className="w-4 h-4 mr-2" />
              All Features Included
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-white">
              Everything You Need to Succeed
            </h2>
            <p className="text-gray-400 dark:text-gray-300 text-xl">
              All features are completely free, forever. No hidden fees, no premium paywalls.
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              {
                icon: <BookOpen className="w-6 h-6 text-teal-400" />,
                title: "Unlimited Classes",
                description: "Track all your courses without any limits."
              },
              {
                icon: <CalendarDays className="w-6 h-6 text-teal-400" />,
                title: "Smart Planner",
                description: "Never miss an assignment or exam date."
              },
              {
                icon: <MessageSquare className="w-6 h-6 text-teal-400" />,
                title: "AI Study Assistant",
                description: "Get help with homework and study questions."
              },
              {
                icon: <BarChart2 className="w-6 h-6 text-teal-400" />,
                title: "Progress Tracking",
                description: "Visualize your academic performance."
              },
              {
                icon: <ClipboardList className="w-6 h-6 text-teal-400" />,
                title: "Assignment Manager",
                description: "Keep all your work organized in one place."
              },
              {
                icon: <Bell className="w-6 h-6 text-teal-400" />,
                title: "Smart Reminders",
                description: "Get notified about upcoming deadlines."
              }
            ].map((feature, index) => (
              <div key={index} className="bg-gray-800/50 dark:bg-gray-700/50 p-6 rounded-xl border border-gray-700/50 dark:border-gray-600/50 hover:border-teal-500/30 transition-colors">
                <div className="w-12 h-12 rounded-lg bg-teal-900/30 flex items-center justify-center mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-2 text-white">{feature.title}</h3>
                <p className="text-gray-400 dark:text-gray-300">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-50 dark:bg-gray-800 pt-12 pb-6 px-4 sm:px-6 lg:px-8 border-t border-gray-200 dark:border-gray-700">
        <div className="max-w-6xl mx-auto text-center">
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 flex items-center justify-center mb-4">
              <img src="/favicon-32x32.png" alt="SchoolOrganizer Logo" className="w-10 h-10" />
            </div>
            <p className="text-gray-600 dark:text-gray-300 max-w-md mb-6">
              Helping students stay organized and on top of their academic journey.
            </p>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              {new Date().getFullYear()} SchoolOrganizer. All rights reserved
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Service Card Component
function ServiceCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="bg-[#143e44] dark:bg-gray-700 p-8 rounded-xl hover:bg-opacity-90 dark:hover:bg-gray-600 transition-all duration-300 cursor-pointer group h-72 flex flex-col">
      <div className="flex justify-between items-start mb-4">
        <div className="text-white">
          {icon}
        </div>
        <ArrowUpRight className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
      </div>
      <h3 className="text-2xl font-semibold mb-4 text-white">{title}</h3>
      <p className="text-gray-400 dark:text-gray-300 text-base flex-grow">{description}</p>
    </div>
  );
}

function HoverCheckButton({ href, text }: { href: string; text: string }) {
  const [hovered, setHovered] = React.useState(false);

  const messages = ["Good Job!", "CLICK!", "100% Free!", "Nice!"];

  // Predefined positions around the button
  const positions = [
    { x: -40, y: -44 }, // top-left
    { x: 40, y: -44 },  // top-right
    { x: -40, y: 44 },  // bottom-left
    { x: 40, y: 44 },   // bottom-right
  ];

  // Randomly assign each message to a position
  const assignedPositions = React.useMemo(() => {
    const shuffled = positions.sort(() => 0.5 - Math.random());
    return messages.map((msg, i) => ({
      msg,
      pos: shuffled[i % shuffled.length],
    }));
  }, [messages]);

  return (
    <div className="relative flex items-center">
      <Link
        href={href}
        className="px-8 py-3 bg-teal-800 text-white font-medium rounded-full hover:bg-teal-900 transition-colors text-center flex items-center justify-center relative z-10"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {text}
      </Link>

      <AnimatePresence>
        {hovered && (
          <>
            {/* Floating encouragement bubbles in pre-programmed positions */}
            {assignedPositions.map(({ msg, pos }, i) => (
              <motion.div
                key={msg}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, x: pos.x, y: pos.y, scale: 1 }}
                exit={{ opacity: 0, x: pos.x, y: pos.y - 10, scale: 0 }}
                transition={{ type: "spring", stiffness: 200, damping: 15, delay: i * 0.1 }}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 px-2 py-1 bg-teal-100 text-teal-800 text-xs rounded-full font-semibold shadow-md"
              >
                {msg}
              </motion.div>
            ))}
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
