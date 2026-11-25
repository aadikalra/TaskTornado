'use client';

import { usePathname, useRouter } from 'next/navigation';
import { Session, User } from '@supabase/supabase-js';
import { useState, useEffect, useContext, createContext, ReactNode, useRef, useCallback } from 'react';
import { supabase } from '@/lib/supabase/client';
import { PUBLIC_CONTENT_PATHS } from '@/lib/public-content';

type SignUpEligibility = {
  dateOfBirth: string;
  countryCode: 'US';
  guardianEmail?: string;
};

export type EligibilityStatus =
  | 'idle'
  | 'checking'
  | 'eligible'
  | 'setup_required'
  | 'parental_consent_required'
  | 'ineligible';

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
  eligibilityStatus: EligibilityStatus;
  isEligible: boolean;
  refreshEligibility: () => Promise<EligibilityStatus>;
  signIn: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  signUp: (
    email: string,
    password: string,
    name: string,
    accountType: 'student' | 'guardian',
    eligibility: SignUpEligibility
  ) => Promise<{ userId: string; hasSession: boolean }>;
  signOut: () => Promise<void>;
  full_name: string | null;
  isGoogleUser: boolean;
  accountType: 'student' | 'guardian';
  isGuardian: boolean;
  linkedStudents: LinkedStudent[];
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function AuthLoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
    </div>
  );
}

