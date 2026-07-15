import type { Metadata } from "next";
import { Eyebrow } from "@/components/site/section";
import { Timeline } from "@/components/site/timeline";
import { CtaBand } from "@/components/site/cta-band";
import { CALL_LIFECYCLE } from "@/lib/mock-data";

export const metadata: Metadata = {
  title: "How It Works",
  description:
    "One call, start to finish. Exactly what happens when a customer calls your number and you're on a job.",
};

export default function HowItWorksPage() {
  return (
    <>
      <section className="relative mx-auto max-w-[880px] px-6 pb-16 pt-[88px] text-center md:px-10">
        <div className="fade-1">
          <Eyebrow>01 · How it works</Eyebrow>
        </div>
        <h1 className="fade-2 mt-[26px] text-balance font-display text-[42px] font-extrabold leading-[1.02] tracking-[-0.035em] text-ink sm:text-[58px]">
          One call, start to finish.{" "}
          <span className="headline-em">No jargon.</span>
        </h1>
        <p className="fade-3 mx-auto mt-[22px] max-w-[560px] text-pretty text-[19px] leading-[1.65] text-body">
          Here&apos;s exactly what happens when a customer calls your number and
          you&apos;re elbow-deep in a job.
        </p>
      </section>

      <section className="relative mx-auto max-w-[880px] px-6 pb-20 md:px-10">
        <Timeline items={CALL_LIFECYCLE} />
      </section>

      <CtaBand
        title="Hear it answer a real call."
        subtitle="Fifteen minutes. We'll call your line live on the demo."
      />
    </>
  );
}
