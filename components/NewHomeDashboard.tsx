"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  addDays,
  addWeeks,
  format,
  isSameDay,
  startOfDay,
  startOfWeek,
} from "date-fns";
import {
  ArrowDown,
  ArrowRight,
  Check,
  ChevronLeft,
  ChevronRight,
  CircleCheck,
  Clock3,
  Loader2,
  Plus,
  Search,
  Star,
  X,
} from "lucide-react";

import { HugeIcon } from "@/lib/huge-icon-map";
import { schoolYear2026_2027 } from "@/data/schoolEvents";
import { useAuth } from "@/context/AuthContext";
import { useClassContext } from "@/context/ClassContext";
import { useHomeworkContext } from "@/context/HomeworkContext";
import { MainAppProvider, useMainApp } from "@/context/MainAppContext";
import { useTestContext, type Test } from "@/context/TestContext";
import { useToast } from "@/context/ToastContext";
import { AddHomeworkModal } from "@/components/main-app/AddHomeworkModal";
import { AddClassModal } from "@/components/main-app/AddClassModal";
import { DeleteConfirmModal } from "@/components/main-app/DeleteConfirmModal";
import { AddTestModal } from "@/components/AddTestModal";
import { TestDetailModal } from "@/components/TestDetailModal";
import NewHomeClassesSection from "@/components/NewHomeClassesSection";
import NewHomeGreeting from "@/components/NewHomeGreeting";
import { triggerCompletionConfetti } from "@/lib/confetti";
import {
  deadlineLabel,
  filterPlannerItems,
  getFocusReason,
  parsePlannerDate,
  plannerKey,
  sortDeadlines,
  type PlannerFilter,
  type PlannerItem,
} from "@/lib/dashboard-planner";
import styles from "./NewHomeDashboard.module.css";

const FILTERS: { id: PlannerFilter; label: string }[] = [
  { id: "today", label: "Today" },
  { id: "tomorrow", label: "Tomorrow" },
  { id: "week", label: "This week" },
  { id: "all", label: "All work" },
];

function Cat({ night }: { night: boolean }) {
  return (
    <div className={styles.cat}>
      <Image
        src={night ? "/cuteCatSleeping.svg" : "/cuteCat.svg"}
        alt={night ? "Your cat is resting" : "Your study companion"}
        width={90}
        height={80}
        priority
      />
    </div>
  );
}

function TaskRow({
  item,
  today,
  busy,
  onComplete,
  onOpenTest,
}: {
  item: PlannerItem;
  today: Date;
  busy: boolean;
  onComplete: (item: PlannerItem) => void;
  onOpenTest: (id: string) => void;
}) {
  const overdue = Boolean(item.date && item.date < today);
  const dueToday = Boolean(item.date && isSameDay(item.date, today));
  const content = (
    <>
      <span className={styles.taskTitle}>
        {item.title}
        {item.pinned && (
          <Star size={13} className={styles.star} aria-label="Starred" />
        )}
      </span>
      <span className={styles.taskMeta}>
        <span
          className={styles.classDot}
          style={{ background: item.classColor }}
        />
        {item.className}
        <span aria-hidden="true">·</span>
        {item.kind === "test" ? "Test" : "Homework"}
      </span>
    </>
  );
  return (
    <div className={styles.taskRow}>
      {item.kind === "homework" ? (
        <button
          type="button"
          className={styles.checkbox}
          aria-label={`Mark ${item.title} complete`}
          disabled={busy}
          onClick={() => onComplete(item)}
        >
          {busy ? (
            <Loader2 size={16} className={styles.spinner} />
          ) : (
            <Check size={16} />
          )}
        </button>
      ) : (
        <span className={styles.testIcon}>
          <HugeIcon name="Quiz04" size={20} />
        </span>
      )}
      {item.kind === "homework" ? (
        <Link className={styles.taskMain} href={`/homework/${item.id}`}>
          {content}
        </Link>
      ) : (
        <button
          type="button"
          className={styles.taskMain}
          onClick={() => onOpenTest(item.id)}
        >
          {content}
        </button>
      )}
      <span
        className={`${styles.dueLabel} ${overdue ? styles.lateLabel : dueToday ? styles.todayLabel : ""}`}
      >
        {deadlineLabel(item.date, today)}
      </span>
      {item.kind === "homework" ? (
        <Link
          className={styles.rowArrow}
          href={`/homework/${item.id}`}
          aria-label={`Open ${item.title}`}
        >
          <ArrowRight size={16} />
        </Link>
      ) : (
        <button
          type="button"
          className={styles.rowArrow}
          onClick={() => onOpenTest(item.id)}
          aria-label={`Review ${item.title}`}
        >
          <ArrowRight size={16} />
        </button>
      )}
    </div>
  );
}

