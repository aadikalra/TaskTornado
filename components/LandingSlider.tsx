'use client';

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { usePathname } from 'next/navigation';
import { onViewChange, emitViewChange, setGlobalActiveView } from '@/components/RoleSwitcher';
import StudentLandingContent from '@/components/StudentLandingContent';

const GuardiansContent = dynamic(() => import('@/components/GuardiansContent'));
const TeachersContent = dynamic(() => import('@/components/TeachersContent'));

const VIEW_ORDER = ['students', 'guardians', 'teachers'] as const;
type ViewType = typeof VIEW_ORDER[number];

function viewFromPath(path: string): ViewType {
    if (path === '/guardians') return 'guardians';
    if (path === '/teachers') return 'teachers';
    return 'students';
}

export function LandingSlider({ initialView = 'students' }: { initialView?: string }) {
    const pathname = usePathname();

    const normalizedInitial = (VIEW_ORDER.includes(initialView as ViewType) ? initialView : 'students') as ViewType;

    // Determine view from URL first, then prop fallback
    const [activeView, setActiveView] = useState<ViewType>(() => {
        if (typeof window !== 'undefined') {
            return viewFromPath(window.location.pathname);
        }
        return normalizedInitial;
    });

    const [mountedViews, setMountedViews] = useState<Record<ViewType, boolean>>(() => ({
        students: normalizedInitial === 'students',
        guardians: normalizedInitial === 'guardians',
        teachers: normalizedInitial === 'teachers',
    }));

    // Ensure the active panel is mounted
    useEffect(() => {
        setMountedViews((prev) => (prev[activeView] ? prev : { ...prev, [activeView]: true }));
    }, [activeView]);

    // Sync with pathname when Next.js navigates to a landing route
    useEffect(() => {
        const newView = viewFromPath(pathname);
        if (['/', '/guardians', '/teachers'].includes(pathname)) {
            setActiveView(newView);
            setGlobalActiveView(newView);
            emitViewChange(newView);
        }
    }, [pathname]);

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
            const newView = viewFromPath(window.location.pathname);
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
                }}
            >
                {/* Panel: For Students */}
                <div
                    style={{ width: `${100 / VIEW_ORDER.length}%`, flexShrink: 0 }}
                    inert={activeView !== 'students' ? true : undefined}
                    aria-hidden={activeView !== 'students' ? true : undefined}
                >
                    {mountedViews.students ? <StudentLandingContent /> : null}
                </div>

                {/* Panel: For Guardians */}
                <div
                    style={{ width: `${100 / VIEW_ORDER.length}%`, flexShrink: 0 }}
                    inert={activeView !== 'guardians' ? true : undefined}
                    aria-hidden={activeView !== 'guardians' ? true : undefined}
                >
                    {mountedViews.guardians ? <GuardiansContent /> : null}
                </div>

                {/* Panel: For Teachers */}
                <div
                    style={{ width: `${100 / VIEW_ORDER.length}%`, flexShrink: 0 }}
                    inert={activeView !== 'teachers' ? true : undefined}
                    aria-hidden={activeView !== 'teachers' ? true : undefined}
                >
                    {mountedViews.teachers ? <TeachersContent /> : null}
                </div>
            </div>
        </div>
    );
}
