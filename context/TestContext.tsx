'use client';

import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { format, addDays } from 'date-fns';
import { usePathname } from 'next/navigation';
import { useAuth } from './AuthContext';
import { db } from '@/lib/supabase/db';
import { Database } from '@/types/database.types';
import { getPlanTier, TIER_LIMITS } from '@/lib/planTier';

export type Priority = 'low' | 'medium' | 'high';

export type TestType = 'ALPHA' | 'BETA' | 'Quiz' | 'Other' | 'exam' | 'quiz' | 'midterm' | 'final' | 'project' | 'presentation';
export type StudyMaterial = string | { url: string; title?: string };
export type TestStatus = 'upcoming' | 'preparing' | 'taken' | 'not_started' | 'in_progress' | 'completed' | 'postponed' | 'cancelled';

export type Test = Omit<Database['public']['Tables']['tests']['Row'],
  'test_date' | 'test_time' | 'class_id' | 'study_materials' | 'test_type' |
  'max_score' | 'completed_at' | 'created_at' | 'updated_at'
> & {
  classId: string;
  testDate: string; // ISO date string
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

export const TestProvider = ({ children, initialTests }: { children: React.ReactNode; initialTests?: Test[] }) => {
  const { user } = useAuth();
  const pathname = usePathname();
  const [tests, setTests] = useState<Test[]>(initialTests ?? []);
  const [loading, setLoading] = useState(!initialTests ? true : false);
  const [error, setError] = useState<string | null>(null);

  const hasLoaded = useRef<boolean>(!!(initialTests && initialTests.length > 0));
  
  const needsTestData = useCallback(() => {
    if (typeof window === 'undefined') return false;
    const routesThatNeedData = [
      '/homework', '/classes', '/dashboard', '/calendar', '/settings',
      '/snake', '/games', '/flashcards', '/study-assistant', '/grade-calculator'
    ];
    return routesThatNeedData.some(route => pathname.startsWith(route));
  }, [pathname]);

  const fetchData = useCallback(async () => {
    if (!user || !needsTestData() || hasLoaded.current) return;
    setLoading(true);
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
      setTests(transformedTests);
      hasLoaded.current = true;
      setLoading(false);
    } catch (err) {
      console.error('Error fetching tests:', err);
      setError('Failed to load tests. Please try again.');
      setLoading(false);
    }
  }, [user, needsTestData]);

  const setupSubscriptions = useCallback(async () => {
    if (!user) return;
    try {
      const { supabase } = await import('@/lib/supabase/client');
      supabase
        .channel('tests_changes')
        .on('postgres_changes',
          { event: '*', schema: 'public', table: 'tests', filter: `user_id=eq.${user.id}` },
          (payload: any) => {
            const eventType = payload.eventType.toLowerCase();
            if (eventType === 'insert') {
              const newTest = payload.new as any;
              setTests(prev => {
                if (prev.some(t => t.id === newTest.id)) return prev;
                const newT = {
                  ...newTest,
                  classId: newTest.class_id,
                  testDate: newTest.test_date,
                  testTime: newTest.test_time,
                  testType: newTest.test_type as TestType,
                  maxScore: newTest.max_score,
                  studyMaterials: (newTest.study_materials || []).map((m: any) => {
                    if (typeof m === 'string' && m.startsWith('{')) {
                      try { return JSON.parse(m); } catch (e) { return m; }
                    }
                    return m;
                  }),
                  weight: newTest.weight,
                  location: newTest.location,
                  duration: newTest.duration,
                  priority: (newTest.priority as Priority) || 'medium',
                  status: newTest.status as TestStatus,
                  score: newTest.score,
                  grade: newTest.grade,
                  notes: newTest.notes
                };
                return [...prev, newT];
              });
            } else if (eventType === 'update') {
              const updated = payload.new as any;
              setTests(prev => prev.map(test => test.id === updated.id ? {
                ...test,
                classId: updated.class_id || test.classId,
                testDate: updated.test_date || test.testDate,
                testTime: updated.test_time !== undefined ? updated.test_time : test.testTime,
                testType: updated.test_type ? updated.test_type as TestType : test.testType,
                maxScore: updated.max_score !== undefined ? updated.max_score : test.maxScore,
                studyMaterials: updated.study_materials !== undefined 
                  ? (updated.study_materials as any[]).map((m: any) => {
                      if (typeof m === 'string' && m.startsWith('{')) {
                        try { return JSON.parse(m); } catch (e) { return m; }
                      }
                      return m;
                    })
                  : test.studyMaterials,
                weight: updated.weight !== undefined ? updated.weight : test.weight,
                location: updated.location !== undefined ? updated.location : test.location,
                duration: updated.duration !== undefined ? updated.duration : test.duration,
                priority: updated.priority !== undefined ? updated.priority : test.priority,
                status: test.status,
                score: updated.score !== undefined ? updated.score : test.score,
                grade: updated.grade !== undefined ? updated.grade : test.grade,
                notes: updated.notes !== undefined ? updated.notes : test.notes,
                completed_at: updated.completed_at !== undefined ? updated.completed_at : test.completed_at,
                created_at: updated.created_at !== undefined ? updated.created_at : test.created_at
              } : test));
            } else if (eventType === 'delete') {
              setTests(prev => prev.filter(test => test.id !== (payload.old as any).id));
            }
          }
        ).subscribe();
    } catch (err) {
      console.error('Error setting up subscriptions:', err);
    }
  }, [user]);

  useEffect(() => {
    let isMounted = true;
    const handleVisibilityChange = () => {
      if (!isMounted) return;
      if (document.visibilityState === 'visible' && user && !hasLoaded.current && needsTestData()) {
        fetchData();
      }
    };
    const initialize = async () => {
      if (!hasLoaded.current) await fetchData();
      if (needsTestData()) await setupSubscriptions();
      document.addEventListener('visibilitychange', handleVisibilityChange);
    };
    initialize();
    return () => {
      isMounted = false;
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [user, fetchData, needsTestData, setupSubscriptions]);

  const addTest = async (classId: string, title: string, testDate: Date, testType: TestType, options: any = {}) => {
    if (!user) throw new Error('User not authenticated');
    const tier = getPlanTier();
    const limits = TIER_LIMITS[tier];
    if (limits.activeTests !== Infinity) {
      const activeTestCount = tests.filter(t => ['upcoming', 'preparing', 'not_started', 'in_progress'].includes(t.status)).length;
      if (activeTestCount >= limits.activeTests) {
        throw new Error(`PLAN_LIMIT:The free plan includes up to ${limits.activeTests} active tests — upgrade to Pro for unlimited.`);
      }
    }
    const tempId = `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const optimisticTest: Test = {
      id: tempId,
      user_id: user.id,
      classId,
      title,
      description: options.description || '',
      testDate: format(testDate, 'yyyy-MM-dd'),
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
        test_date: format(addDays(testDate, 1), 'yyyy-MM-dd'),
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
      setTests(prev => prev.map(test => test.id === tempId ? {
        ...test,
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
      } : test));
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
      const dbStatus = updateData.status ? statusMapping[updateData.status] : 'upcoming';
      const dbUpdates: Record<string, any> = {
        title: updateData.title,
        description: updateData.description,
        test_date: updateData.testDate ? new Date(updateData.testDate).toISOString().split('T')[0] : undefined,
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
      const formattedDate = format(newDueDate, 'yyyy-MM-dd');
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
    const futureDate = new Date();
    futureDate.setDate(today.getDate() + daysAhead);
    return tests.filter(test => {
      const testDate = new Date(test.testDate);
      return testDate >= today && testDate <= futureDate && test.status === 'upcoming';
    }).sort((a, b) => new Date(a.testDate).getTime() - new Date(b.testDate).getTime());
  };

  const getTestsByClass = (classId: string): Test[] => {
    return tests.filter(test => test.classId === classId).sort((a, b) => new Date(a.testDate).getTime() - new Date(b.testDate).getTime());
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