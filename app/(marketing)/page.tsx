import Link from "next/link";
import { Mic, ArrowRight, Check } from "lucide-react";
import { PrimaryCta, SecondaryCta } from "@/components/site/buttons";
import { LiveCallCard } from "@/components/site/live-call-card";
import { Reveal } from "@/components/site/reveal";
import { Eyebrow } from "@/components/site/section";
import { FaqAccordion } from "@/components/site/faq-accordion";
import { CtaBand } from "@/components/site/cta-band";
import { RoiCalculator } from "@/components/site/roi-calculator";
import { Comparison } from "@/components/site/comparison";
import { Testimonials } from "@/components/site/testimonials";
import { JsonLd } from "@/components/site/json-ld";
import { Icon } from "@/components/icon";
import {
  AGENCY,
  HERO,
  PROBLEM_STATS,
  HOME_STEPS,
  FEATURES,
  INDUSTRIES,
  PRICING_TIERS,
  HOME_FAQS,
} from "@/lib/mock-data";

export default function HomePage() {
  return (
    <>
      <JsonLd faqs={HOME_FAQS} />
      {/* ---------------------------------------------------------------- */}
      {/* Hero                                                             */}
      {/* ---------------------------------------------------------------- */}
      <section className="relative mx-auto grid max-w-[1280px] grid-cols-1 items-center gap-16 px-6 pb-24 pt-16 md:px-10 lg:grid-cols-[1.1fr_0.9fr] lg:gap-[76px] lg:pt-[84px]">
        {/* Corner glow (home only) */}
        <div className="pointer-events-none absolute right-[-120px] top-[-200px] h-[620px] w-[620px] rounded-full bg-[radial-gradient(circle,var(--glow)_0%,transparent_65%)]" />

        <div className="relative">
          <div className="fade-1 mb-[30px] inline-flex items-center gap-[10px]">
            <span className="relative h-[9px] w-[9px]">
              <span className="absolute inset-0 animate-pulseRing rounded-[2px] bg-ok" />
              <span className="absolute inset-0 rounded-[2px] bg-ok" />
            </span>
            <span className="font-mono text-[12px] font-semibold uppercase tracking-[0.14em] text-acc-dim">
              {HERO.eyebrow}
            </span>
          </div>

          <h1 className="fade-2 m-0 text-balance font-display text-[44px] font-extrabold leading-[1.02] tracking-[-0.035em] text-ink sm:text-[56px] lg:text-[72px] lg:leading-[1.0]">
            {HERO.headlinePre}{" "}
            <span className="headline-em">{HERO.headlineEm}</span>
          </h1>

          <p className="fade-3 mb-[42px] mt-7 max-w-[520px] text-pretty text-[18px] leading-[1.65] text-body lg:text-[19px]">
            {HERO.sub}
          </p>

          <div className="fade-4 mb-8 flex flex-col items-stretch gap-[12px] sm:flex-row sm:items-center">
            <PrimaryCta href="/contact" className="w-full sm:w-auto">
              Book a Demo
            </PrimaryCta>
            <SecondaryCta href="/how-it-works" className="w-full sm:w-auto">
              See How It Works
            </SecondaryCta>
          </div>

          <div className="mb-14">
            <Link
              href="/demo"
              className="inline-flex items-center gap-[9px] text-[14.5px] font-semibold text-acc-dim hover:text-acc"
            >
              <Mic size={15} strokeWidth={2.2} className="text-acc" />
              Try it yourself: talk to the AI right now
              <ArrowRight size={15} strokeWidth={2.4} />
            </Link>
          </div>

          <div className="fade-5 flex flex-wrap items-center gap-x-[22px] gap-y-3 border-t border-line pt-[26px]">
            <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-mute">
              Built for
            </span>
            <div className="flex flex-wrap gap-[10px]">
              {HERO.builtFor.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-2 rounded-full border border-line2 bg-chip px-4 py-2 font-display text-[13.5px] font-bold text-chip-ink"
                >
                  <span className="h-[6px] w-[6px] rounded-[1px] bg-acc" />
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>

        <Reveal className="relative">
          <LiveCallCard />
        </Reveal>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* Problem stats                                                    */}
      {/* ---------------------------------------------------------------- */}
      <section className="relative mx-auto max-w-[1280px] px-6 py-16 md:px-10">
        <Reveal className="mb-12 max-w-[620px]">
          <Eyebrow>The cost of a missed call</Eyebrow>
          <h2 className="mt-4 text-balance font-display text-[34px] font-extrabold tracking-[-0.03em] text-ink">
            The phone rings whether you can answer it or not.
          </h2>
        </Reveal>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {PROBLEM_STATS.map((stat, i) => (
            <Reveal
              key={stat.label}
              delay={i * 80}
              className="rounded-[20px] border border-line2 bg-gradient-to-b from-card to-card2 p-8 shadow-soft"
            >
              <div className="font-display text-[52px] font-extrabold leading-none tracking-[-0.03em] text-ink">
                {stat.value}
              </div>
              <div className="mt-4 font-display text-[17px] font-bold leading-snug text-ink">
                {stat.label}
              </div>
              <p className="mt-3 text-[15px] leading-[1.6] text-body">
                {stat.detail}
              </p>
            </Reveal>
          ))}
        </div>
      </section>

      <RoiCalculator />

      {/* ---------------------------------------------------------------- */}
      {/* How it works (3 steps)                                           */}
      {/* ---------------------------------------------------------------- */}
      <section className="relative mx-auto max-w-[1280px] px-6 py-16 md:px-10">
        <Reveal className="mb-12 text-center">
          <Eyebrow>How it works</Eyebrow>
          <h2 className="mx-auto mt-4 max-w-[620px] text-balance font-display text-[34px] font-extrabold tracking-[-0.03em] text-ink">
            One missed call becomes a booked job in three steps.
          </h2>
        </Reveal>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {HOME_STEPS.map((step, i) => (
            <Reveal
              key={step.num}
              delay={i * 80}
              className="relative rounded-[20px] border border-line2 bg-card p-8 shadow-soft"
            >
              <div className="grid h-[52px] w-[52px] place-items-center rounded-[14px] border-[1.5px] border-line2 bg-card font-mono text-[13px] font-semibold text-acc shadow-soft">
                {step.num}
              </div>
              <h3 className="mt-6 font-display text-[21px] font-bold tracking-[-0.02em] text-ink">
                {step.title}
              </h3>
              <p className="mt-3 text-[15px] leading-[1.6] text-body">
                {step.desc}
              </p>
            </Reveal>
          ))}
        </div>
        <div className="mt-10 text-center">
          <SecondaryCta href="/how-it-works">
            See the full call walkthrough
          </SecondaryCta>
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* Features grid                                                    */}
      {/* ---------------------------------------------------------------- */}
      <section className="relative mx-auto max-w-[1280px] px-6 py-16 md:px-10">
        <Reveal className="mb-12 max-w-[620px]">
          <Eyebrow>Everything it does</Eyebrow>
          <h2 className="mt-4 text-balance font-display text-[34px] font-extrabold tracking-[-0.03em] text-ink">
            A full front office on your phone line.
          </h2>
        </Reveal>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f, i) => (
            <Reveal
              key={f.title}
              delay={i * 60}
              className="group rounded-[20px] border border-line2 bg-card p-7 shadow-soft transition-all duration-200 hover:-translate-y-1 hover:border-acc/40"
            >
              <span className="grid h-[46px] w-[46px] place-items-center rounded-[12px] border border-ai-line bg-ai-bg2 text-acc">
                <Icon name={f.icon} size={21} />
              </span>
              <h3 className="mt-5 font-display text-[19px] font-bold tracking-[-0.01em] text-ink">
                {f.title}
              </h3>
              <p className="mt-2 text-[14.5px] leading-[1.6] text-body">
                {f.desc}
              </p>
            </Reveal>
          ))}
        </div>
      </section>

      <Comparison />

      {/* ---------------------------------------------------------------- */}
      {/* Who it's for                                                     */}
      {/* ---------------------------------------------------------------- */}
      <section className="relative mx-auto max-w-[1280px] px-6 py-16 md:px-10">
        <Reveal className="mb-12 text-center">
          <Eyebrow>Who it&apos;s for</Eyebrow>
          <h2 className="mx-auto mt-4 max-w-[620px] text-balance font-display text-[34px] font-extrabold tracking-[-0.03em] text-ink">
            Built for the trades that live on the phone.
          </h2>
        </Reveal>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {INDUSTRIES.map((ind, i) => (
            <Reveal
              key={ind.name}
              delay={i * 80}
              className="rounded-[20px] border border-line2 bg-gradient-to-b from-card to-card2 p-8 shadow-soft"
            >
              <span className="grid h-[52px] w-[52px] place-items-center rounded-[14px] bg-gradient-to-br from-acc-a to-acc-b text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.35)]">
                <Icon name={ind.icon} size={24} strokeWidth={2.4} />
              </span>
              <h3 className="mt-6 font-display text-[22px] font-bold tracking-[-0.02em] text-ink">
                {ind.name}
              </h3>
              <p className="mt-3 text-[15px] leading-[1.6] text-body">
                {ind.hook}
              </p>
            </Reveal>
          ))}
        </div>
      </section>

      <Testimonials />

      {/* ---------------------------------------------------------------- */}
      {/* Pricing teaser                                                   */}
      {/* ---------------------------------------------------------------- */}
      <section className="relative mx-auto max-w-[1280px] px-6 py-16 md:px-10">
        <Reveal className="mb-12 text-center">
          <Eyebrow>Simple pricing</Eyebrow>
          <h2 className="mx-auto mt-4 max-w-[620px] text-balance font-display text-[34px] font-extrabold tracking-[-0.03em] text-ink">
            One-time setup, flat monthly retainer.
          </h2>
          <p className="mx-auto mt-4 max-w-[520px] text-[17px] leading-[1.6] text-body">
            No per-minute surprises. Cancel anytime after 90 days. Costs less
            than one missed job.
          </p>
        </Reveal>

        <div className="grid grid-cols-1 items-stretch gap-6 md:grid-cols-3">
          {PRICING_TIERS.map((tier, i) => {
            const popular = tier.popular;
            return (
              <Reveal
                key={tier.id}
                delay={i * 80}
                className={
                  "relative flex flex-col rounded-[22px] p-8 " +
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
                    "font-display text-[21px] font-bold tracking-[-0.02em] " +
                    (popular ? "text-white" : "text-ink")
                  }
                >
                  {tier.name}
                </div>
                <div className="flex items-baseline gap-2 pt-4">
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
                <div className="mt-2 font-mono text-[12px] font-semibold tracking-[0.06em] text-acc-dim">
                  + {tier.setup} one-time setup
                </div>
                <ul className="mt-6 flex flex-1 flex-col gap-3">
                  {tier.features.slice(0, 4).map((feat) => (
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
                  href="/pricing"
                  className={
                    "mt-7 inline-flex items-center justify-center gap-2 rounded-full px-6 py-[13px] text-[15.5px] font-bold transition-all duration-200 hover:-translate-y-0.5 " +
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
        <div className="mt-10 text-center">
          <Link
            href="/pricing"
            className="inline-flex items-center gap-2 font-semibold text-acc-dim hover:text-acc"
          >
            Compare all plans <ArrowRight size={16} strokeWidth={2.4} />
          </Link>
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* FAQ                                                              */}
      {/* ---------------------------------------------------------------- */}
      <section className="relative mx-auto max-w-[760px] px-6 py-16 md:px-10">
        <Reveal className="mb-10 text-center">
          <Eyebrow>Straight answers</Eyebrow>
          <h2 className="mt-4 font-display text-[34px] font-extrabold tracking-[-0.03em] text-ink">
            Questions owners actually ask.
          </h2>
        </Reveal>
        <Reveal>
          <FaqAccordion faqs={HOME_FAQS} />
        </Reveal>
      </section>

      <CtaBand
        title="Stop losing jobs to voicemail."
        subtitle="Fifteen minutes. We'll call your line live on the demo."
      />
    </>
  );
}
