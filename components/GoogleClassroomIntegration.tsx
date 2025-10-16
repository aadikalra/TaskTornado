// components/GoogleClassroomIntegration.tsx
import React, { useState, useEffect } from 'react';
import { useGoogleClassroom } from '@/hooks/useGoogleClassroom';
import { Button } from '@/components/animate-ui/components/buttons/button';

interface GoogleClassroomIntegrationProps {
  onSyncComplete?: (assignments: any[]) => void;
}

export function GoogleClassroomIntegration({ onSyncComplete }: GoogleClassroomIntegrationProps) {
  const {
    isLoading,
    isAuthenticated,
    auth,
    courses,
    error,
    initiateAuth,
    fetchCourses,
    syncAllData,
    setAuth,
    setIsAuthenticated,
  } = useGoogleClassroom();
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncedAssignments, setSyncedAssignments] = useState<any[]>([]);

  // Check for existing auth data on component mount
  useEffect(() => {
    const checkExistingAuth = async () => {
      try {
        const response = await fetch('/api/auth/classroom-session');
        const data = await response.json();
  
        if (data.authenticated) {
          setAuth(data);
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error('Failed to check existing auth:', error);
      }
    };
  
    checkExistingAuth();
  }, []);

  const handleSync = async () => {
    if (!auth?.access_token) {
      throw new Error('Not authenticated');
    }

    setIsSyncing(true);
    try {
      // Use the sync API endpoint
      const response = await fetch('/api/classroom/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          accessToken: auth.access_token,
          userId: auth.user.id,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Sync failed');
      }

      // Fetch the updated assignments from database
      await fetchSyncedAssignments();

      onSyncComplete?.(data.assignments);
      alert(`Successfully synced ${data.assignmentsCount} assignments!`);
    } catch (err: any) {
      console.error('Sync failed:', err);
      alert(`Sync failed: ${err.message}`);
    } finally {
      setIsSyncing(false);
    }
  };

  const fetchSyncedAssignments = async () => {
    if (!auth?.user.id) return;

    try {
      const response = await fetch(`/api/classroom/assignments?userId=${auth.user.id}`);
      const data = await response.json();

      if (response.ok) {
        setSyncedAssignments(data.courses || []);
      }
    } catch (error) {
      console.error('Failed to fetch synced assignments:', error);
    }
  };

  const handleLogout = async () => {
    try {
      // Clear cookie via API
      await fetch('/api/auth/classroom-session', { method: 'DELETE' });

      // Clear local state
      setAuth(null);
      setIsAuthenticated(false);
      setSyncedAssignments([]);

      alert('Successfully logged out from Google Classroom');
    } catch (error) {
      console.error('Logout failed:', error);
      alert('Logout failed. Please try again.');
    }
  };

  const handleLinkAccount = async () => {
    try {
      const response = await fetch('/api/auth/link-google-account', {
        method: 'POST',
      });

      const data = await response.json();

      if (response.ok) {
        alert(`✅ Account linked! Welcome, ${data.email}`);
      } else {
        alert(`❌ ${data.message}`);
      }
    } catch (error: any) {
      console.error('Link account failed:', error);
      alert('Failed to link account. Please try again.');
    }
  };

  if (error) {
    return (
      <div className="p-4 border border-red-200 rounded-lg bg-red-50">
        <p className="text-red-800 text-sm">Error: {error}</p>
        <Button
          onClick={() => window.location.reload()}
          variant="outline"
          size="sm"
          className="mt-2"
        >
          Retry
        </Button>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="space-y-4">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Connect Google Classroom
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Automatically sync your assignments, deadlines, and grades from Google Classroom
          </p>
        </div>

        <Button
          onClick={initiateAuth}
          disabled={isLoading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white"
        >
          {isLoading ? 'Connecting...' : 'Connect Google Classroom'}
        </Button>

        <div className="text-xs text-gray-500 text-center">
          We'll only read your course data. No modifications will be made to your Google Classroom.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-medium text-green-800">
              Connected to Google Classroom
            </p>
            <p className="text-xs text-green-600">
              {auth?.user.email}
            </p>
          </div>
        </div>
        <Button
          onClick={handleLogout}
          variant="outline"
          size="sm"
          className="text-xs"
        >
          Logout
        </Button>
        <Button
          onClick={handleLinkAccount}
          variant="outline"
          size="sm"
          className="text-xs ml-2"
        >
          Link Account
        </Button>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">
            Synced Courses ({courses.length})
          </span>
          <Button
            onClick={fetchCourses}
            disabled={isLoading}
            variant="outline"
            size="sm"
          >
            {isLoading ? 'Refreshing...' : 'Refresh'}
          </Button>
        </div>

        <div className="max-h-32 overflow-y-auto space-y-2">
          {courses.slice(0, 5).map((course) => (
            <div key={course.id} className="flex items-center justify-between p-2 bg-gray-50 rounded text-sm">
              <span className="font-medium text-gray-900 truncate">{course.name}</span>
              <span className="text-xs text-gray-500">{course.section}</span>
            </div>
          ))}
          {courses.length > 5 && (
            <p className="text-xs text-gray-500 text-center">
              +{courses.length - 5} more courses
            </p>
          )}
        </div>
      </div>

      <Button
        onClick={handleSync}
        disabled={isSyncing || courses.length === 0}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white"
      >
        {isSyncing ? 'Syncing Assignments...' : `Sync All Assignments (${courses.length} courses)`}
      </Button>

      {/* Display synced assignments */}
      {syncedAssignments.length > 0 && (
        <div className="space-y-3">
          <div className="border-t pt-3">
            <h4 className="text-sm font-medium text-gray-700 mb-2">
              Synced Assignments ({syncedAssignments.reduce((sum, course) => sum + course.assignments.length, 0)})
            </h4>

            <div className="max-h-40 overflow-y-auto space-y-2">
              {syncedAssignments.map((course) => (
                <div key={course.id} className="space-y-1">
                  <div className="font-medium text-xs text-gray-600 uppercase tracking-wide">
                    {course.name}
                  </div>
                  {course.assignments.map((assignment: any) => (
                    <div key={assignment.id} className="flex items-center justify-between p-2 bg-blue-50 rounded text-sm">
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{assignment.title}</div>
                        {assignment.description && (
                          <div className="text-xs text-gray-600 truncate">{assignment.description}</div>
                        )}
                      </div>
                      <div className="text-xs text-gray-500 ml-2">
                        {assignment.maxPoints && `${assignment.maxPoints} pts`}
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="text-xs text-gray-500 space-y-1">
        <p>• Automatically imports new assignments and updates</p>
        <p>• Syncs grades and submission status</p>
        <p>• Preserves manual edits and custom organization</p>
      </div>
    </div>
  );
}
