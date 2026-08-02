import { NextRequest, NextResponse } from 'next/server';
import { ClassroomSyncService } from '@/lib/classroomSyncService';
import { ClassroomDatabaseService } from '@/lib/database/classroomService';
import { guardAuthenticatedRequest } from '@/lib/api/request-guard';
import { getGoogleClientForUser } from '@/lib/google-oauth';

export async function POST(request: NextRequest) {
  const access = await guardAuthenticatedRequest(request, {
    limit: 5,
    windowMs: 60_000,
  });
  if (!access.ok) return access.response;

  try {
    const googleAuth = await getGoogleClientForUser(access.user.id, 'classroom');
    if (!googleAuth) {
      return NextResponse.json({
        message: 'Google Classroom is not connected'
      }, { status: 401 });
    }

    const accessToken = await googleAuth.client.getAccessToken();
    if (!accessToken.token) {
      return NextResponse.json({
        message: 'Google Classroom authorization expired'
      }, { status: 401 });
    }

    const syncService = new ClassroomSyncService(
      accessToken.token,
      access.user.id
    );
    const assignments = await syncService.syncAllCoursesAndAssignments();

    // Save to database
    const dbService = new ClassroomDatabaseService();
    let savedCount = 0;
    let errors = [];

    // Save courses first
    for (const assignment of assignments) {
      try {
        // Find or create the course record
        const courseData = {
          user_id: access.user.id,
          google_course_id: assignment.externalId,
          name: assignment.courseName,
          section: assignment.subject,
          owner_id: assignment.classroomId,
          course_state: 'ACTIVE',
          synced_at: new Date().toISOString(),
        };

        await dbService.saveCourse(courseData);
        savedCount++;
      } catch (error: any) {
        errors.push(`Failed to save assignment ${assignment.title}: ${error.message}`);
      }
    }

    // Update sync settings
    try {
      await dbService.saveSyncSettings(access.user.id, {
        last_sync_at: new Date().toISOString(),
      });
    } catch (syncError: any) {
      console.error('Failed to update sync settings:', syncError);
      errors.push(`Sync settings update failed: ${syncError.message}`);
    }

    return NextResponse.json({
      message: 'Successfully synced Google Classroom data',
      assignmentsCount: assignments.length,
      savedCount,
      errors: errors.length > 0 ? errors : undefined,
      assignments: assignments.slice(0, 5) // Return first 5 for preview
    });

  } catch (error: any) {
    console.error('Error syncing classroom data:', error);
    return NextResponse.json({
      message: 'Failed to sync Google Classroom data',
      error: error.message
    }, { status: 500 });
  }
}
