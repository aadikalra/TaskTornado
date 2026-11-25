'use client';

import React, { useMemo, useState } from 'react';
import { format } from 'date-fns';
import type { DropdownProps } from 'react-day-picker';
import * as SelectPrimitive from '@radix-ui/react-select';
import { Button } from '@/components/animate-ui/components/buttons/button';
import { buttonVariants } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { HugeIcon } from '@/lib/huge-icon-map';
import { cn } from '@/lib/utils';

type PlainDateLike = {
  year: number;
  month: number;
  day: number;
  toString: () => string;
};

type TemporalGlobal = {
  PlainDate: {
    from: (input: string | { year: number; month: number; day: number }) => PlainDateLike;
  };
  Now: {
    plainDateISO: () => PlainDateLike;
  };
};

function getTemporal(): TemporalGlobal | undefined {
  return (globalThis as { Temporal?: TemporalGlobal }).Temporal;
}

/** Returns today's calendar date in the user's local timezone without UTC drift. */
export function getTodayLocalDate(): Date {
  const temporal = getTemporal();
  if (temporal) {
    const today = temporal.Now.plainDateISO();
    return new Date(today.year, today.month - 1, today.day);
  }
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

/** Parses an ISO `YYYY-MM-DD` date string into a local calendar `Date` without UTC shift. */
export function parseIsoDateToLocalDate(value: string): Date | undefined {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return undefined;

  const temporal = getTemporal();
  if (temporal) {
    try {
      const plain = temporal.PlainDate.from(value);
      return new Date(plain.year, plain.month - 1, plain.day);
    } catch {
      return undefined;
    }
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (month < 1 || month > 12 || day < 1 || day > 31) return undefined;

  const parsed = new Date(year, month - 1, day);
  if (
    parsed.getFullYear() !== year ||
    parsed.getMonth() !== month - 1 ||
    parsed.getDate() !== day
  ) {
    return undefined;
  }
  return parsed;
}

/** Formats a local calendar `Date` as `YYYY-MM-DD` without converting through UTC. */
export function formatLocalDateToIso(date: Date): string {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();

  const temporal = getTemporal();
  if (temporal) {
    return temporal.PlainDate.from({ year, month, day }).toString();
  }

  return `${year.toString().padStart(4, '0')}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
}

/**
 * Custom Radix Select dropdown for month and year navigation inside the calendar.
 * Uses a directly scrollable Viewport without overlay scroll buttons so any year clicks cleanly.
 */
function CalendarSelectDropdown({
  options,
  value,
  onChange,
  disabled,
  'aria-label': ariaLabel,
}: DropdownProps) {
  return (
    <SelectPrimitive.Root
      value={value !== undefined ? String(value) : undefined}
      onValueChange={(nextValue) => {
        onChange?.({
          target: { value: nextValue },
        } as React.ChangeEvent<HTMLSelectElement>);
      }}
      disabled={disabled}
    >
      <SelectPrimitive.Trigger
        aria-label={ariaLabel}
        className="group inline-flex h-8 items-center justify-between gap-1 rounded-lg border border-[#275085]/15 dark:border-[#a0c3ff]/15 bg-white dark:bg-[#11192e] px-2.5 text-xs font-semibold text-[#275085] dark:text-[#a0c3ff] hover:bg-[#275085]/5 dark:hover:bg-[#a0c3ff]/10 transition-all outline-none focus-visible:ring-2 focus-visible:ring-[#275085]/25 dark:focus-visible:ring-[#a0c3ff]/30 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <SelectPrimitive.Value />
        <SelectPrimitive.Icon asChild>
          <HugeIcon
            name="ArrowDown01"
            size={14}
            className="size-3.5 shrink-0 text-[#275085]/60 dark:text-[#a0c3ff]/60 transition-transform duration-200 group-data-[state=open]:rotate-180"
          />
        </SelectPrimitive.Icon>
      </SelectPrimitive.Trigger>
      <SelectPrimitive.Portal>
        <SelectPrimitive.Content
          position="popper"
          sideOffset={4}
          className="z-[200] min-w-[5.75rem] overflow-hidden rounded-xl border border-[#275085]/15 dark:border-[#a0c3ff]/15 bg-white dark:bg-[#0f172a] shadow-xl shadow-[#275085]/10 dark:shadow-black/60 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95"
        >
          <SelectPrimitive.Viewport
            className="max-h-60 overflow-y-auto p-1"
            style={{ scrollbarWidth: 'thin' }}
          >
            {options?.map((option) => (
              <SelectPrimitive.Item
                key={option.value}
                value={String(option.value)}
                disabled={option.disabled}
                className="relative flex w-full cursor-pointer items-center rounded-lg py-1.5 pl-2.5 pr-7 text-xs font-medium text-[#275085] dark:text-[#a0c3ff] outline-hidden select-none focus:bg-[#275085]/10 dark:focus:bg-[#a0c3ff]/15 focus:text-[#275085] dark:focus:text-white data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
              >
                <span className="absolute right-2 flex size-3.5 items-center justify-center">
                  <SelectPrimitive.ItemIndicator>
                    <HugeIcon
                      name="CheckmarkCircle02"
                      size={14}
                      className="size-3.5 text-[#275085] dark:text-[#a0c3ff]"
                    />
                  </SelectPrimitive.ItemIndicator>
                </span>
                <SelectPrimitive.ItemText>{option.label}</SelectPrimitive.ItemText>
              </SelectPrimitive.Item>
            ))}
          </SelectPrimitive.Viewport>
        </SelectPrimitive.Content>
      </SelectPrimitive.Portal>
    </SelectPrimitive.Root>
  );
}

const birthdayCalendarComponents = {
  Dropdown: CalendarSelectDropdown,
};

interface BirthdayDatePickerProps {
  id?: string;
  name?: string;
  value: string;
  onChange: (value: string) => void;
  defaultBrowseDate?: Date;
  disabled?: boolean;
  ariaInvalid?: boolean;
  ariaDescribedBy?: string;
  placeholder?: string;
  triggerRef?: React.Ref<HTMLButtonElement>;
}

/**
 * Custom popover calendar date picker for birthdates with custom month/year Radix Select dropdowns.
 */
export function BirthdayDatePicker({
  id = 'birthday',
  name,
  value,
  onChange,
  defaultBrowseDate,
  disabled = false,
  ariaInvalid = false,
  ariaDescribedBy,
  placeholder = 'Select date',
  triggerRef,
}: BirthdayDatePickerProps) {
  const [open, setOpen] = useState(false);
  const today = useMemo(() => getTodayLocalDate(), []);
  const startMonth = useMemo(() => new Date(1900, 0, 1), []);
  const selectedDate = useMemo(() => parseIsoDateToLocalDate(value), [value]);

  const initialBrowseMonth = useMemo(() => {
    if (selectedDate) return selectedDate;
    if (!defaultBrowseDate) return today;
    if (defaultBrowseDate < startMonth) return startMonth;
    if (defaultBrowseDate > today) return today;
    return defaultBrowseDate;
  }, [selectedDate, defaultBrowseDate, startMonth, today]);

  const [displayMonth, setDisplayMonth] = useState<Date>(() => initialBrowseMonth);

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (nextOpen) {
      setDisplayMonth(selectedDate ?? initialBrowseMonth);
    }
  };

  return (
    <div className="min-w-0">
      {name && <input type="hidden" name={name} value={value} />}
      <Popover open={open} onOpenChange={handleOpenChange}>
        <PopoverTrigger asChild>
          <Button
            ref={triggerRef}
            id={id}
            type="button"
            variant="outline"
            disabled={disabled}
            hoverScale={1}
            tapScale={1}
            aria-invalid={ariaInvalid || undefined}
            aria-describedby={ariaDescribedBy}
            className={cn(
              'w-full h-10 justify-between px-2.5 gap-1.5 font-normal text-sm rounded-xl bg-white/85 dark:bg-[#0d1526]/90 border border-[#275085]/20 dark:border-[#a0c3ff]/20 text-[#275085] dark:text-[#a0c3ff] hover:bg-white dark:hover:bg-[#131d35] hover:border-[#275085]/35 dark:hover:border-[#a0c3ff]/35 focus-visible:border-[#275085] dark:focus-visible:border-[#a0c3ff] focus-visible:ring-2 focus-visible:ring-[#275085]/20 dark:focus-visible:ring-[#a0c3ff]/25 shadow-xs transition-all outline-none',
              ariaInvalid &&
                'border-red-500/60 dark:border-red-400/60 ring-2 ring-red-500/15'
            )}
          >
            <span className="flex min-w-0 items-center gap-1.5">
              <HugeIcon
                name="Calendar02"
                size={15}
                className="size-4 shrink-0 text-[#275085]/70 dark:text-[#a0c3ff]/70"
              />
              <span
                className={cn(
                  'truncate text-left',
                  selectedDate
                    ? 'text-[#275085] dark:text-[#a0c3ff]'
                    : 'text-[#275085]/50 dark:text-[#a0c3ff]/50'
                )}
              >
                {selectedDate ? format(selectedDate, 'MMM d, yyyy') : placeholder}
              </span>
            </span>
            <HugeIcon
              name="ArrowDown01"
              size={16}
              className={cn(
                'size-4 shrink-0 text-[#275085]/50 dark:text-[#a0c3ff]/50 transition-transform duration-200',
                open && 'rotate-180'
              )}
            />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          align="start"
          sideOffset={4}
          className="w-auto p-0 bg-white dark:bg-[#0f172a] border border-[#275085]/15 dark:border-[#a0c3ff]/15 rounded-xl shadow-xl shadow-[#275085]/10 dark:shadow-black/60 overflow-hidden"
        >
          <Calendar
            mode="single"
            captionLayout="dropdown"
            reverseYears
            selected={selectedDate}
            month={displayMonth}
            onMonthChange={setDisplayMonth}
            startMonth={startMonth}
            endMonth={today}
            disabled={{ after: today }}
            onSelect={(date) => {
              if (!date) return;
              onChange(formatLocalDateToIso(date));
              setDisplayMonth(date);
              setOpen(false);
            }}
            components={birthdayCalendarComponents}
            autoFocus
            className="bg-white dark:bg-[#0f172a] text-[#275085] dark:text-[#a0c3ff] rounded-xl [--cell-size:--spacing(9)]"
            classNames={{
              nav: 'flex items-center gap-1 w-full absolute top-0 inset-x-0 justify-between pointer-events-none',
              button_previous: cn(
                buttonVariants({ variant: 'ghost' }),
                'size-(--cell-size) aria-disabled:opacity-35 p-0 select-none pointer-events-auto rounded-lg text-[#275085] dark:text-[#a0c3ff] hover:bg-[#275085]/10 dark:hover:bg-[#a0c3ff]/10'
              ),
              button_next: cn(
                buttonVariants({ variant: 'ghost' }),
                'size-(--cell-size) aria-disabled:opacity-35 p-0 select-none pointer-events-auto rounded-lg text-[#275085] dark:text-[#a0c3ff] hover:bg-[#275085]/10 dark:hover:bg-[#a0c3ff]/10'
              ),
              dropdowns:
                'relative z-10 w-full flex items-center text-sm font-medium justify-center h-(--cell-size) gap-1.5',
              weekdays: 'grid grid-cols-7',
              weekday:
                'text-[#275085]/55 dark:text-[#a0c3ff]/55 rounded-md font-medium text-[0.78rem] text-center select-none',
              week: 'grid grid-cols-7 w-full mt-2',
              today:
                'bg-[#275085]/10 dark:bg-[#a0c3ff]/15 text-[#275085] dark:text-[#a0c3ff] rounded-xl',
              day_button:
                'data-[selected-single=true]:bg-[#275085] data-[selected-single=true]:text-white dark:data-[selected-single=true]:bg-[#4f8df0] dark:data-[selected-single=true]:text-white hover:bg-[#275085]/10 dark:hover:bg-[#a0c3ff]/15',
            }}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
