'use client';

import { useRouter } from 'next/navigation';
import { Session, User } from '@supabase/supabase-js';
import { useState, useEffect, useContext, createContext, ReactNode } from 'react';
import { supabase } from '@/lib/supabase/client';
import { isNameBlocked, isEmailBlocked } from '@/lib/blockedNames';

type LinkedStudent = {
  id: string;
  name: string | null;
  email: string | null;
  linkedAt: string;
};

type AuthContextType = {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  signUp: (email: string, password: string, name: string, accountType?: 'student' | 'guardian') => Promise<void>;
  signOut: () => Promise<void>;
  full_name: string | null;
  isGoogleUser: boolean;
  accountType: 'student' | 'guardian';
  isGuardian: boolean;
  linkedStudents: LinkedStudent[];
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
        }
      }
    }


  } catch (error) {
    console.error('Error saving courses and assignments to database:', error);
  }
}

async function checkGoogleUserAndLogClassroom(user: User) {
  try {
    // Check if user is from Google using auth metadata instead of profiles table
    // Only check app_metadata.provider — this is the authoritative field
    // Supabase sets during OAuth. Checking email domain or email_verified
    // would false-positive for email/password users with @gmail.com addresses
    // or any verified email.
    const isGoogleUser = user.app_metadata?.provider === 'google';

    if (isGoogleUser) {

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

          // Also save courses to database if they don't already exist
          await saveCoursesToDatabase(user.id, data.formattedData);
        } else {
          const errorData = await response.json();
          if (response.status === 401 && errorData.message?.includes('No Google Classroom authentication found')) {
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
  const [accountType, setAccountType] = useState<'student' | 'guardian'>('student');
  const [linkedStudents, setLinkedStudents] = useState<LinkedStudent[]>([]);
  const router = useRouter();

  // Fetch account type from profiles table, syncing from user_metadata if needed
  const fetchAccountType = async (userId: string, userMetadata?: Record<string, any>) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('account_type')
        .eq('id', userId)
        .single();

      const profileType = data?.account_type as 'student' | 'guardian' | undefined;
      const metadataType = userMetadata?.account_type as 'student' | 'guardian' | undefined;

      // If profile exists and has the right type, use it
      if (!error && profileType && profileType !== 'student') {
        setAccountType(profileType);
        return;
      }

      // If user_metadata says 'guardian' but profile says 'student' (default),
      // the profile was created by a trigger before our update ran — fix it now
      if (metadataType === 'guardian' && profileType === 'student') {
        await supabase
          .from('profiles')
          .update({ account_type: 'guardian' })
          .eq('id', userId);
        setAccountType('guardian');
        return;
      }

      // Use whatever the profile says (or default to student)
      setAccountType(profileType || 'student');
    } catch (err) {
      console.warn('Could not fetch account type:', err);
    }
  };

  // Fetch linked students for guardian accounts
  const fetchLinkedStudents = async (userId: string) => {
    try {
      const { data: links, error } = await supabase
        .from('parent_links')
        .select('student_id, created_at')
        .eq('parent_id', userId)
        .eq('status', 'active');

      if (error || !links?.length) {
        setLinkedStudents([]);
        return;
      }

      // Get student profiles
      const studentIds = links.map(l => l.student_id);
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .in('id', studentIds);

      const students: LinkedStudent[] = links.map(link => {
        const profile = profiles?.find(p => p.id === link.student_id);
        return {
          id: link.student_id,
          name: profile?.full_name ?? null,
          email: profile?.email ?? null,
          linkedAt: link.created_at ?? new Date().toISOString(),
        };
      });

      setLinkedStudents(students);
    } catch (err) {
      console.warn('Could not fetch linked students:', err);
      setLinkedStudents([]);
    }
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setFullName(session?.user?.user_metadata?.full_name ?? null);

      if (session?.user) {
        // Save to prior accounts for quick login
        if (typeof window !== 'undefined') {
          try {
            const priorAccountsStr = localStorage.getItem('prior-accounts') || '[]';
            let priorAccounts = JSON.parse(priorAccountsStr);
            const account = {
              email: session.user.email,
              full_name: session.user.user_metadata?.full_name || session.user.user_metadata?.name || 'User',
              avatar_url: session.user.user_metadata?.avatar_url || null,
              provider: session.user.app_metadata?.provider || 'email',
              lastLogin: new Date().toISOString()
            };
            // Remove existing entry for this email and add to front
            priorAccounts = priorAccounts.filter((a: any) => a.email !== account.email);
            priorAccounts.unshift(account);
            // Limit to 5 accounts
            localStorage.setItem('prior-accounts', JSON.stringify(priorAccounts.slice(0, 5)));
          } catch (e) {
            console.warn('Failed to save to prior accounts:', e);
          }
        }

        // Block restricted users — even if they got past the login/signup page
        const userName = session.user.user_metadata?.full_name || session.user.user_metadata?.name || '';
        const userEmail = session.user.email || '';
        if (isNameBlocked(userName) || isEmailBlocked(userEmail)) {
          await supabase.auth.signOut();
          setUser(null);
          setSession(null);
          setFullName(null);
          setLoading(false);
          return;
        }

        // Set account type synchronously from JWT metadata (instant, no DB call)
        const metaAccountType = session.user.user_metadata?.account_type as 'student' | 'guardian' | undefined;
        if (metaAccountType === 'guardian') {
          setAccountType('guardian');
        }

        checkGoogleUserAndLogClassroom(session.user);
        setLoading(false);

        // Then verify/sync with DB in background (fixes mismatches without blocking)
        fetchAccountType(session.user.id, session.user.user_metadata);
        fetchLinkedStudents(session.user.id);
      } else {
        setAccountType('student');
        setLinkedStudents([]);
        setLoading(false);
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

  const signUp = async (email: string, password: string, name: string, acctType: 'student' | 'guardian' = 'student'): Promise<void> => {
    try {
      // Use Supabase Auth signup - it will handle duplicate emails automatically
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
            account_type: acctType,
          },
        },
      });

      if (error) throw error;

      // Update the profiles table with the account type
      if (data.user) {
        await supabase
          .from('profiles')
          .update({ account_type: acctType })
          .eq('id', data.user.id);
        setAccountType(acctType);
      }
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

  const isGuardian = accountType === 'guardian';

  const value = {
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut,
    full_name,
    isGoogleUser: user?.app_metadata?.provider === 'google' || false,
    accountType,
    isGuardian,
    linkedStudents,
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
