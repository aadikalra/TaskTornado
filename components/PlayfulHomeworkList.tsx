import * as React from 'react';
import { memo, useCallback } from 'react';
import { motion, type Transition } from 'framer-motion';
import Link from 'next/link';
import { Check, Trash2, Edit, Link as LinkIcon, School, Flame, AlertTriangle, Minus, Star } from 'lucide-react';
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
import { Button } from "@/components/ui/button";

import { RecurringHomeworkIndicator } from './RecurringHomeworkIndicator';
import { LinkCard } from './LinkCard';
import { Checkbox } from './animate-ui/radix/checkbox';

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
        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-red-100 dark:bg-red-900">
          <Flame className="w-3 h-3 text-red-600 dark:text-red-400" />
        </span>
      );
    case 'medium':
      return (
        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-yellow-100 dark:bg-yellow-900">
          <AlertTriangle className="w-3 h-3 text-yellow-600 dark:text-yellow-400" />
        </span>
      );
    case 'low':
    default:
      return (
        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-green-100 dark:bg-green-900">
          <Minus className="w-3 h-3 text-green-600 dark:text-green-400" />
        </span>
      );
  }
};

const getPriorityColor = (priority: 'high' | 'medium' | 'low') => {
  switch (priority) {
    case 'high':
      return 'text-red-500';
    case 'medium':
      return 'text-yellow-500';
    case 'low':
    default:
      return 'text-green-500';
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
};

const getPathAnimate = (isChecked: boolean) => ({
  pathLength: isChecked ? 1 : 0,
  opacity: isChecked ? 1 : 0,
});

const getPathTransition = (isChecked: boolean): Transition => ({
  pathLength: { duration: 1, ease: 'easeInOut' },
  opacity: {
    duration: 0.01,
    delay: isChecked ? 0 : 1,
  },
});

const PlayfulHomeworkListComponent = ({
  items,
  onItemToggle,
  onPinToggle,
  className = '',
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
          colors: item.classColor ? [item.classColor] : ['#10B981', '#3B82F6', '#F59E0B'],
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
          <div key={item.id} className="h-16 bg-gray-100 dark:bg-gray-700 rounded-lg animate-pulse"></div>
        ))}
      </div>
    );
  }

  // Print current class color
  // if (items.length > 0) {
  //   console.log(`For class ${items[0].className}, icon is ${items[0].classIcon}`)
  // }

  return (
    <div className={`space-y-6 ${className}`}>
      {memoizedItems.map((item) => (
        <motion.div
          key={item.id}
          layout
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{
            layout: { type: "spring", stiffness: 300, damping: 30 },
            opacity: { duration: 0.2 },
            y: { duration: 0.2 }
          }}
          className="space-y-2"
        >
          <div className="flex items-center space-x-2">
            <div className="flex items-center">
              <div className="flex items-center">
                <Checkbox
                  checked={item.completed}
                  onCheckedChange={() => handleToggle(item.id)}
                  className={`
    ${item.completed
                      ? 'border-transparent bg-teal-500 hover:bg-teal-600'
                      : 'border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }
  `}
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
                          <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
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
                      className={`text-sm font-medium cursor-pointer flex items-center gap-1 ${item.completed ? 'text-gray-500' : 'text-gray-900 dark:text-white'
                        }`}
                    >
                      {item.text}
                      {isGoogleClassroomAssignment(item) && (
                        <span title="From Google Classroom" className="ml-1">
                          <School className="inline h-3 w-3 text-gray-400 dark:text-gray-500" />
                        </span>
                      )}
                    </label>
                    <div className="flex items-center mt-1 text-xs text-gray-500 dark:text-gray-400 gap-2">
                      {!item.completed && (
                        <>
                          {item.dueDateIcon}
                          <p>
                            {item.subtext instanceof Date ? item.subtext.toLocaleDateString() : item.subtext}
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                {!item.completed && item.onDelete && !isGoogleClassroomAssignment(item) && (
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <Link href={`/homework/edit/${item.id}`}>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-gray-400 hover:text-blue-500 dark:text-gray-500 dark:hover:text-blue-400"
                        title="Edit homework"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </Link>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-gray-400 hover:text-red-500 dark:text-gray-500 dark:hover:text-red-400"
                          title="Delete homework"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                        <AlertDialogHeader>
                          <AlertDialogTitle className="text-gray-900 dark:text-gray-100">
                            {item.isRecurringInstance || item.parentRecurringId || item.recurring ? 'Delete recurring homework?' : 'Delete this homework?'}
                          </AlertDialogTitle>
                          <AlertDialogDescription className="text-gray-600 dark:text-gray-400">
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
                            <AlertDialogCancel className="text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700">Cancel</AlertDialogCancel>

                            {item.isRecurringInstance || item.parentRecurringId || item.recurring ? (
                              <div className="flex flex-col sm:flex-row gap-2">
                                <AlertDialogAction
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    item.onDelete?.();
                                  }}
                                  className="bg-red-500 hover:bg-red-600 text-white"
                                >
                                  Delete This One
                                </AlertDialogAction>
                                <AlertDialogAction
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    item.onDeleteSeries?.();
                                  }}
                                  className="bg-red-700 hover:bg-red-800 text-white"
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
                                className="bg-red-600 hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700 focus:ring-red-600"
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
              <motion.svg
                width="100%"
                height="32"
                viewBox="0 0 300 32"
                className="absolute left-0 top-1/2 -translate-y-1/2 pointer-events-none z-20 w-full overflow-visible"
                preserveAspectRatio="none"
              >
                <motion.path
                  d="M 10 16 s 79.8 -11.36 98.1 -11.34 c 22.2 0.02 -47.82 14.25 -33.39 22.02 c 12.61 6.77 124.18 -27.98 133.31 -17.28 c 7.52 8.38 -26.8 20.02 4.61 22.05 c 24.55 1.93 42.37 -20.36 86.37 -20.36"
                  vectorEffect="non-scaling-stroke"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                  initial={false}
                  animate={getPathAnimate(item.completed)}
                  transition={getPathTransition(item.completed)}
                  className="stroke-blue-500"
                  style={{
                    stroke: item.classColor
                  }}
                />
              </motion.svg>
            </div>
          </div>
          {/* Links are rendered here, below the main homework item */}
          {item.links && item.links.length > 0 && !item.completed && (
            <div className={`space-y-1.5 ml-8 transition-opacity duration-200`}>
              {item.links.map(link => (
                <div key={link.id} className="text-xs">
                  <LinkCard
                    url={link.url}
                    title={link.title || item.text}
                  />
                </div>
              ))}
            </div>
          )}
        </motion.div>
      ))}
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