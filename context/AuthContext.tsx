'use client';

import { useRouter } from 'next/navigation';
import { Session, User } from '@supabase/supabase-js';
import { useState, useEffect, useContext, createContext, ReactNode } from 'react';
import { supabase } from '@/lib/supabase/client';

type SignUpEligibility = {
  dateOfBirth: string;
  countryCode: 'US';
  guardianEmail?: string;
};

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
  signUp: (
    email: string,
    password: string,
    name: string,
    accountType: 'student' | 'guardian',
    eligibility: SignUpEligibility
  ) => Promise<{ userId: string }>;
  signOut: () => Promise<void>;
  full_name: string | null;
  isGoogleUser: boolean;
  accountType: 'student' | 'guardian';
  isGuardian: boolean;
  linkedStudents: LinkedStudent[];
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

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
        const eligibilityResponse = await fetch('/api/auth/eligibility', {
          cache: 'no-store',
        });

        if (!eligibilityResponse.ok) {
          const eligibilityBody = await eligibilityResponse
            .json()
            .catch(() => ({}));

          // Accounts created before the age gate do not have eligibility
          // fields yet. Keep their authenticated session long enough to collect
          // those fields instead of briefly showing the signed-in UI and then
          // silently signing them back out.
          if (
            eligibilityResponse.status === 428 &&
            eligibilityBody.code === 'eligibility_setup_required'
          ) {
            setLoading(false);
            if (
              typeof window === 'undefined' ||
              window.location.pathname !== '/account-eligibility'
            ) {
              router.replace('/account-eligibility');
            }
            return;
          }

          // The login form sends (or re-sends) the guardian approval email and
          // then signs the pending account out with a useful message. Let it
          // finish that flow instead of racing it from this global listener.
          if (
            eligibilityResponse.status === 403 &&
            eligibilityBody.code === 'parental_consent_required' &&
            typeof window !== 'undefined' &&
            window.location.pathname === '/login'
          ) {
            setLoading(false);
            return;
          }

          await supabase.auth.signOut();
          setUser(null);
          setSession(null);
          setFullName(null);
          setLoading(false);
          router.replace(
            eligibilityBody.code === 'parental_consent_required'
              ? '/login?approval=required'
              : '/login?error=account_not_eligible'
          );
          return;
        }

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

        // Set account type synchronously from JWT metadata (instant, no DB call)
        const metaAccountType = session.user.user_metadata?.account_type as 'student' | 'guardian' | undefined;
        if (metaAccountType === 'guardian') {
          setAccountType('guardian');
        }

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

  const signUp = async (
    email: string,
    password: string,
    name: string,
    acctType: 'student' | 'guardian',
    eligibility: SignUpEligibility
  ): Promise<{ userId: string }> => {
    try {
      // Use Supabase Auth signup - it will handle duplicate emails automatically
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
            account_type: acctType,
            date_of_birth: eligibility.dateOfBirth,
            country_code: eligibility.countryCode,
            guardian_email: eligibility.guardianEmail || null,
          },
        },
      });

      if (error) throw error;
      if (!data.user) throw new Error('The account could not be created.');

      setAccountType(acctType);
      return { userId: data.user.id };
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
