"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, Minus, Plus, Flame, CheckCircle2 } from "lucide-react";
import { Panel, ProgressBar } from "@/components/admin/ui";
import { useToast } from "@/components/ui/toaster";
import { setTaskProgress } from "@/app/admin/(protected)/daily-plan/actions";
import { summarizePlan, type PlanDay, type PlanTask } from "@/lib/plan-types";
import { cn } from "@/lib/utils";

export function DailyPlan({
  week,
  streak,
  pipeline,
}: {
  week: PlanDay[];
  streak: number;
  pipeline: { demos: number; replies: number };
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [pending, startTransition] = useTransition();

  // Local optimistic copy; re-synced whenever the server sends fresh data.
  const [days, setDays] = useState<PlanDay[]>(week);
  useEffect(() => setDays(week), [week]);

  const todayIdx = Math.max(
    0,
    days.findIndex((d) => d.isToday),
  );
  const [selected, setSelected] = useState(todayIdx);
  useEffect(() => setSelected(todayIdx), [todayIdx]);

  const summary = useMemo(() => summarizePlan(days), [days]);
  const day = days[selected];

  function applyLocal(dateISO: string, taskId: string, count: number) {
    setDays((prev) =>
      prev.map((d) => {
        if (d.dateISO !== dateISO) return d;
        const tasks = d.tasks.map((t) =>
          t.taskId === taskId
            ? { ...t, done: count, isDone: count >= t.target }
            : t,
        );
        return {
          ...d,
          tasks,
          complete: tasks.length > 0 && tasks.every((t) => t.isDone),
        };
      }),
    );
  }

  function persist(
    dateISO: string,
    task: PlanTask,
    count: number,
    prevCount: number,
  ) {
    const clamped = Math.max(0, Math.min(task.target, count));
    applyLocal(dateISO, task.taskId, clamped);
    startTransition(async () => {
      const res = await setTaskProgress({
        taskId: task.taskId,
        date: dateISO,
        completedCount: clamped,
        target: task.target,
      });
      if (!res.ok) {
        applyLocal(dateISO, task.taskId, prevCount);
        toast({ variant: "info", title: "Couldn't save", description: res.error });
        return;
      }
      router.refresh();
    });
  }

  function completeDay(d: PlanDay) {
    startTransition(async () => {
      const results = await Promise.all(
        d.tasks
          .filter((t) => !t.isDone)
          .map((t) =>
            setTaskProgress({
              taskId: t.taskId,
              date: d.dateISO,
              completedCount: t.target,
              target: t.target,
            }),
          ),
      );
      const firstErr = results.find((r) => !r.ok);
      if (firstErr && !firstErr.ok) {
        toast({ variant: "info", title: "Couldn't save", description: firstErr.error });
      } else {
        toast({ title: "Day complete", description: "Nice — streak protected." });
      }
      router.refresh();
    });
  }

  return (
    <div>
      <header className="mb-7 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-[26px] font-extrabold tracking-[-0.02em] text-ink">
            Daily plan
          </h1>
          <p className="mt-1 text-[14.5px] text-body">
            Run the same outreach playbook every day. Consistency closes deals.
          </p>
        </div>
        <div className="inline-flex items-center gap-2 rounded-full border border-acc/30 bg-acc/10 px-4 py-2">
          <Flame size={16} className="text-acc" />
          <span className="font-mono text-[12.5px] font-semibold tracking-[0.06em] text-acc-dim">
            {streak}-DAY STREAK
          </span>
        </div>
      </header>

      {/* This week's numbers */}
      <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
        <NumberStat
          label="Touches logged"
          value={`${summary.touches}`}
          sub={`of ${summary.touchesTarget} target`}
          progress={[summary.touches, summary.touchesTarget]}
        />
        <NumberStat label="Replies" value={`${pipeline.replies}`} sub="this week" />
        <NumberStat label="Demos" value={`${pipeline.demos}`} sub="booked" />
        <NumberStat
          label="Days complete"
          value={`${summary.daysComplete}`}
          sub="of 7"
        />
      </div>

      {/* Week strip */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
        {days.map((d, i) => {
          const done = d.tasks.filter((t) => t.isDone).length;
          const isSelected = i === selected;
          return (
            <button
              key={d.dateISO}
              type="button"
              onClick={() => setSelected(i)}
              className={cn(
                "flex flex-col gap-2 rounded-[14px] border p-3 text-left transition-all",
                isSelected
                  ? "border-acc bg-acc/[0.06] shadow-soft"
                  : "border-line2 bg-card hover:border-acc/40",
              )}
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.1em] text-mute">
                  {d.abbrev}
                </span>
                {d.complete ? (
                  <CheckCircle2 size={16} className="text-ok" />
                ) : d.isToday ? (
                  <span className="h-[7px] w-[7px] animate-blink rounded-full bg-acc" />
                ) : null}
              </div>
              <span className="text-[13px] font-bold text-ink">{d.dateShort}</span>
              <ProgressBar value={done} max={d.tasks.length} />
              <span className="text-[11.5px] font-semibold text-mute">
                {done}/{d.tasks.length} tasks
              </span>
            </button>
          );
        })}
      </div>

      {/* Selected day detail */}
      <Panel>
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-4">
          <div className="flex items-center gap-3">
            <h2 className="font-display text-[17px] font-bold tracking-[-0.01em] text-ink">
              {day.label}
            </h2>
            <span className="font-mono text-[12px] font-semibold text-mute">
              {day.dateShort}
              {day.isToday ? " · Today" : ""}
            </span>
          </div>
          {day.complete ? (
            <span className="inline-flex items-center gap-2 rounded-full border border-ok/35 bg-ok/[0.08] px-4 py-2 text-[13px] font-bold text-ok">
              <CheckCircle2 size={15} /> Day complete
            </span>
          ) : (
            <span className="rounded-full border border-line2 bg-panel px-4 py-2 text-[13px] font-semibold text-mute">
              {day.tasks.filter((t) => !t.isDone).length} left to finish the day
            </span>
          )}
        </div>

        <div className="flex flex-col divide-y divide-line">
          {day.tasks.map((t) => {
            const single = t.target <= 1;
            return (
              <div key={t.taskId} className="flex items-center gap-4 px-5 py-4">
                <button
                  type="button"
                  disabled={pending}
                  aria-label={t.isDone ? "Mark incomplete" : "Mark complete"}
                  onClick={() =>
                    persist(day.dateISO, t, t.isDone ? 0 : t.target, t.done)
                  }
                  className={cn(
                    "grid h-6 w-6 shrink-0 place-items-center rounded-[7px] border-[1.5px] transition-colors disabled:opacity-70",
                    t.isDone
                      ? "border-ok bg-ok text-white"
                      : "border-line2 bg-card hover:border-acc",
                  )}
                >
                  {t.isDone && <Check size={14} strokeWidth={3} />}
                </button>

                <div className="min-w-0 flex-1">
                  <div
                    className={cn(
                      "text-[14.5px] font-semibold",
                      t.isDone ? "text-mute line-through" : "text-ink",
                    )}
                  >
                    {t.label}
                  </div>
                  {!single && (
                    <div className="mt-2 flex items-center gap-3">
                      <ProgressBar
                        value={t.done}
                        max={t.target}
                        className="max-w-[220px]"
                      />
                      <span className="font-mono text-[12px] font-semibold text-mute">
                        {t.done}/{t.target}
                      </span>
                    </div>
                  )}
                </div>

                {!single && (
                  <div className="flex shrink-0 items-center gap-1">
                    <StepBtn
                      onClick={() => persist(day.dateISO, t, t.done - 1, t.done)}
                      disabled={pending || t.done <= 0}
                    >
                      <Minus size={14} strokeWidth={2.6} />
                    </StepBtn>
                    <StepBtn
                      onClick={() => persist(day.dateISO, t, t.done + 1, t.done)}
                      disabled={pending || t.done >= t.target}
                    >
                      <Plus size={14} strokeWidth={2.6} />
                    </StepBtn>
                  </div>
                )}
              </div>
            );
          })}
          {day.tasks.length === 0 && (
            <p className="px-5 py-8 text-center text-[14px] text-mute">
              No tasks scheduled for this day.
            </p>
          )}
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-line px-5 py-4">
          <span className="text-[13px] text-body">
            A day is complete only when every task is checked.
          </span>
          <button
            type="button"
            disabled={pending || day.complete || day.tasks.length === 0}
            onClick={() => completeDay(day)}
            className={cn(
              "rounded-full px-5 py-[10px] text-[14px] font-bold transition-all",
              day.complete
                ? "bg-ok text-white"
                : day.tasks.length === 0
                  ? "cursor-not-allowed border-[1.5px] border-line2 bg-card text-mute"
                  : "bg-acc text-white hover:bg-acc-b",
            )}
          >
            {day.complete ? "Day marked complete ✓" : "Mark day complete"}
          </button>
        </div>
      </Panel>
    </div>
  );
}

function NumberStat({
  label,
  value,
  sub,
  progress,
}: {
  label: string;
  value: string;
  sub: string;
  progress?: [number, number];
}) {
  return (
    <div className="rounded-[16px] border border-line2 bg-card p-4 shadow-soft">
      <div className="font-mono text-[11px] font-semibold uppercase tracking-[0.12em] text-mute">
        {label}
      </div>
      <div className="mt-2 font-display text-[24px] font-extrabold tracking-[-0.02em] text-ink">
        {value}
      </div>
      <div className="text-[12px] text-mute">{sub}</div>
      {progress && (
        <ProgressBar value={progress[0]} max={progress[1]} className="mt-3" />
      )}
    </div>
  );
}

function StepBtn({
  children,
  onClick,
  disabled,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="grid h-7 w-7 place-items-center rounded-[8px] border border-line2 bg-card text-ink transition-colors hover:border-acc hover:text-acc disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-line2 disabled:hover:text-ink"
    >
      {children}
    </button>
  );
}
