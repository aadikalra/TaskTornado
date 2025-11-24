'use client';

import React, {
  useState,
  useMemo,
  useCallback,
  useEffect,
  useRef,
  memo,
} from 'react';
import { PinList } from './animate-ui/components/pin-list';
import {
  BookOpen,
  Pin,
  PinOff,
  AlertCircle,
  AlertTriangle,
  Clock,
  CheckCircle2,
  X,
  Plus,
} from 'lucide-react';
import { useClassContext, type Homework } from '@/context/ClassContext';
import { format, differenceInCalendarDays } from 'date-fns';
import { iconMap } from '@/lib/icon-map';

// ------------------------------------
// Color mapping for class icons
// ------------------------------------
const classColors = {
  red: '#E53E3E',
  blue: '#3182CE',
  yellow: '#D69E2E',
  green: '#38A169',
  purple: '#805AD5',
  pink: '#D53F8C',
  teal: '#264f84',
  gray: '#4A5568',
};

const getClassColor = (index: number) => {
  const colors = Object.values(classColors);
  return colors[index % colors.length];
};

// ------------------------------------
// Stable ID mapper (string ⇄ number) without global state
// ------------------------------------
function useIdMapper(sourceIds: string[]) {
  const mapRef = useRef<Map<string, number>>(new Map());
  const reverseRef = useRef<Map<number, string>>(new Map());
  const nextRef = useRef<number>(1);

  // Update maps synchronously during render to ensure IDs are available immediately
  useMemo(() => {
    const map = mapRef.current;
    const reverse = reverseRef.current;

    // Add new ids
    for (const sid of sourceIds) {
      if (!map.has(sid)) {
        const nid = nextRef.current++;
        map.set(sid, nid);
        reverse.set(nid, sid);
      }
    }
    // Prune removed ids
    const keep = new Set(sourceIds);
    for (const [sid, nid] of map.entries()) {
      if (!keep.has(sid)) {
        map.delete(sid);
        reverse.delete(nid);
      }
    }
  }, [sourceIds]);

  const getNumericId = useCallback((sid: string) => mapRef.current.get(sid)!, []);
  const getStringId = useCallback((nid: number) => reverseRef.current.get(nid), []);

  return { getNumericId, getStringId };
}

// ------------------------------------
// Types for PinList items (adjust if your PinList expects different props)
// ------------------------------------
type PinListItem = {
  id: number;
  name: string;
  info: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  pinned: boolean;
  className?: string;
  urgencyIndicator: React.ReactNode;
  classColor: string;
  renderPinButton?: (args: { pinned: boolean; onClick: () => void }) => React.ReactNode;
};

