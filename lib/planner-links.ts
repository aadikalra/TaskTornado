export const PLANNER_LINKS = {
    student: { href: '/student-planner', label: 'Student Planner' },
    homework: { href: '/homework-planner', label: 'Homework Planner' },
    assignments: { href: '/assignment-tracker', label: 'Assignment Tracker' },
    ai: { href: '/ai-study-planner', label: 'AI Study Planner' },
    schedule: { href: '/class-schedule-planner', label: 'Class Schedule Planner' },
} as const;

export type PlannerPageId = keyof typeof PLANNER_LINKS;
