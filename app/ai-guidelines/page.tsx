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
  Home,
  CheckCircle2,
  Zap,
  Brain,
  Cloud,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useWideLayout } from '@/hooks/use-wide-layout';

/* -----------------------------------------------------------------
   Updated content to match our app's features
   ----------------------------------------------------------------- */
const guidelines = [
  {
    icon: Bot,
    iconColor: 'text-teal-600 dark:text-teal-400',
    bgColor: 'bg-teal-50 dark:bg-teal-900/20',
    title: 'AI Aurora',
    description:
      'Your personal study companion powered by advanced AI models (Gemma for quick responses, Gemini for deeper analysis) that helps you understand concepts through guided questioning.',
  },
  {
    icon: Sparkles,
    iconColor: 'text-amber-600 dark:text-amber-400',
    bgColor: 'bg-amber-50 dark:bg-amber-900/20',
    title: 'How to Use AI Commands',
    description:
      'Use special commands like @homework, @flashcards, @resources, @control, and @therapist to access specific features and get targeted help for different study needs.',
  },
  {
    icon: Lightbulb,
    iconColor: 'text-yellow-600 dark:text-yellow-400',
    bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
    title: 'Best Practices',
    description:
      'Be specific with your questions and provide context. The AI works best when you explain what you\'ve already tried and where you\'re getting stuck.',
  },
  {
    icon: MessageSquare,
    iconColor: 'text-emerald-600 dark:text-emerald-400',
    bgColor: 'bg-emerald-50 dark:bg-emerald-900/20',
    title: 'Conversation Flow',
    description:
      'The AI remembers your conversation context and maintains separate modes (Study mode vs Therapist mode) to provide appropriate guidance for different situations.',
  },
  {
    icon: HelpCircle,
    iconColor: 'text-purple-600 dark:text-purple-400',
    bgColor: 'bg-purple-50 dark:bg-purple-900/20',
    title: 'Getting Better Help',
    description:
      'If you\'re not getting the help you need, try switching between Quick mode (Gemma) and Deep mode (Gemini), or rephrase your question to be more specific.',
  },
  {
    icon: ShieldAlert,
    iconColor: 'text-rose-600 dark:text-rose-400',
    bgColor: 'bg-rose-50 dark:bg-rose-900/20',
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
    limit: '100 messages per day',
    bgColor: 'bg-teal-50 dark:bg-teal-900/20',
    borderColor: 'border-teal-200 dark:border-teal-800',
    iconColor: 'text-teal-600 dark:text-teal-400',
    popular: true,
  },
  {
    name: 'Deep Mode',
    model: 'Gemini',
    icon: Brain,
    description: 'More thoughtful analysis for complex topics',
    limit: '10 messages per day',
    bgColor: 'bg-purple-50 dark:bg-purple-900/20',
    borderColor: 'border-purple-200 dark:border-purple-800',
    iconColor: 'text-purple-600 dark:text-purple-400',
  },
  {
    name: 'Cloud Mode',
    model: 'Kimi-k2:1t-cloud',
    icon: Cloud,
    description: 'Most advanced AI model for comprehensive assistance',
    limit: '20 messages per day',
    bgColor: 'bg-blue-50 dark:bg-blue-900/20',
    borderColor: 'border-blue-200 dark:border-blue-800',
    iconColor: 'text-blue-600 dark:text-blue-400',
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
   Page component ----------------------------------------------------
   ----------------------------------------------------------------- */
export default function AIGuidelinesPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const { getContainerClass } = useWideLayout();

  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className={getContainerClass('max-w-6xl') + ' py-8'}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex items-center justify-between mb-8"
        >
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Aurora Guidelines</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Learn how to make the most of your AI-powered study companion
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="gap-2"
          >
            <Home className="h-4 w-4" />
            <span className="hidden sm:inline">Back</span>
          </Button>
        </motion.div>

        {/* Main Content */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: {
                staggerChildren: 0.1
              }
            }
          }}
          className="space-y-6"
        >
          {/* Guidelines Grid */}
          <motion.div
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: { opacity: 1, y: 0 }
            }}
          >
            <Card className="border-gray-200 dark:border-gray-800">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg">How to Use the Aurora</CardTitle>
                <CardDescription className="text-sm">
                  Essential tips and best practices for effective AI interactions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {guidelines.map((item, i) => {
                    const Icon = item.icon;
                    return (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.05 }}
                        className="group p-4 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/50 hover:border-gray-300 dark:hover:border-gray-700 transition-all hover:shadow-md"
                      >
                        <div className="flex items-start gap-3">
                          <div className={`p-2 rounded-lg ${item.bgColor} transition-transform group-hover:scale-110`}>
                            <Icon className={`h-5 w-5 ${item.iconColor}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
                              {item.title}
                            </h3>
                            <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                              {item.description}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* AI Model Options */}
          <motion.div
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: { opacity: 1, y: 0 }
            }}
          >
            <Card className="border-gray-200 dark:border-gray-800">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-2">
                  <Bot className="h-5 w-5 text-teal-600 dark:text-teal-400" />
                  <CardTitle className="text-lg">AI Model Options</CardTitle>
                </div>
                <CardDescription className="text-sm">
                  Choose the right AI model for your needs
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  {aiModels.map((model, i) => {
                    const Icon = model.icon;
                    return (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className={`relative p-5 rounded-lg border ${model.borderColor} ${model.bgColor} transition-all hover:shadow-md hover:-translate-y-1`}
                      >
                        {model.popular && (
                          <div className="absolute -top-2 -right-2 bg-teal-600 dark:bg-teal-500 text-white text-xs font-semibold px-2.5 py-1 rounded-full shadow-md flex items-center gap-1">
                            <Sparkles className="h-3 w-3" />
                            Most Popular
                          </div>
                        )}
                        <div className="flex items-center gap-2 mb-3">
                          <Icon className={`h-5 w-5 ${model.iconColor}`} />
                          <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                            {model.name}
                          </h3>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                          ({model.model})
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mb-3 leading-relaxed">
                          {model.description}
                        </p>
                        <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                          <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                            {model.limit}
                          </p>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Important Guidelines */}
          <motion.div
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: { opacity: 1, y: 0 }
            }}
          >
            <Card className="border-gray-200 dark:border-gray-800">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                  <CardTitle className="text-lg">Important Guidelines</CardTitle>
                </div>
                <CardDescription className="text-sm">
                  Key principles for responsible AI usage
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {importantGuidelines.map((guideline, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800"
                    >
                      <CheckCircle2 className="w-5 h-5 text-teal-600 dark:text-teal-400 mt-0.5 shrink-0" />
                      <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                        {guideline}
                      </p>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Info Notice */}
          <motion.div
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: { opacity: 1, y: 0 }
            }}
            className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/30 rounded-lg"
          >
            <Sparkles className="h-5 w-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                Pro Tip: Maximize Your Learning
              </p>
              <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                For best results, start with Quick mode for simple questions, then switch to Deep mode when you need detailed explanations. Use Cloud mode for comprehensive research and complex problem-solving.
              </p>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
