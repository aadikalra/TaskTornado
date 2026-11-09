'use client';

import { useSchoolDataSync } from '@/hooks/use-school-data-sync';

import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { format } from 'date-fns';
import { usePathname } from 'next/navigation';
import { useAuth } from './AuthContext';
import { db } from '@/lib/supabase/db';
import { Database } from '@/types/database.types';
import { RecurringHomeworkService } from '@/lib/services/RecurringHomeworkService';
import { getPlanTier, TIER_LIMITS } from '@/lib/planTier';
import { HomeworkLink, parseHomeworkLinks } from '@/lib/utils/homework-links';
import { parseSubtasks, validateSubtasks, type HomeworkSubtask } from '@/lib/homework-subtasks';
import { awardFishTreat } from '@/lib/catTreats';

export type Priority = 'low' | 'medium' | 'high';
export type RecurringFrequency = 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'yearly';

export type RecurringHomework = {
  frequency: RecurringFrequency;
  endDate?: Date;
  maxOccurrences?: number;
  parentRecurringId?: string;
};

export type Homework = Omit<Database['public']['Tables']['homework']['Row'], 'links' | 'priority' | 'due_date' | 'class_id' | 'completed' | 'subtasks'> & {
  subtasks?: HomeworkSubtask[];
  links: HomeworkLink[];
  priority: Priority;
  classId: string;
  dueDate: string;
  pinned: boolean;
  completed: boolean;
  recurring?: RecurringHomework;
};

export interface HomeworkContextType {
  homeworks: Homework[];
  loading: boolean;
  error: string | null;
  addHomework: (classId: string, title: string, dueDate: Date, priority?: Priority, links?: HomeworkLink[], description?: string, completed?: boolean, subtasks?: HomeworkSubtask[]) => Promise<void>;
  addRecurringHomework: (classId: string, title: string, dueDate: Date, priority: Priority, links: HomeworkLink[], recurring: RecurringHomework, description?: string, subtasks?: HomeworkSubtask[]) => Promise<void>;
  toggleHomework: (id: string) => Promise<void>;
  togglePinHomework: (id: string, pinned: boolean) => Promise<void>;
  deleteHomework: (id: string) => Promise<void>;
  deleteRecurringSeries: (recurringId: string) => Promise<void>;
  updateHomeworkDueDate: (homeworkId: string, newDueDate: Date) => Promise<void>;
  updateHomework: (id: string, updates: Partial<Homework>, expectedSubtasks?: HomeworkSubtask[]) => Promise<void>;
  clearAllHomeworks: () => Promise<void>;
}

const HomeworkContext = createContext<HomeworkContextType | undefined>(undefined);

type HomeworkProviderProps = { children: React.ReactNode; initialHomeworks?: Homework[] };

export const HomeworkProvider = (props: HomeworkProviderProps) => {
  // Dashboard/calendar wrappers must share the app layout's canonical task list.
  // Otherwise card edits disappear from view when navigating to homework details.
  const parent = useContext(HomeworkContext);
  return parent ? <>{props.children}</> : <HomeworkProviderState {...props} />;
};

