'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

/**
 * Hook that redirects unauthenticated users to /login.
 * Use at the top of any page component that requires authentication.
 * Returns { user, loading } so the page can show a loading state while checking.
 */
export function useRequireAuth() {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && !user) {
            router.replace('/login');
        }
    }, [user, loading, router]);

    return { user, loading, authenticated: !loading && !!user };
}
