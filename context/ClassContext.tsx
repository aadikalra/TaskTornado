'use client';

import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { useAuth } from './AuthContext';
import { db } from '@/lib/supabase/db';
import { Database } from '@/types/database.types';
import Cookies from 'js-cookie';

// Predefined color palette for consistent class colors
export const classColorPalette = [
  '#E53E3E', // red
  '#3182CE', // blue
  '#D69E2E', // yellow
  '#38A169', // green
  '#805AD5', // purple
  '#D53F8C', // pink
  '#2C7A7B', // teal
  '#DD6B20', // orange
  '#00B5D8', // cyan
  '#5A67D8', // indigo
];

// Function to generate a consistent color from a string (e.g., class ID)
export const generateConsistentColor = (id: string) => {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    const char = id.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  const index = Math.abs(hash) % classColorPalette.length;
  return classColorPalette[index];
};

export type HugeIconName = string;

export type Class = Omit<Database['public']['Tables']['classes']['Row'], 'icon'> & {
  icon: HugeIconName;
};

export type Priority = 'low' | 'medium' | 'high';

export type { Homework, RecurringHomework, RecurringFrequency } from './HomeworkContext';
export type { Test, TestType, TestStatus, StudyMaterial } from './TestContext';
export type { HomeworkLink } from '@/lib/utils/homework-links';

export interface ClassContextType {
  classes: Class[];
  loading: boolean;
  error: string | null;
  addClass: (name: string, icon: HugeIconName) => Promise<string>;
  updateClass: (id: string, updates: Partial<Class>) => Promise<void>;
  deleteClass: (id: string) => Promise<void>;
  clearAllClasses: () => Promise<void>;
}

const ClassContext = createContext<ClassContextType | undefined>(undefined);

