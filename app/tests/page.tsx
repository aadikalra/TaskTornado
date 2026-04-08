'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useClassContext } from '@/context/ClassContext';
import { GraduationCap, Calendar, Target, Zap, Brain, CheckCircle2, Loader2 } from 'lucide-react';
import { HugeIcon } from '@/lib/huge-icon-map';
import StatusGroupedTestList from '@/components/StatusGroupedTestList';
import { useWideLayout } from '@/hooks/use-wide-layout';
import { useRouteIntro } from '@/hooks/use-route-intro';
import { RouteIntroPopup } from '@/components/RouteIntroPopup';
import { motion } from 'framer-motion';

export default function TestsPage() {
  const { user, loading: authLoading } = useAuth();
  const { tests, classes, loading: classLoading, deleteTest } = useClassContext();
  const router = useRouter();
  const { getContainerClass } = useWideLayout();
  const { showIntro, dismissIntro } = useRouteIntro('tests');

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  if (authLoading || classLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fffaf4] dark:bg-gray-950">
        <Loader2 className="h-6 w-6 animate-spin text-sky-500" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const upcomingTests = tests.filter(test => test.status === 'upcoming');
  const takenTests = tests.filter(test => test.status === 'taken');
  const alphaTests = tests.filter(test => test.testType?.toLowerCase() === 'alpha');
  const betaTests = tests.filter(test => test.testType?.toLowerCase() === 'beta');
  const successRate = tests.length > 0 ? Math.round((takenTests.length / tests.length) * 100) : 0;

  const stats = [
    { label: 'Total', value: tests.length, icon: GraduationCap, color: '#0ea5e9', sub: 'all time' },
    { label: 'Upcoming', value: upcomingTests.length, icon: Calendar, color: '#2563EB', sub: 'scheduled' },
    { label: 'Completed', value: takenTests.length, icon: CheckCircle2, color: '#16A34A', sub: 'finished' },
    { label: 'ALPHA', value: alphaTests.length, icon: Target, color: '#7C3AED', sub: 'special' },
    { label: 'BETA', value: betaTests.length, icon: Zap, color: '#D97706', sub: 'advanced' },
    { label: 'Rate', value: `${successRate}%`, icon: Brain, color: '#0D9488', sub: 'overall' },
  ];

  return (
    <div className="min-h-screen bg-[#fffaf4] dark:bg-gray-950 overflow-x-hidden font-sans text-[#111827] dark:text-gray-100">
      <main className={getContainerClass('max-w-7xl') + ' pt-28 pb-12'}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3.5 mb-1">
            <div className="shrink-0 w-12 h-12 rounded-xl bg-sky-50 dark:bg-sky-500/10 border border-sky-100 dark:border-sky-800/30 flex items-center justify-center">
              <GraduationCap className="h-6 w-6 text-sky-500 dark:text-sky-400" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-sky-500 dark:text-sky-400">
                Tests & Exams
              </h1>
              <p className="text-sm text-sky-600/40 dark:text-sky-400/35 font-medium">
                Manage your test schedule and track your progress
              </p>
            </div>
          </div>
        </motion.div>

        {/* Stats row */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.04 }}
          className="grid grid-cols-3 sm:grid-cols-6 gap-2.5 mb-8"
        >
          {stats.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
                className="relative p-3.5 rounded-2xl bg-white dark:bg-gray-900 border border-sky-100/60 dark:border-gray-800 overflow-hidden group hover:border-sky-200 dark:hover:border-gray-700 transition-colors"
              >
                {/* Decorative accent dot */}
                <div
                  className="absolute top-3 right-3 w-1.5 h-1.5 rounded-full opacity-40"
                  style={{ backgroundColor: stat.color }}
                />
                <div className="flex items-center gap-2 mb-1.5">
                  <Icon className="h-3.5 w-3.5 opacity-50" style={{ color: stat.color }} />
                  <span className="text-[10px] font-semibold text-sky-600/40 dark:text-sky-400/30 uppercase tracking-wider">
                    {stat.label}
                  </span>
                </div>
                <div className="text-xl font-bold text-sky-900 dark:text-white leading-none mb-0.5">
                  {stat.value}
                </div>
                <span className="text-[10px] text-sky-500/30 dark:text-sky-400/20 font-medium">{stat.sub}</span>
              </div>
            );
          })}
        </motion.div>

        {/* Test List */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
        >
          <StatusGroupedTestList
            tests={tests}
            classes={classes}
            onDeleteTest={deleteTest}
          />
        </motion.div>
      </main>

      {/* Route Intro Popup */}
      <RouteIntroPopup
        isOpen={showIntro}
        onClose={dismissIntro}
        title="Welcome to Tests & Exams!"
        description="Manage your test schedule and track your academic performance"
        icon={<HugeIcon name="Mortarboard02" size={24} className="h-6 w-6" />}
        features={[
          'Track upcoming tests and completed exams',
          'View stats including ALPHA/BETA tests',
          'Organize tests by status and type',
          'Monitor your success rate and progress',
        ]}
      />
    </div>
  );
}
