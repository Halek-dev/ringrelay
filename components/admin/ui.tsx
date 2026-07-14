import { cn } from "@/lib/utils";
import {
  LEAD_STATUS_LABEL,
  type LeadStatus,
  type SetupStatus,
} from "@/lib/db-types";

/** Card container used across admin panels. Optional floating mono tag. */
export function Panel({
  children,
  className,
  tag,
}: {
  children: React.ReactNode;
  className?: string;
  tag?: string;
}) {
  return (
    <div
      className={cn(
        "relative rounded-[16px] border border-line2 bg-card shadow-soft",
        className,
      )}
    >
      {tag && <div className="card-tag absolute left-5 top-[-13px]">{tag}</div>}
      {children}
    </div>
  );
}

export function PanelHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-line px-5 py-4">
      <div>
        <h2 className="font-display text-[16px] font-bold tracking-[-0.01em] text-ink">
          {title}
        </h2>
        {subtitle && (
          <p className="mt-[2px] text-[13px] text-mute">{subtitle}</p>
        )}
      </div>
      {action}
    </div>
  );
}

/** Thin progress bar. */
export function ProgressBar({
  value,
  max,
  className,
}: {
  value: number;
  max: number;
  className?: string;
}) {
  const pct = max <= 0 ? 0 : Math.min(100, Math.round((value / max) * 100));
  const complete = pct >= 100;
  return (
    <div
      className={cn("h-[6px] w-full overflow-hidden rounded-full bg-panel", className)}
    >
      <div
        className={cn(
          "h-full rounded-full transition-all duration-300",
          complete ? "bg-ok" : "bg-acc",
        )}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

const LEAD_STATUS_STYLES: Record<LeadStatus, string> = {
  new: "border-line2 bg-panel text-body",
  contacted: "border-line2 bg-chip text-chip-ink",
  replied: "border-ai-line bg-ai-bg2 text-acc-dim",
  demo_booked: "border-acc/40 bg-acc/10 text-acc-dim",
  won: "border-ok/35 bg-ok/[0.08] text-ok",
  lost: "border-line2 bg-panel text-mute",
};

export function LeadBadge({ status }: { status: LeadStatus }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-[6px] whitespace-nowrap rounded-full border px-[10px] py-[3px] text-[12px] font-semibold",
        LEAD_STATUS_STYLES[status],
      )}
    >
      <span className="h-[5px] w-[5px] rounded-full bg-current opacity-70" />
      {LEAD_STATUS_LABEL[status]}
    </span>
  );
}

export function ClientBadge({ status }: { status: SetupStatus }) {
  const live = status === "live";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-[6px] whitespace-nowrap rounded-full border px-[10px] py-[3px] text-[12px] font-semibold",
        live
          ? "border-ok/35 bg-ok/[0.08] text-ok"
          : "border-acc/40 bg-acc/10 text-acc-dim",
      )}
    >
      <span
        className={cn(
          "h-[5px] w-[5px] rounded-full",
          live ? "bg-ok" : "animate-blink bg-acc",
        )}
      />
      {live ? "Live" : "Onboarding"}
    </span>
  );
}
