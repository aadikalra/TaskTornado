'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';

type RoleView = 'students' | 'guardians' | 'teachers';

interface LandingViewContextType {
    activeView: RoleView;
    setActiveView: (view: RoleView) => void;
}

const LandingViewContext = createContext<LandingViewContextType>({
    activeView: 'students',
    setActiveView: () => { },
});

export function useLandingView() {
    return useContext(LandingViewContext);
}

export function LandingViewProvider({ initialView, children }: { initialView: RoleView; children: React.ReactNode }) {
    const [activeView, setActiveViewState] = useState<RoleView>(initialView);

    const setActiveView = useCallback((view: RoleView) => {
        setActiveViewState(view);
        // Update URL without full navigation
        const path = view === 'students' ? '/' : `/${view}`;
        window.history.pushState({}, '', path);
    }, []);

    // Listen for popstate (browser back/forward)
    React.useEffect(() => {
        const handlePopState = () => {
            const path = window.location.pathname;
            if (path === '/guardians') setActiveViewState('guardians');
            else if (path === '/teachers') setActiveViewState('teachers');
            else setActiveViewState('students');
        };
        window.addEventListener('popstate', handlePopState);
        return () => window.removeEventListener('popstate', handlePopState);
    }, []);

    return (
        <LandingViewContext.Provider value={{ activeView, setActiveView }}>
            {children}
        </LandingViewContext.Provider>
    );
}
