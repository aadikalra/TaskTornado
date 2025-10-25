'use client';

import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
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
  const handleFrequencyChange = (frequency: RecurringFrequency) => {
    onChange({ ...recurring, frequency });
  };

  const handleEndDateChange = (endDate: string) => {
    onChange({
      ...recurring,
      endDate: endDate ? new Date(endDate) : undefined
    });
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
        <Label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
          Recurring Frequency
        </Label>
        <Select value={recurring.frequency} onValueChange={handleFrequencyChange}>
          <SelectTrigger className="w-full bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 hover:border-gray-400 dark:hover:border-gray-500">
            <SelectValue placeholder="Select frequency" />
          </SelectTrigger>
          <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700" position="popper" sideOffset={4}>
            {frequencyOptions.map((option) => (
              <SelectItem
                key={option.value}
                value={option.value}
                className="hover:bg-gray-100 dark:hover:bg-gray-700 focus:bg-gray-100 dark:focus:bg-gray-700 text-sm text-gray-900 dark:text-gray-100"
              >
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="endDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            End Date (Optional)
          </Label>
          <Input
            id="endDate"
            type="date"
            value={recurring.endDate ? recurring.endDate.toISOString().split('T')[0] : ''}
            onChange={(e) => handleEndDateChange(e.target.value)}
            className="w-full bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-[#264f84] focus:border-[#264f84]"
          />
        </div>

        <div>
          <Label htmlFor="maxOccurrences" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            Max Occurrences (Optional)
          </Label>
          <Input
            id="maxOccurrences"
            type="number"
            min="1"
            value={recurring.maxOccurrences || ''}
            onChange={(e) => handleMaxOccurrencesChange(e.target.value)}
            placeholder="No limit"
            className="w-full bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-[#264f84] focus:border-[#264f84]"
          />
        </div>
      </div>

      <div className="text-xs text-gray-500 dark:text-gray-400">
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
