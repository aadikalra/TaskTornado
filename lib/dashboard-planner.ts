import {
  addDays,
  differenceInCalendarDays,
  endOfWeek,
  format,
  isSameDay,
  parseISO,
  startOfDay,
} from "date-fns";

export type PlannerFilter =
  | "today"
  | "tomorrow"
  | "week"
  | "all"
  | "overdue"
  | "tests";
export type PlannerItem = {
  id: string;
  kind: "homework" | "test";
  title: string;
  className: string;
  classColor: string;
  date: Date | null;
  pinned: boolean;
  priority: "low" | "medium" | "high";
};

export const plannerKey = (item: PlannerItem) => `${item.kind}:${item.id}`;

export function parsePlannerDate(
  value: string | null | undefined,
): Date | null {
  if (!value) return null;
  const date = parseISO(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function deadlineLabel(date: Date | null, today: Date): string {
  if (!date) return "No due date";
  const days = differenceInCalendarDays(date, today);
  if (days < 0) return `${Math.abs(days)}d overdue`;
  if (days === 0) return "Today";
  if (days === 1) return "Tomorrow";
  return format(date, "EEE, MMM d");
}

/** Deadline order stays chronological; stars only break equal-day ties. */
export function sortDeadlines(items: PlannerItem[]): PlannerItem[] {
  return [...items].sort((a, b) => {
    const dayOrder =
      (a.date ? startOfDay(a.date).getTime() : Infinity) -
      (b.date ? startOfDay(b.date).getTime() : Infinity);
    if (dayOrder && !Number.isNaN(dayOrder)) return dayOrder;
    if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
    const timeOrder =
      (a.date?.getTime() ?? Infinity) - (b.date?.getTime() ?? Infinity);
    return Number.isNaN(timeOrder) ? 0 : timeOrder;
  });
}

export function filterPlannerItems(
  items: PlannerItem[],
  filter: PlannerFilter,
  today: Date,
  selectedDay?: Date | null,
): PlannerItem[] {
  const dayStart = startOfDay(today);
  return items.filter((item) => {
    if (selectedDay)
      return Boolean(item.date && isSameDay(item.date, selectedDay));
    if (filter === "all") return true;
    if (!item.date) return false;
    if (filter === "tests")
      return (
        item.kind === "test" &&
        item.date >= dayStart &&
        item.date < addDays(dayStart, 8)
      );
    const overdue = item.date < dayStart;
    if (filter === "overdue") return overdue;
    if (filter === "today") return overdue || isSameDay(item.date, today);
    if (filter === "tomorrow") return isSameDay(item.date, addDays(today, 1));
    return (
      overdue ||
      (item.date >= dayStart &&
        item.date <= endOfWeek(today, { weekStartsOn: 1 }))
    );
  });
}

export function getFocusReason(item: PlannerItem, today: Date): string {
  if (!item.date)
    return item.pinned
      ? "You starred this assignment. A good place to make a little progress."
      : "No deadline set. Open it to decide when to work on it.";
  const days = differenceInCalendarDays(item.date, today);
  if (days < 0) return "This assignment is overdue. Start here to catch up.";
  if (item.kind === "test")
    return days === 0
      ? "Your test is today. Take a moment to review your topics."
      : `Your test is ${days === 1 ? "tomorrow" : `in ${days} days`}. Give yourself time to prepare.`;
  if (days === 0)
    return item.pinned
      ? "Due today, and starred by you. Give this one your attention."
      : "Due today. Finish this before moving on to later deadlines.";
  if (days === 1)
    return "Due tomorrow. Make tonight a little easier by starting here.";
  return item.pinned
    ? "You starred this assignment. Open it to make some progress."
    : "Your next assignment deadline. A little progress now goes a long way.";
}
