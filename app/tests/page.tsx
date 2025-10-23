'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useClassContext } from '@/context/ClassContext';
import { Button } from '@/components/ui/button';
import { Plus, GraduationCap, Calendar, Filter } from 'lucide-react';
import Link from 'next/link';
import { ClassTestList } from '@/components/ClassTestList';
import PriorityTestCard from '@/components/PriorityTestCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function TestsPage() {
  const { user, loading: authLoading } = useAuth();
  const { tests, classes, loading: classLoading, deleteTest, deleteClass } = useClassContext();
  const router = useRouter();

  const [filter, setFilter] = useState<'all' | 'upcoming' | 'completed' | 'missed'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'class' | 'type'>('date');

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  if (authLoading || classLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  // Filter and sort tests
  const filteredTests = tests.filter(test => {
    switch (filter) {
      case 'upcoming':
        return test.status === 'upcoming';
      case 'completed':
        return test.status === 'completed';
      case 'missed':
        return test.status === 'missed';
      default:
        return true;
    }
  });

  const sortedTests = [...filteredTests].sort((a, b) => {
    switch (sortBy) {
      case 'date':
        return new Date(a.testDate).getTime() - new Date(b.testDate).getTime();
      case 'class':
        const classA = classes.find(c => c.id === a.classId)?.name || '';
        const classB = classes.find(c => c.id === b.classId)?.name || '';
        return classA.localeCompare(classB);
      case 'type':
        return a.testType.localeCompare(b.testType);
      default:
        return 0;
    }
  });

  // Group tests by class
  const testsByClass = sortedTests.reduce((acc, test) => {
    const classId = test.classId;
    if (!acc[classId]) {
      acc[classId] = [];
    }
    acc[classId].push(test);
    return acc;
  }, {} as Record<string, typeof tests>);

  // Get class info for each class
  const classesWithTests = classes.filter(cls => testsByClass[cls.id]);

  const upcomingTests = tests.filter(test => test.status === 'upcoming');
  const completedTests = tests.filter(test => test.status === 'completed');
  const missedTests = tests.filter(test => test.status === 'missed');

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 overflow-x-hidden font-sans text-gray-900 dark:text-gray-100">
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20">
              <GraduationCap className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Tests & Exams</h1>
              <p className="text-gray-600 dark:text-gray-400">Manage your test schedule and study materials</p>
            </div>
          </div>
        </div>

        {/* Priority Test Card */}
        <PriorityTestCard />

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Tests</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{tests.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Upcoming</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{upcomingTests.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Completed</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">{completedTests.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Missed</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-2xl font-bold text-red-600 dark:text-red-400">{missedTests.length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Actions */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-6">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Filter */}
            <Select value={filter} onValueChange={(value: any) => setFilter(value)}>
              <SelectTrigger className="w-[140px]">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Tests</SelectItem>
                <SelectItem value="upcoming">Upcoming</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="missed">Missed</SelectItem>
              </SelectContent>
            </Select>

            {/* Sort */}
            <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
              <SelectTrigger className="w-[120px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date">By Date</SelectItem>
                <SelectItem value="class">By Class</SelectItem>
                <SelectItem value="type">By Type</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Add Test Button */}
          <Link href="/tests/new">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white">
              <Plus className="w-4 h-4 mr-2" />
              Add Test
            </Button>
          </Link>
        </div>

        {/* Tests by Class */}
        {classesWithTests.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl p-8 text-center shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-50 dark:bg-blue-900/20 mb-4">
              <Calendar className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No tests scheduled</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">
              Start by adding your first test to keep track of your exam schedule
            </p>
            <Link href="/tests/new">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                <Plus className="mr-1.5 h-4 w-4" /> Add Your First Test
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {classesWithTests.map((cls) => (
              <ClassTestList
                key={cls.id}
                classItem={cls}
                tests={testsByClass[cls.id] || []}
                onToggle={async (id: string) => {
                  // For now, just mark as completed if not already completed
                  const test = tests.find(t => t.id === id);
                  if (test && test.status !== 'completed') {
                    // This would call the context method when implemented
                    console.log('Marking test as completed:', id);
                  }
                }}
                onDeleteTest={deleteTest}
                onDeleteClass={deleteClass}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
