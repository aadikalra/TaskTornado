'use client';

import { memo, useCallback, useId, useState, type ComponentProps } from 'react';
import { addDays, format } from 'date-fns';
import { Button } from '@/components/animate-ui/components/buttons/button';
import { Calendar, CalendarDayButton } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { getNoSchoolEventsForDate } from '@/data/schoolEvents';
import { HugeIcon } from '@/lib/huge-icon-map';
import { cn } from '@/lib/utils';
import focusStyles from '@/components/HomeworkFormFocus.module.css';

function getNoSchoolLabel(date: Date) {
  return getNoSchoolEventsForDate(date)
    .map(event => event.title.replace(/^No (?:School|Summer Session):\s*/, ''))
    .join(', ');
}

function HolidayDayButton({ day, modifiers, children, ...props }: ComponentProps<typeof CalendarDayButton>) {
  const noSchoolLabel = getNoSchoolLabel(day.date);

  return (
    <CalendarDayButton
      {...props}
      day={day}
      modifiers={modifiers}
      className={cn(props.className, 'relative')}
      title={noSchoolLabel ? `No school · ${noSchoolLabel}` : undefined}
      aria-label={noSchoolLabel ? `${props['aria-label']}. No school: ${noSchoolLabel}` : props['aria-label']}
    >
      {children}
      {noSchoolLabel && (
        <span
          aria-hidden="true"
          className={cn(
            'pointer-events-none absolute bottom-1 left-1/2 size-[3px] -translate-x-1/2 rounded-full',
            modifiers.selected ? 'bg-amber-200 dark:bg-amber-950' : 'bg-amber-500 dark:bg-amber-400'
          )}
        />
      )}
    </CalendarDayButton>
  );
}

const holidayCalendarComponents = { DayButton: HolidayDayButton };
// Updating the footer should not remount the calendar's focused day.
const HolidayCalendar = memo(Calendar);

export function HomeworkDueDatePicker({ value, onChange }: { value: Date; onChange: (date: Date) => void }) {
  const [open, setOpen] = useState(false);
  const [previewDate, setPreviewDate] = useState<Date>();
  const clearPreview = useCallback(() => setPreviewDate(undefined), []);
  const handleSelect = useCallback((date: Date | undefined) => {
    if (date) onChange(date);
  }, [onChange]);
  const warningId = useId();
  const selectedNoSchoolLabel = getNoSchoolLabel(value);
  const previewNoSchoolLabel = previewDate ? getNoSchoolLabel(previewDate) : '';
  const noSchoolLabel = previewNoSchoolLabel || selectedNoSchoolLabel;
  const warning = selectedNoSchoolLabel
    ? `Due date falls on a no-school day: ${selectedNoSchoolLabel}. Double-check the deadline.`
    : '';

  return (
    <div className="flex min-w-0">
      <Popover open={open} onOpenChange={(nextOpen) => { setOpen(nextOpen); setPreviewDate(undefined); }}>
        <PopoverTrigger asChild>
          <Button
            id="dueDate"
            type="button"
            variant="outline"
            hoverScale={1}
            tapScale={1}
            aria-describedby={selectedNoSchoolLabel ? warningId : undefined}
            title={warning || undefined}
            className={cn(
              'w-full justify-start px-3 font-normal h-9 text-sm bg-white dark:bg-gray-900 border border-sky-100 dark:border-gray-800 text-sky-900 dark:text-sky-100 hover:bg-sky-50/50 dark:hover:bg-sky-500/5 hover:border-sky-200 dark:hover:border-gray-700 rounded-xl transition-all outline-none',
              selectedNoSchoolLabel && 'border-amber-200 dark:border-amber-700/60 text-amber-800 dark:text-amber-300'
            )}
          >
            <HugeIcon name="Calendar02" size={14} className={cn('mr-2 h-3.5 w-3.5 shrink-0', selectedNoSchoolLabel ? 'text-amber-600 dark:text-amber-400' : 'text-sky-500')} />
            <span className="text-left truncate">{format(value, 'MMM d')}</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className={`${focusStyles.scope} w-auto p-0 bg-white dark:bg-gray-900 border border-sky-100 dark:border-gray-800 rounded-xl shadow-xl shadow-sky-950/8 dark:shadow-black/50 overflow-hidden`} align="end" sideOffset={4}>
          <HolidayCalendar
            mode="single"
            selected={value}
            defaultMonth={value}
            onSelect={handleSelect}
            onDayMouseEnter={setPreviewDate}
            onDayMouseLeave={clearPreview}
            onDayFocus={setPreviewDate}
            onDayBlur={clearPreview}
            onMonthChange={clearPreview}
            components={holidayCalendarComponents}
            autoFocus
            className="text-sky-900 dark:text-white rounded-xl"
          />
          {/* Reuse the existing 57px footer: a 12px hint and 24px shortcuts. */}
          <div className="relative border-t border-sky-100 dark:border-gray-800 px-3 pb-2 pt-6">
            <p
              title={noSchoolLabel ? `No school · ${noSchoolLabel}. Double-check the deadline.` : 'Amber dots mark school holidays, breaks, and staff days.'}
              className={cn(
                'absolute inset-x-3 top-2 flex min-w-0 items-center gap-1.5 text-[10px] leading-3',
                noSchoolLabel ? 'text-amber-700 dark:text-amber-300' : 'text-sky-600/70 dark:text-sky-400/70'
              )}
            >
              <span aria-hidden="true" className="size-[3px] shrink-0 rounded-full bg-amber-500 dark:bg-amber-400" />
              <span className="truncate">{noSchoolLabel ? `No school · ${noSchoolLabel}` : 'No-school days'}</span>
            </p>
            <div className="flex gap-2">
              {[
                { label: 'Today', days: 0 },
                { label: 'Tomorrow', days: 1 },
                { label: 'Next week', days: 7 },
              ].map(({ label, days }) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => {
                    onChange(addDays(new Date(), days));
                    setOpen(false);
                    setPreviewDate(undefined);
                  }}
                  className="h-6 rounded-lg bg-sky-50 dark:bg-gray-800 px-3 text-xs font-medium text-sky-700 dark:text-sky-300 hover:bg-sky-100 dark:hover:bg-gray-700 transition-colors"
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </PopoverContent>
      </Popover>
      <span id={warningId} role="status" className="sr-only">{warning}</span>
    </div>
  );
}
