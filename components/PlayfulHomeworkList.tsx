import * as React from 'react';
import { createPortal } from 'react-dom';
import { memo, useCallback, useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { HugeIcon } from '@/lib/huge-icon-map';
import { cn } from '@/lib/utils';
import { LinkCard } from './LinkCard';
import { Checkbox } from './animate-ui/components/radix/checkbox';
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
import confetti from 'canvas-confetti';

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
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            className="w-3 h-3 text-red-500 dark:text-red-400"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinejoin="round"
          >
            <path d="M12 22C16.4183 22 20 18.4183 20 14C20 8 12 2 12 2C11.6117 4.48692 11.2315 5.82158 10 8C8.79908 7.4449 8.5 7 8 5.75C6 8 4 11 4 14C4 18.4183 7.58172 22 12 22Z" />
            <path d="M12 18C13.6569 18 15 16.6569 15 15C15 13.5 13.5 12 12 11C10.5 12 9 13.5 9 15C9 16.6569 10.3431 18 12 18Z" />
          </svg>
        </span>
      );
    case 'medium':
      return (
        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-orange-100 dark:bg-orange-500/12">
          <HugeIcon name="AlertCircle" size={12} className="w-3 h-3 text-orange-500 dark:text-orange-400" />
        </span>
      );
    case 'low':
    default:
      return (
        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-green-100 dark:bg-green-500/10">
          <HugeIcon name="MinusSignCircle" size={12} className="w-3 h-3 text-green-500/60 dark:text-green-400/50" />
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
  onBulkDelete?: (ids: string[]) => void;
  onBulkMove?: (ids: string[], classId: string) => void;
  availableClasses?: Array<{ id: string; name: string; icon: string; color: string; bgColor: string }>;
  isSelectionMode?: boolean;
  className?: string;
  checkboxColor?: string;
};

export interface PlayfulHomeworkListRef {
  clearSelection: () => void;
}

