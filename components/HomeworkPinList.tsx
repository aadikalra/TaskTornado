'use client';

import React, { useState, useMemo, useCallback, useEffect, memo } from 'react';
import { PinList } from './animate-ui/components/pin-list';
import { BookOpen, Pin, PinOff, AlertCircle, AlertTriangle, Clock, Calendar, CheckCircle2, X, Plus } from 'lucide-react';
import { useClassContext, type Homework } from '@/context/ClassContext';
import { format } from 'date-fns';
import dynamic from 'next/dynamic';
import { iconMap } from '@/lib/icon-map';

// Dynamically import the PriorityHomeworkCard with SSR disabled
const PriorityHomeworkCard = dynamic(
  () => import('./PriorityHomeworkCard'),
  { ssr: false, loading: () => <div className="h-32 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-xl mb-6 animate-pulse"></div> }
);

// Create a map to store the mapping between string IDs and numeric IDs
const idMap = new Map<string, number>();
let nextNumericId = 1;

// Helper function to get a numeric ID for a string.  ID
const getNumericId = (stringId: string): number => {
  if (!idMap.has(stringId)) {
    idMap.set(stringId, nextNumericId++);
  }
  return idMap.get(stringId)!;
};

// Helper function to get the original string ID from a numeric ID
const getStringId = (numericId: number): string | undefined => {
  for (const [stringId, id] of idMap.entries()) {
    if (id === numericId) return stringId;
  }
  return undefined;
};

  // Color mapping for class icons (same as MainApp)
  const classColors = {
    red: '#E53E3E',
    blue: '#3182CE',
    yellow: '#D69E2E',
    green: '#38A169',
    purple: '#805AD5',
    pink: '#D53F8C',
    teal: '#264f84',
    gray: '#4A5568'
  };

  const getClassColor = (index: number) => {
    const colors = Object.values(classColors);
    return colors[index % colors.length];
  };

