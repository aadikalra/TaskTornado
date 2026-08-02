import { NextRequest, NextResponse } from 'next/server';
import { GoogleClassroomService } from '@/lib/googleClassroom';
import { guardAuthenticatedRequest } from '@/lib/api/request-guard';
import { getGoogleClientForUser } from '@/lib/google-oauth';

export async function GET(request: NextRequest) {
  const access = await guardAuthenticatedRequest(request);
  if (!access.ok) return access.response;

  const { searchParams } = new URL(request.url);
  const courseId = searchParams.get('courseId');

  if (!courseId) {
    return NextResponse.json({ message: 'Course ID is required' }, { status: 400 });
  }

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
