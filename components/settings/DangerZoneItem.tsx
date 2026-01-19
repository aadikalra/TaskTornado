'use client';

import { Button } from '@/components/animate-ui/primitives/buttons/button';

interface DangerZoneItemProps {
  title: string;
  description: string;
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
  description,
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
    <div className="p-4 rounded-2xl bg-[#F7F7F9] dark:bg-zinc-900/50 transition-all hover:bg-red-50/50 dark:hover:bg-red-950/10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-red-50 dark:bg-red-950/30 rounded-xl">
              <Icon className="h-5 w-5 shrink-0 text-red-500" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h3 className="text-[15px] font-bold text-gray-900 dark:text-white">
                  {title}
                </h3>
                <span className="text-[10px] font-bold text-red-600 dark:text-red-400/70 uppercase tracking-widest bg-red-50 dark:bg-red-950/40 px-2 py-0.5 rounded-full">
                  {count} {count === 1 ? countLabel : `${countLabel}s`}
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {description}
              </p>
            </div>
          </div>
        </div>
        <Button
          onClick={onConfirm}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm ${isConfirming
              ? 'bg-red-600 dark:bg-red-500 text-white hover:bg-red-700 shadow-red-600/20'
              : 'bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-gray-900 dark:text-white hover:bg-gray-50'
            }`}
          hoverScale={1.02}
        >
          {isConfirming ? confirmText : buttonText}
        </Button>
      </div>
    </div>
  );
}
