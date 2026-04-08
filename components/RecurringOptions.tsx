'use client';

import React, { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { HugeIcon } from '@/lib/huge-icon-map';
import { format } from 'date-fns';
import { RecurringFrequency, RecurringHomework } from '@/context/ClassContext';

interface RecurringOptionsProps {
  recurring: RecurringHomework;
  onChange: (recurring: RecurringHomework) => void;
}

const frequencyOptions: { value: RecurringFrequency; label: string }[] = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'biweekly', label: 'Bi-weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'yearly', label: 'Yearly' },
];

export function RecurringOptions({ recurring, onChange }: RecurringOptionsProps) {
  const [endDatePopoverOpen, setEndDatePopoverOpen] = useState(false);

  const handleFrequencyChange = (frequency: RecurringFrequency) => {
    onChange({ ...recurring, frequency });
  };

  const handleEndDateChange = (endDate: Date | undefined) => {
    onChange({
      ...recurring,
      endDate
    });
    setEndDatePopoverOpen(false);
  };

  const handleMaxOccurrencesChange = (maxOccurrences: string) => {
    onChange({
      ...recurring,
      maxOccurrences: maxOccurrences ? parseInt(maxOccurrences) : undefined
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <Label className="block text-[11px] font-semibold text-sky-600 dark:text-sky-400 uppercase tracking-wider mb-1.5">
          Recurring Frequency
        </Label>
        <Select value={recurring.frequency} onValueChange={handleFrequencyChange}>
          <SelectTrigger className="w-full bg-white dark:bg-gray-900 border-sky-200 dark:border-gray-700 text-sky-900 dark:text-white hover:border-sky-500 rounded-xl">
            <SelectValue placeholder="Select frequency" />
          </SelectTrigger>
          <SelectContent className="bg-white dark:bg-gray-900 border-sky-100 dark:border-gray-700 rounded-xl" position="popper" sideOffset={4}>
            {frequencyOptions.map((option) => (
              <SelectItem
                key={option.value}
                value={option.value}
                className="hover:bg-sky-50 dark:hover:bg-gray-800 focus:bg-sky-50 dark:focus:bg-gray-800 text-sm text-sky-900 dark:text-white rounded-lg"
              >
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="endDate" className="block text-[11px] font-semibold text-sky-600 dark:text-sky-400 uppercase tracking-wider mb-1.5">
            End Date <span className="text-sky-400 font-normal normal-case tracking-normal">(Optional)</span>
          </Label>
          <Popover open={endDatePopoverOpen} onOpenChange={setEndDatePopoverOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start text-left font-normal h-11 text-sm bg-white dark:bg-gray-900 border-sky-200 dark:border-gray-700 text-sky-900 dark:text-white hover:bg-sky-50 dark:hover:bg-gray-800 hover:border-sky-500 rounded-xl"
              >
                <HugeIcon name="Calendar02" size={16} className="mr-2 h-4 w-4 text-sky-500" />
                {recurring.endDate ? format(recurring.endDate, 'PPP') : <span className="text-sky-400">Pick an end date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 bg-white dark:bg-gray-900 border border-sky-100 dark:border-gray-700 rounded-2xl shadow-xl shadow-sky-500/5">
              <Calendar
                mode="single"
                selected={recurring.endDate}
                onSelect={handleEndDateChange}
                initialFocus
                className="text-sky-900 dark:text-white rounded-2xl"
                classNames={{
                  today: "bg-sky-50 dark:bg-sky-500/10 text-sky-600 dark:text-sky-400 rounded-md data-[selected=true]:rounded-none",
                  weekday: "text-sky-500 dark:text-sky-400 rounded-md flex-1 font-medium text-[0.8rem] select-none",
                  caption_label: "text-sky-900 dark:text-white font-semibold text-sm select-none",
                  button_previous: "text-sky-500 hover:bg-sky-50 dark:hover:bg-sky-500/10 rounded-lg",
                  button_next: "text-sky-500 hover:bg-sky-50 dark:hover:bg-sky-500/10 rounded-lg",
                }}
              />
            </PopoverContent>
          </Popover>
        </div>

        <div>
          <Label htmlFor="maxOccurrences" className="block text-[11px] font-semibold text-sky-600 dark:text-sky-400 uppercase tracking-wider mb-1.5">
            Max Occurrences <span className="text-sky-400 font-normal normal-case tracking-normal">(Optional)</span>
          </Label>
          <Input
            id="maxOccurrences"
            type="number"
            min="1"
            value={recurring.maxOccurrences || ''}
            onChange={(e) => handleMaxOccurrencesChange(e.target.value)}
            placeholder="No limit"
            className="w-full h-11 bg-white dark:bg-gray-900 border-sky-200 dark:border-gray-700 text-sky-900 dark:text-white placeholder-sky-400 dark:placeholder-sky-500 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
          />
        </div>
      </div>

      <div className="text-xs text-sky-500 dark:text-sky-400">
        {recurring.frequency && (
          <p>
            This homework will repeat {frequencyOptions.find(f => f.value === recurring.frequency)?.label.toLowerCase()}
            {recurring.endDate && ` until ${recurring.endDate.toLocaleDateString()}`}
            {recurring.maxOccurrences && ` for ${recurring.maxOccurrences} occurrences`}
            {!recurring.endDate && !recurring.maxOccurrences && ' indefinitely'}
          </p>
        )}
      </div>
    </div>
  );
}
