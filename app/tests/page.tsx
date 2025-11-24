'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useClassContext } from '@/context/ClassContext';
import { Button } from '@/components/ui/button';
import { Plus, GraduationCap, Calendar, Filter, Target, Zap, Brain } from 'lucide-react';
import Link from 'next/link';
import StatusGroupedTestList from '@/components/StatusGroupedTestList';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useWideLayout } from '@/hooks/use-wide-layout';

export default function TestsPage() {
  const { user, loading: authLoading } = useAuth();
  const { tests, classes, loading: classLoading, deleteTest, deleteClass } = useClassContext();
  const router = useRouter();
  const { getContainerClass } = useWideLayout();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  if (authLoading || classLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary dark:border-blue-400" />
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/20 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900 overflow-x-hidden font-sans text-gray-900 dark:text-gray-100">
      <main className={getContainerClass('max-w-7xl') + ' py-8'}>
        {/* Enhanced Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-3">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 dark:from-blue-900/20 dark:to-purple-900/20 border border-blue-200/50 dark:border-blue-800/50">
              <GraduationCap className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                Tests & Exams
              </h1>
              <p className="text-gray-600 dark:text-gray-400 text-lg">
                Manage your test schedule and track your academic progress
              </p>
            </div>
          </div>
        </div>

        {/* Enhanced Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-4 mb-8">
          <Card className="bg-white/70 dark:bg-gray-900/40 backdrop-blur border-gray-200/50 dark:border-gray-800/50 hover:shadow-lg transition-all duration-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Tests</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-3xl font-bold text-gray-900 dark:text-white">{tests.length}</div>
              <div className="flex items-center gap-1 mt-1">
                <div className="h-2 w-2 rounded-full bg-gray-400"></div>
                <span className="text-xs text-gray-500 dark:text-gray-400">all time</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/70 dark:bg-gray-900/40 backdrop-blur border-gray-200/50 dark:border-gray-800/50 hover:shadow-lg transition-all duration-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Upcoming</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">{upcomingTests.length}</div>
              <div className="flex items-center gap-1 mt-1">
                <Calendar className="h-3 w-3 text-blue-500" />
                <span className="text-xs text-gray-500 dark:text-gray-400">scheduled</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/70 dark:bg-gray-900/40 backdrop-blur border-gray-200/50 dark:border-gray-800/50 hover:shadow-lg transition-all duration-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Completed</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">{takenTests.length}</div>
              <div className="flex items-center gap-1 mt-1">
                <div className="h-2 w-2 rounded-full bg-emerald-500"></div>
                <span className="text-xs text-gray-500 dark:text-gray-400">finished</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/70 dark:bg-gray-900/40 backdrop-blur border-gray-200/50 dark:border-gray-800/50 hover:shadow-lg transition-all duration-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">ALPHA Tests</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">{alphaTests.length}</div>
              <div className="flex items-center gap-1 mt-1">
                <Target className="h-3 w-3 text-purple-500" />
                <span className="text-xs text-gray-500 dark:text-gray-400">special</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/70 dark:bg-gray-900/40 backdrop-blur border-gray-200/50 dark:border-gray-800/50 hover:shadow-lg transition-all duration-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">BETA Tests</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-3xl font-bold text-orange-600 dark:text-orange-400">{betaTests.length}</div>
              <div className="flex items-center gap-1 mt-1">
                <Zap className="h-3 w-3 text-orange-500" />
                <span className="text-xs text-gray-500 dark:text-gray-400">advanced</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/70 dark:bg-gray-900/40 backdrop-blur border-gray-200/50 dark:border-gray-800/50 hover:shadow-lg transition-all duration-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Success Rate</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">
                {tests.length > 0 ? Math.round((takenTests.length / tests.length) * 100) : 0}%
              </div>
              <div className="flex items-center gap-1 mt-1">
                <Brain className="h-3 w-3 text-indigo-500" />
                <span className="text-xs text-gray-500 dark:text-gray-400">overall</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Tests List */}
        <StatusGroupedTestList
          tests={tests}
          classes={classes}
          onDeleteTest={deleteTest}
        />
      </main>
    </div>
  );
}
