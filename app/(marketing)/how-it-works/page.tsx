import type { Metadata } from "next";
import { Eyebrow } from "@/components/site/section";
import { Timeline } from "@/components/site/timeline";
import { CtaBand } from "@/components/site/cta-band";
import { REVIEW_FLOW } from "@/lib/mock-data";

export const metadata: Metadata = {
  title: "How It Works",
  description:
    "From a finished job to a fresh 5-star review, on its own. Exactly what Ring Relay does after every visit.",
};

export default function HowItWorksPage() {
  return (
    <>
      <section className="relative mx-auto max-w-[880px] px-6 pb-16 pt-[88px] text-center md:px-10">
        <div className="fade-1">
          <Eyebrow>01 · How it works</Eyebrow>
        </div>
        <h1 className="fade-2 mt-[26px] text-balance font-display text-[42px] font-extrabold leading-[1.02] tracking-[-0.035em] text-ink sm:text-[58px]">
          More reviews, more calls,{" "}
          <span className="headline-em">without lifting a finger.</span>
        </h1>
        <p className="fade-3 mx-auto mt-[22px] max-w-[560px] text-pretty text-[19px] leading-[1.65] text-body">
          Getting reviews by hand means remembering to ask, chasing people, and
          copying links. Ring Relay does all of it automatically after every
          job.
        </p>
      </section>

      <section className="relative mx-auto max-w-[880px] px-6 pb-20 md:px-10">
        <Timeline items={REVIEW_FLOW} />
        <p className="mx-auto mt-10 max-w-[560px] text-center text-[15.5px] leading-[1.65] text-body">
          You approve how the messages sound before a single one goes out. Then
          it runs on its own.
        </p>
      </section>

      <CtaBand
        title="See it work for your shop."
        subtitle="Book a short demo and we will show you your review gap against the top shop in your area."
      />
    </>
  );
}
