/** Shared view types for the daily plan (safe to import in client components). */

export type PlanTask = {
  taskId: string;
  label: string;
  target: number;
  done: number;
  isDone: boolean;
};

export type PlanDay = {
  abbrev: string;
  label: string;
  dateISO: string;
  dateShort: string;
  isToday: boolean;
  tasks: PlanTask[];
  complete: boolean;
};

export type WeekSummary = {
  touches: number;
  touchesTarget: number;
  tasksDone: number;
  totalTasks: number;
  daysComplete: number;
};

/** Pure aggregation over a week plan — usable on client or server. */
export function summarizePlan(week: PlanDay[]): WeekSummary {
  let touches = 0;
  let touchesTarget = 0;
  let tasksDone = 0;
  let totalTasks = 0;
  for (const d of week) {
    for (const t of d.tasks) {
      touches += t.done;
      touchesTarget += t.target;
      totalTasks += 1;
      if (t.isDone) tasksDone += 1;
    }
  }
  return {
    touches,
    touchesTarget,
    tasksDone,
    totalTasks,
    daysComplete: week.filter((d) => d.complete).length,
  };
}
