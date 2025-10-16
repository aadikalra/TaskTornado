import { format, isPast, isToday, isTomorrow, differenceInDays } from 'date-fns';

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

export const getDueDateLabel = (dueDate: Date): string => {
  if (!dueDate) return 'No due date';
  
  const status = getDueDateStatus(dueDate);
  const formattedDate = format(dueDate, 'MMM d');
  
  switch (status) {
    case 'today':
      return `Today, ${formattedDate}`;
    case 'tomorrow':
      return `Tomorrow, ${formattedDate}`;
    case 'overdue':
      return `Overdue: ${formattedDate}`;
    case 'upcoming':
      const daysUntil = differenceInDays(dueDate, new Date());
      return `${daysUntil} ${daysUntil === 1 ? 'day' : 'days'}, ${formattedDate}`;
    default:
      return formattedDate;
  }
};

export const getDueDateIcon = (dueDate: Date) => {
  const status = getDueDateStatus(dueDate);
  
  switch (status) {
    case 'overdue':
      return { icon: 'AlertCircle', color: 'text-red-500' };
    case 'today':
      return { icon: 'AlertTriangle', color: 'text-amber-500' };
    case 'tomorrow':
      return { icon: 'Clock', color: 'text-blue-500' };
    case 'upcoming':
      return { icon: 'Calendar', color: 'text-green-500' };
    default:
      return { icon: 'Calendar', color: 'text-gray-400' };
  }
};
