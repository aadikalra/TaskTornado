'use client';

import { useRouter } from 'next/navigation';
import { Session, User } from '@supabase/supabase-js';
import { useState, useEffect, useContext, createContext, ReactNode } from 'react';
import { supabase } from '@/lib/supabase/client';

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
// Helper function to save courses and assignments to database, avoiding duplicates
async function saveCoursesToDatabase(userId: string, formattedData: any[]) {
  try {
    // Use the main database service for classes and homework
    const { db } = await import('@/lib/supabase/db');

    // Get existing courses for this user
    const existingCourses = await db.getClasses(userId);
    const existingCourseNames = new Set(existingCourses.map(course => course.name));

    // Get existing homework for this user to avoid duplicates
    const existingHomework = await db.getHomework(userId);
    const existingHomeworkTitles = new Set(existingHomework.map(hw => hw.title));

    let savedCoursesCount = 0;
    let savedHomeworkCount = 0;

    // Save each course and its assignments
    for (const item of formattedData) {
      const course = item.course;
      let classId: string | null = null;

      // Save the course to the main classes table if it doesn't exist
      if (!existingCourseNames.has(course.name)) {
        const courseData = {
          user_id: userId,
          name: course.name,
          // Use icon to indicate Google Classroom origin
          icon: '📚', // Book icon for Google Classroom courses
          color: '#4285F4', // Google blue color
        };

        const savedCourse = await db.createClass(courseData);
        classId = savedCourse.id;
        savedCoursesCount++;
        console.log(`✅ Saved Google Classroom course "${course.name}" to main classes database`);
      } else {
        // Find the existing course ID
        const existingCourse = existingCourses.find(c => c.name === course.name);
        classId = existingCourse?.id || null;
      }

      // Save assignments for this course if we have a class ID
      if (classId && item.assignments && item.assignments.length > 0) {
        for (const assignment of item.assignments) {
          // Skip if homework with same title already exists
          if (existingHomeworkTitles.has(assignment.title)) {
            console.log(`⏭️  Skipping assignment "${assignment.title}" - already exists in database`);
            continue;
          }

          // Convert Google Classroom assignment to homework format
          let dueDate: string;

          // Handle different due date formats from Google Classroom
          if (assignment.dueDate) {
            if (typeof assignment.dueDate === 'string') {
              dueDate = assignment.dueDate;
            } else if (typeof assignment.dueDate === 'object' && assignment.dueDate.year) {
              // Convert date object to ISO string
              const date = new Date(assignment.dueDate.year, assignment.dueDate.month - 1, assignment.dueDate.day);
              dueDate = date.toISOString().split('T')[0]; // Format as YYYY-MM-DD
            } else {
              // Default to 1 week from now
              dueDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
            }
          } else {
            // Default to 1 week from now
            dueDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
          }

          const homeworkData = {
            user_id: userId,
            class_id: classId,
            title: assignment.title,
            description: assignment.description || null,
            due_date: dueDate,
            completed: false,
            pinned: false,
            priority: 'medium', // Default priority
          };

          await db.createHomework(homeworkData);
          savedHomeworkCount++;
          console.log(`✅ Saved Google Classroom assignment "${assignment.title}" to homework database`);
        }
      }
    }

    if (savedCoursesCount > 0) {
      console.log(`Successfully saved ${savedCoursesCount} new Google Classroom courses to main database`);
    } else {
      console.log('ℹ️  No new courses to save - all courses already exist');
    }

    if (savedHomeworkCount > 0) {
      console.log(`Successfully saved ${savedHomeworkCount} new Google Classroom assignments to homework database`);
    } else {
      console.log('ℹ️  No new assignments to save - all assignments already exist');
    }
  } catch (error) {
    console.error('Error saving courses and assignments to database:', error);
  }
}

