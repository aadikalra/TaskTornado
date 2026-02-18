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
    <div className="flex items-center justify-between px-3 py-3.5 rounded-xl transition-colors hover:bg-gray-50 dark:hover:bg-zinc-900/50">
      <div className="flex items-center gap-3">
        <Icon className="h-[18px] w-[18px] text-amber-500/70" />
        <span className="text-[14px] font-medium text-gray-700 dark:text-zinc-300">
          {title}
        </span>
        <span className="text-[11px] font-medium text-gray-400 dark:text-zinc-600 tabular-nums">
          ({count})
        </span>
      </div>
      <Button
        onClick={onConfirm}
        className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${isConfirming
          ? 'bg-red-500 text-white hover:bg-red-600'
          : 'text-gray-600 dark:text-zinc-400 bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-700'
          }`}
        hoverScale={1.02}
      >
        {isConfirming ? confirmText : buttonText}
      </Button>
    </div>
  );
}
