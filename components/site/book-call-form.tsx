"use client";

import { useMemo, useState, useTransition } from "react";
import { ArrowRight, Check, CalendarDays, Clock } from "lucide-react";
import { bookCall } from "@/app/book/actions";
import { cn } from "@/lib/utils";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const TIMES = [
  "9:00 AM",
  "10:00 AM",
  "11:00 AM",
  "1:00 PM",
  "2:00 PM",
  "3:00 PM",
  "4:00 PM",
];

type DayOption = { iso: string; label: string; weekday: string; day: string; mon: string };

/** The next 10 weekdays, starting tomorrow. */
function nextWeekdays(count: number): DayOption[] {
  const out: DayOption[] = [];
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  while (out.length < count) {
    d.setDate(d.getDate() + 1);
    const dow = d.getDay();
    if (dow === 0 || dow === 6) continue;
    out.push({
      iso: d.toISOString().slice(0, 10),
      label: d.toLocaleDateString(undefined, {
        weekday: "short",
        month: "short",
        day: "numeric",
      }),
      weekday: d.toLocaleDateString(undefined, { weekday: "short" }),
      day: d.toLocaleDateString(undefined, { day: "numeric" }),
      mon: d.toLocaleDateString(undefined, { month: "short" }),
    });
  }
  return out;
}

export function BookCallForm() {
  const days = useMemo(() => nextWeekdays(10), []);
  const tz = useMemo(() => {
    try {
      return Intl.DateTimeFormat().resolvedOptions().timeZone || "your time";
    } catch {
      return "your time";
    }
  }, []);

  const [dayIso, setDayIso] = useState<string>("");
  const [time, setTime] = useState<string>("");
  const [email, setEmail] = useState("");
  const [business, setBusiness] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [pending, startTransition] = useTransition();

  const chosenDay = days.find((d) => d.iso === dayIso);
  const ready = !!dayIso && !!time && EMAIL_RE.test(email) && !!business.trim();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!dayIso || !time) return setError("Pick a day and a time above.");
    if (!business.trim()) return setError("Add your business name.");
    if (!EMAIL_RE.test(email)) return setError("Enter a valid email.");

    startTransition(async () => {
      const res = await bookCall({
        email,
        business,
        name,
        dateLabel: chosenDay?.label ?? dayIso,
        timeLabel: time,
        tz,
      });
      if (res.ok) setSubmitted(true);
      else setError(res.error);
    });
  }

  if (submitted) {
    return (
      <div className="rounded-[22px] border border-line2 bg-card px-8 py-14 text-center shadow-card">
        <div className="mx-auto mb-6 grid h-[60px] w-[60px] place-items-center rounded-full border-[1.5px] border-ok/35 bg-ok/10">
          <Check size={26} strokeWidth={2.6} className="text-ok" />
        </div>
        <h2 className="font-display text-[28px] font-extrabold tracking-[-0.03em] text-ink">
          You&apos;re booked.
        </h2>
        <p className="mx-auto mt-3 max-w-[420px] text-[16px] leading-[1.6] text-body">
          {chosenDay?.label} at {time}. We just emailed {email} and will send a
          calendar invite to confirm. Need to change it? Just reply to that
          email.
        </p>
      </div>
    );
  }

  const inputBase =
    "w-full rounded-[10px] border-[1.5px] border-line2 bg-card2 px-[15px] py-[13px] text-[15px] text-ink transition-colors placeholder:text-mute focus:border-acc focus:outline-none";

  return (
    <form
      onSubmit={submit}
      noValidate
      className="rounded-[22px] border border-line2 bg-card p-6 shadow-card sm:p-9"
    >
      {/* Step 1: day */}
      <div className="flex items-center gap-2 text-[13px] font-bold uppercase tracking-[0.06em] text-ink">
        <CalendarDays size={16} className="text-acc" /> Pick a day
      </div>
      <div className="mt-3 flex gap-2 overflow-x-auto pb-2">
        {days.map((d) => {
          const active = d.iso === dayIso;
          return (
            <button
              key={d.iso}
              type="button"
              onClick={() => setDayIso(d.iso)}
              className={cn(
                "flex min-w-[68px] shrink-0 flex-col items-center gap-[2px] rounded-[12px] border px-2 py-[10px] transition-colors",
                active
                  ? "border-acc bg-acc/10 text-acc-dim"
                  : "border-line2 bg-card2 text-body hover:border-acc/40",
              )}
            >
              <span className="text-[11px] font-semibold uppercase tracking-[0.04em]">
                {d.weekday}
              </span>
              <span className="font-display text-[20px] font-extrabold leading-none text-ink">
                {d.day}
              </span>
              <span className="text-[11px] text-mute">{d.mon}</span>
            </button>
          );
        })}
      </div>

      {/* Step 2: time */}
      <div className="mt-6 flex items-center gap-2 text-[13px] font-bold uppercase tracking-[0.06em] text-ink">
        <Clock size={16} className="text-acc" /> Pick a time
        <span className="ml-1 normal-case text-[11.5px] font-medium tracking-normal text-mute">
          {tz.replace(/_/g, " ")}
        </span>
      </div>
      <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4">
        {TIMES.map((t) => {
          const active = t === time;
          return (
            <button
              key={t}
              type="button"
              onClick={() => setTime(t)}
              className={cn(
                "rounded-[10px] border px-2 py-[10px] text-[14px] font-semibold transition-colors",
                active
                  ? "border-acc bg-acc/10 text-acc-dim"
                  : "border-line2 bg-card2 text-body hover:border-acc/40",
              )}
            >
              {t}
            </button>
          );
        })}
      </div>

      {/* Step 3: details */}
      <div className="mt-7 grid grid-cols-1 gap-[16px] sm:grid-cols-2">
        <label className="flex flex-col gap-[7px] sm:col-span-2">
          <span className="text-[13px] font-bold text-ink">Work email</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="dave@kowalskihvac.com"
            className={inputBase}
          />
        </label>
        <label className="flex flex-col gap-[7px]">
          <span className="text-[13px] font-bold text-ink">Business name</span>
          <input
            type="text"
            value={business}
            onChange={(e) => setBusiness(e.target.value)}
            placeholder="Kowalski Heating & Air"
            className={inputBase}
          />
        </label>
        <label className="flex flex-col gap-[7px]">
          <span className="text-[13px] font-bold text-ink">
            Your name{" "}
            <span className="font-medium text-mute">(optional)</span>
          </span>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Dave"
            className={inputBase}
          />
        </label>
      </div>

      {error && (
        <p className="mt-4 rounded-[10px] border border-acc/40 bg-acc/10 px-4 py-2 text-center text-[13.5px] font-semibold text-acc-dim">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending || !ready}
        className="mt-6 flex w-full items-center justify-center gap-3 rounded-full bg-acc px-6 py-4 text-[16.5px] font-bold text-white shadow-[0_12px_32px_rgba(234,88,12,0.32)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-acc-b active:translate-y-0 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending
          ? "Booking…"
          : chosenDay && time
            ? `Book ${chosenDay.weekday} at ${time}`
            : "Book my call"}
        {!pending && <ArrowRight size={16} strokeWidth={2.6} />}
      </button>
      <p className="mt-[14px] text-center text-[12.5px] text-mute">
        15 minutes. No slides, no pressure. One call, then you decide.
      </p>
    </form>
  );
}
