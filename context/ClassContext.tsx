'use client';

import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { format, addDays } from 'date-fns';
import { usePathname } from 'next/navigation';
import { useAuth } from './AuthContext';
import { db } from '@/lib/supabase/db';
import { Database } from '@/types/database.types';
import { RecurringHomeworkService } from '@/lib/services/RecurringHomeworkService';
import { getPlanTier, TIER_LIMITS, getTierLabel } from '@/lib/planTier';

import Cookies from 'js-cookie';

// Predefined color palette for consistent class colors
const classColorPalette = [
  '#E53E3E', // red
  '#3182CE', // blue
  '#D69E2E', // yellow
  '#38A169', // green
  '#805AD5', // purple
  '#D53F8C', // pink
  '#2C7A7B', // teal
  '#DD6B20', // orange
  '#00B5D8', // cyan
  '#5A67D8', // indigo
];

// Function to generate a consistent color from a string (e.g., class ID)
const generateConsistentColor = (id: string) => {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    const char = id.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  const index = Math.abs(hash) % classColorPalette.length;
  return classColorPalette[index];
};


// Type for HugeIcon names
export type HugeIconName = string;

export type Class = Omit<Database['public']['Tables']['classes']['Row'], 'icon'> & {
  icon: HugeIconName;
};

export type Priority = 'low' | 'medium' | 'high';

export type HomeworkLink = {
  id: string;
  url: string;
  title?: string;
};

export type RecurringFrequency = 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'yearly';

export type RecurringHomework = {
  frequency: RecurringFrequency;
  endDate?: Date; // Optional end date for recurring series
  maxOccurrences?: number; // Optional maximum number of occurrences
  parentRecurringId?: string; // Links to the original recurring homework
};

export type Homework = Omit<Database['public']['Tables']['homework']['Row'], 'links' | 'priority' | 'due_date' | 'class_id' | 'completed'> & {
  links: HomeworkLink[];
  priority: Priority;
  classId: string;
  dueDate: string;
  pinned: boolean;
  completed: boolean;
  recurring?: RecurringHomework; // Optional recurring configuration
};

// Test types
export type TestType = 'ALPHA' | 'BETA' | 'Quiz' | 'Other' | 'exam' | 'quiz' | 'midterm' | 'final' | 'project' | 'presentation';
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
  studyMaterials: string[];
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

interface ClassContextType {
  classes: Class[];
  homeworks: Homework[];
  tests: Test[];
  loading: boolean;
  error: string | null;
  addClass: (name: string, icon: HugeIconName) => Promise<string>;
  addHomework: (classId: string, title: string, dueDate: Date, priority?: Priority, links?: HomeworkLink[], description?: string, completed?: boolean) => Promise<void>;
  addRecurringHomework: (classId: string, title: string, dueDate: Date, priority: Priority, links: HomeworkLink[], recurring: RecurringHomework, description?: string) => Promise<void>;
  toggleHomework: (id: string) => Promise<void>;
  togglePinHomework: (id: string, pinned: boolean) => Promise<void>;
  updateClass: (id: string, updates: Partial<Class>) => Promise<void>;
  deleteClass: (id: string) => Promise<void>;
  deleteHomework: (id: string) => Promise<void>;
  deleteRecurringSeries: (recurringId: string) => Promise<void>;
  updateHomeworkDueDate: (homeworkId: string, newDueDate: Date) => Promise<void>;
  updateHomework: (id: string, updates: Partial<Homework>) => Promise<void>;
  clearAllClasses: () => Promise<void>;
  clearAllHomeworks: () => Promise<void>;

