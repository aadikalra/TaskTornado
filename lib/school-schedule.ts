// School schedule detection and warnings
export interface SchoolSchedule {
  name: string;
  periods: SchoolPeriod[];
  isActive: (currentTime: Date) => boolean;
  allowedPeriods: string[]; // Names of periods when app usage is allowed
}

export interface SchoolPeriod {
  name: string;
  startTime: string;
  endTime: string;
  isBreak?: boolean;
  isLunch?: boolean;
  isPassing?: boolean;
  isPackTime?: boolean;
  isELT?: boolean;
  isAllowed?: boolean; // Whether app usage is allowed during this period
}

// Define school schedules - only allow usage during breaks, lunch, pack time, passing, and ELT
export const SCHOOL_SCHEDULES: Record<string, SchoolSchedule> = {
  regular: {
    name: "Regular School Day",
    periods: [
      { name: "1/2", startTime: "08:30", endTime: "10:00", isAllowed: false },
      { name: "Break", startTime: "10:00", endTime: "10:05", isBreak: true, isAllowed: true },
      { name: "Passing", startTime: "10:05", endTime: "10:10", isPassing: true, isAllowed: true },
      { name: "3/4", startTime: "10:10", endTime: "11:40", isAllowed: false },
      { name: "Lunch 7-8", startTime: "11:40", endTime: "12:10", isLunch: true, isAllowed: true },
      { name: "Passing 7-8", startTime: "12:10", endTime: "12:15", isPassing: true, isAllowed: true },
      { name: "Pack Time 7-8", startTime: "12:15", endTime: "12:50", isPackTime: true, isAllowed: true },
      { name: "Passing 9-12", startTime: "11:40", endTime: "11:45", isPassing: true, isAllowed: true },
      { name: "Pack Time 9-12", startTime: "11:45", endTime: "12:20", isPackTime: true, isAllowed: true },
      { name: "Lunch 9-12", startTime: "12:20", endTime: "12:50", isLunch: true, isAllowed: true },
      { name: "Passing", startTime: "12:50", endTime: "12:55", isPassing: true, isAllowed: true },
      { name: "5/6", startTime: "12:55", endTime: "14:25", isAllowed: false },
      { name: "Passing", startTime: "14:25", endTime: "14:30", isPassing: true, isAllowed: true },
      { name: "ELT", startTime: "14:30", endTime: "15:20", isELT: true, isAllowed: true },
    ],
    allowedPeriods: ["Break", "Passing", "Lunch", "Pack Time", "ELT"],
    isActive: (currentTime: Date) => {
      const timeStr = currentTime.toTimeString().slice(0, 5);
      return timeStr >= "08:30" && timeStr <= "15:20";
    }
  },

  lateStart: {
    name: "Late Start Wednesday",
    periods: [
      { name: "1/2", startTime: "08:40", endTime: "10:10", isAllowed: false },
      { name: "Break", startTime: "10:10", endTime: "10:15", isBreak: true, isAllowed: true },
      { name: "Passing", startTime: "10:15", endTime: "10:20", isPassing: true, isAllowed: true },
      { name: "3/4", startTime: "10:20", endTime: "11:50", isAllowed: false },
      { name: "Lunch 7-8", startTime: "11:50", endTime: "12:20", isLunch: true, isAllowed: true },
      { name: "Passing 7-8", startTime: "12:20", endTime: "12:25", isPassing: true, isAllowed: true },
      { name: "Pack Time 7-8", startTime: "12:25", endTime: "13:00", isPackTime: true, isAllowed: true },
      { name: "Passing 9-12", startTime: "11:50", endTime: "11:55", isPassing: true, isAllowed: true },
      { name: "Pack Time 9-12", startTime: "11:55", endTime: "12:30", isPackTime: true, isAllowed: true },
      { name: "Lunch 9-12", startTime: "12:30", endTime: "13:00", isLunch: true, isAllowed: true },
      { name: "Passing", startTime: "13:00", endTime: "13:05", isPassing: true, isAllowed: true },
      { name: "5/6", startTime: "13:05", endTime: "14:35", isAllowed: false },
      { name: "Passing", startTime: "14:35", endTime: "14:40", isPassing: true, isAllowed: true },
      { name: "ELT", startTime: "14:40", endTime: "15:20", isELT: true, isAllowed: true },
    ],
    allowedPeriods: ["Break", "Passing", "Lunch", "Pack Time", "ELT"],
    isActive: (currentTime: Date) => {
      const timeStr = currentTime.toTimeString().slice(0, 5);
      return timeStr >= "08:40" && timeStr <= "15:20";
    }
  },

  minimum: {
    name: "Minimum Day",
    periods: [
      { name: "1", startTime: "08:30", endTime: "09:05", isAllowed: false },
      { name: "Passing", startTime: "09:05", endTime: "09:10", isPassing: true, isAllowed: true },
      { name: "3", startTime: "09:10", endTime: "09:45", isAllowed: false },
      { name: "Passing", startTime: "09:45", endTime: "09:50", isPassing: true, isAllowed: true },
      { name: "5", startTime: "09:50", endTime: "10:30", isAllowed: false },
      { name: "Break", startTime: "10:30", endTime: "10:35", isBreak: true, isAllowed: true },
      { name: "Passing", startTime: "10:35", endTime: "10:40", isPassing: true, isAllowed: true },
      { name: "2", startTime: "10:40", endTime: "11:15", isAllowed: false },
      { name: "Passing", startTime: "11:15", endTime: "11:20", isPassing: true, isAllowed: true },
      { name: "4", startTime: "11:20", endTime: "11:55", isAllowed: false },
      { name: "Passing", startTime: "11:55", endTime: "12:00", isPassing: true, isAllowed: true },
      { name: "6", startTime: "12:00", endTime: "12:35", isAllowed: false },
    ],
    allowedPeriods: ["Break", "Passing"],
    isActive: (currentTime: Date) => {
      const timeStr = currentTime.toTimeString().slice(0, 5);
      return timeStr >= "08:30" && timeStr <= "12:35";
    }
  }
};

