'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { GoogleClassroomService } from '@/lib/googleClassroom';
import { useAuth } from '@/context/AuthContext';
import { 
  CheckCircle, 
  AlertCircle, 
  ExternalLink, 
  RefreshCw,
  BookOpen,
  Calendar,
  XCircle
} from 'lucide-react';

// Simple Google icon component
const GoogleIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

interface ClassroomAuthStatus {
  isAuthorized: boolean;
  needsAuthorization: boolean;
  lastSync?: string;
  coursesCount?: number;
}

export default function GoogleClassroomSection() {
  const { user, isGoogleUser } = useAuth();
  const searchParams = useSearchParams();
  const [authStatus, setAuthStatus] = useState<ClassroomAuthStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorizing, setIsAuthorizing] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isUnsyncing, setIsUnsyncing] = useState(false);

  // Check for success/error messages from URL parameters
  const success = searchParams.get('success');
  const error = searchParams.get('error');
  const reason = searchParams.get('reason');

  useEffect(() => {
    if (user && isGoogleUser) {
      checkAuthStatus();
    } else {
      setAuthStatus(null);
      setIsLoading(false);
    }
  }, [user, isGoogleUser]);

  const checkAuthStatus = async () => {
    setIsLoading(true);
    try {
      console.log('🔍 Checking Google Classroom authorization status...');
      
      // First, let's check if the classroom-auth cookie exists
      const getCookie = (name: string) => {
        const nameEQ = name + "=";
        const ca = document.cookie.split(';');
        for (let i = 0; i < ca.length; i++) {
          let c = ca[i];
          while (c.charAt(0) === ' ') c = c.substring(1, c.length);
          if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
        }
        return null;
      };

      const classroomAuthCookie = getCookie('classroom-auth');
      console.log('🔍 Classroom auth cookie exists:', !!classroomAuthCookie);
      
      if (classroomAuthCookie) {
        console.log('✅ Classroom auth cookie found, validating with debug-log API...');
        
        // Try to validate Classroom API access using the debug-log endpoint
        try {
          const response = await fetch('/api/classroom/debug-log', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: user?.id }),
          });

          if (response.ok) {
            const data = await response.json();
            console.log('✅ Classroom API validation successful:', data.coursesCount, 'courses');
            setAuthStatus({
              isAuthorized: true,
              needsAuthorization: false,
              coursesCount: data.coursesCount,
              lastSync: new Date().toLocaleString(),
            });
            return; // Success, exit early
          } else {
            const errorData = await response.json();
            console.log('⚠️ Classroom debug-log API returned error:', response.status, errorData);
          }
        } catch (apiError) {
          console.warn('Classroom debug-log API call failed:', apiError);
        }
      }

      // If debug-log didn't work, try the courses API as a fallback
      console.log('🔄 Trying courses API as fallback...');
      try {
        // First, we need to get the access token from the cookie if it exists
        let accessToken = null;
        if (classroomAuthCookie) {
          try {
            const authData = JSON.parse(classroomAuthCookie);
            accessToken = authData.access_token;
            console.log('✅ Extracted access token from cookie');
          } catch (parseError) {
            console.warn('Failed to parse classroom-auth cookie:', parseError);
          }
        }

        if (accessToken) {
          const response = await fetch('/api/classroom/courses', {
            headers: {
              'Authorization': `Bearer ${accessToken}`,
            },
          });

          if (response.ok) {
            const data = await response.json();
            console.log('✅ Courses API validation successful:', data.courses?.length || 0, 'courses');
            setAuthStatus({
              isAuthorized: true,
              needsAuthorization: false,
              coursesCount: data.courses?.length || 0,
              lastSync: new Date().toLocaleString(),
            });
            return; // Success, exit early
          } else {
            console.log('⚠️ Courses API returned error:', response.status);
          }
        } else {
          console.log('❌ No access token available for courses API');
        }
      } catch (coursesApiError) {
        console.warn('Courses API call failed:', coursesApiError);
      }

      // If we get here, both methods failed
      console.log('❌ All authentication methods failed');
      setAuthStatus({
        isAuthorized: false,
        needsAuthorization: true,
      });

    } catch (error) {
      console.error('Error checking Classroom auth status:', error);
      setAuthStatus({
        isAuthorized: false,
        needsAuthorization: false,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAuthorize = async () => {
    setIsAuthorizing(true);
    try {
      const response = await fetch('/api/auth/google-classroom-init');
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to get authorization URL');
      }
      
      // Redirect to Google OAuth for Classroom API
      window.location.href = data.authUrl;
    } catch (error) {
      console.error('Error initiating Classroom auth:', error);
      setIsAuthorizing(false);
    }
  };

  const handleUnsync = async () => {
    setIsUnsyncing(true);
    try {
      // Clear the Google Classroom authentication cookie
      document.cookie = 'classroom-auth=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      
      // Clear URL parameters to remove success/error messages
      const url = new URL(window.location.href);
      url.searchParams.delete('success');
      url.searchParams.delete('error');
      url.searchParams.delete('reason');
      window.history.replaceState({}, '', url.toString());
      
      // Update the auth status to reflect the disconnection
      setAuthStatus({
        isAuthorized: false,
        needsAuthorization: true,
      });
      
      console.log('✅ Google Classroom successfully unsynced');
    } catch (error) {
      console.error('Error unsyncing Google Classroom:', error);
    } finally {
      setIsUnsyncing(false);
    }
  };

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      const response = await fetch('/api/classroom/debug-log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user?.id }),
      });

      if (response.ok) {
        const data = await response.json();
        setAuthStatus(prev => ({
          ...prev!,
          coursesCount: data.coursesCount,
          lastSync: new Date().toLocaleString(),
        }));
        
        // Show success message
        console.log(`✅ Synced ${data.coursesCount} courses from Google Classroom`);
        
        // Trigger a refresh of the page to show new classes
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        console.error('Sync failed');
      }
    } catch (error) {
      console.error('Error syncing Classroom data:', error);
    } finally {
      setIsSyncing(false);
    }
  };

  if (!user) {
    return null;
  }

  if (!isGoogleUser) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GoogleIcon className="h-5 w-5" />
            Google Classroom Integration
          </CardTitle>
          <CardDescription>
            Connect your Google Classroom account to sync your classes and assignments
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
            <AlertCircle className="h-5 w-5 text-gray-500" />
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Google Classroom integration is only available for Google accounts
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                Your current account: {user.email}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <GoogleIcon className="h-5 w-5" />
          Google Classroom Integration
        </CardTitle>
        <CardDescription>
          Sync your Google Classroom classes and assignments automatically
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Success/Error Messages */}
        {success === 'classroom_authorized' && (
          <div className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900/30 rounded-lg">
            <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-500" />
            <div>
              <p className="text-sm font-medium text-green-900 dark:text-green-100">
                Google Classroom successfully connected!
              </p>
              <p className="text-xs text-green-700 dark:text-green-300">
                Your classes and assignments will now sync automatically.
              </p>
            </div>
          </div>
        )}
        
        {error === 'classroom_auth_failed' && (
          <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 rounded-lg">
            <XCircle className="h-5 w-5 text-red-600 dark:text-red-500" />
            <div>
              <p className="text-sm font-medium text-red-900 dark:text-red-100">
                Failed to connect Google Classroom
              </p>
              <p className="text-xs text-red-700 dark:text-red-300">
                {reason === 'access_denied' 
                  ? 'You denied access to Google Classroom. Please try again and grant the necessary permissions.'
                  : reason === 'no_code'
                  ? 'Authorization failed. Please try again.'
                  : `An error occurred: ${reason}`
                }
              </p>
            </div>
          </div>
        )}

        {/* Main Content - Only show if no success/error messages */}
        {!success && !error && (
          <>
            {isLoading ? (
              <div className="flex items-center gap-3 p-4">
                <RefreshCw className="h-5 w-5 animate-spin text-gray-500" />
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Checking authorization status...
                </p>
              </div>
            ) : authStatus?.isAuthorized ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900/30 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-500" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-green-900 dark:text-green-100">
                      Google Classroom is connected
                    </p>
                    <p className="text-xs text-green-700 dark:text-green-300">
                      {authStatus.coursesCount} courses synced
                      {authStatus.lastSync && ` • Last sync: ${authStatus.lastSync}`}
                    </p>
                  </div>
                  <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                    Connected
                  </Badge>
                </div>
                
                <div className="flex gap-2">
                  <Button 
                    onClick={handleSync} 
                    disabled={isSyncing}
                    variant="outline"
                    size="sm"
                  >
                    {isSyncing ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Syncing...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Sync Now
                      </>
                    )}
                  </Button>
                  
                  <Button 
                    onClick={handleUnsync} 
                    disabled={isUnsyncing}
                    variant="outline"
                    size="sm"
                    className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:border-red-800 dark:hover:bg-red-950/20"
                  >
                    {isUnsyncing ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Unsyncing...
                      </>
                    ) : (
                      <>
                        <XCircle className="h-4 w-4 mr-2" />
                        Unsync
                      </>
                    )}
                  </Button>
                  
                  <Button 
                    onClick={() => window.open('https://classroom.google.com', '_blank')}
                    variant="ghost"
                    size="sm"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Open Classroom
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-4 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-900/30 rounded-lg">
                  <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-500" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-yellow-900 dark:text-yellow-100">
                      Google Classroom authorization required
                    </p>
                    <p className="text-xs text-yellow-700 dark:text-yellow-300">
                      You need to authorize access to your Google Classroom data
                    </p>
                  </div>
                  <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300">
                    Not Connected
                  </Badge>
                </div>
                
                <Button 
                  onClick={handleAuthorize} 
                  disabled={isAuthorizing}
                  className="w-full"
                >
                  {isAuthorizing ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Redirecting...
                    </>
                  ) : (
                    <>
                      <GoogleIcon className="h-4 w-4 mr-2" />
                      Connect Google Classroom
                    </>
                  )}
                </Button>
                
                <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
                  <p>• This will redirect you to Google for authorization</p>
                  <p>• You'll be asked to grant access to your Classroom data</p>
                  <p>• Your classes and assignments will be synced automatically</p>
                </div>
              </div>
            )}
          </>
        )}
        
        <div className="pt-4 border-t border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
            <div className="flex items-center gap-1">
              <BookOpen className="h-3 w-3" />
              <span>Sync classes & assignments</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              <span>Automatic due date tracking</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
