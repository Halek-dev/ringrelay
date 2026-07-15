import Link from "next/link";
import { Flame, CheckCircle2, ArrowRight, Info } from "lucide-react";
import { Panel, ProgressBar } from "@/components/admin/ui";
import {
  DAILY_GOALS,
  goalsMet,
  isDayComplete,
  type PlanDay,
  type WeekTotals,
} from "@/lib/plan-types";
import { cn } from "@/lib/utils";

/**
 * The daily plan is read-only on purpose: every number is derived from real
 * rows in the database. You move it by doing the work (adding leads, logging
 * touches, running the funnel), not by checking boxes.
 */
export function DailyPlan({
  week,
  today,
  totals,
  streak,
}: {
  week: PlanDay[];
  today: PlanDay;
  totals: WeekTotals;
  streak: number;
}) {
  const todayComplete = isDayComplete(today.counts);

  return (
    <div>
      <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-[26px] font-extrabold tracking-[-0.02em] text-ink">
            Daily plan
          </h1>
          <p className="mt-1 max-w-[560px] text-[14.5px] leading-[1.5] text-body">
            These counters are live. They come straight from your leads and
            logged touches, so the only way the numbers move is by doing the
            work. Nothing here is checked off by hand.
          </p>
        </div>
        <div className="inline-flex items-center gap-2 whitespace-nowrap rounded-full border border-acc/30 bg-acc/10 px-4 py-2">
          <Flame size={16} className="text-acc" />
          <span className="font-mono text-[12.5px] font-semibold tracking-[0.06em] text-acc-dim">
            {streak}-DAY STREAK
          </span>
        </div>
      </header>

      {/* This week's real numbers */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <NumberStat
          label="Touches logged"
          value={`${totals.touches}`}
          sub="this week"
        />
        <NumberStat label="Replies" value={`${totals.replies}`} sub="logged replies" />
        <NumberStat label="Demos" value={`${totals.demos}`} sub="booked this week" />
        <NumberStat
          label="Days complete"
          value={`${totals.daysComplete}`}
          sub="of 7 this week"
        />
      </div>

      {/* Week strip */}
      <div className="mb-7 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
        {week.map((d) => {
          const met = goalsMet(d.counts);
          const complete = isDayComplete(d.counts);
          return (
            <div
              key={d.dateISO}
              className={cn(
                "flex flex-col gap-2 rounded-[14px] border p-3",
                d.isToday
                  ? "border-acc bg-acc/[0.06] shadow-soft"
                  : "border-line2 bg-card",
                d.isFuture && "opacity-55",
              )}
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.1em] text-mute">
                  {d.abbrev}
                </span>
                {complete ? (
                  <CheckCircle2 size={16} className="text-ok" />
                ) : d.isToday ? (
                  <span className="h-[7px] w-[7px] animate-blink rounded-full bg-acc" />
                ) : null}
              </div>
              <span className="text-[13px] font-bold text-ink">{d.dateShort}</span>
              <ProgressBar value={met} max={DAILY_GOALS.length} />
              <span className="text-[11.5px] font-semibold text-mute">
                {d.isFuture ? "upcoming" : `${met}/${DAILY_GOALS.length} goals`}
              </span>
            </div>
          );
        })}
      </div>

      {/* Today's derived goals */}
      <Panel>
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-4">
          <div className="flex items-center gap-3">
            <h2 className="font-display text-[17px] font-bold tracking-[-0.01em] text-ink">
              Today
            </h2>
            <span className="font-mono text-[12px] font-semibold text-mute">
              {today.dateShort}
            </span>
          </div>
          {todayComplete ? (
            <span className="inline-flex items-center gap-2 whitespace-nowrap rounded-full border border-ok/35 bg-ok/[0.08] px-4 py-2 text-[13px] font-bold text-ok">
              <CheckCircle2 size={15} /> All goals met
            </span>
          ) : (
            <span className="whitespace-nowrap rounded-full border border-line2 bg-panel px-4 py-2 text-[13px] font-semibold text-mute">
              {goalsMet(today.counts)}/{DAILY_GOALS.length} goals met
            </span>
          )}
        </div>

        <div className="flex flex-col divide-y divide-line">
          {DAILY_GOALS.map((g) => {
            const count = today.counts[g.key];
            const done = count >= g.target;
            return (
              <div
                key={g.key}
                className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:gap-4"
              >
                <span
                  className={cn(
                    "grid h-6 w-6 shrink-0 place-items-center rounded-full border-[1.5px] text-[13px] font-bold",
                    done
                      ? "border-ok bg-ok text-white"
                      : "border-line2 bg-card text-mute",
                  )}
                >
                  {done ? <CheckCircle2 size={14} /> : null}
                </span>

                <div className="min-w-0 flex-1">
                  <div
                    className={cn(
                      "text-[14.5px] font-semibold",
                      done ? "text-ink" : "text-ink",
                    )}
                  >
                    {g.label}
                  </div>
                  <div className="mt-[3px] flex items-center gap-[6px] text-[12px] text-mute">
                    <Info size={12} /> {g.hint}
                  </div>
                  <div className="mt-2 flex items-center gap-3">
                    <ProgressBar
                      value={count}
                      max={g.target}
                      className="max-w-[240px]"
                    />
                    <span className="whitespace-nowrap font-mono text-[12px] font-semibold text-mute">
                      {count}/{g.target} {g.unit}
                    </span>
                  </div>
                </div>

                <Link
                  href={g.href}
                  className="inline-flex shrink-0 items-center justify-center gap-1 self-start whitespace-nowrap rounded-full border-[1.5px] border-line2 px-4 py-[8px] text-[13px] font-bold text-ink transition-colors hover:border-acc hover:text-acc sm:self-auto"
                >
                  {g.cta} <ArrowRight size={14} strokeWidth={2.4} />
                </Link>
              </div>
            );
          })}
        </div>

        <div className="border-t border-line px-5 py-4">
          <span className="text-[13px] leading-[1.5] text-body">
            A day is complete when all three goals hit target. There is no button
            for it. Log your real leads and touches and the day completes itself.
          </span>
        </div>
      </Panel>
    </div>
  );
}

function NumberStat({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub: string;
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
    </div>
  );
}
