"use client";

import { useEffect, useRef, useState } from "react";
import {
  Star,
  MessageSquareText,
  Mail,
  CheckCircle2,
  TrendingUp,
  Play,
  RotateCcw,
  MapPin,
} from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Self-contained interactive demo of the review flow. No microphone, no API,
 * no data leaves the browser. The visitor types a business name and watches a
 * finished job turn into a fresh 5-star review and a higher map ranking.
 */

const STEP_DELAY = 1100;
const DEFAULT_NAME = "Summit Heating & Air";

const COMPETITORS = [
  { name: "Ace Comfort Air", rating: "4.8", reviews: 180 },
  { name: "Reliable Heating Co", rating: "4.7", reviews: 96 },
  { name: "Peak Mechanical", rating: "4.6", reviews: 61 },
];

export function ReviewDemo() {
  const [name, setName] = useState(DEFAULT_NAME);
  const [step, setStep] = useState(0); // 0 idle, 1 job, 2 request, 3 review, 4 ranking
  const [reviewCount, setReviewCount] = useState(22);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  function clearTimers() {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  }

  function run() {
    clearTimers();
    setStep(1);
    setReviewCount(22);
    [2, 3, 4].forEach((s, i) => {
      timers.current.push(setTimeout(() => setStep(s), STEP_DELAY * (i + 1)));
    });
  }

  function reset() {
    clearTimers();
    setStep(0);
    setReviewCount(22);
  }

  // Count up the review total once the ranking step arrives.
  useEffect(() => {
    if (step < 4) return;
    let n = 22;
    const id = setInterval(() => {
      n += 1;
      setReviewCount(n);
      if (n >= 41) clearInterval(id);
    }, 40);
    return () => clearInterval(id);
  }, [step]);

  useEffect(() => () => clearTimers(), []);

  const running = step > 0;
  const displayName = name.trim() || DEFAULT_NAME;

  return (
    <div className="rounded-[22px] border border-line2 bg-card p-5 shadow-card sm:p-7">
      {/* Controls */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <label className="flex flex-1 flex-col gap-[6px]">
          <span className="text-[12.5px] font-bold text-ink">Your business name</span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={DEFAULT_NAME}
            maxLength={40}
            className="rounded-[10px] border-[1.5px] border-line2 bg-card2 px-[13px] py-[11px] text-[15px] text-ink placeholder:text-mute"
          />
        </label>
        <button
          type="button"
          onClick={running ? reset : run}
          className={cn(
            "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full px-6 py-[12px] text-[15px] font-bold transition-all",
            running
              ? "border-[1.5px] border-line2 text-ink hover:border-acc hover:text-acc"
              : "bg-acc text-white hover:bg-acc-b",
          )}
        >
          {running ? (
            <>
              <RotateCcw size={16} /> Replay
            </>
          ) : (
            <>
              <Play size={16} fill="currentColor" strokeWidth={0} /> Run it
            </>
          )}
        </button>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Left: the messages */}
        <div className="flex flex-col gap-3">
          <StepCard show={step >= 1} label="Job finished">
            <div className="flex items-center gap-3">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-ok/15 text-ok">
                <CheckCircle2 size={18} />
              </span>
              <p className="text-[14px] leading-[1.5] text-ink">
                <span className="font-bold">{displayName}</span> just wrapped a
                job for Mike R.
              </p>
            </div>
          </StepCard>

          <StepCard show={step >= 2} label="Ring Relay sends the request">
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.1em] text-acc-dim">
                <MessageSquareText size={13} /> Text
                <Mail size={13} className="ml-2" /> Email
              </div>
              <div className="rounded-[12px_12px_4px_12px] border border-ai-line bg-gradient-to-br from-ai-bg1 to-ai-bg2 px-4 py-3 text-[14px] leading-[1.55] text-ai-ink">
                Hi Mike, thanks for choosing {displayName} today. Mind leaving us
                a quick Google review?{" "}
                <span className="font-semibold text-acc-dim underline">
                  leave a review
                </span>
              </div>
            </div>
          </StepCard>

          <StepCard show={step >= 3} label="Mike leaves a review">
            <div>
              <div className="mb-1 flex gap-[2px]">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} size={15} className="text-acc" fill="currentColor" strokeWidth={0} />
                ))}
              </div>
              <p className="text-[14px] leading-[1.5] text-bubble-ink">
                &ldquo;Fast, tidy, explained everything. Highly recommend.&rdquo;
              </p>
              <div className="mt-1 text-[12.5px] font-semibold text-mute">Mike R.</div>
            </div>
          </StepCard>
        </div>

        {/* Right: the map pack */}
        <div className="rounded-[16px] border border-line2 bg-panel p-4">
          <div className="mb-3 flex items-center gap-2 font-mono text-[11px] font-semibold uppercase tracking-[0.12em] text-mute">
            <MapPin size={13} className="text-acc" /> Google map pack
          </div>
          <MapPack name={displayName} climbed={step >= 4} reviewCount={reviewCount} />
          {step >= 4 && (
            <div className="mt-3 flex items-center gap-2 rounded-[12px] border border-ok/30 bg-ok/[0.06] px-3 py-2 text-[13px] font-semibold text-ink">
              <TrendingUp size={15} className="text-ok" />
              You climbed from #7 to #2 on the map.
            </div>
          )}
        </div>
      </div>

      <p className="mt-5 text-center text-[12.5px] text-mute">
        A simple illustration. Nothing you type here is sent or saved.
      </p>
    </div>
  );
}