// ------------------------------------
// Main component
// ------------------------------------
export const HomeworkPinList: React.FC<{
  triggerSelectModal?: boolean;
  onTriggerComplete?: () => void;
}> = ({
  triggerSelectModal = false,
  onTriggerComplete,
}) => {
    const { homeworks, classes, togglePinHomework } = useClassContext();

    // Modal state
    const [showSelectModal, setShowSelectModal] = useState(false);

    useEffect(() => {
      if (triggerSelectModal) {
        setShowSelectModal(true);
        // Reset the parent's trigger state after opening the modal
        onTriggerComplete?.();
      }
    }, [triggerSelectModal, onTriggerComplete]);

    // Build mapping from string id -> numeric id for only non-completed homework
    const activeHomeworkIds = useMemo(
      () => homeworks.filter((h) => !h.completed).map((h) => h.id),
      [homeworks]
    );
    const { getNumericId, getStringId } = useIdMapper(activeHomeworkIds);

    // Urgency helpers
    const getUrgency = useCallback((dueDate: Date) => {
      const days = differenceInCalendarDays(dueDate, new Date());
      const isOverdue = days < 0;
      const isDueToday = days === 0;
      const isApproaching = days === 1 || days === 2;

      let icon: React.ReactNode;
      let sortBucket: number;
      if (isOverdue) {
        icon = <AlertCircle className="w-3 h-3 text-red-500" />;
        sortBucket = 0;
      } else if (isDueToday) {
        icon = <AlertTriangle className="w-3 h-3 text-orange-500" />;
        sortBucket = 1;
      } else if (isApproaching) {
        icon = <Clock className="w-3 h-3 text-yellow-500" />;
        sortBucket = 2;
      } else {
        icon = <CheckCircle2 className="w-3 h-3 text-green-500" />;
        sortBucket = 3;
      }

      return { days, icon, sortBucket };
    }, []);

    // Format items for PinList
    const homeworkItems: PinListItem[] = useMemo(() => {
      return homeworks
        .filter((h: Homework) => !h.completed)
        .map((homework: Homework) => {
          const dueDate = new Date(homework.dueDate);
          const { icon: urgencyIcon } = getUrgency(dueDate);

          const classItem = classes.find((c) => c.id === homework.classId);
          const classIndex = classes.findIndex((c) => c.id === homework.classId);
          const classColor = getClassColor(Math.max(0, classIndex));

          const Icon =
            (classItem?.icon &&
              (iconMap[classItem.icon as keyof typeof iconMap] as React.ComponentType<
                React.SVGProps<SVGSVGElement>
              >)) ||
            BookOpen;

          const formattedDueDate = format(dueDate, 'MMM d, yyyy');
          const numericId = getNumericId(homework.id);

          return {
            id: numericId,
            name: homework.title,
            info: formattedDueDate,
            icon: Icon,
            pinned: Boolean(homework.pinned),
            className: homework.completed
              ? 'opacity-70'
              : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800',
            urgencyIndicator: urgencyIcon,
            classColor,
            renderPinButton: ({ pinned, onClick }) => (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onClick();
                }}
                className={`p-1.5 rounded-full transition-colors ${pinned
                  ? 'text-yellow-500 hover:bg-yellow-50 dark:hover:bg-yellow-900/30'
                  : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:text-gray-500 dark:hover:text-gray-300 dark:hover:bg-gray-700/50'
                  }`}
                aria-label={pinned ? 'Unpin' : 'Pin'}
              >
                {pinned ? <Pin className="w-4 h-4 fill-current" /> : <PinOff className="w-4 h-4" />}
              </button>
            ),
          } as PinListItem;
        });
    }, [homeworks, classes, getUrgency, getNumericId]);

    // Sort by urgency bucket then by due date asc
    const sortedItems = useMemo(() => {
      // Build a map of id -> (sortBucket, dueDate) for performance
      const meta = new Map<
        number,
        { sortBucket: number; dueDate: number; pinned: boolean }
      >();

      for (const hw of homeworks.filter((h) => !h.completed)) {
        const due = new Date(hw.dueDate);
        const { sortBucket } = getUrgency(due);
        meta.set(getNumericId(hw.id), {
          sortBucket,
          dueDate: due.getTime(),
          pinned: Boolean(hw.pinned),
        });
      }

      return [...homeworkItems].sort((a, b) => {
        const ma = meta.get(a.id)!;
        const mb = meta.get(b.id)!;
        // Keep pinned grouping separated; within each group, sort by urgency then date
        if (ma.pinned !== mb.pinned) return ma.pinned ? -1 : 1;
        if (ma.sortBucket !== mb.sortBucket) return ma.sortBucket - mb.sortBucket;
        return ma.dueDate - mb.dueDate;
      });
    }, [homeworkItems, homeworks, getUrgency, getNumericId]);

    const pinnedItems = useMemo(
      () => sortedItems.filter((item) => item.pinned),
      [sortedItems]
    );
    const unpinnedItems = useMemo(
      () => sortedItems.filter((item) => !item.pinned),
      [sortedItems]
    );

    // Handlers
    const openSelectModal = useCallback(() => setShowSelectModal(true), []);
    const closeSelectModal = useCallback(() => setShowSelectModal(false), []);

    const handlePinSelectedHomework = useCallback(
      (stringId: string) => {
        togglePinHomework(stringId, true);
        closeSelectModal();
      },
      [togglePinHomework, closeSelectModal]
    );

    const handlePinToggle = useCallback(
      (item: { id: number; pinned: boolean }) => {
        const stringId = getStringId(item.id);
        if (!stringId) return;
        togglePinHomework(stringId, !item.pinned);
      },
      [getStringId, togglePinHomework]
    );

    // Modal focus/esc handling
    const modalRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
      if (!showSelectModal) return;
      const prevFocused = document.activeElement as HTMLElement | null;

      const focusFirst = () => {
        const el = modalRef.current;
        if (!el) return;
        const focusable = el.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        (focusable[0] || el).focus();
      };

      const onKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          e.preventDefault();
          closeSelectModal();
        }
        if (e.key === 'Tab' && modalRef.current) {
          const focusable = modalRef.current.querySelectorAll<HTMLElement>(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
          );
          if (focusable.length === 0) return;
          const first = focusable[0];
          const last = focusable[focusable.length - 1];

          if (e.shiftKey && document.activeElement === first) {
            e.preventDefault();
            last.focus();
          } else if (!e.shiftKey && document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      };

      focusFirst();
      document.addEventListener('keydown', onKeyDown);
      return () => {
        document.removeEventListener('keydown', onKeyDown);
        prevFocused?.focus();
      };
    }, [showSelectModal, closeSelectModal]);

    return (
      <div className="space-y-4">
        {pinnedItems.length > 0 ? (
          <div className="space-y-3">
            <PinList items={pinnedItems} onPinToggle={handlePinToggle} />
          </div>
        ) : (
          // Empty state
          <div className="bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-lg p-8 min-h-[160px] flex flex-col items-center justify-center relative">
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-50 dark:bg-gray-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <Pin className="w-8 h-8 text-[#264f84] dark:text-blue-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No Pinned Homework
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-sm mx-auto">
                Pin important homework assignments to keep them at the top of your dashboard
              </p>
              <button
                onClick={openSelectModal}
                className="inline-flex items-center border border-[#264f84] text-[#264f84] hover:bg-[#264f84] hover:text-white rounded-lg h-10 px-5 text-sm font-medium transition-all duration-200 dark:border-blue-400 dark:text-blue-400 dark:hover:bg-blue-400 dark:hover:text-white"
              >
                <Plus className="mr-2 h-4 w-4" />
                Select Homework to Pin
              </button>
            </div>
          </div>
        )}

        {/* Select Homework Modal */}
        {showSelectModal && (
          <div
            className="fixed inset-0 bg-black/30 dark:bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-100"
            onMouseDown={(e) => {
              // close when clicking on backdrop only
              if (e.target === e.currentTarget) closeSelectModal();
            }}
          >
            <div
              ref={modalRef}
              className="rounded-lg shadow-lg w-full max-w-2xl max-h-[80vh] overflow-hidden outline-none bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800"
              role="dialog"
              aria-modal="true"
              aria-labelledby="select-homework-title"
              tabIndex={-1}
            >
              <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-800">
                <h2
                  id="select-homework-title"
                  className="text-lg font-medium text-gray-900 dark:text-white"
                >
                  Select Homework to Pin
                </h2>
                <button
                  onClick={closeSelectModal}
                  className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 rounded-full p-1.5"
                  aria-label="Close"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 max-h-96 overflow-y-auto">
                {unpinnedItems.length > 0 ? (
                  <div className="space-y-3">
                    {unpinnedItems.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-800 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900 cursor-pointer transition-colors"
                        onClick={() => {
                          const stringId = getStringId(item.id);
                          if (stringId) handlePinSelectedHomework(stringId);
                        }}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gray-50 dark:bg-gray-900 rounded-lg flex items-center justify-center">
                            <item.icon
                              className="w-5 h-5"
                              style={{ color: item.classColor || '#264f84' }}
                              aria-hidden="true"
                            />
                          </div>
                          <div>
                            <h3 className="font-medium text-gray-900 dark:text-white">
                              {item.name}
                            </h3>
                            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                              {item.urgencyIndicator}
                              <span>{item.info}</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-gray-400 dark:text-gray-500">
                          <button
                            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-[#264f84] dark:hover:text-blue-400 transition-all"
                            onClick={(e) => {
                              e.stopPropagation();
                              const stringId = getStringId(item.id);
                              if (stringId) handlePinSelectedHomework(stringId);
                            }}
                            aria-label="Pin this homework"
                          >
                            <Pin className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <p>No unpinned homework available to select.</p>
                    <p className="text-sm mt-2">
                      Complete some homework or add new assignments first.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };