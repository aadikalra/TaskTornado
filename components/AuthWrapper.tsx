'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useEffect, useState } from 'react';

interface Props {
  children: React.ReactNode;
}

export default function AuthWrapper({ children }: Props) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [shouldRedirect, setShouldRedirect] = useState<{to: string} | null>(null);
  
  const isAuthPage = pathname && (pathname === '/login' || pathname === '/signup');

  // Define public routes - these don't require authentication
  const PUBLIC_ROUTES = [
    '/',
    '/login',
    '/signup',
    '/ai-guidelines',
    '/landing',
    '/legal',
    '/legal/terms',
    '/legal/privacy',
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
      // If user is on auth page but already logged in, redirect to dashboard
      if (isAuthPage && user) {
        setShouldRedirect({ to: '/dashboard' });
      }
      // If user is on root path and logged in, redirect to dashboard
      if (pathname && pathname === '/' && user) {
        setShouldRedirect({ to: '/dashboard' });
      }
      return;
    }

    // 2. For non-existent routes (404 scenarios), don't redirect - let 404 page handle it
    if (is404Scenario) {
      return;
    }

    // 3. Protected routes - redirect to login if not logged in
    if (!user) {
      setShouldRedirect({
        to: `/login?redirectTo=${encodeURIComponent(pathname || '')}`
      });
    }
  }, [loading, isAuthPage, isPublicRoute, is404Scenario, user, pathname]);
  
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
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500" />
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
  if (!user) {
    // Show a loading spinner while the redirect is happening
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500" />
      </div>
    );
  }

  // If we have a user, render the children
  return <>{children}</>;
}