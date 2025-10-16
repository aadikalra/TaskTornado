// lib/googleClassroom.ts
import { google } from 'googleapis';

export interface ClassroomCourse {
  id: string;
  name: string;
  section?: string;
  description?: string;
  room?: string;
  ownerId: string;
  creationTime: string;
  updateTime: string;
  courseState: string;
}

export interface ClassroomCourseWork {
  id: string;
  title: string;
  description?: string;
  state: string;
  creationTime: string;
  updateTime: string;
  dueDate?: {
    year: number;
    month: number;
    day: number;
  };
  dueTime?: {
    hours: number;
    minutes: number;
  };
  maxPoints?: number;
  workType: string;
}

export class GoogleClassroomService {
  private oauth2Client: any;
  constructor(accessToken: string) {
    this.oauth2Client = new google.auth.OAuth2();
    this.oauth2Client.setCredentials({ access_token: accessToken });
  }

  async getCoursesAsStudent(): Promise<ClassroomCourse[]> {
    try {
      const classroom = google.classroom({ version: 'v1', auth: this.oauth2Client });

      const response = await classroom.courses.list({
        courseStates: ['ACTIVE'],
        studentId: 'me',
      });

      return (response.data.courses || []).filter((course): course is ClassroomCourse =>
        course.id !== null && course.id !== undefined
      );
    } catch (error) {
      console.error('Error fetching courses as student:', error);
      throw error;
    }
  }

  async getCoursesAsTeacher(): Promise<ClassroomCourse[]> {
    try {
      const classroom = google.classroom({ version: 'v1', auth: this.oauth2Client });

      const response = await classroom.courses.list({
        courseStates: ['ACTIVE'],
        teacherId: 'me',
      });

      return (response.data.courses || []).filter((course): course is ClassroomCourse =>
        course.id !== null && course.id !== undefined
      );
    } catch (error) {
      console.error('Error fetching courses as teacher:', error);
      throw error;
    }
  }

  async getCourses(): Promise<ClassroomCourse[]> {
    // Keep the original method for backward compatibility
    try {
      return await this.getCoursesAsStudent();
    } catch (error) {
      return await this.getCoursesAsTeacher();
    }
  }

  async getCourseWork(courseId: string): Promise<ClassroomCourseWork[]> {
    try {
      const classroom = google.classroom({ version: 'v1', auth: this.oauth2Client });

      const response = await classroom.courses.courseWork.list({
        courseId,
        courseWorkStates: ['PUBLISHED'],
      });

      return (response.data.courseWork || []).filter((courseWork): courseWork is ClassroomCourseWork =>
        courseWork.id !== null && courseWork.id !== undefined
      );
    } catch (error) {
      console.error('Error fetching coursework:', error);
      throw new Error('Failed to fetch Google Classroom coursework');
    }
  }

  async getStudentSubmissions(courseId: string, courseWorkId: string) {
    try {
      const classroom = google.classroom({ version: 'v1', auth: this.oauth2Client });

      const response = await classroom.courses.courseWork.studentSubmissions.list({
        courseId,
        courseWorkId,
        states: ['TURNED_IN', 'RETURNED', 'RECLAIMED_BY_STUDENT'],
      });

      return response.data.studentSubmissions || [];
    } catch (error) {
      console.error('Error fetching submissions:', error);
      throw new Error('Failed to fetch Google Classroom submissions');
    }
  }

  // Transform Classroom data to app format
  transformCourseToHomework(course: ClassroomCourse, courseWork: ClassroomCourseWork) {
    return {
      id: courseWork.id,
      title: courseWork.title,
      description: courseWork.description || '',
      courseName: course.name,
      courseId: course.id,
      dueDate: courseWork.dueDate ? this.formatDueDate(courseWork.dueDate, courseWork.dueTime) : null,
      points: courseWork.maxPoints || 0,
      status: 'assigned', // Will be updated based on submissions
      priority: 'medium',
      subject: course.section || 'General',
      source: 'google_classroom',
      classroomId: courseWork.id,
      externalId: courseWork.id,
      lastSynced: new Date(),
      createdAt: new Date(courseWork.creationTime),
      updatedAt: new Date(courseWork.updateTime),
    };
  }

  private formatDueDate(dueDate: any, dueTime?: any): Date | null {
    if (!dueDate) return null;

    const date = new Date(dueDate.year, dueDate.month - 1, dueDate.day);

    if (dueTime) {
      date.setHours(dueTime.hours, dueTime.minutes, 0, 0);
    }

    return date;
  }
}
