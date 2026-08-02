import { parseISO } from 'date-fns';

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

export const schoolYear2026_2027: SchoolEvent[] = [
  // August 2026
  {
    id: 'new-teacher-orientation-2026',
    title: 'New Teacher Orientation',
    startDate: date('2026-08-03'),
    endDate: date('2026-08-04'),
    type: 'event',
    color: '#4f46e5',
  },
  {
    id: 'professional-learning-aug-2026',
    title: 'No School: Professional Learning',
    startDate: date('2026-08-05'),
    endDate: date('2026-08-11'),
    type: 'event',
    color: '#8b5cf6',
  },
  {
    id: 'schedules-released-2026',
    title: 'Returning Student Schedules Released',
    startDate: date('2026-08-06'),
    type: 'event',
    color: '#3b82f6',
  },
  {
    id: 'new-student-orientation-2026',
    title: 'New Student Orientation (7th, 8th & 9th grades)',
    startDate: date('2026-08-10'),
    type: 'event',
    color: '#4f46e5',
  },
  {
    id: 'first-day-2026',
    title: 'First Day of School',
    startDate: date('2026-08-12'),
    type: 'event',
    color: '#4f46e5',
  },
  {
    id: 'back-to-school-night-2026',
    title: 'Back To School Night - WSCA 7th-12th',
    startDate: date('2026-08-20'),
    type: 'event',
    color: '#8b5cf6',
  },

  // September 2026
  {
    id: 'labor-day-2026',
    title: 'No School: Labor Day',
    startDate: date('2026-09-07'),
    type: 'holiday',
    color: '#ef4444',
  },
  {
    id: 'professional-learning-sep-2026',
    title: 'No School: Professional Learning',
    startDate: date('2026-09-08'),
    type: 'event',
    color: '#8b5cf6',
  },
  {
    id: 'progress-report-1-2026',
    title: 'Progress Report 1 (P1)',
    startDate: date('2026-09-11'),
    type: 'deadline',
    color: '#ec4899',
  },

  // October 2026
  {
    id: 'end-q1-2026',
    title: 'End of 1st Quarter (Q1)',
    startDate: date('2026-10-09'),
    type: 'deadline',
    color: '#ec4899',
  },
  {
    id: 'professional-learning-oct-2026',
    title: 'No School: Professional Learning',
    startDate: date('2026-10-12'),
    type: 'event',
    color: '#8b5cf6',
  },
  {
    id: 'psat-2026',
    title: 'PSAT Test',
    startDate: date('2026-10-17'),
    type: 'event',
    color: '#3b82f6',
    description: 'Saturday PSAT test',
  },

  // November 2026
  {
    id: 'veterans-day-2026',
    title: "No School: Veteran's Day",
    startDate: date('2026-11-11'),
    type: 'holiday',
    color: '#ef4444',
  },
  {
    id: 'progress-report-2-2026',
    title: 'Progress Report 2 (P2)',
    startDate: date('2026-11-13'),
    type: 'deadline',
    color: '#ec4899',
  },
  {
    id: 'thanksgiving-break-2026',
    title: 'No School: Thanksgiving Break',
    startDate: date('2026-11-23'),
    endDate: date('2026-11-27'),
    type: 'break',
    color: '#f59e0b',
  },
  {
    id: 'professional-learning-nov-2026',
    title: 'No School: Professional Learning',
    startDate: date('2026-11-30'),
    type: 'event',
    color: '#8b5cf6',
  },

  // December 2026
  {
    id: 'min-day-dec-2026',
    title: 'Minimum Day',
    startDate: date('2026-12-17'),
    type: 'event',
    color: '#3b82f6',
  },
  {
    id: 'end-semester-1-2026',
    title: 'End of 1st Semester (2nd Quarter) (S1)',
    startDate: date('2026-12-17'),
    type: 'deadline',
    color: '#ec4899',
  },
  {
    id: 'winter-break-2026',
    title: 'No School: Winter Break',
    startDate: date('2026-12-18'),
    endDate: date('2026-12-31'),
    type: 'break',
    color: '#3b82f6',
  },

  // January 2027
  {
    id: 'winter-break-jan-2027',
    title: 'No School: Winter Break',
    startDate: date('2027-01-01'),
    type: 'break',
    color: '#3b82f6',
  },
  {
    id: 'professional-learning-jan-2027',
    title: 'No School: Professional Learning',
    startDate: date('2027-01-04'),
    type: 'event',
    color: '#8b5cf6',
  },
  {
    id: 'mlk-day-2027',
    title: 'No School: Martin Luther King, Jr. Day',
    startDate: date('2027-01-18'),
    type: 'holiday',
    color: '#ef4444',
  },

  // February 2027
  {
    id: 'progress-report-3-2027',
    title: 'Progress Report 3 (P3)',
    startDate: date('2027-02-05'),
    type: 'deadline',
    color: '#ec4899',
  },
  {
    id: 'presidents-week-2027',
    title: "No School: President's Week",
    startDate: date('2027-02-15'),
    endDate: date('2027-02-19'),
    type: 'break',
    color: '#f59e0b',
  },
  {
    id: 'professional-learning-feb-2027',
    title: 'No School: Professional Learning',
    startDate: date('2027-02-22'),
    type: 'event',
    color: '#8b5cf6',
  },

  // March 2027
  {
    id: 'end-q3-2027',
    title: 'End of 3rd Quarter (Q3)',
    startDate: date('2027-03-19'),
    type: 'deadline',
    color: '#ec4899',
  },
  {
    id: 'spring-break-2027',
    title: 'No School: Spring Break',
    startDate: date('2027-03-22'),
    endDate: date('2027-03-26'),
    type: 'break',
    color: '#10b981',
  },
  {
    id: 'professional-learning-mar-2027',
    title: 'No School: Professional Learning',
    startDate: date('2027-03-29'),
    type: 'event',
    color: '#8b5cf6',
  },

  // April 2027
  {
    id: 'caaspp-1-2027',
    title: 'CAASPP Testing',
    startDate: date('2027-04-07'),
    endDate: date('2027-04-08'),
    type: 'event',
    color: '#3b82f6',
  },
  {
    id: 'caaspp-2-2027',
    title: 'CAASPP Testing',
    startDate: date('2027-04-14'),
    endDate: date('2027-04-15'),
    type: 'event',
    color: '#3b82f6',
  },
  {
    id: 'progress-report-4-2027',
    title: 'Progress Report 4 (P4)',
    startDate: date('2027-04-30'),
    type: 'deadline',
    color: '#ec4899',
  },

  // May 2027
  {
    id: 'ap-testing-2027',
    title: 'AP Testing',
    startDate: date('2027-05-03'),
    endDate: date('2027-05-14'),
    type: 'event',
    color: '#3b82f6',
  },
  {
    id: 'professional-learning-may-2027',
    title: 'No School: Professional Learning',
    startDate: date('2027-05-10'),
    type: 'event',
    color: '#8b5cf6',
  },
  {
    id: 'memorial-day-2027',
    title: 'No School: Memorial Day',
    startDate: date('2027-05-31'),
    type: 'holiday',
    color: '#ef4444',
  },

  // June 2027
  {
    id: '8th-grade-promotion-2027',
    title: '8th Grade Promotion - WSCA',
    startDate: date('2027-06-02'),
    type: 'event',
    color: '#4f46e5',
  },
  {
    id: 'end-semester-2-2027',
    title: 'End of 2nd Semester (4th Quarter) (S2)',
    startDate: date('2027-06-03'),
    type: 'deadline',
    color: '#ec4899',
  },
  {
    id: 'min-day-jun-2027',
    title: 'Minimum Day, Last Day of School',
    startDate: date('2027-06-03'),
    type: 'event',
    color: '#4f46e5',
  },
  {
    id: 'graduation-2027',
    title: 'WSCA High School Graduation',
    startDate: date('2027-06-04'),
    type: 'event',
    color: '#8b5cf6',
  },
  {
    id: 'professional-learning-jun-2027',
    title: 'No School: Professional Learning',
    startDate: date('2027-06-04'),
    type: 'event',
    color: '#8b5cf6',
  },
  {
    id: 'juneteenth-2027',
    title: 'No Summer Session: Juneteenth',
    startDate: date('2027-06-18'),
    type: 'holiday',
    color: '#ef4444',
  },
];

// Deprecated constant alias for backward compatibility
export const schoolYear2025_2026 = schoolYear2026_2027;

// Helper function to get events for a specific date
export const getEventsForDate = (
  date: Date | string,
  events: SchoolEvent[] = schoolYear2026_2027
): SchoolEvent[] => {
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