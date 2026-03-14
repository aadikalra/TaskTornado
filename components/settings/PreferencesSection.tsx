'use client';

import { Brain, Check, Maximize2, BookOpen, Crown, FlaskConical } from 'lucide-react';
import { Switch } from '@/components/animate-ui/components/base/switch';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { usePlanTier } from '@/hooks/use-plan-tier';
import type { PlanTier } from '@/lib/planTier';

type AIPersonality = 'default' | 'professional' | 'friendly' | 'candid' | 'quirky' | 'efficient' | 'nerdy' | 'cynical';

interface PreferencesSectionProps {
  aiPersonality: AIPersonality;
  onPersonalityChange: (value: AIPersonality) => void;
  useWideLayout: boolean;
  onToggleWideLayout: (checked: boolean) => void;
  showTestsInClassCards: boolean;
  onToggleTestsInClassCards: (checked: boolean) => void;
}

export default function PreferencesSection({
  aiPersonality,
  onPersonalityChange,
  useWideLayout,
  onToggleWideLayout,
  showTestsInClassCards,
  onToggleTestsInClassCards
}: PreferencesSectionProps) {
  const { tier, setTier } = usePlanTier();

  const TIERS: { value: PlanTier; label: string; color: string }[] = [
    { value: 'free', label: 'Free', color: 'text-sky-600 dark:text-sky-300' },
    { value: 'pro', label: 'Pro', color: 'text-sky-600 dark:text-sky-300' },
    { value: 'family', label: 'Family', color: 'text-sky-600 dark:text-sky-300' },
  ];

  return (
    <div className="space-y-1">
      {/* Plan Tier Switcher — dev testing only */}
      <div className="px-1 py-3.5 rounded-xl">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <FlaskConical className="h-[18px] w-[18px] text-amber-500/70" />
            <div>
              <span className="text-[14px] font-medium text-sky-900 dark:text-sky-100">
                Plan Tier
              </span>
              <span className="ml-2 text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-100/60 dark:bg-amber-500/10 px-1.5 py-0.5 rounded-full uppercase tracking-wider">
                Dev
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1 p-1 bg-sky-50/60 dark:bg-zinc-800/60 rounded-full border border-sky-100/60 dark:border-sky-800/30 w-fit">
          {TIERS.map(t => (
            <button
              key={t.value}
              onClick={() => setTier(t.value)}
              className={`relative px-4 py-1.5 text-[13px] font-semibold rounded-full transition-colors duration-200 z-10 ${tier === t.value
                  ? t.color
                  : 'text-sky-600/40 dark:text-sky-400/40 hover:text-sky-600 dark:hover:text-sky-400'
                }`}
            >
              {tier === t.value && (
                <motion.div
                  layoutId="plan-tier-pill"
                  className="absolute inset-0 bg-white dark:bg-zinc-700 rounded-full shadow-sm"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <span className="relative z-10 flex items-center gap-1.5">
                {t.value === 'family' && <Crown className="w-3 h-3" />}
                {t.label}
              </span>
            </button>
          ))}
        </div>
        <p className="text-[11px] text-sky-600/30 dark:text-sky-400/25 mt-2 ml-0.5">
          Simulates plan restrictions for testing. Will be replaced by Stripe.
        </p>
      </div>

      <div className="flex items-center justify-between px-1 py-3.5 rounded-xl transition-colors hover:bg-sky-500/[0.03]">
        <div className="flex items-center gap-3">
          <Maximize2 className="h-[18px] w-[18px] text-sky-500/50" />
          <span className="text-[14px] font-medium text-sky-900 dark:text-sky-100">
            Full Width Mode
          </span>
        </div>
        <Switch
          checked={useWideLayout}
          onCheckedChange={onToggleWideLayout}
        />
      </div>

      <div className="flex items-center justify-between px-1 py-3.5 rounded-xl transition-colors hover:bg-sky-500/[0.03]">
        <div className="flex items-center gap-3">
          <BookOpen className="h-[18px] w-[18px] text-sky-500/50" />
          <span className="text-[14px] font-medium text-sky-900 dark:text-sky-100">
            Show Tests in Class Cards
          </span>
        </div>
        <Switch
          checked={showTestsInClassCards}
          onCheckedChange={onToggleTestsInClassCards}
        />
      </div>

      <div className="flex items-center justify-between px-1 py-3.5 rounded-xl transition-colors hover:bg-sky-500/[0.03]">
        <div className="flex items-center gap-3 flex-1">
          <Brain className="h-[18px] w-[18px] text-sky-500/50" />
          <span className="text-[14px] font-medium text-sky-900 dark:text-sky-100">
            Aurora Personality
          </span>
        </div>
        <CustomPersonalitySelect
          value={aiPersonality}
          onValueChange={onPersonalityChange}
        />
      </div>

    </div>
  );
}


// Custom Personality Select Component
interface CustomPersonalitySelectProps {
  value: AIPersonality;
  onValueChange: (value: AIPersonality) => void;
}

const CustomPersonalitySelect = ({ value, onValueChange }: CustomPersonalitySelectProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const personalities: { value: AIPersonality; name: string; description: string }[] = [
    { value: 'default', name: 'Default', description: 'Balanced style and tone' },
    { value: 'professional', name: 'Professional', description: 'Polished and precise' },
    { value: 'friendly', name: 'Friendly', description: 'Warm and chatty' },
    { value: 'candid', name: 'Candid', description: 'Direct and encouraging' },
    { value: 'quirky', name: 'Quirky', description: 'Playful and imaginative' },
    { value: 'efficient', name: 'Efficient', description: 'Concise and plain' },
    { value: 'nerdy', name: 'Nerdy', description: 'Exploratory and enthusiastic' },
    { value: 'cynical', name: 'Cynical', description: 'Critical and sarcastic' },
  ];

  const selectedPersonality = personalities.find(p => p.value === value);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-[180px] h-10 px-3 py-2 text-sm bg-white/60 dark:bg-gray-900/40 border border-sky-100 dark:border-gray-700 rounded-xl shadow-sm hover:bg-sky-500/[0.03] focus:outline-none focus:ring-2 focus:ring-sky-400/30 flex items-center justify-between transition-colors"
      >
        <span className="text-sky-900 dark:text-white font-medium">
          {selectedPersonality?.name || 'Select personality'}
        </span>
        <svg
          className={`w-4 h-4 text-sky-400/50 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border border-sky-100 dark:border-gray-700 rounded-xl shadow-lg shadow-sky-500/5 max-h-60 overflow-auto">
          <div className="py-1">
            {personalities.map((personality) => (
              <button
                key={personality.value}
                type="button"
                onClick={() => {
                  onValueChange(personality.value);
                  setIsOpen(false);
                }}
                className="w-full px-3 py-2 text-left hover:bg-sky-500/[0.04] focus:bg-sky-500/[0.04] focus:outline-none transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sky-900 dark:text-white text-sm">
                    {personality.name}
                  </span>
                  {value === personality.value && (
                    <Check className="w-4 h-4 text-sky-500" />
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
