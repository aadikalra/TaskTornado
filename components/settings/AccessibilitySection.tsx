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
    <div className="space-y-1">
      <div className="flex items-center justify-between px-3 py-3.5 rounded-xl transition-colors hover:bg-gray-50 dark:hover:bg-zinc-900/50">
        <div className="flex items-center gap-3">
          <Pause className="h-[18px] w-[18px] text-violet-500/70" />
          <span className="text-[14px] font-medium text-gray-700 dark:text-zinc-300">
            Reduce Motion
          </span>
        </div>
        <Switch
          checked={reduceMotion}
          onCheckedChange={onToggleReduceMotion}
          className="data-[state=checked]:bg-blue-500"
        />
      </div>

      <div className="flex items-center justify-between px-3 py-3.5 rounded-xl transition-colors hover:bg-gray-50 dark:hover:bg-zinc-900/50">
        <div className="flex items-center gap-3">
          <Type className="h-[18px] w-[18px] text-violet-500/70" />
          <span className="text-[14px] font-medium text-gray-700 dark:text-zinc-300">
            Dyslexic-Friendly Font
          </span>
        </div>
        <Switch
          checked={useDyslexicFont}
          onCheckedChange={onToggleDyslexicFont}
          className="data-[state=checked]:bg-blue-500"
        />
      </div>
    </div>
  );
}
