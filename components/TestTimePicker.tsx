'use client';

import { useEffect, useMemo, useState } from 'react';
import { format, setHours, setMinutes } from 'date-fns';
import { Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { HugeIcon } from '@/lib/huge-icon-map';

const HOURS = Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, '0'));
const MINUTES = ['00', '05', '10', '15', '20', '25', '30', '35', '40', '45', '50', '55'];
const PERIODS = ['AM', 'PM'] as const;

const QUICK_OPTIONS: { label: string; hour: string; minute: string; period: Period }[] = [
  { label: 'Morning Block', hour: '08', minute: '00', period: 'AM' },
  { label: 'Lunch Time', hour: '12', minute: '00', period: 'PM' },
  { label: 'After School', hour: '03', minute: '30', period: 'PM' },
  { label: 'Evening', hour: '07', minute: '00', period: 'PM' },
];

type Period = (typeof PERIODS)[number];

type TestTimePickerProps = {
  value?: string | null;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
};

const defaultState = {
  hour: '08',
  minute: '00',
  period: 'AM' as Period,
};

const parseValue = (value?: string | null) => {
  if (!value) return null;
  const [rawHour, rawMinute] = value.split(':');
  if (rawHour === undefined || rawMinute === undefined) return null;

  const hour24 = Number(rawHour);
  const period: Period = hour24 >= 12 ? 'PM' : 'AM';
  let hour12 = hour24 % 12;
  if (hour12 === 0) hour12 = 12;

  return {
    hour: hour12.toString().padStart(2, '0'),
    minute: rawMinute.slice(0, 2),
    period,
  };
};

const toValue = (hour: string, minute: string, period: Period) => {
  let hourNum = Number(hour) % 12;
  if (period === 'PM') hourNum += 12;
  if (period === 'AM' && hourNum === 12) hourNum = 0;
  return `${hourNum.toString().padStart(2, '0')}:${minute}`;
};

