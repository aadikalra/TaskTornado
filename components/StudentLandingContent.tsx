'use client';

import React, { useState } from 'react';
import { Clock } from 'lucide-react';
import Hero from '@/app/landing-sections/Hero';
import OrganizationSection from '@/app/landing-sections/OrganizationSection';
import BentoGridSection from '@/app/landing-sections/BentoGridSection';
import ComparisonSection from '@/app/landing-sections/ComparisonSection';
import WellbeingSection from '@/app/landing-sections/WellbeingSection';
import PromiseSection from '@/app/landing-sections/PromiseSection';
import SocialProofSection from '@/app/landing-sections/SocialProofSection';
import LandingFooter from '@/app/landing-sections/LandingFooter';
import UserReachSection from '@/app/landing-sections/UserReachSection';

// Sample homework data for the organization section demo
const sampleHomeworkItems = [
  {
    id: '1',
    text: 'Chapter 8 Problems',
    completed: true,
    subtext: 'Math',
    priority: 'high' as const,
    pinned: false,
    links: [],
    tags: [],
    dueDateIcon: <Clock className="w-3 h-3" />
  },
  {
    id: '2',
    text: 'WWII Essay Draft',
    completed: false,
    subtext: 'History',
    priority: 'medium' as const,
    pinned: false,
    links: [],
    tags: [],
    dueDateIcon: <Clock className="w-3 h-3" />
  },
  {
    id: '3',
    text: 'Lab Report',
    completed: false,
    subtext: 'Science',
    priority: 'low' as const,
    pinned: false,
    links: [],
    tags: [],
    dueDateIcon: <Clock className="w-3 h-3" />
  }
];

export default function StudentLandingContent() {
  const [comparisonSet, setComparisonSet] = useState<'chatgpt-notion' | 'gemini-google'>('chatgpt-notion');
  const [homeworkItems, setHomeworkItems] = useState(sampleHomeworkItems);

  const handleItemToggle = (id: string) => {
    setHomeworkItems(items =>
      items.map(item =>
        item.id === id ? { ...item, completed: !item.completed } : item
      )
    );
  };

  return (
    <div className="min-h-screen bg-[#f4f8da] dark:bg-gray-950 overflow-x-hidden font-sans">
      {/* 1. HERO */}
      <Hero />

      {/* 2. ORGANIZATION - The Foundation */}
      <OrganizationSection id="features" homeworkItems={homeworkItems} onItemToggle={handleItemToggle} />

      {/* 3. BENTO GRID - Feature Showcase */}
      <BentoGridSection id="ai" />

      {/* 4. COMPARISON */}
      <ComparisonSection comparisonSet={comparisonSet} onComparisonSetChange={setComparisonSet} />

      {/* 5. WELLBEING - The Support */}
      <WellbeingSection />

      {/* 8. THE PROMISE - Pricing */}
      <PromiseSection id="pricing" />

      {/* 9. SOCIAL PROOF */}
      <SocialProofSection />

      {/* 10. USER REACH - Global Map */}
      <UserReachSection />

      {/* FOOTER */}
      <LandingFooter />
    </div>
  );
}
