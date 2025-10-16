// lib/classroomSyncService.ts
import { GoogleClassroomService, ClassroomCourse, ClassroomCourseWork } from './googleClassroom';

export interface SyncedHomeworkItem {
  id: string;
  title: string;
  description: string;
  courseName: string;
  dueDate: Date | null;
  points: number;
  status: 'assigned' | 'submitted' | 'graded';
  priority: 'low' | 'medium' | 'high';
  subject: string;
  source: 'google_classroom';
  classroomId: string;
  externalId: string;
  lastSynced: Date;
}

export class ClassroomSyncService {
  private classroomService: GoogleClassroomService;
  private userId: string;

  constructor(accessToken: string, userId: string) {
    this.classroomService = new GoogleClassroomService(accessToken);
    this.userId = userId;
  }

  async syncAllCoursesAndAssignments(): Promise<SyncedHomeworkItem[]> {
    try {
      // Fetch all courses
      const courses = await this.classroomService.getCourses();

      const allAssignments: SyncedHomeworkItem[] = [];

      // For each course, fetch assignments and transform them
      for (const course of courses) {
        try {
          const courseWork = await this.classroomService.getCourseWork(course.id);
          const assignments = courseWork.map(cw => this.transformToHomeworkItem(course, cw));
          allAssignments.push(...assignments);
        } catch (error) {
          console.error(`Failed to sync course ${course.name}:`, error);
          // Continue with other courses even if one fails
        }
      }

      return allAssignments;
    } catch (error) {
      console.error('Failed to sync all courses:', error);
      throw new Error('Failed to sync Google Classroom data');
    }
  }

  async syncSingleCourse(courseId: string): Promise<SyncedHomeworkItem[]> {
    try {
      // Fetch single course
      const courses = await this.classroomService.getCourses();
      const course = courses.find(c => c.id === courseId);

      if (!course) {
        throw new Error(`Course ${courseId} not found`);
      }

      // Fetch assignments for this course
      const courseWork = await this.classroomService.getCourseWork(courseId);
      const assignments = courseWork.map(cw => this.transformToHomeworkItem(course, cw));

      return assignments;
    } catch (error) {
      console.error(`Failed to sync course ${courseId}:`, error);
      throw error;
    }
  }

  private transformToHomeworkItem(course: ClassroomCourse, courseWork: ClassroomCourseWork): SyncedHomeworkItem {
    return {
      id: `gc_${courseWork.id}_${Date.now()}`, // Generate unique ID
      title: courseWork.title,
      description: courseWork.description || '',
      courseName: course.name,
      dueDate: courseWork.dueDate ? this.formatDueDate(courseWork.dueDate, courseWork.dueTime) : null,
      points: courseWork.maxPoints || 0,
      status: 'assigned', // Default status, will be updated with submission data
      priority: this.determinePriority(courseWork),
      subject: course.section || 'General',
      source: 'google_classroom',
      classroomId: courseWork.id,
      externalId: courseWork.id,
      lastSynced: new Date(),
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

  private determinePriority(courseWork: ClassroomCourseWork): 'low' | 'medium' | 'high' {
    // Simple priority logic based on due date proximity and points
    const now = new Date();
    const dueDate = courseWork.dueDate ? this.formatDueDate(courseWork.dueDate, courseWork.dueTime) : null;

    if (!dueDate) return 'medium';

    const daysUntilDue = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (daysUntilDue <= 1) return 'high';
    if (daysUntilDue <= 3) return 'medium';
    return 'low';
  }

  async getSubmissionStatus(courseId: string, courseWorkId: string) {
    try {
      return await this.classroomService.getStudentSubmissions(courseId, courseWorkId);
    } catch (error) {
      console.error('Failed to get submission status:', error);
      return [];
    }
  }
}
