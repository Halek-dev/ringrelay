"use client";

import { useEffect, useRef, useState } from "react";
import { Star, TrendingUp, CheckCheck, ArrowUp } from "lucide-react";
import { REVIEW_HERO } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

/** Small full-color Google "G", for the "New Google review" label. */
function GoogleG() {
  return (
    <svg viewBox="0 0 24 24" className="h-[15px] w-[15px]" aria-hidden="true">
      <path fill="#4285F4" d="M22.5 12.2c0-.7-.1-1.4-.2-2H12v3.8h5.9a5 5 0 0 1-2.2 3.3v2.7h3.5c2-1.9 3.3-4.7 3.3-7.8z" />
      <path fill="#34A853" d="M12 23c3 0 5.4-1 7.2-2.7l-3.5-2.7c-1 .7-2.2 1-3.7 1-2.9 0-5.3-1.9-6.2-4.5H2.2v2.8A11 11 0 0 0 12 23z" />
      <path fill="#FBBC05" d="M5.8 14.1a6.6 6.6 0 0 1 0-4.2V7.1H2.2a11 11 0 0 0 0 9.8l3.6-2.8z" />
      <path fill="#EA4335" d="M12 5.4c1.6 0 3 .6 4.2 1.7l3.1-3.1A11 11 0 0 0 2.2 7.1l3.6 2.8C6.7 7.3 9.1 5.4 12 5.4z" />
    </svg>
  );
}

/**
 * Hero card: a review request going out, a 5-star review coming back, and the
 * Google profile climbing. Plays a short sequence when it scrolls into view and
 * loops gently; shows the finished frame for anyone with reduced motion.
 */