async function checkGoogleUserAndLogClassroom(user: User) {
  try {
    // Check if user is from Google using auth metadata instead of profiles table
    const isGoogleUser = user.app_metadata?.provider === 'google' ||
      user.user_metadata?.provider === 'google' ||
      user.email?.endsWith('@gmail.com') ||
      user.user_metadata?.email_verified;

    if (isGoogleUser) {
      console.log('🎓 Google user detected - Checking Classroom API authorization...');

      // Check if Classroom API is authorized by looking for the classroom-auth cookie
      try {
        const response = await fetch('/api/classroom/debug-log', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ userId: user.id }),
        });

        if (response.ok) {
          const data = await response.json();
          console.log('📚 Google Classroom Data:');
          console.table(data.formattedData);
          console.log('✅ Successfully fetched Google Classroom data');

          // Also save courses to database if they don't already exist
          await saveCoursesToDatabase(user.id, data.formattedData);
        } else {
          const errorData = await response.json();
          if (response.status === 401 && errorData.message?.includes('No Google Classroom authentication found')) {
            console.log('ℹ️  Google user detected, but Classroom API not authorized');
            console.log('💡 User can authorize Classroom API access when needed');
            // Don't show an error - this is expected for many Google users
          } else {
            console.warn('⚠️  Unexpected error checking Classroom access:', errorData.message);
          }
        }
      } catch (error) {
        console.warn('⚠️  Network error checking Classroom access:', error);
      }
    }
  } catch (error) {
    console.error('Error checking Google user:', error);
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
        checkGoogleUserAndLogClassroom(session.user);
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
      // Use Supabase Auth signup - it will handle duplicate emails automatically
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
      // Re-throw any errors for the UI to handle
      throw error;
    }
  };

  const signOut = async () => {
    // Set loading immediately to unmount the entire children tree
    // before user state becomes null. This prevents "Rendered fewer hooks
    // than expected" errors caused by components re-rendering mid-logout.
    setLoading(true);

    if (typeof window !== 'undefined') {
      const cookies = document.cookie.split(';');

      // Define cookies that should be preserved (user preferences and rate limiting)
      const preservedCookies = [
        'aiQuickMessageCounter',
        'aiDeeperMessageCounter',
        'aiCloudMessageCounter',
        'showAIPriority',


        'useDyslexicFont',
        'reduceMotion',
        'aiPersonality',
        'sectionOrder',
        'useWideLayout',
      ];

      // Clear cookies selectively
      cookies.forEach(cookie => {
        const cookieName = cookie.split('=')[0].trim();

        // Skip preserved cookies
        if (preservedCookies.includes(cookieName)) {
          return;
        }

        // Clear Google Classroom cookies
        if (cookieName === 'classroom-auth' || cookieName === 'classroom-sync') {
          document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
          return;
        }

        // Clear route intro cookies
        if (cookieName.startsWith('route-intro-')) {
          document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
          return;
        }

        // Clear Supabase auth cookies
        if (cookieName.startsWith('sb-') && cookieName.includes('auth')) {
          document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
          return;
        }
      });

      // Clear localStorage items related to Supabase auth only
      const localStorageKeys = Object.keys(localStorage);
      localStorageKeys.forEach(key => {
        // Only clear Supabase auth items, preserve other localStorage
        if ((key.startsWith('sb-') || key.includes('supabase')) && key.includes('auth')) {
          localStorage.removeItem(key);
        }
        // Also clear remember-me since user is signing out
        if (key === 'remember-me') {
          localStorage.removeItem(key);
        }
      });
    }

    // Sign out from Supabase with global scope to clear all sessions
    await supabase.auth.signOut({ scope: 'global' });

    // Force clear the user state
    setUser(null);
    setSession(null);
    setFullName(null);
  };

  const value = {
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut,
    full_name,
    isGoogleUser: user?.app_metadata?.provider === 'google' ||
      user?.user_metadata?.provider === 'google' ||
      user?.email?.endsWith('@gmail.com') ||
      user?.user_metadata?.email_verified || false,
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