const HomeworkProviderState = ({ children, initialHomeworks }: HomeworkProviderProps) => {
  const { user } = useAuth();
  const pathname = usePathname();
  const [homeworks, setHomeworks] = useState<Homework[]>(initialHomeworks ?? []);
  const [loading, setLoading] = useState(!initialHomeworks ? true : false);
  const [error, setError] = useState<string | null>(null);

  const accountRef = useRef(user?.id);
  accountRef.current = user?.id;
  const hasLoaded = useRef<boolean>(!!(initialHomeworks && initialHomeworks.length > 0));

  const needsHomeworkData = useCallback(() => {
    if (typeof window === 'undefined') return false;
    const routes = ['/homework', '/classes', '/dashboard', '/calendar', '/settings', '/newhome', '/snake', '/games', '/flashcards', '/study-assistant', '/grade-calculator'];
    return routes.some(route => pathname.startsWith(route));
  }, [pathname]);

  const fetchData = useCallback(async () => {
    if (!user || !needsHomeworkData()) return;
    if (!hasLoaded.current) setLoading(true);
    setError(null);
    try {
      const processRecurring = !hasLoaded.current;
      const homeworksData = await db.getHomework(user.id);
      const transformedHomeworks = homeworksData.map(hw => ({
        ...hw,
        subtasks: parseSubtasks(hw.subtasks),
        links: parseHomeworkLinks(hw.links),
        priority: (hw.priority as Priority) || 'medium',
        dueDate: hw.due_date,
        classId: hw.class_id,
        pinned: hw.pinned || false,
        completed: hw.completed || false
      }));
      if (accountRef.current !== user.id) return;
      setHomeworks(transformedHomeworks);
      hasLoaded.current = true;
      setLoading(false);

      // Process recurring homework in the background
      if (processRecurring) (async () => {
        try {
          await RecurringHomeworkService.processRecurringHomework(user.id);
          const updatedHomeworks = await db.getHomework(user.id);

          if (updatedHomeworks && accountRef.current === user.id) {
            const updatedTransformedHomeworks = updatedHomeworks.map((hw: any) => ({
              ...hw,
              classId: hw.class_id,
              dueDate: hw.due_date,
              subtasks: parseSubtasks(hw.subtasks),
              links: parseHomeworkLinks(hw.links),
              priority: (hw.priority as Priority) || 'medium',
              pinned: hw.pinned || false,
              completed: hw.completed || false
            }));
            setHomeworks(updatedTransformedHomeworks);
          }
        } catch (err) {
          console.error('Error processing recurring homework:', err);
        }
      })();
    } catch (err) {
      if (accountRef.current !== user.id) return;
      console.error('Error fetching homework:', err);
      setError('Failed to load homeworks. Please try again.');
      setLoading(false);
    }
  }, [user, needsHomeworkData]);

  useSchoolDataSync('homework', user?.id, needsHomeworkData(), fetchData);
  useEffect(() => {
    hasLoaded.current = false;
    setHomeworks([]);
    setError(null);
  }, [user?.id]);

  const clearAllHomeworks = async () => {
    if (!user) throw new Error('User not authenticated');
    try {
      await db.deleteAllHomeworks(user.id);
    } catch (err) {
      throw err;
    }
  };

  const toggleHomework = async (id: string) => {
    if (!user) throw new Error('User not authenticated');
    const currentHomework = homeworks.find(hw => hw.id === id);
    if (!currentHomework) return;
    const isNowCompleted = !currentHomework.completed;
    try {
      setHomeworks(prev => prev.map(hw => hw.id === id ? { ...hw, completed: isNowCompleted } : hw));
      await db.toggleHomeworkComplete(id, user.id, isNowCompleted);
      if (isNowCompleted) {
        awardFishTreat(1);
      }
    } catch (err) {
      setHomeworks(prev => prev.map(hw => hw.id === id ? { ...hw, completed: currentHomework.completed } : hw));
      throw err;
    }
  };

  const addHomework = async (classId: string, title: string, dueDate: Date, priority: Priority = 'medium', links: HomeworkLink[] = [], description: string = '', completed: boolean = false, subtasks: HomeworkSubtask[] = []) => {
    subtasks = validateSubtasks(subtasks);
    if (!user) throw new Error('User not authenticated');
    const tier = getPlanTier();
    const limits = TIER_LIMITS[tier];
    if (!completed && limits.homeworkEntries !== Infinity) {
      const activeCount = homeworks.filter(hw => hw.user_id === user.id && !hw.completed).length;
      if (activeCount >= limits.homeworkEntries) {
        throw new Error(`PLAN_LIMIT:The free plan includes up to ${limits.homeworkEntries} active assignments.`);
      }
    }
    const tempId = `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const optimisticHomework: Homework = {
      id: tempId,
      user_id: user.id,
      classId,
      title,
      description: description || '',
      dueDate: format(dueDate, "yyyy-MM-dd'T'HH:mm:ss.SSSxxx"),
      priority,
      completed,
      pinned: false,
      subtasks,
      links: links || [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      recurring_id: null,
      recurring_frequency: null,
      recurring_end_date: null,
      recurring_max_occurrences: null,
      parent_recurring_id: null,
      is_recurring_instance: false
    };
    try {
      setHomeworks(prev => [...prev, optimisticHomework]);
      const formattedDueDate = format(dueDate, "yyyy-MM-dd'T'HH:mm:ss.SSSxxx");
      const homeworkData: any = {
        title,
        description: description || '',
        due_date: formattedDueDate,
        priority: String(priority),
        class_id: classId,
        user_id: user.id,
        pinned: false,
        completed,
      };
      if (links && links.length > 0) homeworkData.links = links;
      if (subtasks.length) homeworkData.subtasks = subtasks;
      
      const createdHomework = await db.createHomework(homeworkData);
      setHomeworks(prev => [...prev.filter(hw => hw.id !== tempId && hw.id !== createdHomework.id), {
        ...createdHomework,
        classId: createdHomework.class_id,
        dueDate: createdHomework.due_date,
        subtasks: parseSubtasks(createdHomework.subtasks),
        links: parseHomeworkLinks(createdHomework.links),
        priority: (createdHomework.priority as Priority) || 'medium',
        pinned: createdHomework.pinned || false,
        completed: createdHomework.completed || false
      }]);
    } catch (err) {
      setHomeworks(prev => prev.filter(hw => hw.id !== tempId));
      throw err;
    }
  };

  const addRecurringHomework = async (classId: string, title: string, dueDate: Date, priority: Priority, links: HomeworkLink[], recurring: RecurringHomework, description: string = '', subtasks: HomeworkSubtask[] = []) => {
    subtasks = validateSubtasks(subtasks);
    if (!user) throw new Error('User not authenticated');
    const tempId = `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const optimisticHomework: Homework = {
      id: tempId,
      user_id: user.id,
      classId,
      title,
      description: description || '',
      dueDate: format(dueDate, "yyyy-MM-dd'T'HH:mm:ss.SSSxxx"),
      priority,
      completed: false,
      pinned: false,
      subtasks,
      links: links || [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      recurring_id: null,
      recurring_frequency: null,
      recurring_end_date: null,
      recurring_max_occurrences: null,
      parent_recurring_id: null,
      is_recurring_instance: false
    };
    try {
      setHomeworks(prev => [...prev, optimisticHomework]);
      const { masterRecord, initialInstance } = await RecurringHomeworkService.createRecurringHomework(
        user.id, classId, title, description, dueDate, priority, links, recurring, subtasks
      );
      setHomeworks(prev => {
        const otherHomeworks = prev.filter(hw => hw.id !== tempId && hw.id !== masterRecord.id && hw.id !== initialInstance.id);
        const transform = (hw: any): Homework => ({
          ...hw,
          classId: hw.class_id,
          dueDate: hw.due_date,
          subtasks: parseSubtasks(hw.subtasks),
          links: parseHomeworkLinks(hw.links),
          priority: (hw.priority as Priority) || 'medium',
          pinned: hw.pinned || false,
          completed: hw.completed || false
        });
        return [...otherHomeworks, transform(masterRecord), transform(initialInstance)];
      });
    } catch (err) {
      setHomeworks(prev => prev.filter(hw => hw.id !== tempId));
      throw err;
    }
  };

  const updateHomeworkDueDate = async (homeworkId: string, newDueDate: Date) => {
    if (!user) throw new Error('User not authenticated');
    const currentHomework = homeworks.find(hw => hw.id === homeworkId);
    if (!currentHomework) return;
    try {
      const normalizedDate = new Date(newDueDate.getFullYear(), newDueDate.getMonth(), newDueDate.getDate());
      setHomeworks(prev => prev.map(hw => hw.id === homeworkId ? { ...hw, dueDate: normalizedDate.toISOString() } : hw));
      await db.updateHomework(homeworkId, { due_date: normalizedDate.toISOString() });
    } catch (err) {
      setHomeworks(prev => prev.map(hw => hw.id === homeworkId ? currentHomework : hw));
      throw err;
    }
  };

  const togglePinHomework = async (id: string, pinned: boolean) => {
    if (!user) throw new Error('User not authenticated');
    const currentHomework = homeworks.find(hw => hw.id === id);
    if (!currentHomework) return;
    try {
      setHomeworks(prev => prev.map(hw => hw.id === id ? { ...hw, pinned: pinned } : hw));
      await db.updateHomework(id, { pinned: pinned });
    } catch (err) {
      setHomeworks(prev => prev.map(hw => hw.id === id ? { ...hw, pinned: currentHomework.pinned } : hw));
      throw err;
    }
  };

  const updateHomework = async (id: string, updates: Partial<Homework>, expectedSubtasks?: HomeworkSubtask[]) => {
    const currentHomework = homeworks.find(hw => hw.id === id);
    if (updates.subtasks !== undefined) updates = { ...updates, subtasks: validateSubtasks(updates.subtasks) };
    if (!user) throw new Error('User not authenticated');
    try {
      const dbUpdates: Record<string, any> = {
        subtasks: updates.subtasks,
        title: updates.title,
        description: updates.description,
        due_date: updates.dueDate ? new Date(updates.dueDate).toISOString() : undefined,
        class_id: updates.classId,
        completed: updates.completed,
        priority: updates.priority,
        links: updates.links,
        updated_at: new Date().toISOString()
      };
      Object.keys(dbUpdates).forEach((key: string) => {
        if (dbUpdates[key] === undefined) delete dbUpdates[key];
      });
      const saved = await db.updateHomework(id, dbUpdates, updates.subtasks !== undefined ? (expectedSubtasks ?? currentHomework?.subtasks ?? []) : undefined);
      setHomeworks(prev => prev.map(hw => hw.id === id ? { ...hw, ...updates, subtasks: parseSubtasks(saved.subtasks), updated_at: saved.updated_at } : hw));
    } catch (err) {
      throw err;
    }
  };

  const deleteHomework = async (id: string) => {
    if (!user) throw new Error('User not authenticated');
    const homeworkToDelete = homeworks.find(hw => hw.id === id);
    if (!homeworkToDelete) return;
    try {
      setHomeworks(prev => prev.filter(hw => hw.id !== id));
      await db.deleteHomework(id, user.id);
    } catch (err) {
      setHomeworks(prev => {
        if (!prev.some(hw => hw.id === id)) return [...prev, homeworkToDelete];
        return prev;
      });
      throw err;
    }
  };

  const deleteRecurringSeries = async (recurringId: string) => {
    if (!user) throw new Error('User not authenticated');
    const prevHomeworks = homeworks;
    try {
      setHomeworks(prev => prev.filter(hw => (hw as any).recurring_id !== recurringId && (hw as any).parent_recurring_id !== recurringId));
      await RecurringHomeworkService.deleteRecurringSeries(recurringId, user.id);
    } catch (err) {
      setHomeworks(prevHomeworks);
      throw err;
    }
  };

  const value = {
    homeworks,
    loading,
    error,
    addHomework,
    addRecurringHomework,
    toggleHomework,
    togglePinHomework,
    deleteHomework,
    deleteRecurringSeries,
    updateHomeworkDueDate,
    updateHomework,
    clearAllHomeworks,
  };

  return <HomeworkContext.Provider value={value}>{children}</HomeworkContext.Provider>;
};

export const useHomeworkContext = () => {
  const context = useContext(HomeworkContext);
  if (context === undefined) throw new Error('useHomeworkContext must be used within a HomeworkProvider');
  return context;
};
