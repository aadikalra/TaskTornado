import { sharedClasses, refreshClassroomData } from '@/lib/classroom';
import { supabase } from './client';
import { Database } from '@/types/database.types';
import { formatCalendarDate } from '@/lib/dateUtils';

type Tables = Database['public']['Tables'];
type ClassInsert = Tables['classes']['Insert'];
type ClassUpdate = Tables['classes']['Update'];
type HomeworkInsert = Tables['homework']['Insert'];
type HomeworkUpdate = Tables['homework']['Update'];
type TestInsert = Tables['tests']['Insert'];
type TestUpdate = Tables['tests']['Update'];

export const db = {
  // Class operations
  getClasses: async (userId: string) => {
    const { data, error } = await supabase
      .from('classes')
      .select('*')
      .eq('user_id', userId)
      .order('name', { ascending: true });

    if (error) throw error;
    const shared = await sharedClasses();
    const own = (data || []).map(cls => ({ ...cls, ...shared.find(item => item.id === cls.id), ...cls }));
    return [...own, ...shared.filter(cls => !own.some(item => item.id === cls.id))];
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
    const { error } = await supabase.rpc('classroom_delete_or_leave', { p_class_id: id });
    if (error) throw error;
    refreshClassroomData();
  },

  deleteAllClasses: async (userId: string) => {
    const classes = await db.getClasses(userId);
    for (const schoolClass of classes) await db.deleteClass(schoolClass.id, userId);
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
    const shared = await sharedClasses();
    let query = supabase.from('homework').select('*');
    query = shared.length ? query.or(`user_id.eq.${userId},class_id.in.(${shared.map(cls => cls.id).join(',')})`) : query.eq('user_id', userId);

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

  updateHomework: async (id: string, updates: HomeworkUpdate, expectedSubtasks?: HomeworkUpdate['subtasks']) => {
    if (expectedSubtasks !== undefined) {
      const { data, error } = await supabase.rpc('classroom_update_homework', { p_id: id, p_changes: updates, p_before: expectedSubtasks });
      if (error) throw error;
      return data as unknown as Tables['homework']['Row'];
    }
    const { data, error } = await supabase.from('homework').update(updates).eq('id', id).select().single();
    if (error) throw error;
    return data;
  },

  deleteHomework: async (id: string, userId: string) => {
    const { error } = await supabase
      .from('homework')
      .delete()
      .eq('id', id).select('id').single();

    if (error) throw error;
  },

  toggleHomeworkComplete: async (id: string, userId: string, completed: boolean) => {
    const { data, error } = await supabase
      .from('homework')
      .update({ completed, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Test operations
  getTests: async (userId: string, filters: {
    classId?: string;
    status?: string;
    testDateAfter?: Date;
    testDateBefore?: Date;
  } = {}) => {
    let query = supabase
      .from('tests')
      .select('*, classes(*)')
      .eq('user_id', userId);

    if (filters.classId) {
      query = query.eq('class_id', filters.classId);
    }

    if (filters.status) {
      query = query.eq('status', filters.status);
    }

    if (filters.testDateAfter) {
      query = query.gte('test_date', formatCalendarDate(filters.testDateAfter));
    }

    if (filters.testDateBefore) {
      query = query.lte('test_date', formatCalendarDate(filters.testDateBefore));
    }

    query = query.order('test_date', { ascending: true });

    const { data, error } = await query;

    if (error) throw error;
    const { data: sharedData, error: sharedError } = await supabase.rpc('classroom_tests');
    if (sharedError) throw sharedError;
    const shared = (sharedData ?? []) as unknown as Tables['tests']['Row'][];
    let result = [...(data || []).filter(test => !shared.some(item => item.id === test.id)), ...shared];
    if (filters.classId) result = result.filter(test => test.class_id === filters.classId);
    if (filters.status) result = result.filter(test => test.status === filters.status);
    if (filters.testDateAfter) result = result.filter(test => test.test_date >= formatCalendarDate(filters.testDateAfter!));
    if (filters.testDateBefore) result = result.filter(test => test.test_date <= formatCalendarDate(filters.testDateBefore!));
    return result.sort((a, b) => a.test_date.localeCompare(b.test_date));
  },

  getUpcomingTests: async (userId: string, daysAhead = 30) => {
    const today = new Date();
    const futureDate = new Date();
    futureDate.setDate(today.getDate() + daysAhead);

    return db.getTests(userId, {
      status: 'upcoming',
      testDateAfter: today,
      testDateBefore: futureDate
    });
  },

  createTest: async (testData: TestInsert) => {
    const { data, error } = await supabase.rpc('classroom_write_test', { p_id: null, p_data: testData });
    if (error) throw error;
    return data as unknown as Tables['tests']['Row'];
  },

  updateTest: async (id: string, updates: TestUpdate) => {
    const { data, error } = await supabase.rpc('classroom_write_test', { p_id: id, p_data: updates });
    if (error) throw error;
    return data as unknown as Tables['tests']['Row'];
  },

  deleteTest: async (id: string, _userId: string) => {
    const { error } = await supabase.rpc('classroom_write_test', { p_id: id, p_data: {}, p_delete: true });
    if (error) throw error;
  },

  // User profile operations — uses the profiles table (RLS-safe) and
  // supabase.auth.getUser() instead of admin endpoints that require the
  // service-role key.
  getUserProfile: async (userId: string) => {
    // 1. Read the profile row (respects RLS — users can only read their own)
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (profileError) throw profileError;

    // 2. Get auth metadata for the currently logged-in user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError) throw authError;

    return {
      id: profile.id,
      email: profile.email ?? user?.email,
      full_name: profile.full_name ?? user?.user_metadata?.full_name ?? user?.user_metadata?.name,
      avatar_url: user?.user_metadata?.avatar_url ?? user?.user_metadata?.picture ?? null,
      created_at: user?.created_at ?? null,
      last_sign_in_at: user?.last_sign_in_at ?? null,
      email_confirmed_at: user?.email_confirmed_at ?? null,
      is_google_user: user?.app_metadata?.provider === 'google',
    };
  },

  updateUserProfile: async (_userId: string, updates: { full_name?: string; avatar_url?: string }) => {
    // Update the current user's auth metadata (works with the anon key)
    const { data, error } = await supabase.auth.updateUser({
      data: updates,
    });

    if (error) throw error;
    return data.user;
  }
};
