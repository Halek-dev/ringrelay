"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import * as Dialog from "@radix-ui/react-dialog";
import {
  Plus,
  Pencil,
  Trash2,
  X,
  ArrowUp,
  ArrowDown,
  Inbox,
  ExternalLink,
} from "lucide-react";
import { useToast } from "@/components/ui/toaster";
import {
  savePosting,
  setPostingStatus,
  deletePosting,
  movePosting,
  type PostingInput,
} from "@/app/admin/(protected)/careers/actions";
import {
  EMPLOYMENT_TYPE_LABEL,
  JOB_STATUS_LABEL,
  type EmploymentType,
  type JobPosting,
  type JobStatus,
} from "@/lib/db-types";
import { cn } from "@/lib/utils";

const STATUS_STYLE: Record<JobStatus, string> = {
  draft: "border-line2 bg-panel text-mute",
  open: "border-ok/35 bg-ok/[0.08] text-ok",
  closed: "border-line2 bg-panel text-body",
};

const emptyForm = (nextOrder: number): PostingInput => ({
  title: "",
  slug: "",
  employment_type: "hourly",
  location: "Remote",
  pay_range: "",
  hours_per_week: "",
  timezone_requirement: "",
  summary: "",
  description: "",
  responsibilities: "",
  requirements: "",
  nice_to_haves: "",
  status: "draft",
  sort_order: nextOrder,
});

function toForm(p: JobPosting): PostingInput {
  return {
    id: p.id,
    title: p.title,
    slug: p.slug,
    employment_type: p.employment_type,
    location: p.location,
    pay_range: p.pay_range ?? "",
    hours_per_week: p.hours_per_week ?? "",
    timezone_requirement: p.timezone_requirement ?? "",
    summary: p.summary,
    description: p.description,
    responsibilities: p.responsibilities.join("\n"),
    requirements: p.requirements.join("\n"),
    nice_to_haves: p.nice_to_haves.join("\n"),
    status: p.status,
    sort_order: p.sort_order,
  };
}

