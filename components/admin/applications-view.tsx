"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import * as Dialog from "@radix-ui/react-dialog";
import { ArrowLeft, X, Download, Loader2, Save } from "lucide-react";
import { useToast } from "@/components/ui/toaster";
import {
  setApplicationStatus,
  saveApplicationNotes,
  getCvDownloadUrl,
} from "@/app/admin/(protected)/careers/actions";
import {
  APPLICATION_STATUS_LABEL,
  APPLICATION_STATUS_ORDER,
  type ApplicationStatus,
  type JobApplication,
  type JobPosting,
} from "@/lib/db-types";
import { cn } from "@/lib/utils";

type AppRow = JobApplication & { posting_title: string };

const STATUS_STYLE: Record<ApplicationStatus, string> = {
  new: "border-acc/40 bg-acc/10 text-acc-dim",
  reviewing: "border-ai-line bg-ai-bg2 text-acc-dim",
  interview: "border-ok/35 bg-ok/[0.08] text-ok",
  rejected: "border-line2 bg-panel text-mute",
  hired: "border-ok/35 bg-ok/[0.08] text-ok",
};

export function ApplicationsView({
  applications,
  postings,
}: {
  applications: AppRow[];
  postings: JobPosting[];
}) {
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<ApplicationStatus | "all">("all");
  const [activeId, setActiveId] = useState<string | null>(null);

  const filtered = useMemo(
    () =>
      applications.filter(
        (a) =>
          (roleFilter === "all" || a.posting_id === roleFilter) &&
          (statusFilter === "all" || a.status === statusFilter),
      ),
    [applications, roleFilter, statusFilter],
  );

  const active = activeId
    ? applications.find((a) => a.id === activeId) ?? null
    : null;

  const selectCls =
    "rounded-[9px] border-[1.5px] border-line2 bg-card2 px-2 py-[8px] text-[13px] font-semibold text-ink";

  return (
    <div>
      <Link
        href="/admin/careers"
        className="mb-4 inline-flex items-center gap-1 text-[13px] font-bold text-acc-dim hover:text-acc"
      >
        <ArrowLeft size={14} strokeWidth={2.4} /> Postings
      </Link>

      <header className="mb-6">
        <h1 className="font-display text-[26px] font-extrabold tracking-[-0.02em] text-ink">
          Applications
        </h1>
        <p className="mt-1 text-[14.5px] text-body">
          {applications.length} received. Click one to review it.
        </p>
      </header>

      <div className="mb-5 flex flex-wrap items-center gap-2">
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className={selectCls}
          aria-label="Filter by role"
        >
          <option value="all">All roles</option>
          {postings.map((p) => (
            <option key={p.id} value={p.id}>
              {p.title}
            </option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as ApplicationStatus | "all")}
          className={selectCls}
          aria-label="Filter by status"
        >
          <option value="all">All statuses</option>
          {APPLICATION_STATUS_ORDER.map((s) => (
            <option key={s} value={s}>
              {APPLICATION_STATUS_LABEL[s]}
            </option>
          ))}
        </select>
      </div>

      <div className="overflow-x-auto rounded-[16px] border border-line2 bg-card shadow-soft">
        <table className="w-full min-w-[720px] border-collapse text-left">
          <thead>
            <tr className="border-b border-line2 bg-panel">
              {["Name", "Role", "Country / timezone", "Experience", "Applied", "Status"].map(
                (h) => (
                  <th
                    key={h}
                    className="px-5 py-[12px] font-mono text-[11px] font-semibold uppercase tracking-[0.1em] text-mute"
                  >
                    {h}
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody>
            {filtered.map((a) => (
              <tr
                key={a.id}
                onClick={() => setActiveId(a.id)}
                tabIndex={0}
                role="button"
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setActiveId(a.id);
                  }
                }}
                className="cursor-pointer border-b border-line last:border-b-0 hover:bg-panel/60 focus-visible:bg-panel/60"
              >
                <td className="px-5 py-[13px] text-[14px] font-bold text-ink">
                  {a.full_name}
                </td>
                <td className="px-5 py-[13px] text-[13.5px] text-body">
                  {a.posting_title}
                </td>
                <td className="px-5 py-[13px] text-[13.5px] text-body">
                  {a.country_timezone}
                </td>
                <td className="px-5 py-[13px] text-[13.5px] text-body">
                  {a.years_experience ?? "-"}
                </td>
                <td className="px-5 py-[13px] text-[13px] text-mute">
                  {new Date(a.created_at).toLocaleDateString()}
                </td>
                <td className="px-5 py-[13px]">
                  <span
                    className={cn(
                      "rounded-full border px-[9px] py-[2px] text-[11.5px] font-bold",
                      STATUS_STYLE[a.status],
                    )}
                  >
                    {APPLICATION_STATUS_LABEL[a.status]}
                  </span>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-5 py-10 text-center text-[14px] text-mute">
                  No applications match these filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Dialog.Root open={!!active} onOpenChange={(o) => !o && setActiveId(null)}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-ink/40 backdrop-blur-sm" />
          <Dialog.Content className="fixed inset-y-0 right-0 z-50 w-full max-w-[520px] overflow-y-auto border-l border-line2 bg-card shadow-card focus:outline-none">
            {active && <ApplicationDetail app={active} />}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}

function ApplicationDetail({ app }: { app: AppRow }) {
  const router = useRouter();
  const { toast } = useToast();
  const [pending, startTransition] = useTransition();
  const [notes, setNotes] = useState(app.notes ?? "");
  const [cvLoading, setCvLoading] = useState(false);

  function changeStatus(status: ApplicationStatus) {
    startTransition(async () => {
      const res = await setApplicationStatus(app.id, status);
      if (!res.ok) toast({ variant: "info", title: "Failed", description: res.error });
      else router.refresh();
    });
  }

  function persistNotes() {
    startTransition(async () => {
      const res = await saveApplicationNotes(app.id, notes);
      if (!res.ok) toast({ variant: "info", title: "Failed", description: res.error });
      else {
        toast({ title: "Notes saved" });
        router.refresh();
      }
    });
  }

  async function downloadCv() {
    if (!app.cv_path) return;
    setCvLoading(true);
    const res = await getCvDownloadUrl(app.cv_path);
    setCvLoading(false);
    if (!res.ok) {
      toast({ variant: "info", title: "Download failed", description: res.error });
      return;
    }
    window.open(res.data.url, "_blank", "noopener");
  }

  return (
    <div>
      <div className="hazard-stripe h-[3px]" />
      <div className="flex items-start justify-between gap-3 border-b border-line px-6 py-5">
        <div>
          <Dialog.Title className="font-display text-[20px] font-extrabold tracking-[-0.02em] text-ink">
            {app.full_name}
          </Dialog.Title>
          <p className="mt-[2px] text-[13.5px] text-body">
            {app.posting_title} · applied{" "}
            {new Date(app.created_at).toLocaleDateString()}
          </p>
        </div>
        <Dialog.Close className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-line2 text-mute hover:text-ink">
          <X size={16} />
        </Dialog.Close>
      </div>

      <div className="flex flex-col gap-4 px-6 py-5">
        {/* Status pipeline */}
        <div>
          <div className="mb-2 font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-mute">
            Status
          </div>
          <div className="flex flex-wrap gap-2">
            {APPLICATION_STATUS_ORDER.map((s) => (
              <button
                key={s}
                type="button"
                disabled={pending}
                onClick={() => changeStatus(s)}
                className={cn(
                  "rounded-full border px-3 py-[6px] text-[12.5px] font-bold transition-colors disabled:opacity-60",
                  app.status === s
                    ? STATUS_STYLE[s]
                    : "border-line2 bg-card text-body hover:border-acc/40",
                )}
              >
                {APPLICATION_STATUS_LABEL[s]}
              </button>
            ))}
          </div>
        </div>

        {/* Facts */}
        <div className="grid grid-cols-1 gap-2 rounded-[12px] border border-line bg-panel px-4 py-3 text-[13.5px] sm:grid-cols-2">
          <Fact label="Email" value={app.email} />
          <Fact label="Phone" value={app.phone} />
          <Fact label="Country / timezone" value={app.country_timezone} />
          <Fact label="Experience" value={app.years_experience ?? "-"} />
          <Fact label="Hours per week" value={app.hours_per_week ?? "-"} />
          <Fact label="Earliest start" value={app.earliest_start ?? "-"} />
          <Fact
            label="Consent"
            value={
              app.consent_given
                ? `Given ${app.consent_at ? new Date(app.consent_at).toLocaleDateString() : ""}`
                : "Not given"
            }
          />
        </div>

        {/* CV */}
        {app.cv_path ? (
          <button
            type="button"
            onClick={downloadCv}
            disabled={cvLoading}
            className="inline-flex w-fit items-center gap-2 rounded-full border-[1.5px] border-line2 px-4 py-[9px] text-[13.5px] font-bold text-ink transition-colors hover:border-acc hover:text-acc disabled:opacity-60"
          >
            {cvLoading ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Download size={14} />
            )}
            Download CV
          </button>
        ) : (
          <p className="text-[13px] text-mute">No CV attached.</p>
        )}

        {/* Cover note */}
        {app.cover_note && (
          <div>
            <div className="mb-2 font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-mute">
              Cover note
            </div>
            <p className="whitespace-pre-wrap rounded-[12px] border border-line bg-card2 px-4 py-3 text-[14px] leading-[1.6] text-bubble-ink">
              {app.cover_note}
            </p>
          </div>
        )}

        {/* Private notes */}
        <div>
          <div className="mb-2 font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-mute">
            Private notes
          </div>
          <textarea
            rows={4}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Only you see these."
            className="w-full resize-y rounded-[10px] border-[1.5px] border-line2 bg-card2 px-[13px] py-[10px] text-[14px] leading-[1.55] text-ink placeholder:text-mute"
          />
          <button
            type="button"
            onClick={persistNotes}
            disabled={pending}
            className="mt-2 inline-flex items-center gap-2 rounded-full bg-acc px-4 py-[8px] text-[13px] font-bold text-white hover:bg-acc-b disabled:opacity-60"
          >
            <Save size={13} /> Save notes
          </button>
        </div>
      </div>
    </div>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span className="font-semibold text-mute">{label}: </span>
      <span className="break-words text-ink">{value}</span>
    </div>
  );
}
