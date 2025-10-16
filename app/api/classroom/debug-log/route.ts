import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { GoogleClassroomService } from '@/lib/googleClassroom';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json({
        message: 'User ID is required'
      }, { status: 400 });
    }

    // Get Google Classroom access token from cookies
    const cookieStore = await cookies();
    const classroomAuthCookie = cookieStore.get('classroom-auth');

    if (!classroomAuthCookie?.value) {
      return NextResponse.json({
        message: 'No Google Classroom authentication found'
      }, { status: 401 });
    }

    const authData = JSON.parse(classroomAuthCookie.value);

    if (!authData.access_token) {
      return NextResponse.json({
        message: 'No valid Google Classroom access token'
      }, { status: 401 });
    }

    const classroomService = new GoogleClassroomService(authData.access_token);

    // Fetch courses and coursework
    const courses = await classroomService.getCourses();
    const courseWorkPromises = courses.map(course =>
      classroomService.getCourseWork(course.id).catch(err => {
        console.warn(`Failed to fetch coursework for course ${course.name}:`, err);
        return [];
      })
    );

    const courseWorkResults = await Promise.all(courseWorkPromises);

    // Format the results
    const formattedData = courses.map((course, index) => ({
      course: {
        id: course.id,
        name: course.name,
        section: course.section,
        description: course.description,
      },
      assignments: courseWorkResults[index].map(work => ({
        id: work.id,
        title: work.title,
        description: work.description,
        dueDate: work.dueDate,
        maxPoints: work.maxPoints,
        state: work.state,
      }))
    }));

    return NextResponse.json({
      message: 'Successfully fetched Google Classroom data',
      formattedData,
      coursesCount: courses.length,
      assignmentsCount: courseWorkResults.reduce((sum, arr) => sum + arr.length, 0)
    });

  } catch (error: any) {
    console.error('Error in Google Classroom debug API:', error);
    return NextResponse.json({
      message: 'Failed to fetch Google Classroom data',
      error: error.message
    }, { status: 500 });
  }
}
