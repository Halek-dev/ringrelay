/** Local-time date helpers (no timezone shifting for YYYY-MM-DD keys). */

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];
const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const WEEKDAY_FULL = [
  "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday",
];

/** YYYY-MM-DD in local time. */
export function toISODate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function addDays(d: Date, n: number): Date {
  const copy = new Date(d);
  copy.setDate(copy.getDate() + n);
  return copy;
}

/** Monday as the first day of the week. */
export function startOfWeekMonday(d = new Date()): Date {
  const copy = new Date(d);
  copy.setHours(0, 0, 0, 0);
  const day = copy.getDay(); // 0=Sun..6=Sat
  const diff = day === 0 ? -6 : 1 - day;
  return addDays(copy, diff);
}

/** The 7 dates of the week containing `d`, Monday→Sunday. */
export function weekDates(d = new Date()): Date[] {
  const start = startOfWeekMonday(d);
  return Array.from({ length: 7 }, (_, i) => addDays(start, i));
}

export function weekdayIndex(d: Date): number {
  return d.getDay(); // 0=Sun..6=Sat, matches daily_tasks.day_of_week
}

export function weekdayAbbrev(d: Date): string {
  return WEEKDAYS[d.getDay()];
}

export function weekdayFull(d: Date): string {
  return WEEKDAY_FULL[d.getDay()];
}

/** "Jul 14" */
export function shortLabel(d: Date): string {
  return `${MONTHS[d.getMonth()]} ${d.getDate()}`;
}

export function isSameISODate(a: Date, b: Date): boolean {
  return toISODate(a) === toISODate(b);
}

/** "2h ago", "yesterday", "3d ago" from an ISO timestamp. */
export function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days === 1) return "yesterday";
  if (days < 7) return `${days}d ago`;
  return `${Math.floor(days / 7)}w ago`;
}