export const HomeworkPinList = ({ triggerSelectModal = false }: { triggerSelectModal?: boolean }) => {
  const { homeworks, classes, togglePinHomework } = useClassContext();

  // Modal state
  const [showSelectModal, setShowSelectModal] = React.useState(false);

  // Open modal when parent triggers it
  React.useEffect(() => {
    if (triggerSelectModal) {
      setShowSelectModal(true);
    }
  }, [triggerSelectModal]);

  // Handle opening the select modal
  const handleSelectHomework = () => {
    setShowSelectModal(true);
  };

  // Handle pinning selected homework
  const handlePinSelectedHomework = (homeworkId: string) => {
    togglePinHomework(homeworkId, true);
    setShowSelectModal(false);
  };

  // Handle pin toggle with an optimistic update
  const handlePinToggle = (item: { id: number; pinned: boolean }) => {
    const stringId = getStringId(item.id);
    if (!stringId) return;

    // The context now handles optimistic updates, so we just call the API
    togglePinHomework(stringId, !item.pinned);
  };

  // Format homework items from the optimistic state for the PinList
  const getFormattedHomeworkItems = () => {
    // Filter out completed homework items
    return homeworks
      .filter((homework: Homework) => !homework.completed)
      .map((homework: Homework) => {
      const dueDate = new Date(homework.dueDate);

      // Calculate days until due
      const daysUntilDue = Math.ceil((dueDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
      const isOverdue = daysUntilDue < 0;
      const isDueToday = daysUntilDue === 0;
      const isApproaching = daysUntilDue === 1 || daysUntilDue === 2;
      const isFarAway = daysUntilDue > 2;

      // Find the class this homework belongs to
      const classItem = classes.find(c => c.id === homework.classId);
      const className = classItem?.name || 'No Class';

      // Use class icon instead of status icon
      const Icon = classItem?.icon ? iconMap[classItem.icon as keyof typeof iconMap] || BookOpen : BookOpen;

      // Format the due date only (remove class name)
      const formattedDueDate = format(dueDate, 'MMM d, yyyy');

      // Get urgency icon
      let urgencyIcon = null;
      if (isOverdue) {
        urgencyIcon = <AlertCircle className="w-3 h-3 text-red-500" />;
      } else if (isDueToday) {
        urgencyIcon = <AlertTriangle className="w-3 h-3 text-orange-500" />;
      } else if (isApproaching) {
        urgencyIcon = <Clock className="w-3 h-3 text-yellow-500" />;
      } else {
        urgencyIcon = <CheckCircle2 className="w-3 h-3 text-green-500" />;
      }

      // Convert string ID to numeric ID for PinList
      const numericId = getNumericId(homework.id);

      // Get class color for the icon
      const classIndex = classes.findIndex(c => c.id === homework.classId);
      const classColor = getClassColor(classIndex);

      return {
        id: numericId,
        name: homework.title,
        info: formattedDueDate, // Just the due date, no class name
        icon: Icon,
        pinned: homework.pinned || false,
        className: homework.completed
          ? 'opacity-70'
          : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800',
        // Add urgency indicator to the render
        urgencyIndicator: urgencyIcon,
        // Store class color for icon styling
        classColor: classColor,
        // Add custom render function for the pin button
        renderPinButton: ({ pinned, onClick }: { pinned: boolean; onClick: () => void }) => (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClick();
            }}
            className={`p-1.5 rounded-full transition-colors ${
              pinned
                ? 'text-yellow-500 hover:bg-yellow-50 dark:hover:bg-yellow-900/30'
                : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:text-gray-500 dark:hover:text-gray-300 dark:hover:bg-gray-700/50'
            }`}
            aria-label={pinned ? 'Unpin' : 'Pin'}
          >
            {pinned ? <Pin className="w-4 h-4 fill-current" /> : <PinOff className="w-4 h-4" />}
          </button>
        )
      };
    });
  };

  // Get the formatted homework items
  const homeworkItems = getFormattedHomeworkItems();

  // Separate pinned and unpinned items
  const pinnedItems = homeworkItems.filter((item: { pinned: boolean }) => item.pinned);
  const unpinnedItems = homeworkItems.filter((item: { pinned: boolean }) => !item.pinned);

  return (
    <div className="space-y-4">
      {/* Pinned items */}
      {pinnedItems.length > 0 ? (
        <PinList items={pinnedItems} onPinToggle={handlePinToggle} />
      ) : (
        /* Empty state with Add Homework button */
        <div className="bg-white dark:bg-gray-800 rounded-xl p-8 min-h-[160px] flex flex-col items-center justify-center relative border border-gray-200 dark:border-gray-700">
          <div className="text-center">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <Pin className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              No Pinned Homework
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-sm mx-auto">
              Pin important homework assignments to keep them at the top of your dashboard
            </p>
            <button
              onClick={handleSelectHomework}
              className="inline-flex items-center h-9 px-4 text-sm font-medium bg-[#264f84] hover:bg-[#1f3f6b] text-white rounded-full transition-colors"
            >
              <Plus className="w-4 h-4 mr-1.5" />
              Select Homework to Pin
            </button>
          </div>
        </div>
      )}

      {/* Select Homework Modal */}
      {showSelectModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Select Homework to Pin
              </h2>
              <button
                onClick={() => setShowSelectModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 max-h-96 overflow-y-auto">
              {unpinnedItems.length > 0 ? (
                <div className="space-y-3">
                  {unpinnedItems.map((item: { id: number; name: string; info: string; icon: any; pinned: boolean; urgencyIndicator: React.ReactNode; classColor: string }) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors"
                      onClick={() => {
                        const stringId = getStringId(item.id);
                        if (stringId) {
                          handlePinSelectedHomework(stringId);
                        }
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                          <item.icon
                            className="w-5 h-5 hover:scale-110 transition-transform"
                            style={{ color: item.classColor || undefined }}
                          />
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900 dark:text-white">{item.name}</h3>
                          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                            {item.urgencyIndicator}
                            <span>{item.info}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-gray-400 dark:text-gray-500">
                        <button
                          className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-600 dark:hover:text-gray-300 transition-all hover:scale-110"
                          onClick={(e) => {
                            e.stopPropagation();
                            const stringId = getStringId(item.id);
                            if (stringId) {
                              handlePinSelectedHomework(stringId);
                            }
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
                  <p className="text-sm mt-2">Complete some homework or add new assignments first.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};