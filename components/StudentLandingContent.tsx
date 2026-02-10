'use client';

import React, { useState } from 'react';
import { Clock } from 'lucide-react';
import Hero from '@/app/landing-sections/Hero';
import OrganizationSection from '@/app/landing-sections/OrganizationSection';
import BentoGridSection from '@/app/landing-sections/BentoGridSection';
import ComparisonSection from '@/app/landing-sections/ComparisonSection';
import WellbeingSection from '@/app/landing-sections/WellbeingSection';
import PromiseSection from '@/app/landing-sections/PromiseSection';
import FinalCTASection from '@/app/landing-sections/FinalCTASection';
import LandingFooter from '@/app/landing-sections/LandingFooter';

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
    <div className="min-h-screen bg-white dark:bg-gray-950 overflow-x-hidden font-sans">
      {/* 1. HERO */}
      <Hero />

      {/* 2. ORGANIZATION - The Foundation */}
      <OrganizationSection homeworkItems={homeworkItems} onItemToggle={handleItemToggle} />

      {/* 3. BENTO GRID - Feature Showcase */}
      <BentoGridSection />

      {/* 4. COMPARISON */}
      <ComparisonSection comparisonSet={comparisonSet} onComparisonSetChange={setComparisonSet} />

      {/* 5. WELLBEING - The Support */}
      <WellbeingSection />

      {/* 8. THE PROMISE - Pricing */}
      <PromiseSection />

      {/* 9. FINAL CTA */}
      <FinalCTASection />

      {/* FOOTER */}
      <LandingFooter />
    </div>
  );
}
