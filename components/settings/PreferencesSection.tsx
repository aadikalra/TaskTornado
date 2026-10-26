'use client';

import { Brain, Check, Maximize2, BookOpen, CalendarDays, Sparkles, Compass, GraduationCap } from 'lucide-react';
import { Switch } from '@/components/animate-ui/components/base/switch';
import { useState } from 'react';
import { useOnboardingTour } from '@/components/OnboardingTour';
import { useAuth } from '@/context/AuthContext';

type AIPersonality = 'default' | 'professional' | 'friendly' | 'candid' | 'quirky' | 'efficient' | 'nerdy' | 'cynical';

interface PreferencesSectionProps {
  aiPersonality: AIPersonality;
  onPersonalityChange: (value: AIPersonality) => void;
  useWideLayout: boolean;
  onToggleWideLayout: (checked: boolean) => void;
  showCalendarWidget: boolean;
  onToggleCalendarWidget: (checked: boolean) => void;
  showTestsInClassCards: boolean;
  onToggleTestsInClassCards: (checked: boolean) => void;
  advancedAIMode: boolean;
  onToggleAdvancedAIMode: (checked: boolean) => void;
}

export default function PreferencesSection({
  aiPersonality,
  onPersonalityChange,
  useWideLayout,
  onToggleWideLayout,
  showCalendarWidget,
  onToggleCalendarWidget,
  showTestsInClassCards,
  onToggleTestsInClassCards,
  advancedAIMode,
  onToggleAdvancedAIMode
}: PreferencesSectionProps) {
  const { resetTour } = useOnboardingTour();
  const { user } = useAuth() || {};

  const handleResetClassSetup = () => {
    if (typeof window !== 'undefined') {
      if (user?.id) {
        document.cookie = `hasSeenOnboarding_${user.id}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
      }
      document.cookie = 'hasSeenOnboarding=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      window.location.href = '/dashboard';
    }
  };

  return (
    <div className="space-y-1">
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
          <CalendarDays className="h-[18px] w-[18px] text-sky-500/50" />
          <div className="flex flex-col">
            <span className="text-[14px] font-medium text-sky-900 dark:text-sky-100">
              Calendar Widget
            </span>
            <span className="text-[11px] text-sky-600/40 dark:text-sky-400/40">
              Show the weekly calendar on your dashboard
            </span>
          </div>
        </div>
        <Switch
          checked={showCalendarWidget}
          onCheckedChange={onToggleCalendarWidget}
        />
      </div>

      <div className="flex items-center justify-between px-1 py-3.5 rounded-xl transition-colors hover:bg-sky-500/[0.03]">
        <div className="flex items-center gap-3">
          <Sparkles className="h-[18px] w-[18px] text-purple-500/50" />
          <div className="flex flex-col">
            <span className="text-[14px] font-medium text-sky-900 dark:text-sky-100">
              Advanced AI Mode (codename Nova)
            </span>
            <span className="text-[11px] text-sky-600/40 dark:text-sky-400/40">
              Enhanced AI capabilities
            </span>
          </div>
        </div>
        <Switch
          checked={advancedAIMode}
          onCheckedChange={onToggleAdvancedAIMode}
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

      <div className="flex items-center justify-between px-1 py-3.5 rounded-xl transition-colors hover:bg-sky-500/[0.03]">
        <div className="flex items-center gap-3">
          <GraduationCap className="h-[18px] w-[18px] text-sky-500/50" />
          <div className="flex flex-col">
            <span className="text-[14px] font-medium text-sky-900 dark:text-sky-100">
              Grade & Class Setup Wizard
            </span>
            <span className="text-[11px] text-sky-600/40 dark:text-sky-400/40">
              Re-run setup to pick grade level, math track, electives & auto-add classes
            </span>
          </div>
        </div>
        <button
          type="button"
          onClick={handleResetClassSetup}
          className="px-3.5 py-1.5 text-xs font-semibold rounded-xl bg-sky-50 dark:bg-sky-950/50 text-sky-600 dark:text-sky-400 hover:bg-sky-100 dark:hover:bg-sky-900/50 transition-colors border border-sky-200/60 dark:border-sky-800/40 shadow-2xs"
        >
          Run Setup Wizard
        </button>
      </div>

      <div className="flex items-center justify-between px-1 py-3.5 rounded-xl transition-colors hover:bg-sky-500/[0.03]">
        <div className="flex items-center gap-3">
          <Compass className="h-[18px] w-[18px] text-sky-500/50" />
          <div className="flex flex-col">
            <span className="text-[14px] font-medium text-sky-900 dark:text-sky-100">
              Feature Tour
            </span>
            <span className="text-[11px] text-sky-600/40 dark:text-sky-400/40">
              Revisit the interactive feature walkthrough
            </span>
          </div>
        </div>
        <button
          type="button"
          onClick={resetTour}
          className="px-3.5 py-1.5 text-xs font-semibold rounded-xl bg-sky-50 dark:bg-sky-950/50 text-sky-600 dark:text-sky-400 hover:bg-sky-100 dark:hover:bg-sky-900/50 transition-colors border border-sky-200/60 dark:border-sky-800/40 shadow-2xs"
        >
          Restart Tour
        </button>
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
