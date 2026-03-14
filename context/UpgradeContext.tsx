'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import UpgradeModal from '@/components/UpgradeModal';

interface UpgradePromptOptions {
    featureLabel?: string;
    limitMessage?: string;
}

interface UpgradeContextType {
    /** Open the upgrade modal with optional context */
    promptUpgrade: (opts?: UpgradePromptOptions) => void;
    /** Check a PLAN_LIMIT error and open the modal automatically. Returns true if it was a plan limit. */
    handlePlanLimitError: (error: any) => boolean;
}

const UpgradeContext = createContext<UpgradeContextType | undefined>(undefined);

export function UpgradeProvider({ children }: { children: React.ReactNode }) {
    const [isOpen, setIsOpen] = useState(false);
    const [options, setOptions] = useState<UpgradePromptOptions>({});

    const promptUpgrade = useCallback((opts?: UpgradePromptOptions) => {
        setOptions(opts ?? {});
        setIsOpen(true);
    }, []);

    const handlePlanLimitError = useCallback((error: any): boolean => {
        const msg = error?.message || '';
        if (typeof msg === 'string' && msg.startsWith('PLAN_LIMIT:')) {
            setOptions({ limitMessage: msg.replace('PLAN_LIMIT:', '') });
            setIsOpen(true);
            return true;
        }
        return false;
    }, []);

    return (
        <UpgradeContext.Provider value={{ promptUpgrade, handlePlanLimitError }}>
            {children}
            <UpgradeModal
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
                featureLabel={options.featureLabel}
                limitMessage={options.limitMessage}
            />
        </UpgradeContext.Provider>
    );
}

export function useUpgrade() {
    const ctx = useContext(UpgradeContext);
    if (!ctx) throw new Error('useUpgrade must be used within an UpgradeProvider');
    return ctx;
}
