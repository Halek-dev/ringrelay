/**
 * Shared view types for the daily plan (safe to import in client components).
 *
 * The plan is HONEST: every counter here is derived from real rows in the
 * database (leads created, touches logged, leads moved forward). Nothing is
 * typed in by hand, so the numbers can only go up by doing the actual work.
 */

export type PlanMetricKey = "leads_added" | "touches" | "qualified";

export type PlanMetric = {
  key: PlanMetricKey;
  label: string;
  /** Plural noun for the count, e.g. "leads" / "touches". */
  unit: string;
  target: number;
  /** Where this work actually happens. */
  href: string;
  /** Button copy for the link. */
  cta: string;
  /** One line: exactly which rows this counter counts. */
  hint: string;
};

/**
 * The daily goals. This is the single source of truth for what a good day looks
 * like. Each metric maps to a real, countable action and links to the page
 * where you do it.
 */
export const DAILY_GOALS: PlanMetric[] = [
  {
    key: "leads_added",
    label: "Add new leads",
    unit: "leads",
    target: 5,
    href: "/admin/leads",
    cta: "Add a lead",
    hint: "Counts leads created today.",
  },
  {
    key: "touches",
    label: "Log outreach touches",
    unit: "touches",
    target: 10,
    href: "/admin/leads",
    cta: "Log a touch",
    hint: "Counts touches logged on a lead today.",
  },
  {
    key: "qualified",
    label: "Move leads forward",
    unit: "leads",
    target: 5,
    href: "/admin/leads",
    cta: "Open a lead",
    hint: "Counts leads whose status changed today.",
  },
];

export type PlanCounts = Record<PlanMetricKey, number>;

export type PlanDay = {
  abbrev: string;
  label: string;
  dateISO: string;
  dateShort: string;
  isToday: boolean;
  isFuture: boolean;
  counts: PlanCounts;
};

export type WeekTotals = {
  leadsAdded: number;
  touches: number;
  replies: number;
  demos: number;
  daysComplete: number;
};

export const emptyCounts = (): PlanCounts => ({
  leads_added: 0,
  touches: 0,
  qualified: 0,
});

/** A day is complete when every goal's derived count meets its target. */
export function isDayComplete(counts: PlanCounts): boolean {
  return DAILY_GOALS.every((g) => counts[g.key] >= g.target);
}

/** How many of the day's goals are met (0..3). */
export function goalsMet(counts: PlanCounts): number {
  return DAILY_GOALS.filter((g) => counts[g.key] >= g.target).length;
}
