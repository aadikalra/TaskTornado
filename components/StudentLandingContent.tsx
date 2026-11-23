'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { Clock } from 'lucide-react';
import { usePathname } from 'next/navigation';
import Hero from '@/app/landing-sections/Hero';
import OrganizationSection from '@/app/landing-sections/OrganizationSection';

const ComparisonSection = dynamic(() => import('@/app/landing-sections/ComparisonSection'));
const PromiseSection = dynamic(() => import('@/app/landing-sections/PromiseSection'));
const SocialProofSection = dynamic(() => import('@/app/landing-sections/SocialProofSection'));
const UserReachSection = dynamic(() => import('@/app/landing-sections/UserReachSection'));
const HomepageBadges = dynamic(() => import('@/app/landing-sections/HomepageBadges'));
const LandingFooter = dynamic(() => import('@/app/landing-sections/LandingFooter'));

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
  const pathname = usePathname();
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
