'use client';

import React, { useEffect, useState } from 'react';
import { onViewChange, emitViewChange, setGlobalActiveView } from '@/components/RoleSwitcher';
import StudentLandingContent from '@/components/StudentLandingContent';
import GuardiansContent from '@/components/GuardiansContent';
import TeachersContent from '@/components/TeachersContent';

const VIEW_ORDER = ['students', 'guardians', 'teachers'] as const;
type ViewType = typeof VIEW_ORDER[number];

export function LandingSlider({ initialView = 'students' }: { initialView?: string }) {
    const [activeView, setActiveView] = useState<ViewType>(
        (VIEW_ORDER.includes(initialView as ViewType) ? initialView : 'students') as ViewType
    );

    // Sync global state on mount
    useEffect(() => {
        setGlobalActiveView(activeView);
        emitViewChange(activeView);
    }, []);

    // Listen for view changes from the RoleSwitcher
    useEffect(() => {
        const unsubscribe = onViewChange((view) => {
            if (VIEW_ORDER.includes(view as ViewType)) {
                setActiveView(view as ViewType);
            }
        });
        return () => {
            unsubscribe();
        };
    }, []);

    // Scroll to top when switching views
    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'instant' });
    }, [activeView]);

    // Listen for browser back/forward
    useEffect(() => {
        const handlePopState = () => {
            const path = window.location.pathname;
            let newView: ViewType = 'students';
            if (path === '/guardians') newView = 'guardians';
            else if (path === '/teachers') newView = 'teachers';
            setActiveView(newView);
            setGlobalActiveView(newView);
            emitViewChange(newView);
        };
        window.addEventListener('popstate', handlePopState);
        return () => window.removeEventListener('popstate', handlePopState);
    }, []);

    const activeIndex = VIEW_ORDER.indexOf(activeView);

    return (
        <div
            style={{
                overflow: 'hidden',
                width: '100%',
                position: 'relative',
            }}
        >
            <div
                style={{
                    display: 'flex',
                    width: `${VIEW_ORDER.length * 100}%`,
                    transform: `translateX(-${activeIndex * (100 / VIEW_ORDER.length)}%)`,
                    transition: 'transform 0.55s cubic-bezier(0.45, 0, 0.15, 1)',
                    willChange: 'transform',
                }}
            >
                {/* Panel: For Students */}
                <div style={{ width: `${100 / VIEW_ORDER.length}%`, flexShrink: 0 }}>
                    <StudentLandingContent />
                </div>

                {/* Panel: For Guardians */}
                <div style={{ width: `${100 / VIEW_ORDER.length}%`, flexShrink: 0 }}>
                    <GuardiansContent />
                </div>

                {/* Panel: For Teachers */}
                <div style={{ width: `${100 / VIEW_ORDER.length}%`, flexShrink: 0 }}>
                    <TeachersContent />
                </div>
            </div>
        </div>
    );
}
