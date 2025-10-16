import { NextRequest, NextResponse } from 'next/server';
import { ClassroomSyncService } from '@/lib/classroomSyncService';
import { ClassroomDatabaseService } from '@/lib/database/classroomService';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { accessToken, userId } = body;

    if (!accessToken || !userId) {
      return NextResponse.json({
        message: 'Access token and user ID are required'
      }, { status: 400 });
    }

    const syncService = new ClassroomSyncService(accessToken, userId);
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
          user_id: userId,
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
      await dbService.saveSyncSettings(userId, {
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