function NewHomeDashboardContent() {
  const { user, loading: authLoading } = useAuth();
  const {
    classes,
    loading: classesLoading,
    error: classesError,
  } = useClassContext();
  const {
    homeworks,
    loading: homeworkLoading,
    error: homeworkError,
    toggleHomework,
  } = useHomeworkContext();
  const { tests, loading: testsLoading, error: testsError } = useTestContext();
  const { success, error: showError } = useToast();
  const {
    setShowAddHomework,
    setClassIdForAddHomework,
    setShowAddClass,
    showAddTest,
    setShowAddTest,
    classIdForAddTest,
    setClassIdForAddTest,
    selectedTest,
    setSelectedTest,
    isTestDetailModalOpen,
    setIsTestDetailModalOpen,
  } = useMainApp();
  const { deleteTest } = useTestContext();
  const [now, setNow] = useState(new Date());
  const [filter, setFilter] = useState<PlannerFilter>("today");
  const [search, setSearch] = useState("");
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [weekOffset, setWeekOffset] = useState(0);
  const [showAll, setShowAll] = useState(false);
  const [focusOffset, setFocusOffset] = useState(0);
  const [pendingIds, setPendingIds] = useState<Set<string>>(new Set());
  const [isClassesExpanded, setIsClassesExpanded] = useState(false);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 60_000);
    try {
      setIsClassesExpanded(
        localStorage.getItem("tasktornado_classes_view_expanded") === "true",
      );
    } catch {
      /* Storage is optional. */
    }
    return () => window.clearInterval(timer);
  }, []);

  const today = useMemo(() => startOfDay(now), [now]);
  const tomorrow = addDays(today, 1);
  const weekStart = startOfWeek(addWeeks(today, weekOffset), {
    weekStartsOn: 1,
  });
  const weekDays = Array.from({ length: 7 }, (_, index) =>
    addDays(weekStart, index),
  );
  const isNight = now.getHours() >= 20 || now.getHours() < 6;
  const loading =
    authLoading ||
    Boolean(user && (classesLoading || homeworkLoading || testsLoading));
  const dataError = homeworkError || testsError || classesError;
  const items = useMemo(() => {
    const getClass = (id: string) => {
      const found = classes.find((item) => item.id === id);
      return {
        className: found?.name || "General",
        classColor: found?.color || "#598bb5",
      };
    };
    return sortDeadlines([
      ...homeworks
        .filter(
          (item) =>
            !item.completed &&
            (item.is_recurring_instance === true || item.recurring_id == null),
        )
        .map((item) => ({
          id: item.id,
          kind: "homework" as const,
          title: item.title,
          ...getClass(item.classId),
          date: parsePlannerDate(item.dueDate),
          pinned: item.pinned,
          priority: item.priority,
        })),
      ...tests
        .filter(
          (item) => !["taken", "completed", "cancelled"].includes(item.status),
        )
        .flatMap((item) => {
          const date = parsePlannerDate(item.testDate);
          // Past tests need status updates in Tests; they aren't overdue homework.
          return date && date >= today
            ? [
                {
                  id: item.id,
                  kind: "test" as const,
                  title: item.title,
                  ...getClass(item.classId),
                  date,
                  pinned: false,
                  priority: item.priority,
                },
              ]
            : [];
        }),
    ]);
  }, [homeworks, tests, classes, today]);

  const overdueItems = items.filter(
    (item) => item.kind === "homework" && item.date && item.date < today,
  );
  const dueTodayItems = items.filter(
    (item) => item.date && isSameDay(item.date, today),
  );
  const tomorrowItems = items.filter(
    (item) => item.date && isSameDay(item.date, tomorrow),
  );
  const testsThisWeek = filterPlannerItems(items, "tests", today);
  const todayHomework = homeworks.filter((item) => {
    const date = parsePlannerDate(item.dueDate);
    return (
      date &&
      isSameDay(date, today) &&
      (item.is_recurring_instance === true || item.recurring_id == null)
    );
  });
  const todayDone = todayHomework.filter((item) => item.completed).length;
  const todayTotal = todayHomework.length;
  const progress = todayTotal ? Math.round((todayDone / todayTotal) * 100) : 0;
  const filteredItems = filterPlannerItems(
    items,
    filter,
    today,
    selectedDay,
  ).filter((item) => {
    const query = search.trim().toLowerCase();
    return (
      !query ||
      `${item.title} ${item.className} ${item.kind}`
        .toLowerCase()
        .includes(query)
    );
  });
  const visibleItems = showAll ? filteredItems : filteredItems.slice(0, 6);
  const focusItem = items.length ? items[focusOffset % items.length] : null;
  const upcomingEvents = schoolYear2026_2027
    .filter(
      (event) =>
        startOfDay(event.endDate || event.startDate) >= today &&
        startOfDay(event.startDate) <= addDays(today, 30),
    )
    .sort((a, b) => a.startDate.getTime() - b.startDate.getTime())
    .slice(0, 3);
  const title = selectedDay
    ? format(selectedDay, "EEEE, MMM d")
    : filter === "today"
      ? "Your work for today"
      : filter === "tomorrow"
        ? "A head start on tomorrow"
        : filter === "week"
          ? "Your work this week"
          : filter === "overdue"
            ? "Let’s catch up"
            : filter === "tests"
              ? "Tests in the next 7 days"
              : "All your work";
  const sectionNote = selectedDay
    ? "Deadlines for your selected day."
    : filter === "today"
      ? "A little focus. One thing at a time."
      : filter === "tomorrow"
        ? "Make tomorrow feel a little lighter."
        : filter === "overdue"
          ? "Start with one. Every step counts."
          : "Homework and tests, in deadline order.";

  function changeFilter(next: PlannerFilter) {
    setFilter(next);
    setSelectedDay(null);
    setShowAll(false);
  }
  function openTest(id: string) {
    const test = tests.find((item) => item.id === id);
    if (test) {
      setSelectedTest(test);
      setIsTestDetailModalOpen(true);
    }
  }
  function addHomework(classId?: string) {
    setClassIdForAddHomework(classId);
    setShowAddHomework(true);
  }
  function addTest() {
    setClassIdForAddTest(undefined);
    setShowAddTest(true);
  }
  function toggleClasses() {
    setIsClassesExpanded((previous) => {
      const next = !previous;
      try {
        localStorage.setItem("tasktornado_classes_view_expanded", String(next));
      } catch {
        /* Storage is optional. */
      }
      return next;
    });
  }
  async function completeHomework(item: PlannerItem) {
    if (pendingIds.has(item.id)) return;
    setPendingIds((previous) => new Set(previous).add(item.id));
    try {
      await toggleHomework(item.id);
      triggerCompletionConfetti(item.classColor);
      setFocusOffset(0);
      success("One less thing on your list", `${item.title} completed.`);
    } catch {
      showError(
        "Couldn’t save that change",
        "Your assignment is still on the list. Please try again.",
      );
    } finally {
      setPendingIds((previous) => {
        const next = new Set(previous);
        next.delete(item.id);
        return next;
      });
    }
  }

  return (
    <div className={styles.dashboard}>
      <div className={styles.canvas}>
        <header className={styles.header}>
          <div className={styles.greetingBlock}>
            <p className={styles.eyebrow}>{format(today, "EEEE, MMMM d")}</p>
            <h1 className={styles.greeting}>
              <NewHomeGreeting />
            </h1>
            <p className={styles.headerNote}>
              {loading
                ? "Getting your day ready…"
                : overdueItems.length
                  ? "Start with overdue work, then check today’s deadlines."
                  : dueTodayItems.length
                    ? "Your homework and tests, in one place."
                    : "Nothing due today. Check tomorrow or plan ahead."}
            </p>
          </div>
          <div className={styles.headerRight}>
            <Cat night={isNight} />
            <div className={styles.captureActions}>
              <button
                type="button"
                className={styles.primaryButton}
                onClick={() =>
                  classes.length ? addHomework() : setShowAddClass(true)
                }
              >
                <Plus size={17} />
                {classes.length ? "Add homework" : "Add your first class"}
              </button>
              {classes.length > 0 && (
                <button
                  type="button"
                  className={styles.secondaryButton}
                  onClick={addTest}
                >
                  <Plus size={15} />
                  Add test
                </button>
              )}
            </div>
          </div>
        </header>

        {dataError && (
          <div className={styles.errorBanner} role="alert">
            <span>
              Some school data couldn’t load. Your overview may be incomplete.
            </span>
            <button type="button" onClick={() => window.location.reload()}>
              Try again
            </button>
          </div>
        )}

        <div className={styles.daySummary} aria-label="Your day at a glance">
          <button
            type="button"
            onClick={() => {
              changeFilter("overdue");
              setSearch("");
            }}
            className={`${styles.summaryItem} ${overdueItems.length ? styles.urgentSummary : ""}`}
            aria-pressed={filter === "overdue" && !selectedDay}
          >
            <span className={styles.summaryNumber}>
              {loading ? "—" : overdueItems.length}
            </span>
            <span>
              Overdue
              <span className={styles.summaryDetail}>A little catching up</span>
            </span>
            {overdueItems.length > 0 && <ArrowRight size={15} />}
          </button>
          <button
            type="button"
            onClick={() => {
              changeFilter("today");
              setSearch("");
            }}
            className={styles.summaryItem}
            aria-pressed={filter === "today" && !selectedDay}
          >
            <span className={styles.summaryNumber}>
              {loading ? "—" : dueTodayItems.length}
            </span>
            <span>
              Due today
              <span className={styles.summaryDetail}>Homework & tests</span>
            </span>
          </button>
          <button
            type="button"
            onClick={() => {
              changeFilter("tomorrow");
              setSearch("");
            }}
            className={styles.summaryItem}
            aria-pressed={filter === "tomorrow" && !selectedDay}
          >
            <span className={styles.summaryNumber}>
              {loading ? "—" : tomorrowItems.length}
            </span>
            <span>
              Tomorrow
              <span className={styles.summaryDetail}>
                A chance to get ahead
              </span>
            </span>
          </button>
          <button
            type="button"
            className={styles.summaryItem}
            onClick={() => {
              changeFilter("tests");
              setSearch("");
            }}
          >
            <span className={styles.summaryNumber}>
              {loading ? "—" : testsThisWeek.length}
            </span>
            <span>
              Tests ahead
              <span className={styles.summaryDetail}>Next 7 days</span>
            </span>
          </button>
        </div>

        <div className={styles.mainGrid}>
          <section className={styles.workPanel} aria-labelledby="work-title">
            <div className={styles.panelHeader}>
              <div>
                <h2 id="work-title">{title}</h2>
                <p className={styles.panelNote}>{sectionNote}</p>
              </div>
              <span className={styles.workCount}>
                {loading ? "—" : filteredItems.length}{" "}
                {filteredItems.length === 1 ? "item" : "items"}
              </span>
            </div>
            <div className={styles.workToolbar}>
              <div
                className={styles.filters}
                aria-label="Filter work by deadline"
              >
                {FILTERS.map((option) => (
                  <button
                    type="button"
                    key={option.id}
                    onClick={() => changeFilter(option.id)}
                    aria-pressed={filter === option.id && !selectedDay}
                    className={
                      filter === option.id && !selectedDay
                        ? styles.activeFilter
                        : ""
                    }
                  >
                    {option.label}
                  </button>
                ))}
              </div>
              <label className={styles.search}>
                <Search size={15} />
                <input
                  aria-label="Search homework and tests"
                  placeholder="Find something…"
                  value={search}
                  onChange={(event) => {
                    setSearch(event.target.value);
                    setShowAll(false);
                  }}
                />
                {search && (
                  <button
                    type="button"
                    aria-label="Clear search"
                    onClick={() => setSearch("")}
                  >
                    <X size={13} />
                  </button>
                )}
              </label>
            </div>
            {selectedDay && (
              <div className={styles.selectionNote}>
                Showing {format(selectedDay, "EEEE, MMM d")}
                <button type="button" onClick={() => setSelectedDay(null)}>
                  Clear day <X size={12} />
                </button>
              </div>
            )}
            <div
              className={styles.taskList}
              aria-live="polite"
              aria-busy={loading}
            >
              {loading ? (
                <div className={styles.loadingState}>
                  <Loader2 className={styles.spinner} size={24} />
                  <p>Gathering your homework and tests…</p>
                </div>
              ) : visibleItems.length ? (
                visibleItems.map((item, index) => (
                  <div key={plannerKey(item)}>
                    {item.date &&
                      item.date < today &&
                      (index === 0 ||
                        !(visibleItems[index - 1].date! < today)) && (
                        <p className={styles.listGroupLabel}>Overdue</p>
                      )}
                    {!(item.date && item.date < today) &&
                      index > 0 &&
                      visibleItems[index - 1].date &&
                      visibleItems[index - 1].date! < today && (
                        <p className={styles.listGroupLabel}>Coming up</p>
                      )}
                    <TaskRow
                      item={item}
                      today={today}
                      busy={pendingIds.has(item.id)}
                      onComplete={completeHomework}
                      onOpenTest={openTest}
                    />
                  </div>
                ))
              ) : (
                <div className={styles.emptyState}>
                  <span className={styles.emptyIcon}>
                    {search ? <Search size={25} /> : <CircleCheck size={28} />}
                  </span>
                  <h3>
                    {search
                      ? "No matching work"
                      : !classes.length
                        ? "A little setup. A much calmer week."
                        : filter === "today" && !selectedDay
                          ? "You’re clear for today."
                          : "A little breathing room."}
                  </h3>
                  <p>
                    {search
                      ? "Try another title or class, or search All work."
                      : !classes.length
                        ? "Add your classes, then bring your homework and tests into one place."
                        : filter === "today" && !selectedDay
                          ? "Nothing overdue or due today. Take a break, or get a head start on tomorrow."
                          : "No deadlines in this view. Check your other days or add something new."}
                  </p>
                  <button
                    type="button"
                    className={styles.emptyAction}
                    onClick={() =>
                      search
                        ? (setSearch(""), changeFilter("all"))
                        : !classes.length
                          ? setShowAddClass(true)
                          : filter === "today" && !selectedDay
                            ? changeFilter("tomorrow")
                            : addHomework()
                    }
                  >
                    {search
                      ? "Search all work"
                      : !classes.length
                        ? "Add your first class"
                        : filter === "today" && !selectedDay
                          ? "Look at tomorrow"
                          : "Add homework"}
                    <ArrowRight size={15} />
                  </button>
                </div>
              )}
            </div>
            <div className={styles.workFooter}>
              <span>
                <span className={styles.classDot} />
                {loading
                  ? "Loading your planner"
                  : `${items.length} active ${items.length === 1 ? "item" : "items"} in your planner`}
              </span>
              {filteredItems.length > 6 && (
                <button
                  type="button"
                  onClick={() => setShowAll((value) => !value)}
                >
                  {showAll ? "Show less" : `View all ${filteredItems.length}`}
                  <ArrowDown
                    size={14}
                    className={showAll ? styles.rotateArrow : ""}
                  />
                </button>
              )}
              {filter !== "all" && filteredItems.length <= 6 && (
                <button
                  type="button"
                  onClick={() => {
                    changeFilter("all");
                    setSearch("");
                  }}
                >
                  All work
                  <ArrowRight size={14} />
                </button>
              )}
            </div>
          </section>

          <aside className={styles.focusColumn}>
            <section className={styles.focusCard} aria-labelledby="focus-title">
              <h2 id="focus-title">
                {loading
                  ? "Getting ready…"
                  : focusItem
                    ? "Start here"
                    : "Plan your next step"}
              </h2>
              <p className={styles.focusIntro}>
                {loading
                  ? "Your next step will be here in a moment."
                  : focusItem
                    ? getFocusReason(focusItem, today)
                    : "Add a little structure to your week. Your next step will find a home here."}
              </p>
              {!loading && focusItem && (
                <div className={styles.focusTask}>
                  <p>
                    <span className={styles.focusTag}>
                      {focusItem.kind === "homework" ? "Homework" : "Test"}
                    </span>
                    <span>{deadlineLabel(focusItem.date, today)}</span>
                  </p>
                  <h3>{focusItem.title}</h3>
                  <span className={styles.focusClass}>
                    <span
                      className={styles.classDot}
                      style={{ background: focusItem.classColor }}
                    />
                    {focusItem.className}
                    {focusItem.pinned && (
                      <Star size={12} className={styles.star} />
                    )}
                  </span>
                </div>
              )}
              {!loading && (
                <div className={styles.focusActions}>
                  {focusItem ? (
                    focusItem.kind === "homework" ? (
                      <Link
                        className={styles.focusButton}
                        href={`/homework/${focusItem.id}`}
                      >
                        Open assignment
                        <ArrowRight size={17} />
                      </Link>
                    ) : (
                      <button
                        type="button"
                        className={styles.focusButton}
                        onClick={() => openTest(focusItem.id)}
                      >
                        Review test topics
                        <ArrowRight size={17} />
                      </button>
                    )
                  ) : (
                    <button
                      type="button"
                      className={styles.focusButton}
                      onClick={() =>
                        classes.length ? addHomework() : setShowAddClass(true)
                      }
                    >
                      {classes.length ? "Add homework" : "Add a class"}
                      <Plus size={16} />
                    </button>
                  )}
                  {items.length > 1 && (
                    <button
                      type="button"
                      className={styles.anotherTask}
                      onClick={() => setFocusOffset((value) => value + 1)}
                    >
                      Choose another
                    </button>
                  )}
                </div>
              )}
            </section>
            <section
              className={styles.progressCard}
              aria-labelledby="progress-title"
            >
              <div className={styles.progressIcon}>
                <CircleCheck size={21} />
              </div>
              <div className={styles.progressBody}>
                <h2 id="progress-title">
                  {loading
                    ? "Your daily progress"
                    : todayTotal && todayDone === todayTotal
                      ? "Today’s homework, done."
                      : "A little progress adds up."}
                </h2>
                <p>
                  {loading
                    ? "Checking today’s assignments…"
                    : todayTotal
                      ? `${todayDone} of ${todayTotal} assignments due today finished`
                      : "No homework due today. Enjoy the extra space."}
                </p>
                {todayTotal > 0 && !loading && (
                  <div
                    className={styles.progressTrack}
                    role="progressbar"
                    aria-label="Homework due today completed"
                    aria-valuenow={todayDone}
                    aria-valuemin={0}
                    aria-valuemax={todayTotal}
                  >
                    <span style={{ width: `${progress}%` }} />
                  </div>
                )}
              </div>
            </section>
          </aside>
        </div>

        <section className={styles.weekPanel} aria-labelledby="week-title">
          <div className={styles.weekHeader}>
            <div>
              <h2 id="week-title">Your week at a glance</h2>
            </div>
            <div className={styles.weekControls}>
              <span>
                {format(weekStart, "MMM d")} –{" "}
                {format(addDays(weekStart, 6), "MMM d")}
              </span>
              <button
                type="button"
                onClick={() => {
                  setWeekOffset((value) => value - 1);
                  setSelectedDay(null);
                }}
                aria-label="Previous week"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                type="button"
                onClick={() => setWeekOffset(0)}
                disabled={weekOffset === 0}
              >
                This week
              </button>
              <button
                type="button"
                onClick={() => {
                  setWeekOffset((value) => value + 1);
                  setSelectedDay(null);
                }}
                aria-label="Next week"
              >
                <ChevronRight size={16} />
              </button>
              <Link href="/calendar" aria-label="Open full calendar">
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
          <div className={styles.weekGrid}>
            {weekDays.map((day) => {
              const dayItems = items.filter(
                (item) => item.date && isSameDay(item.date, day),
              );
              const homeworkCount = dayItems.filter(
                (item) => item.kind === "homework",
              ).length;
              const testCount = dayItems.length - homeworkCount;
              const dayEvents = schoolYear2026_2027.filter(
                (event) =>
                  startOfDay(event.startDate) <= day &&
                  startOfDay(event.endDate || event.startDate) >= day,
              );
              const selected = selectedDay && isSameDay(day, selectedDay);
              return (
                <button
                  type="button"
                  key={format(day, "yyyy-MM-dd")}
                  className={`${styles.weekDay} ${isSameDay(day, today) ? styles.currentDay : ""} ${selected ? styles.selectedDay : ""}`}
                  aria-pressed={Boolean(selected)}
                  aria-label={`${format(day, "EEEE, MMMM d")}: ${loading ? "loading" : `${homeworkCount} homework, ${testCount} tests`}${dayEvents.length ? `, ${dayEvents.map((event) => event.title).join(", ")}` : ""}`}
                  onClick={() => {
                    setSelectedDay(day);
                    setSearch("");
                    setShowAll(false);
                  }}
                >
                  <span className={styles.dayName}>
                    {format(day, "EEE")}
                    {isSameDay(day, today) && (
                      <span className={styles.todayDot} />
                    )}
                  </span>
                  <span className={styles.dayNumber}>{format(day, "d")}</span>
                  <span className={styles.dayWork}>
                    {loading ? (
                      "—"
                    ) : dayItems.length ? (
                      <>
                        <span>
                          {homeworkCount > 0 ? `${homeworkCount} homework` : ""}
                        </span>
                        {testCount > 0 && (
                          <span className={styles.dayTest}>
                            {testCount} {testCount === 1 ? "test" : "tests"}
                          </span>
                        )}
                      </>
                    ) : (
                      <span className={styles.noDeadlines}>No deadlines</span>
                    )}
                  </span>
                  {dayEvents.length > 0 && (
                    <span
                      className={styles.dayEvent}
                      title={dayEvents.map((event) => event.title).join(", ")}
                    >
                      {dayEvents[0].title}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
          <p className={styles.weekHint}>
            <span>
              <span className={styles.classDot} />
              Homework
              <span className={`${styles.classDot} ${styles.testDot}`} />
              Tests
            </span>
            <span>Pick a day to see its work above.</span>
          </p>
        </section>

        <div
          className={`${styles.lowerGrid} ${isClassesExpanded ? styles.expandedClasses : ""}`}
        >
          <div className={styles.classesArea}>
            <NewHomeClassesSection
              isExpandedView={isClassesExpanded}
              onToggleExpandView={toggleClasses}
              loading={classesLoading || homeworkLoading}
              user={Boolean(user)}
              onAddHomework={addHomework}
              onAddClass={() => setShowAddClass(true)}
            />
          </div>
          <div className={styles.secondaryColumn}>
            <section
              className={styles.testsPanel}
              aria-labelledby="tests-title"
            >
              <div className={styles.smallPanelHeader}>
                <div>
                  <h2 id="tests-title">Upcoming tests</h2>
                </div>
                <button
                  type="button"
                  className={styles.iconButton}
                  onClick={() =>
                    classes.length ? addTest() : setShowAddClass(true)
                  }
                  aria-label={
                    classes.length
                      ? "Add test"
                      : "Add a class to start tracking tests"
                  }
                >
                  <Plus size={17} />
                </button>
              </div>
              {loading ? (
                <p className={styles.secondaryEmpty}>Loading your tests…</p>
              ) : items.filter((item) => item.kind === "test").length ? (
                items
                  .filter((item) => item.kind === "test")
                  .slice(0, 3)
                  .map((item) => (
                    <button
                      type="button"
                      key={item.id}
                      onClick={() => openTest(item.id)}
                      className={styles.studyRow}
                    >
                      <span className={styles.studyDate}>
                        {item.date ? (
                          <>
                            <strong>{format(item.date, "d")}</strong>
                            {format(item.date, "MMM")}
                          </>
                        ) : (
                          <Clock3 size={18} />
                        )}
                      </span>
                      <span className={styles.studyInfo}>
                        <strong>{item.title}</strong>
                        <span>
                          {item.className} · {deadlineLabel(item.date, today)}
                        </span>
                      </span>
                      <ArrowRight size={15} />
                    </button>
                  ))
              ) : (
                <p className={styles.secondaryEmpty}>
                  No upcoming tests. Add one when you’re ready to plan ahead.
                </p>
              )}
              <Link href="/tests" className={styles.textLink}>
                View all tests
                <ArrowRight size={14} />
              </Link>
            </section>
            <section
              className={styles.eventsPanel}
              aria-labelledby="events-title"
            >
              <div className={styles.smallPanelHeader}>
                <h2 id="events-title">Around school</h2>
                <Link
                  href="/calendar"
                  className={styles.iconButton}
                  aria-label="Open school calendar"
                >
                  <ArrowRight size={16} />
                </Link>
              </div>
              {upcomingEvents.length ? (
                upcomingEvents.map((event) => (
                  <Link
                    key={event.id}
                    href="/calendar"
                    className={styles.eventRow}
                  >
                    <span className={styles.eventDot} />
                    <span>
                      <strong>{event.title}</strong>
                      <span>
                        {event.startDate < today
                          ? "In progress"
                          : format(event.startDate, "EEE, MMM d")}
                        {event.endDate
                          ? ` – ${format(event.endDate, "MMM d")}`
                          : ""}
                      </span>
                    </span>
                  </Link>
                ))
              ) : (
                <p className={styles.secondaryEmpty}>
                  No school events in the next 30 days.
                </p>
              )}
            </section>
          </div>
        </div>
      </div>
      <AddTestModal
        isOpen={showAddTest}
        onClose={() => {
          setShowAddTest(false);
          setClassIdForAddTest(undefined);
        }}
        defaultClassId={classIdForAddTest}
      />
      {selectedTest && (
        <TestDetailModal
          test={selectedTest as Test}
          isOpen={isTestDetailModalOpen}
          onClose={() => {
            setIsTestDetailModalOpen(false);
            setSelectedTest(null);
          }}
          onDelete={deleteTest}
        />
      )}
    </div>
  );
}

export default function NewHomeDashboard() {
  return (
    <MainAppProvider>
      <NewHomeDashboardContent />
      <AddClassModal />
      <AddHomeworkModal />
      <DeleteConfirmModal />
    </MainAppProvider>
  );
}
