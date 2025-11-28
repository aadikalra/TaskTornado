'use client';

import { useEffect } from 'react';
import { rateLimitService } from '@/lib/services/rateLimitService';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase/client';

/**
 * Hook to automatically clear AI rate-limit cookies and database entries at midnight every day
 */
export function useRateLimitReset() {
    const { user } = useAuth();
    
    useEffect(() => {
        // Cookie names for AI rate limiting
        const RATE_LIMIT_COOKIES = [
            'aiQuickMessageCounter',
            'aiDeeperMessageCounter',
            'aiCloudMessageCounter'
        ];

        // Key to store the last reset date
        const LAST_RESET_KEY = 'aiRateLimitLastReset';

        /**
         * Clear all rate-limit cookies
         */
        const clearRateLimitCookies = () => {
            RATE_LIMIT_COOKIES.forEach(cookieName => {
                document.cookie = `${cookieName}=0; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
            });
            console.log('[Rate Limit Reset] Cleared all rate-limit cookies');
        };

        /**
         * Clear all rate-limit database entries for today
         */
        const clearRateLimitDatabase = async () => {
            if (user) {
                try {
                    // Use RPC function to reset rate limits
                    const { error } = await supabase.rpc('reset_daily_rate_limits', {
                        p_user_id: user.id
                    });
                    
                    if (error) {
                        console.error('[Rate Limit Reset] Error resetting database entries:', error);
                    } else {
                        console.log('[Rate Limit Reset] Cleared all rate-limit database entries');
                    }
                } catch (error) {
                    console.error('[Rate Limit Reset] Error clearing database entries:', error);
                }
            }
        };

        /**
         * Check if we need to reset (new day has started)
         */
        const checkAndReset = async () => {
            const now = new Date();
            const today = now.toDateString(); // e.g., "Sat Nov 22 2025"

            const lastReset = localStorage.getItem(LAST_RESET_KEY);

            // If it's a new day, clear the cookies and database
            if (lastReset !== today) {
                console.log('[Rate Limit Reset] New day detected, resetting counters');
                clearRateLimitCookies();
                await clearRateLimitDatabase();
                localStorage.setItem(LAST_RESET_KEY, today);
            }
        };

        /**
         * Calculate milliseconds until next midnight
         */
        const getMillisecondsUntilMidnight = () => {
            const now = new Date();
            const tomorrow = new Date(now);
            tomorrow.setDate(tomorrow.getDate() + 1);
            tomorrow.setHours(0, 0, 0, 0);
            return tomorrow.getTime() - now.getTime();
        };

        /**
         * Schedule the next midnight reset
         */
        const scheduleMidnightReset = () => {
            const msUntilMidnight = getMillisecondsUntilMidnight();

            console.log(`[Rate Limit Reset] Scheduling next reset in ${Math.round(msUntilMidnight / 1000 / 60)} minutes`);

            return setTimeout(async () => {
                console.log('[Rate Limit Reset] Midnight reached, clearing cookies and database');
                clearRateLimitCookies();
                await clearRateLimitDatabase();

                const today = new Date().toDateString();
                localStorage.setItem(LAST_RESET_KEY, today);

                // Schedule the next reset (recursive)
                scheduleMidnightReset();
            }, msUntilMidnight);
        };

        // Check on mount if we need to reset
        checkAndReset();

        // Schedule the midnight reset
        const timeoutId = scheduleMidnightReset();

        // Cleanup on unmount
        return () => {
            if (timeoutId) {
                clearTimeout(timeoutId);
            }
        };
    }, [user]);
}
