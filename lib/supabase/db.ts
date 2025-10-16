import { supabase } from './client';
import { Database } from '@/types/database.types';

type Tables = Database['public']['Tables'];
type ClassInsert = Tables['classes']['Insert'];
type ClassUpdate = Tables['classes']['Update'];
type HomeworkInsert = Tables['homework']['Insert'];
type HomeworkUpdate = Tables['homework']['Update'];

export const db = {
  // Class operations
  getClasses: async (userId: string) => {
    const { data, error } = await supabase
      .from('classes')
      .select('*')
      .eq('user_id', userId)
      .order('name', { ascending: true });
    
    if (error) throw error;
    return data || [];
  },

  getClass: async (classId: string, userId: string) => {
    const { data, error } = await supabase
      .from('classes')
      .select('*')
      .eq('id', classId)
      .eq('user_id', userId)
      .single();
    
    if (error) throw error;
    return data;
  },

  createClass: async (classData: ClassInsert) => {
    const { data, error } = await supabase
      .from('classes')
      .insert([{ ...classData }])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  updateClass: async (id: string, updates: ClassUpdate) => {
    const { data, error } = await supabase
      .from('classes')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  deleteClass: async (id: string, userId: string) => {
    // First, delete all homework for this class
    await supabase
      .from('homework')
      .delete()
      .eq('class_id', id)
      .eq('user_id', userId);
    
    // Then delete the class
    const { error } = await supabase
      .from('classes')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);
    
    if (error) throw error;
  },

  deleteAllClasses: async (userId: string) => {
    // First, delete all homework for all classes of this user
    await supabase
      .from('homework')
      .delete()
      .eq('user_id', userId);
    
    // Then delete all classes for this user
    const { error } = await supabase
      .from('classes')
      .delete()
      .eq('user_id', userId);
    
    if (error) throw error;
  },

  deleteAllHomeworks: async (userId: string) => {
    // Delete all homeworks for this user
    const { error } = await supabase
      .from('homework')
      .delete()
      .eq('user_id', userId);
    
    if (error) throw error;
  },

  // Homework operations
  getHomework: async (userId: string, filters: {
    classId?: string;
    completed?: boolean;
    dueAfter?: Date;
    dueBefore?: Date;
  } = {}) => {
    let query = supabase
      .from('homework')
      .select('*, classes(*)')
      .eq('user_id', userId);

    if (filters.classId) {
      query = query.eq('class_id', filters.classId);
    }
    
    if (filters.completed !== undefined) {
      query = query.eq('completed', filters.completed);
    }
    
    if (filters.dueAfter) {
      query = query.gte('due_date', filters.dueAfter.toISOString());
    }
    
    if (filters.dueBefore) {
      query = query.lte('due_date', filters.dueBefore.toISOString());
    }
    
    query = query.order('due_date', { ascending: true });
    
    const { data, error } = await query;
    
    if (error) throw error;
    return (data || []) as Database['public']['Tables']['homework']['Row'][]
  },

  getUpcomingHomework: async (userId: string, daysAhead = 7) => {
    const today = new Date();
    const futureDate = new Date();
    futureDate.setDate(today.getDate() + daysAhead);
    
    return db.getHomework(userId, {
      completed: false,
      dueAfter: today,
      dueBefore: futureDate
    });
  },

  createHomework: async (homeworkData: HomeworkInsert) => {
    const { data, error } = await supabase
      .from('homework')
      .insert([{ ...homeworkData }])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  updateHomework: async (id: string, updates: HomeworkUpdate) => {
    const { data, error } = await supabase
      .from('homework')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  deleteHomework: async (id: string, userId: string) => {
    const { error } = await supabase
      .from('homework')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);
    
    if (error) throw error;
  },

  toggleHomeworkComplete: async (id: string, userId: string, completed: boolean) => {
    const { data, error } = await supabase
      .from('homework')
      .update({ completed, updated_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Profile operations
  getProfile: async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) throw error;
    return data;
  },

  updateProfile: async (userId: string, updates: { full_name?: string; avatar_url?: string }) => {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }
};