export const ClassProvider = ({ children, initialClasses }: { children: React.ReactNode; initialClasses?: Class[] }) => {
  const { user } = useAuth();
  const pathname = usePathname();
  const [classes, setClasses] = useState<Class[]>(initialClasses ?? []);
  const [loading, setLoading] = useState(!initialClasses ? true : false);
  const [error, setError] = useState<string | null>(null);

  const hasLoaded = useRef<boolean>(!!(initialClasses && initialClasses.length > 0));

  const needsClassData = useCallback(() => {
    if (typeof window === 'undefined') return false;
    const routes = ['/homework', '/classes', '/dashboard', '/calendar', '/settings', '/snake', '/games', '/flashcards', '/study-assistant', '/grade-calculator'];
    return routes.some(route => pathname.startsWith(route));
  }, [pathname]);

  const fetchData = useCallback(async () => {
    if (!user || !needsClassData() || hasLoaded.current) return;
    setLoading(true);
    setError(null);
    try {
      const classesData = await db.getClasses(user.id);
      setClasses(classesData as Class[]);
      const colorMap = classesData.reduce((acc, cls) => {
        if (cls.id && cls.color) acc[cls.id] = cls.color;
        return acc;
      }, {} as { [key: string]: string });
      Cookies.set('classColors', JSON.stringify(colorMap), { expires: 7 });
      hasLoaded.current = true;
      setLoading(false);
    } catch (err) {
      console.error('Error fetching classes:', err);
      setError('Failed to load classes. Please try again.');
      setLoading(false);
    }
  }, [user, needsClassData]);

  const setupSubscriptions = useCallback(async () => {
    if (!user) return;
    try {
      const { supabase } = await import('@/lib/supabase/client');
      supabase
        .channel('classes_changes')
        .on('postgres_changes',
          { event: '*', schema: 'public', table: 'classes', filter: `user_id=eq.${user.id}` },
          (payload: any) => {
            const eventType = payload.eventType.toLowerCase();
            if (eventType === 'insert') {
              const newClass = payload.new as any;
              setClasses(prev => {
                if (prev.some(c => c.id === newClass.id)) return prev;
                return [...prev, { ...newClass, icon: newClass.icon as HugeIconName }];
              });
            } else if (eventType === 'update') {
              const updated = payload.new as any;
              setClasses(prev => prev.map(c => c.id === updated.id ? { ...c, ...updated, icon: updated.icon as HugeIconName } : c));
            } else if (eventType === 'delete') {
              setClasses(prev => prev.filter(c => c.id !== (payload.old as any).id));
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
      if (document.visibilityState === 'visible' && user && !hasLoaded.current && needsClassData()) {
        fetchData();
      }
    };
    const initialize = async () => {
      if (!hasLoaded.current) await fetchData();
      if (needsClassData()) await setupSubscriptions();
      document.addEventListener('visibilitychange', handleVisibilityChange);
    };
    initialize();
    return () => {
      isMounted = false;
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [user, fetchData, needsClassData, setupSubscriptions]);

  const addClass = async (name: string, icon: HugeIconName): Promise<string> => {
    if (!user) throw new Error('User not authenticated');
    const tempId = `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const optimisticClass: Class = {
      id: tempId, name, icon, color: `#${Math.floor(Math.random() * 16777215).toString(16)}`, user_id: user.id, created_at: new Date().toISOString(), updated_at: new Date().toISOString()
    };
    try {
      setClasses(prev => [...prev, optimisticClass]);
      const createdClass = await db.createClass({ name, icon, color: optimisticClass.color, user_id: user.id });
      setClasses(prev => prev.map(cls => cls.id === tempId ? { ...createdClass, icon: createdClass.icon as HugeIconName } : cls));
      return createdClass.id;
    } catch (err) {
      setClasses(prev => prev.filter(cls => cls.id !== tempId));
      throw err;
    }
  };

  const updateClass = async (id: string, updates: Partial<Class>) => {
    if (!user) throw new Error('User not authenticated');
    try {
      const dbUpdates: Record<string, any> = {
        name: updates.name,
        color: updates.color,
        icon: updates.icon,
        grade: updates.grade,
        target_grade: updates.target_grade,
        grade_data: updates.grade_data,
        updated_at: new Date().toISOString()
      };
      Object.keys(dbUpdates).forEach((key: string) => { if (dbUpdates[key] === undefined) delete dbUpdates[key]; });
      await db.updateClass(id, dbUpdates);
      setClasses(prev => prev.map(cls => cls.id === id ? { ...cls, ...updates, updated_at: new Date().toISOString() } : cls));
      if (updates.color) {
        const colorMap = classes.reduce((acc, cls) => {
          if (cls.id && cls.color) acc[cls.id] = cls.id === id ? updates.color! : cls.color;
          return acc;
        }, {} as { [key: string]: string });
        Cookies.set('classColors', JSON.stringify(colorMap), { expires: 7 });
      }
    } catch (err) {
      throw err;
    }
  };

  const deleteClass = async (id: string) => {
    if (!user) throw new Error('User not authenticated');
    const classToDelete = classes.find(cls => cls.id === id);
    if (!classToDelete) return;
    try {
      setClasses(prev => prev.filter(cls => cls.id !== id));
      await db.deleteClass(id, user.id);
    } catch (err) {
      setClasses(prev => {
        if (!prev.some(cls => cls.id === id)) return [...prev, classToDelete];
        return prev;
      });
      throw err;
    }
  };

  const clearAllClasses = async () => {
    if (!user) throw new Error('User not authenticated');
    try {
      await db.deleteAllClasses(user.id);
    } catch (err) {
      throw err;
    }
  };

  const value = {
    classes,
    loading,
    error,
    addClass,
    updateClass,
    deleteClass,
    clearAllClasses,
  };

  return <ClassContext.Provider value={value}>{children}</ClassContext.Provider>;
};

export const useClassContext = () => {
  const context = useContext(ClassContext);
  if (context === undefined) throw new Error('useClassContext must be used within a ClassProvider');
  return context;
};