  // Test management methods
  addTest: (classId: string, title: string, testDate: Date, testType: TestType, options?: {
    testTime?: Date;
    weight?: number;
    location?: string;
    duration?: number;
    priority?: Priority;
    description?: string;
    studyMaterials?: string[];
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

const ClassContext = createContext<ClassContextType | undefined>(undefined);

export const ClassProvider = ({ children, initialClasses, initialHomeworks, initialTests }: { children: React.ReactNode; initialClasses?: Class[]; initialHomeworks?: Homework[]; initialTests?: Test[] }) => {
  const { user, isGoogleUser } = useAuth();
  const pathname = usePathname();
  const [classes, setClasses] = useState<Class[]>(initialClasses ?? []);
  const [homeworks, setHomeworks] = useState<Homework[]>(initialHomeworks ?? []);
  const [tests, setTests] = useState<Test[]>(initialTests ?? []);
  const [loading, setLoading] = useState(!(initialClasses || initialHomeworks || initialTests) ? true : false);
  const [error, setError] = useState<string | null>(null);

  // Track if we've already loaded data to prevent unnecessary refetches
  const hasLoaded = useRef<boolean>(
    (initialClasses && initialClasses.length > 0) ||
    (initialHomeworks && initialHomeworks.length > 0) ||
    (initialTests && initialTests.length > 0)
  );

  // Function to check if current route needs class/homework data
  const needsClassData = useCallback(() => {
    if (typeof window === 'undefined') return false;

    const routesThatNeedClassData = [
      '/homework',
      '/classes',
      '/dashboard',
      '/calendar',
      '/settings',
      '/snake',
      '/games',
      '/flashcards',
      '/study-assistant'
    ];

    return routesThatNeedClassData.some(route => pathname.startsWith(route));
  }, [pathname]);

  // Fetch data from Supabase or Google Classroom API
  const fetchData = useCallback(async () => {
    // Only fetch if we have a user and the current route needs class data
    if (!user || !needsClassData() || hasLoaded.current) {
      console.log('Skipping data fetch - no user, route doesn\'t need data, or already loaded');
      return;
    }

    console.log('Fetching data for user:', user.id, 'isGoogleUser:', isGoogleUser);
    setLoading(true);
    setError(null);

    try {
      // Fetch data from Supabase for all users (including Google users)
      // The Google Classroom data is saved to the database, so we need to load it
      console.log('Fetching data from Supabase database...');
      const [classesData, homeworksData, testsData] = await Promise.all([
        db.getClasses(user.id),
        db.getHomework(user.id), // Get all homework
        db.getTests(user.id) // Get all tests
      ]);

      console.log('Fetched data from Supabase successfully');

      setClasses(classesData as Class[]);

      // Transform homework data to ensure consistent types
      const transformedHomeworks = homeworksData.map(hw => {
        // Parse links if it's a string
        let links: HomeworkLink[] = [];
        if (hw.links) {
          try {
            links = typeof hw.links === 'string' ? JSON.parse(hw.links) : hw.links;
            if (!Array.isArray(links)) links = [];
            links = links.map((l: any) => ({
              ...l,
              id: l.id || Math.random().toString(36).substring(2, 9)
            }));
          } catch (e) {
            console.error('Error parsing links:', e);
            links = [];
          }
        }

        return {
          ...hw,
          links: links,
          priority: (hw.priority as Priority) || 'medium',
          dueDate: hw.due_date,
          classId: hw.class_id,
          pinned: hw.pinned || false,
          completed: hw.completed || false
        };
      });

      // Transform tests data to ensure consistent types
      const transformedTests = testsData.map(test => ({
        ...test,
        classId: test.class_id,
        testDate: test.test_date,
        testTime: test.test_time,
        testType: test.test_type as TestType,
        maxScore: test.max_score,
        studyMaterials: test.study_materials || [],
        weight: test.weight,
        location: test.location,
        duration: test.duration,
        priority: (test.priority as Priority) || 'medium',
        status: test.status as TestStatus,
        score: test.score,
        grade: test.grade,
        notes: test.notes
      }));

      setHomeworks(transformedHomeworks);
      setTests(transformedTests);

      // Store class colors in a cookie
      const colorMap = classesData.reduce((acc, cls) => {
        if (cls.id && cls.color) {
          acc[cls.id] = cls.color;
        }
        return acc;
      }, {} as { [key: string]: string });
      Cookies.set('classColors', JSON.stringify(colorMap), { expires: 7 });

      // Mark loading complete immediately so the UI renders with initial data
      hasLoaded.current = true;
      setLoading(false);

      // Process recurring homework in the background (non-blocking)
      // This runs after the UI is already visible with initial data
      (async () => {
        try {
          const { supabase } = await import('@/lib/supabase/client');
          await RecurringHomeworkService.processRecurringHomework(user.id);
          // Refetch homework after processing recurring items
          const { data: updatedHomeworks } = await supabase
            .from('homework')
            .select('*')
            .eq('user_id', user.id)
            .order('due_date', { ascending: true });

          if (updatedHomeworks) {
            const updatedTransformedHomeworks = updatedHomeworks.map((hw: any) => {
              let links: HomeworkLink[] = [];
              if (hw.links) {
                try {
                  links = typeof hw.links === 'string' ? JSON.parse(hw.links) : hw.links;
                  if (!Array.isArray(links)) links = [];
                  links = links.map((l: any) => ({
                    ...l,
                    id: l.id || Math.random().toString(36).substring(2, 9)
                  }));
                } catch (e) {
                  console.error('Error parsing links:', e);
                  links = [];
                }
              }
              return {
                ...hw,
                links: links,
                priority: (hw.priority as Priority) || 'medium',
                dueDate: hw.due_date,
                classId: hw.class_id,
                pinned: hw.pinned || false,
                completed: hw.completed || false
              };
            });
            setHomeworks(updatedTransformedHomeworks);
          }
        } catch (error) {
          console.error('Error processing recurring homework:', error);
        }
      })();
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load data. Please try again.');
      setLoading(false);
    }
  }, [user, isGoogleUser]);

  // Set up real-time subscriptions and initial data fetch
  useEffect(() => {
    if (!user) return;

    let classesSubscription: any;
    let homeworkSubscription: any;
    let testsSubscription: any;
    let isMounted = true;

    const setupSubscriptions = async () => {
      // Only set up subscriptions if the current route needs class data
      if (!needsClassData()) {
        console.log('Route doesn\'t need class data, skipping subscriptions');
        return;
      }

      try {
        const { supabase } = await import('@/lib/supabase/client');

        // Subscribe to classes changes
        classesSubscription = supabase
          .channel('classes_changes')
          .on('postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'classes',
              filter: `user_id=eq.${user.id}`
            },
            (payload: any) => {
              if (!isMounted) return;
              console.log('Class change:', payload);
              if (payload.eventType === 'INSERT') {
                setClasses(prev => [...prev, payload.new as Class]);
              } else if (payload.eventType === 'UPDATE') {
                setClasses(prev =>
                  prev.map(cls => cls.id === payload.new.id ? { ...cls, ...payload.new } as Class : cls)
                );
              } else if (payload.eventType === 'DELETE') {
                setClasses(prev => prev.filter(cls => cls.id !== (payload.old as any).id));
              }
            }
          )
          .subscribe(status => {
            console.log('Class subscription status:', status);
          });

        // Subscribe to homework changes
        homeworkSubscription = supabase
          .channel('homework_changes')
          .on('postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'homework',
              filter: `user_id=eq.${user.id}`
            },
            (payload: any) => {
              if (!isMounted) return;
              console.log('Homework change:', payload);
              const eventType = payload.eventType.toLowerCase();

              if (eventType === 'insert') {
                const newHomework = payload.new as any;
                console.log('New homework received:', newHomework);

                // Parse links if it's a string
                let links: HomeworkLink[] = [];
                if (newHomework.links) {
                  try {
                    links = typeof newHomework.links === 'string'
                      ? JSON.parse(newHomework.links)
                      : newHomework.links;
                    if (!Array.isArray(links)) links = [];
                    links = links.map((l: any) => ({
                      ...l,
                      id: l.id || Math.random().toString(36).substring(2, 9)
                    }));
                  } catch (e) {
                    console.error('Error parsing links:', e);
                    links = [];
                  }
                }

                setHomeworks(prev => {
                  // Check if homework with this ID already exists to avoid duplicates
                  if (prev.some(hw => hw.id === newHomework.id)) {
                    console.log('Homework already exists, skipping duplicate');
                    return prev;
                  }

                  // Transform the new homework to match our expected format
                  const newHw = {
                    ...newHomework,
                    classId: newHomework.class_id,
                    dueDate: newHomework.due_date,
                    links: links,
                    priority: (newHomework.priority as Priority) || 'medium',
                    pinned: newHomework.pinned || false,
                    completed: newHomework.completed || false
                  };

                  console.log('Adding new homework:', newHw);
                  return [...prev, newHw];
                });

              } else if (eventType === 'update') {
                const updated = payload.new as any;
                console.log('Updating homework:', updated);

                setHomeworks(prev =>
                  prev.map(hw => hw.id === updated.id
                    ? {
                      ...hw,
                      ...updated,
                      classId: updated.class_id || hw.classId,
                      dueDate: updated.due_date || hw.dueDate,
                      links: updated.links
                        ? (typeof updated.links === 'string' ? JSON.parse(updated.links) : updated.links).map((l: any) => ({ ...l, id: l.id || Math.random().toString(36).substring(2, 9) }))
                        : (hw.links || []),
                      pinned: updated.pinned !== undefined ? updated.pinned : (hw.pinned || false),
                      completed: updated.completed !== undefined ? updated.completed : (hw.completed || false)
                    }
                    : hw
                  )
                );

              } else if (eventType === 'delete') {
                console.log('Deleting homework:', payload.old?.id);
                setHomeworks(prev => prev.filter(hw => hw.id !== (payload.old as any).id));
              }
            }
          )
          .subscribe(status => {
            console.log('Homework subscription status:', status);
          });

        // Subscribe to tests changes
        testsSubscription = supabase
          .channel('tests_changes')
          .on('postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'tests',
              filter: `user_id=eq.${user.id}`
            },
            (payload: any) => {
              if (!isMounted) return;
              console.log('Test change:', payload);
              const eventType = payload.eventType.toLowerCase();

              if (eventType === 'insert') {
                const newTest = payload.new as any;
                console.log('New test received:', newTest);

                setTests(prev => {
                  // Check if test with this ID already exists to avoid duplicates
                  if (prev.some(test => test.id === newTest.id)) {
                    console.log('Test already exists, skipping duplicate');
                    return prev;
                  }

                  // Transform the new test to match our expected format
                  const newT = {
                    ...newTest,
                    classId: newTest.class_id,
                    testDate: newTest.test_date,
                    testTime: newTest.test_time,
                    testType: newTest.test_type as TestType,
                    maxScore: newTest.max_score,
                    studyMaterials: newTest.study_materials || [],
                    weight: newTest.weight,
                    location: newTest.location,
                    duration: newTest.duration,
                    priority: (newTest.priority as Priority) || 'medium',
                    status: newTest.status as TestStatus,
                    score: newTest.score,
                    grade: newTest.grade,
                    notes: newTest.notes
                  };

                  console.log('Adding new test:', newT);
                  return [...prev, newT];
                });

              } else if (eventType === 'update') {
                const updated = payload.new as any;
                console.log('Updating test:', updated);

                setTests(prev =>
                  prev.map(test => test.id === updated.id
                    ? {
                      ...test,
                      classId: updated.class_id || test.classId,
                      testDate: updated.test_date || test.testDate,
                      testTime: updated.test_time !== undefined ? updated.test_time : test.testTime,
                      testType: updated.test_type ? updated.test_type as TestType : test.testType,
                      maxScore: updated.max_score !== undefined ? updated.max_score : test.maxScore,
                      studyMaterials: updated.study_materials !== undefined ? updated.study_materials : test.studyMaterials,
                      weight: updated.weight !== undefined ? updated.weight : test.weight,
                      location: updated.location !== undefined ? updated.location : test.location,
                      duration: updated.duration !== undefined ? updated.duration : test.duration,
                      priority: updated.priority !== undefined ? updated.priority : test.priority,
                      // Don't overwrite status from subscription - keep the local detailed status
                      // The database only stores 'upcoming' or 'taken', but UI uses more detailed values
                      status: test.status,
                      score: updated.score !== undefined ? updated.score : test.score,
                      grade: updated.grade !== undefined ? updated.grade : test.grade,
                      notes: updated.notes !== undefined ? updated.notes : test.notes,
                      completed_at: updated.completed_at !== undefined ? updated.completed_at : test.completed_at,
                      created_at: updated.created_at !== undefined ? updated.created_at : test.created_at
                    }
                    : test
                  )
                );

              } else if (eventType === 'delete') {
                console.log('Deleting test:', payload.old?.id);
                setTests(prev => prev.filter(test => test.id !== (payload.old as any).id));
              }
            }
          )
          .subscribe(status => {
            console.log('Tests subscription status:', status);
          });

      } catch (err) {
        console.error('Error setting up subscriptions:', err);
      }
    };

    // Set up a visibility change listener to handle tab focus changes
    const handleVisibilityChange = () => {
      if (!isMounted) return;

      // Only refetch if we don't have any data yet and the current route needs it
      if (document.visibilityState === 'visible' && user && !hasLoaded.current && needsClassData()) {
        console.log('Tab became visible, fetching data...');
        fetchData();
      }
    };

    // Initial data fetch
    const initialize = async () => {
      if (!hasLoaded.current) {
        await fetchData();
      }
      if (needsClassData()) {
        await setupSubscriptions();
      }
      document.addEventListener('visibilitychange', handleVisibilityChange);
    };

    initialize();

    // Cleanup function
    return () => {
      isMounted = false;
      document.removeEventListener('visibilitychange', handleVisibilityChange);

      if (classesSubscription) {
        classesSubscription.unsubscribe().catch(console.error);
      }
      if (homeworkSubscription) {
        homeworkSubscription.unsubscribe().catch(console.error);
      }
      if (testsSubscription) {
        testsSubscription.unsubscribe().catch(console.error);
      }
    };
  }, [user?.id, needsClassData, pathname]); // Added pathname to dependencies

