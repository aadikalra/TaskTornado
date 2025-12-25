'use client';

import { Sparkles, Trophy, Award, Brain, Check, Maximize2 } from 'lucide-react';
import { Switch } from '@/components/animate-ui/components/base/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useState } from 'react';
import { BetaPasswordModal } from '@/components/BetaPasswordModal';

type AIPersonality = 'default' | 'professional' | 'friendly' | 'candid' | 'quirky' | 'efficient' | 'nerdy' | 'cynical';

interface PreferencesSectionProps {
  showAIPriority: boolean;
  onToggleAIPriority: (checked: boolean) => void;
  showLevelDisplay: boolean;
  onToggleLevelDisplay: (checked: boolean) => void;
  showSubjectMastery: boolean;
  onToggleSubjectMastery: (checked: boolean) => void;
  aiPersonality: AIPersonality;
  onPersonalityChange: (value: AIPersonality) => void;
  useWideLayout: boolean;
  onToggleWideLayout: (checked: boolean) => void;
}

export default function PreferencesSection({
  showAIPriority,
  onToggleAIPriority,
  showLevelDisplay,
  onToggleLevelDisplay,
  showSubjectMastery,
  onToggleSubjectMastery,
  aiPersonality,
  onPersonalityChange,
  useWideLayout,
  onToggleWideLayout
}: PreferencesSectionProps) {
  const [showBetaModal, setShowBetaModal] = useState(false);
  const [betaAccessGranted, setBetaAccessGranted] = useState(false);

  const handleAIPriorityToggle = (checked: boolean) => {
    if (checked && !betaAccessGranted) {
      setShowBetaModal(true);
      return;
    }
    onToggleAIPriority(checked);
  };

  const handleBetaSuccess = () => {
    setBetaAccessGranted(true);
    onToggleAIPriority(true);
  };

  return (
    <>
      <div className="space-y-4">
        <div className="relative flex items-center justify-between p-4 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/50">
          {/* ALPHA Badge */}
          <div className="absolute -top-2 -left-2 z-10">
            <span className="text-[10px] px-1.5 py-0.5 bg-black dark:bg-white text-white dark:text-black rounded-xl">
              ALPHA
            </span>
          </div>
          <div className="flex items-start gap-3">
            <div className="mt-1">
              <Sparkles className="h-5 w-5 text-purple-500" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                AI Priority Recommendation
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-[250px] sm:max-w-none">
                Show the AI-powered homework recommendation card on the dashboard.
              </p>
            </div>
          </div>
          <Switch
            checked={showAIPriority}
            onCheckedChange={handleAIPriorityToggle}
          />
        </div>

        <div className="flex items-center justify-between p-4 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/50">
          <div className="flex items-start gap-3">
            <div className="mt-1">
              <Trophy className="h-5 w-5 text-amber-500" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                Level Display
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-[250px] sm:max-w-none">
                Show your current level and XP progress on the dashboard.
              </p>
            </div>
          </div>
          <Switch
            checked={showLevelDisplay}
            onCheckedChange={onToggleLevelDisplay}
          />
        </div>

        <div className="flex items-center justify-between p-4 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/50">
          <div className="flex items-start gap-3">
            <div className="mt-1">
              <Award className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                Subject Mastery
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-[250px] sm:max-w-none">
                Show your top performing subjects and completion rates.
              </p>
            </div>
          </div>
          <Switch
            checked={showSubjectMastery}
            onCheckedChange={onToggleSubjectMastery}
          />
        </div>

        <div className="flex items-center justify-between p-4 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/50">
          <div className="flex items-start gap-3">
            <div className="mt-1">
              <Maximize2 className="h-5 w-5 text-green-500" />
            </div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                Full Width Mode
              </h3>
              {/* <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                Recommended
              </span> */}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-[250px] sm:max-w-none">
              Use the full width of your screen for the settings page layout.
            </p>
          </div>
          <Switch
            checked={useWideLayout}
            onCheckedChange={onToggleWideLayout}
          />
        </div>

        <div className="flex items-center justify-between p-4 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/50">
          <div className="flex items-start gap-3 flex-1">
            <div className="mt-1">
              <Brain className="h-5 w-5 text-indigo-500" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                AI Assistant Personality
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

      {/* Beta Password Modal */}
      <BetaPasswordModal
        isOpen={showBetaModal}
        onClose={() => setShowBetaModal(false)}
        onSuccess={handleBetaSuccess}
      />
    </>
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
