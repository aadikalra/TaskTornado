import { addDays, parseISO } from 'date-fns';

export interface SchoolEvent {
  id: string;
  title: string;
  startDate: Date;
  endDate?: Date;
  allDay?: boolean;
  type: 'holiday' | 'break' | 'event' | 'deadline';
  description?: string;
  color?: string;
}

// Helper function to create a date in the current timezone
const date = (dateString: string): Date => {
  return parseISO(dateString);
};

export const schoolYear2025_2026: SchoolEvent[] = [
  // August 2025
  {
    id: 'new-teacher-orientation-2025',
    title: 'New Teacher Orientation',
    startDate: date('2025-08-04'),
    endDate: date('2025-08-05'),
    type: 'event',
    color: '#4f46e5',
    description: 'Orientation for new teachers',
  },
  {
    id: 'professional-learning-aug-2025',
    title: 'Professional Learning',
    startDate: date('2025-08-06'),
    endDate: date('2025-08-12'),
    type: 'event',
    color: '#8b5cf6',
    description: 'Staff professional development days',
  },
  {
    id: 'schedules-released-2025',
    title: 'Returning Student Schedules Released',
    startDate: date('2025-08-07'),
    type: 'event',
    color: '#3b82f6',
    description: 'Schedules available for returning students',
  },
  {
    id: 'new-student-orientation-2025',
    title: 'New Student Orientation (7th & 9th grades)',
    startDate: date('2025-08-11'),
    type: 'event',
    color: '#4f46e5',
    description: 'Orientation for new 7th and 9th grade students',
  },
  {
    id: 'first-day-2025',
    title: 'First Day of School',
    startDate: date('2025-08-13'),
    type: 'event',
    color: '#4f46e5',
    description: 'First day of the 2025-2026 school year!',
  },
  {
    id: 'back-to-school-night-2025',
    title: 'Back To School Night - WSCA 7th-12th',
    startDate: date('2025-08-21'),
    type: 'event',
    color: '#8b5cf6',
    description: 'Evening event for parents to meet teachers',
  },
  
  // September 2025
  {
    id: 'labor-day-2025',
    title: 'No School: Labor Day',
    startDate: date('2025-09-01'),
    type: 'holiday',
    color: '#ef4444',
  },
  // REMOVED: Professional Learning on Sep 2 was not in the PDF.
  // REMOVED: Progress Report 1 (P1) was moved to the correct date in November.
  
  // October 2025
  {
    id: 'end-q1-2025',
    title: 'End of 1st Quarter (Q1)',
    // UPDATED: Date changed from Oct 9 to Oct 10 per the PDF.
    startDate: date('2025-10-10'),
    type: 'deadline',
    color: '#ec4899',
  },
  {
    id: 'psat-2025',
    title: 'PSAT Test',
    startDate: date('2025-10-11'),
    type: 'event',
    color: '#3b82f6',
    description: 'Tentative PSAT test date',
  },
  {
    id: 'professional-learning-oct-2025',
    title: 'No School: Professional Learning',
    startDate: date('2025-10-13'),
    type: 'event',
    color: '#8b5cf6',
  },
  
  // November 2025
  {
    // ADDED: This event was missing from the original code.
    id: 'professional-learning-nov-2025',
    title: 'No School: Professional Learning',
    startDate: date('2025-11-02'),
    type: 'event',
    color: '#8b5cf6',
  },
  {
    id: 'school-recess-nov-2025',
    title: 'No School: School Recess',
    startDate: date('2025-11-10'),
    type: 'holiday',
    color: '#ef4444',
  },
  {
    id: 'veterans-day-2025',
    title: "No School: Veteran's Day",
    startDate: date('2025-11-11'),
    type: 'holiday',
    color: '#ef4444',
  },
  {
    // MOVED: Progress Report 1 was moved here from September.
    id: 'progress-report-1-2025',
    title: 'Progress Report 1 (P1)',
    startDate: date('2025-11-12'),
    type: 'deadline',
    color: '#ec4899',
  },
  {
    id: 'progress-report-2-2025',
    title: 'Progress Report 2 (P2)',
    startDate: date('2025-11-14'),
    type: 'deadline',
    color: '#ec4899',
  },
  {
    id: 'thanksgiving-break-2025',
    title: 'No School: Thanksgiving Break',
    startDate: date('2025-11-24'),
    endDate: date('2025-11-28'),
    type: 'break',
    color: '#f59e0b',
  },
  
  // December 2025
  {
    id: 'professional-learning-dec-2025',
    title: 'No School: Professional Learning',
    startDate: date('2025-12-01'),
    type: 'event',
    color: '#8b5cf6',
  },
  {
    id: 'end-semester-1-2025',
    title: 'End of 1st Semester (2nd Quarter) (S1)',
    startDate: date('2025-12-19'),
    type: 'deadline',
    color: '#ec4899',
  },
  {
    id: 'min-day-dec-2025',
    title: 'Minimum Day',
    startDate: date('2025-12-19'),
    type: 'event',
    color: '#3b82f6',
  },
  {
    id: 'winter-break-2025',
    title: 'No School: Winter Break',
    startDate: date('2025-12-22'),
    endDate: date('2025-12-31'),
    type: 'break',
    color: '#3b82f6',
  },
  
  // January 2026
  {
    id: 'winter-break-jan-2026',
    title: 'No School: Winter Break',
    startDate: date('2026-01-01'),
    endDate: date('2026-01-02'),
    type: 'break',
    color: '#3b82f6',
  },
  {
    id: 'professional-learning-jan-2026',
    title: 'No School: Professional Learning',
    startDate: date('2026-01-05'),
    type: 'event',
    color: '#8b5cf6',
  },
  {
    id: 'mlk-day-2026',
    title: 'No School: Martin Luther King, Jr. Day',
    startDate: date('2026-01-19'),
    type: 'holiday',
    color: '#ef4444',
  },
  
  // February 2026
  {
    id: 'progress-report-3-2026',
    title: 'Progress Report 3 (P3)',
    startDate: date('2026-02-06'),
    type: 'deadline',
    color: '#ec4899',
  },
  {
    id: 'presidents-week-2026',
    title: "No School: President's Week",
    startDate: date('2026-02-16'),
    endDate: date('2026-02-20'),
    type: 'break',
    color: '#f59e0b',
  },
  {
    id: 'professional-learning-feb-2026',
    title: 'No School: Professional Learning',
    startDate: date('2026-02-23'),
    type: 'event',
    color: '#8b5cf6',
  },
  
  // March 2026
  {
    id: 'min-day-mar-2026',
    title: 'Minimum Day (Grades 7-12)',
    startDate: date('2026-03-23'),
    type: 'event',
    color: '#3b82f6',
  },
  {
    id: 'end-q3-2026',
    title: 'End of 3rd Quarter (Q3)',
    startDate: date('2026-03-27'),
    type: 'deadline',
    color: '#ec4899',
  },
  {
    id: 'spring-break-2026',
    title: 'No School: Spring Break',
    startDate: date('2026-03-30'),
    endDate: date('2026-04-03'),
    type: 'break',
    color: '#10b981',
  },
  
  // April 2026
  {
    id: 'professional-learning-apr-2026',
    title: 'No School: Professional Learning',
    startDate: date('2026-04-06'),
    type: 'event',
    color: '#8b5cf6',
  },
  {
    id: 'caaspp-1-2026',
    title: 'CAASPP Testing',
    startDate: date('2026-04-15'),
    endDate: date('2026-04-16'),
    type: 'event',
    color: '#3b82f6',
    description: 'Tentative CAASPP testing dates',
  },
  {
    id: 'caaspp-2-2026',
    title: 'CAASPP Testing',
    startDate: date('2026-04-22'),
    endDate: date('2026-04-23'),
    type: 'event',
    color: '#3b82f6',
    description: 'Tentative CAASPP testing dates',
  },
  
  // May 2026
  {
    id: 'progress-report-4-2026',
    title: 'Progress Report (P4)',
    startDate: date('2026-05-01'),
    type: 'deadline',
    color: '#ec4899',
  },
  {
    id: 'professional-learning-may-2026',
    title: 'No School: Professional Learning',
    startDate: date('2026-05-11'),
    type: 'event',
    color: '#8b5cf6',
  },
  {
    id: 'memorial-day-2026',
    title: 'No School: Memorial Day',
    startDate: date('2026-05-25'),
    type: 'holiday',
    color: '#ef4444',
  },
  
  // June 2026
  {
    id: '8th-grade-promotion-2026',
    title: '8th Grade Promotion - WSCA',
    startDate: date('2026-06-03'),
    type: 'event',
    color: '#4f46e5',
  },
  {
    id: 'last-day-2026',
    title: 'Minimum Day, Last Day of School',
    startDate: date('2026-06-04'),
    type: 'event',
    color: '#4f46e5',
    description: 'End of 2nd Semester (4th Quarter) (S2)',
  },
  {
    id: 'graduation-2026',
    title: 'WSCA High School Graduation',
    startDate: date('2026-06-05'),
    type: 'event',
    color: '#8b5cf6',
    description: 'Professional Learning Day for staff',
  },
  {
    id: 'juneteenth-2026',
    title: 'No Summer Session: Juneteenth',
    startDate: date('2026-06-19'),
    type: 'holiday',
    color: '#ef4444',
  },
];

// Helper function to get events for a specific date
export const getEventsForDate = (date: Date, events: SchoolEvent[]): SchoolEvent[] => {
  return events.filter(event => {
    const eventStartDate = new Date(event.startDate);
    eventStartDate.setHours(0, 0, 0, 0);
    
    const currentDate = new Date(date);
    currentDate.setHours(0, 0, 0, 0);
    
    // Check if the event is on this specific date
    if (event.startDate && !event.endDate) {
      return eventStartDate.getTime() === currentDate.getTime();
    }
    
    // Check if the date is within the event's date range
    if (event.endDate) {
      const eventEndDate = new Date(event.endDate);
      eventEndDate.setHours(23, 59, 59, 999);
      
      return currentDate >= eventStartDate && currentDate <= eventEndDate;
    }
    
    return false;
  });
};