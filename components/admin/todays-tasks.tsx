"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check, ArrowRight } from "lucide-react";
import { setTaskProgress } from "@/app/admin/(protected)/daily-plan/actions";
import { useToast } from "@/components/ui/toaster";
import type { PlanTask } from "@/lib/plan-types";
import { cn } from "@/lib/utils";

/** Today's outreach checklist on the dashboard, backed by daily_task_progress. */
export function TodaysTasks({
  tasks,
  dateISO,
}: {
  tasks: PlanTask[];
  dateISO: string;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [pending, startTransition] = useTransition();

  // Local optimistic view of "done" per task, re-synced when server data changes.
  const [state, setState] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(tasks.map((t) => [t.taskId, t.isDone])),
  );
  useEffect(() => {
    setState(Object.fromEntries(tasks.map((t) => [t.taskId, t.isDone])));
  }, [tasks]);

  function toggle(t: PlanTask) {
    const next = !state[t.taskId];
    setState((s) => ({ ...s, [t.taskId]: next }));
    startTransition(async () => {
      const res = await setTaskProgress({
        taskId: t.taskId,
        date: dateISO,
        completedCount: next ? t.target : 0,
        target: t.target,
      });
      if (!res.ok) {
        setState((s) => ({ ...s, [t.taskId]: !next }));
        toast({ variant: "info", title: "Couldn't save", description: res.error });
        return;
      }
      router.refresh();
    });
  }

  const completed = tasks.filter((t) => state[t.taskId]).length;

  return (
    <div>
      <div className="flex flex-col gap-1 px-5 py-3">
        {tasks.length === 0 && (
          <p className="px-2 py-6 text-center text-[14px] text-mute">
            No tasks scheduled for today.
          </p>
        )}
        {tasks.map((t) => {
          const done = state[t.taskId];
          return (
            <button
              key={t.taskId}
              type="button"
              disabled={pending}
              onClick={() => toggle(t)}
              className="group flex items-center gap-3 rounded-[10px] px-2 py-[10px] text-left transition-colors hover:bg-panel disabled:opacity-70"
            >
              <span
                className={cn(
                  "grid h-5 w-5 shrink-0 place-items-center rounded-[6px] border-[1.5px] transition-colors",
                  done
                    ? "border-ok bg-ok text-white"
                    : "border-line2 bg-card group-hover:border-acc",
                )}
              >
                {done && <Check size={13} strokeWidth={3} />}
              </span>
              <span
                className={cn(
                  "flex-1 text-[14px] font-semibold",
                  done ? "text-mute line-through" : "text-ink",
                )}
              >
                {t.label}
              </span>
              {t.target > 1 && (
                <span className="font-mono text-[12px] font-semibold text-mute">
                  {done ? t.target : t.done}/{t.target}
                </span>
              )}
            </button>
          );
        })}
      </div>
      <div className="flex items-center justify-between border-t border-line px-5 py-3">
        <span className="text-[13px] font-semibold text-body">
          {completed} of {tasks.length} done today
        </span>
        <Link
          href="/admin/daily-plan"
          className="inline-flex items-center gap-1 text-[13px] font-bold text-acc-dim hover:text-acc"
        >
          Open daily plan <ArrowRight size={14} strokeWidth={2.4} />
        </Link>
      </div>
    </div>
  );
}
