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
  ArrowUpRight,
  CheckCircle,
} from 'lucide-react';
import type { ReactNode } from 'react';

/* --------------------------------------------------------------
   Styling to match our app's aesthetic
   -------------------------------------------------------------- */
const gradientText = 'bg-clip-text text-transparent bg-gradient-to-r from-[#005f5a] to-teal-600';
const heroUnderline = 'h-1 w-24 bg-gradient-to-r from-[#005f5a] to-teal-600 rounded-full opacity-70';
const cardGlass = `
  bg-white/90 dark:bg-gray-800/90
  border border-gray-200 dark:border-gray-700
  backdrop-blur-xl
  hover:shadow-xl
  transition-all duration-300
`;
const iconBase = 'h-6 w-6';
const iconMap: Record<string, ReactNode> = {
  bot: <Bot className={`${iconBase} text-[#005f5a]`} />,
  sparkles: <Sparkles className={`${iconBase} text-amber-500`} />,
  lightbulb: <Lightbulb className={`${iconBase} text-yellow-500`} />,
  message: <MessageSquare className={`${iconBase} text-emerald-600`} />,
  help: <HelpCircle className={`${iconBase} text-purple-500`} />,
  shield: <ShieldAlert className={`${iconBase} text-rose-500`} />,
};

/* -----------------------------------------------------------------
   Updated content to match our app's features
   ----------------------------------------------------------------- */
const guidelines = [
  {
    icon: 'bot',
    title: 'AI Study Assistant',
    description:
      'Your personal study companion powered by advanced AI models (Gemma for quick responses, Gemini for deeper analysis) that helps you understand concepts through guided questioning.',
  },
  {
    icon: 'sparkles',
    title: 'How to Use AI Commands',
    description:
      'Use special commands like @homework, @flashcards, @resources, @control, and @therapist to access specific features and get targeted help for different study needs.',
  },
  {
    icon: 'lightbulb',
    title: 'Best Practices',
    description:
      'Be specific with your questions and provide context. The AI works best when you explain what you\'ve already tried and where you\'re getting stuck.',
  },
  {
    icon: 'message',
    title: 'Conversation Flow',
    description:
      'The AI remembers your conversation context and maintains separate modes (Study mode vs Therapist mode) to provide appropriate guidance for different situations.',
  },
  {
    icon: 'help',
    title: 'Getting Better Help',
    description:
      'If you\'re not getting the help you need, try switching between Quick mode (Gemma) and Deep mode (Gemini), or rephrase your question to be more specific.',
  },
  {
    icon: 'shield',
    title: 'Responsible AI Use',
    description:
      'Our AI is designed to enhance learning, not replace it. It follows strict guidelines to promote academic integrity and provide supportive, educational responses.',
  },
];

/* -----------------------------------------------------------------
   Page component ----------------------------------------------------
   ----------------------------------------------------------------- */
export default function AIGuidelinesPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-[#F8FBF9] dark:bg-gray-900 overflow-x-hidden font-sans">
      {/* Background Gradient matching landing page */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-[#E6F5D8] via-[#F8FBF9] to-[#F8FBF9] dark:from-gray-900 dark:via-gray-900 dark:to-gray-900 -z-10" />

      {/* Hero Section matching landing page style */}
      <section className="pt-16 pb-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className={`text-4xl sm:text-5xl md:text-6xl font-bold ${gradientText} mb-6`}>
            AI Assistant Guidelines
          </h1>
          <div className="mt-2 flex justify-center">
            <span className={heroUnderline} />
          </div>
          <p className="mt-6 text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Learn how to make the most of your AI-powered study companion
          </p>
        </div>
      </section>

      {/* Guidelines Grid */}
      <section className="px-4 sm:px-6 lg:px-8 pb-16">
        <div className="max-w-6xl mx-auto grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {guidelines.map((item, i) => (
            <div
              key={i}
              className={`bg-white dark:bg-gray-800 p-8 rounded-xl border border-gray-200 dark:border-gray-700 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 h-full ${cardGlass}`}
            >
              <div className="flex items-start gap-4 mb-4">
                <div className="p-2 rounded-lg bg-teal-50 dark:bg-teal-900/20 flex-shrink-0">
                  {iconMap[item.icon]}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                    {item.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* AI Features Section */}
      <section className="px-4 sm:px-6 lg:px-8 pb-16">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 border border-gray-200 dark:border-gray-700">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6 flex items-center gap-2">
              <Bot className="w-6 h-6 text-[#005f5a]" />
              AI Model Options
            </h2>
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="bg-teal-50 dark:bg-teal-900/20 p-6 rounded-lg border border-teal-100 dark:border-teal-800">
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Quick Mode (Gemma)</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">Fast responses for simple questions and quick help</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">30 messages per day</p>
              </div>
              <div className="bg-purple-50 dark:bg-purple-900/20 p-6 rounded-lg border border-purple-100 dark:border-purple-800">
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Deep Mode (Gemini)</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">More thoughtful analysis for complex topics</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">10 messages per day</p>
              </div>
              <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg border border-blue-100 dark:border-blue-800">
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Cloud Mode (Kimi-k2)</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">Most advanced AI model for comprehensive and scalable assistance</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">20 messages per day</p>
              </div>
            </div>

            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6 flex items-center gap-2">
              <ShieldAlert className="w-6 h-6 text-amber-500" />
              Important Guidelines
            </h2>
            <div className="space-y-4">
              {[
                'The AI is designed to guide learning, not provide direct answers',
                'Rate limits ensure fair access for all users',
                'Therapist mode provides mental health support, not medical advice',
                'All interactions follow strict academic integrity guidelines',
                'Switch between modes based on your needs for optimal results'
              ].map((guideline, i) => (
                <div key={i} className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-[#005f5a] mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-gray-600 dark:text-gray-300">{guideline}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Back Button */}
      <section className="px-4 sm:px-6 lg:px-8 pb-16">
        <div className="max-w-4xl mx-auto text-center">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center px-6 py-3 bg-[#005f5a] hover:bg-teal-700 text-white font-medium rounded-lg transition-colors shadow-sm hover:shadow-md"
          >
            Back to App
            <ArrowUpRight className="w-4 h-4 ml-2" />
          </button>
        </div>
      </section>
    </div>
  );
}
