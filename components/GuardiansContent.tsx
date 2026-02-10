'use client';

import React from 'react';
import GuardiansHero from '@/app/landing-sections/guardians/GuardiansHero';
import VisibilitySection from '@/app/landing-sections/guardians/VisibilitySection';
import AcademicToolkitSection from '@/app/landing-sections/guardians/AcademicToolkitSection';
import SafetySection from '@/app/landing-sections/guardians/SafetySection';
import CostSection from '@/app/landing-sections/guardians/CostSection';
import SocialProofSection from '@/app/landing-sections/guardians/SocialProofSection';
import GuardiansFinalCTA from '@/app/landing-sections/guardians/GuardiansFinalCTA';
import LandingFooter from '@/app/landing-sections/LandingFooter';

export default function GuardiansContent() {
    return (
        <div className="min-h-screen bg-white dark:bg-gray-950 overflow-x-hidden font-sans">
            {/* 1. HERO — "Keep your child organized" */}
            <GuardiansHero />

            {/* 2. VISIBILITY — "See what they see" */}
            <VisibilitySection />

            {/* 3. ACADEMIC TOOLKIT — "Built-in tutoring, not another tab" */}
            <AcademicToolkitSection />

            {/* 4. SAFETY — "A safe space, built for students" */}
            <SafetySection />

            {/* 5. COST — "Free. Actually free." */}
            <CostSection />

            {/* 6. SOCIAL PROOF — "Built by students who get it" */}
            <SocialProofSection />

            {/* 7. FINAL CTA — "Show them tonight." */}
            <GuardiansFinalCTA />

            {/* FOOTER */}
            <LandingFooter />
        </div>
    );
}
