// lib/database/classroomService.ts
import { supabase } from '@/lib/supabase/client';

export interface ClassroomCourseRecord {
  id?: string;
  user_id: string;
  google_course_id: string;
  name: string;
  section?: string | null;
  description?: string | null;
  room?: string | null;
  owner_id: string;
  course_state: string;
  synced_at: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface ClassroomCourseworkRecord {
  id?: string;
  user_id: string;
  course_id: string;
  google_coursework_id: string;
  google_course_id: string;
  title: string;
  description?: string | null;
  state: string;
  work_type: string;
  max_points?: number | null;
  due_date?: string | null;
  due_time?: string | null;
  last_synced: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface ClassroomSubmissionRecord {
  id?: string;
  user_id: string;
  coursework_id: string;
  google_submission_id?: string | null;
  state: string;
  grade?: number | null;
  assigned_grade?: number | null;
  creation_time?: string | null;
  update_time?: string | null;
  last_synced: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export class ClassroomDatabaseService {
  private supabase = supabase;

  async saveCourse(course: ClassroomCourseRecord): Promise<ClassroomCourseRecord> {
    const { data, error } = await this.supabase
      .from('classroom_courses')
      .upsert(course, {
        onConflict: 'user_id,google_course_id',
        ignoreDuplicates: false
      })
      .select()
      .single();

    if (error) {
      console.error('Error saving course:', error);
      throw new Error(`Failed to save course: ${error.message}`);
    }

    return data;
  }

  async saveCoursework(coursework: ClassroomCourseworkRecord): Promise<ClassroomCourseworkRecord> {
    const { data, error } = await this.supabase
      .from('classroom_coursework')
      .upsert(coursework, {
        onConflict: 'user_id,google_coursework_id',
        ignoreDuplicates: false
      })
      .select()
      .single();

    if (error) {
      console.error('Error saving coursework:', error);
      throw new Error(`Failed to save coursework: ${error.message}`);
    }

    return data;
  }

  async saveSubmission(submission: ClassroomSubmissionRecord): Promise<ClassroomSubmissionRecord> {
    const { data, error } = await this.supabase
      .from('classroom_submissions')
      .upsert(submission, {
        onConflict: 'user_id,coursework_id',
        ignoreDuplicates: false
      })
      .select()
      .single();

    if (error) {
      console.error('Error saving submission:', error);
      throw new Error(`Failed to save submission: ${error.message}`);
    }

    return data;
  }

  async getUserCourses(userId: string): Promise<ClassroomCourseRecord[]> {
    const { data, error } = await this.supabase
      .from('classroom_courses')
      .select('*')
      .eq('user_id', userId)
      .eq('course_state', 'ACTIVE')
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Error fetching courses:', error);
      throw new Error(`Failed to fetch courses: ${error.message}`);
    }

    return data || [];
  }

  async getCourseworkByCourse(courseId: string): Promise<ClassroomCourseworkRecord[]> {
    const { data, error } = await this.supabase
      .from('classroom_coursework')
      .select('*')
      .eq('course_id', courseId)
      .eq('state', 'PUBLISHED')
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Error fetching coursework:', error);
      throw new Error(`Failed to fetch coursework: ${error.message}`);
    }

    return data || [];
  }

  async saveSyncSettings(userId: string, settings: {
    auto_sync_enabled?: boolean;
    sync_frequency_minutes?: number;
    selected_course_ids?: string[];
    access_token_encrypted?: string;
    refresh_token_encrypted?: string;
    token_expires_at?: string;
    last_sync_at?: string;
  }) {
    const { data, error } = await this.supabase
      .from('classroom_sync_settings')
      .upsert({
        user_id: userId,
        ...settings,
        last_sync_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id',
        ignoreDuplicates: false
      })
      .select()
      .single();

    if (error) {
      console.error('Error saving sync settings:', error);
      throw new Error(`Failed to save sync settings: ${error.message}`);
    }

    return data;
  }

  async getSyncSettings(userId: string) {
    const { data, error } = await this.supabase
      .from('classroom_sync_settings')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') { // Not found error is OK
      console.error('Error fetching sync settings:', error);
      throw new Error(`Failed to fetch sync settings: ${error.message}`);
    }

    return data;
  }
}