// Helper function to parse time string to minutes since midnight
function timeToMinutes(timeStr: string): number {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
}

// Check if current time is during school hours
export function isDuringSchoolHours(currentTime: Date = new Date()): boolean {
  const dayOfWeek = currentTime.getDay(); // 0 = Sunday, 1 = Monday, etc.
  const timeStr = currentTime.toTimeString().slice(0, 5);

  // Only check school days (Monday-Friday)
  if (dayOfWeek === 0 || dayOfWeek === 6) {
    return false;
  }

  // Check Wednesday for Late Start
  if (dayOfWeek === 3) { // Wednesday
    return SCHOOL_SCHEDULES.lateStart.isActive(currentTime);
  }

  // For now, assume regular schedule for other days
  // TODO: Add logic to detect minimum days
  return SCHOOL_SCHEDULES.regular.isActive(currentTime);
}

// Check if current time allows app usage (only during allowed periods)
export function isAppUsageAllowed(currentTime: Date = new Date()): boolean {
  const dayOfWeek = currentTime.getDay();

  // TEMPORARY: For testing purposes, mark current time as NOT allowed
  // This will trigger the school warning so you can see it in action
  if (currentTime.getHours() === new Date().getHours() && currentTime.getMinutes() === new Date().getMinutes()) {
    console.log('🧪 TEST MODE: Current time marked as NOT ALLOWED for testing');
    return false;
  }

  if (!isDuringSchoolHours(currentTime)) {
    return true; // Allow usage outside school hours
  }

  let schedule: SchoolSchedule;

  if (dayOfWeek === 3) { // Wednesday
    schedule = SCHOOL_SCHEDULES.lateStart;
  } else {
    schedule = SCHOOL_SCHEDULES.regular;
  }

  const currentPeriod = getCurrentPeriod(currentTime);

  if (!currentPeriod) {
    return false; // If no period found, don't allow usage
  }

  return currentPeriod.isAllowed === true;
}

