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

interface ClassContextType {
  classes: Class[];
  homeworks: Homework[];
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
}

const ClassContext = createContext<ClassContextType | undefined>(undefined);

export const ClassProvider = ({ children }: { children: React.ReactNode }) => {
  const { user, isGoogleUser } = useAuth();
  const [classes, setClasses] = useState<Class[]>([]);
  const [homeworks, setHomeworks] = useState<Homework[]>([]);
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
        const [classesData, homeworksData] = await Promise.all([
          db.getClasses(user.id),
          db.getHomework(user.id) // Get all homework
        ]);

        console.log('Fetched classes:', classesData);
        console.log('Fetched homeworks:', homeworksData);

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

        // Only update state if the data has actually changed
        setHomeworks(prevHomeworks => {
          if (JSON.stringify(prevHomeworks) === JSON.stringify(transformedHomeworks)) {
            return prevHomeworks;
          }
          return transformedHomeworks;
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
    
    try {
      await db.updateHomework(id, {
        pinned: pinned
      });
      // The subscription will handle the state update
    } catch (err) {
      console.error('Error toggling homework pin status:', err);
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

  const value = {
    classes,
    homeworks,
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