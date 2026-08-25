'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode, useRef } from 'react';
import { Test } from '@/context/ClassContext';

// Cookie utilities for persisting UI state
export const setCookie = (name: string, value: string, days: number = 365) => {
  if (typeof window === 'undefined') return;
  const expires = new Date();
  expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`;
};

export const getCookie = (name: string): string | null => {
  if (typeof window === 'undefined') return null;
  const nameEQ = name + "=";
  const ca = document.cookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
  }
  return null;
};

interface DeleteConfirmState {
  id: string;
  title: string;
  isRecurring: boolean;
  recurringId?: string;
}

interface MainAppContextType {
  // Modals
  showAddClass: boolean;
  setShowAddClass: (show: boolean) => void;
  showAddHomework: boolean;
  setShowAddHomework: (show: boolean) => void;
  showAddTest: boolean;
  setShowAddTest: (show: boolean) => void;
  classIdForAddTest: string | undefined;
  setClassIdForAddTest: (id: string | undefined) => void;
  selectedTest: Test | null;
  setSelectedTest: (test: Test | null) => void;
  isTestDetailModalOpen: boolean;
  setIsTestDetailModalOpen: (open: boolean) => void;
  classToDelete: { id: string; name: string } | null;
  setClassToDelete: (cls: { id: string; name: string } | null) => void;
  deleteConfirm: DeleteConfirmState | null;
  setDeleteConfirm: (state: DeleteConfirmState | null) => void;

  // Search & Filter
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  homeworkSearch: string;
  setHomeworkSearch: (query: string) => void;
  isHomeworkSearchExpanded: boolean;
  setIsHomeworkSearchExpanded: (expanded: boolean) => void;
  homeworkFilter: string;
  setHomeworkFilter: (filter: string) => void;
  testSearch: string;
  setTestSearch: (query: string) => void;
  isTestSearchExpanded: boolean;
  setIsTestSearchExpanded: (expanded: boolean) => void;
  testFilter: string;
  setTestFilter: (filter: string) => void;

  // View State (persisted in cookies)
  showPinnedHomeworks: boolean;
  setShowPinnedHomeworks: (show: boolean) => void;
  toggleShowPinnedHomeworks: () => void;
  showClasses: boolean;
  setShowClasses: (show: boolean) => void;
  toggleShowClasses: () => void;
  showTests: boolean;
  setShowTests: (show: boolean) => void;
  toggleShowTests: () => void;
  showCalendarWidget: boolean;
  setShowCalendarWidget: (show: boolean) => void;
  toggleShowCalendarWidget: () => void;
  showTestsInClassCards: boolean;
  setShowTestsInClassCards: (show: boolean) => void;
  toggleShowTestsInClassCards: () => void;
  expandedClasses: Record<string, boolean>;
  setExpandedClasses: (classes: Record<string, boolean>) => void;
  toggleExpandedClass: (classId: string) => void;
  showArchivedForClass: Record<string, boolean>;
  setShowArchivedForClass: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  toggleShowArchivedForClass: (classId: string) => void;
  isSelectionMode: boolean;
  setIsSelectionMode: (mode: boolean) => void;
  showBracket: boolean;
  setShowBracket: (show: boolean) => void;
}

const MainAppContext = createContext<MainAppContextType | undefined>(undefined);

export const MainAppProvider = ({ children }: { children: ReactNode }) => {
  // Modals
  const [showAddClass, setShowAddClass] = useState(false);
  const [showAddHomework, setShowAddHomework] = useState(false);
  const [showAddTest, setShowAddTest] = useState(false);
  const [classIdForAddTest, setClassIdForAddTest] = useState<string | undefined>(undefined);
  const [selectedTest, setSelectedTest] = useState<Test | null>(null);
  const [isTestDetailModalOpen, setIsTestDetailModalOpen] = useState(false);
  const [classToDelete, setClassToDelete] = useState<{ id: string; name: string } | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<DeleteConfirmState | null>(null);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [homeworkSearch, setHomeworkSearch] = useState('');
  const [isHomeworkSearchExpanded, setIsHomeworkSearchExpanded] = useState(false);
  const [homeworkFilter, setHomeworkFilter] = useState('all');
  const [testSearch, setTestSearch] = useState('');
  const [isTestSearchExpanded, setIsTestSearchExpanded] = useState(false);
  const [testFilter, setTestFilter] = useState<string>(() => {
    const saved = getCookie('testFilter');
    return saved || 'all';
  });

  // View State
  const [showPinnedHomeworks, setShowPinnedHomeworksState] = useState(() => {
    const saved = getCookie('showPinnedHomeworks');
    return saved !== null ? saved === 'true' : true;
  });

  const [showClasses, setShowClassesState] = useState(() => {
    const saved = getCookie('showClasses');
    return saved !== null ? saved === 'true' : true;
  });

  const [showTests, setShowTestsState] = useState(() => {
    const saved = getCookie('showTests');
    return saved !== null ? saved === 'true' : true;
  });

  const [showCalendarWidget, setShowCalendarWidgetState] = useState(() => {
    const saved = getCookie('showCalendarWidget');
    return saved !== null ? saved === 'true' : true;
  });

  const [showTestsInClassCards, setShowTestsInClassCardsState] = useState(() => {
    const saved = getCookie('showTestsInClassCards');
    return saved !== null ? saved === 'true' : false;
  });

  const [expandedClasses, setExpandedClassesState] = useState<Record<string, boolean>>(() => {
    const saved = getCookie('expandedClasses');
    return saved ? JSON.parse(saved) : {};
  });

  const [showArchivedForClass, setShowArchivedForClassState] = useState<Record<string, boolean>>({});
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [showBracket, setShowBracket] = useState(false);

  // Toggle Handlers
  const toggleShowPinnedHomeworks = useCallback(() => {
    setShowPinnedHomeworksState(prev => {
      const next = !prev;
      setCookie('showPinnedHomeworks', next.toString());
      return next;
    });
  }, []);

  const toggleShowClasses = useCallback(() => {
    setShowClassesState(prev => {
      const next = !prev;
      setCookie('showClasses', next.toString());
      return next;
    });
  }, []);

  const toggleShowTests = useCallback(() => {
    setShowTestsState(prev => {
      const next = !prev;
      setCookie('showTests', next.toString());
      return next;
    });
  }, []);

  const toggleShowCalendarWidget = useCallback(() => {
    setShowCalendarWidgetState(prev => {
      const next = !prev;
      setCookie('showCalendarWidget', next.toString());
      return next;
    });
  }, []);

  const toggleShowTestsInClassCards = useCallback(() => {
    setShowTestsInClassCardsState(prev => {
      const next = !prev;
      setCookie('showTestsInClassCards', next.toString());
      return next;
    });
  }, []);

  const toggleExpandedClass = useCallback((classId: string) => {
    setExpandedClassesState(prev => {
      const newExpanded = { ...prev, [classId]: !prev[classId] };
      setCookie('expandedClasses', JSON.stringify(newExpanded));
      return newExpanded;
    });
  }, []);

  const toggleShowArchivedForClass = useCallback((classId: string) => {
    setShowArchivedForClassState(prev => ({
      ...prev,
      [classId]: !prev[classId]
    }));
  }, []);

  // Update test filter with cookie persistence
  const handleSetTestFilter = useCallback((filter: string) => {
    setTestFilter(filter);
    setCookie('testFilter', filter);
  }, []);

  const value: MainAppContextType = {
    showAddClass, setShowAddClass,
    showAddHomework, setShowAddHomework,
    showAddTest, setShowAddTest,
    classIdForAddTest, setClassIdForAddTest,
    selectedTest, setSelectedTest,
    isTestDetailModalOpen, setIsTestDetailModalOpen,
    classToDelete, setClassToDelete,
    deleteConfirm, setDeleteConfirm,

    searchQuery, setSearchQuery,
    homeworkSearch, setHomeworkSearch,
    isHomeworkSearchExpanded, setIsHomeworkSearchExpanded,
    homeworkFilter, setHomeworkFilter,
    testSearch, setTestSearch,
    isTestSearchExpanded, setIsTestSearchExpanded,
    testFilter, setTestFilter: handleSetTestFilter,

    showPinnedHomeworks, setShowPinnedHomeworks: setShowPinnedHomeworksState, toggleShowPinnedHomeworks,
    showClasses, setShowClasses: setShowClassesState, toggleShowClasses,
    showTests, setShowTests: setShowTestsState, toggleShowTests,
    showCalendarWidget, setShowCalendarWidget: setShowCalendarWidgetState, toggleShowCalendarWidget,
    showTestsInClassCards, setShowTestsInClassCards: setShowTestsInClassCardsState, toggleShowTestsInClassCards,
    expandedClasses, setExpandedClasses: setExpandedClassesState, toggleExpandedClass,
    showArchivedForClass, setShowArchivedForClass: setShowArchivedForClassState, toggleShowArchivedForClass,
    isSelectionMode, setIsSelectionMode,
    showBracket, setShowBracket,
  };

  return <MainAppContext.Provider value={value}>{children}</MainAppContext.Provider>;
};

export const useMainApp = () => {
  const context = useContext(MainAppContext);
  if (context === undefined) {
    throw new Error('useMainApp must be used within a MainAppProvider');
  }
  return context;
};
