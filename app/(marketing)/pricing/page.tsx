import type { Metadata } from "next";
import Link from "next/link";
import { Check } from "lucide-react";
import { Eyebrow } from "@/components/site/section";
import { Reveal } from "@/components/site/reveal";
import { FaqAccordion } from "@/components/site/faq-accordion";
import { CtaBand } from "@/components/site/cta-band";
import { PLAN, PRICING_FAQS } from "@/lib/mock-data";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "One simple plan at $97 a month. Everything included, no setup fee, no contract. Automatic Google reviews for HVAC and roofing pros.",
};

export default function PricingPage() {
  return (
    <>
      <section className="relative mx-auto max-w-[880px] px-6 pb-14 pt-[88px] text-center md:px-10">
        <div className="fade-1">
          <Eyebrow>02 · Pricing</Eyebrow>
        </div>
        <h1 className="fade-2 mt-[26px] text-balance font-display text-[42px] font-extrabold leading-[1.02] tracking-[-0.035em] text-ink sm:text-[58px]">
          Simple pricing.{" "}
          <span className="headline-em">One plan.</span>
        </h1>
        <p className="fade-3 mx-auto mt-[22px] max-w-[560px] text-pretty text-[19px] leading-[1.65] text-body">
          No setup fee, no contract, no per-message charges. One recovered job
          pays for years.
        </p>
      </section>

      {/* The plan */}
      <section className="relative mx-auto max-w-[480px] px-6 pb-[56px] md:px-10">
        <Reveal>
          <div className="relative flex flex-col rounded-[22px] border-[1.5px] border-ink bg-ink p-8 shadow-[0_28px_64px_rgba(15,27,45,0.28)]">
            <div className="font-display text-[22px] font-bold tracking-[-0.02em] text-white">
              {PLAN.name}
            </div>
            <div className="mt-1 text-[14.5px] leading-[1.5] text-white/65">
              {PLAN.blurb}
            </div>
            <div className="flex items-baseline gap-2 pt-5">
              <span className="font-display text-[56px] font-extrabold leading-none tracking-[-0.03em] text-white">
                {PLAN.price}
              </span>
              <span className="text-[16px] font-semibold text-white/65">
                {PLAN.cadence}
              </span>
            </div>
            <div className="mt-3 font-mono text-[12px] font-semibold tracking-[0.06em] text-white/60">
              {PLAN.valueLine}
            </div>
            <div className="my-6 h-px bg-white/[0.12]" />
            <ul className="flex flex-col gap-3">
              {PLAN.features.map((feat) => (
                <li key={feat} className="flex items-start gap-[10px]">
                  <Check size={16} strokeWidth={2.6} className="mt-[2.5px] shrink-0 text-acc" />
                  <span className="text-[14.5px] leading-[1.5] text-white/85">
                    {feat}
                  </span>
                </li>
              ))}
            </ul>
            <Link
              href="/contact"
              className="mt-7 inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full bg-acc px-6 py-[14px] text-[15.5px] font-bold text-white transition-all duration-200 hover:-translate-y-0.5 hover:brightness-105"
            >
              {PLAN.cta}
            </Link>
          </div>
        </Reveal>

        <div className="mx-auto mt-6 max-w-[440px] rounded-[16px] border border-acc/30 bg-acc/[0.06] px-5 py-4 text-center">
          <div className="font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-acc-dim">
            Founding customer offer
          </div>
          <p className="mt-2 text-[14px] leading-[1.6] text-body">
            {PLAN.foundingOffer}
          </p>
        </div>
      </section>

      {/* Pricing FAQ */}
      <section className="relative mx-auto max-w-[760px] px-6 pb-[88px] md:px-10">
        <h2 className="mb-7 text-center font-display text-[28px] font-extrabold tracking-[-0.03em] text-ink sm:text-[34px]">
          Common questions
        </h2>
        <FaqAccordion faqs={PRICING_FAQS} />
      </section>

      <CtaBand
        title="Ninety-seven dollars. One recovered job pays for years."
        subtitle="Book a short demo and we will show you your review gap against the top shop in your area."
      />
    </>
  );
}