  const deleteHomework = async (id: string) => {
    if (!user) throw new Error('User not authenticated');

    // Get the current homework before deletion for potential revert
    const homeworkToDelete = homeworks.find(hw => hw.id === id);
    if (!homeworkToDelete) return;

    try {
      // Optimistically update the UI immediately
      setHomeworks(prev => prev.filter(hw => hw.id !== id));

      // Delete from database
      await db.deleteHomework(id, user.id);
      // The subscription will handle the state update
    } catch (err) {
      console.error('Error deleting homework:', err);

      // Revert optimistic update on error
      setHomeworks(prev => {
        // Check if homework was already removed by subscription
        if (!prev.some(hw => hw.id === id)) {
          return [...prev, homeworkToDelete];
        }
        return prev;
      });

      throw err;
    }
  };

  const deleteRecurringSeries = async (recurringId: string) => {
    if (!user) throw new Error('User not authenticated');

    // Get the current homeworks for potential revert
    const prevHomeworks = homeworks;

    try {
      // Optimistically update the UI immediately - remove all homeworks in this series
      setHomeworks(prev => prev.filter(hw =>
        (hw as any).recurring_id !== recurringId &&
        (hw as any).parent_recurring_id !== recurringId
      ));

      // Delete the entire recurring series using the service
      await RecurringHomeworkService.deleteRecurringSeries(recurringId, user.id);
    } catch (err) {
      console.error('Error deleting recurring series:', err);
      // Revert optimistic update on error
      setHomeworks(prevHomeworks);
      throw err;
    }
  };