export function HomepageAuthGate({ children, hasAuthCookie }: { children: ReactNode; hasAuthCookie: boolean }) {
  const pathname = usePathname();
  const { loading, user } = useAuth();

  return pathname === '/' && loading && (hasAuthCookie || user) ? <AuthLoadingScreen /> : children;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [full_name, setFullName] = useState<string | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [eligibilityStatus, setEligibilityStatus] = useState<EligibilityStatus>('idle');
  const [accountType, setAccountType] = useState<'student' | 'guardian'>('student');
  const [linkedStudents, setLinkedStudents] = useState<LinkedStudent[]>([]);
  const pathname = usePathname();
  const router = useRouter();
  const pathnameRef = useRef(pathname);
  pathnameRef.current = pathname;
  const mountedRef = useRef(true);
  const latestUserIdRef = useRef<string | null>(null);
  const verifiedUserIdRef = useRef<string | null>(null);
  const fetchedProfileForRef = useRef<string | null>(null);
  const inFlightEligibilityRef = useRef<{ userId: string; promise: Promise<EligibilityStatus> } | null>(null);

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

  const syncSession = useCallback(async (
    nextSession: Session | null,
    options?: { force?: boolean }
  ): Promise<EligibilityStatus> => {
    const userId = nextSession?.user?.id ?? null;
    latestUserIdRef.current = userId;
    if (!mountedRef.current) return 'checking';

    if (!nextSession?.user || !userId) {
      verifiedUserIdRef.current = null;
      fetchedProfileForRef.current = null;
      inFlightEligibilityRef.current = null;
      setSession(null);
      setUser(null);
      setFullName(null);
      setAccountType('student');
      setLinkedStudents([]);
      setEligibilityStatus('idle');
      setLoading(false);
      return 'idle';
    }

    const currentPath = typeof window !== 'undefined' ? window.location.pathname : pathnameRef.current;

    // Never hijack or redirect /signup while registration finalization + email request run.
    if (currentPath === '/signup') {
      setSession(nextSession);
      setUser(nextSession.user);
      setFullName(nextSession.user.user_metadata?.full_name ?? null);
      setEligibilityStatus('checking');
      setLoading(false);
      return 'checking';
    }

    // Never block or redirect a parent opening /parental-consent on a shared browser.
    if (currentPath === '/parental-consent') {
      setSession(null);
      setUser(null);
      setFullName(null);
      setAccountType('student');
      setLinkedStudents([]);
      setEligibilityStatus('idle');
      setLoading(false);
      void fetch('/api/auth/eligibility', { cache: 'no-store' }).then((res) => {
        if (res.status === 401 || res.status === 403) {
          void supabase.auth.signOut({ scope: 'local' });
        }
      }).catch(() => {});
      return 'idle';
    }

    // Reuse already-verified eligibility for the active user unless explicitly forced.
    if (!options?.force && verifiedUserIdRef.current === userId) {
      setSession(nextSession);
      setUser(nextSession.user);
      setFullName(nextSession.user.user_metadata?.full_name ?? null);
      setEligibilityStatus('eligible');
      setLoading(false);
      return 'eligible';
    }

    if (!options?.force && inFlightEligibilityRef.current?.userId === userId) {
      const existingStatus = await inFlightEligibilityRef.current.promise;
      if (mountedRef.current && latestUserIdRef.current === userId && existingStatus === 'eligible') {
        setSession(nextSession);
        setUser(nextSession.user);
        setFullName(nextSession.user.user_metadata?.full_name ?? null);
        setEligibilityStatus('eligible');
        setLoading(false);
      }
      return existingStatus;
    }

    if (verifiedUserIdRef.current !== userId) {
      setEligibilityStatus('checking');
    }

    const checkPromise = (async (): Promise<EligibilityStatus> => {
      try {
        const eligibilityResponse = await fetch('/api/auth/eligibility', {
          cache: 'no-store',
        });

        if (!mountedRef.current || latestUserIdRef.current !== userId) {
          return 'checking';
        }

        // Never sign out an active user due to transient 429 rate limits or 5xx errors.
        if (eligibilityResponse.status === 429 || eligibilityResponse.status >= 500) {
          setSession(nextSession);
          setUser(nextSession.user);
          setFullName(nextSession.user.user_metadata?.full_name ?? null);
          const fallbackStatus: EligibilityStatus =
            verifiedUserIdRef.current === userId ? 'eligible' : 'eligible';
          setEligibilityStatus(fallbackStatus);
          setLoading(false);
          return fallbackStatus;
        }

        if (!eligibilityResponse.ok) {
          const eligibilityBody = await eligibilityResponse
            .json()
            .catch(() => ({}));

          if (
            eligibilityResponse.status === 428 &&
            eligibilityBody.code === 'eligibility_setup_required'
          ) {
            verifiedUserIdRef.current = null;
            setSession(nextSession);
            setUser(nextSession.user);
            setFullName(nextSession.user.user_metadata?.full_name ?? null);
            setEligibilityStatus('setup_required');
            setLoading(false);
            if (currentPath !== '/account-eligibility') {
              router.replace('/account-eligibility');
            }
            return 'setup_required';
          }

          if (
            eligibilityResponse.status === 403 &&
            eligibilityBody.code === 'parental_consent_required' &&
            currentPath === '/login'
          ) {
            verifiedUserIdRef.current = null;
            setSession(nextSession);
            setUser(nextSession.user);
            setFullName(nextSession.user.user_metadata?.full_name ?? null);
            setEligibilityStatus('parental_consent_required');
            setLoading(false);
            return 'parental_consent_required';
          }

          const nextStatus: EligibilityStatus =
            eligibilityBody.code === 'parental_consent_required'
              ? 'parental_consent_required'
              : 'ineligible';
          verifiedUserIdRef.current = null;
          fetchedProfileForRef.current = null;
          setUser(null);
          setSession(null);
          setFullName(null);
          setEligibilityStatus(nextStatus);
          setLoading(false);
          void supabase.auth.signOut({ scope: 'local' });
          router.replace(
            nextStatus === 'parental_consent_required'
              ? '/login?approval=required'
              : '/login?error=account_not_eligible'
          );
          return nextStatus;
        }

        verifiedUserIdRef.current = userId;
        setSession(nextSession);
        setUser(nextSession.user);
        setFullName(nextSession.user.user_metadata?.full_name ?? null);
        setEligibilityStatus('eligible');

        if (typeof window !== 'undefined') {
          try {
            const priorAccountsStr = localStorage.getItem('prior-accounts') || '[]';
            let priorAccounts = JSON.parse(priorAccountsStr);
            const account = {
              email: nextSession.user.email,
              full_name: nextSession.user.user_metadata?.full_name || nextSession.user.user_metadata?.name || 'User',
              avatar_url: nextSession.user.user_metadata?.avatar_url || null,
              provider: nextSession.user.app_metadata?.provider || 'email',
              lastLogin: new Date().toISOString()
            };
            priorAccounts = priorAccounts.filter((a: any) => a.email !== account.email);
            priorAccounts.unshift(account);
            localStorage.setItem('prior-accounts', JSON.stringify(priorAccounts.slice(0, 5)));
          } catch (e) {
            console.warn('Failed to save to prior accounts:', e);
          }
        }

        const metaAccountType = nextSession.user.user_metadata?.account_type as 'student' | 'guardian' | undefined;
        if (metaAccountType === 'guardian') {
          setAccountType('guardian');
        }

        setLoading(false);

        if (fetchedProfileForRef.current !== userId) {
          fetchedProfileForRef.current = userId;
          fetchAccountType(userId, nextSession.user.user_metadata);
          fetchLinkedStudents(userId);
        }
        return 'eligible';
      } catch {
        // Network abort/offline: keep active session state instead of logging out.
        setSession(nextSession);
        setUser(nextSession.user);
        setFullName(nextSession.user.user_metadata?.full_name ?? null);
        const retainedStatus: EligibilityStatus =
          verifiedUserIdRef.current === userId ? 'eligible' : 'checking';
        setEligibilityStatus(retainedStatus);
        setLoading(false);
        return retainedStatus;
      } finally {
        if (inFlightEligibilityRef.current?.userId === userId) {
          inFlightEligibilityRef.current = null;
        }
      }
    })();

    inFlightEligibilityRef.current = { userId, promise: checkPromise };
    return checkPromise;
  }, [router]);

  const refreshEligibility = useCallback(async (): Promise<EligibilityStatus> => {
    const { data: { session: currentSession } } = await supabase.auth.getSession();
    return syncSession(currentSession, { force: true });
  }, [syncSession]);

  useEffect(() => {
    mountedRef.current = true;
    // Kick off initial session check immediately in case auth state settled prior to remount,
    // and keep listener updates scheduled outside Supabase's auth-state lock callback.
    void supabase.auth.getSession().then(({ data: { session: initialSession } }) => {
      if (mountedRef.current) {
        void syncSession(initialSession);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      window.setTimeout(() => {
        if (mountedRef.current) {
          void syncSession(nextSession);
        }
      }, 0);
    });

    return () => {
      mountedRef.current = false;
      subscription.unsubscribe();
    };
  }, [syncSession]);

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
  ): Promise<{ userId: string; hasSession: boolean }> => {
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
      return { userId: data.user.id, hasSession: Boolean(data.session) };
    } catch (error: any) {
      // Re-throw any errors for the UI to handle
      throw error;
    }
  };

  const signOut = async () => {
    // Clear auth/eligibility state and set loading immediately so child providers
    // abort background syncs cleanly before auth cookies/tokens are cleared.
    verifiedUserIdRef.current = null;
    fetchedProfileForRef.current = null;
    inFlightEligibilityRef.current = null;
    setLoading(true);
    setUser(null);
    setSession(null);
    setFullName(null);
    setAccountType('student');
    setLinkedStudents([]);
    setEligibilityStatus('idle');

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

    try {
      // Sign out from Supabase with global scope to clear all sessions
      await supabase.auth.signOut({ scope: 'global' });
    } finally {
      // Force clear the user state
      setUser(null);
      setSession(null);
      setFullName(null);
      setAccountType('student');
      setLinkedStudents([]);
      setEligibilityStatus('idle');
      setLoading(false);
    }
  };

  const isGuardian = accountType === 'guardian';

  const value = {
    user,
    session,
    loading,
    eligibilityStatus,
    isEligible: Boolean(user) && eligibilityStatus === 'eligible',
    refreshEligibility,
    signIn,
    signUp,
    signOut,
    full_name,
    isGoogleUser: user?.app_metadata?.provider === 'google' || false,
    accountType,
    isGuardian,
    linkedStudents,
  };

  const isPublicContent = PUBLIC_CONTENT_PATHS.includes(pathname) || pathname.startsWith('/blog/');

  return (
    <AuthContext.Provider value={value}>
      {/* Render public content while the session loads. The homepage has its own session-cookie check. */}
      {loading && !isPublicContent ? <AuthLoadingScreen /> : children}
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
