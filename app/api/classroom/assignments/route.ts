// app/api/classroom/assignments/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { ClassroomDatabaseService } from '@/lib/database/classroomService';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ message: 'User ID is required' }, { status: 400 });
    }

    const dbService = new ClassroomDatabaseService();
    const courses = await dbService.getUserCourses(userId);

    // For each course, get the coursework
    const coursesWithAssignments = await Promise.all(
      courses.map(async (course) => {
        const coursework = await dbService.getCourseworkByCourse(course.id!);

        return {
          id: course.id,
          name: course.name,
          section: course.section,
          assignments: coursework.map(cw => ({
            id: cw.id,
            title: cw.title,
            description: cw.description,
            dueDate: cw.due_date,
            maxPoints: cw.max_points,
            state: cw.state,
            workType: cw.work_type,
          })),
        };
      })
    );

    return NextResponse.json({
      courses: coursesWithAssignments,
      totalAssignments: coursesWithAssignments.reduce((sum, course) => sum + course.assignments.length, 0)
    });

  } catch (error: any) {
    console.error('Error fetching assignments:', error);
    return NextResponse.json({
      message: 'Failed to fetch assignments',
      error: error.message
    }, { status: 500 });
  }
}