export const PlayfulHomeworkList = forwardRef<PlayfulHomeworkListRef, PlayfulHomeworkListProps>(({
  items,
  onItemToggle,
  onPinToggle,
  onBulkDelete,
  onBulkMove,
  availableClasses = [],
  isSelectionMode = false,
  className,
  checkboxColor,
}, ref) => {
  const [confettiItems, setConfettiItems] = React.useState<Set<string>>(new Set());
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [draggedItems, setDraggedItems] = useState<Set<string>>(new Set());

  // Handle item selection
  const handleItemSelect = useCallback((id: string, selected: boolean) => {
    setSelectedItems(prev => {
      const newSet = new Set(prev);
      if (selected) {
        newSet.add(id);
      } else {
        newSet.delete(id);
      }
      return newSet;
    });
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedItems(new Set());
  }, []);

  // Expose clearSelection function to parent via ref
  useImperativeHandle(ref, () => ({
    clearSelection
  }), [clearSelection]);

  // Trigger confetti when items become completed
  React.useEffect(() => {
    confettiItems.forEach(itemId => {
      const item = items.find(i => i.id === itemId);
      if (item?.completed && item.classColor) {
        // Generate color variations for more interesting confetti
        const generateColorVariations = (baseColor: string) => {
          const fallbackColors = [baseColor || '#818cf8', '#a5b4fc', '#6366f1', '#4f46e5'];
          if (!baseColor || typeof baseColor !== 'string') return fallbackColors;

          // Convert hex to RGB safely
          let hex = baseColor.replace('#', '').trim();
          if (hex.length === 3) {
            hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
          } else if (hex.length < 6) {
            hex = hex.padEnd(6, '0');
          }

          const r = parseInt(hex.substring(0, 2), 16);
          const g = parseInt(hex.substring(2, 4), 16);
          const b = parseInt(hex.substring(4, 6), 16);

          if (isNaN(r) || isNaN(g) || isNaN(b)) {
            return fallbackColors;
          }

          const rgbToHex = (red: number, green: number, blue: number) => {
            const clamp = (val: number) => Math.max(0, Math.min(255, Math.round(val)));
            const rHex = clamp(red).toString(16).padStart(2, '0');
            const gHex = clamp(green).toString(16).padStart(2, '0');
            const bHex = clamp(blue).toString(16).padStart(2, '0');
            return `#${rHex}${gHex}${bHex}`;
          };

          // Generate variations (shades of the class color) as hex strings
          return [
            baseColor,
            rgbToHex(r + 30, g + 30, b + 30), // Lighter shade
            rgbToHex(r + 50, g + 50, b + 50), // Even lighter shade
            rgbToHex(r - 35, g - 35, b - 35), // Darker shade
            rgbToHex(r - 60, g - 60, b - 60), // Even darker shade
          ];
        };

        const colorVariations = generateColorVariations(item.classColor);

        // Fun confetti burst with class color variations!
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 },
          colors: colorVariations, // Use color variations for more visual interest
        });
      } else if (item?.completed) {
        // Fallback confetti for items without class color
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });
      }
    });
    // Clean up confetti items after triggering
    if (confettiItems.size > 0) {
      setConfettiItems(new Set());
    }
  }, [confettiItems, items]); // Add items to dependencies

  // Memoize the items to prevent unnecessary re-renders
  const memoizedItems = React.useMemo(() => items, [items]);

  const handleToggle = useCallback((id: string) => {
    const item = items.find(i => i.id === id);
    if (item && !item.completed) {
      // Mark for confetti if item is becoming completed
      setConfettiItems(prev => new Set(prev).add(id));
    }
    onItemToggle(id);
  }, [onItemToggle]);

  const handleItemClick = useCallback((id: string) => {
    if (isSelectionMode) {
      // In selection mode, toggle selection
      handleItemSelect(id, !selectedItems.has(id));
    } else {
      // Normal mode, toggle completion
      handleToggle(id);
    }
  }, [isSelectionMode, selectedItems, handleItemSelect, handleToggle]);

  const handleBulkMoveToClass = useCallback((classId: string) => {
    onBulkMove?.(Array.from(selectedItems), classId);
    setSelectedItems(new Set());
  }, [selectedItems, onBulkMove]);

  const handleBulkDeleteSelected = useCallback(() => {
    onBulkDelete?.(Array.from(selectedItems));
    setSelectedItems(new Set());
  }, [selectedItems, onBulkDelete]);

  const handlePinToggle = useCallback((id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const item = items.find(item => item.id === id);
    if (item) {
      onPinToggle?.(id, !item.pinned); // Use actual pinned state
    }
  }, [onPinToggle, items]);

  const FloatingToolbar = () => {
    const [showMoveModal, setShowMoveModal] = useState(false);
    
    if (selectedItems.size === 0 || typeof document === 'undefined') return null;

    const toolbar = (
      <>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="fixed bottom-10 left-1/2 transform -translate-x-1/2 z-[999]"
        >
          <div className="flex items-center gap-2 p-3 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-sky-200 dark:border-sky-500/20 rounded-2xl shadow-2xl">
            <span className="text-sm font-semibold text-sky-900 dark:text-sky-100 px-2">
              {selectedItems.size} <span className="opacity-50">selected</span>
            </span>

            <div className="w-px h-6 bg-sky-200 dark:bg-sky-500/20 mx-1" />

            {/* Move Button */}
            <button
              onClick={() => setShowMoveModal(true)}
              className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold bg-sky-500/10 text-sky-700 dark:text-sky-300 rounded-xl hover:bg-sky-500/20 transition-all border border-sky-500/20"
            >
              <HugeIcon name="Folder02" size={14} className="h-3.5 w-3.5" />
              Move
            </button>

            {/* Delete Button */}
            <button
              onClick={() => onBulkDelete?.(Array.from(selectedItems))}
              className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold bg-red-500/10 text-red-600 dark:text-red-400 rounded-xl hover:bg-red-500/20 transition-all border border-red-500/20"
            >
              <HugeIcon name="Delete02" size={14} className="h-3.5 w-3.5" />
              Delete
            </button>

            {/* Clear Selection */}
            <button
              onClick={clearSelection}
              className="flex items-center justify-center w-10 h-10 text-sky-900/40 dark:text-sky-100/40 hover:text-sky-900 dark:hover:text-sky-100 hover:bg-sky-500/5 rounded-xl transition-all"
            >
              <HugeIcon name="Cancel01" size={18} className="h-4.5 w-4.5" />
            </button>
          </div>
        </motion.div>

        {/* Move Modal - Client only */}
        {typeof window !== 'undefined' && (
          <AlertDialog open={showMoveModal} onOpenChange={setShowMoveModal}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Move {selectedItems.size} homework item{selectedItems.size > 1 ? 's' : ''}</AlertDialogTitle>
                <AlertDialogDescription>
                  Select the class you want to move the selected homework items to.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <div className="grid grid-cols-3 gap-3 my-4">
                {availableClasses.map((cls) => {
                  return (
                    <button
                      key={cls.id}
                      onClick={() => {
                        onBulkMove?.(Array.from(selectedItems), cls.id);
                        setShowMoveModal(false);
                        clearSelection();
                      }}
                      className="text-left p-3 rounded-xl border border-sky-200 dark:border-sky-500/20 hover:bg-sky-50 dark:hover:bg-sky-500/10 transition-colors flex flex-col items-center gap-2"
                    >
                      <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: `${cls.bgColor}40`, color: cls.color }}>
                        <HugeIcon name={cls.icon as any} size={20} className="h-5 w-5" />
                      </div>
                      <div className="text-center">
                        <div className="font-medium text-sky-900 dark:text-sky-100 text-xs">{cls.name}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </>
    );

    return createPortal(toolbar, document.body);
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <AnimatePresence initial={false}>
        {memoizedItems.map((item, index) => (
          <motion.div
            key={item.id || `item-${index}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className={cn(
              "group relative transition-all duration-300 overflow-hidden",
              isSelectionMode 
                ? "bg-white/60 dark:bg-gray-900/40 backdrop-blur-md rounded-xl border border-sky-100 dark:border-sky-500/10 shadow-sm hover:shadow-lg hover:shadow-sky-500/5 p-4"
                : "",
              selectedItems.has(item.id) && "ring-2 ring-blue-500 ring-offset-2 ring-offset-white dark:ring-offset-gray-900"
            )}
          >
            <div className="flex items-center space-x-2">
              {!isSelectionMode && (
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
              )}
              {isSelectionMode && (
                <div className="flex-shrink-0">
                  <Checkbox
                    checked={selectedItems.has(item.id)}
                    onCheckedChange={(checked) => handleItemSelect(item.id, checked as boolean)}
                    className={cn(
                      "w-5 h-5 border-2 transition-all duration-200 rounded-lg",
                      selectedItems.has(item.id)
                        ? "border-[#d4e88e] bg-[#d4e88e] text-sky-900"
                        : "border-sky-200 dark:border-sky-800/40 bg-white dark:bg-white/5",
                    )}
                  />
                </div>
              )}
              <div className="relative inline-block flex-1 group">
                <div className="flex justify-between items-start w-full">
                  <div className="flex items-center gap-2">
                    {/* Selection Checkbox - removed from here as it's now conditionally at the left */}

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
                            <HugeIcon name="Star" size={16} className="w-4 h-4 text-amber-500 fill-amber-400 drop-shadow-[0_0_3px_rgba(245,158,11,0.4)]" />
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
                        onClick={(e) => {
                          e.stopPropagation();
                          if (isSelectionMode) {
                            // In selection mode, toggle selection
                            handleItemSelect(item.id, !selectedItems.has(item.id));
                          } else {
                            // Normal mode, toggle completion
                            handleToggle(item.id);
                          }
                        }}
                        className={`text-sm font-medium cursor-pointer flex items-center gap-1 ${item.completed ? 'text-sky-900/30 dark:text-sky-400/50' : 'text-sky-900 dark:text-sky-100'
                          }`}
                      >
                        {item.text}
                        {isGoogleClassroomAssignment(item) && (
                          <span title="From Google Classroom" className="ml-1">
                            <HugeIcon name="School01" size={12} className="inline h-3 w-3 text-sky-400/40 dark:text-sky-500/40" />
                          </span>
                        )}
                        {(item.isRecurringInstance || item.parentRecurringId || item.recurring) && (
                          <span title="Recurring Homework" className="ml-1.5 inline-flex items-center justify-center px-1 rounded bg-indigo-100 dark:bg-indigo-500/20 text-indigo-500 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/30">
                            <HugeIcon name="Repeat" size={12} className="h-3 w-3" />
                          </span>
                        )}
                      </label>
                      <div className="flex items-center mt-1 text-xs font-medium text-sky-400 dark:text-sky-500 gap-1">
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
                          className="h-8 w-8 flex items-center justify-center rounded-lg text-sky-400/40 hover:text-sky-500 hover:bg-sky-500/4 transition-colors"
                          title="Edit homework"
                        >
                          <HugeIcon name="Pen02" size={16} className="h-4 w-4" />
                        </button>
                      </Link>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <button
                            className="h-8 w-8 flex items-center justify-center rounded-lg text-sky-400/40 hover:text-red-500 hover:bg-red-500/4 transition-colors"
                            title="Delete homework"
                          >
                            <HugeIcon name="Delete02" size={16} className="h-4 w-4" />
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
                {item.links.map((link, index) => (
                  <LinkCard
                    key={link.id || `link-${index}`}
                    url={link.url}
                    title={link.title || item.text}
                  />
                ))}
              </div>
            )}
          </motion.div>
        ))}
      </AnimatePresence>
      <FloatingToolbar />
    </div>
  );
});

PlayfulHomeworkList.displayName = 'PlayfulHomeworkList';