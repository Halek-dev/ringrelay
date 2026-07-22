"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Loader2, Send, Upload } from "lucide-react";
import { submitApplication } from "@/app/(marketing)/careers/actions";
import { cn } from "@/lib/utils";

const inputCls =
  "w-full rounded-[10px] border-[1.5px] border-line2 bg-card px-[13px] py-[11px] text-[14.5px] text-ink placeholder:text-mute";

/**
 * The apply area below a job description. Shows a single Apply button first;
 * the form only appears (and scrolls into view) once the reader chooses to
 * apply, so the posting reads as a page, not a form.
 */
export function ApplySection({
  postingId,
  postingTitle,
}: {
  postingId: string;
  postingTitle: string;
}) {
  const [open, setOpen] = useState(false);
  const formRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [open]);

  if (!open) {
    return (
      <div className="mt-12 rounded-[18px] border border-line2 bg-card p-7 text-center shadow-soft">
        <h2 className="font-display text-[22px] font-extrabold tracking-[-0.02em] text-ink">
          Sound like you?
        </h2>
        <p className="mx-auto mt-2 max-w-[420px] text-[14.5px] leading-[1.6] text-body">
          The application takes about five minutes. Short and honest beats long
          and polished.
        </p>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="mt-5 inline-flex items-center gap-2 whitespace-nowrap rounded-full bg-acc px-7 py-[13px] text-[15.5px] font-bold text-white transition-all hover:-translate-y-0.5 hover:bg-acc-b"
        >
          Apply for this role <ArrowRight size={16} strokeWidth={2.5} />
        </button>
      </div>
    );
  }

  return (
    <div ref={formRef} className="mt-12 scroll-mt-24">
      <h2 className="mb-1 font-display text-[24px] font-extrabold tracking-[-0.02em] text-ink">
        Apply for this role
      </h2>
      <p className="mb-6 text-[14.5px] text-body">
        Short and honest beats long and polished. Tell us why this role fits
        you.
      </p>
      <ApplyForm postingId={postingId} postingTitle={postingTitle} />
    </div>
  );
}

export function ApplyForm({
  postingId,
  postingTitle,
}: {
  postingId: string;
  postingTitle: string;
}) {
  const [pending, startTransition] = useTransition();
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    fd.set("postingId", postingId);
    startTransition(async () => {
      const res = await submitApplication(fd);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      setDone(true);
    });
  }

  if (done) {
    return (
      <div className="rounded-[18px] border border-ok/35 bg-ok/[0.06] p-7 text-center">
        <CheckCircle2 size={34} className="mx-auto text-ok" />
        <h3 className="mt-3 font-display text-[20px] font-bold text-ink">
          Application received
        </h3>
        <p className="mx-auto mt-2 max-w-[420px] text-[14.5px] leading-[1.6] text-body">
          Thanks for applying for {postingTitle}. We read every application
          ourselves. If it looks like a fit, we will email you within a week to
          set up a short call.
        </p>
      </div>
    );
  }

  return (
    <form
      ref={formRef}
      onSubmit={onSubmit}
      className="rounded-[18px] border border-line2 bg-card p-6 shadow-soft"
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {/* Honeypot: hidden from humans, bots fill it. */}
        <input
          type="text"
          name="website"
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
          className="hidden"
        />

        <Field label="Full name" required>
          <input name="fullName" required className={inputCls} placeholder="Jane Doe" />
        </Field>
        <Field label="Email" required>
          <input
            name="email"
            type="email"
            required
            className={inputCls}
            placeholder="you@email.com"
          />
        </Field>
        <Field label="Phone" required>
          <input
            name="phone"
            type="tel"
            required
            className={inputCls}
            placeholder="+1 555 000 0000"
          />
        </Field>
        <Field label="Country and timezone" required>
          <input
            name="countryTimezone"
            required
            className={inputCls}
            placeholder="Philippines, GMT+8"
          />
        </Field>
        <Field label="Role" className="sm:col-span-2">
          <input
            value={postingTitle}
            readOnly
            className={cn(inputCls, "bg-panel text-mute")}
          />
        </Field>
        <Field label="Years of relevant experience">
          <input name="yearsExperience" className={inputCls} placeholder="2" />
        </Field>
        <Field label="Hours per week you can work">
          <input name="hoursPerWeek" className={inputCls} placeholder="20" />
        </Field>
        <Field label="Earliest start date" className="sm:col-span-2">
          <input name="earliestStart" className={inputCls} placeholder="Immediately" />
        </Field>
        <Field label="Cover note" className="sm:col-span-2">
          <textarea
            name="coverNote"
            rows={4}
            className={cn(inputCls, "resize-y leading-[1.55]")}
            placeholder="A few sentences on why this role fits you. Plain and honest."
          />
        </Field>

        <Field label="CV (PDF or Word, max 5MB)" className="sm:col-span-2">
          <label className="flex cursor-pointer items-center gap-3 rounded-[10px] border-[1.5px] border-dashed border-line2 bg-card px-4 py-[14px] text-[14px] text-body hover:border-acc/50">
            <Upload size={16} className="text-acc" />
            <span className="font-semibold">
              {fileName ?? "Choose a file"}
            </span>
            <input
              type="file"
              name="cv"
              accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              className="hidden"
              onChange={(e) => setFileName(e.target.files?.[0]?.name ?? null)}
            />
          </label>
        </Field>

        <label className="flex items-start gap-3 sm:col-span-2">
          <input
            type="checkbox"
            name="consent"
            value="yes"
            required
            className="mt-[3px] h-4 w-4 rounded border-line2 text-acc focus:ring-acc"
          />
          <span className="text-[13px] leading-[1.55] text-body">
            I agree that Ring Relay may process the personal data in this
            application for recruitment purposes, as described in the{" "}
            <Link
              href="/privacy"
              target="_blank"
              className="font-bold text-acc-dim underline hover:text-acc"
            >
              privacy policy
            </Link>
            . Required.
          </span>
        </label>
      </div>

      {error && (
        <p className="mt-4 rounded-[10px] border border-acc/40 bg-acc/[0.06] px-4 py-3 text-[13.5px] font-semibold text-acc-dim">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="mt-5 inline-flex w-full items-center justify-center gap-2 whitespace-nowrap rounded-full bg-acc px-6 py-[13px] text-[15px] font-bold text-white transition-all hover:bg-acc-b disabled:opacity-60 sm:w-auto"
      >
        {pending ? (
          <>
            <Loader2 size={16} className="animate-spin" /> Sending
          </>
        ) : (
          <>
            <Send size={15} /> Submit application
          </>
        )}
      </button>
    </form>
  );
}

function Field({
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
      <span className="text-[13px] font-bold text-ink">
        {label}
        {required && <span className="text-acc"> *</span>}
      </span>
      {children}
    </label>
  );
}
