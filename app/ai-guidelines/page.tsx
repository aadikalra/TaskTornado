'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Bot,
  Sparkles,
  Lightbulb,
  MessageSquare,
  HelpCircle,
  ShieldAlert,
  ArrowLeft,
  CheckCircle2,
  Zap,
  Brain,
  Cloud,
  BookOpen,
  AlertTriangle,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useWideLayout } from '@/hooks/use-wide-layout';

/* -----------------------------------------------------------------
   Content data
   ----------------------------------------------------------------- */
const guidelines = [
  {
    icon: Bot,
    title: 'AI Aurora',
    description:
      'Your personal study companion powered by advanced AI models (Gemma for quick responses, Gemini for deeper analysis) that helps you understand concepts through guided questioning.',
  },
  {
    icon: Sparkles,
    title: 'How to Use AI Commands',
    description:
      'Use special commands like @homework, @flashcards, @resources, @control, and @therapist to access specific features and get targeted help for different study needs.',
  },
  {
    icon: Lightbulb,
    title: 'Best Practices',
    description:
      'Be specific with your questions and provide context. The AI works best when you explain what you\'ve already tried and where you\'re getting stuck.',
  },
  {
    icon: MessageSquare,
    title: 'Conversation Flow',
    description:
      'The AI remembers your conversation context and maintains separate modes (Study mode vs Therapist mode) to provide appropriate guidance for different situations.',
  },
  {
    icon: HelpCircle,
    title: 'Getting Better Help',
    description:
      'If you\'re not getting the help you need, try switching between Quick mode (Gemma) and Deep mode (Gemini), or rephrase your question to be more specific.',
  },
  {
    icon: BookOpen,
    title: 'Responsible AI Use',
    description:
      'Our AI is designed to enhance learning, not replace it. It follows strict guidelines to promote academic integrity and provide supportive, educational responses.',
  },
];

const aiModels = [
  {
    name: 'Quick Mode',
    model: 'Gemma',
    icon: Zap,
    description: 'Fast responses for simple questions and quick help',
    limit: '100 messages / day',
  },
  {
    name: 'Deep Mode',
    model: 'Gemini',
    icon: Brain,
    description: 'More thoughtful analysis for complex topics',
    limit: '10 messages / day',
  },
  {
    name: 'Max Mode',
    model: 'Kimi-k2:1t-cloud',
    icon: Cloud,
    description: 'Most advanced AI model for comprehensive assistance',
    limit: '20 messages / day',
  },
];

const importantGuidelines = [
  'The AI is designed to guide learning, not provide direct answers',
  'Rate limits ensure fair access for all users',
  'Therapist mode provides mental health support, not medical advice',
  'All interactions follow strict academic integrity guidelines',
  'Switch between modes based on your needs for optimal results',
  'Suspicious conversations will be internally reported and may lead to serious consequences',
];

/* -----------------------------------------------------------------
   Page component
   ----------------------------------------------------------------- */
