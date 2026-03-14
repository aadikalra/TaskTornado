import * as React from 'react';
import { memo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { Trash2, Edit, School, Flame, AlertTriangle, Minus, Star } from 'lucide-react';
import confetti from 'canvas-confetti';
import { cn } from '@/lib/utils';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

import { LinkCard } from './LinkCard';
import { Checkbox } from './animate-ui/components/radix/checkbox';

export type TodoItem = {
  id: string;
  text: string;
  completed: boolean;
  subtext: string | Date; // Can be a string or Date for due date
  priority: 'high' | 'medium' | 'low';
  classId?: string;
  classColor?: string;
  links?: Array<{
    id: string;
    url: string;
    title?: string;
  }>;
  onDelete?: () => void;
  onDeleteSeries?: () => void;
  dueDateIcon: React.ReactNode;
  className?: string;
  classIcon?: string;
  pinned?: boolean; // Add pinned property
  // Recurring homework fields
  recurring?: {
    frequency: string;
    endDate?: Date;
    maxOccurrences?: number;
  };
  isRecurringInstance?: boolean;
  parentRecurringId?: string;
  recurringFrequency?: string;
};

const getPriorityIndicator = (priority: 'high' | 'medium' | 'low') => {
  switch (priority) {
    case 'high':
      return (
        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-red-100 dark:bg-red-500/15">
          <Flame className="w-3 h-3 text-red-500 dark:text-red-400" />
        </span>
      );
    case 'medium':
      return (
        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-orange-100 dark:bg-orange-500/12">
          <AlertTriangle className="w-3 h-3 text-orange-500 dark:text-orange-400" />
        </span>
      );
    case 'low':
    default:
      return (
        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-green-100 dark:bg-green-500/10">
          <Minus className="w-3 h-3 text-green-500/60 dark:text-green-400/50" />
        </span>
      );
  }
};

const getPriorityColor = (priority: 'high' | 'medium' | 'low') => {
  switch (priority) {
    case 'high':
      return 'text-sky-600';
    case 'medium':
      return 'text-sky-500';
    case 'low':
    default:
      return 'text-sky-400';
  }
};

const isGoogleClassroomAssignment = (item: TodoItem): boolean => {
  return item.id.startsWith('gc-');
};

type PlayfulHomeworkListProps = {
  items: TodoItem[];
  onItemToggle: (id: string) => void;
  onPinToggle?: (id: string, pinned: boolean) => void;
  className?: string;
  checkboxColor?: string;
};



const PlayfulHomeworkListComponent = ({
  items,
  onItemToggle,
  onPinToggle,
  className = '',
  checkboxColor = 'data-[state=checked]:bg-sky-500 data-[state=checked]:!border-transparent',
}: PlayfulHomeworkListProps) => {
  const [mounted, setMounted] = React.useState(false);
  const [confettiItems, setConfettiItems] = React.useState<Set<string>>(new Set());

  // Set mounted to true after component mounts (client-side only)
  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Trigger confetti when items become completed
  React.useEffect(() => {
    confettiItems.forEach(itemId => {
      const item = items.find(i => i.id === itemId);
      if (item?.completed) {
        // Fun confetti burst!
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: item.classColor ? [item.classColor] : ['#0ea5e9', '#ebf6b5', '#38bdf8'],
          gravity: 0.8,
          drift: 0.1,
        });

        // Remove from confetti set after triggering
        setConfettiItems(prev => {
          const newSet = new Set(prev);
          newSet.delete(itemId);
          return newSet;
        });
      }
    });
  }, [confettiItems, items]);

  const handleToggle = useCallback((id: string) => {
    const item = items.find(i => i.id === id);
    if (item && !item.completed) {
      // Mark for confetti if item is becoming completed
      setConfettiItems(prev => new Set(prev).add(id));
    }
    onItemToggle(id);
  }, [onItemToggle, items]);

  const handlePinToggle = useCallback((id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const item = items.find(item => item.id === id);
    if (item) {
      onPinToggle?.(id, !item.pinned); // Use actual pinned state
    }
  }, [onPinToggle, items]);

  // Memoize the items to prevent unnecessary re-renders
  const memoizedItems = React.useMemo(() => items, [items]);

  // Don't render anything on the server or during hydration
  if (!mounted) {
    return (
      <div className={`space-y-6 ${className}`}>
        {memoizedItems.map((item) => (
          <div key={item.id} className="h-16 bg-sky-100/40 dark:bg-sky-500/5 rounded-xl animate-pulse"></div>
        ))}
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <AnimatePresence initial={false}>
        {memoizedItems.map((item) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{
              opacity: { duration: 0.2 },
              y: { duration: 0.2 }
            }}
            className={cn(
              "space-y-2 transition-all duration-200",
              item.pinned && "p-3 -mx-3 rounded-xl bg-[#fef9c3] dark:bg-amber-500/10 shadow-[0_2px_12px_-2px_rgba(245,158,11,0.12)]"
            )}
          >
            <div className="flex items-center space-x-2">
              <div className="flex items-center">
                <div className="flex items-center">
                  <Checkbox
                    checked={item.completed}
                    onCheckedChange={() => handleToggle(item.id)}
                    className={cn(
                      item.completed
                        ? checkboxColor
                        : 'border-2 border-sky-200 dark:border-sky-800/40 bg-white dark:bg-white/5 hover:bg-sky-50 dark:hover:bg-sky-500/10'
                    )}
                    style={
                      item.completed && item.classColor
                        ? {
                          backgroundColor: item.classColor,
                          // @ts-ignore — custom CSS variable, must be kebab-case
                          '--tw-ring-color': item.classColor,
                          // @ts-ignore
                          '--tw-ring-offset-color': '#fff',
                        }
                        : undefined
                    }
                  />
                </div>
              </div>
              <div className="relative inline-block flex-1 group">
                <div className="flex justify-between items-start w-full">
                  <div className="flex items-center gap-2">
                    {!item.completed && (
                      <div className="flex items-center gap-1">
                        {item.pinned ? (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onPinToggle?.(item.id, false);
                            }}
                            className="cursor-pointer hover:scale-110 transition-transform"
                            title="Click to unpin this homework"
                          >
                            <Star className="w-4 h-4 text-amber-500 fill-amber-400 drop-shadow-[0_0_3px_rgba(245,158,11,0.4)]" />
                          </button>
                        ) : (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onPinToggle?.(item.id, true);
                            }}
                            className="cursor-pointer hover:scale-110 transition-transform"
                            title="Click to pin this homework"
                          >
                            {getPriorityIndicator(item.priority)}
                          </button>
                        )}
                      </div>
                    )}
                    <div className="flex flex-col">
                      <label
                        htmlFor={`checkbox-${item.id}`}
                        onClick={() => handleToggle(item.id)}
                        className={`text-sm font-medium cursor-pointer flex items-center gap-1 ${item.completed ? 'text-sky-900/30 dark:text-sky-400/20' : 'text-sky-900 dark:text-sky-100'
                          }`}
                      >
                        {item.text}
                        {isGoogleClassroomAssignment(item) && (
                          <span title="From Google Classroom" className="ml-1">
                            <School className="inline h-3 w-3 text-sky-400/40 dark:text-sky-500/40" />
                          </span>
                        )}
                      </label>
                      <div className="flex items-center mt-1 text-xs text-sky-600/40 dark:text-sky-400/40 gap-2">
                        {!item.completed && (
                          <>
                            {item.dueDateIcon}
                            <span className="text-xs">
                              {item.subtext instanceof Date ? item.subtext.toLocaleDateString() : item.subtext}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  {!item.completed && item.onDelete && !isGoogleClassroomAssignment(item) && (
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <Link href={`/homework/edit/${item.id}`}>
                        <button
                          className="h-8 w-8 flex items-center justify-center rounded-lg text-sky-400/40 hover:text-sky-500 hover:bg-sky-500/[0.04] transition-colors"
                          title="Edit homework"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                      </Link>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <button
                            className="h-8 w-8 flex items-center justify-center rounded-lg text-sky-400/40 hover:text-red-500 hover:bg-red-500/[0.04] transition-colors"
                            title="Delete homework"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              {item.isRecurringInstance || item.parentRecurringId || item.recurring ? 'Delete recurring homework?' : 'Delete this homework?'}
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              {item.isRecurringInstance || item.parentRecurringId || item.recurring
                                ? `Choose how you'd like to delete "${item.text}".`
                                : `This will permanently delete the homework "${item.text}". This action cannot be undone.`
                              }
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter className={item.isRecurringInstance || item.parentRecurringId || item.recurring ? "sm:flex-col gap-2" : ""}>
                            <div className={cn(
                              "flex flex-col-reverse sm:flex-row gap-2 w-full",
                              (item.isRecurringInstance || item.parentRecurringId || item.recurring) ? "sm:justify-between" : "sm:justify-end"
                            )}>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>

                              {item.isRecurringInstance || item.parentRecurringId || item.recurring ? (
                                <div className="flex flex-col sm:flex-row gap-2">
                                  <AlertDialogAction
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      item.onDelete?.();
                                    }}
                                  >
                                    Delete This One
                                  </AlertDialogAction>
                                  <AlertDialogAction
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      item.onDeleteSeries?.();
                                    }}
                                    className="bg-red-700 hover:bg-red-800 border-red-700 hover:border-red-800"
                                  >
                                    Delete Whole Series
                                  </AlertDialogAction>
                                </div>
                              ) : (
                                <AlertDialogAction
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    item.onDelete?.();
                                  }}
                                >
                                  Delete Homework
                                </AlertDialogAction>
                              )}
                            </div>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  )}
                </div>

              </div>
            </div>
            {/* Links are rendered here, below the main homework item */}
            {item.links && item.links.length > 0 && !item.completed && (
              <div className="flex flex-wrap gap-1.5 ml-8 mt-1.5 transition-opacity duration-200">
                {item.links.map(link => (
                  <LinkCard
                    key={link.id}
                    url={link.url}
                    title={link.title || item.text}
                  />
                ))}
              </div>
            )}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export const PlayfulHomeworkList = memo(PlayfulHomeworkListComponent, (prevProps, nextProps) => {
  return prevProps.items === nextProps.items &&
    prevProps.onItemToggle === nextProps.onItemToggle &&
    prevProps.onPinToggle === nextProps.onPinToggle &&
    prevProps.className === nextProps.className;
});

PlayfulHomeworkList.displayName = 'PlayfulHomeworkList';