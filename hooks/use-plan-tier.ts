import { getCurrentLimits } from '@/lib/planTier';

export function usePlanTier() {
    return { tier: 'free' as const, label: 'Free', limits: getCurrentLimits(), isFree: true };
}