function StepCard({
  show,
  label,
  children,
}: {
  show: boolean;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "rounded-[14px] border border-line2 bg-card2 p-4 transition-all duration-500",
        show ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-2 opacity-0",
      )}
    >
      <div className="mb-2 font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-mute">
        {label}
      </div>
      {children}
    </div>
  );
}

function MapPack({
  name,
  climbed,
  reviewCount,
}: {
  name: string;
  climbed: boolean;
  reviewCount: number;
}) {
  // Before: the three competitors, with "you" sitting at #7 below the pack.
  // After: you jump to #2, pushing the third competitor out of the top three.
  const rows = climbed
    ? [
        { ...COMPETITORS[0], you: false },
        { name, rating: "5.0", reviews: reviewCount, you: true },
        { ...COMPETITORS[1], you: false },
      ]
    : COMPETITORS.map((c) => ({ ...c, you: false }));

  return (
    <div className="flex flex-col gap-2">
      {rows.map((r, i) => (
        <div
          key={r.name + i}
          className={cn(
            "flex items-center gap-3 rounded-[10px] border px-3 py-[10px] transition-all duration-500",
            r.you
              ? "border-acc/50 bg-acc/[0.07]"
              : "border-line bg-card",
          )}
        >
          <span
            className={cn(
              "grid h-6 w-6 shrink-0 place-items-center rounded-full font-mono text-[11px] font-bold",
              r.you ? "bg-acc text-white" : "bg-panel text-mute",
            )}
          >
            {i + 1}
          </span>
          <div className="min-w-0 flex-1">
            <div
              className={cn(
                "truncate text-[13.5px]",
                r.you ? "font-bold text-ink" : "font-semibold text-body",
              )}
            >
              {r.name}
            </div>
            <div className="flex items-center gap-1 text-[12px] text-mute">
              <Star size={11} className="text-acc" fill="currentColor" strokeWidth={0} />
              {r.rating} · {r.reviews} reviews
            </div>
          </div>
        </div>
      ))}
      {!climbed && (
        <div className="mt-1 flex items-center gap-3 rounded-[10px] border border-dashed border-line2 px-3 py-[10px]">
          <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-panel font-mono text-[11px] font-bold text-mute">
            7
          </span>
          <div className="min-w-0 flex-1">
            <div className="truncate text-[13.5px] font-semibold text-mute">
              {name}
            </div>
            <div className="flex items-center gap-1 text-[12px] text-mute">
              <Star size={11} className="text-mute" fill="currentColor" strokeWidth={0} />
              4.9 · 22 reviews · not in the pack
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
