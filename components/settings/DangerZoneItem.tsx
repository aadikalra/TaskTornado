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
    <div className={`p-4 rounded-lg border transition-colors ${variant === 'destructive'
      ? 'border-red-200 dark:border-red-900/30 bg-red-50/50 dark:bg-red-950/20'
      : 'border-blue-200 dark:border-blue-900/30 bg-blue-50/50 dark:bg-blue-950/20'
      }`}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Icon className={`h-4 w-4 shrink-0 ${variant === 'destructive'
              ? 'text-red-600 dark:text-red-400'
              : 'text-blue-600 dark:text-blue-400'
              }`} />
            <h3 className={`text-sm font-semibold ${variant === 'destructive'
              ? 'text-red-900 dark:text-red-100'
              : 'text-blue-900 dark:text-blue-100'
              }`}>
              {title}
            </h3>
            <span className="text-xs text-gray-500 dark:text-gray-400 ml-auto">
              {count} {count === 1 ? countLabel : `${countLabel}s`}
            </span>
          </div>
          <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
            {description}
          </p>
          <Button
            variant={isConfirming ? 'destructive' : 'outline'}
            size="sm"
            onClick={onConfirm}
            className="w-full sm:w-auto"
          >
            {isConfirming ? confirmText : buttonText}
          </Button>
        </div>
      </div>
    </div>
  );
}
