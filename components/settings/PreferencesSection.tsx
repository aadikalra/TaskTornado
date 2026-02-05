'use client';

import { Sparkles, Trophy, Award, Brain, Check, Maximize2, Calendar as CalendarIcon, BookOpen } from 'lucide-react';
import { Switch } from '@/components/animate-ui/components/base/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useState } from 'react';
import { BetaPasswordModal } from '@/components/BetaPasswordModal';

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
  return (
    <div className="space-y-3">




      <div className="flex items-center justify-between p-4 rounded-2xl bg-[#F7F7F9] dark:bg-zinc-900/50 transition-all hover:bg-gray-100 dark:hover:bg-zinc-900/80">
        <div className="flex items-start gap-3">
          <div className="mt-1 p-2 bg-green-50 dark:bg-green-950/30 rounded-xl">
            <Maximize2 className="h-5 w-5 text-green-500" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-900 dark:text-white">
              Full Width Mode
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-[250px] sm:max-w-none">
              Use the full width of your screen for the settings page layout.
            </p>
          </div>
        </div>
        <Switch
          checked={useWideLayout}
          onCheckedChange={onToggleWideLayout}
          className="data-[state=checked]:bg-blue-600"
        />
      </div>



      <div className="flex items-center justify-between p-4 rounded-2xl bg-[#F7F7F9] dark:bg-zinc-900/50 transition-all hover:bg-gray-100 dark:hover:bg-zinc-900/80">
        <div className="flex items-start gap-3">
          <div className="mt-1 p-2 bg-purple-50 dark:bg-purple-950/30 rounded-xl">
            <BookOpen className="h-5 w-5 text-purple-500" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-900 dark:text-white">
              Show Tests in Class Cards
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-[250px] sm:max-w-none">
              Display upcoming tests directly within class cards on the dashboard.
            </p>
          </div>
        </div>
        <Switch
          checked={showTestsInClassCards}
          onCheckedChange={onToggleTestsInClassCards}
          className="data-[state=checked]:bg-blue-600"
        />
      </div>

      <div className="flex items-center justify-between p-4 rounded-2xl bg-[#F7F7F9] dark:bg-zinc-900/50 transition-all hover:bg-gray-100 dark:hover:bg-zinc-900/80">
        <div className="flex items-start gap-3 flex-1">
          <div className="mt-1 p-2 bg-indigo-50 dark:bg-indigo-950/30 rounded-xl">
            <Brain className="h-5 w-5 text-indigo-500" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white">
              Aurora Personality
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-[250px] sm:max-w-none">
              Choose how the AI assistant communicates with you.
            </p>
          </div>
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
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {personality.description}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
