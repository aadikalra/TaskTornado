'use client';

import { useState, useEffect, useCallback } from 'react';
import { getPlanTier, setPlanTier, TIER_LIMITS, getTierLabel, type PlanTier } from '@/lib/planTier';

/**
 * React hook to read / write the current plan tier.
 * Syncs across tabs via a custom storage event and provides
 * the full limits object for the active tier.
 */
export function usePlanTier() {
    const [tier, setTierState] = useState<PlanTier>('free');

    // Hydrate from cookie on mount
    useEffect(() => {
        setTierState(getPlanTier());
    }, []);

    // Listen for cross-component tier changes (dispatched in setTier)
    useEffect(() => {
        const handler = () => setTierState(getPlanTier());
        window.addEventListener('planTierChanged', handler);
        return () => window.removeEventListener('planTierChanged', handler);
    }, []);

    const setTier = useCallback((newTier: PlanTier) => {
        setPlanTier(newTier);
        setTierState(newTier);
        // Notify other components on the same page
        window.dispatchEvent(new Event('planTierChanged'));
    }, []);

    return {
        tier,
        setTier,
        label: getTierLabel(tier),
        limits: TIER_LIMITS[tier],
        isPro: tier === 'pro' || tier === 'family',
        isFamily: tier === 'family',
        isFree: tier === 'free',
    };
}
