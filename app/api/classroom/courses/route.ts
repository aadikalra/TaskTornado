import { NextRequest, NextResponse } from 'next/server';
import { GoogleClassroomService } from '@/lib/googleClassroom';

export async function GET(request: NextRequest) {
  try {
    // TODO: Get access token from user's session/database
    const authHeader = request.headers.get('authorization');
    const accessToken = authHeader?.replace('Bearer ', '');

    if (!accessToken) {
      return NextResponse.json({ message: 'No access token provided' }, { status: 401 });
    }

    const classroomService = new GoogleClassroomService(accessToken);

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
