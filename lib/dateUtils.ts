import { format, isPast, isToday, isTomorrow, differenceInDays } from 'date-fns';
import {
  AlertCircle,
  AlertTriangle,
  Clock,
  Calendar,
  CheckCircle2,
} from 'lucide-react';

export type DueDateStatus = 'overdue' | 'today' | 'tomorrow' | 'upcoming' | 'no-date';

export const getDueDateStatus = (dueDate: Date): DueDateStatus => {
  if (!dueDate) return 'no-date';

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const due = new Date(dueDate);
  due.setHours(23, 59, 59, 999);

  if (isPast(due) && !isToday(due)) return 'overdue';
  if (isToday(due)) return 'today';
  if (isTomorrow(due)) return 'tomorrow';

  return 'upcoming';
};

export const getDueDateLabel = (dueDate: Date, isTest: boolean = false): string => {
  if (!dueDate) return 'No due date';

  const status = getDueDateStatus(dueDate);
  const formattedDate = format(dueDate, 'MMM d');

  switch (status) {
    case 'today':
      return `Today, ${formattedDate}`;
    case 'tomorrow':
      return `Tomorrow, ${formattedDate}`;
    case 'overdue':
      return `Completed: ${formattedDate}`;
    case 'upcoming':
      const daysUntil = differenceInDays(dueDate, new Date());
      return `${daysUntil} ${daysUntil === 1 ? 'day' : 'days'}, ${formattedDate}`;
    default:
      return formattedDate;
  }
};

export const getDueDateIcon = (dueDate: Date, isTest: boolean = false) => {
  const status = getDueDateStatus(dueDate);

  switch (status) {
    case 'overdue':
      return CheckCircle2;
    case 'today':
      return AlertTriangle;
    case 'tomorrow':
      return Clock;
    case 'upcoming':
      return Calendar;
    default:
      return Calendar;
  }
};
