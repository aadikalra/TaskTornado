// This type is automatically generated and should not be edited manually.
// It represents the database schema and will be used for type safety.

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          full_name: string | null
          avatar_url: string | null
          updated_at: string | null
          created_at: string
          from_google: boolean
          email: string
        }
        Insert: {
          id: string
          full_name?: string | null
          avatar_url?: string | null
          updated_at?: string | null
          created_at?: string
          from_google?: boolean
          email?: string
        }
        Update: {
          id?: string
          full_name?: string | null
          avatar_url?: string | null
          updated_at?: string | null
          created_at?: string
          from_google?: boolean
          email?: string
        }
      }
      classes: {
        Row: {
          id: string
          user_id: string
          name: string
          color: string | null
          icon: string | null
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          color?: string | null
          icon?: string | null
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          color?: string | null
          icon?: string | null
          created_at?: string
          updated_at?: string | null
        }
      }
      flashcard_decks: {
        Row: {
          id: string
          user_id: string
          title: string
          description: string | null
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          description?: string | null
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          description?: string | null
          created_at?: string
          updated_at?: string | null
        }
      }
      flashcards: {
        Row: {
          id: string
          deck_id: string
          user_id: string
          question: string
          answer: string
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id?: string
          deck_id: string
          user_id: string
          question: string
          answer: string
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          deck_id?: string
          user_id?: string
          question?: string
          answer?: string
          created_at?: string
          updated_at?: string | null
        }
      },
      web_saves: {
        Row: {
          id: string;
          user_id: string;
          url: string;
          title: string | null;
          created_at: string;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          url: string;
          title?: string | null;
          created_at?: string;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          url?: string;
          title?: string | null;
          created_at?: string;
          updated_at?: string | null;
        };
      },
      study_groups: {
        Row: {
          id: string
          name: string
          description: string | null
          class_id: string | null
          created_by: string
          invite_code: string
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          class_id?: string | null
          created_by: string
          invite_code: string
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          class_id?: string | null
          created_by?: string
          invite_code?: string
          created_at?: string
          updated_at?: string | null
        }
      },
      study_group_members: {
        Row: {
          id: string
          group_id: string
          user_id: string
          is_admin: boolean
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id?: string
          group_id: string
          user_id: string
          is_admin?: boolean
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          group_id?: string
          user_id?: string
          is_admin?: boolean
          created_at?: string
          updated_at?: string | null
        }
      },
      group_messages: {
        Row: {
          id: string
          group_id: string
          user_id: string
          content: string
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id?: string
          group_id: string
          user_id: string
          content: string
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          group_id?: string
          user_id?: string
          content?: string
          created_at?: string
          updated_at?: string | null
        }
      },
      group_links: {
        Row: {
          id: string
          group_id: string
          user_id: string
          url: string
          title: string | null
          description: string | null
          image_url: string | null
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id?: string
          group_id: string
          user_id: string
          url: string
          title?: string | null
          description?: string | null
          image_url?: string | null
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          group_id?: string
          user_id?: string
          url?: string
          title?: string | null
          description?: string | null
          image_url?: string | null
          created_at?: string
          updated_at?: string | null
        }
      },
      homework: {
        Row: {
          id: string
          user_id: string
          class_id: string
          title: string
          description: string | null
          due_date: string
          priority: string
          completed: boolean
          pinned: boolean
          links: Json | null
          created_at: string
          updated_at: string | null
          recurring_id: string | null
          recurring_frequency: string | null
          recurring_end_date: string | null
          recurring_max_occurrences: number | null
          parent_recurring_id: string | null
          is_recurring_instance: boolean
        }
        Insert: {
          id?: string
          user_id: string
          class_id: string
          title: string
          description?: string | null
          due_date: string
          priority?: string
          completed?: boolean
          pinned?: boolean
          links?: Json | null
          created_at?: string
          updated_at?: string | null
          recurring_id?: string | null
          recurring_frequency?: string | null
          recurring_end_date?: string | null
          recurring_max_occurrences?: number | null
          parent_recurring_id?: string | null
          is_recurring_instance?: boolean
        }
        Update: {
          id?: string
          user_id?: string
          class_id?: string
          title?: string
          description?: string | null
          due_date?: string
          priority?: string
          completed?: boolean
          pinned?: boolean
          links?: Json | null
          created_at?: string
          updated_at?: string | null
          recurring_id?: string | null
          recurring_frequency?: string | null
          recurring_end_date?: string | null
          recurring_max_occurrences?: number | null
          parent_recurring_id?: string | null
          is_recurring_instance?: boolean
        }
      }
      tests: {
        Row: {
          id: string
          user_id: string
          class_id: string
          title: string
          description: string | null
          test_date: string
          test_time: string | null
          test_type: string
          weight: number | null
          location: string | null
          duration: number | null
          priority: string
          status: string
          score: number | null
          max_score: number | null
          grade: string | null
          study_materials: string[] | null
          notes: string | null
          completed_at: string | null
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          class_id: string
          title: string
          description?: string | null
          test_date: string
          test_time?: string | null
          test_type?: string
          weight?: number | null
          location?: string | null
          duration?: number | null
          priority?: string
          status?: string
          score?: number | null
          max_score?: number | null
          grade?: string | null
          study_materials?: string[] | null
          notes?: string | null
          completed_at?: string | null
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          class_id?: string
          title?: string
          description?: string | null
          test_date?: string
          test_time?: string | null
          test_type?: string
          weight?: number | null
          location?: string | null
          duration?: number | null
          priority?: string
          status?: string
          score?: number | null
          max_score?: number | null
          grade?: string | null
          study_materials?: string[] | null
          notes?: string | null
          completed_at?: string | null
          created_at?: string
          updated_at?: string | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// Helper types
export type HomeworkLink = {
  id: string;
  url: string;
  title?: string;
};

export type HomeworkWithClass = Database['public']['Tables']['homework']['Row'] & {
  classes: Database['public']['Tables']['classes']['Row'] | null;
};

export type ClassWithHomeworkCount = Database['public']['Tables']['classes']['Row'] & {
  homework_count: number;
  upcoming_due_date: string | null;
};

export type ClassWithTestCount = Database['public']['Tables']['classes']['Row'] & {
  test_count: number;
  upcoming_test_date: string | null;
};

export type TestWithClass = Database['public']['Tables']['tests']['Row'] & {
  classes: Database['public']['Tables']['classes']['Row'] | null;
};