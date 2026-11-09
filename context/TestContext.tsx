'use client';

import { useSchoolDataSync } from '@/hooks/use-school-data-sync';

import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { useAuth } from './AuthContext';
import { db } from '@/lib/supabase/db';
import { Database } from '@/types/database.types';
import { getPlanTier, TIER_LIMITS } from '@/lib/planTier';
import { formatCalendarDate, parseCalendarDate } from '@/lib/dateUtils';

export type Priority = 'low' | 'medium' | 'high';

export type TestType = 'ALPHA' | 'BETA' | 'Quiz' | 'Other' | 'exam' | 'quiz' | 'midterm' | 'final' | 'project' | 'presentation';
export type StudyMaterial = string | { url: string; title?: string };
export type TestStatus = 'upcoming' | 'preparing' | 'taken' | 'not_started' | 'in_progress' | 'completed' | 'postponed' | 'cancelled';

export type Test = Omit<Database['public']['Tables']['tests']['Row'],
  'test_date' | 'test_time' | 'class_id' | 'study_materials' | 'test_type' |
  'max_score' | 'completed_at' | 'created_at' | 'updated_at'
> & {
  classId: string;
  testDate: string; // Calendar date in yyyy-MM-dd format
  testTime: string | null; // ISO time string
  testType: TestType;
  maxScore: number | null;
  studyMaterials: StudyMaterial[];
  weight: number | null;
  location: string | null;
  duration: number | null;
  priority: Priority;
  status: TestStatus;
  score: number | null;
  grade: string | null;
  notes: string | null;
  completed_at: string | null;
  created_at: string | null;
};

export interface TestContextType {
  tests: Test[];
  loading: boolean;
  error: string | null;
  addTest: (classId: string, title: string, testDate: Date, testType: TestType, options?: {
    testTime?: Date;
    weight?: number;
    location?: string;
    duration?: number;
    priority?: Priority;
    description?: string;
    studyMaterials?: StudyMaterial[];
    notes?: string;
  }) => Promise<void>;
  updateTest: (id: string, updates: Partial<Test>) => Promise<void>;
  deleteTest: (id: string) => Promise<void>;
  updateTestDueDate: (testId: string, newDueDate: Date) => Promise<void>;
  markTestComplete: (id: string, score?: number, maxScore?: number, grade?: string) => Promise<void>;
  getUpcomingTests: (daysAhead?: number) => Test[];
  getTestsByClass: (classId: string) => Test[];
  updateTestStatus: (id: string, status: TestStatus) => Promise<void>;
}

const TestContext = createContext<TestContextType | undefined>(undefined);

