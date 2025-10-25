'use client';

import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { format } from 'date-fns';
import { useAuth } from './AuthContext';
import { db } from '@/lib/supabase/db';
import { Database } from '@/types/database.types';
import { RecurringHomeworkService } from '@/lib/services/RecurringHomeworkService';
import { getGoogleClassroomCourses, getAllGoogleClassroomCourseWork } from '@/lib/services/GoogleClassroomService';

// Type for Lucide icon names
type LucideIconName = keyof typeof import('lucide-react');

export type Class = Omit<Database['public']['Tables']['classes']['Row'], 'icon'> & {
  icon: LucideIconName;
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
export type TestStatus = 'upcoming' | 'completed' | 'missed';

export type Test = Omit<Database['public']['Tables']['tests']['Row'], 'test_date' | 'test_time' | 'class_id' | 'study_materials' | 'test_type' | 'max_score' | 'completed_at'> & {
  classId: string;
  testDate: string; // ISO date string
  testTime: string | null; // ISO time string
  testType: TestType;
  maxScore: number | null;
  studyMaterials: string[];
  completedAt: string | null;
};

interface ClassContextType {
  classes: Class[];
  homeworks: Homework[];
  tests: Test[];
  loading: boolean;
  error: string | null;
  addClass: (name: string, icon: LucideIconName) => Promise<void>;
  addHomework: (classId: string, title: string, dueDate: Date, priority?: Priority, links?: HomeworkLink[]) => Promise<void>;
  addRecurringHomework: (classId: string, title: string, dueDate: Date, priority: Priority, links: HomeworkLink[], recurring: RecurringHomework) => Promise<void>;
  toggleHomework: (id: string) => Promise<void>;
  togglePinHomework: (id: string, pinned: boolean) => Promise<void>;
  deleteClass: (id: string) => Promise<void>;
  deleteHomework: (id: string) => Promise<void>;
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
  markTestComplete: (id: string, score?: number, maxScore?: number, grade?: string) => Promise<void>;
  getUpcomingTests: (daysAhead?: number) => Test[];
  getTestsByClass: (classId: string) => Test[];
}

const ClassContext = createContext<ClassContextType | undefined>(undefined);

export const ClassProvider = ({ children }: { children: React.ReactNode }) => {
  const { user, isGoogleUser } = useAuth();
  const [classes, setClasses] = useState<Class[]>([]);
  const [homeworks, setHomeworks] = useState<Homework[]>([]);
  const [tests, setTests] = useState<Test[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Track if we've already loaded data to prevent unnecessary refetches
  const hasLoaded = useRef(false);

  // Function to check if current route needs class/homework data
  const needsClassData = useCallback(() => {
    if (typeof window === 'undefined') return false;

    const path = window.location.pathname;
    const routesThatNeedClassData = [
      '/homework',
      '/classes',
      '/dashboard',
      '/calendar',
      '/settings'
    ];

    return routesThatNeedClassData.some(route => path.startsWith(route));
  }, []);

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
      if (isGoogleUser) {
        // Use Google Classroom API for Google users
        console.log('Fetching Google Classroom data...');

        const [courses, allCourseWork] = await Promise.all([
          getGoogleClassroomCourses(),
          getAllGoogleClassroomCourseWork()
        ]);

        console.log('Fetched Google Classroom courses:', courses.length);
        console.log('Fetched Google Classroom coursework:', allCourseWork.length);

        // Transform Google Classroom courses to our Class format
        const transformedClasses: Class[] = courses.map((course, index) => ({
          id: course.id || `gc-${index}`,
          name: course.name || 'Unknown Course',
          icon: 'BookOpen' as LucideIconName, // Default icon for Google Classroom courses
          color: `#${Math.floor(Math.random()*16777215).toString(16)}`, // Random color
          user_id: user.id,
          created_at: course.creationTime || new Date().toISOString(),
          updated_at: course.updateTime || new Date().toISOString()
        }));

        // Transform Google Classroom coursework to our Homework format
        const transformedHomeworks: Homework[] = [];
        allCourseWork.forEach(({ courseId, courseName, work }) => {
          work.forEach((courseWork) => {
            if (courseWork.dueDate) {
              const dueDate = new Date(
                courseWork.dueDate.year || new Date().getFullYear(),
                (courseWork.dueDate.month || 1) - 1, // Month is 1-indexed in API
                courseWork.dueDate.day || 1
              );

              // Add due time if available
              if (courseWork.dueTime) {
                dueDate.setHours(
                  courseWork.dueTime.hours || 0,
                  courseWork.dueTime.minutes || 0,
                  courseWork.dueTime.seconds || 0
                );
              }

              transformedHomeworks.push({
                id: courseWork.id || `gc-${Date.now()}-${Math.random()}`,
                user_id: user.id,
                classId: courseId,
                title: courseWork.title || 'Untitled Assignment',
                description: courseWork.description || '',
                dueDate: dueDate.toISOString(),
                priority: 'medium',
                completed: false,
                pinned: false,
                links: [],
                created_at: courseWork.creationTime || new Date().toISOString(),
                updated_at: courseWork.updateTime || new Date().toISOString(),
                recurring_id: null,
                recurring_frequency: null,
                recurring_end_date: null,
                recurring_max_occurrences: null,
                parent_recurring_id: null,
                is_recurring_instance: false
              });
            }
          });
        });

        setClasses(transformedClasses);
        setHomeworks(transformedHomeworks);
      } else {
        // Use Supabase API for regular users
        console.log('Fetching Supabase data...');
        const [classesData, homeworksData, testsData] = await Promise.all([
          db.getClasses(user.id),
          db.getHomework(user.id), // Get all homework
          db.getTests(user.id) // Get all tests
        ]);

        console.log('Fetched classes:', classesData);
        console.log('Fetched homeworks:', homeworksData);
        console.log('Fetched tests:', testsData);

        // Only update state if the data has actually changed
        setClasses(prevClasses => {
          if (JSON.stringify(prevClasses) === JSON.stringify(classesData)) {
            return prevClasses;
          }
          return classesData as Class[];
        });

        // Transform homework data to ensure consistent types
        const transformedHomeworks = homeworksData.map(hw => {
          // Parse links if it's a string
          let links: HomeworkLink[] = [];
          if (hw.links) {
            try {
              links = typeof hw.links === 'string' ? JSON.parse(hw.links) : hw.links;
              if (!Array.isArray(links)) links = [];
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
          completedAt: test.completed_at
        }));

        // Only update state if the data has actually changed
        setHomeworks(prevHomeworks => {
          if (JSON.stringify(prevHomeworks) === JSON.stringify(transformedHomeworks)) {
            return prevHomeworks;
          }
          return transformedHomeworks;
        });

        setTests(prevTests => {
          if (JSON.stringify(prevTests) === JSON.stringify(transformedTests)) {
            return prevTests;
          }
          return transformedTests;
        });
      }

      hasLoaded.current = true;
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load data. Please try again.');
    } finally {
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
                          ? (typeof updated.links === 'string' ? JSON.parse(updated.links) : updated.links)
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
                    completedAt: newTest.completed_at
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
                        ...updated,
                        classId: updated.class_id || test.classId,
                        testDate: updated.test_date || test.testDate,
                        testTime: updated.test_time !== undefined ? updated.test_time : test.testTime,
                        testType: updated.test_type ? updated.test_type as TestType : test.testType,
                        maxScore: updated.max_score !== undefined ? updated.max_score : test.maxScore,
                        studyMaterials: updated.study_materials !== undefined ? updated.study_materials : test.studyMaterials,
                        completedAt: updated.completed_at !== undefined ? updated.completed_at : test.completedAt
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
      hasLoaded.current = false;
      await fetchData();

      // Only set up subscriptions if the route needs class data
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
  }, [user?.id, needsClassData]); // Only depend on user.id and needsClassData to prevent unnecessary re-renders

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

  const addClass = async (name: string, icon: LucideIconName) => {
    if (!user) throw new Error('User not authenticated');

    // Generate a temporary ID for the optimistic update
    const tempId = `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Create the optimistic class object
    const optimisticClass: Class = {
      id: tempId,
      name,
      icon,
      color: `#${Math.floor(Math.random()*16777215).toString(16)}`,
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
            ? { ...createdClass, icon: createdClass.icon as LucideIconName }
            : cls
        )
      );

      // The subscription will also handle this, but we want to ensure consistency
    } catch (err) {
      console.error('Error adding class:', err);

      // Revert optimistic update on error
      setClasses(prev => prev.filter(cls => cls.id !== tempId));

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

  const addHomework = async (classId: string, title: string, dueDate: Date, priority: Priority = 'medium', links: HomeworkLink[] = []) => {
    if (!user) throw new Error('User not authenticated');

    // Generate a temporary ID for the optimistic update
    const tempId = `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Create the optimistic homework object
    const optimisticHomework: Homework = {
      id: tempId,
      user_id: user.id,
      classId,
      title,
      description: '',
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
      console.log('addHomework called with:', {
        classId,
        title,
        dueDate,
        priority,
        userId: user.id,
        existingClasses: classes.map(cls => ({ id: cls.id, name: cls.name }))
      });

      // Check if the class exists in our local database by trying to find it in the database
      // First check if it exists in our current classes array
      let existingClass = classes.find(cls => cls.id === classId);

      if (!existingClass) {
        // If not in our current classes array, it might be a class that was just created
        // or a Google Classroom class. Let's try to create a local class for it.
        console.log('Class not found in current classes array, creating local class for:', classId);

        // Create a local class for this class
        const localClassId = `local-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

        // Create the class in the database
        await db.createClass({
          id: localClassId,
          name: `Imported Class`,
          color: `#${Math.floor(Math.random()*16777215).toString(16)}`,
          icon: 'BookOpen',
          user_id: user.id
        });

        // Update the classId to use the local class
        classId = localClassId;
        console.log('Updated classId to:', classId);
      }

      // Optimistically update the UI immediately
      setHomeworks(prev => [...prev, optimisticHomework]);

      // Convert priority to string to match database schema
      const priorityString = String(priority);

      // Format the due date as a string in the format expected by the database
      const formattedDueDate = format(dueDate, "yyyy-MM-dd'T'HH:mm:ss.SSSxxx");

      const homeworkData: any = {
        title,
        description: '', // Add empty description by default
        due_date: formattedDueDate,
        priority: priorityString,
        class_id: classId,
        user_id: user.id,
        pinned: false, // Default to not pinned
        completed: false, // Default to not completed
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

  const addRecurringHomework = async (classId: string, title: string, dueDate: Date, priority: Priority, links: HomeworkLink[], recurring: RecurringHomework) => {
    if (!user) throw new Error('User not authenticated');

    // Generate a temporary ID for the optimistic update
    const tempId = `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Create the optimistic homework object
    const optimisticHomework: Homework = {
      id: tempId,
      user_id: user.id,
      classId,
      title,
      description: '',
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
      const masterRecord = await RecurringHomeworkService.createRecurringHomework(
        user.id,
        classId,
        title,
        dueDate,
        priority,
        links,
        recurring
      );

      // Replace the temporary homework with the real one from the database
      setHomeworks(prev =>
        prev.map(hw =>
          hw.id === tempId
            ? {
                ...masterRecord,
                classId: masterRecord.class_id,
                dueDate: masterRecord.due_date,
                links: masterRecord.links ? (typeof masterRecord.links === 'string' ? JSON.parse(masterRecord.links) : masterRecord.links) : [],
                priority: (masterRecord.priority as Priority) || 'medium',
                pinned: masterRecord.pinned || false,
                completed: masterRecord.completed || false
              }
            : hw
        )
      );

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
    
    try {
      await db.updateHomework(homeworkId, {
        due_date: newDueDate.toISOString()
      });
      // The subscription will handle the state update
    } catch (err) {
      console.error('Error updating homework due date:', err);
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
      
      return updated;
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

    // Generate a temporary ID for the optimistic update
    const tempId = `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Create the optimistic test object
    const optimisticTest: Test = {
      id: tempId,
      user_id: user.id,
      classId,
      title,
      description: options.description || '',
      testDate: testDate.toISOString().split('T')[0],
      testTime: options.testTime ? options.testTime.toISOString().split('T')[1].split('.')[0] : null,
      testType,
      weight: options.weight || null,
      location: options.location || null,
      duration: options.duration || null,
      priority: options.priority || 'medium',
      status: 'upcoming',
      score: null,
      maxScore: null,
      grade: null,
      studyMaterials: options.studyMaterials || [],
      notes: options.notes || null,
      completedAt: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    try {
      // Optimistically update the UI immediately
      setTests(prev => [...prev, optimisticTest]);

      // Create the test in the database
      const testData = {
        title,
        description: options.description || '',
        test_date: testDate.toISOString().split('T')[0],
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
                ...createdTest,
                classId: createdTest.class_id,
                testDate: createdTest.test_date,
                testTime: createdTest.test_time || undefined,
                studyMaterials: createdTest.study_materials || []
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
      // Map the fields to match the database schema
      const dbUpdates: Record<string, any> = {
        title: updates.title,
        description: updates.description,
        test_date: updates.testDate ? new Date(updates.testDate).toISOString().split('T')[0] : undefined,
        test_time: updates.testTime || undefined,
        test_type: updates.testType,
        weight: updates.weight,
        location: updates.location,
        duration: updates.duration,
        priority: updates.priority,
        status: updates.status,
        score: updates.score,
        max_score: updates.maxScore,
        grade: updates.grade,
        study_materials: updates.studyMaterials,
        notes: updates.notes,
        updated_at: new Date().toISOString()
      };

      // Remove undefined values
      Object.keys(dbUpdates).forEach((key: string) => {
        if (dbUpdates[key] === undefined) {
          delete dbUpdates[key];
        }
      });

      const updated = await db.updateTest(id, dbUpdates);

      // Update local state
      setTests(prev =>
        prev.map(test =>
          test.id === id
            ? { ...test, ...updates }
            : test
        )
      );

      return updated;
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

  const markTestComplete = async (id: string, score?: number, maxScore?: number, grade?: string) => {
    if (!user) throw new Error('User not authenticated');

    try {
      // Update the database
      await db.updateTest(id, {
        status: 'completed',
        score,
        max_score: maxScore,
        grade,
        completed_at: new Date().toISOString()
      });

      // Update local state - convert database nulls to proper types
      setTests(prev =>
        prev.map(test =>
          test.id === id
            ? {
                ...test,
                status: 'completed' as TestStatus,
                score: score || null,
                maxScore: maxScore || null,
                grade: grade || null,
                completedAt: new Date().toISOString()
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

  const value = {
    classes,
    homeworks,
    tests,
    loading,
    error,
    addClass,
    addHomework,
    addRecurringHomework,
    toggleHomework,
    togglePinHomework,
    deleteClass,
    deleteHomework,
    updateHomeworkDueDate,
    updateHomework,
    clearAllClasses,
    clearAllHomeworks,

    // Test management methods
    addTest,
    updateTest,
    deleteTest,
    markTestComplete,
    getUpcomingTests,
    getTestsByClass,
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