  const addClass = async (name: string, icon: HugeIconName): Promise<string> => {
    if (!user) throw new Error('User not authenticated');

    // Generate a temporary ID for the optimistic update
    const tempId = `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Create the optimistic class object
    const optimisticClass: Class = {
      id: tempId,
      name,
      icon,
      color: `#${Math.floor(Math.random() * 16777215).toString(16)}`,
      user_id: user.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    try {
      // Optimistically update the UI immediately
      setClasses(prev => [...prev, optimisticClass]);

      // Create the class in the database
      const createdClass = await db.createClass({
        name,
        color: optimisticClass.color,
        icon,
        user_id: user.id
      });

      // Replace the temporary class with the real one from the database
      setClasses(prev =>
        prev.map(cls =>
          cls.id === tempId
            ? { ...createdClass, icon: createdClass.icon as HugeIconName }
            : cls
        )
      );

      return createdClass.id;

      // The subscription will also handle this, but we want to ensure consistency
    } catch (err) {
      console.error('Error adding class:', err);

      // Revert optimistic update on error
      setClasses(prev => prev.filter(cls => cls.id !== tempId));

      throw err;
    }
  };

  const updateClass = async (id: string, updates: Partial<Class>) => {
    if (!user) throw new Error('User not authenticated');

    try {
      // Map the fields to match the database schema
      const dbUpdates: Record<string, any> = {
        name: updates.name,
        color: updates.color,
        icon: updates.icon,
        updated_at: new Date().toISOString()
      };

      // Remove undefined values
      Object.keys(dbUpdates).forEach((key: string) => {
        if (dbUpdates[key] === undefined) {
          delete dbUpdates[key];
        }
      });

      const updated = await db.updateClass(id, dbUpdates);

      // Update local state
      setClasses(prev =>
        prev.map(cls =>
          cls.id === id
            ? { ...cls, ...updates, updated_at: new Date().toISOString() }
            : cls
        )
      );

      // If the color was updated, we need to update the cookie for consistency
      if (updates.color) {
        const colorMap = classes.reduce((acc, cls) => {
          if (cls.id && cls.color) {
            acc[cls.id] = cls.id === id ? updates.color! : cls.color;
          }
          return acc;
        }, {} as { [key: string]: string });
        Cookies.set('classColors', JSON.stringify(colorMap), { expires: 7 });
      }

    } catch (err) {
      console.error('Error updating class:', err);
      throw err;
    }
  };

