'use client';

import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { format } from 'date-fns';
import { usePathname } from 'next/navigation';
import { useAuth } from './AuthContext';
import { db } from '@/lib/supabase/db';
import { Database } from '@/types/database.types';
import { RecurringHomeworkService } from '@/lib/services/RecurringHomeworkService';
import { getPlanTier, TIER_LIMITS } from '@/lib/planTier';
import { HomeworkLink, parseHomeworkLinks } from '@/lib/utils/homework-links';

export type Priority = 'low' | 'medium' | 'high';
export type RecurringFrequency = 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'yearly';

export type RecurringHomework = {
  frequency: RecurringFrequency;
  endDate?: Date;
  maxOccurrences?: number;
  parentRecurringId?: string;
};

export type Homework = Omit<Database['public']['Tables']['homework']['Row'], 'links' | 'priority' | 'due_date' | 'class_id' | 'completed'> & {
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
  addHomework: (classId: string, title: string, dueDate: Date, priority?: Priority, links?: HomeworkLink[], description?: string, completed?: boolean) => Promise<void>;
  addRecurringHomework: (classId: string, title: string, dueDate: Date, priority: Priority, links: HomeworkLink[], recurring: RecurringHomework, description?: string) => Promise<void>;
  toggleHomework: (id: string) => Promise<void>;
  togglePinHomework: (id: string, pinned: boolean) => Promise<void>;
  deleteHomework: (id: string) => Promise<void>;
  deleteRecurringSeries: (recurringId: string) => Promise<void>;
  updateHomeworkDueDate: (homeworkId: string, newDueDate: Date) => Promise<void>;
  updateHomework: (id: string, updates: Partial<Homework>) => Promise<void>;
  clearAllHomeworks: () => Promise<void>;
}

const HomeworkContext = createContext<HomeworkContextType | undefined>(undefined);

