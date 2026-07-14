import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { DailyTask, DailyTaskProgress, LeadStatus } from "@/lib/db-types";
import type { PlanDay, PlanTask, WeekSummary } from "@/lib/plan-types";
import {
  addDays,
  shortLabel,
  startOfWeekMonday,
  toISODate,
  weekDates,
  weekdayAbbrev,
  weekdayFull,
} from "@/lib/date";

export type { PlanDay, PlanTask, WeekSummary };
export { summarizePlan } from "@/lib/plan-types";

// A task applies to a given weekday if it's an every-day task (null) or matches.
function applies(task: DailyTask, weekday: number): boolean {
  return task.day_of_week === null || task.day_of_week === weekday;
}

async function fetchActiveTasks(
  supabase: ReturnType<typeof createClient>,
): Promise<DailyTask[]> {
  const { data, error } = await supabase
    .from("daily_tasks")
    .select("*")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? []) as DailyTask[];
}

/** The current week's plan for one user, Monday→Sunday, with their progress. */
export async function getWeekPlan(
  profileId: string,
  ref = new Date(),
): Promise<PlanDay[]> {
  const supabase = createClient();
  const dates = weekDates(ref);
  const tasks = await fetchActiveTasks(supabase);

  const { data: progressRows, error } = await supabase
    .from("daily_task_progress")
    .select("*")
    .eq("profile_id", profileId)
    .gte("date", toISODate(dates[0]))
    .lte("date", toISODate(dates[6]));
  if (error) throw new Error(error.message);

  const pmap = new Map<string, DailyTaskProgress>();
  (progressRows as DailyTaskProgress[] | null)?.forEach((p) =>
    pmap.set(`${p.task_id}|${p.date}`, p),
  );

  const todayISO = toISODate(new Date());

  return dates.map((d) => {
    const wd = d.getDay();
    const dISO = toISODate(d);
    const dayTasks: PlanTask[] = tasks
      .filter((t) => applies(t, wd))
      .map((t) => {
        const p = pmap.get(`${t.id}|${dISO}`);
        return {
          taskId: t.id,
          label: t.title,
          target: t.target_count,
          done: p?.completed_count ?? 0,
          isDone: p?.is_done ?? false,
        };
      });
    return {
      abbrev: weekdayAbbrev(d),
      label: weekdayFull(d),
      dateISO: dISO,
      dateShort: shortLabel(d),
      isToday: dISO === todayISO,
      tasks: dayTasks,
      complete: dayTasks.length > 0 && dayTasks.every((t) => t.isDone),
    };
  });
}

/** Today's plan day (for the dashboard). */
export async function getTodayPlan(profileId: string): Promise<PlanDay> {
  const week = await getWeekPlan(profileId);
  return week.find((d) => d.isToday) ?? week[0];
}

/**
 * Consecutive days (ending today or yesterday) where the user completed all of
 * that day's active tasks. Looks back up to 90 days.
 */
export async function getStreak(profileId: string): Promise<number> {
  const supabase = createClient();
  const tasks = await fetchActiveTasks(supabase);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const start = addDays(today, -90);

  const { data, error } = await supabase
    .from("daily_task_progress")
    .select("task_id,date,is_done")
    .eq("profile_id", profileId)
    .gte("date", toISODate(start))
    .lte("date", toISODate(today));
  if (error) throw new Error(error.message);

  const doneByDate = new Map<string, Set<string>>();
  (data as Pick<DailyTaskProgress, "task_id" | "date" | "is_done">[] | null)?.forEach(
    (r) => {
      if (!r.is_done) return;
      if (!doneByDate.has(r.date)) doneByDate.set(r.date, new Set());
      doneByDate.get(r.date)!.add(r.task_id);
    },
  );

  const isComplete = (d: Date): boolean => {
    const applicable = tasks.filter((t) => applies(t, d.getDay()));
    if (applicable.length === 0) return false;
    const done = doneByDate.get(toISODate(d)) ?? new Set<string>();
    return applicable.every((t) => done.has(t.id));
  };

  // The streak may end today (if done) or yesterday (today still in progress).
  let cursor = new Date(today);
  if (!isComplete(cursor)) cursor = addDays(cursor, -1);

  let streak = 0;
  for (let i = 0; i < 90; i++) {
    if (!isComplete(cursor)) break;
    streak += 1;
    cursor = addDays(cursor, -1);
  }
  return streak;
}

/** Pipeline stats for the current week's summary bar. */
export async function getWeekPipelineStats(
  ref = new Date(),
): Promise<{ demos: number; replies: number }> {
  const supabase = createClient();
  const startISO = toISODate(startOfWeekMonday(ref));

  const countByStatus = async (status: LeadStatus) => {
    const { count, error } = await supabase
      .from("leads")
      .select("id", { count: "exact", head: true })
      .eq("status", status)
      .gte("updated_at", startISO);
    if (error) throw new Error(error.message);
    return count ?? 0;
  };

  const [demos, replies] = await Promise.all([
    countByStatus("demo_booked"),
    countByStatus("replied"),
  ]);
  return { demos, replies };
}
