'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowUpRight, CheckCircle2, Check, Shield, Zap, BookOpen, CalendarDays, MessageSquare, Terminal, Heart, Sparkles, Brain, Image as ImageIcon, TrendingUp, Clock, Users, ShieldAlert, Bell, ChevronDown } from 'lucide-react';
import React, { useState } from 'react';
import LandingNavbar from '@/components/LandingNavbar';
import Hero from './Hero';

export default function LandingPage() {
  const [comparisonSet, setComparisonSet] = useState<'chatgpt-notion' | 'gemini-google'>('chatgpt-notion');

  const comparisonData: Record<'chatgpt-notion' | 'gemini-google', {
    name: string;
    tool1: {
      name: string;
      icon: React.ReactNode;
      color: string;
      description: string;
    };
    tool2: {
      name: string;
      icon: React.ReactNode;
      color: string;
      description: string;
    };
    features: Array<{
      feature: string;
      tasktornado: string;
      tool1: string;
      tool2: string;
    }>;
  }> = {
    'chatgpt-notion': {
      name: 'ChatGPT + Notion',
      tool1: {
        name: 'ChatGPT',
        icon: <MessageSquare className="w-4 h-4 text-white" />,
        color: 'bg-green-500',
        description: 'AI chatbot'
      },
      tool2: {
        name: 'Notion',
        icon: <BookOpen className="w-4 h-4 text-white" />,
        color: 'bg-gray-700',
        description: 'Note-taking app'
      },
      features: [
        {
          feature: "Assignment Tracking",
          tasktornado: "✓ Smart deadline alerts & progress tracking",
          tool1: "✗ Manual tracking required",
          tool2: "✓ Requires setup & maintenance"
        },
        {
          feature: "AI Study Help",
          tasktornado: "✓ Built-in tutor with visual learning",
          tool1: "✓ Excellent AI assistance",
          tool2: "✗ No AI capabilities"
        },
        {
          feature: "Calendar Integration",
          tasktornado: "✓ Auto-syncs with your classes",
          tool1: "✗ No calendar features",
          tool2: "✗ Manual calendar setup"
        },
        {
          feature: "Flashcard System",
          tasktornado: "✓ AI-generated decks with spaced repetition",
          tool1: "✗ Can generate text only, no study system",
          tool2: "✗ Basic templates only"
        },
        {
          feature: "Command Workflow",
          tasktornado: "✓ @commands for instant actions",
          tool1: "✗ No specialized commands",
          tool2: "✗ No command system"
        },
        {
          feature: "Student-Focused",
          tasktornado: "✓ Built specifically for students",
          tool1: "✗ General-purpose tool",
          tool2: "✗ Professional productivity focus"
        },
        {
          feature: "Pricing",
          tasktornado: "✓ Completely free forever",
          tool1: "✗ $20/month for Plus features",
          tool2: "✗ $10/month for personal plan"
        },
        {
          feature: "Setup Time",
          tasktornado: "✓ <2 minutes to get started",
          tool1: "✓ Instant but limited",
          tool2: "✗ Hours of template setup"
        }
      ]
    },
    'gemini-google': {
      name: 'Gemini + Google Tasks',
      tool1: {
        name: 'Gemini',
        icon: <Brain className="w-4 h-4 text-white" />,
        color: 'bg-blue-500',
        description: 'Google AI assistant'
      },
      tool2: {
        name: 'Google Tasks',
        icon: <CalendarDays className="w-4 h-4 text-white" />,
        color: 'bg-yellow-500',
        description: 'Task management'
      },
      features: [
        {
          feature: "Assignment Tracking",
          tasktornado: "✓ Smart deadline alerts & progress tracking",
          tool1: "✗ No dedicated task system",
          tool2: "✓ Basic tasks, no school features"
        },
        {
          feature: "AI Study Help",
          tasktornado: "✓ Built-in tutor with visual learning",
          tool1: "✓ Good AI assistance",
          tool2: "✗ No AI capabilities"
        },
        {
          feature: "Calendar Integration",
          tasktornado: "✓ Auto-syncs with your classes",
          tool1: "✗ No calendar features",
          tool2: "✓ Syncs with Google Calendar only"
        },
        {
          feature: "Flashcard System",
          tasktornado: "✓ AI-generated decks with spaced repetition",
          tool1: "✗ Can generate text only, no study system",
          tool2: "✗ No flashcard features"
        },
        {
          feature: "Command Workflow",
          tasktornado: "✓ @commands for instant actions",
          tool1: "✗ No specialized commands",
          tool2: "✗ No command system"
        },
        {
          feature: "Student-Focused",
          tasktornado: "✓ Built specifically for students",
          tool1: "✗ General-purpose tool",
          tool2: "✗ General productivity tool"
        },
        {
          feature: "Pricing",
          tasktornado: "✓ Completely free forever",
          tool1: "✗ $20/month for Advanced features",
          tool2: "✓ Free with Google Account"
        },
        {
          feature: "Setup Time",
          tasktornado: "✓ 2 minutes to get started",
          tool1: "✓ Instant but limited",
          tool2: "✓ 5-10 minutes setup"
        }
      ]
    }
  };

  const currentComparison = comparisonData[comparisonSet];
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 overflow-x-hidden font-sans">
      <LandingNavbar />

      {/* Beta Banner */}
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

      {/* 1. HERO SECTION */}
      <Hero />

      {/* 2. ORGANIZATION - The Foundation */}
      <section id="organization" className="py-24 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Text Content */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <span className="inline-block px-3 py-1 text-sm font-medium text-[#275085] dark:text-[#4a7ba7] bg-[#275085]/10 dark:bg-[#275085]/5 rounded-md mb-4">
                The Foundation
              </span>
              <h2 className="text-5xl font-bold mb-6 text-gray-900 dark:text-white">
                Never miss a deadline again
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
                Throw away the paper planner. TaskTornado centralizes your school life in one powerful dashboard.
              </p>

              <div className="space-y-4">
                {[
                  { icon: <CalendarDays className="w-5 h-5" />, title: "Smart Calendar", desc: "Syncs assignments across all your classes" },
                  { icon: <Bell className="w-5 h-5" />, title: "Intelligent Alerts", desc: "Get notified before you fall behind" },
                  { icon: <TrendingUp className="w-5 h-5" />, title: "Progress Tracking", desc: "Visual insights into your grades and completion rates" }
                ].map((feature, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-start gap-4 p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700"
                  >
                    <div className="w-10 h-10 rounded-lg bg-[#275085] dark:bg-[#1f3f6b] flex items-center justify-center text-white shrink-0">
                      {feature.icon}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 dark:text-white mb-1">{feature.title}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{feature.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Visual - Dashboard Preview */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative"
            >
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">Today's Homework</h3>
                  <span className="text-sm text-gray-500 dark:text-gray-400">3 tasks</span>
                </div>
                <div className="space-y-3">
                  {[
                    { subject: "Math", task: "Chapter 8 Problems", checked: true },
                    { subject: "History", task: "WWII Essay Draft", checked: false },
                    { subject: "Science", task: "Lab Report", checked: false }
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${item.checked ? 'bg-[#275085] border-[#275085]' : 'border-gray-300 dark:border-gray-600'}`}>
                        {item.checked && <Check className="w-3 h-3 text-white" />}
                      </div>
                      <div className="flex-1">
                        <p className={`font-medium ${item.checked ? 'line-through text-gray-400' : 'text-gray-900 dark:text-white'}`}>
                          {item.task}
                        </p>
                        <p className="text-xs text-gray-500">{item.subject}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 3. AI TUTOR - The Engine */}
      <section className="py-24 bg-white dark:bg-gray-950">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Visual - AI Chat Preview */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="order-2 lg:order-1"
            >
              <div className="bg-linear-to-br from-[#275085] to-[#1f3f6b] rounded-2xl shadow-2xl p-6 text-white">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                    <Brain className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold">AI Tutor</h4>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-400" />
                      <span className="text-xs opacity-90">Online & Ready</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="bg-white/10 backdrop-blur-sm p-3 rounded-lg">
                    <p className="text-sm">Can you explain the quadratic formula?</p>
                  </div>
                  <div className="bg-white/20 backdrop-blur-sm p-3 rounded-lg">
                    <p className="text-sm">The quadratic formula is x = (-b ± √(b²-4ac)) / 2a. It's used to solve equations in the form ax² + bx + c = 0...</p>
                  </div>
                  <div className="flex items-center gap-2 text-xs opacity-75">
                    <ImageIcon className="w-4 h-4" />
                    <span>Upload images for visual help</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Text Content */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="order-1 lg:order-2"
            >
              <span className="inline-block px-3 py-1 text-sm font-medium text-[#275085] dark:text-[#4a7ba7] bg-[#275085]/10 dark:bg-[#275085]/5 rounded-md mb-4">
                The Engine
              </span>
              <h2 className="text-5xl font-bold mb-6 text-gray-900 dark:text-white">
                A private tutor in your pocket. 24/7.
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
                Stuck on a problem? Don't wait for office hours. Our AI adapts to your needs.
              </p>

              <div className="space-y-4">
                {[
                  { icon: <ImageIcon className="w-5 h-5" />, title: "Visual Learning", desc: "Upload a photo of a homework problem for instant explanations" },
                  { icon: <Brain className="w-5 h-5" />, title: "Dual Modes", desc: "Use Quick Mode (Gemma) for fast answers or Deep Mode (Gemini) for complex analysis" },
                  { icon: <BookOpen className="w-5 h-5" />, title: "Flashcards", desc: "Let the AI generate study decks based on your notes" }
                ].map((feature, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-start gap-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800"
                  >
                    <div className="w-10 h-10 rounded-lg bg-[#275085] dark:bg-[#1f3f6b] flex items-center justify-center text-white shrink-0">
                      {feature.icon}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 dark:text-white mb-1">{feature.title}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{feature.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 3.5. COMPARISON - Why TaskTornado */}
      <section className="py-24 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="inline-block px-3 py-1 text-sm font-medium text-[#275085] dark:text-[#4a7ba7] bg-[#275085]/10 dark:bg-[#275085]/5 rounded-md mb-4">
              The Comparison
            </span>
            <h2 className="text-5xl font-bold mb-4 text-gray-900 dark:text-white">
              Why not just use {currentComparison.name}?
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto mb-8">
              We love those tools too. But they weren't built for students. Here's how we're different.
            </p>

            {/* Dropdown Selector */}
            <div className="flex justify-center mb-8">
              <div className="relative inline-block">
                <select
                  value={comparisonSet}
                  onChange={(e) => setComparisonSet(e.target.value as 'chatgpt-notion' | 'gemini-google')}
                  className="appearance-none bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg px-6 py-3 pr-10 text-gray-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-[#275085] focus:border-transparent cursor-pointer hover:border-gray-400 dark:hover:border-gray-500 transition-colors"
                >
                  <option value="chatgpt-notion">ChatGPT + Notion</option>
                  <option value="gemini-google">Gemini + Google Tasks</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Modern Minimalist Comparison */}
          <div className="space-y-3">
            {/* Header Cards */}
            <div className="grid grid-cols-4 gap-3 mb-6">
              <div className="col-span-1" />
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="bg-[#275085]/5 dark:bg-[#275085]/10 rounded-xl p-4 border border-[#275085]/20 dark:border-[#275085]/30"
              >
                <div className="flex items-center justify-center gap-2 mb-1">
                  <Sparkles className="w-4 h-4 text-[#275085] dark:text-[#4a7ba7]" />
                  <span className="font-bold text-[#275085] dark:text-[#4a7ba7] text-sm">TaskTornado</span>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 text-center">All-in-one</p>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700"
              >
                <div className="flex items-center justify-center gap-2 mb-1">
                  <div className={`w-4 h-4 rounded ${currentComparison.tool1.color} flex items-center justify-center`}>
                    <span className="text-white text-[10px]">
                      {currentComparison.tool1.name.charAt(0)}
                    </span>
                  </div>
                  <span className="font-bold text-gray-900 dark:text-white text-sm">{currentComparison.tool1.name}</span>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 text-center">{currentComparison.tool1.description}</p>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700"
              >
                <div className="flex items-center justify-center gap-2 mb-1">
                  <div className={`w-4 h-4 rounded ${currentComparison.tool2.color} flex items-center justify-center`}>
                    <span className="text-white text-[10px]">
                      {currentComparison.tool2.name.charAt(0)}
                    </span>
                  </div>
                  <span className="font-bold text-gray-900 dark:text-white text-sm">{currentComparison.tool2.name}</span>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 text-center">{currentComparison.tool2.description}</p>
              </motion.div>
            </div>

            {/* Feature Rows */}
            {currentComparison.features.map((row, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.03 }}
                className="grid grid-cols-4 gap-3 items-center"
              >
                <div className="col-span-1">
                  <h4 className="font-medium text-gray-900 dark:text-white text-sm">{row.feature}</h4>
                </div>

                {/* TaskTornado */}
                <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700 flex items-center justify-center min-h-[60px]">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center shrink-0">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                    <span className="text-xs text-gray-600 dark:text-gray-400 text-left">
                      {row.tasktornado.replace('✓ ', '')}
                    </span>
                  </div>
                </div>

                {/* Tool 1 */}
                <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700 flex items-center justify-center min-h-[60px]">
                  {row.tool1.startsWith('✓') ? (
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center shrink-0">
                        <Check className="w-3 h-3 text-gray-600 dark:text-gray-300" />
                      </div>
                      <span className="text-xs text-gray-500 dark:text-gray-400 text-left">
                        {row.tool1.replace('✓ ', '')}
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center shrink-0">
                        <span className="text-gray-400 dark:text-gray-500 text-xs font-bold">✕</span>
                      </div>
                      <span className="text-xs text-gray-400 dark:text-gray-500 text-left">
                        {row.tool1.replace('✗ ', '')}
                      </span>
                    </div>
                  )}
                </div>

                {/* Tool 2 */}
                <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700 flex items-center justify-center min-h-[60px]">
                  {row.tool2.startsWith('✓') ? (
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center shrink-0">
                        <Check className="w-3 h-3 text-gray-600 dark:text-gray-300" />
                      </div>
                      <span className="text-xs text-gray-500 dark:text-gray-400 text-left">
                        {row.tool2.replace('✓ ', '')}
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center shrink-0">
                        <span className="text-gray-400 dark:text-gray-500 text-xs font-bold">✕</span>
                      </div>
                      <span className="text-xs text-gray-400 dark:text-gray-500 text-left">
                        {row.tool2.replace('✗ ', '')}
                      </span>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="mt-12 text-center"
          >
            <div className="bg-linear-to-r from-[#275085]/10 to-[#4a7ba7]/10 dark:from-[#275085]/5 dark:to-[#4a7ba7]/5 rounded-2xl p-8 border border-[#275085]/20 dark:border-[#275085]/30">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                The best of both worlds, built for students
              </h3>
              <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-6">
                We combined {currentComparison.tool1.name}'s AI power with {currentComparison.tool2.name}'s organization, then added student-specific features like deadline tracking, flashcard systems, and stress support. All in one place, all completely free.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                  <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400" />
                  <span className="text-sm font-medium text-gray-900 dark:text-white">No subscription fees</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                  <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400" />
                  <span className="text-sm font-medium text-gray-900 dark:text-white">Student-focused design</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                  <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400" />
                  <span className="text-sm font-medium text-gray-900 dark:text-white">Everything in one place</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 4. COMMAND FLOW - The Workflow */}
      <section className="py-24 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Text Content */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <span className="inline-block px-3 py-1 text-sm font-medium text-[#275085] dark:text-[#4a7ba7] bg-[#275085]/10 dark:bg-[#275085]/5 rounded-md mb-4">
                The Workflow
              </span>
              <h2 className="text-5xl font-bold mb-6 text-gray-900 dark:text-white">
                Control everything with a keystroke
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
                Efficiency matters. Use our specialized chat commands to manage your workflow without leaving the keyboard.
              </p>

              <div className="space-y-3">
                {[
                  { cmd: '@homework', example: 'What is due this week?' },
                  { cmd: '@flashcards', example: 'Create a deck for Biology Ch. 3' },
                  { cmd: '@resources', example: 'Find calculus practice problems' },
                  { cmd: '@control', example: 'Mark math homework as done' }
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2 py-1 bg-[#275085] dark:bg-[#1f3f6b] text-white text-xs font-mono font-semibold rounded">
                        {item.cmd}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 font-mono">{item.example}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Visual - Terminal Style */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="bg-gray-900 dark:bg-black rounded-2xl shadow-2xl overflow-hidden border border-gray-700">
                <div className="flex items-center gap-2 px-4 py-3 bg-gray-800 dark:bg-gray-900 border-b border-gray-700">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500" />
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                  <span className="ml-2 text-xs text-gray-400">AI Command Center</span>
                </div>
                <div className="p-6 font-mono text-sm space-y-3">
                  <div className="text-green-400">$ @homework What's due this week?</div>
                  <div className="text-gray-300 pl-4">→ You have 3 assignments due:</div>
                  <div className="text-gray-400 pl-4">  • Math Ch. 8 - Due Friday</div>
                  <div className="text-gray-400 pl-4">  • History Essay - Due Thursday</div>
                  <div className="text-gray-400 pl-4">  • Science Lab - Due Monday</div>
                  <div className="text-green-400 mt-4">$ @control mark math as done</div>
                  <div className="text-gray-300 pl-4">✓ Math homework marked complete</div>
                  <div className="text-green-400 animate-pulse">_</div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 5. WELLBEING - The Support */}
      <section className="py-24 bg-linear-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="inline-block px-3 py-1 text-sm font-medium text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30 rounded-md mb-4">
              The Support
            </span>
            <h2 className="text-5xl font-bold mb-6 text-gray-900 dark:text-white">
              Grades matter. Your health matters more.
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 mb-12 max-w-3xl mx-auto leading-relaxed">
              School is stressful. We built a safe space to help you manage the pressure.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8 mb-8">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-white dark:bg-gray-800 rounded-2xl p-8 border border-gray-200 dark:border-gray-700 text-left"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-blue-500/10 dark:bg-blue-500/20 flex items-center justify-center">
                  <Heart className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Vent & Decompress</h3>
              </div>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                Talk through academic overwhelm with our supportive AI <code className="px-2 py-1 bg-gray-100 dark:bg-gray-900 rounded text-sm">@therapist</code> mode. Get coping strategies for school-related stress.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-amber-50 dark:bg-amber-950/20 rounded-2xl p-8 border border-amber-200 dark:border-amber-900/50 text-left"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-amber-500/10 dark:bg-amber-500/20 flex items-center justify-center">
                  <ShieldAlert className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Reality Check</h3>
              </div>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                This is for coaching and coping strategies, not crisis management. Think of it as a supportive friend, not a professional therapist.
              </p>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-blue-100 dark:bg-blue-900/30 rounded-xl p-6 border border-blue-300 dark:border-blue-800"
          >
            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
              <strong className="font-semibold">If you're in crisis:</strong> Please reach out to professional resources like the Crisis Text Line (text HOME to 741741) or call 988 for the Suicide & Crisis Lifeline.
            </p>
          </motion.div>
        </div>
      </section>

      {/* 5.5. GROUP CHATS - Collaboration */}
      <section className="py-24 bg-white dark:bg-gray-950">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Text Content */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <span className="inline-block px-3 py-1 text-sm font-medium text-[#275085] dark:text-[#4a7ba7] bg-[#275085]/10 dark:bg-[#275085]/5 rounded-md mb-4">
                Collaboration
              </span>
              <h2 className="text-5xl font-bold mb-6 text-gray-900 dark:text-white">
                Study together, succeed together
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
                Connect with classmates, share resources, and collaborate in real-time study groups. Learning is better together.
              </p>

              <div className="space-y-4">
                {[
                  { icon: <Users className="w-5 h-5" />, title: "Class Group Chats", desc: "Create dedicated channels for each class to share notes and discuss assignments" },
                  { icon: <MessageSquare className="w-5 h-5" />, title: "Real-Time Messaging", desc: "Instant messaging with your study group, no phone numbers required" },
                  { icon: <BookOpen className="w-5 h-5" />, title: "Resource Sharing", desc: "Share study materials, flashcards, and helpful links with your group" }
                ].map((feature, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-start gap-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800"
                  >
                    <div className="w-10 h-10 rounded-lg bg-[#275085] dark:bg-[#1f3f6b] flex items-center justify-center text-white shrink-0">
                      {feature.icon}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 dark:text-white mb-1">{feature.title}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{feature.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Visual - Group Chat Preview */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative"
            >
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                {/* Chat Header */}
                <div className="bg-[#275085] dark:bg-[#1f3f6b] p-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                    <Users className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-white">AP Chemistry Study Group</h3>
                    <p className="text-xs text-white/80">8 members • 3 online</p>
                  </div>
                </div>

                {/* Chat Messages */}
                <div className="p-4 space-y-3 bg-gray-50 dark:bg-gray-900 min-h-[300px]">
                  <div className="flex items-start gap-2">
                    <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
                      SM
                    </div>
                    <div className="flex-1">
                      <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
                        <p className="text-xs font-semibold text-gray-900 dark:text-white mb-1">Sarah M.</p>
                        <p className="text-sm text-gray-700 dark:text-gray-300">Did anyone finish the lab report yet?</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
                      JD
                    </div>
                    <div className="flex-1">
                      <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
                        <p className="text-xs font-semibold text-gray-900 dark:text-white mb-1">Jake D.</p>
                        <p className="text-sm text-gray-700 dark:text-gray-300">Just finished! I can share my notes if you need help with the calculations</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
                      AL
                    </div>
                    <div className="flex-1">
                      <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
                        <p className="text-xs font-semibold text-gray-900 dark:text-white mb-1">Alex L.</p>
                        <p className="text-sm text-gray-700 dark:text-gray-300">That would be amazing! Also, anyone want to study together for the midterm?</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Chat Input */}
                <div className="p-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Type a message..."
                      className="flex-1 bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2 text-sm text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#275085]"
                      disabled
                    />
                    <button className="px-4 py-2 bg-[#275085] hover:bg-[#1f3f6b] dark:bg-[#1f3f6b] dark:hover:bg-[#275085] text-white rounded-lg transition-colors text-sm font-medium">
                      Send
                    </button>
                  </div>
                </div>
              </div>

              {/* Floating Badge */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
                className="absolute -top-4 -right-4 bg-green-500 text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2"
              >
                <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                <span className="text-sm font-semibold">Live Collaboration</span>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 6. THE PROMISE - Transparency */}
      <section className="py-24 bg-white dark:bg-gray-950">
        <div className="max-w-5xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <span className="inline-block px-3 py-1 text-sm font-medium text-[#275085] dark:text-[#4a7ba7] bg-[#275085]/10 dark:bg-[#275085]/5 rounded-md mb-4">
              The Promise
            </span>
            <h2 className="text-5xl font-bold mb-4 text-gray-900 dark:text-white">
              Free. Forever. No hidden fees.
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              We've been burned by "free" apps that switch to paid models too. TaskTornado is different.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-linear-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 rounded-2xl p-8 md:p-12 border border-green-200 dark:border-green-900/50 mb-8"
          >
            <div className="flex items-start gap-4 mb-6">
              <div className="shrink-0 w-12 h-12 rounded-xl bg-green-500 dark:bg-green-600 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                  TaskTornado will always be free
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-lg leading-relaxed mb-6">
                  This isn't a bait-and-switch. We're committed to keeping all core features free forever.
                </p>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-3 mb-2">
                      <Zap className="w-5 h-5 text-[#275085] dark:text-[#4a7ba7]" />
                      <h4 className="font-bold text-gray-900 dark:text-white">Open Source Power</h4>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      We use efficient models like Gemma to keep costs low
                    </p>
                  </div>

                  <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-3 mb-2">
                      <Users className="w-5 h-5 text-[#275085] dark:text-[#4a7ba7]" />
                      <h4 className="font-bold text-gray-900 dark:text-white">Fair Limits</h4>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Daily message caps ensure everyone gets access
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-3 mt-6">
              {['No premium tiers', 'No paywalls', 'Just tools to help you succeed'].map((item, i) => (
                <div key={i} className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                  <Check className="w-4 h-4 text-green-600 dark:text-green-400" />
                  <span className="text-sm font-medium text-gray-900 dark:text-white">{item}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* 7. FINAL CTA */}
      <section className="py-24 bg-linear-to-br from-[#275085] to-[#1f3f6b] text-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-5xl font-bold mb-6">
              Ready to upgrade your GPA?
            </h2>
            <p className="text-xl opacity-90 mb-8 leading-relaxed">
              Be one of the first to try the app.
            </p>
            <Link
              href="/signup"
              className="inline-flex items-center px-8 py-4 bg-white text-[#275085] font-semibold rounded-lg hover:bg-gray-50 transition-colors text-lg"
            >
              Launch TaskTornado
              <ArrowUpRight className="w-5 h-5 ml-2" />
            </Link>
          </motion.div>
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
            <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto mb-6">
              Empowering students to achieve their full potential through intelligent organization and AI-powered assistance.
            </p>

            <div className="flex justify-center gap-6 mb-8">
              <Link href="/ai-guidelines" className="text-gray-600 dark:text-gray-400 hover:text-[#275085] dark:hover:text-[#4a7ba7] transition-colors">
                AI Guidelines
              </Link>
              <Link href="/changelog" className="text-gray-600 dark:text-gray-400 hover:text-[#275085] dark:hover:text-[#4a7ba7] transition-colors">
                Changelog
              </Link>
              <Link href="/signin" className="text-gray-600 dark:text-gray-400 hover:text-[#275085] dark:hover:text-[#4a7ba7] transition-colors">
                Sign In
              </Link>
            </div>
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