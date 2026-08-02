'use client';

import {
  BookOpen,
  Clock3,
  Gauge,
  GraduationCap,
  Languages,
  PenLine,
  Sparkles,
  WandSparkles,
} from 'lucide-react';

import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from '@/components/ui/dialog';
import type { AiAction, ServerPlanTier } from '@/lib/ai/config';
import { cn } from '@/lib/utils';

export type AIUsageSummary = {
  tier: ServerPlanTier;
  limits: Record<AiAction | 'combined', number>;
  usage: {
    combined: number;
    actions: Record<AiAction, number>;
  };
  burst: {
    limit: number;
    windowSeconds: number;
  };
  resetAt: string;
  source: 'database' | 'local-fallback';
};

type Props = {
  summary: AIUsageSummary | null;
  loading: boolean;
  selectedAction: 'quick' | 'tutor';
  onUpgrade: () => void;
};

const ACTIONS: Array<{
  action: AiAction;
  label: string;
  shortLabel: string;
  icon: typeof Sparkles;
  group: 'chat' | 'tools';
}> = [
  {
    action: 'quick',
    label: 'Quick chat',
    shortLabel: 'Quick',
    icon: Sparkles,
    group: 'chat',
  },
  {
    action: 'tutor',
    label: 'Tutor mode',
    shortLabel: 'Tutor',
    icon: GraduationCap,
    group: 'chat',
  },
  {
    action: 'bulk_generation',
    label: 'Study sets',
    shortLabel: 'Study',
    icon: WandSparkles,
    group: 'tools',
  },
  {
    action: 'translation',
    label: 'Translation',
    shortLabel: 'Translate',
    icon: Languages,
    group: 'tools',
  },
  {
    action: 'grader',
    label: 'Grading help',
    shortLabel: 'Grader',
    icon: BookOpen,
    group: 'tools',
  },
  {
    action: 'copilot',
    label: 'Writing help',
    shortLabel: 'Writing',
    icon: PenLine,
    group: 'tools',
  },
  {
    action: 'guardian',
    label: 'Guardian chat',
    shortLabel: 'Guardian',
    icon: Gauge,
    group: 'tools',
  },
];

function remaining(used: number, limit: number) {
  return Math.max(0, limit - used);
}

function formatReset(resetAt?: string) {
  if (!resetAt) return 'tomorrow';
  return new Intl.DateTimeFormat(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(resetAt));
}

function Progress({
  used,
  limit,
  className,
}: {
  used: number;
  limit: number;
  className?: string;
}) {
  const percent = limit > 0 ? Math.min(100, (used / limit) * 100) : 100;
  return (
    <div
      className={cn(
        'h-1.5 overflow-hidden rounded-full bg-sky-100 dark:bg-sky-900/40',
        className
      )}
    >
      <div
        className={cn(
          'h-full rounded-full transition-[width] duration-500',
          percent >= 90
            ? 'bg-rose-500 dark:bg-rose-400'
            : percent >= 70
              ? 'bg-amber-500 dark:bg-amber-400'
              : 'bg-sky-500 dark:bg-sky-400'
        )}
        style={{ width: `${percent}%` }}
      />
    </div>
  );
}

