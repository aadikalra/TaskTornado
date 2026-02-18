'use client';

import { Sparkles, Trophy, Award, Brain, Check, Maximize2, Calendar as CalendarIcon, BookOpen, RotateCcw } from 'lucide-react';
import { Switch } from '@/components/animate-ui/components/base/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useState } from 'react';
import { BetaPasswordModal } from '@/components/BetaPasswordModal';
import { useOnboardingTour } from '@/components/OnboardingTour';

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
  const { resetTour } = useOnboardingTour();

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between px-3 py-3.5 rounded-xl transition-colors hover:bg-gray-50 dark:hover:bg-zinc-900/50">
        <div className="flex items-center gap-3">
          <Maximize2 className="h-[18px] w-[18px] text-blue-500/70" />
          <span className="text-[14px] font-medium text-gray-700 dark:text-zinc-300">
            Full Width Mode
          </span>
        </div>
        <Switch
          checked={useWideLayout}
          onCheckedChange={onToggleWideLayout}
          className="data-[state=checked]:bg-blue-500"
        />
      </div>

      <div className="flex items-center justify-between px-3 py-3.5 rounded-xl transition-colors hover:bg-gray-50 dark:hover:bg-zinc-900/50">
        <div className="flex items-center gap-3">
          <BookOpen className="h-[18px] w-[18px] text-blue-500/70" />
          <span className="text-[14px] font-medium text-gray-700 dark:text-zinc-300">
            Show Tests in Class Cards
          </span>
        </div>
        <Switch
          checked={showTestsInClassCards}
          onCheckedChange={onToggleTestsInClassCards}
          className="data-[state=checked]:bg-blue-500"
        />
      </div>

      <div className="flex items-center justify-between px-3 py-3.5 rounded-xl transition-colors hover:bg-gray-50 dark:hover:bg-zinc-900/50">
        <div className="flex items-center gap-3 flex-1">
          <Brain className="h-[18px] w-[18px] text-blue-500/70" />
          <span className="text-[14px] font-medium text-gray-700 dark:text-zinc-300">
            Aurora Personality
          </span>
        </div>
        <CustomPersonalitySelect
          value={aiPersonality}
          onValueChange={onPersonalityChange}
        />
      </div>

      <div className="flex items-center justify-between px-3 py-3.5 rounded-xl transition-colors hover:bg-gray-50 dark:hover:bg-zinc-900/50">
        <div className="flex items-center gap-3">
          <RotateCcw className="h-[18px] w-[18px] text-blue-500/70" />
          <span className="text-[14px] font-medium text-gray-700 dark:text-zinc-300">
            Replay Onboarding Tour
          </span>
        </div>
        <button
          onClick={resetTour}
          className="px-3.5 py-1.5 text-xs font-medium text-gray-600 dark:text-zinc-400 bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-700 rounded-lg transition-colors"
        >
          Restart
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
        className="w-[180px] h-10 px-3 py-2 text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-md shadow-sm hover:bg-gray-50 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 flex items-center justify-between"
      >
        <span className="text-gray-900 dark:text-white">
          {selectedPersonality?.name || 'Select personality'}
        </span>
        <svg
          className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-md shadow-lg max-h-60 overflow-auto">
          <div className="py-1">
            {personalities.map((personality) => (
              <button
                key={personality.value}
                type="button"
                onClick={() => {
                  onValueChange(personality.value);
                  setIsOpen(false);
                }}
                className="w-full px-3 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-800 focus:bg-gray-50 dark:focus:bg-gray-800 focus:outline-none"
              >
                <div className="flex flex-col items-start">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-900 dark:text-white">
                      {personality.name}
                    </span>
                    {value === personality.value && (
                      <Check className="w-4 h-4 text-blue-500" />
                    )}
                  </div>

                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
