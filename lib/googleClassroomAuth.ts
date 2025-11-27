/**
 * Google Classroom API Authorization Helper
 * 
 * This module helps manage the separate Google Classroom API authorization
 * that's required beyond the basic Google OAuth login.
 */

export interface ClassroomAuthStatus {
  isAuthorized: boolean;
  needsAuthorization: boolean;
  authUrl?: string;
}

/**
 * Check if Google Classroom API is authorized for the current user
 */
export async function checkClassroomAuthStatus(): Promise<ClassroomAuthStatus> {
  try {
    // Try to call the debug endpoint to check if Classroom auth exists
    const response = await fetch('/api/classroom/debug-log', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId: 'check' }), // We'll modify the API to handle this
    });

    if (response.ok) {
      return { isAuthorized: true, needsAuthorization: false };
    }

    const errorData = await response.json();
    if (response.status === 401 && errorData.message?.includes('No Google Classroom authentication found')) {
      // Get the authorization URL
      const authResponse = await fetch('/api/auth/google-classroom-init');
      const authData = await authResponse.json();
      
      return {
        isAuthorized: false,
        needsAuthorization: true,
        authUrl: authData.authUrl
      };
    }

    return { isAuthorized: false, needsAuthorization: false };
  } catch (error) {
    console.error('Error checking Classroom auth status:', error);
    return { isAuthorized: false, needsAuthorization: false };
  }
}

/**
 * Initiate Google Classroom API authorization
 */
export async function initiateClassroomAuth(): Promise<string> {
  try {
    const response = await fetch('/api/auth/google-classroom-init');
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to get authorization URL');
    }
    
    return data.authUrl;
  } catch (error) {
    console.error('Error initiating Classroom auth:', error);
    throw error;
  }
}

/**
 * Get a user-friendly message about Classroom authorization status
 */
export function getClassroomAuthMessage(status: ClassroomAuthStatus): string {
  if (status.isAuthorized) {
    return '✅ Google Classroom is connected and ready to sync your classes.';
  }
  
  if (status.needsAuthorization) {
    return '🔗 To sync your Google Classroom classes, you need to authorize access to the Classroom API.';
  }
  
  return '❓ Unable to determine Google Classroom authorization status.';
}
