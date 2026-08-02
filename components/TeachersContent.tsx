'use client';

import React from 'react';
import TeachersHero from '@/app/landing-sections/teachers/TeachersHero';
import GoogleClassroomSection from '@/app/landing-sections/teachers/GoogleClassroomSection';
import AccountabilitySection from '@/app/landing-sections/teachers/AccountabilitySection';
import TeachersSafetySection from '@/app/landing-sections/teachers/TeachersSafetySection';
import PromiseSection from '@/app/landing-sections/PromiseSection';
import TeachersFinalCTA from '@/app/landing-sections/teachers/TeachersFinalCTA';
import LandingFooter from '@/app/landing-sections/LandingFooter';

export default function TeachersContent() {
    return (
        <div className="min-h-screen bg-[#f4f8da] dark:bg-gray-950 overflow-x-hidden font-sans">
            {/* 1. HERO — "Your students show up prepared" */}
            <TeachersHero />

            {/* 2. GOOGLE CLASSROOM — planned integration */}
            <GoogleClassroomSection />

            {/* 3. ACCOUNTABILITY — "They actually do the homework" */}
            <AccountabilitySection />

            {/* 5. SAFETY — "Built for classrooms, not boardrooms" */}
            <TeachersSafetySection />

            {/* 6. COST — "Free for every student. No exceptions." */}
            <PromiseSection id="pricing" />

            {/* 7. FINAL CTA — "Share it with your class" */}
            <TeachersFinalCTA />

            {/* FOOTER */}
            <LandingFooter />
        </div>
    );
}