export function AIQuotaPopover({
  summary,
  loading,
  selectedAction,
  onUpgrade,
}: Props) {
  const combinedLimit = summary?.limits.combined || 0;
  const combinedUsed = summary?.usage.combined || 0;
  const combinedLeft = remaining(combinedUsed, combinedLimit);
  const remainingPercent =
    combinedLimit > 0 ? Math.round((combinedLeft / combinedLimit) * 100) : 0;
  const selectedUsed = summary?.usage.actions[selectedAction] || 0;
  const selectedLimit = summary?.limits[selectedAction] || 0;
  const selectedLeft = remaining(selectedUsed, selectedLimit);
  const ringColor =
    remainingPercent <= 10
      ? 'text-rose-500 dark:text-rose-400'
      : remainingPercent <= 30
        ? 'text-amber-500 dark:text-amber-400'
        : 'text-sky-500 dark:text-sky-400';

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button
          type="button"
          aria-label="View AI allowance"
          className="flex h-9 items-center gap-1.5 rounded-xl border border-sky-100/50 bg-white/50 px-2.5 shadow-sm backdrop-blur-md transition hover:bg-white/80 dark:border-white/5 dark:bg-gray-900/50 dark:hover:bg-gray-900/80 text-sky-400 hover:text-sky-900 dark:text-sky-500 dark:hover:text-white"
        >
          <Gauge className="h-4 w-4 shrink-0" />
          <span className="text-[13px] font-medium tabular-nums">
            {loading || !summary ? '...' : combinedLeft}
          </span>
        </button>
      </DialogTrigger>

      <DialogContent
        showCloseButton={false}
        className="gap-0 max-h-[min(640px,calc(100vh-24px))] w-[min(340px,calc(100vw-24px))] overflow-y-auto overscroll-contain rounded-3xl border border-sky-100/50 bg-white/95 p-0 shadow-2xl backdrop-blur-xl dark:border-sky-500/10 dark:bg-gray-900/95"
      >
        <div className="flex items-center justify-between border-b border-sky-100/50 bg-sky-50/50 px-5 py-3.5 dark:border-sky-500/10 dark:bg-sky-500/5">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-sky-600 dark:text-sky-400">
              {summary?.tier || 'Free'} Plan
            </p>
            <h3 className="text-sm font-semibold text-sky-950 dark:text-sky-100">
              AI Allowance
            </h3>
          </div>
          <div className="flex items-center gap-1.5 rounded-full border border-sky-100/50 bg-white px-2.5 py-1 text-[11px] font-medium text-sky-600 shadow-sm dark:border-sky-500/10 dark:bg-gray-800 dark:text-sky-400">
            <Clock3 className="h-3 w-3" />
            Resets {formatReset(summary?.resetAt)}
          </div>
        </div>

        <div className="px-5 py-5">
          <div className="mb-3 flex items-end justify-between">
            <div>
              <p className="text-4xl font-bold tracking-tight text-sky-950 dark:text-sky-100">
                {loading || !summary ? '—' : combinedLeft}
              </p>
              <p className="text-xs font-medium text-sky-600/70 dark:text-sky-400/70">
                actions remaining today
              </p>
            </div>
            <p className="text-xs font-semibold text-sky-900/40 dark:text-sky-100/40 pb-0.5">
              {combinedUsed} / {combinedLimit} used
            </p>
          </div>
          <Progress used={combinedUsed} limit={combinedLimit} />
        </div>

        <div className="space-y-5 px-5 pb-5">
          <div>
            <div className="mb-2.5 flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-sky-900/40 dark:text-sky-100/40">
                Chat Modes
              </h4>
              <span className="text-[10px] font-semibold text-sky-600 dark:text-sky-400">
                {selectedLeft} {selectedAction === 'quick' ? 'Quick' : 'Tutor'} left
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              {ACTIONS.filter((item) => item.group === 'chat').map((item) => {
                const used = summary?.usage.actions[item.action] || 0;
                const limit = summary?.limits[item.action] || 0;
                const Icon = item.icon;
                const isSelected = selectedAction === item.action;
                return (
                  <div
                    key={item.action}
                    className={cn(
                      'relative overflow-hidden rounded-xl border p-3 transition-colors',
                      isSelected
                        ? 'border-sky-200 bg-sky-50/50 dark:border-sky-500/30 dark:bg-sky-500/10'
                        : 'border-sky-100/50 bg-white dark:border-sky-500/10 dark:bg-gray-800/40'
                    )}
                  >
                    <div className="mb-2 flex items-center justify-between">
                      <Icon className={cn("h-4 w-4", isSelected ? "text-sky-600 dark:text-sky-400" : "text-sky-400 dark:text-sky-600/50")} />
                      <span className="text-xs font-bold text-sky-950 dark:text-sky-100">
                        {remaining(used, limit)}
                      </span>
                    </div>
                    <p className="mb-2 text-xs font-semibold text-sky-900 dark:text-sky-100">
                      {item.shortLabel}
                    </p>
                    <Progress used={used} limit={limit} />
                  </div>
                );
              })}
            </div>
          </div>

          <div>
            <h4 className="mb-2.5 text-xs font-bold uppercase tracking-wider text-sky-900/40 dark:text-sky-100/40">
              AI Tools
            </h4>
            <div className="space-y-1">
              {ACTIONS.filter((item) => item.group === 'tools').map((item) => {
                const used = summary?.usage.actions[item.action] || 0;
                const limit = summary?.limits[item.action] || 0;
                const left = remaining(used, limit);
                const Icon = item.icon;
                return (
                  <div key={item.action} className="flex items-center gap-3 rounded-lg px-2 py-1.5 transition-colors hover:bg-sky-50/50 dark:hover:bg-sky-500/5">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-sky-100/50 text-sky-600 dark:bg-sky-500/10 dark:text-sky-400">
                      <Icon className="h-3.5 w-3.5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-medium text-sky-900 dark:text-sky-100">
                          {item.label}
                        </p>
                        <p className="text-[10px] font-semibold text-sky-600/60 dark:text-sky-400/60">
                          {limit === 0 ? 'Not included' : `${left} / ${limit}`}
                        </p>
                      </div>
                      {limit > 0 && <Progress used={used} limit={limit} className="mt-1" />}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-sky-100/50 bg-sky-50/30 px-5 py-3 dark:border-sky-500/10 dark:bg-gray-800/20">
          <div className="flex items-center gap-1.5 text-[11px] font-medium text-sky-600/60 dark:text-sky-400/60">
            <Gauge className="h-3.5 w-3.5" />
            Up to {summary?.burst.limit || 4} req / min
          </div>
          {summary?.tier === 'free' && (
            <button
              type="button"
              onClick={onUpgrade}
              className="text-[11px] font-bold text-sky-600 hover:text-sky-700 dark:text-sky-400 transition-colors"
            >
              Compare plans
            </button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
