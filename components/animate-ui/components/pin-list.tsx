'use client';

import * as React from 'react';
import { Pin, PinOff, List, Star } from 'lucide-react';
import {
  motion,
  LayoutGroup,
  AnimatePresence,
  type HTMLMotionProps,
  type Transition,
} from 'motion/react';
import { cn } from '@/lib/utils';

// We'll update this type definition to be cleaner and more accurate
type PinListItem = {
  id: number;
  name: string;
  info: string;
  icon: React.ElementType;
  pinned: boolean;
  className?: string;
  urgencyIndicator?: React.ReactNode;
  // This prop is for the PinList component itself, not a separate render function.
  // It's cleaner to let the PinList handle the button rendering based on `pinned`.
};

type PinListProps = {
  items: PinListItem[];
  onPinToggle: (item: { id: number; pinned: boolean }) => void; // Add this prop
  labels?: {
    pinned?: string;
    unpinned?: string;
  };
  transition?: Transition;
  labelMotionProps?: HTMLMotionProps<'p'>;
  className?: string;
  labelClassName?: string;
  pinnedSectionClassName?: string;
  unpinnedSectionClassName?: string;
  zIndexResetDelay?: number;
} & HTMLMotionProps<'div'>;

function PinList({
  items,
  onPinToggle, // Destructure the new prop
  labels = { pinned: 'Pinned', unpinned: 'Unpinned' },
  transition = { stiffness: 320, damping: 20, mass: 0.8, type: 'spring' },
  labelMotionProps = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.22, ease: 'easeInOut' },
  },
  className,
  labelClassName,
  pinnedSectionClassName,
  unpinnedSectionClassName,
  zIndexResetDelay = 500,
  ...props
}: PinListProps) {
  // We no longer need local state here.
  // The component will just use the `items` prop.
  // const [listItems, setListItems] = React.useState(items);
  const [togglingId, setTogglingId] = React.useState<number | null>(null);

  const pinned = items.filter((u) => u.pinned);
  const unpinned = items.filter((u) => !u.pinned);

  // This function now calls the parent's handler
  const handleToggle = (id: number) => {
    const item = items.find((u) => u.id === id);
    if (!item) return;

    setTogglingId(item.id);
    onPinToggle({ id: item.id, pinned: item.pinned });

    // Reset the z-index to avoid stacking issues with other elements
    // once the animation is complete.
    setTimeout(() => setTogglingId(null), zIndexResetDelay);
  };

  // Function to get background color based on item properties
  const getItemBackground = (item: PinListItem) => {
    if (item.className?.includes('bg-')) {
      return ''; // Use custom background if specified
    }

    // Use consistent white background
    return 'bg-white dark:bg-gray-800';
  };

  return (
    <motion.div className={cn('space-y-6', className)} {...props}>
      <LayoutGroup>
        <div className="space-y-4">
          <AnimatePresence>
            {pinned.length > 0 && (
              <motion.h2
                className="text-lg font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2"
                {...labelMotionProps}
              >
                <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                <Pin className="w-4 h-4 text-yellow-500" />
                {labels.pinned}
              </motion.h2>
            )}
          </AnimatePresence>
          {pinned.length > 0 && (
            <div className={cn('grid gap-3', pinnedSectionClassName)}>
              {pinned.map((item) => (
                <motion.div
                  key={item.id}
                  layoutId={`item-${item.id}`}
                  transition={transition}
                  className={cn(
                    'flex items-center justify-between gap-5 rounded-2xl p-3 transition-all duration-200',
                    'border border-opacity-30 dark:border-opacity-20',
                    'shadow-sm hover:shadow-md dark:shadow-neutral-900/50',
                    getItemBackground(item),
                    item.className,
                    togglingId === item.id ? 'z-20 scale-[1.02]' : 'z-10',
                  )}
                >
                  <div className="flex items-center gap-2">
                    <div className="rounded-lg bg-background p-2">
                      <item.icon
                        className="size-5"
                        style={{ color: (item as any).classColor || undefined }}
                      />
                    </div>
                    <div>
                      <div className="text-sm font-semibold flex items-center gap-1">
                        <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                        {item.name}
                      </div>
                      <div className="text-xs text-neutral-500 dark:text-neutral-400 font-medium flex items-center gap-1">
                        {item.urgencyIndicator}
                        {item.info}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggle(item.id);
                      }}
                      className={cn(
                        'p-1.5 rounded-full transition-all',
                        'hover:scale-110 active:scale-95',
                        'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-opacity-50',
                        item.pinned
                          ? 'text-yellow-500 hover:bg-yellow-50 dark:hover:bg-yellow-900/30 focus:ring-yellow-200 dark:focus:ring-yellow-800'
                          : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:text-gray-500 dark:hover:text-gray-300 dark:hover:bg-gray-700/50 focus:ring-gray-200 dark:focus:ring-gray-700',
                      )}
                      aria-label={item.pinned ? 'Unpin' : 'Pin'}
                    >
                      <AnimatePresence mode="wait">
                        {item.pinned ? (
                          <motion.div
                            key="pin-on"
                            initial={{ scale: 0.8, rotate: -45 }}
                            animate={{ scale: 1, rotate: 0 }}
                            exit={{ scale: 0.8, rotate: -45 }}
                            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                            className="flex items-center justify-center"
                          >
                            <Pin className="w-4 h-4 fill-current" />
                          </motion.div>
                        ) : (
                          <motion.div
                            key="pin-off"
                            initial={{ scale: 0.8, rotate: 0 }}
                            animate={{ scale: 1, rotate: 0 }}
                            exit={{ scale: 0.8, rotate: 90 }}
                            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                            className="flex items-center justify-center"
                          >
                            <PinOff className="w-4 h-4" />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-4">
          <AnimatePresence>
            {unpinned.length > 0 && (
              <motion.h2
                className="text-lg font-semibold text-gray-800 dark:text-gray-200 mt-6 mb-3 flex items-center gap-2"
                {...labelMotionProps}
              >
                <List className="w-4 h-4 text-gray-500" />
                {labels.unpinned}
              </motion.h2>
            )}
          </AnimatePresence>
          {unpinned.length > 0 && (
            <div className={cn('grid gap-3', unpinnedSectionClassName)}>
              {unpinned.map((item) => (
                <motion.div
                  key={item.id}
                  layoutId={`item-${item.id}`}
                  transition={transition}
                  className={cn(
                    'flex items-center justify-between gap-5 rounded-2xl p-3 transition-all duration-200',
                    'border border-opacity-30 dark:border-opacity-20',
                    'shadow-sm hover:shadow-md dark:shadow-neutral-900/50',
                    getItemBackground(item),
                    item.className,
                    togglingId === item.id ? 'z-20 scale-[1.02]' : 'z-10',
                  )}
                >
                  <div className="flex items-center gap-2">
                    <div className="rounded-lg bg-background p-2">
                      <item.icon
                        className="size-5"
                        style={{ color: (item as any).classColor || undefined }}
                      />
                    </div>
                    <div>
                      <div className="text-sm font-semibold">{item.name}</div>
                      <div className="text-xs text-neutral-500 dark:text-neutral-400 font-medium flex items-center gap-1">
                        {item.urgencyIndicator}
                        {item.info}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-center">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggle(item.id);
                      }}
                      className={cn(
                        'p-1.5 rounded-full transition-colors opacity-0 group-hover:opacity-100',
                        item.pinned
                          ? 'text-yellow-500 hover:bg-yellow-50 dark:hover:bg-yellow-900/30'
                          : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:text-gray-500 dark:hover:text-gray-300 dark:hover:bg-gray-700/50',
                      )}
                      aria-label={item.pinned ? 'Unpin' : 'Pin'}
                    >
                       <AnimatePresence mode="wait">
                        {item.pinned ? (
                          <motion.div key="pin-on" initial={{ rotate: 90 }} animate={{ rotate: 0 }}>
                            <Pin className="w-4 h-4 fill-current" />
                          </motion.div>
                        ) : (
                          <motion.div key="pin-off" initial={{ rotate: -90 }} animate={{ rotate: 0 }}>
                            <PinOff className="w-4 h-4" />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </LayoutGroup>
    </motion.div>
  );
}

export { PinList, type PinListProps, type PinListItem };