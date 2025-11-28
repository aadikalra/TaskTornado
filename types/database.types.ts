export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      classes: {
        Row: {
          color: string | null
          created_at: string
          icon: string | null
          id: string
          name: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          icon?: string | null
          id?: string
          name: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          color?: string | null
          created_at?: string
          icon?: string | null
          id?: string
          name?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      classroom_courses: {
        Row: {
          course_state: string
          created_at: string | null
          description: string | null
          google_course_id: string
          id: string
          name: string
          owner_id: string
          room: string | null
          section: string | null
          synced_at: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          course_state?: string
          created_at?: string | null
          description?: string | null
          google_course_id: string
          id?: string
          name: string
          owner_id: string
          room?: string | null
          section?: string | null
          synced_at?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          course_state?: string
          created_at?: string | null
          description?: string | null
          google_course_id?: string
          id?: string
          name?: string
          owner_id?: string
          room?: string | null
          section?: string | null
          synced_at?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      classroom_coursework: {
        Row: {
          course_id: string
          created_at: string | null
          description: string | null
          due_date: string | null
          due_time: string | null
          google_course_id: string
          google_coursework_id: string
          id: string
          last_synced: string | null
          max_points: number | null
          state: string
          title: string
          updated_at: string | null
          user_id: string
          work_type: string
        }
        Insert: {
          course_id: string
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          due_time?: string | null
          google_course_id: string
          google_coursework_id: string
          id?: string
          last_synced?: string | null
          max_points?: number | null
          state?: string
          title: string
          updated_at?: string | null
          user_id: string
          work_type: string
        }
        Update: {
          course_id?: string
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          due_time?: string | null
          google_course_id?: string
          google_coursework_id?: string
          id?: string
          last_synced?: string | null
          max_points?: number | null
          state?: string
          title?: string
          updated_at?: string | null
          user_id?: string
          work_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "classroom_coursework_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "classroom_courses"
            referencedColumns: ["id"]
          },
        ]
      }
      classroom_submissions: {
        Row: {
          assigned_grade: number | null
          coursework_id: string
          created_at: string | null
          creation_time: string | null
          google_submission_id: string | null
          grade: number | null
          id: string
          last_synced: string | null
          state: string
          update_time: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          assigned_grade?: number | null
          coursework_id: string
          created_at?: string | null
          creation_time?: string | null
          google_submission_id?: string | null
          grade?: number | null
          id?: string
          last_synced?: string | null
          state?: string
          update_time?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          assigned_grade?: number | null
          coursework_id?: string
          created_at?: string | null
          creation_time?: string | null
          google_submission_id?: string | null
          grade?: number | null
          id?: string
          last_synced?: string | null
          state?: string
          update_time?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "classroom_submissions_coursework_id_fkey"
            columns: ["coursework_id"]
            isOneToOne: false
            referencedRelation: "classroom_coursework"
            referencedColumns: ["id"]
          },
        ]
      }
      classroom_sync_settings: {
        Row: {
          access_token_encrypted: string | null
          auto_sync_enabled: boolean | null
          created_at: string | null
          id: string
          last_sync_at: string | null
          last_sync_error: string | null
          refresh_token_encrypted: string | null
          selected_course_ids: string[] | null
          sync_frequency_minutes: number | null
          token_expires_at: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          access_token_encrypted?: string | null
          auto_sync_enabled?: boolean | null
          created_at?: string | null
          id?: string
          last_sync_at?: string | null
          last_sync_error?: string | null
          refresh_token_encrypted?: string | null
          selected_course_ids?: string[] | null
          sync_frequency_minutes?: number | null
          token_expires_at?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          access_token_encrypted?: string | null
          auto_sync_enabled?: boolean | null
          created_at?: string | null
          id?: string
          last_sync_at?: string | null
          last_sync_error?: string | null
          refresh_token_encrypted?: string | null
          selected_course_ids?: string[] | null
          sync_frequency_minutes?: number | null
          token_expires_at?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      discussion_board_members: {
        Row: {
          board_id: string
          id: string
          joined_at: string | null
          user_id: string
        }
        Insert: {
          board_id: string
          id?: string
          joined_at?: string | null
          user_id: string
        }
        Update: {
          board_id?: string
          id?: string
          joined_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "discussion_board_members_board_id_fkey"
            columns: ["board_id"]
            isOneToOne: false
            referencedRelation: "discussion_boards"
            referencedColumns: ["id"]
          },
        ]
      }
      discussion_boards: {
        Row: {
          class_id: string | null
          created_at: string | null
          created_by: string
          description: string | null
          id: string
          member_count: number | null
          name: string
          thread_count: number | null
          updated_at: string | null
        }
        Insert: {
          class_id?: string | null
          created_at?: string | null
          created_by: string
          description?: string | null
          id?: string
          member_count?: number | null
          name: string
          thread_count?: number | null
          updated_at?: string | null
        }
        Update: {
          class_id?: string | null
          created_at?: string | null
          created_by?: string
          description?: string | null
          id?: string
          member_count?: number | null
          name?: string
          thread_count?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "discussion_boards_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
        ]
      }
      discussion_post_upvotes: {
        Row: {
          created_at: string | null
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "discussion_post_upvotes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "discussion_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      discussion_posts: {
        Row: {
          content: string
          created_at: string | null
          id: string
          is_answer: boolean | null
          thread_id: string
          updated_at: string | null
          upvotes: number | null
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          is_answer?: boolean | null
          thread_id: string
          updated_at?: string | null
          upvotes?: number | null
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          is_answer?: boolean | null
          thread_id?: string
          updated_at?: string | null
          upvotes?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "discussion_posts_thread_id_fkey"
            columns: ["thread_id"]
            isOneToOne: false
            referencedRelation: "discussion_threads"
            referencedColumns: ["id"]
          },
        ]
      }
      discussion_resource_upvotes: {
        Row: {
          created_at: string | null
          id: string
          resource_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          resource_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          resource_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "discussion_resource_upvotes_resource_id_fkey"
            columns: ["resource_id"]
            isOneToOne: false
            referencedRelation: "discussion_resources"
            referencedColumns: ["id"]
          },
        ]
      }
      discussion_resources: {
        Row: {
          board_id: string
          created_at: string | null
          description: string | null
          file_path: string | null
          id: string
          resource_type: string | null
          tags: string[] | null
          title: string
          updated_at: string | null
          upvotes: number | null
          url: string | null
          user_id: string
        }
        Insert: {
          board_id: string
          created_at?: string | null
          description?: string | null
          file_path?: string | null
          id?: string
          resource_type?: string | null
          tags?: string[] | null
          title: string
          updated_at?: string | null
          upvotes?: number | null
          url?: string | null
          user_id: string
        }
        Update: {
          board_id?: string
          created_at?: string | null
          description?: string | null
          file_path?: string | null
          id?: string
          resource_type?: string | null
          tags?: string[] | null
          title?: string
          updated_at?: string | null
          upvotes?: number | null
          url?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "discussion_resources_board_id_fkey"
            columns: ["board_id"]
            isOneToOne: false
            referencedRelation: "discussion_boards"
            referencedColumns: ["id"]
          },
        ]
      }
      discussion_threads: {
        Row: {
          board_id: string
          content: string
          created_at: string | null
          id: string
          is_pinned: boolean | null
          is_resolved: boolean | null
          tags: string[] | null
          title: string
          updated_at: string | null
          user_id: string
          view_count: number | null
        }
        Insert: {
          board_id: string
          content: string
          created_at?: string | null
          id?: string
          is_pinned?: boolean | null
          is_resolved?: boolean | null
          tags?: string[] | null
          title: string
          updated_at?: string | null
          user_id: string
          view_count?: number | null
        }
        Update: {
          board_id?: string
          content?: string
          created_at?: string | null
          id?: string
          is_pinned?: boolean | null
          is_resolved?: boolean | null
          tags?: string[] | null
          title?: string
          updated_at?: string | null
          user_id?: string
          view_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "discussion_threads_board_id_fkey"
            columns: ["board_id"]
            isOneToOne: false
            referencedRelation: "discussion_boards"
            referencedColumns: ["id"]
          },
        ]
      }
      flashcard_decks: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      flashcards: {
        Row: {
          answer: string
          created_at: string | null
          deck_id: string
          id: string
          question: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          answer: string
          created_at?: string | null
          deck_id: string
          id?: string
          question: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          answer?: string
          created_at?: string | null
          deck_id?: string
          id?: string
          question?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "flashcards_deck_id_fkey"
            columns: ["deck_id"]
            isOneToOne: false
            referencedRelation: "flashcard_decks"
            referencedColumns: ["id"]
          },
        ]
      }
      group_links: {
        Row: {
          created_at: string
          description: string | null
          full_name: string
          group_id: string
          id: string
          image_url: string | null
          title: string | null
          url: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          full_name: string
          group_id: string
          id?: string
          image_url?: string | null
          title?: string | null
          url: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          full_name?: string
          group_id?: string
          id?: string
          image_url?: string | null
          title?: string | null
          url?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "group_links_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "group_details"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "group_links_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "study_groups"
            referencedColumns: ["id"]
          },
        ]
      }
      group_members: {
        Row: {
          group_id: string
          joined_at: string | null
          role: string
          user_id: string
        }
        Insert: {
          group_id: string
          joined_at?: string | null
          role?: string
          user_id: string
        }
        Update: {
          group_id?: string
          joined_at?: string | null
          role?: string
          user_id?: string
        }
        Relationships: []
      }
      group_messages: {
        Row: {
          content: string
          created_at: string
          full_name: string
          group_id: string
          id: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          content: string
          created_at?: string
          full_name: string
          group_id: string
          id?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          content?: string
          created_at?: string
          full_name?: string
          group_id?: string
          id?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "group_messages_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "group_details"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "group_messages_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "study_groups"
            referencedColumns: ["id"]
          },
        ]
      }
      homework: {
        Row: {
          class_id: string
          completed: boolean | null
          created_at: string
          description: string | null
          due_date: string
          id: string
          is_recurring_instance: boolean | null
          links: Database["public"]["CompositeTypes"]["homework_link"][] | null
          parent_recurring_id: string | null
          pinned: boolean
          priority: string
          recurring_end_date: string | null
          recurring_frequency: string | null
          recurring_id: string | null
          recurring_max_occurrences: number | null
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          class_id: string
          completed?: boolean | null
          created_at?: string
          description?: string | null
          due_date: string
          id?: string
          is_recurring_instance?: boolean | null
          links?: Database["public"]["CompositeTypes"]["homework_link"][] | null
          parent_recurring_id?: string | null
          pinned?: boolean
          priority?: string
          recurring_end_date?: string | null
          recurring_frequency?: string | null
          recurring_id?: string | null
          recurring_max_occurrences?: number | null
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          class_id?: string
          completed?: boolean | null
          created_at?: string
          description?: string | null
          due_date?: string
          id?: string
          is_recurring_instance?: boolean | null
          links?: Database["public"]["CompositeTypes"]["homework_link"][] | null
          parent_recurring_id?: string | null
          pinned?: boolean
          priority?: string
          recurring_end_date?: string | null
          recurring_frequency?: string | null
          recurring_id?: string | null
          recurring_max_occurrences?: number | null
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "homework_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string
          from_google: boolean | null
          full_name: string | null
          id: string
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email: string
          from_google?: boolean | null
          full_name?: string | null
          id: string
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          from_google?: boolean | null
          full_name?: string | null
          id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      rate_limits: {
        Row: {
          created_at: string | null
          id: string
          last_request: string | null
          model_type: string
          request_count: number | null
          request_date: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          last_request?: string | null
          model_type?: string
          request_count?: number | null
          request_date?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          last_request?: string | null
          model_type?: string
          request_count?: number | null
          request_date?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      study_group_members: {
        Row: {
          group_id: string
          id: string
          is_admin: boolean
          joined_at: string
          user_id: string
        }
        Insert: {
          group_id: string
          id?: string
          is_admin?: boolean
          joined_at?: string
          user_id: string
        }
        Update: {
          group_id?: string
          id?: string
          is_admin?: boolean
          joined_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "study_group_members_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "group_details"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "study_group_members_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "study_groups"
            referencedColumns: ["id"]
          },
        ]
      }
      study_groups: {
        Row: {
          class_id: string | null
          created_at: string
          created_by: string
          description: string | null
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          class_id?: string | null
          created_at?: string
          created_by: string
          description?: string | null
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          class_id?: string | null
          created_at?: string
          created_by?: string
          description?: string | null
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "study_groups_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
        ]
      }
      tests: {
        Row: {
          class_id: string
          completed_at: string | null
          created_at: string | null
          description: string | null
          duration: number | null
          grade: string | null
          id: string
          location: string | null
          max_score: number | null
          notes: string | null
          priority: string | null
          score: number | null
          status: string | null
          study_materials: string[] | null
          test_date: string
          test_time: string | null
          test_type: string | null
          title: string
          updated_at: string | null
          user_id: string
          weight: number | null
        }
        Insert: {
          class_id: string
          completed_at?: string | null
          created_at?: string | null
          description?: string | null
          duration?: number | null
          grade?: string | null
          id?: string
          location?: string | null
          max_score?: number | null
          notes?: string | null
          priority?: string | null
          score?: number | null
          status?: string | null
          study_materials?: string[] | null
          test_date: string
          test_time?: string | null
          test_type?: string | null
          title: string
          updated_at?: string | null
          user_id: string
          weight?: number | null
        }
        Update: {
          class_id?: string
          completed_at?: string | null
          created_at?: string | null
          description?: string | null
          duration?: number | null
          grade?: string | null
          id?: string
          location?: string | null
          max_score?: number | null
          notes?: string | null
          priority?: string | null
          score?: number | null
          status?: string | null
          study_materials?: string[] | null
          test_date?: string
          test_time?: string | null
          test_type?: string | null
          title?: string
          updated_at?: string | null
          user_id?: string
          weight?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "tests_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
        ]
      }
      web_saves: {
        Row: {
          created_at: string | null
          id: string
          title: string | null
          updated_at: string | null
          url: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          title?: string | null
          updated_at?: string | null
          url: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          title?: string | null
          updated_at?: string | null
          url?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      group_details: {
        Row: {
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string | null
          member_count: number | null
          name: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string | null
          member_count?: never
          name?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string | null
          member_count?: never
          name?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      check_rate_limit: {
        Args: { p_limit?: number; p_user_id: string }
        Returns: boolean
      }
      create_flashcard_deck_with_cards: {
        Args: {
          p_description: string
          p_flashcards: Json
          p_title: string
          p_user_id: string
        }
        Returns: Json
      }
      get_group_member_count: {
        Args: { group_id_param: string }
        Returns: number
      }
      get_rate_limit_by_model: {
        Args: { p_model_type: string; p_user_id: string }
        Returns: number
      }
      get_recent_group_links: {
        Args: { group_id_param: string; limit_count?: number }
        Returns: {
          avatar_url: string
          created_at: string
          description: string
          id: string
          image_url: string
          title: string
          url: string
          user_id: string
          username: string
        }[]
      }
      get_recent_group_messages: {
        Args: { group_id_param: string; limit_count?: number }
        Returns: {
          avatar_url: string
          content: string
          created_at: string
          id: string
          user_id: string
          username: string
        }[]
      }
      get_user_groups: {
        Args: never
        Returns: {
          created_at: string
          created_by: string
          description: string
          id: number
          is_creator: boolean
          name: string
        }[]
      }
      increment_rate_limit: { Args: { p_user_id: string }; Returns: number }
      is_group_admin: {
        Args: { group_id_param: string; user_id_param: string }
        Returns: boolean
      }
      is_group_member: {
        Args: { group_id_param: string; user_id_param: string }
        Returns: boolean
      }
      reset_daily_rate_limits: {
        Args: { p_user_id: string }
        Returns: undefined
      }
      update_rate_limit_by_model: {
        Args: { p_count: number; p_model_type: string; p_user_id: string }
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      homework_link: {
        id: string | null
        url: string | null
        title: string | null
      }
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
