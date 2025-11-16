import { Class, Homework, LucideIconName } from '@/context/ClassContext';
import { classroom_v1 } from 'googleapis';

const classColorPalette = [
  '#E53E3E', '#3182CE', '#D69E2E', '#38A169', '#805AD5',
  '#D53F8C', '#2C7A7B', '#DD6B20', '#00B5D8', '#5A67D8',
];

const generateConsistentColor = (id: string) => {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    const char = id.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  const index = Math.abs(hash) % classColorPalette.length;
  return classColorPalette[index];
};

export function transformGoogleClassroomData(
    courses: classroom_v1.Schema$Course[],
    allCourseWork: { courseId: string; work: classroom_v1.Schema$CourseWork[] }[],
    userId: string
): { classes: Class[], homeworks: Homework[] } {
    const transformedClasses: Class[] = courses.map((course, index) => ({
        id: course.id || `gc-${index}`,
        name: course.name || 'Unknown Course',
        icon: 'BookOpen' as LucideIconName,
        color: generateConsistentColor(course.id || `gc-${index}`),
        user_id: userId,
        created_at: course.creationTime || new Date().toISOString(),
        updated_at: course.updateTime || new Date().toISOString()
    }));

    const transformedHomeworks: Homework[] = [];
    allCourseWork.forEach(({ courseId, work }) => {
        work.forEach((courseWork) => {
            if (courseWork.dueDate) {
                const dueDate = new Date(
                    courseWork.dueDate.year || new Date().getFullYear(),
                    (courseWork.dueDate.month || 1) - 1,
                    courseWork.dueDate.day || 1
                );

                if (courseWork.dueTime) {
                    dueDate.setHours(
                        courseWork.dueTime.hours || 0,
                        courseWork.dueTime.minutes || 0,
                        courseWork.dueTime.seconds || 0
                    );
                }

                transformedHomeworks.push({
                    id: courseWork.id || `gc-${Date.now()}-${Math.random()}`,
                    user_id: userId,
                    classId: courseId,
                    title: courseWork.title || 'Untitled Assignment',
                    description: courseWork.description || '',
                    dueDate: dueDate.toISOString(),
                    priority: 'medium',
                    completed: false,
                    pinned: false,
                    links: [],
                    created_at: courseWork.creationTime || new Date().toISOString(),
                    updated_at: courseWork.updateTime || new Date().toISOString(),
                    recurring_id: null,
                    recurring_frequency: null,
                    recurring_end_date: null,
                    recurring_max_occurrences: null,
                    parent_recurring_id: null,
                    is_recurring_instance: false
                } as Homework);
            }
        });
    });

    return { classes: transformedClasses, homeworks: transformedHomeworks };
}
