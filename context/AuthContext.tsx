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
  signIn: (email: string, password: string) => Promise<void>;
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
      console.log(`🎯 Successfully saved ${savedCount} new courses to database`);
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
    // Define public routes that shouldn't trigger redirects
    const isPublicRoute = (path: string) => {
      const publicRoutes = [
        '/',
        '/ai-guidelines',
        '/login',
        '/signup',
        '/complete-signup', // Add this for Google OAuth completion
        '/flashcards',
        '/calendar',
        '/landing',
        '/legal',
        '/homework',
        '/classes',
        '/ai',
        '/settings',
        '/dashboard',
        '/groups',
        '/web-saves',
        '/study-groups',
      ];
      return publicRoutes.some(route => path === route || path.startsWith(`${route}/`));
    };

    // Check active sessions and set the user
    const getSession = async () => {
      // First check for Supabase session
      const { data: { session: supabaseSession } } = await supabase.auth.getSession();

      if (supabaseSession) {
        setSession(supabaseSession);
        setUser(supabaseSession.user);
        setFullName(supabaseSession.user?.user_metadata?.full_name ?? null);

        // Check if user is from Google and log Google Classroom data
        await checkGoogleUserAndLogClassroom(supabaseSession.user.id);

        setLoading(false);
        return;
      }

      // If no Supabase session, check for Google auth session cookie
      if (typeof window !== 'undefined') {
        const cookies = document.cookie.split(';');
        const googleAuthCookie = cookies.find(cookie => cookie.trim().startsWith('google-auth-session='));

        if (googleAuthCookie) {
          try {
            const sessionData = googleAuthCookie.split('=')[1];
            const decodedSession = JSON.parse(atob(sessionData));

            // Check if session is still valid
            if (decodedSession.expires_at > Math.floor(Date.now() / 1000)) {
              // Create a mock Supabase session for Google auth
              const mockSession = {
                access_token: 'google-auth',
                refresh_token: '',
                expires_in: decodedSession.expires_at - Math.floor(Date.now() / 1000),
                expires_at: decodedSession.expires_at,
                token_type: 'bearer',
                user: {
                  id: decodedSession.user_id,
                  email: decodedSession.email,
                  user_metadata: {
                    full_name: decodedSession.name,
                    picture: decodedSession.picture,
                    provider: 'google',
                  },
                  aud: 'authenticated',
                  role: 'authenticated',
                  app_metadata: {},
                  created_at: new Date().toISOString(),
                } as any,
              };

              const mockUser = mockSession.user;

              setSession(mockSession as any);
              setUser(mockUser);
              setFullName(decodedSession.name);

              // Check if user is from Google and log Google Classroom data
              await checkGoogleUserAndLogClassroom(mockUser.id);

              setLoading(false);
              return;
            }
          } catch (error) {
            console.error('Error parsing Google auth session:', error);
          }
        }
      }

      // No valid session found
      setSession(null);
      setUser(null);
      setFullName(null);
      setLoading(false);
    };

    getSession();

    // Track the initial session to compare with new sessions
    let initialSession: Session | null = null;

    // Listen for changes in auth state
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      // Only update state if the session has actually changed
      if (JSON.stringify(session) !== JSON.stringify(newSession)) {
        setSession(newSession);
        setUser(newSession?.user ?? null);
        setFullName(newSession?.user?.user_metadata.full_name ?? null);
        setLoading(false);

        // Skip redirect logic if we're on a public route
        const currentPath = window.location.pathname;
        if (isPublicRoute(currentPath)) {
          return;
        }

        // For unknown routes (potential 404s), don't redirect - let 404 page handle it
        // Only redirect for known protected routes when user is not authenticated
        const knownProtectedRoutes = ['/homework', '/classes', '/dashboard', '/settings'];
        const isKnownProtectedRoute = knownProtectedRoutes.some(route =>
          currentPath.startsWith(route)
        );

        if (!isKnownProtectedRoute) {
          return;
        }
        
        // Only redirect for specific auth events, not on initial load or token refresh
        if (event === 'SIGNED_IN') {
          // Get the redirectTo parameter if it exists
          const searchParams = new URLSearchParams(window.location.search);
          const redirectTo = searchParams.get('redirectTo');
          
          // If there's a redirectTo parameter, use it; otherwise go to home
          router.push(redirectTo || '/');
        } else if (event === 'SIGNED_OUT') {
          // When signing out, redirect to login with the current path as redirectTo
          const redirectTo = encodeURIComponent(window.location.pathname + window.location.search);
          router.push(`/login?redirectTo=${redirectTo}`);
        }
      }
      
      // Always update the initial session after the first check
      if (!initialSession) {
        initialSession = newSession;
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [router]);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) throw error;
  };

  const signUp = async (email: string, password: string, name: string): Promise<void> => {
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
  };

  const signOut = async () => {
    // Sign out from Supabase
    await supabase.auth.signOut();

    // Also clear Google auth session cookie
    if (typeof window !== 'undefined') {
      document.cookie = "google-auth-session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    }
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
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
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
