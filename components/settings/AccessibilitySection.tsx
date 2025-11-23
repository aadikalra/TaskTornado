'use client';

import { Pause, Type } from 'lucide-react';
import { Switch } from '@/components/animate-ui/components/base/switch';

interface AccessibilitySectionProps {
  reduceMotion: boolean;
  onToggleReduceMotion: (checked: boolean) => void;
  useDyslexicFont: boolean;
  onToggleDyslexicFont: (checked: boolean) => void;
}

export default function AccessibilitySection({
  reduceMotion,
  onToggleReduceMotion,
  useDyslexicFont,
  onToggleDyslexicFont
}: AccessibilitySectionProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between p-4 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/50">
        <div className="flex items-start gap-3">
          <div className="mt-1">
            <Pause className="h-5 w-5 text-orange-500" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-900 dark:text-white">
              Reduce Motion
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-[250px] sm:max-w-none">
              Disable animations and transitions for better performance and accessibility.
            </p>
          </div>
        </div>
        <Switch
          checked={reduceMotion}
          onCheckedChange={onToggleReduceMotion}
        />
      </div>

      <div className="flex items-center justify-between p-4 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/50">
        <div className="flex items-start gap-3">
          <div className="mt-1">
            <Type className="h-5 w-5 text-green-500" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-900 dark:text-white">
              Dyslexic-Friendly Font
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-[250px] sm:max-w-none">
              Use OpenDyslexic font for improved readability.
            </p>
          </div>
        </div>
        <Switch
          checked={useDyslexicFont}
          onCheckedChange={onToggleDyslexicFont}
        />
      </div>
    </div>
  );
}