  const deleteClass = async (id: string) => {
    if (!user) throw new Error('User not authenticated');

    // Get the current class before deletion for potential revert
    const classToDelete = classes.find(cls => cls.id === id);
    if (!classToDelete) return;

    try {
      // Optimistically update the UI immediately
      setClasses(prev => prev.filter(cls => cls.id !== id));

      // Delete from database
      await db.deleteClass(id, user.id);
      // The subscription will handle the state update
    } catch (err) {
      console.error('Error deleting class:', err);

      // Revert optimistic update on error
      setClasses(prev => {
        // Check if class was already removed by subscription
        if (!prev.some(cls => cls.id === id)) {
          return [...prev, classToDelete];
        }
        return prev;
      });

      throw err;
    }
  };

  const clearAllClasses = async () => {
    if (!user) throw new Error('User not authenticated');

    try {
      await db.deleteAllClasses(user.id);
      // The subscription will handle the state update
    } catch (err) {
      console.error('Error clearing all classes:', err);
      throw err;
    }
  };

  const clearAllHomeworks = async () => {
    if (!user) throw new Error('User not authenticated');

    try {
      await db.deleteAllHomeworks(user.id);
      // The subscription will handle the state update
    } catch (err) {
      console.error('Error clearing all homeworks:', err);
      throw err;
    }
  };

  const toggleHomework = async (id: string) => {
    if (!user) throw new Error('User not authenticated');

    // Get the current homework state before any updates
    const currentHomework = homeworks.find(hw => hw.id === id);
    if (!currentHomework) return;

    try {
      // Optimistically update the UI
      setHomeworks(prev =>
        prev.map(hw =>
          hw.id === id
            ? { ...hw, completed: !hw.completed }
            : hw
        )
      );

      // Update the database
      await db.toggleHomeworkComplete(id, user.id, !currentHomework.completed);
      // The subscription will handle any necessary state updates
    } catch (err) {
      console.error('Error toggling homework:', err);

      // Revert optimistic update on error
      setHomeworks(prev =>
        prev.map(hw =>
          hw.id === id
            ? { ...hw, completed: currentHomework.completed }
            : hw
        )
      );

      throw err;
    }
  };

  const addHomework = async (classId: string, title: string, dueDate: Date, priority: Priority = 'medium', links: HomeworkLink[] = [], description: string = '', completed: boolean = false) => {
    if (!user) throw new Error('User not authenticated');

    // ─── Plan tier limit check ───────────────────────────────────────────
    const tier = getPlanTier();
    const limits = TIER_LIMITS[tier];
    if (limits.homeworkEntries !== Infinity) {
      const activeCount = homeworks.filter(hw => !hw.completed).length;
      if (activeCount >= limits.homeworkEntries) {
        throw new Error(
          `PLAN_LIMIT:The free plan includes up to ${limits.homeworkEntries} active assignments — upgrade to Pro for unlimited.`
        );
      }
    }

    // Generate a temporary ID for the optimistic update
    const tempId = `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Create the optimistic homework object
    const optimisticHomework: Homework = {
      id: tempId,
      user_id: user.id,
      classId,
      title,
      description: description || '',
      dueDate: format(dueDate, "yyyy-MM-dd'T'HH:mm:ss.SSSxxx"),
      priority,
      completed,
      pinned: false,
      links: links || [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      recurring_id: null,
      recurring_frequency: null,
      recurring_end_date: null,
      recurring_max_occurrences: null,
      parent_recurring_id: null,
      is_recurring_instance: false
    };

    try {
      console.log('addHomework called with:', {
        classId,
        title,
        dueDate,
        priority,
        userId: user.id,
        existingClasses: classes.map(cls => ({ id: cls.id, name: cls.name }))
      });

      // Check if the class exists in our local database
      const existingClass = classes.find(cls => cls.id === classId);

      // Only attempt to create a "local" class if we REALLY have an invalid classId
      // and it's not a newly created UUID (UUIDs are usually 36 chars) or a temp ID from our own system.
      const isPlaceholderId = !classId || classId.startsWith('unknown') || classId.length < 5;

      if (!existingClass && isPlaceholderId) {
        console.log('Class not found and appears to be placeholder, creating local class for:', classId);

        const localClassId = `local-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

        await db.createClass({
          id: localClassId,
          name: `Imported Class`,
          color: `#${Math.floor(Math.random() * 16777215).toString(16)}`,
          icon: 'BookOpen',
          user_id: user.id
        });

        classId = localClassId;
      }

      // Optimistically update the UI immediately
      setHomeworks(prev => [...prev, optimisticHomework]);

      // Convert priority to string to match database schema
      const priorityString = String(priority);

