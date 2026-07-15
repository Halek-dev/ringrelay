import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { ProgressBar } from "@/components/admin/ui";
import { DAILY_GOALS, goalsMet, type PlanDay } from "@/lib/plan-types";
import { cn } from "@/lib/utils";

/**
 * Today's goals on the dashboard, derived from real activity. Read-only: the
 * links take you to where the work happens, and the counts move on their own.
 */
export function TodaysTasks({ today }: { today: PlanDay }) {
  const met = goalsMet(today.counts);

  return (
    <div>
      <div className="flex flex-col gap-1 px-5 py-3">
        {DAILY_GOALS.map((g) => {
          const count = today.counts[g.key];
          const done = count >= g.target;
          return (
            <Link
              key={g.key}
              href={g.href}
              className="group flex items-center gap-3 rounded-[10px] px-2 py-[10px] transition-colors hover:bg-panel"
            >
              <span
                className={cn(
                  "grid h-5 w-5 shrink-0 place-items-center rounded-full border-[1.5px] transition-colors",
                  done
                    ? "border-ok bg-ok text-white"
                    : "border-line2 bg-card group-hover:border-acc",
                )}
              >
                {done && <CheckCircle2 size={13} />}
              </span>
              <span className="flex-1 text-[14px] font-semibold text-ink">
                {g.label}
              </span>
              <span className="font-mono text-[12px] font-semibold text-mute">
                {count}/{g.target}
              </span>
              <ArrowRight
                size={14}
                strokeWidth={2.4}
                className="text-mute transition-colors group-hover:text-acc"
              />
            </Link>
          );
        })}
      </div>
      <div className="flex items-center justify-between border-t border-line px-5 py-3">
        <span className="text-[13px] font-semibold text-body">
          {met} of {DAILY_GOALS.length} goals met today
        </span>
        <Link
          href="/admin/daily-plan"
          className="inline-flex items-center gap-1 whitespace-nowrap text-[13px] font-bold text-acc-dim hover:text-acc"
        >
          Open daily plan <ArrowRight size={14} strokeWidth={2.4} />
        </Link>
      </div>
    </div>
  );
}