export default function AIGuidelinesPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const { getContainerClass } = useWideLayout();

  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  return (
    <div className="relative min-h-screen bg-[#f8fbfd] dark:bg-[#0a0a0a] overflow-hidden">
      {/* Background orbs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-sky-200/20 dark:bg-sky-500/[0.06] rounded-full blur-[140px]" />
        <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-[#ebf6b5]/30 dark:bg-emerald-500/[0.04] rounded-full blur-[120px]" />
        <div className="absolute top-1/3 right-0 w-[300px] h-[300px] bg-[#ebf6b5]/20 dark:bg-emerald-500/[0.04] rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 px-4 sm:px-6 md:px-12 lg:px-16 pt-28 pb-16">
        {/* Back button */}
        <motion.button
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => router.back()}
          className="flex items-center gap-2 text-sm font-medium text-sky-600/50 dark:text-sky-400/50 hover:text-sky-600 dark:hover:text-sky-400 transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </motion.button>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <h1 className="text-4xl lg:text-[52px] font-bold text-sky-500 dark:text-sky-400 leading-[1.08] tracking-tight mb-3">
            Aurora Guidelines
          </h1>
          <p className="text-sky-600/50 dark:text-sky-400/50 text-base">
            Learn how to make the most of your AI-powered study companion
          </p>
        </motion.div>

        {/* Guidelines Section */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="mb-12"
        >
          <div className="mb-6">
            <h2 className="text-xl font-bold text-sky-900 dark:text-white mb-1">
              How to Use Aurora
            </h2>
            <p className="text-sm text-sky-600/40 dark:text-sky-400/40">
              Essential tips and best practices for effective AI interactions
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {guidelines.map((item, i) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + i * 0.04 }}
                  className="group px-5 py-5 bg-white/60 dark:bg-gray-900 border border-sky-100 dark:border-gray-800 rounded-2xl transition-all hover:border-sky-200 dark:hover:border-gray-700"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-11 h-11 bg-sky-100 dark:bg-sky-500/15 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105">
                      <Icon className="w-5 h-5 text-sky-500 dark:text-sky-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-bold text-sky-900 dark:text-white mb-1.5">
                        {item.title}
                      </h3>
                      <p className="text-xs text-sky-600/50 dark:text-sky-400/40 leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* AI Model Options */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="mb-12"
        >
          <div className="mb-6">
            <h2 className="text-xl font-bold text-sky-900 dark:text-white mb-1">
              AI Model Options
            </h2>
            <p className="text-sm text-sky-600/40 dark:text-sky-400/40">
              Choose the right AI model for your needs
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {aiModels.map((model, i) => {
              const Icon = model.icon;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + i * 0.06 }}
                  className="relative px-5 py-5 bg-white/60 dark:bg-gray-900 border border-sky-100 dark:border-gray-800 rounded-2xl transition-all hover:border-sky-200 dark:hover:border-gray-700"
                >
                  {i === 0 && (
                    <div className="absolute -top-2.5 right-4 bg-[#275085] dark:bg-sky-500 text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full shadow-md flex items-center gap-1">
                      <Sparkles className="h-3 w-3" />
                      Popular
                    </div>
                  )}
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-sky-100 dark:bg-sky-500/15 rounded-xl flex items-center justify-center shrink-0">
                      <Icon className="w-5 h-5 text-sky-500 dark:text-sky-400" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-sky-900 dark:text-white leading-tight">
                        {model.name}
                      </h3>
                      <p className="text-[10px] text-sky-600/40 dark:text-sky-400/40 font-medium uppercase tracking-wider">
                        {model.model}
                      </p>
                    </div>
                  </div>
                  <p className="text-xs text-sky-600/50 dark:text-sky-400/40 leading-relaxed mb-4">
                    {model.description}
                  </p>
                  <div className="pt-3 border-t border-sky-100 dark:border-gray-800">
                    <p className="text-[11px] font-semibold text-sky-500 dark:text-sky-400">
                      {model.limit}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Important Guidelines */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="mb-12"
        >
          <div className="mb-6">
            <h2 className="text-xl font-bold text-sky-900 dark:text-white mb-1">
              Important Guidelines
            </h2>
            <p className="text-sm text-sky-600/40 dark:text-sky-400/40">
              Key principles for responsible AI usage
            </p>
          </div>

          <div className="space-y-0">
            {importantGuidelines.map((guideline, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.04 }}
                className="flex items-start gap-4 py-4 border-b border-sky-100 dark:border-gray-800 px-1"
              >
                <div className="w-6 h-6 bg-[#ebf6b5]/60 dark:bg-sky-500/15 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
                </div>
                <p className="text-sm text-sky-800 dark:text-sky-200 leading-relaxed">
                  {guideline}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Pro Tip */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="flex items-start gap-4 px-5 py-4 bg-[#ebf6b5]/30 dark:bg-sky-500/5 border border-[#d4e88e]/40 dark:border-sky-500/10 rounded-2xl"
        >
          <div className="w-10 h-10 bg-[#ebf6b5]/60 dark:bg-sky-500/15 rounded-xl flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5 text-sky-600 dark:text-sky-400" />
          </div>
          <div>
            <p className="text-sm font-bold text-sky-900 dark:text-white mb-1">
              Pro Tip: Maximize Your Learning
            </p>
            <p className="text-xs text-sky-600/50 dark:text-sky-400/40 leading-relaxed">
              For best results, start with Quick mode for simple questions, then switch to Deep mode when you need detailed explanations. Use Max mode for comprehensive research and complex problem-solving.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
