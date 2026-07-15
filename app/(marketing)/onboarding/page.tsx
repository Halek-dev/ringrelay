import type { Metadata } from "next";
import { Clock, Check, Info } from "lucide-react";
import { Eyebrow } from "@/components/site/section";
import { Timeline } from "@/components/site/timeline";
import { CtaBand } from "@/components/site/cta-band";
import { ONBOARDING_STEPS, ONBOARDING_CHECKLIST } from "@/lib/mock-data";

export const metadata: Metadata = {
  title: "Onboarding",
  description:
    "From kickoff to answering live in about five business days. Here's the five-step onboarding journey.",
};

export default function OnboardingPage() {
  return (
    <>
      <section className="relative mx-auto max-w-[880px] px-6 pb-6 pt-[88px] text-center md:px-10">
        <div className="fade-1">
          <Eyebrow>03 · Onboarding</Eyebrow>
        </div>
        <h1 className="fade-2 mt-[26px] text-balance font-display text-[42px] font-extrabold leading-[1.02] tracking-[-0.035em] text-ink sm:text-[58px]">
          From kickoff to{" "}
          <span className="headline-em">answering live.</span>
        </h1>
        <p className="fade-3 mx-auto mb-9 mt-[22px] max-w-[560px] text-pretty text-[19px] leading-[1.65] text-body">
          Five steps. We do the heavy lifting; you keep running jobs.
        </p>
        <div className="fade-4 inline-flex items-center gap-[10px] rounded-full border border-ai-line bg-ai-bg2 px-5 py-[10px]">
          <Clock size={16} strokeWidth={2.2} className="text-acc" />
          <span className="font-mono text-[12.5px] font-semibold tracking-[0.08em] text-acc-dim">
            TYPICALLY LIVE IN ~5 BUSINESS DAYS
          </span>
        </div>
      </section>

      <section className="relative mx-auto grid max-w-[1160px] grid-cols-1 items-start gap-14 px-6 pb-20 pt-14 md:px-10 lg:grid-cols-[1.5fr_1fr]">
        <Timeline items={ONBOARDING_STEPS} />

        <div className="flex flex-col gap-5 lg:sticky lg:top-24">
          <div className="relative rounded-[20px] border border-line2 bg-card px-[26px] pb-[22px] pt-[26px] shadow-card">
            <div className="card-tag absolute left-6 top-[-13px]">
              WHAT WE NEED FROM YOU
            </div>
            <div className="flex flex-col gap-[14px] pt-2">
              {ONBOARDING_CHECKLIST.map((item) => (
                <div key={item.title} className="flex items-start gap-3">
                  <span className="mt-[1px] grid h-5 w-5 shrink-0 place-items-center rounded-[6px] border-[1.5px] border-ai-line bg-ai-bg2">
                    <Check size={12} strokeWidth={3} className="text-acc" />
                  </span>
                  <div>
                    <div className="text-[14.5px] font-bold text-ink">
                      {item.title}
                    </div>
                    <div className="mt-[2px] text-[13.5px] leading-[1.5] text-body">
                      {item.note}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-start gap-3 rounded-[16px] border border-line bg-panel px-[22px] py-[18px]">
            <Info
              size={17}
              strokeWidth={2.2}
              className="mt-[2px] shrink-0 text-acc"
            />
            <p className="text-[14px] leading-[1.6] text-body">
              Total hands-on time from you is about{" "}
              <strong className="text-ink">90 minutes</strong> across the five
              days. Everything else is on us.
            </p>
          </div>
        </div>
      </section>

      <CtaBand
        title="Day one starts with a call."
        subtitle="Book the demo and we'll map your call flow on the spot."
      />
    </>
  );
}
