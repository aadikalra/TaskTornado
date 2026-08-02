'use server';

import { google } from 'googleapis';
import { classroom_v1 } from 'googleapis';
import { createClient } from '@/lib/supabase/server';
import { getGoogleClientForUser } from '@/lib/google-oauth';

type GoogleClassroomCourse = classroom_v1.Schema$Course;
type GoogleClassroomCourseWork = classroom_v1.Schema$CourseWork;

async function getOAuthClient() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const googleAuth = await getGoogleClientForUser(user.id, 'classroom');
  return googleAuth?.client || null;
}

export async function getGoogleClassroomCourses(): Promise<GoogleClassroomCourse[]> {
  try {
    const oauth2Client = await getOAuthClient();
    if (!oauth2Client) return [];

    const classroom = google.classroom({ version: 'v1', auth: oauth2Client });
    const response = await classroom.courses.list({
      courseStates: ['ACTIVE'],
    });

    return response.data.courses || [];
  } catch (error) {
    console.error('Error fetching Google Classroom courses:', error);
    return [];
  }
}

export async function getGoogleClassroomCourseWork(courseId: string): Promise<GoogleClassroomCourseWork[]> {
  try {
    const oauth2Client = await getOAuthClient();
    if (!oauth2Client) return [];

    const classroom = google.classroom({ version: 'v1', auth: oauth2Client });

    const response = await classroom.courses.courseWork.list({
      courseId: courseId,
    });

    return response.data.courseWork || [];
  } catch (error) {
    console.error('Error fetching Google Classroom coursework:', error);
    return [];
  }
}

export async function getAllGoogleClassroomCourseWork(): Promise<{ courseId: string; courseName: string; work: GoogleClassroomCourseWork[] }[]> {
  try {
    const courses = await getGoogleClassroomCourses();

    const results = await Promise.all(
      courses.map(async (course) => {
        try {
          const work = await getGoogleClassroomCourseWork(course.id!);
          return {
            courseId: course.id!,
            courseName: course.name!,
            work,
          };
        } catch (error) {
          console.error(`Error fetching work for course ${course.id}:`, error);
          return {
            courseId: course.id!,
            courseName: course.name!,
            work: [],
          };
        }
      })
    );

    return results;
  } catch (error) {
    return [];
  }
}
