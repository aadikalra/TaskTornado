import { NextRequest, NextResponse } from 'next/server';
import { GoogleClassroomService } from '@/lib/googleClassroom';
import { guardAuthenticatedRequest } from '@/lib/api/request-guard';
import { getGoogleClientForUser } from '@/lib/google-oauth';

export async function GET(request: NextRequest) {
  const access = await guardAuthenticatedRequest(request);
  if (!access.ok) return access.response;

  try {
    const googleAuth = await getGoogleClientForUser(access.user.id, 'classroom');
    if (!googleAuth) {
      return NextResponse.json({ message: 'Classroom is not connected' }, { status: 401 });
    }

    const accessToken = await googleAuth.client.getAccessToken();
    if (!accessToken.token) {
      return NextResponse.json({ message: 'Classroom authorization expired' }, { status: 401 });
    }

    const classroomService = new GoogleClassroomService(accessToken.token);

    // Try both student and teacher roles
    let courses = [];
    let errors = [];

    try {
      // First try as student
      courses = await classroomService.getCoursesAsStudent();
      console.log('Student courses:', courses.length);
    } catch (studentError) {
      console.log('Student role failed:', studentError);
      errors.push(`Student: ${studentError}`);
      try {
        // If student fails, try as teacher
        courses = await classroomService.getCoursesAsTeacher();
        console.log('Teacher courses:', courses.length);
      } catch (teacherError) {
        console.log('Teacher role also failed:', teacherError);
        errors.push(`Teacher: ${teacherError}`);
        throw new Error(`Unable to access Google Classroom courses. Errors: ${errors.join(', ')}`);
      }
    }

    return NextResponse.json({ courses, debug: { errors } });
  } catch (error: any) {
    console.error('Error fetching courses:', error);
    return NextResponse.json({
      message: 'Failed to fetch courses',
      error: error.message
    }, { status: 500 });
  }
}
