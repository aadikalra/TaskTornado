'use client';

import React, { useState, useEffect, createContext, useContext } from 'react';
import { motion } from 'framer-motion';
import { usePathname } from 'next/navigation';

// We need a way to communicate with the LandingSlider.
// Since the RoleSwitcher lives in ClientLayout (above the page), 
// and the LandingViewProvider lives inside the page, 
// we use a global event bus approach.

// Global event emitter for view changes
type ViewChangeCallback = (view: string) => void;
const listeners: Set<ViewChangeCallback> = new Set();

export function onViewChange(cb: ViewChangeCallback) {
    listeners.add(cb);
    return () => listeners.delete(cb);
}

export function emitViewChange(view: string) {
    listeners.forEach(cb => cb(view));
}

// Also track the current view globally for the RoleSwitcher to read
let globalActiveView = 'students';

export function setGlobalActiveView(view: string) {
    globalActiveView = view;
}

export function getGlobalActiveView() {
    return globalActiveView;
}

export const RoleSwitcher = () => {
    const pathname = usePathname();
    const [isScrolled, setIsScrolled] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const [isSmall, setIsSmall] = useState(true);
    const [activeView, setActiveView] = useState(() => {
        if (pathname === '/guardians') return 'guardians';
        if (pathname === '/teachers') return 'teachers';
        return 'students';
    });

    // Only show on landing pages
    const isLandingPage = pathname === '/' || pathname === '/guardians' || pathname === '/teachers';

    // Listen for external view changes (from LandingSlider syncing back)
    useEffect(() => {
        const unsubscribe = onViewChange((view) => {
            setActiveView(view);
        });
        return () => {
            unsubscribe();
        };
    }, []);

    // Sync with pathname on navigation
    useEffect(() => {
        if (pathname === '/guardians') setActiveView('guardians');
        else if (pathname === '/teachers') setActiveView('teachers');
        else if (pathname === '/') setActiveView('students');
    }, [pathname]);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };

        const checkDimensions = () => {
            setIsSmall(window.innerWidth >= 516);
        };

        checkDimensions();
        window.addEventListener('scroll', handleScroll);
        window.addEventListener('resize', checkDimensions);

        return () => {
            window.removeEventListener('scroll', handleScroll);
            window.removeEventListener('resize', checkDimensions);
        };
    }, []);

    if (!isLandingPage) return null;

    const roles = [
        { name: 'For Students', key: 'students' },
        { name: 'For Guardians', key: 'guardians' },
        { name: 'For Teachers', key: 'teachers' }
    ];

    const handleRoleClick = (key: string) => {
        setActiveView(key);
        setGlobalActiveView(key);
        emitViewChange(key);

        // Update URL without full navigation
        const path = key === 'students' ? '/' : `/${key}`;
        window.history.pushState({}, '', path);
    };

    return (
        <div
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className="fixed z-[1000] flex p-1 rounded-2xl border transition-all duration-400 ease-in-out shadow-lg
                bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-800 shadow-black/5 dark:shadow-black/20"
            style={{
                top: isSmall ? '32px' : '20px',
                left: isSmall ? '32px' : '20px',
                opacity: isHovered ? 1 : (isScrolled ? 0.6 : 1),
            }}>
            {roles.map((role) => (
                <button
                    key={role.key}
                    onClick={() => handleRoleClick(role.key)}
                    className={`relative px-4 py-1.5 font-bold rounded-xl transition-colors duration-200 z-[1]
                        ${isSmall ? 'text-[12px]' : 'text-[11px]'}
                        ${activeView === role.key
                            ? 'text-zinc-900 dark:text-white'
                            : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200'}`}
                >
                    {activeView === role.key && (
                        <motion.div
                            layoutId="activeRoleTabUniversal"
                            className="absolute inset-0 bg-zinc-100 dark:bg-zinc-800 rounded-xl z-[-1]"
                            transition={{ type: 'spring', bounce: 0.15, duration: 0.5 }}
                        />
                    )}
                    <span className="relative z-10">
                        {role.name}
                    </span>
                </button>
            ))}
        </div>
    );
};
