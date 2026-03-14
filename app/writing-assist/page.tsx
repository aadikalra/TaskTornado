'use client';

import { PlateEditor } from '@/components/editor/plate-editor';
import { TooltipProvider } from '@/components/ui/tooltip';
import { useRouteIntro } from '@/hooks/use-route-intro';
import { RouteIntroPopup } from '@/components/RouteIntroPopup';
import { PenTool, Lock, Sparkles, Zap, MessageSquare } from 'lucide-react';
import { useRequireAuth } from '@/hooks/use-require-auth';
import { getPlanTier, TIER_LIMITS } from '@/lib/planTier';
import { useUpgrade } from '@/context/UpgradeContext';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';

const WritingAssistPage = () => {
  const { authenticated } = useRequireAuth();
  if (!authenticated) return null;
  const { showIntro, dismissIntro } = useRouteIntro('writing-assist');
  const { handlePlanLimitError } = useUpgrade();
  const router = useRouter();

  const tier = getPlanTier();
  const limits = TIER_LIMITS[tier];

  // ─── Family-only gate ──────────────────────────────────────────────
  if (!limits.writingAssist) {
    return (
      <div className="min-h-screen bg-[#fffaf4] dark:bg-gray-950 flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-md w-full text-center space-y-8"
        >
          {/* Icon */}
          <div className="mx-auto w-20 h-20 rounded-3xl bg-gradient-to-br from-violet-500/10 to-fuchsia-500/10 dark:from-violet-500/20 dark:to-fuchsia-500/20 border border-violet-200/30 dark:border-violet-500/20 flex items-center justify-center">
            <Lock className="w-8 h-8 text-violet-400 dark:text-violet-300" />
          </div>

          {/* Heading */}
          <div className="space-y-3">
            <h1 className="text-2xl font-bold text-sky-900 dark:text-white">
              Writing Assist is a Family feature
            </h1>
            <p className="text-sm text-sky-600/60 dark:text-sky-400/50 leading-relaxed max-w-sm mx-auto">
              Get the full AI writing experience — rich text editor, intelligent autocomplete,
              and AI-powered editing commands.
            </p>
          </div>

          {/* Feature list */}
          <div className="space-y-3 text-left max-w-xs mx-auto">
            {[
              { icon: PenTool, label: 'Rich text editor with full formatting' },
              { icon: Sparkles, label: 'AI Copilot autocomplete on every pause' },
              { icon: MessageSquare, label: 'AI Commands — edit, generate, comment' },
            ].map(({ icon: Icon, label }, i) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.1 }}
                className="flex items-center gap-3 py-2"
              >
                <div className="w-8 h-8 rounded-xl bg-violet-500/8 dark:bg-violet-500/15 flex items-center justify-center shrink-0">
                  <Icon className="w-4 h-4 text-violet-500 dark:text-violet-400" />
                </div>
                <span className="text-sm text-sky-800 dark:text-sky-200">{label}</span>
              </motion.div>
            ))}
          </div>

          {/* CTA */}
          <button
            onClick={() => router.push('/pricing')}
            style={{ background: '#8b5cf6' }}
            className="w-full py-3.5 rounded-2xl text-white font-semibold text-sm shadow-lg hover:opacity-90 hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            Upgrade to Family
          </button>

          <p className="text-xs text-sky-600/30 dark:text-sky-400/20">
            Writing Assist requires the Family plan due to high AI usage costs.
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fffaf4] dark:bg-gray-950 relative">
      <div className="relative z-10 w-full mx-auto px-4 sm:px-6 md:px-12 lg:px-16 pt-20 pb-16 h-screen flex flex-col">
        <TooltipProvider>
          <PlateEditor />
        </TooltipProvider>

        {/* Route Intro Popup */}
        <RouteIntroPopup
          isOpen={showIntro}
          onClose={dismissIntro}
          title="Welcome to Writing Assist!"
          description="AI-powered writing assistant with intelligent autocomplete and rich text editing"
          icon={<PenTool className="h-6 w-6" />}
          features={[
            'Rich text editor with full formatting options',
            'AI-powered writing improvements (Cmd+J)',
            'Intelligent autocomplete suggestions',
            'Auto-save to preserve your work',
          ]}
        />
      </div>
    </div>
  );
};

export default WritingAssistPage;

