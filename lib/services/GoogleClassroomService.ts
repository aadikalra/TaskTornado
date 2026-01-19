'use server';

import { google } from 'googleapis';
import { cookies } from 'next/headers';
import { classroom_v1 } from 'googleapis';

type GoogleClassroomCourse = classroom_v1.Schema$Course;
type GoogleClassroomCourseWork = classroom_v1.Schema$CourseWork;

async function getOAuthClient() {
  const cookieStore = await cookies();
  const classroomAuth = cookieStore.get('classroom-auth');

  if (!classroomAuth) {
    return null;
  }

  const authData = JSON.parse(classroomAuth.value);

  if (!authData.access_token) {
    return null;
  }

  const oauth2Client = new google.auth.OAuth2();
  oauth2Client.setCredentials({
    access_token: authData.access_token,
    refresh_token: authData.refresh_token,
    expiry_date: authData.expires_at,
  });

  return oauth2Client;
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
