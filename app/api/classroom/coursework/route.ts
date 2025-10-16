import { NextRequest, NextResponse } from 'next/server';
import { GoogleClassroomService } from '@/lib/googleClassroom';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const courseId = searchParams.get('courseId');

  if (!courseId) {
    return NextResponse.json({ message: 'Course ID is required' }, { status: 400 });
  }

  try {
    // TODO: Get access token from user's session/database
    const authHeader = request.headers.get('authorization');
    const accessToken = authHeader?.replace('Bearer ', '');

    if (!accessToken) {
      return NextResponse.json({ message: 'No access token provided' }, { status: 401 });
    }

    const classroomService = new GoogleClassroomService(accessToken);
    const coursework = await classroomService.getCourseWork(courseId);

    return NextResponse.json({ coursework });
  } catch (error: any) {
    console.error('Error fetching coursework:', error);
    return NextResponse.json({
      message: 'Failed to fetch coursework',
      error: error.message
    }, { status: 500 });
  }
}
