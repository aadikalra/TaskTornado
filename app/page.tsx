'use client';

import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { ArrowUpRight, Plus, FileText, BarChart2, Signal, Star, Layers, Wrench, Shield, Box, TrendingUp, BookOpen, CalendarDays, ClipboardList, Bell, Check, Factory, BarChart3, MoreVertical, ArrowUp, Sparkles, MessageSquare, CheckCircle, ShieldAlert, CheckCircle2, Users, Clock, Brain, Image as ImageIcon, Zap } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import LandingNavbar from '@/components/LandingNavbar';
import Hero from './Hero';
import confetti from 'canvas-confetti';

export default function LandingPage() {
  useEffect(() => {
    // Confetti effect on page load
    const duration = 3000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    function randomInRange(min: number, max: number) {
      return Math.random() * (max - min) + min;
    }

    const interval: any = setInterval(function () {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);

      confetti(Object.assign({}, defaults, {
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
      }));
      confetti(Object.assign({}, defaults, {
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
      }));
    }, 250);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 overflow-x-hidden font-sans">
      <LandingNavbar />

      {/* Clean Beta Banner */}
      <div className="bg-[#275085] dark:bg-[#1f3f6b] mt-16">
        <div className="max-w-7xl mx-auto flex items-center justify-center gap-3 py-3 px-4">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200 }}
            className="flex items-center gap-3 text-white"
          >
            <Sparkles className="w-4 h-4" />
            <span className="text-sm font-medium">v1.0 Just Released — Public Beta Now Live!</span>
            <Link
              href="/changelog"
              className="flex items-center gap-1 px-3 py-1 bg-white/20 hover:bg-white/30 rounded-md text-xs font-medium transition-colors"
            >
              Learn More
              <ArrowUpRight className="w-3 h-3" />
            </Link>
          </motion.div>
        </div>
      </div>

      {/* Hero Section */}
      <Hero />

      {/* Clean Services Section */}
      <section id="features" className="py-24 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-3xl mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <span className="inline-block px-3 py-1 text-sm font-medium text-[#275085] dark:text-[#4a7ba7] bg-[#275085]/10 dark:bg-[#275085]/5 rounded-md mb-4">
                Features
              </span>
              <h2 className="text-5xl font-bold mb-4 text-gray-900 dark:text-white">
                Everything you need to excel
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-400">
                Powerful tools designed for students who want to stay organized and achieve more.
              </p>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <CleanServiceCard
              icon={<MessageSquare className="w-6 h-6" />}
              title="AI Study Assistant"
              description="Get instant help with homework, explanations, and study guidance powered by advanced AI technology."
              delay={0}
            />

            <CleanServiceCard
              icon={<ClipboardList className="w-6 h-6" />}
              title="Homework Tracker"
              description="Organize assignments with priority levels, due dates, and progress tracking for all your classes."
              delay={0.1}
            />

            <CleanServiceCard
              icon={<BookOpen className="w-6 h-6" />}
              title="Flashcard System"
              description="Create, study, and master subjects with our intelligent flashcard system and spaced repetition."
              delay={0.2}
            />

            <CleanServiceCard
              icon={<Users className="w-6 h-6" />}
              title="Group Chats"
              description="Collaborate with classmates, share resources, and study together in virtual study rooms."
              delay={0.3}
            />

            <CleanServiceCard
              icon={<Clock className="w-6 h-6" />}
              title="Study Timer"
              description="Track your study sessions with customizable timers and productivity analytics."
              delay={0.4}
            />

            <CleanServiceCard
              icon={<CalendarDays className="w-6 h-6" />}
              title="Calendar Integration"
              description="Sync assignments and deadlines with your calendar to never miss important dates."
              delay={0.5}
            />
          </div>
        </div>
      </section>

      {/* Clean AI Features Section */}
      <section id="ai-assistant" className="py-24 bg-white dark:bg-gray-950">
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-3xl mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <span className="inline-block px-3 py-1 text-sm font-medium text-[#275085] dark:text-[#4a7ba7] bg-[#275085]/10 dark:bg-[#275085]/5 rounded-md mb-4">
                AI Assistant
              </span>
              <h2 className="text-5xl font-bold text-gray-900 dark:text-white mb-4">
                Your personal AI study companion
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-400">
                Get instant, intelligent help with your studies using our advanced AI assistant
              </p>
            </motion.div>
          </div>

          {/* AI Commands Card */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-gray-50 dark:bg-gray-900 rounded-2xl p-8 md:p-12 mb-16 border border-gray-200 dark:border-gray-800"
          >
            <div className="flex flex-col lg:flex-row gap-12">
              <div className="lg:w-1/2">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-[#275085] dark:bg-[#1f3f6b] rounded-lg">
                    <MessageSquare className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">AI Commands</h3>
                </div>
                <p className="text-gray-600 dark:text-gray-400 mb-8">
                  Use these special commands to quickly access powerful features:
                </p>
                <div className="space-y-3">
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
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-[#275085]/50 dark:hover:border-[#275085]/70 transition-colors"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <span className="px-2 py-1 bg-[#275085] dark:bg-[#1f3f6b] text-white text-xs font-mono font-semibold rounded">
                          {item.command}
                        </span>
                      </div>
                      <p className="text-gray-700 dark:text-gray-300 text-sm mb-2">{item.description}</p>
                      <div className="text-xs text-gray-500 dark:text-gray-500 font-mono bg-gray-100 dark:bg-gray-900 px-3 py-2 rounded border border-gray-200 dark:border-gray-700">
                        {item.example}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              <div className="lg:w-1/2 flex items-center">
                <div className="w-full bg-white dark:bg-gray-800 rounded-xl p-8 border border-gray-200 dark:border-gray-700">
                  <div className="text-center space-y-6">
                    <div className="mx-auto flex items-center justify-center w-16 h-16 rounded-xl bg-[#275085] dark:bg-[#1f3f6b] text-white">
                      <Sparkles className="w-8 h-8" />
                    </div>

                    <h4 className="text-2xl font-bold text-gray-900 dark:text-white">
                      Ready to get started?
                    </h4>

                    <p className="text-gray-600 dark:text-gray-400">
                      Launch the AI assistant and upgrade your workflow instantly.
                    </p>

                    <Link
                      href="/signin"
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-[#275085] hover:bg-[#1f3f6b] dark:bg-[#1f3f6b] dark:hover:bg-[#275085] text-white font-medium transition-colors"
                    >
                      Sign In
                      <ArrowUpRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* AI Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {[
              {
                icon: <MessageSquare className="w-6 h-6" />,
                title: "Interactive Chat",
                description: "Get instant answers to your questions and explanations for difficult concepts with our AI tutor."
              },
              {
                icon: <Brain className="w-6 h-6" />,
                title: "Smart AI Models",
                description: "Choose between Quick mode (Gemma) for fast responses or Deep mode (Gemini) for thoughtful analysis."
              },
              {
                icon: <ImageIcon className="w-6 h-6" />,
                title: "Visual Learning",
                description: "Upload images of homework problems and get AI-powered explanations and solutions."
              },
              {
                icon: <BookOpen className="w-6 h-6" />,
                title: "Smart Flashcards",
                description: "Generate and study with AI-created flashcards that adapt to your learning progress."
              },
              {
                icon: <CheckCircle className="w-6 h-6" />,
                title: "Fair Usage",
                description: "Daily limits ensure fair access - 30 messages in Quick mode, 10 in Deep mode per day."
              },
              {
                icon: <Sparkles className="w-6 h-6" />,
                title: "Therapist Mode",
                description: "Access mental health support and stress management guidance when you need it most."
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-gray-50 dark:bg-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 transition-colors"
              >
                <div className="w-12 h-12 bg-[#275085] dark:bg-[#1f3f6b] rounded-lg flex items-center justify-center mb-4 text-white">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-bold mb-2 text-gray-900 dark:text-white">{feature.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>

          {/* CTA Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="bg-[#275085] dark:bg-[#1f3f6b] rounded-2xl overflow-hidden"
          >
            <div className="p-12 md:p-16">
              <div className="max-w-5xl mx-auto">
                <div className="flex flex-col lg:flex-row items-center gap-12">
                  <div className="lg:w-1/2 text-white">
                    <h3 className="text-4xl font-bold mb-6">Experience AI-powered learning</h3>
                    <p className="text-white/90 text-lg mb-8 leading-relaxed">
                      Transform your study routine with our intelligent AI tutor. Get instant help, personalized feedback, and support whenever you need it.
                    </p>
                    <ul className="space-y-3 mb-10">
                      {[
                        '24/7 AI assistance',
                        'Personalized learning paths',
                        'Instant feedback & explanations',
                        'Multi-subject expertise'
                      ].map((feature, i) => (
                        <motion.li
                          key={i}
                          initial={{ opacity: 0, x: -20 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: i * 0.1 }}
                          className="flex items-center text-white/90"
                        >
                          <Check className="w-5 h-5 mr-3" />
                          <span>{feature}</span>
                        </motion.li>
                      ))}
                    </ul>
                    <Link
                      href="/login"
                      className="inline-flex items-center px-8 py-3 bg-white text-[#275085] font-semibold rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Start Learning Now
                      <ArrowUpRight className="w-5 h-5 ml-2" />
                    </Link>
                  </div>

                  <div className="lg:w-1/2">
                    <div className="bg-white/10 dark:bg-black/20 backdrop-blur-sm p-6 rounded-xl border border-white/20 dark:border-white/10">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 rounded-full bg-white dark:bg-gray-100 flex items-center justify-center">
                          <Sparkles className="w-6 h-6 text-[#275085] dark:text-blue-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-white">AI Study Assistant</h4>
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-green-400"></div>
                            <p className="text-xs text-white/90">Online & Ready</p>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div className="bg-white/20 dark:bg-black/30 backdrop-blur-sm p-3 rounded-lg">
                          <p className="text-white dark:text-gray-100 text-sm">How can I help with your studies today?</p>
                        </div>
                        <div className="bg-white/30 dark:bg-black/40 backdrop-blur-sm p-3 rounded-lg">
                          <p className="text-white dark:text-gray-100 text-sm">I can explain concepts, create study materials, solve problems, and more.</p>
                        </div>
                      </div>
                      <div className="mt-4 flex items-center gap-2">
                        <input
                          type="text"
                          placeholder="Ask me anything..."
                          className="flex-1 bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg px-4 py-2 text-sm text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50"
                        />
                        <button className="p-2 bg-white/30 hover:bg-white/40 backdrop-blur-sm text-white rounded-lg transition-colors">
                          <ArrowUp className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* AI Guidelines Section */}
      <section className="py-24 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-[#275085] dark:bg-[#1f3f6b] mb-6">
              <ShieldAlert className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Ethical AI use</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto text-lg">
              We're committed to responsible AI that enhances learning while maintaining academic integrity.
              Our tools are designed to support your education, not replace your learning journey.
            </p>
            <Link
              href="/ai-guidelines"
              className="inline-flex items-center px-6 py-3 bg-[#275085] hover:bg-[#1f3f6b] dark:bg-[#1f3f6b] dark:hover:bg-[#275085] text-white font-medium rounded-lg transition-colors"
            >
              Read Our AI Guidelines
              <ArrowUpRight className="w-4 h-4 ml-2" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 bg-white dark:bg-gray-950">
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-3xl mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <span className="inline-block px-3 py-1 text-sm font-medium text-[#275085] dark:text-[#4a7ba7] bg-[#275085]/10 dark:bg-[#275085]/5 rounded-md mb-4">
                Free Forever
              </span>
              <h2 className="text-5xl font-bold mb-4 text-gray-900 dark:text-white">
                All features included
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-400">
                No hidden fees, no premium tiers, no paywalls. Everything you need to succeed.
              </p>
            </motion.div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl">
            {[
              {
                icon: <BookOpen className="w-6 h-6" />,
                title: "Unlimited Classes",
                description: "Track all your courses without any limits."
              },
              {
                icon: <CalendarDays className="w-6 h-6" />,
                title: "Smart Planner",
                description: "Never miss an assignment or exam date."
              },
              {
                icon: <MessageSquare className="w-6 h-6" />,
                title: "AI Study Assistant",
                description: "Get help with homework and study questions."
              },
              {
                icon: <BarChart2 className="w-6 h-6" />,
                title: "Progress Tracking",
                description: "Visualize your academic performance."
              },
              {
                icon: <ClipboardList className="w-6 h-6" />,
                title: "Assignment Manager",
                description: "Keep all your work organized in one place."
              },
              {
                icon: <Bell className="w-6 h-6" />,
                title: "Smart Reminders",
                description: "Get notified about upcoming deadlines."
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-gray-50 dark:bg-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 transition-colors"
              >
                <div className="w-12 h-12 rounded-lg bg-[#275085] dark:bg-[#1f3f6b] flex items-center justify-center mb-4 text-white">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-bold mb-2 text-gray-900 dark:text-white">{feature.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-50 dark:bg-gray-900 pt-16 pb-8 px-6 border-t border-gray-200 dark:border-gray-800">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-[#275085] dark:bg-[#1f3f6b] mb-4"
            >
              <img src="/TaskTornadoDark.svg" alt="Task Tornado Logo" className="w-8 h-8" />
            </motion.div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Task Tornado</h3>
            <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
              Empowering students to achieve their full potential through intelligent organization and AI-powered assistance.
            </p>
          </div>

          <div className="border-t border-gray-200 dark:border-gray-800 pt-6 text-center">
            <p className="text-gray-500 dark:text-gray-500 text-sm">
              © {new Date().getFullYear()} Task Tornado. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Clean Service Card Component
function CleanServiceCard({ icon, title, description, delay }: {
  icon: React.ReactNode,
  title: string,
  description: string,
  delay: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.5 }}
      className="group bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 transition-colors"
    >
      <div className="flex justify-between items-start mb-4">
        <div className="w-12 h-12 rounded-lg bg-[#275085] dark:bg-[#1f3f6b] flex items-center justify-center text-white">
          {icon}
        </div>
        <ArrowUpRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors" />
      </div>
      <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">{title}</h3>
      <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">{description}</p>
    </motion.div>
  );
}

function HoverCheckButton({ href, text }: { href: string; text: string }) {
  const [hovered, setHovered] = React.useState(false);

  const messages = ["Let's Go!", "CLICK!", "100% Free!", "Nice!"];

  const positions = [
    { x: -40, y: -44 },
    { x: 40, y: -44 },
    { x: -40, y: 44 },
    { x: 40, y: 44 },
  ];

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
        className="px-8 py-3 bg-[#275085] hover:bg-[#1f3f6b] dark:bg-[#1f3f6b] dark:hover:bg-[#275085] text-white font-semibold rounded-lg transition-colors text-center flex items-center justify-center relative z-10"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {text}
      </Link>

      <AnimatePresence>
        {hovered && (
          <>
            {assignedPositions.map(({ msg, pos }, i) => (
              <motion.div
                key={msg}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, x: pos.x, y: pos.y, scale: 1 }}
                exit={{ opacity: 0, x: pos.x, y: pos.y - 10, scale: 0 }}
                transition={{ type: "spring", stiffness: 200, damping: 15, delay: i * 0.1 }}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 px-3 py-1.5 bg-[#275085] text-white text-xs rounded-md font-semibold"
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