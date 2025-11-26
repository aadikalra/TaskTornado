'use client';

import { useRouter } from 'next/navigation';
import { Session, User } from '@supabase/supabase-js';
import { useState, useEffect, useContext, createContext, ReactNode } from 'react';
import { supabase } from '@/lib/supabase/client';
import { ClassroomDatabaseService } from '@/lib/database/classroomService';

type AuthContextType = {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signOut: () => Promise<void>;
  full_name: string | null;
  isGoogleUser: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);
// Helper function to save courses to database, avoiding duplicates
async function saveCoursesToDatabase(userId: string, formattedData: any[]) {
  try {
    const dbService = new ClassroomDatabaseService();

    // Get existing courses for this user
    const existingCourses = await dbService.getUserCourses(userId);
    const existingCourseNames = new Set(existingCourses.map(course => course.name));

    let savedCount = 0;

    // Save each course if it doesn't already exist by name
    for (const item of formattedData) {
      const course = item.course;

      // Skip if course with same name already exists
      if (existingCourseNames.has(course.name)) {
        console.log(`⏭️  Skipping course "${course.name}" - already exists in database`);
        continue;
      }

      // Save the course
      const courseData = {
        user_id: userId,
        google_course_id: course.id,
        name: course.name,
        section: course.section,
        description: course.description,
        owner_id: course.id, // Using course ID as owner for now
        course_state: 'ACTIVE',
        synced_at: new Date().toISOString(),
      };

      await dbService.saveCourse(courseData);
      savedCount++;
      console.log(`✅ Saved course "${course.name}" to database`);
    }

    if (savedCount > 0) {
      console.log(`Successfully saved ${savedCount} new courses to database`);
    } else {
      console.log('ℹ️  No new courses to save - all courses already exist');
    }
  } catch (error) {
    console.error('Error saving courses to database:', error);
  }
}

async function checkGoogleUserAndLogClassroom(userId: string) {
  try {
    // Check if user is from Google
    const { data: profile } = await supabase
      .from('profiles')
      .select('from_google')
      .eq('id', userId)
      .single();

    if (profile?.from_google) {
      console.log('🎓 User is from Google - Fetching Google Classroom data...');

      // Call server-side API to fetch Google Classroom data
      try {
        const response = await fetch('/api/classroom/debug-log', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ userId }),
        });

        if (response.ok) {
          const data = await response.json();
          console.log('📚 Google Classroom Data:');
          console.table(data.formattedData);
          console.log('✅ Successfully fetched Google Classroom data for Google user');

          // Also save courses to database if they don't already exist
          await saveCoursesToDatabase(userId, data.formattedData);
        } else {
          console.error('Failed to fetch Google Classroom data:', await response.text());
        }
      } catch (error) {
        console.error('Error calling Google Classroom debug API:', error);
      }
    }
  } catch (error) {
    console.error('Error checking Google user or fetching Classroom data:', error);
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [full_name, setFullName] = useState<string | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setFullName(session?.user?.user_metadata?.full_name ?? null);
      setLoading(false);

      if (session?.user) {
        checkGoogleUserAndLogClassroom(session.user.id);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string, rememberMe = false) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('remember-me', rememberMe ? 'true' : 'false');
    }
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
  };

  const signUp = async (email: string, password: string, name: string): Promise<void> => {
    try {
      // First check if a profile already exists for this email
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', email)
        .single();

      if (existingProfile) {
        // Profile already exists - this usually means an account already exists
        const customError = new Error('An account with this email already exists. Please try signing in instead, or contact support if you believe this is an error.');
        throw customError;
      }

      // No existing profile, proceed with normal signup
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
          },
        },
      });

      if (error) throw error;
    } catch (error: any) {
      // Handle the specific case where a profile already exists for this email
      if (error.message?.includes('duplicate key value violates unique constraint') ||
        error.message?.includes('profiles_email_unique')) {

        // This usually means a profile exists but the auth user was deleted
        // Provide a helpful error message to the user
        const customError = new Error('An account with this email already exists. Please try signing in instead, or contact support if you believe this is an error.');
        throw customError;
      }

      // For other errors, just re-throw them
      throw error;
    }
  };

  const signOut = async () => {
    // Sign out from Supabase
    await supabase.auth.signOut();
  };

  const value = {
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut,
    full_name,
    isGoogleUser: user?.user_metadata?.provider === 'google' || false,
  };

  return (
    <AuthContext.Provider value={value}>
      {loading ? (
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
