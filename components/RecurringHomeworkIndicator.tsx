import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Settings,
  Trash2,
  Copy,
  Calendar,
  MoreHorizontal,
  RotateCcw
} from 'lucide-react';
import { RecurringHomework } from '@/context/ClassContext';
import { RecurringHomeworkService } from '@/lib/services/RecurringHomeworkService';

interface RecurringHomeworkIndicatorProps {
  homework: {
    id: string;
    title: string;
    recurring?: RecurringHomework;
    is_recurring_instance?: boolean;
    parent_recurring_id?: string;
    recurring_frequency?: string;
  };
  onEdit?: (homeworkId: string) => void;
  onDelete?: (homeworkId: string) => void;
  onDuplicate?: (homeworkId: string) => void;
  className?: string;
}

/**
 * Component to display recurring homework indicators and management options
 */
export const RecurringHomeworkIndicator: React.FC<RecurringHomeworkIndicatorProps> = ({
  homework,
  onEdit,
  onDelete,
  onDuplicate,
  className = ''
}) => {
  const isRecurringMaster = homework.recurring && !homework.is_recurring_instance;
  const isRecurringInstance = homework.is_recurring_instance === true;
  const frequency = homework.recurring_frequency || homework.recurring?.frequency;

  // Don't show indicator if not recurring
  if (!isRecurringMaster && !isRecurringInstance) {
    return null;
  }

  const getFrequencyLabel = (freq: string) => {
    switch (freq) {
      case 'daily': return 'Daily';
      case 'weekly': return 'Weekly';
      case 'biweekly': return 'Bi-weekly';
      case 'monthly': return 'Monthly';
      case 'yearly': return 'Yearly';
      default: return freq;
    }
  };

  const getFrequencyIcon = (freq: string) => {
    return <RotateCcw className="h-3 w-3" />;
  };

  if (isRecurringMaster) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800">
          <RotateCcw className="h-3 w-3 mr-1" />
          {getFrequencyLabel(frequency || '')}
        </Badge>

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
              <MoreHorizontal className="h-3 w-3" />
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-48">
            <div className="space-y-1">
              {onEdit && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => onEdit(homework.id)}
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Edit Series
                </Button>
              )}
              {onDuplicate && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => onDuplicate(homework.id)}
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Duplicate Series
                </Button>
              )}
              {onDelete && (
                <>
                  <div className="border-t my-1" />
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start text-red-600 dark:text-red-400"
                    onClick={() => onDelete(homework.id)}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Series
                  </Button>
                </>
              )}
            </div>
          </PopoverContent>
        </Popover>
      </div>
    );
  }

  if (isRecurringInstance) {
    return (
      <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800">
        <Calendar className="h-3 w-3 mr-1" />
        Recurring
      </Badge>
    );
  }

  return null;
};
