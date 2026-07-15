import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { LeadStatus } from "@/lib/db-types";
import {
  DAILY_GOALS,
  emptyCounts,
  isDayComplete,
  type PlanCounts,
  type PlanDay,
  type PlanMetricKey,
  type WeekTotals,
} from "@/lib/plan-types";
import {
  addDays,
  shortLabel,
  startOfWeekMonday,
  toISODate,
  weekDates,
  weekdayAbbrev,
  weekdayFull,
} from "@/lib/date";

export type { PlanDay, WeekTotals };
export { DAILY_GOALS };

/** A lead counts as "moved forward" once its status leaves new / in_progress. */
const OPEN_STATUSES: LeadStatus[] = ["new", "in_progress"];
function isMovedForward(status: LeadStatus): boolean {
  return !OPEN_STATUSES.includes(status);
}

type DerivedBuckets = Map<string, PlanCounts>;

function bump(buckets: DerivedBuckets, dateISO: string, key: PlanMetricKey) {
  const c = buckets.get(dateISO) ?? emptyCounts();
  c[key] += 1;
  buckets.set(dateISO, c);
}

/**
 * Derive per-day counts for [since, now] from real rows: leads created, touches
 * logged, and leads whose status moved forward. Resilient to a missing
 * outreach_log table so the page still renders before migration 0004 is run.
 */
async function deriveBuckets(since: Date): Promise<DerivedBuckets> {
  const supabase = createClient();
  const sinceISO = new Date(since).toISOString();
  const buckets: DerivedBuckets = new Map();

  // Leads: created (leads_added) and last-changed (qualified) within the window.
  // updated_at >= created_at, so filtering on updated_at is a superset that also
  // captures every lead created in the window.
  const { data: leads, error: leadsErr } = await supabase
    .from("leads")
    .select("created_at,updated_at,status")
    .gte("updated_at", sinceISO);
  if (leadsErr) throw new Error(leadsErr.message);

  for (const l of leads ?? []) {
    const createdISO = toISODate(new Date(l.created_at as string));
    if (new Date(l.created_at as string) >= since) {
      bump(buckets, createdISO, "leads_added");
    }
    if (isMovedForward(l.status as LeadStatus)) {
      bump(buckets, toISODate(new Date(l.updated_at as string)), "qualified");
    }
  }

  // Touches: one row per logged outreach.
  const { data: touches } = await supabase
    .from("outreach_log")
    .select("sent_at")
    .gte("sent_at", sinceISO);
  for (const t of touches ?? []) {
    bump(buckets, toISODate(new Date(t.sent_at as string)), "touches");
  }

  return buckets;
}

/** The current week's derived plan, Monday to Sunday. */
export async function getWeekPlan(ref = new Date()): Promise<PlanDay[]> {
  const dates = weekDates(ref);
  const buckets = await deriveBuckets(dates[0]);
  const todayISO = toISODate(new Date());

  return dates.map((d) => {
    const dISO = toISODate(d);
    return {
      abbrev: weekdayAbbrev(d),
      label: weekdayFull(d),
      dateISO: dISO,
      dateShort: shortLabel(d),
      isToday: dISO === todayISO,
      isFuture: dISO > todayISO,
      counts: buckets.get(dISO) ?? emptyCounts(),
    };
  });
}

/** Today's derived plan day (for the dashboard). */
export async function getTodayPlan(): Promise<PlanDay> {
  const week = await getWeekPlan();
  return week.find((d) => d.isToday) ?? week[week.length - 1];
}

/** This week's roll-up: real touches, replies, demos, leads added, days done. */
export async function getWeekTotals(ref = new Date()): Promise<WeekTotals> {
  const supabase = createClient();
  const weekStart = startOfWeekMonday(ref);
  const weekStartISO = new Date(weekStart).toISOString();
  const week = await getWeekPlan(ref);

  let leadsAdded = 0;
  let touches = 0;
  for (const d of week) {
    if (d.isFuture) continue;
    leadsAdded += d.counts.leads_added;
    touches += d.counts.touches;
  }
  const daysComplete = week.filter(
    (d) => !d.isFuture && isDayComplete(d.counts),
  ).length;

  // Replies: derived from outreach_log.replied. Resilient to a missing table.
  const { count: repliesCount } = await supabase
    .from("outreach_log")
    .select("id", { count: "exact", head: true })
    .eq("replied", true)
    .gte("sent_at", weekStartISO);

  // Demos booked this week.
  const { count: demosCount, error: demosErr } = await supabase
    .from("leads")
    .select("id", { count: "exact", head: true })
    .eq("status", "demo_booked")
    .gte("updated_at", weekStartISO);
  if (demosErr) throw new Error(demosErr.message);

  return {
    leadsAdded,
    touches,
    replies: repliesCount ?? 0,
    demos: demosCount ?? 0,
    daysComplete,
  };
}

/**
 * Consecutive days (ending today or yesterday) where every daily goal was met,
 * derived from real activity. Looks back up to 60 days.
 */
export async function getStreak(): Promise<number> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const buckets = await deriveBuckets(addDays(today, -60));

  const complete = (d: Date): boolean =>
    isDayComplete(buckets.get(toISODate(d)) ?? emptyCounts());

  // The streak may end today (if already done) or yesterday (today in progress).
  let cursor = new Date(today);
  if (!complete(cursor)) cursor = addDays(cursor, -1);

  let streak = 0;
  for (let i = 0; i < 60; i++) {
    if (!complete(cursor)) break;
    streak += 1;
    cursor = addDays(cursor, -1);
  }
  return streak;
}