export const HomeworkProvider = ({ children, initialHomeworks }: { children: React.ReactNode; initialHomeworks?: Homework[] }) => {
  const { user } = useAuth();
  const pathname = usePathname();
  const [homeworks, setHomeworks] = useState<Homework[]>(initialHomeworks ?? []);
  const [loading, setLoading] = useState(!initialHomeworks ? true : false);
  const [error, setError] = useState<string | null>(null);

  const hasLoaded = useRef<boolean>(!!(initialHomeworks && initialHomeworks.length > 0));

  const needsHomeworkData = useCallback(() => {
    if (typeof window === 'undefined') return false;
    const routes = ['/homework', '/classes', '/dashboard', '/calendar', '/settings', '/snake', '/games', '/flashcards', '/study-assistant', '/grade-calculator'];
    return routes.some(route => pathname.startsWith(route));
  }, [pathname]);

  const fetchData = useCallback(async () => {
    if (!user || !needsHomeworkData() || hasLoaded.current) return;
    setLoading(true);
    setError(null);
    try {
      const homeworksData = await db.getHomework(user.id);
      const transformedHomeworks = homeworksData.map(hw => ({
        ...hw,
        links: parseHomeworkLinks(hw.links),
        priority: (hw.priority as Priority) || 'medium',
        dueDate: hw.due_date,
        classId: hw.class_id,
        pinned: hw.pinned || false,
        completed: hw.completed || false
      }));
      setHomeworks(transformedHomeworks);
      hasLoaded.current = true;
      setLoading(false);

      // Process recurring homework in the background
      (async () => {
        try {
          await RecurringHomeworkService.processRecurringHomework(user.id);
          const { supabase } = await import('@/lib/supabase/client');
          const { data: updatedHomeworks } = await supabase
            .from('homework')
            .select('*')
            .eq('user_id', user.id)
            .order('due_date', { ascending: true });

          if (updatedHomeworks) {
            const updatedTransformedHomeworks = updatedHomeworks.map((hw: any) => ({
              ...hw,
              classId: hw.class_id,
              dueDate: hw.due_date,
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
      console.error('Error fetching homework:', err);
      setError('Failed to load homeworks. Please try again.');
      setLoading(false);
    }
  }, [user, needsHomeworkData]);

  const setupSubscriptions = useCallback(async () => {
    if (!user) return;
    try {
      const { supabase } = await import('@/lib/supabase/client');
      supabase
        .channel('homework_changes')
        .on('postgres_changes',
          { event: '*', schema: 'public', table: 'homework', filter: `user_id=eq.${user.id}` },
          (payload: any) => {
            const eventType = payload.eventType.toLowerCase();
            if (eventType === 'insert') {
              const newHomework = payload.new as any;
              setHomeworks(prev => {
                if (prev.some(hw => hw.id === newHomework.id)) return prev;
                const newHw = {
                  ...newHomework,
                  classId: newHomework.class_id,
                  dueDate: newHomework.due_date,
                  links: parseHomeworkLinks(newHomework.links),
                  priority: (newHomework.priority as Priority) || 'medium',
                  pinned: newHomework.pinned || false,
                  completed: newHomework.completed || false
                };
                return [...prev, newHw];
              });
            } else if (eventType === 'update') {
              const updated = payload.new as any;
              setHomeworks(prev => prev.map(hw => hw.id === updated.id ? {
                ...hw,
                ...updated,
                classId: updated.class_id || hw.classId,
                dueDate: updated.due_date || hw.dueDate,
                links: updated.links ? parseHomeworkLinks(updated.links) : (hw.links || []),
                pinned: updated.pinned !== undefined ? updated.pinned : (hw.pinned || false),
                completed: updated.completed !== undefined ? updated.completed : (hw.completed || false)
              } : hw));
            } else if (eventType === 'delete') {
              setHomeworks(prev => prev.filter(hw => hw.id !== (payload.old as any).id));
            }
          }
        ).subscribe();
    } catch (err) {
      console.error('Error setting up subscriptions:', err);
    }
  }, [user]);

  useEffect(() => {
    let isMounted = true;
    const handleVisibilityChange = () => {
      if (!isMounted) return;
      if (document.visibilityState === 'visible' && user && !hasLoaded.current && needsHomeworkData()) {
        fetchData();
      }
    };
    const initialize = async () => {
      if (!hasLoaded.current) await fetchData();
      if (needsHomeworkData()) await setupSubscriptions();
      document.addEventListener('visibilitychange', handleVisibilityChange);
    };
    initialize();
    return () => {
      isMounted = false;
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [user, fetchData, needsHomeworkData, setupSubscriptions]);

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
    try {
      setHomeworks(prev => prev.map(hw => hw.id === id ? { ...hw, completed: !hw.completed } : hw));
      await db.toggleHomeworkComplete(id, user.id, !currentHomework.completed);
    } catch (err) {
      setHomeworks(prev => prev.map(hw => hw.id === id ? { ...hw, completed: currentHomework.completed } : hw));
      throw err;
    }
  };

  const addHomework = async (classId: string, title: string, dueDate: Date, priority: Priority = 'medium', links: HomeworkLink[] = [], description: string = '', completed: boolean = false) => {
    if (!user) throw new Error('User not authenticated');
    const tier = getPlanTier();
    const limits = TIER_LIMITS[tier];
    if (limits.homeworkEntries !== Infinity) {
      const activeCount = homeworks.filter(hw => !hw.completed).length;
      if (activeCount >= limits.homeworkEntries) {
        throw new Error(`PLAN_LIMIT:The free plan includes up to ${limits.homeworkEntries} active assignments — upgrade to Pro for unlimited.`);
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
      
      const createdHomework = await db.createHomework(homeworkData);
      setHomeworks(prev => prev.map(hw => hw.id === tempId ? {
        ...createdHomework,
        classId: createdHomework.class_id,
        dueDate: createdHomework.due_date,
        links: parseHomeworkLinks(createdHomework.links),
        priority: (createdHomework.priority as Priority) || 'medium',
        pinned: createdHomework.pinned || false,
        completed: createdHomework.completed || false
      } : hw));
    } catch (err) {
      setHomeworks(prev => prev.filter(hw => hw.id !== tempId));
      throw err;
    }
  };

  const addRecurringHomework = async (classId: string, title: string, dueDate: Date, priority: Priority, links: HomeworkLink[], recurring: RecurringHomework, description: string = '') => {
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
        user.id, classId, title, description, dueDate, priority, links, recurring
      );
      setHomeworks(prev => {
        const otherHomeworks = prev.filter(hw => hw.id !== tempId);
        const transform = (hw: any): Homework => ({
          ...hw,
          classId: hw.class_id,
          dueDate: hw.due_date,
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

  const updateHomework = async (id: string, updates: Partial<Homework>) => {
    if (!user) throw new Error('User not authenticated');
    try {
      const dbUpdates: Record<string, any> = {
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
      await db.updateHomework(id, dbUpdates);
      setHomeworks(prev => prev.map(hw => hw.id === id ? { ...hw, ...updates, updatedAt: new Date().toISOString() } : hw));
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