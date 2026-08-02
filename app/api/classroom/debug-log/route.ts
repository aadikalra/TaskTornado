import { NextRequest, NextResponse } from 'next/server';
import { GoogleClassroomService } from '@/lib/googleClassroom';
import { guardAuthenticatedRequest } from '@/lib/api/request-guard';
import { getGoogleClientForUser } from '@/lib/google-oauth';

export async function POST(request: NextRequest) {
  const access = await guardAuthenticatedRequest(request, {
    limit: 10,
    windowMs: 60_000,
  });
  if (!access.ok) return access.response;

  try {
    const googleAuth = await getGoogleClientForUser(access.user.id, 'classroom');
    if (!googleAuth) {
      return NextResponse.json({
        message: 'No Google Classroom authentication found'
      }, { status: 401 });
    }

    const accessToken = await googleAuth.client.getAccessToken();
    if (!accessToken.token) {
      return NextResponse.json({
        message: 'No valid Google Classroom access token'
      }, { status: 401 });
    }

    const classroomService = new GoogleClassroomService(accessToken.token);

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
