'use client';

import React from 'react';
import GuardiansHero from '@/app/landing-sections/guardians/GuardiansHero';
import VisibilitySection from '@/app/landing-sections/guardians/VisibilitySection';
import SafetySection from '@/app/landing-sections/guardians/SafetySection';


import PromiseSection from '@/app/landing-sections/PromiseSection';
import SocialProofSection from '@/app/landing-sections/guardians/SocialProofSection';
import GuardiansFinalCTA from '@/app/landing-sections/guardians/GuardiansFinalCTA';
import LandingFooter from '@/app/landing-sections/LandingFooter';


export default function GuardiansContent() {

    return (
        <div className="min-h-screen bg-[#f4f8da] dark:bg-gray-950 overflow-x-hidden font-sans">
            {/* 1. HERO — "Keep your child organized" */}
            <GuardiansHero />

            {/* 2. VISIBILITY — "See what they see" */}
            <VisibilitySection />

            {/* 3. ACADEMIC TOOLKIT — "Built-in tutoring, not another tab" */}
            {/* 4. SAFETY — "A safe space, built for students" */}
            <SafetySection />





            {/* 7. THE PROMISE — Pricing */}
            <PromiseSection />

            {/* 8. SOCIAL PROOF — "Built by students who get it" */}
            <SocialProofSection />

            {/* 9. FINAL CTA — "Show them tonight." */}
            <GuardiansFinalCTA />

            {/* FOOTER */}
            <LandingFooter />
        </div>
    );
}
