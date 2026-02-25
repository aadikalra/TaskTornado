'use client';

import { Button } from '@/components/animate-ui/primitives/buttons/button';

interface DangerZoneItemProps {
  title: string;
  buttonText: string;
  confirmText: string;
  onConfirm: () => void;
  isConfirming: boolean;
  count: number;
  countLabel: string;
  icon: React.ElementType;
  variant?: 'destructive' | 'warning';
}

export default function DangerZoneItem({
  title,
  buttonText,
  confirmText,
  onConfirm,
  isConfirming,
  count,
  countLabel,
  icon: Icon,
  variant = 'destructive'
}: DangerZoneItemProps) {
  return (
    <div className="flex items-center justify-between px-1 py-3.5 rounded-xl transition-colors hover:bg-sky-500/[0.03]">
      <div className="flex items-center gap-3">
        <Icon className="h-[18px] w-[18px] text-sky-500/50" />
        <span className="text-[14px] font-medium text-sky-900 dark:text-sky-100">
          {title}
        </span>
        <span className="text-[11px] font-semibold text-sky-600/30 dark:text-sky-400/30 tabular-nums">
          ({count})
        </span>
      </div>
      <Button
        onClick={onConfirm}
        className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${isConfirming
          ? 'bg-red-500 text-white hover:bg-red-600 shadow-md shadow-red-500/20'
          : 'text-sky-700 dark:text-sky-300 bg-[#ebf6b5]/60 dark:bg-[#ebf6b5]/10 border border-[#d4e88e]/50 dark:border-[#d4e88e]/20 hover:bg-[#ebf6b5]'
          }`}
        hoverScale={1.02}
      >
        {isConfirming ? confirmText : buttonText}
      </Button>
    </div>
  );
}
