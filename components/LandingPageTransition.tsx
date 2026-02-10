'use client';

import React, { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';

// Define the order of landing pages (left to right)
const LANDING_PAGES = ['/', '/guardians', '/teachers'];

export function LandingPageTransition({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const prevPathRef = useRef(pathname);
    const directionRef = useRef(0); // -1 = slide left (going right), 1 = slide right (going left)

    const isLandingPage = LANDING_PAGES.includes(pathname);
    const wasLandingPage = LANDING_PAGES.includes(prevPathRef.current);

    useEffect(() => {
        if (pathname !== prevPathRef.current) {
            const prevIndex = LANDING_PAGES.indexOf(prevPathRef.current);
            const currIndex = LANDING_PAGES.indexOf(pathname);

            // Only compute direction if both are landing pages
            if (prevIndex !== -1 && currIndex !== -1) {
                directionRef.current = currIndex > prevIndex ? 1 : -1;
            }

            prevPathRef.current = pathname;
        }
    }, [pathname]);

    // If not a landing page, render without transition
    if (!isLandingPage) {
        return <>{children}</>;
    }

    const direction = directionRef.current;

    return (
        <AnimatePresence mode="wait" initial={false}>
            <motion.div
                key={pathname}
                initial={{ x: direction * 100 + '%', opacity: 0.3 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: direction * -100 + '%', opacity: 0.3 }}
                transition={{
                    type: 'spring',
                    stiffness: 300,
                    damping: 30,
                    mass: 0.8,
                }}
                style={{
                    width: '100%',
                    minHeight: '100vh',
                    willChange: 'transform',
                }}
            >
                {children}
            </motion.div>
        </AnimatePresence>
    );
}