export function TestTimePicker({
  value,
  onChange,
  placeholder = 'Add time',
  className,
}: TestTimePickerProps) {
  const [open, setOpen] = useState(false);
  const [hour, setHour] = useState(defaultState.hour);
  const [minute, setMinute] = useState(defaultState.minute);
  const [period, setPeriod] = useState<Period>(defaultState.period);

  useEffect(() => {
    const parsed = parseValue(value);
    if (!parsed) {
      setHour(defaultState.hour);
      setMinute(defaultState.minute);
      setPeriod(defaultState.period);
      return;
    }

    setHour(parsed.hour);
    setMinute(parsed.minute);
    setPeriod(parsed.period);
  }, [value]);

  const displayLabel = useMemo(() => {
    if (!value) return placeholder;

    const parsed = parseValue(value);
    if (!parsed) return placeholder;

    const date = new Date();
    const base = setMinutes(setHours(date, Number(toValue(parsed.hour, parsed.minute, parsed.period).split(':')[0])), Number(parsed.minute));
    return format(base, 'h:mm a');
  }, [value, placeholder]);

  const updateTime = (nextHour = hour, nextMinute = minute, nextPeriod: Period = period) => {
    setHour(nextHour);
    setMinute(nextMinute);
    setPeriod(nextPeriod);
    onChange(toValue(nextHour, nextMinute, nextPeriod));
  };

  const handleQuickPick = (option: { hour: string; minute: string; period: Period }) => {
    updateTime(option.hour, option.minute, option.period);
    setOpen(false);
  };

  const handleClear = () => {
    onChange('');
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className={cn(
            'w-full justify-between px-4 py-2 h-10 text-left font-medium rounded-xl border border-sky-100 dark:border-gray-800 bg-white dark:bg-gray-900 hover:bg-[#ebf6b5]/10 hover:border-[#d4e88e] focus:ring-2 focus:ring-[#ebf6b5]/40 transition-all outline-none',
            !value && 'text-sky-300 dark:text-sky-700',
            className,
          )}
        >
          <span className="flex items-center gap-2 text-sky-900 dark:text-sky-100 text-sm">
            <HugeIcon name="Timer01" size={16} className="h-4 w-4 text-sky-500" />
            {displayLabel}
          </span>
          <span className="text-[11px] font-bold text-sky-500/50 uppercase tracking-wider">Edit</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 rounded-[24px] border border-sky-100 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-2xl shadow-sky-500/10 p-4 z-[160]">
        <div className="flex items-start justify-between pb-3 border-b border-sky-50 dark:border-gray-800/50">
          <div>
            <p className="text-sm font-bold text-sky-900 dark:text-sky-100">Select Time</p>
            <p className="text-[10px] uppercase tracking-widest text-sky-500/60 font-medium">Hour, Minute & Period</p>
          </div>
          {value && (
            <Button variant="ghost" size="sm" className="h-7 text-[10px] font-bold uppercase tracking-widest text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-full" onClick={handleClear} type="button">
              Clear
            </Button>
          )}
        </div>

        <div className="grid grid-cols-3 gap-3 py-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-sky-500/40 mb-2 ml-1">Hour</p>
            <ScrollArea className="h-40 rounded-xl border border-sky-50 dark:border-gray-800 bg-sky-50/30 dark:bg-gray-900/50">
              <div className="p-1.5 space-y-1">
                {HOURS.map((h) => (
                  <button
                    key={h}
                    type="button"
                    onClick={() => updateTime(h)}
                    className={cn(
                      'w-full rounded-lg py-1.5 text-sm font-bold transition-all',
                      hour === h
                        ? 'bg-[#ebf6b5] text-sky-900 shadow-sm'
                        : 'text-sky-800/70 dark:text-sky-200/70 hover:bg-white dark:hover:bg-gray-800 hover:text-sky-900 dark:hover:text-white'
                    )}
                  >
                    {h}
                  </button>
                ))}
              </div>
            </ScrollArea>
          </div>

          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-sky-500/40 mb-2 ml-1">Minute</p>
            <ScrollArea className="h-40 rounded-xl border border-sky-50 dark:border-gray-800 bg-sky-50/30 dark:bg-gray-900/50">
              <div className="p-1.5 space-y-1">
                {MINUTES.map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => updateTime(hour, m)}
                    className={cn(
                      'w-full rounded-lg py-1.5 text-sm font-bold transition-all',
                      minute === m
                        ? 'bg-[#ebf6b5] text-sky-900 shadow-sm'
                        : 'text-sky-800/70 dark:text-sky-200/70 hover:bg-white dark:hover:bg-gray-800 hover:text-sky-900 dark:hover:text-white'
                    )}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </ScrollArea>
          </div>

          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-sky-500/40 mb-2 ml-1">Period</p>
            <div className="space-y-2">
              {PERIODS.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => updateTime(hour, minute, p)}
                  className={cn(
                    'w-full rounded-xl py-3 text-sm font-bold border transition-all',
                    period === p
                      ? 'bg-[#ebf6b5] text-sky-900 border-[#d4e88e] shadow-sm'
                      : 'border-sky-50 dark:border-gray-800 text-sky-800/70 dark:text-sky-200/70 hover:border-[#d4e88e]'
                  )}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="pt-3 border-t border-sky-50 dark:border-gray-800">
          <p className="text-[10px] font-bold uppercase tracking-widest text-sky-500/40 mb-2 ml-1">Quick Picks</p>
          <div className="flex flex-wrap gap-2">
            {QUICK_OPTIONS.map((option) => (
              <button
                key={option.label}
                type="button"
                onClick={() => handleQuickPick(option)}
                className="rounded-full border border-sky-100 dark:border-gray-800 px-3 py-1.5 text-[11px] font-bold text-sky-600 dark:text-sky-400 hover:bg-[#ebf6b5] hover:text-sky-900 hover:border-[#d4e88e] transition-all"
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
