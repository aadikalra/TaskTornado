import assert from "node:assert/strict";
import test from "node:test";
// @ts-expect-error Node's type-stripping runner needs the source extension.
// prettier-ignore
import { filterPlannerItems, parsePlannerDate, sortDeadlines } from "./dashboard-planner.ts";
import type { PlannerItem } from "./dashboard-planner";

const today = new Date(2026, 9, 12);
const item = (id: string, date: Date | null, pinned = false): PlannerItem => ({
  id,
  date,
  pinned,
  kind: "homework",
  title: id,
  className: "Biology",
  classColor: "#23846f",
  priority: "medium",
});

test("a future starred assignment cannot hide overdue or due-today work", () => {
  const items = [
    item("starred", new Date(2026, 9, 20), true),
    item("today", today),
    item("overdue", new Date(2026, 9, 10)),
    item("undated", null),
  ];
  assert.deepEqual(
    sortDeadlines(items).map((value) => value.id),
    ["overdue", "today", "starred", "undated"],
  );
});

test("date-only deadlines stay on their local calendar day", () => {
  const date = parsePlannerDate("2026-10-12")!;
  assert.equal(date.getDate(), 12);
  assert.equal(date.getMonth(), 9);
  assert.equal(date.getHours(), 0);
  assert.equal(parsePlannerDate(""), null);
  assert.equal(parsePlannerDate("invalid"), null);
});

test("today includes overdue work; tomorrow and day selections use exact dates", () => {
  const items = [
    item("late", new Date(2026, 9, 11)),
    item("today", today),
    item("tomorrow", new Date(2026, 9, 13)),
    item("sunday", new Date(2026, 9, 18, 23)),
    item("next-week", new Date(2026, 9, 19)),
    item("undated", null),
  ];
  assert.deepEqual(
    filterPlannerItems(items, "today", today).map((value) => value.id),
    ["late", "today"],
  );
  assert.deepEqual(
    filterPlannerItems(items, "tomorrow", today).map((value) => value.id),
    ["tomorrow"],
  );
  assert.deepEqual(
    filterPlannerItems(items, "week", today).map((value) => value.id),
    ["late", "today", "tomorrow", "sunday"],
  );
  assert.deepEqual(
    filterPlannerItems(items, "today", today, new Date(2026, 9, 13)).map(
      (value) => value.id,
    ),
    ["tomorrow"],
  );
  assert.equal(filterPlannerItems(items, "all", today).length, 6);
});
