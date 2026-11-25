'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useEffect, useState } from 'react';

interface Props {
  children: React.ReactNode;
}

export default function AuthWrapper({ children }: Props) {
  const { user, loading, isEligible, eligibilityStatus } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [shouldRedirect, setShouldRedirect] = useState<{ to: string } | null>(null);

  const isAuthPage = pathname && (pathname === '/login' || pathname === '/signup');

  // Define public routes - these don't require authentication
  const PUBLIC_ROUTES = [
    '/',
    '/login',
    '/signup',
    '/forgot-password',
    '/reset-password',
    '/parental-consent',
    '/account-eligibility',
    '/ai-guidelines',
    '/landing',
    '/legal',
    '/legal/terms',
    '/legal/privacy',
    '/translate',
    '/blog',
  ];

  // Check if route is in public routes list
  const isInPublicRoutes = pathname && PUBLIC_ROUTES.some(route =>
    pathname === route || pathname.startsWith(`${route}/`)
  );

  // Check if this is a 404 scenario (route doesn't exist)
  const is404Scenario = typeof window !== 'undefined' && !isInPublicRoutes && !isAuthPage;

  const isPublicRoute = isInPublicRoutes;

  // Handle redirects in useEffect to prevent state updates during render
  useEffect(() => {
    // Only run this effect when loading state changes or user state changes
    if (loading) return;

    // Skip if we've already determined the redirect
    if (shouldRedirect) return;

    // 1. Public routes - no redirect needed
    if (isPublicRoute) {
      // If user is on auth page and already logged in + eligible, redirect to dashboard
      if (isAuthPage && user && isEligible) {
        setShouldRedirect({ to: '/dashboard' });
      }
      // If user is on root path and logged in + eligible, redirect to dashboard
      if (pathname && pathname === '/' && user && isEligible) {
        setShouldRedirect({ to: '/dashboard' });
      }
      return;
    }

    // 2. For non-existent routes (404 scenarios), don't redirect - let 404 page handle it
    if (is404Scenario) {
      return;
    }

    // 3. Protected routes - redirect if not logged in or not eligible
    if (!user) {
      setShouldRedirect({
        to: `/login?redirectTo=${encodeURIComponent(pathname || '')}`
      });
      return;
    }

    if (eligibilityStatus === 'checking') return;

    if (eligibilityStatus === 'setup_required') {
      setShouldRedirect({ to: '/account-eligibility' });
      return;
    }

    if (eligibilityStatus === 'parental_consent_required') {
      setShouldRedirect({ to: '/login?approval=required' });
      return;
    }

    if (eligibilityStatus === 'ineligible' || !isEligible) {
      setShouldRedirect({ to: '/login?error=account_not_eligible' });
    }
  }, [loading, isAuthPage, isPublicRoute, is404Scenario, user, isEligible, eligibilityStatus, pathname, shouldRedirect]);

  // Handle the actual redirect
  useEffect(() => {
    if (shouldRedirect) {
      router.replace(shouldRedirect.to);
      setShouldRedirect(null);
    }
  }, [shouldRedirect, router]);

  // Show loading spinner while auth state is being determined
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-[#275085]/20 border-t-[#275085] dark:border-[#a0c3ff]/20 dark:border-t-[#a0c3ff]" />
      </div>
    );
  }

  // If it's a public route, render the children
  if (isPublicRoute) {
    return <>{children}</>;
  }

  // If it's a 404 scenario, also render the children (let 404 page handle it)
  if (is404Scenario) {
    return <>{children}</>;
  }

  // If we get here, it's a protected route and we're not loading
  if (!user || !isEligible) {
    // Show a loading spinner while eligibility resolves or redirect is happening
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-[#275085]/20 border-t-[#275085] dark:border-[#a0c3ff]/20 dark:border-t-[#a0c3ff]" />
      </div>
    );
  }

  // If we have an eligible user, render the children
  return <>{children}</>;
}