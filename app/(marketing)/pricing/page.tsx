import type { Metadata } from "next";
import Link from "next/link";
import { Check } from "lucide-react";
import { Eyebrow } from "@/components/site/section";
import { Reveal } from "@/components/site/reveal";
import { FaqAccordion } from "@/components/site/faq-accordion";
import { CtaBand } from "@/components/site/cta-band";
import { PRICING_TIERS, COMPARE_ROWS, BILLING_FAQS } from "@/lib/mock-data";

export const metadata: Metadata = {
  title: "Pricing — Ring Relay",
  description:
    "One-time setup, flat monthly retainer. Three tiers for HVAC, plumbing, and restoration. No contracts.",
};

export default function PricingPage() {
  return (
    <>
      <section className="relative mx-auto max-w-[880px] px-6 pb-14 pt-[88px] text-center md:px-10">
        <div className="fade-1">
          <Eyebrow>02 · Pricing</Eyebrow>
        </div>
        <h1 className="fade-2 mt-[26px] text-balance font-display text-[42px] font-extrabold leading-[1.02] tracking-[-0.035em] text-ink sm:text-[58px]">
          Costs less than{" "}
          <span className="headline-em">one missed job.</span>
        </h1>
        <p className="fade-3 mx-auto mt-[22px] max-w-[560px] text-pretty text-[19px] leading-[1.65] text-body">
          One-time setup, flat monthly retainer. No contracts, no per-minute
          surprises. Cancel any month.
        </p>
      </section>

      {/* Tiers */}
      <section className="relative mx-auto max-w-[1280px] px-6 pb-[72px] md:px-10">
        <div className="grid grid-cols-1 items-stretch gap-6 md:grid-cols-3">
          {PRICING_TIERS.map((tier, i) => {
            const popular = tier.popular;
            return (
              <Reveal
                key={tier.id}
                delay={i * 80}
                className={
                  "relative flex flex-col rounded-[22px] p-[34px_30px] " +
                  (popular
                    ? "border-[1.5px] border-ink bg-ink shadow-[0_28px_64px_rgba(15,27,45,0.28)]"
                    : "border border-line2 bg-card shadow-soft")
                }
              >
                {popular && (
                  <div className="absolute left-1/2 top-[-13px] -translate-x-1/2 whitespace-nowrap rounded-[6px] bg-acc px-[14px] py-[6px] font-mono text-[10.5px] font-semibold tracking-[0.14em] text-white">
                    MOST POPULAR
                  </div>
                )}
                <div
                  className={
                    "mb-[6px] font-display text-[21px] font-bold tracking-[-0.02em] " +
                    (popular ? "text-white" : "text-ink")
                  }
                >
                  {tier.name}
                </div>
                <div
                  className={
                    "mb-[26px] min-h-[44px] text-[14.5px] leading-[1.5] " +
                    (popular ? "text-white/65" : "text-body")
                  }
                >
                  {tier.blurb}
                </div>
                <div className="flex items-baseline gap-2">
                  <span
                    className={
                      "font-display text-[46px] font-extrabold tracking-[-0.03em] " +
                      (popular ? "text-white" : "text-ink")
                    }
                  >
                    {tier.monthly}
                  </span>
                  <span
                    className={
                      "text-[15px] font-semibold " +
                      (popular ? "text-white/65" : "text-body")
                    }
                  >
                    /mo
                  </span>
                </div>
                <div className="mb-[26px] mt-2 font-mono text-[12px] font-semibold tracking-[0.06em] text-acc-dim">
                  + {tier.setup} one-time setup
                </div>
                <div
                  className={
                    "mb-[22px] h-px " +
                    (popular ? "bg-white/[0.12]" : "bg-line")
                  }
                />
                <ul className="flex flex-1 flex-col gap-3">
                  {tier.features.map((feat) => (
                    <li key={feat} className="flex items-start gap-[10px]">
                      <Check
                        size={16}
                        strokeWidth={2.6}
                        className="mt-[2.5px] shrink-0 text-acc"
                      />
                      <span
                        className={
                          "text-[14.5px] leading-[1.5] " +
                          (popular ? "text-white/85" : "text-bubble-ink")
                        }
                      >
                        {feat}
                      </span>
                    </li>
                  ))}
                </ul>
                <Link
                  href="/contact"
                  className={
                    "mt-7 inline-flex items-center justify-center gap-2 rounded-full px-6 py-[14px] text-[15.5px] font-bold transition-all duration-200 hover:-translate-y-0.5 hover:brightness-105 " +
                    (popular
                      ? "bg-acc text-white"
                      : "border-[1.5px] border-line2 text-ink")
                  }
                >
                  {tier.cta}
                </Link>
              </Reveal>
            );
          })}
        </div>
      </section>

      {/* Comparison table */}
      <section className="relative mx-auto max-w-[1080px] px-6 pb-[88px] md:px-10">
        <h2 className="mb-7 text-center font-display text-[28px] font-extrabold tracking-[-0.03em] text-ink sm:text-[34px]">
          Compare plans
        </h2>
        <div className="overflow-x-auto rounded-[18px] border border-line2 bg-card shadow-card">
          <div className="min-w-[640px]">
            <div className="grid grid-cols-[2.2fr_1fr_1fr_1fr] border-b border-line2 bg-panel px-[26px] py-4">
              <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-mute">
                Feature
              </span>
              <span className="text-center font-display text-[14.5px] font-bold text-ink">
                Starter
              </span>
              <span className="text-center font-display text-[14.5px] font-bold text-acc">
                Pro
              </span>
              <span className="text-center font-display text-[14.5px] font-bold text-ink">
                Multi-location
              </span>
            </div>
            {COMPARE_ROWS.map((row) => (
              <div
                key={row.label}
                className="grid grid-cols-[2.2fr_1fr_1fr_1fr] items-center border-b border-line px-[26px] py-[14px] last:border-b-0"
              >
                <span className="text-[14.5px] font-semibold text-bubble-ink">
                  {row.label}
                </span>
                <span className="text-center text-[14px] font-semibold text-body">
                  {row.starter}
                </span>
                <span className="mx-2 rounded-[8px] bg-ai-bg2 py-[6px] text-center text-[14px] font-semibold text-body">
                  {row.pro}
                </span>
                <span className="text-center text-[14px] font-semibold text-body">
                  {row.multi}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Billing FAQ */}
      <section className="relative mx-auto max-w-[760px] px-6 pb-[88px] md:px-10">
        <h2 className="mb-7 text-center font-display text-[28px] font-extrabold tracking-[-0.03em] text-ink sm:text-[34px]">
          Billing questions
        </h2>
        <FaqAccordion faqs={BILLING_FAQS} />
      </section>

      <CtaBand
        title="Not sure which tier fits?"
        subtitle="Tell us your call volume on the demo and we'll tell you straight."
      />
    </>
  );
}