type TestProviderProps = { children: React.ReactNode; initialTests?: Test[] };
export const TestProvider = (props: TestProviderProps) => {
  const parent = useContext(TestContext);
  return parent ? <>{props.children}</> : <TestProviderState {...props} />;
};
const TestProviderState = ({ children, initialTests }: TestProviderProps) => {
  const { user } = useAuth();
  const pathname = usePathname();
  const [tests, setTests] = useState<Test[]>(initialTests ?? []);
  const [loading, setLoading] = useState(!initialTests ? true : false);
  const [error, setError] = useState<string | null>(null);

  const accountRef = useRef(user?.id);
  accountRef.current = user?.id;
  const hasLoaded = useRef<boolean>(!!(initialTests && initialTests.length > 0));
  
  const needsTestData = useCallback(() => {
    if (typeof window === 'undefined') return false;
    const routesThatNeedData = [
      '/homework', '/classes', '/dashboard', '/calendar', '/settings', '/newhome',
      '/snake', '/games', '/flashcards', '/study-assistant', '/grade-calculator'
    ];
    return routesThatNeedData.some(route => pathname.startsWith(route));
  }, [pathname]);

  const fetchData = useCallback(async () => {
    if (!user || !needsTestData()) return;
    if (!hasLoaded.current) setLoading(true);
    setError(null);
    try {
      const testsData = await db.getTests(user.id);
      
      const transformedTests = testsData.map(test => ({
        ...test,
        classId: test.class_id,
        testDate: test.test_date,
        testTime: test.test_time,
        testType: test.test_type as TestType,
        maxScore: test.max_score,
        studyMaterials: (test.study_materials || []).map((m: any) => {
          if (typeof m === 'string' && m.startsWith('{')) {
            try { return JSON.parse(m); } catch (e) { return m; }
          }
          return m;
        }),
        weight: test.weight,
        location: test.location,
        duration: test.duration,
        priority: (test.priority as Priority) || 'medium',
        status: test.status as TestStatus,
        score: test.score,
        grade: test.grade,
        notes: test.notes
      }));
      if (accountRef.current !== user.id) return;
      setTests(transformedTests);
      hasLoaded.current = true;
      setLoading(false);
    } catch (err) {
      if (accountRef.current !== user.id) return;
      console.error('Error fetching tests:', err);
      setError('Failed to load tests. Please try again.');
      setLoading(false);
    }
  }, [user, needsTestData]);

  useSchoolDataSync('tests', user?.id, needsTestData(), fetchData);
  useEffect(() => {
    hasLoaded.current = false;
    setTests([]);
    setError(null);
  }, [user?.id]);

  const addTest = async (classId: string, title: string, testDate: Date, testType: TestType, options: any = {}) => {
    if (!user) throw new Error('User not authenticated');
    const tier = getPlanTier();
    const limits = TIER_LIMITS[tier];
    if (limits.activeTests !== Infinity) {
      const activeTestCount = tests.filter(t => ['upcoming', 'preparing', 'not_started', 'in_progress'].includes(t.status)).length;
      if (activeTestCount >= limits.activeTests) {
        throw new Error(`PLAN_LIMIT:The free plan includes up to ${limits.activeTests} active tests.`);
      }
    }
    const tempId = `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const optimisticTest: Test = {
      id: tempId,
      user_id: user.id,
      classId,
      title,
      description: options.description || '',
      testDate: formatCalendarDate(testDate),
      testTime: options.testTime ? options.testTime.toISOString().split('T')[1].split('.')[0] : null,
      testType,
      maxScore: null,
      studyMaterials: options.studyMaterials || [],
      weight: options.weight || null,
      location: options.location || null,
      duration: options.duration || null,
      priority: options.priority || 'medium',
      status: 'upcoming',
      score: null,
      grade: null,
      notes: options.notes || null,
      completed_at: null,
      created_at: new Date().toISOString()
    };
    try {
      setTests(prev => [...prev, optimisticTest]);
      const testData = {
        title,
        description: options.description || '',
        test_date: formatCalendarDate(testDate),
        test_time: options.testTime ? options.testTime.toISOString().split('T')[1].split('.')[0] : null,
        test_type: testType,
        weight: options.weight,
        location: options.location,
        duration: options.duration,
        priority: options.priority || 'medium',
        class_id: classId,
        user_id: user.id,
        study_materials: (options.studyMaterials || []).map((m: any) => typeof m === 'string' ? m : JSON.stringify(m)) as string[],
        notes: options.notes
      };
      const createdTest = await db.createTest(testData);
      setTests(prev => [...prev.filter(test => test.id !== tempId && test.id !== createdTest.id), {
        ...optimisticTest,
        ...createdTest,
        id: createdTest.id,
        classId: createdTest.class_id,
        testDate: createdTest.test_date,
        testTime: createdTest.test_time,
        testType: createdTest.test_type as TestType,
        maxScore: createdTest.max_score,
        priority: (createdTest.priority as Priority) || 'medium',
        studyMaterials: (createdTest.study_materials || []).map((m: any) => {
          if (typeof m === 'string' && m.startsWith('{')) {
            try { return JSON.parse(m); } catch (e) { return m; }
          }
          return m;
        }),
        created_at: createdTest.created_at,
        status: (createdTest.status as TestStatus) || 'upcoming',
      }]);
    } catch (err) {
      setTests(prev => prev.filter(test => test.id !== tempId));
      throw err;
    }
  };

  const updateTest = async (id: string, updates: Partial<Test>) => {
    if (!user) throw new Error('User not authenticated');
    try {
      const updateData = { ...updates };
      const statusMapping: Record<string, 'upcoming' | 'taken'> = {
        'not_started': 'upcoming', 'in_progress': 'upcoming', 'completed': 'taken', 'postponed': 'upcoming', 'cancelled': 'upcoming'
      };
      if (updateData.grade && updateData.status !== 'taken') updateData.status = 'taken';
      const dbStatus = updateData.status ? (statusMapping[updateData.status] ?? updateData.status) : undefined;
      const dbUpdates: Record<string, any> = {
        title: updateData.title,
        description: updateData.description,
        test_date: updateData.testDate ? formatCalendarDate(updateData.testDate) : undefined,
        test_time: updateData.testTime || undefined,
        test_type: updateData.testType,
        weight: updateData.weight,
        location: updateData.location,
        duration: updateData.duration,
        priority: updateData.priority,
        status: dbStatus,
        score: updateData.score,
        max_score: updateData.maxScore,
        grade: updateData.grade,
        study_materials: updateData.studyMaterials ? updateData.studyMaterials.map(m => typeof m === 'string' ? m : JSON.stringify(m)) : undefined,
        notes: updateData.notes,
        updated_at: new Date().toISOString()
      };
      Object.keys(dbUpdates).forEach((key: string) => {
        if (dbUpdates[key] === undefined) delete dbUpdates[key];
      });
      await db.updateTest(id, dbUpdates);
      setTests(prev => prev.map(test => test.id === id ? { ...test, ...updateData } : test));
    } catch (err) {
      throw err;
    }
  };

  const deleteTest = async (id: string) => {
    if (!user) throw new Error('User not authenticated');
    try {
      await db.deleteTest(id, user.id);
      setTests(prev => prev.filter(test => test.id !== id));
    } catch (err) {
      throw err;
    }
  };

  const updateTestDueDate = async (testId: string, newDueDate: Date) => {
    if (!user) throw new Error('User not authenticated');
    try {
      const formattedDate = formatCalendarDate(newDueDate);
      await db.updateTest(testId, { test_date: formattedDate });
      setTests(prev => prev.map(test => test.id === testId ? { ...test, testDate: formattedDate } : test));
    } catch (err) {
      throw err;
    }
  };

  const markTestComplete = async (id: string, score?: number, maxScore?: number, grade?: string) => {
    if (!user) throw new Error('User not authenticated');
    try {
      await db.updateTest(id, { status: 'taken', score, max_score: maxScore, grade });
      setTests(prev => prev.map(test => test.id === id ? {
        ...test, status: 'taken' as TestStatus, score: score || null, maxScore: maxScore || null, grade: grade || null
      } : test));
    } catch (err) {
      throw err;
    }
  };

  const getUpcomingTests = (daysAhead: number = 30): Test[] => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const futureDate = new Date();
    futureDate.setHours(0, 0, 0, 0);
    futureDate.setDate(today.getDate() + daysAhead);
    return tests.filter(test => {
      const testDate = parseCalendarDate(test.testDate);
      return testDate >= today && testDate <= futureDate && test.status === 'upcoming';
    }).sort((a, b) => parseCalendarDate(a.testDate).getTime() - parseCalendarDate(b.testDate).getTime());
  };

  const getTestsByClass = (classId: string): Test[] => {
    return tests.filter(test => test.classId === classId).sort((a, b) => parseCalendarDate(a.testDate).getTime() - parseCalendarDate(b.testDate).getTime());
  };

  const updateTestStatus = async (id: string, status: TestStatus) => {
    if (!user) throw new Error('User not authenticated');
    try {
      await db.updateTest(id, { status: status });
      setTests(prev => prev.map(test => test.id === id ? { ...test, status: status } : test));
    } catch (err) {
      throw err;
    }
  };

  const value = {
    tests,
    loading,
    error,
    addTest,
    updateTest,
    deleteTest,
    updateTestDueDate,
    markTestComplete,
    getUpcomingTests,
    getTestsByClass,
    updateTestStatus,
  };

  return <TestContext.Provider value={value}>{children}</TestContext.Provider>;
};

export const useTestContext = () => {
  const context = useContext(TestContext);
  if (context === undefined) throw new Error('useTestContext must be used within a TestProvider');
  return context;
};