      // Format the due date as a string in the format expected by the database
      const formattedDueDate = format(dueDate, "yyyy-MM-dd'T'HH:mm:ss.SSSxxx");

      const homeworkData: any = {
        title,
        description: description || '',
        due_date: formattedDueDate,
        priority: priorityString,
        class_id: classId,
        user_id: user.id,
        pinned: false, // Default to not pinned
        completed, // Use the provided completed status
      };

      // Only include links if it's a non-empty array
      if (links && links.length > 0) {
        homeworkData.links = links;
      }

      console.log('About to create homework with data:', homeworkData);

      const createdHomework = await db.createHomework(homeworkData);
      console.log('Homework created successfully');

      // Replace the temporary homework with the real one from the database
      setHomeworks(prev =>
        prev.map(hw =>
          hw.id === tempId
            ? {
              ...createdHomework,
              classId: createdHomework.class_id,
              dueDate: createdHomework.due_date,
              links: createdHomework.links ? (typeof createdHomework.links === 'string' ? JSON.parse(createdHomework.links) : createdHomework.links) : [],
              priority: (createdHomework.priority as Priority) || 'medium',
              pinned: createdHomework.pinned || false,
              completed: createdHomework.completed || false
            }
            : hw
        )
      );

      // The subscription will also handle this, but we want to ensure consistency
    } catch (err) {
      console.error('Error adding homework:', err);

      // Revert optimistic update on error
      setHomeworks(prev => prev.filter(hw => hw.id !== tempId));

      throw err;
    }
  };

  const addRecurringHomework = async (classId: string, title: string, dueDate: Date, priority: Priority, links: HomeworkLink[], recurring: RecurringHomework, description: string = '') => {
    if (!user) throw new Error('User not authenticated');

    // Generate a temporary ID for the optimistic update
    const tempId = `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Create the optimistic homework object
    const optimisticHomework: Homework = {
      id: tempId,
      user_id: user.id,
      classId,
      title,
      description: description || '',
      dueDate: format(dueDate, "yyyy-MM-dd'T'HH:mm:ss.SSSxxx"),
      priority,
      completed: false,
      pinned: false,
      links: links || [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      recurring_id: null,
      recurring_frequency: null,
      recurring_end_date: null,
      recurring_max_occurrences: null,
      parent_recurring_id: null,
      is_recurring_instance: false
    };

    try {
      // Optimistically update the UI immediately
      setHomeworks(prev => [...prev, optimisticHomework]);

      // Use the RecurringHomeworkService to create the recurring homework
      const { masterRecord, initialInstance } = await RecurringHomeworkService.createRecurringHomework(
        user.id,
        classId,
        title,
        description,
        dueDate,
        priority,
        links,
        recurring
      );

      // Replace the temporary homework with the real records from the database
      setHomeworks(prev => {
        const otherHomeworks = prev.filter(hw => hw.id !== tempId);

        // Transform the records to our local Homework type
        const transform = (hw: any): Homework => ({
          ...hw,
          classId: hw.class_id,
          dueDate: hw.due_date,
          links: hw.links ? (typeof hw.links === 'string' ? JSON.parse(hw.links) : hw.links) : [],
          priority: (hw.priority as Priority) || 'medium',
          pinned: hw.pinned || false,
          completed: hw.completed || false
        });

        // Add both to state to avoid subscription duplicates
        return [...otherHomeworks, transform(masterRecord), transform(initialInstance)];
      });

      // The subscription will also handle this, but we want to ensure consistency
    } catch (err) {
      console.error('Error adding recurring homework:', err);

      // Revert optimistic update on error
      setHomeworks(prev => prev.filter(hw => hw.id !== tempId));

      throw err;
    }
  };

  const updateHomeworkDueDate = async (homeworkId: string, newDueDate: Date) => {
    if (!user) throw new Error('User not authenticated');

    // Get the current homework before updating for potential revert
    const currentHomework = homeworks.find(hw => hw.id === homeworkId);
    if (!currentHomework) return;

    console.log('🔄 UPDATE HOMEWORK DATE:', {
      homeworkId,
      currentDueDate: currentHomework.dueDate,
      newDueDate: newDueDate.toISOString(),
      newDueDateDay: newDueDate.getDate()
    });

    try {
      // Normalize the date to start of day to match calendar filtering logic
      const normalizedDate = new Date(newDueDate.getFullYear(), newDueDate.getMonth(), newDueDate.getDate());

      console.log('📅 NORMALIZED FOR DB:', {
        normalizedDate: normalizedDate.toISOString(),
        normalizedDay: normalizedDate.getDate()
      });

      // Optimistically update the UI immediately
      setHomeworks(prev =>
        prev.map(hw =>
          hw.id === homeworkId
            ? { ...hw, dueDate: normalizedDate.toISOString() }
            : hw
        )
      );

      // Update the database
      await db.updateHomework(homeworkId, {
        due_date: normalizedDate.toISOString()
      });

      console.log('💾 HOMEWORK SAVED TO DB:', {
        homeworkId,
        savedDate: normalizedDate.toISOString(),
        savedDay: normalizedDate.getDate()
      });
    } catch (err) {
      console.error('Error updating homework due date:', err);

      // Revert optimistic update on error
      setHomeworks(prev =>
        prev.map(hw =>
          hw.id === homeworkId
            ? currentHomework
            : hw
        )
      );

      throw err;
    }
  };

  const togglePinHomework = async (id: string, pinned: boolean) => {
    if (!user) throw new Error('User not authenticated');

    // Get the current homework state before any updates
    const currentHomework = homeworks.find(hw => hw.id === id);
    if (!currentHomework) return;

    try {
      // Optimistically update the UI immediately
      setHomeworks(prev =>
        prev.map(hw =>
          hw.id === id
            ? { ...hw, pinned: pinned }
            : hw
        )
      );

      // Update the database
      await db.updateHomework(id, {
        pinned: pinned
      });

      // The subscription will handle any necessary state updates
    } catch (err) {
      console.error('Error toggling homework pin status:', err);

      // Revert optimistic update on error
      setHomeworks(prev =>
        prev.map(hw =>
          hw.id === id
            ? { ...hw, pinned: currentHomework.pinned }
            : hw
        )
      );

      throw err;
    }
  };

  const updateHomework = async (id: string, updates: Partial<Homework>) => {
    if (!user) throw new Error('User not authenticated');

    try {
      // Map the fields to match the database schema
      const dbUpdates: Record<string, any> = {
        title: updates.title,
        description: updates.description,
        due_date: updates.dueDate ? new Date(updates.dueDate).toISOString() : undefined,
        class_id: updates.classId,
        completed: updates.completed,
        priority: updates.priority,
        updated_at: new Date().toISOString()
      };

      // Remove undefined values
      Object.keys(dbUpdates).forEach((key: string) => {
        if (dbUpdates[key] === undefined) {
          delete dbUpdates[key];
        }
      });

      const updated = await db.updateHomework(id, dbUpdates);

      // Update local state
      setHomeworks(prev =>
        prev.map(hw =>
          hw.id === id
            ? { ...hw, ...updates, updatedAt: new Date().toISOString() }
            : hw
        )
      );


      // The subscription will handle any necessary state updates
    } catch (err) {
      console.error('Error updating homework:', err);
      throw err;
    }
  };

  // Test management methods
  const addTest = async (classId: string, title: string, testDate: Date, testType: TestType, options: {
    testTime?: Date;
    weight?: number;
    location?: string;
    duration?: number;
    priority?: Priority;
    description?: string;
    studyMaterials?: string[];
    notes?: string;
  } = {}) => {
    if (!user) throw new Error('User not authenticated');

    // ─── Plan tier limit check ───────────────────────────────────────────
    const tier = getPlanTier();
    const limits = TIER_LIMITS[tier];
    if (limits.activeTests !== Infinity) {
      const activeTestCount = tests.filter(t => t.status === 'upcoming' || t.status === 'preparing' || t.status === 'not_started' || t.status === 'in_progress').length;
      if (activeTestCount >= limits.activeTests) {
        throw new Error(
          `PLAN_LIMIT:The free plan includes up to ${limits.activeTests} active tests — upgrade to Pro for unlimited.`
        );
      }
    }

    // Generate a temporary ID for the optimistic update
    const tempId = `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Create the optimistic test object
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
      // Optimistically update the UI immediately
      setTests(prev => [...prev, optimisticTest]);

      // Create the test in the database
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
        study_materials: options.studyMaterials || [],
        notes: options.notes
      };

      console.log('About to create test with data:', testData);
      const createdTest = await db.createTest(testData);

      // Replace the temporary test with the real one from the database
      setTests(prev =>
        prev.map(test =>
          test.id === tempId
            ? {
              ...test,
              ...createdTest,
              id: createdTest.id,
              classId: createdTest.class_id,
              testDate: createdTest.test_date,
              testTime: createdTest.test_time,
              testType: createdTest.test_type as TestType,
              maxScore: createdTest.max_score,
              priority: (createdTest.priority as Priority) || 'medium',
              studyMaterials: createdTest.study_materials || [],
              created_at: createdTest.created_at,
              status: (createdTest.status as TestStatus) || 'upcoming',
            }
            : test
        )
      );

      // The subscription will also handle this, but we want to ensure consistency
    } catch (err) {
      console.error('Error adding test:', err);
      console.error('Test data that failed:', {
        title,
        classId,
        userId: user.id,
        testType,
        studyMaterials: options.studyMaterials
      });
      console.error('Error details:', {
        message: (err as any)?.message,
        code: (err as any)?.code,
        details: (err as any)?.details,
        hint: (err as any)?.hint
      });

      // Revert optimistic update on error
      setTests(prev => prev.filter(test => test.id !== tempId));

      throw err;
    }
  };

  const updateTest = async (id: string, updates: Partial<Test>) => {
    if (!user) throw new Error('User not authenticated');

    try {
      // Create a copy of updates to avoid mutating the original
      const updateData = { ...updates };

      // Map UI status to database status
      const statusMapping: Record<string, 'upcoming' | 'taken'> = {
        'not_started': 'upcoming',
        'in_progress': 'upcoming',
        'completed': 'taken',
        'postponed': 'upcoming',
        'cancelled': 'upcoming'
      };

      // If grade is being set, automatically mark as completed
      if (updateData.grade && updateData.status !== 'taken') {
        updateData.status = 'taken';
      }

      // Map the status to database value if it exists, default to 'upcoming' if not set
      const dbStatus = updateData.status ? statusMapping[updateData.status] : 'upcoming';

      // Map the fields to match the database schema
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
        study_materials: updateData.studyMaterials,
        notes: updateData.notes,
        updated_at: new Date().toISOString()
      };

      // Remove undefined values
      Object.keys(dbUpdates).forEach((key: string) => {
        if (dbUpdates[key] === undefined) {
          delete dbUpdates[key];
        }
      });

      console.log('Updating test with data:', { id, updates: dbUpdates });
      const updated = await db.updateTest(id, dbUpdates);

      // Update local state, preserving the original status value from updates
      // The database stores simplified status ('upcoming' or 'taken'), but UI uses detailed values
      setTests(prev =>
        prev.map(test =>
          test.id === id
            ? { ...test, ...updateData }
            : test
        )
      );

      // The subscription will handle any necessary state updates
    } catch (err) {
      console.error('Error updating test:', err);
      throw err;
    }
  };

  const deleteTest = async (id: string) => {
    if (!user) throw new Error('User not authenticated');

    // Get the current test before deletion for potential revert
    const testToDelete = tests.find(test => test.id === id);
    if (!testToDelete) return;

    try {
      // Optimistically update the UI immediately
      setTests(prev => prev.filter(test => test.id !== id));

      // Delete from database
      await db.deleteTest(id, user.id);
      // The subscription will handle the state update
    } catch (err) {
      console.error('Error deleting test:', err);

      // Revert optimistic update on error
      setTests(prev => {
        // Check if test was already removed by subscription
        if (!prev.some(test => test.id === id)) {
          return [...prev, testToDelete];
        }
        return prev;
      });

      throw err;
    }
  };

  const updateTestDueDate = async (testId: string, newDueDate: Date) => {
    if (!user) throw new Error('User not authenticated');

    // Get the current test before updating for potential revert
    const currentTest = tests.find(test => test.id === testId);
    if (!currentTest) return;

    console.log('🔄 UPDATE TEST DATE:', {
      testId,
      currentTestDate: currentTest.testDate,
      newDueDate: newDueDate.toISOString(),
      newDueDateDay: newDueDate.getDate()
    });

    try {
      // Normalize the date to start of day to match calendar filtering logic
      const normalizedDate = new Date(newDueDate.getFullYear(), newDueDate.getMonth(), newDueDate.getDate());

      console.log('📅 NORMALIZED FOR DB:', {
        normalizedDate: normalizedDate.toISOString(),
        normalizedDay: normalizedDate.getDate()
      });

      // Optimistically update the UI immediately
      setTests(prev =>
        prev.map(test =>
          test.id === testId
            ? { ...test, testDate: normalizedDate.toISOString().split('T')[0] }
            : test
        )
      );

      // Format date to match database schema (full ISO string like homework)
      await db.updateTest(testId, {
        test_date: normalizedDate.toISOString().split('T')[0]
      });

      console.log('💾 TEST SAVED TO DB:', {
        testId,
        savedDate: normalizedDate.toISOString().split('T')[0],
        savedDay: normalizedDate.getDate()
      });
    } catch (err) {
      console.error('Error updating test due date:', err);

      // Revert optimistic update on error
      setTests(prev =>
        prev.map(test =>
          test.id === testId
            ? currentTest
            : test
        )
      );

      throw err;
    }
  };

  const markTestComplete = async (id: string, score?: number, maxScore?: number, grade?: string) => {
    if (!user) throw new Error('User not authenticated');

    try {
      // Update the database
      await db.updateTest(id, {
        status: 'taken',
        score,
        max_score: maxScore,
        grade
      });

      // Update local state - convert database nulls to proper types
      setTests(prev =>
        prev.map(test =>
          test.id === id
            ? {
              ...test,
              status: 'taken' as TestStatus,
              score: score || null,
              maxScore: maxScore || null,
              grade: grade || null
            }
            : test
        )
      );

      // The subscription will handle any necessary state updates
    } catch (err) {
      console.error('Error marking test complete:', err);
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
    return tests.filter(test => test.classId === classId)
      .sort((a, b) => new Date(a.testDate).getTime() - new Date(b.testDate).getTime());
  };

  const updateTestStatus = async (id: string, status: TestStatus) => {
    if (!user) throw new Error('User not authenticated');

    try {
      // Update the database
      await db.updateTest(id, {
        status: status
      });

      // Update local state
      setTests(prev =>
        prev.map(test =>
          test.id === id
            ? { ...test, status: status }
            : test
        )
      );

      // The subscription will handle any necessary state updates
    } catch (err) {
      console.error('Error updating test status:', err);
      throw err;
    }
  };

  const value = {
    classes,
    homeworks,
    tests,
    loading,
    error,
    addClass,
    updateClass,
    addHomework,
    addRecurringHomework,
    toggleHomework,
    togglePinHomework,
    deleteClass,
    deleteHomework,
    deleteRecurringSeries,
    updateHomeworkDueDate,
    updateHomework,
    clearAllClasses,
    clearAllHomeworks,

    // Test management methods
    addTest,
    updateTest,
    deleteTest,
    updateTestDueDate,
    markTestComplete,
    getUpcomingTests,
    getTestsByClass,
    updateTestStatus,
  };

  return (
    <ClassContext.Provider value={value}>
      {children}
    </ClassContext.Provider>
  );
};

export const useClassContext = () => {
  const context = useContext(ClassContext);
  if (context === undefined) {
    throw new Error('useClassContext must be used within a ClassProvider');
  }
  return context;
};