export function ReviewHeroCard() {
  const r = REVIEW_HERO;
  const [reqPre, reqPost] = r.request.body.split("{link}");
  const beforeReviews = r.ranking.before.reviews;
  const afterReviews = r.ranking.after.reviews;
  const delta = afterReviews - beforeReviews;

  // step: 0 idle · 1 request · 2 delivered · 3 review+stars · 4 rank · 5 flip · 6 delta
  const [step, setStep] = useState(0);
  const [count, setCount] = useState(beforeReviews);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = rootRef.current;
    if (!node) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      setStep(6);
      setCount(afterReviews);
      return;
    }

    let timers: ReturnType<typeof setTimeout>[] = [];
    let loopId: ReturnType<typeof setTimeout> | undefined;
    let raf = 0;
    const at = (ms: number, fn: () => void) => timers.push(setTimeout(fn, ms));

    function countUp() {
      const start = performance.now();
      const dur = 950;
      const frame = (now: number) => {
        const p = Math.min(1, (now - start) / dur);
        const eased = 1 - Math.pow(1 - p, 3);
        setCount(Math.round(beforeReviews + delta * eased));
        if (p < 1) raf = requestAnimationFrame(frame);
      };
      raf = requestAnimationFrame(frame);
    }

    function run() {
      timers.forEach(clearTimeout);
      timers = [];
      setStep(0);
      setCount(beforeReviews);
      at(250, () => setStep(1));
      at(1150, () => setStep(2));
      at(1750, () => setStep(3));
      at(2650, () => setStep(4));
      at(3050, () => {
        setStep(5);
        countUp();
      });
      at(3550, () => setStep(6));
      loopId = setTimeout(run, 7200);
    }

    let started = false;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !started) {
          started = true;
          run();
          io.disconnect();
        }
      },
      { threshold: 0.3 },
    );
    io.observe(node);

    return () => {
      io.disconnect();
      timers.forEach(clearTimeout);
      if (loopId) clearTimeout(loopId);
      cancelAnimationFrame(raf);
    };
  }, [beforeReviews, afterReviews, delta]);

  const stepIn = "opacity-100 translate-y-0";
  const stepOut = "opacity-0 translate-y-3";

  return (
    <div className="relative" ref={rootRef}>
      {/* Offset backing card */}
      <div className="pointer-events-none absolute inset-x-[-14px] bottom-[-14px] left-[14px] top-[14px] rotate-[1.6deg] rounded-[22px] border border-line bg-panel" />

      <div className="relative rounded-[22px] border border-line2 bg-gradient-to-b from-card to-card2 p-7 shadow-lift">
        <div className="card-tag absolute left-[26px] top-[-13px] inline-flex items-center gap-2">
          <span className="h-[6px] w-[6px] animate-blink rounded-full bg-acc" />
          REVIEW REQUEST
        </div>

        {/* Business header */}
        <div className="flex items-center gap-[14px] border-b border-line pb-[18px] pt-2">
          <div className="grid h-[46px] w-[46px] shrink-0 place-items-center rounded-full bg-gradient-to-br from-acc-a to-acc-b shadow-[inset_0_1px_0_rgba(255,255,255,0.35)]">
            <Star size={20} strokeWidth={2.4} color="#fff" fill="#fff" />
          </div>
          <div>
            <div className="font-display text-[15.5px] font-bold tracking-[-0.01em] text-ink">
              {r.business}
            </div>
            <div className="mt-[2px] text-[13px] text-mute">{r.when}</div>
          </div>
          <span className="ml-auto self-start rounded-[6px] border border-ai-line bg-ai-bg2 px-[7px] py-[3px] font-mono text-[9.5px] font-semibold uppercase tracking-[0.1em] text-acc-dim">
            Automatic
          </span>
        </div>

        {/* The request going out */}
        <div
          className={cn(
            "py-5 transition-all duration-500 ease-out",
            step >= 1 ? stepIn : stepOut,
          )}
        >
          <div className="mb-[7px] flex items-center justify-end gap-[6px]">
            <span className="h-[5px] w-[5px] rounded-[1px] bg-acc" />
            <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-acc-dim">
              Ring Relay · {r.request.channel}
            </span>
          </div>
          <div className="ml-auto max-w-[92%] rounded-[14px_14px_4px_14px] border border-ai-line bg-gradient-to-br from-ai-bg1 to-ai-bg2 px-4 py-3 text-[14.5px] leading-[1.55] text-ai-ink">
            {reqPre}
            <span className="font-semibold text-acc-dim underline">leave a review</span>
            {reqPost}
          </div>
          <div
            className={cn(
              "mt-[7px] flex items-center justify-end gap-[5px] text-[11px] font-semibold text-mute transition-opacity duration-300",
              step >= 2 ? "opacity-100" : "opacity-0",
            )}
          >
            <CheckCheck size={13} className="text-ok" /> Delivered
          </div>
        </div>

        {/* The 5-star review that comes back */}
        <div
          className={cn(
            "overflow-hidden rounded-[14px] border border-line bg-panel transition-all duration-500 ease-out",
            step >= 3 ? stepIn : stepOut,
          )}
        >
          <div className="flex items-center gap-[9px] border-b border-line px-4 py-[11px]">
            <div className="flex gap-[2px]">
              {Array.from({ length: r.result.stars }).map((_, i) => (
                <span
                  key={i}
                  className={cn(
                    "inline-flex transition-all duration-300",
                    step >= 3 ? "scale-100 opacity-100" : "scale-50 opacity-0",
                  )}
                  style={{
                    transitionDelay: `${i * 90}ms`,
                    transitionTimingFunction: "cubic-bezier(.3,1.5,.5,1)",
                  }}
                >
                  <Star size={14} fill="currentColor" strokeWidth={0} style={{ color: "#f5a623" }} />
                </span>
              ))}
            </div>
            <span className="ml-auto inline-flex items-center gap-[6px] font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-mute">
              <GoogleG /> New Google review
            </span>
          </div>
          <div className="px-4 py-[14px]">
            <p className="text-[14.5px] leading-[1.55] text-bubble-ink">
              &ldquo;{r.result.quote}&rdquo;
            </p>
            <div className="mt-[11px] flex items-center gap-2">
              <span className="grid h-[22px] w-[22px] place-items-center rounded-full bg-gradient-to-br from-[#6b7a90] to-[#48566c] text-[10px] font-extrabold text-white">
                {r.result.author.charAt(0)}
              </span>
              <span className="text-[12.5px] font-bold text-ink">{r.result.author}</span>
              <span className="text-[11.5px] text-mute">· just now</span>
            </div>
          </div>
        </div>

        {/* Ranking metric tile */}
        <div
          className={cn(
            "mt-4 rounded-[14px] border border-ok/30 bg-ok/[0.06] px-4 py-[14px] transition-all duration-500 ease-out",
            step >= 4 ? stepIn : stepOut,
          )}
        >
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-[12px] bg-ok text-white">
              <TrendingUp size={19} strokeWidth={2.4} />
            </span>
            <div className="leading-none">
              <div className="font-mono text-[9.5px] font-semibold uppercase tracking-[0.14em] text-mute">
                Map rank
              </div>
              <div className="mt-[6px] flex items-baseline gap-2">
                <span className="relative block h-[26px] overflow-hidden">
                  <span
                    className={cn(
                      "block transition-transform duration-[600ms]",
                      step >= 5 ? "-translate-y-[26px]" : "translate-y-0",
                    )}
                    style={{ transitionTimingFunction: "cubic-bezier(.3,.8,.2,1)" }}
                  >
                    <span className="flex h-[26px] items-center font-display text-[22px] font-extrabold tracking-[-0.02em] text-mute">
                      {r.ranking.before.rank}
                    </span>
                    <span className="flex h-[26px] items-center font-display text-[22px] font-extrabold tracking-[-0.02em] text-ink">
                      {r.ranking.after.rank}
                    </span>
                  </span>
                </span>
                <span className="text-[13px] font-bold text-ink">on the map</span>
              </div>
            </div>
            <div className="ml-auto text-right">
              <div className="font-mono text-[15px] font-bold tabular-nums text-ink">
                {count} reviews
              </div>
              <div
                className={cn(
                  "mt-1 inline-flex items-center gap-[3px] text-[12px] font-bold text-ok transition-all duration-300",
                  step >= 6 ? "translate-y-0 opacity-100" : "translate-y-1 opacity-0",
                )}
              >
                <ArrowUp size={12} strokeWidth={3} /> +{delta}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
