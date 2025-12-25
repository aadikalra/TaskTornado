'use client';

import { Button } from '@/components/ui/button';

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
    <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/50 hover:bg-red-50/30 dark:hover:bg-red-950/10 hover:border-red-200/50 dark:hover:border-red-900/30 transition-colors">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Icon className="h-4 w-4 shrink-0 text-red-400/70 dark:text-red-500/50" />
            <h3 className="text-sm font-medium text-gray-900 dark:text-white">
              {title}
            </h3>
            <span className="text-xs text-gray-400 dark:text-gray-500 ml-auto">
              {count} {count === 1 ? countLabel : `${countLabel}s`}
            </span>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
            {description}
          </p>
          <Button
            variant={isConfirming ? 'default' : 'outline'}
            size="sm"
            onClick={onConfirm}
            className={`w-full sm:w-auto ${isConfirming ? 'bg-red-600 dark:bg-red-500 text-white hover:bg-red-700 dark:hover:bg-red-600' : ''}`}
          >
            {isConfirming ? confirmText : buttonText}
          </Button>
        </div>
      </div>
    </div>
  );
}
