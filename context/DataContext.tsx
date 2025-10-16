'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useAuth } from './';
import { db } from '@/lib/supabase/db';
import { Database } from '@/types/database.types';

type Class = Database['public']['Tables']['classes']['Row'];
type Homework = Database['public']['Tables']['homework']['Row'];
type Priority = 'low' | 'medium' | 'high';

type DataContextType = {
  classes: Class[];
  homework: Homework[];
  loading: boolean;
  error: string | null;
  addClass: (classData: Omit<Class, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateClass: (id: string, updates: Partial<Class>) => Promise<void>;
  deleteClass: (id: string) => Promise<void>;
  addHomework: (homeworkData: Omit<Homework, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateHomework: (id: string, updates: Partial<Homework>) => Promise<void>;
  toggleHomeworkComplete: (id: string, completed: boolean) => Promise<void>;
  deleteHomework: (id: string) => Promise<void>;
  refreshData: () => Promise<void>;
};

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [classes, setClasses] = useState<Class[]>([]);
  const [homework, setHomework] = useState<Homework[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    if (!user) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Fetch classes and homework in parallel
      const [classesData, homeworkData] = await Promise.all([
        db.getClasses(user.id),
        db.getHomework(user.id, { completed: false })
      ]);
      
      setClasses(classesData);
      setHomework(homeworkData);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchData();
    } else {
      setClasses([]);
      setHomework([]);
      setLoading(false);
    }
  }, [user]);

  // Class operations
  const addClass = async (classData: Omit<Class, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!user) throw new Error('User not authenticated');
    
    try {
      const newClass = await db.createClass({
        ...classData,
        user_id: user.id
      });
      
      setClasses(prev => [...prev, newClass]);
    } catch (err) {
      console.error('Error adding class:', err);
      throw err;
    }
  };

  const updateClass = async (id: string, updates: Partial<Class>) => {
    if (!user) throw new Error('User not authenticated');
    
    try {
      const updatedClass = await db.updateClass(id, {
        ...updates,
        updated_at: new Date().toISOString()
      });
      
      setClasses(prev => 
        prev.map(cls => (cls.id === id ? { ...cls, ...updatedClass } : cls))
      );
    } catch (err) {
      console.error('Error updating class:', err);
      throw err;
    }
  };

  const deleteClass = async (id: string) => {
    if (!user) throw new Error('User not authenticated');
    
    try {
      await db.deleteClass(id, user.id);
      setClasses(prev => prev.filter(cls => cls.id !== id));
      // Also remove any homework associated with this class
      setHomework(prev => prev.filter(hw => hw.class_id !== id));
    } catch (err) {
      console.error('Error deleting class:', err);
      throw err;
    }
  };

  // Homework operations
  const addHomework = async (homeworkData: Omit<Homework, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!user) throw new Error('User not authenticated');
    
    try {
      const newHomework = await db.createHomework({
        ...homeworkData,
        user_id: user.id,
        completed: false
      });
      
      setHomework(prev => [...prev, newHomework]);
    } catch (err) {
      console.error('Error adding homework:', err);
      throw err;
    }
  };

  const updateHomework = async (id: string, updates: Partial<Homework>) => {
    if (!user) throw new Error('User not authenticated');
    
    try {
      const updatedHomework = await db.updateHomework(id, {
        ...updates,
        updated_at: new Date().toISOString()
      });
      
      setHomework(prev => 
        prev.map(hw => (hw.id === id ? { ...hw, ...updatedHomework } : hw))
      );
    } catch (err) {
      console.error('Error updating homework:', err);
      throw err;
    }
  };

  const toggleHomeworkComplete = async (id: string, completed: boolean) => {
    if (!user) throw new Error('User not authenticated');
    
    try {
      const updatedHomework = await db.toggleHomeworkComplete(id, user.id, completed);
      
      setHomework(prev => 
        prev.map(hw => (hw.id === id ? { ...hw, ...updatedHomework } : hw))
      );
    } catch (err) {
      console.error('Error toggling homework completion:', err);
      throw err;
    }
  };

  const deleteHomework = async (id: string) => {
    if (!user) return;
    
    try {
      await db.deleteHomework(id, user.id);
      setHomework(prev => prev.filter(hw => hw.id !== id));
    } catch (err) {
      console.error('Error deleting homework:', err);
      throw err;
    }
  };

  const value = {
    classes,
    homework,
    loading,
    error,
    addClass,
    updateClass,
    deleteClass,
    addHomework,
    updateHomework,
    toggleHomeworkComplete,
    deleteHomework,
    refreshData: fetchData
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
