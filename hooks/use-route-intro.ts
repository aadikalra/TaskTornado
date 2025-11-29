'use client';

import { useState, useEffect } from 'react';

/**
 * Hook to manage first-time route visit popups
 * Stores visit status in cookies and clears on logout
 */
export function useRouteIntro(routeKey: string) {
    const [showIntro, setShowIntro] = useState(false);
    const [isChecking, setIsChecking] = useState(true);

    useEffect(() => {
        // Check if user has seen this route intro before
        const cookieName = `route-intro-${routeKey}`;
        const hasSeenIntro = document.cookie
            .split('; ')
            .find(row => row.startsWith(`${cookieName}=`));

        if (!hasSeenIntro) {
            setShowIntro(true);
        }
        setIsChecking(false);
    }, [routeKey]);

    const dismissIntro = () => {
        // Set cookie to remember that user has seen this intro
        // Cookie expires in 1 year (will be cleared on logout)
        const cookieName = `route-intro-${routeKey}`;
        const expiryDate = new Date();
        expiryDate.setFullYear(expiryDate.getFullYear() + 1);
        document.cookie = `${cookieName}=true; expires=${expiryDate.toUTCString()}; path=/`;

        setShowIntro(false);
    };

    return {
        showIntro,
        dismissIntro,
        isChecking,
    };
}
