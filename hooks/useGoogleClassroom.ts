// hooks/useGoogleClassroom.ts
import { useState, useCallback } from 'react';

export interface ClassroomCourse {
  id: string;
  name: string;
  section?: string;
  description?: string;
  room?: string;
  ownerId: string;
  creationTime: string;
  updateTime: string;
  courseState: string;
}

export interface ClassroomCourseWork {
  id: string;
  title: string;
  description?: string;
  state: string;
  creationTime: string;
  updateTime: string;
  dueDate?: {
    year: number;
    month: number;
    day: number;
  };
  dueTime?: {
    hours: number;
    minutes: number;
  };
  maxPoints?: number;
  workType: string;
}

export interface GoogleClassroomAuth {
  access_token: string;
  refresh_token?: string;
  user: {
    id: string;
    email: string;
    name: string;
    picture?: string;
  };
  expires_at: number;
}

export function useGoogleClassroom() {
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [auth, setAuth] = useState<GoogleClassroomAuth | null>(null);
  const [courses, setCourses] = useState<ClassroomCourse[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Initiate Google Classroom OAuth flow
  const initiateAuth = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/google-classroom-init');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to initiate Google Classroom auth');
      }

      // Redirect user to Google OAuth
      window.location.href = data.authUrl;
    } catch (err: any) {
      setError(err.message);
      setIsLoading(false);
    }
  }, []);

  // Handle OAuth callback (when user returns from Google)
  const handleAuthCallback = useCallback(async (code: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/auth/google-classroom?code=${encodeURIComponent(code)}`, {
        method: 'GET',
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to authenticate with Google Classroom');
      }

      setAuth(data);
      setIsAuthenticated(true);
      setIsLoading(false);

      // Redirect back to main app after successful auth
      window.location.href = '/';

      return data;
    } catch (err: any) {
      setError(err.message);
      setIsLoading(false);
      // Redirect back to main app even on error
      window.location.href = '/';
      throw err;
    }
  }, []);

  // Fetch user's courses
  const fetchCourses = useCallback(async () => {
    if (!auth?.access_token) {
      throw new Error('Not authenticated with Google Classroom');
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/classroom/courses', {
        headers: {
          'Authorization': `Bearer ${auth.access_token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch courses');
      }

      setCourses(data.courses);
      return data.courses;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [auth]);

  // Fetch coursework for a specific course
  const fetchCourseWork = useCallback(async (courseId: string) => {
    if (!auth?.access_token) {
      throw new Error('Not authenticated with Google Classroom');
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/classroom/coursework?courseId=${encodeURIComponent(courseId)}`, {
        headers: {
          'Authorization': `Bearer ${auth.access_token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch coursework');
      }

      return data.coursework;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [auth]);

  // Sync all courses and their assignments
  const syncAllData = useCallback(async () => {
    if (!courses.length) {
      await fetchCourses();
    }

    const allAssignments: any[] = [];

    for (const course of courses) {
      try {
        const courseWork = await fetchCourseWork(course.id);
        // Transform and add to assignments array
        // This would integrate with your existing homework system
      } catch (err) {
        console.error(`Failed to sync course ${course.name}:`, err);
      }
    }

    return allAssignments;
  }, [courses, fetchCourses, fetchCourseWork]);

  const logout = useCallback(() => {
    setAuth(null);
    setIsAuthenticated(false);
    setCourses([]);
    setError(null);
  }, []);

  return {
    // State
    isLoading,
    isAuthenticated,
    auth,
    courses,
    error,

    // State setters (for external use)
    setAuth,
    setIsAuthenticated,

    // Actions
    initiateAuth,
    handleAuthCallback,
    fetchCourses,
    fetchCourseWork,
    syncAllData,
    logout,
  };
}