export function CareersAdminView({ postings }: { postings: JobPosting[] }) {
  const router = useRouter();
  const { toast } = useToast();
  const [pending, startTransition] = useTransition();
  const [editing, setEditing] = useState<PostingInput | null>(null);

  function run(action: () => Promise<{ ok: boolean; error?: string }>, doneMsg: string) {
    startTransition(async () => {
      const res = await action();
      if (!res.ok) toast({ variant: "info", title: "Failed", description: res.error });
      else {
        toast({ title: doneMsg });
        router.refresh();
      }
    });
  }

  return (
    <div>
      <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-[26px] font-extrabold tracking-[-0.02em] text-ink">
            Careers
          </h1>
          <p className="mt-1 text-[14.5px] text-body">
            Job postings on the public careers page. Only open roles show.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/admin/careers/applications"
            className="inline-flex items-center gap-2 whitespace-nowrap rounded-full border-[1.5px] border-line2 px-4 py-[10px] text-[14px] font-bold text-ink transition-colors hover:border-acc hover:text-acc"
          >
            <Inbox size={15} /> Applications
          </Link>
          <button
            type="button"
            onClick={() => setEditing(emptyForm(postings.length + 1))}
            className="inline-flex items-center gap-2 whitespace-nowrap rounded-full bg-acc px-5 py-[10px] text-[14px] font-bold text-white hover:bg-acc-b"
          >
            <Plus size={16} strokeWidth={2.6} /> New posting
          </button>
        </div>
      </header>

      <div className="flex flex-col gap-3">
        {postings.length === 0 && (
          <p className="rounded-[14px] border border-dashed border-line2 px-5 py-10 text-center text-[14px] text-mute">
            No postings yet. Create the first one.
          </p>
        )}
        {postings.map((p, i) => (
          <div
            key={p.id}
            className="flex flex-wrap items-center gap-3 rounded-[14px] border border-line2 bg-card px-4 py-3 shadow-soft"
          >
            <div className="flex shrink-0 flex-col gap-1">
              <button
                type="button"
                disabled={pending || i === 0}
                onClick={() => run(() => movePosting(p.id, "up"), "Moved")}
                className="grid h-6 w-6 place-items-center rounded-[6px] border border-line2 text-mute hover:text-ink disabled:opacity-30"
                aria-label="Move up"
              >
                <ArrowUp size={12} />
              </button>
              <button
                type="button"
                disabled={pending || i === postings.length - 1}
                onClick={() => run(() => movePosting(p.id, "down"), "Moved")}
                className="grid h-6 w-6 place-items-center rounded-[6px] border border-line2 text-mute hover:text-ink disabled:opacity-30"
                aria-label="Move down"
              >
                <ArrowDown size={12} />
              </button>
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[15px] font-bold text-ink">{p.title}</span>
                <span
                  className={cn(
                    "rounded-full border px-[9px] py-[2px] text-[11px] font-bold uppercase tracking-[0.04em]",
                    STATUS_STYLE[p.status],
                  )}
                >
                  {JOB_STATUS_LABEL[p.status]}
                </span>
              </div>
              <div className="mt-[2px] flex flex-wrap gap-x-4 gap-y-[2px] text-[12.5px] text-mute">
                <span>/careers/{p.slug}</span>
                <span>{EMPLOYMENT_TYPE_LABEL[p.employment_type]}</span>
                <span>{p.pay_range || "Pay range not set"}</span>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-1">
              {p.status === "open" ? (
                <>
                  <Link
                    href={`/careers/${p.slug}`}
                    target="_blank"
                    className="grid h-8 w-8 place-items-center rounded-[8px] text-mute hover:bg-panel hover:text-ink"
                    aria-label="View public page"
                  >
                    <ExternalLink size={14} />
                  </Link>
                  <ActionBtn
                    onClick={() => run(() => setPostingStatus(p.id, "closed"), "Closed")}
                    disabled={pending}
                  >
                    Close
                  </ActionBtn>
                </>
              ) : (
                <ActionBtn
                  onClick={() => run(() => setPostingStatus(p.id, "open"), "Published")}
                  disabled={pending}
                >
                  {p.status === "draft" ? "Publish" : "Reopen"}
                </ActionBtn>
              )}
              <button
                type="button"
                onClick={() => setEditing(toForm(p))}
                className="grid h-8 w-8 place-items-center rounded-[8px] text-mute hover:bg-panel hover:text-ink"
                aria-label={`Edit ${p.title}`}
              >
                <Pencil size={14} />
              </button>
              <button
                type="button"
                disabled={pending}
                onClick={() => {
                  if (confirm(`Delete "${p.title}" and its applications?`)) {
                    run(() => deletePosting(p.id), "Deleted");
                  }
                }}
                className="grid h-8 w-8 place-items-center rounded-[8px] text-mute hover:bg-panel hover:text-acc"
                aria-label={`Delete ${p.title}`}
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>

      <Dialog.Root open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-ink/40 backdrop-blur-sm" />
          <Dialog.Content className="fixed left-1/2 top-1/2 z-50 max-h-[92vh] w-[calc(100%-1.5rem)] max-w-[640px] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-[18px] border border-line2 bg-card p-6 shadow-card focus:outline-none">
            {editing && (
              <PostingForm
                initial={editing}
                onClose={() => setEditing(null)}
                onSaved={() => {
                  setEditing(null);
                  router.refresh();
                }}
              />
            )}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}

function ActionBtn({
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
      className="whitespace-nowrap rounded-full border border-line2 px-3 py-[5px] text-[12.5px] font-bold text-body transition-colors hover:border-acc hover:text-acc disabled:opacity-50"
    >
      {children}
    </button>
  );
}

const inputCls =
  "w-full rounded-[10px] border-[1.5px] border-line2 bg-card2 px-[13px] py-[10px] text-[14px] text-ink placeholder:text-mute";

function PostingForm({
  initial,
  onClose,
  onSaved,
}: {
  initial: PostingInput;
  onClose: () => void;
  onSaved: () => void;
}) {
  const { toast } = useToast();
  const [pending, startTransition] = useTransition();
  const [form, setForm] = useState<PostingInput>(initial);

  const set = (k: keyof PostingInput, v: string | number) =>
    setForm((f) => ({ ...f, [k]: v }));

  function submit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const res = await savePosting(form);
      if (!res.ok) {
        toast({ variant: "info", title: "Couldn't save", description: res.error });
        return;
      }
      toast({ title: form.id ? "Posting updated" : "Posting created" });
      onSaved();
    });
  }

  return (
    <>
      <div className="mb-4 flex items-center justify-between">
        <Dialog.Title className="font-display text-[19px] font-extrabold tracking-[-0.02em] text-ink">
          {form.id ? "Edit posting" : "New posting"}
        </Dialog.Title>
        <Dialog.Close className="grid h-8 w-8 place-items-center rounded-full border border-line2 text-mute hover:text-ink">
          <X size={16} />
        </Dialog.Close>
      </div>

      <form onSubmit={submit} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <L label="Title" required>
          <input
            className={inputCls}
            value={form.title}
            onChange={(e) => set("title", e.target.value)}
            required
          />
        </L>
        <L label="Slug (auto from title if blank)">
          <input
            className={inputCls}
            value={form.slug ?? ""}
            onChange={(e) => set("slug", e.target.value)}
            placeholder="customer-representative"
          />
        </L>
        <L label="Employment type">
          <select
            className={inputCls}
            value={form.employment_type}
            onChange={(e) => set("employment_type", e.target.value as EmploymentType)}
          >
            {(Object.keys(EMPLOYMENT_TYPE_LABEL) as EmploymentType[]).map((t) => (
              <option key={t} value={t}>
                {EMPLOYMENT_TYPE_LABEL[t]}
              </option>
            ))}
          </select>
        </L>
        <L label="Location">
          <input
            className={inputCls}
            value={form.location}
            onChange={(e) => set("location", e.target.value)}
          />
        </L>
        <L label="Pay range (you fill this in)">
          <input
            className={inputCls}
            value={form.pay_range}
            onChange={(e) => set("pay_range", e.target.value)}
            placeholder="$x to $y per hour"
          />
        </L>
        <L label="Hours per week">
          <input
            className={inputCls}
            value={form.hours_per_week}
            onChange={(e) => set("hours_per_week", e.target.value)}
          />
        </L>
        <L label="Timezone requirement" className="sm:col-span-2">
          <input
            className={inputCls}
            value={form.timezone_requirement}
            onChange={(e) => set("timezone_requirement", e.target.value)}
          />
        </L>
        <L label="Summary (shown on the card)" required className="sm:col-span-2">
          <textarea
            className={cn(inputCls, "resize-y leading-[1.5]")}
            rows={2}
            value={form.summary}
            onChange={(e) => set("summary", e.target.value)}
            required
          />
        </L>
        <L label="Full description" required className="sm:col-span-2">
          <textarea
            className={cn(inputCls, "resize-y leading-[1.55]")}
            rows={5}
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
            required
          />
        </L>
        <L label="Responsibilities (one per line)" className="sm:col-span-2">
          <textarea
            className={cn(inputCls, "resize-y leading-[1.5]")}
            rows={4}
            value={form.responsibilities}
            onChange={(e) => set("responsibilities", e.target.value)}
          />
        </L>
        <L label="Requirements (one per line)" className="sm:col-span-2">
          <textarea
            className={cn(inputCls, "resize-y leading-[1.5]")}
            rows={4}
            value={form.requirements}
            onChange={(e) => set("requirements", e.target.value)}
          />
        </L>
        <L label="Nice to haves (one per line)" className="sm:col-span-2">
          <textarea
            className={cn(inputCls, "resize-y leading-[1.5]")}
            rows={3}
            value={form.nice_to_haves}
            onChange={(e) => set("nice_to_haves", e.target.value)}
          />
        </L>
        <L label="Status">
          <select
            className={inputCls}
            value={form.status}
            onChange={(e) => set("status", e.target.value as JobStatus)}
          >
            {(Object.keys(JOB_STATUS_LABEL) as JobStatus[]).map((s) => (
              <option key={s} value={s}>
                {JOB_STATUS_LABEL[s]}
              </option>
            ))}
          </select>
        </L>
        <L label="Sort order">
          <input
            type="number"
            className={inputCls}
            value={form.sort_order}
            onChange={(e) => set("sort_order", Number(e.target.value) || 0)}
          />
        </L>

        <div className="mt-1 flex justify-end gap-2 sm:col-span-2">
          <button
            type="button"
            onClick={onClose}
            className="whitespace-nowrap rounded-full border-[1.5px] border-line2 px-5 py-[10px] text-[14px] font-bold text-ink"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={pending}
            className="whitespace-nowrap rounded-full bg-acc px-5 py-[10px] text-[14px] font-bold text-white hover:bg-acc-b disabled:opacity-60"
          >
            {pending ? "Saving" : "Save posting"}
          </button>
        </div>
      </form>
    </>
  );
}

function L({
  label,
  required,
  className,
  children,
}: {
  label: string;
  required?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <label className={cn("flex flex-col gap-[6px]", className)}>
      <span className="text-[12.5px] font-bold text-ink">
        {label}
        {required && <span className="text-acc"> *</span>}
      </span>
      {children}
    </label>
  );
}
