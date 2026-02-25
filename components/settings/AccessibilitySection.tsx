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
      <div className="flex items-center justify-between px-1 py-3.5 rounded-xl transition-colors hover:bg-sky-500/[0.03]">
        <div className="flex items-center gap-3">
          <Pause className="h-[18px] w-[18px] text-sky-500/50" />
          <span className="text-[14px] font-medium text-sky-900 dark:text-sky-100">
            Reduce Motion
          </span>
        </div>
        <Switch
          checked={reduceMotion}
          onCheckedChange={onToggleReduceMotion}
        />
      </div>

      <div className="flex items-center justify-between px-1 py-3.5 rounded-xl transition-colors hover:bg-sky-500/[0.03]">
        <div className="flex items-center gap-3">
          <Type className="h-[18px] w-[18px] text-sky-500/50" />
          <span className="text-[14px] font-medium text-sky-900 dark:text-sky-100">
            Dyslexic-Friendly Font
          </span>
        </div>
        <Switch
          checked={useDyslexicFont}
          onCheckedChange={onToggleDyslexicFont}
        />
      </div>
    </div>
  );
}
