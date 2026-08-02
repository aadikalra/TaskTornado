// app/api/classroom/assignments/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { ClassroomDatabaseService } from '@/lib/database/classroomService';
import { guardAuthenticatedRequest } from '@/lib/api/request-guard';

export async function GET(request: NextRequest) {
  const access = await guardAuthenticatedRequest(request);
  if (!access.ok) return access.response;

  try {
    const dbService = new ClassroomDatabaseService();
    const courses = await dbService.getUserCourses(access.user.id);

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
