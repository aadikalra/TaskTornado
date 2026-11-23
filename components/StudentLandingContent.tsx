'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { usePathname } from 'next/navigation';
import Hero from '@/app/landing-sections/Hero';
import OrganizationSection from '@/app/landing-sections/OrganizationSection';

const ComparisonSection = dynamic(() => import('@/app/landing-sections/ComparisonSection'));
const PromiseSection = dynamic(() => import('@/app/landing-sections/PromiseSection'));
const SocialProofSection = dynamic(() => import('@/app/landing-sections/SocialProofSection'));
const UserReachSection = dynamic(() => import('@/app/landing-sections/UserReachSection'));
const HomepageBadges = dynamic(() => import('@/app/landing-sections/HomepageBadges'));
const LandingFooter = dynamic(() => import('@/app/landing-sections/LandingFooter'));

export default function StudentLandingContent() {
  const pathname = usePathname();
  const [comparisonSet, setComparisonSet] = useState<'chatgpt-notion' | 'gemini-google'>('chatgpt-notion');

  return (
    <div className="min-h-screen bg-[#f4f8da] dark:bg-gray-950 overflow-x-hidden font-sans">
      {/* 1. HERO */}
      <Hero />

      {/* 2. ORGANIZATION - The Foundation */}
      <OrganizationSection id="features" />

      {/* 5. COMPARISON */}
      <ComparisonSection comparisonSet={comparisonSet} onComparisonSetChange={setComparisonSet} />

      {/* 8. THE PROMISE - Pricing */}
      <PromiseSection id="pricing" />

      {/* 9. SOCIAL PROOF */}
      <SocialProofSection />

      {/* 10. USER REACH - Global Map */}
      <UserReachSection />

      {pathname === '/' && <HomepageBadges />}

      {/* FOOTER */}
      <LandingFooter />
    </div>
  );
}