// Get current period information
export function getCurrentPeriod(currentTime: Date = new Date()): SchoolPeriod | null {
  if (!isDuringSchoolHours(currentTime)) {
    return null;
  }

  const dayOfWeek = currentTime.getDay();
  const currentMinutes = timeToMinutes(currentTime.toTimeString().slice(0, 5));

  let schedule: SchoolSchedule;

  if (dayOfWeek === 3) { // Wednesday
    schedule = SCHOOL_SCHEDULES.lateStart;
  } else {
    schedule = SCHOOL_SCHEDULES.regular;
  }

  for (const period of schedule.periods) {
    const startMinutes = timeToMinutes(period.startTime);
    const endMinutes = timeToMinutes(period.endTime);

    if (currentMinutes >= startMinutes && currentMinutes <= endMinutes) {
      return period;
    }
  }

  return null;
}

// Get school schedule warning message
export function getSchoolWarningMessage(): string {
  const currentTime = new Date();
  const currentPeriod = getCurrentPeriod(currentTime);

  if (!currentPeriod) {
    return "";
  }

  const timeUntilEnd = getTimeUntilSchoolEnds(currentTime);

  // If app usage is allowed during this period
  if (currentPeriod.isAllowed) {
    if (currentPeriod.isBreak) {
      return `✅ You're using the app during ${currentPeriod.name.toLowerCase()}. Enjoy your break!`;
    }

    if (currentPeriod.isLunch) {
      return `✅ You're using the app during ${currentPeriod.name.toLowerCase()}. Enjoy your lunch!`;
    }

    if (currentPeriod.isPackTime) {
      return `✅ You're using the app during ${currentPeriod.name.toLowerCase()}. Use this time wisely!`;
    }

    if (currentPeriod.isELT) {
      return `✅ You're using the app during ${currentPeriod.name}. Great use of ELT time!`;
    }

    if (currentPeriod.isPassing) {
      return `✅ You're using the app during ${currentPeriod.name.toLowerCase()}. Quick check!`;
    }

    return `✅ You're using the app during an allowed time. ${timeUntilEnd} remaining in the school day.`;
  }

  // If app usage is NOT allowed during this period
  return `❌ You're using the app during ${currentPeriod.name} (class time). Please focus on your studies!`;
}

// Get time until school ends
export function getTimeUntilSchoolEnds(currentTime: Date = new Date()): string {
  const dayOfWeek = currentTime.getDay();

  let endTime: string;

  if (dayOfWeek === 3) { // Wednesday
    endTime = "15:20";
  } else {
    endTime = "15:20"; // Updated to match the schedule
  }

  const [endHours, endMinutes] = endTime.split(':').map(Number);
  const endTotalMinutes = endHours * 60 + endMinutes;
  const currentTotalMinutes = currentTime.getHours() * 60 + currentTime.getMinutes();

  const remainingMinutes = endTotalMinutes - currentTotalMinutes;

  if (remainingMinutes <= 0) {
    return "School day has ended";
  }

  const hours = Math.floor(remainingMinutes / 60);
  const minutes = remainingMinutes % 60;

  if (hours === 0) {
    return `${minutes} minutes`;
  } else if (minutes === 0) {
    return `${hours} hour${hours > 1 ? 's' : ''}`;
  } else {
    return `${hours}h ${minutes}m`;
  }
}

// Check if it's currently school time and return appropriate warning
export function checkSchoolTimeWarning(): { showWarning: boolean; message: string } {
  const isSchoolTime = isDuringSchoolHours();
  const isAppAllowed = isAppUsageAllowed();

  if (!isSchoolTime) {
    return { showWarning: false, message: "" };
  }

  return {
    showWarning: true,
    message: getSchoolWarningMessage()
  };
}
