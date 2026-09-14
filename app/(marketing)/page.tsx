import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { PrimaryCta, SecondaryCta } from "@/components/site/buttons";
import { ReviewHeroCard } from "@/components/site/review-hero-card";
import { Reveal } from "@/components/site/reveal";
import { Eyebrow } from "@/components/site/section";
import { FaqAccordion } from "@/components/site/faq-accordion";
import { CtaBand } from "@/components/site/cta-band";
import { Comparison } from "@/components/site/comparison";
import { Testimonials } from "@/components/site/testimonials";
import { JsonLd } from "@/components/site/json-ld";
import { Icon } from "@/components/icon";
import {
  HERO,
  PROBLEM_STATS,
  HOME_STEPS,
  FEATURES,
  INDUSTRIES,
  PLAN,
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

          <h1 className="fade-2 m-0 text-balance font-display text-[44px] font-extrabold leading-[1.02] tracking-[-0.035em] text-ink sm:text-[56px] lg:text-[68px] lg:leading-[1.02]">
            {HERO.headlinePre}{" "}
            <span className="headline-em">{HERO.headlineEm}</span>
          </h1>

          <p className="fade-3 mb-[42px] mt-7 max-w-[520px] text-pretty text-[18px] leading-[1.65] text-body lg:text-[19px]">
            {HERO.sub}
          </p>

          <div className="fade-4 mb-14 flex flex-col items-stretch gap-[12px] sm:flex-row sm:items-center">
            <PrimaryCta href="/contact" className="w-full sm:w-auto">
              Book a demo
            </PrimaryCta>
            <SecondaryCta href="/how-it-works" className="w-full sm:w-auto">
              See how it works
            </SecondaryCta>
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
          <ReviewHeroCard />
        </Reveal>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* Why reviews win                                                  */}
      {/* ---------------------------------------------------------------- */}
      <section className="relative mx-auto max-w-[1280px] px-6 py-16 md:px-10">
        <Reveal className="mb-12 max-w-[620px]">
          <Eyebrow>Why reviews win</Eyebrow>
          <h2 className="mt-4 text-balance font-display text-[34px] font-extrabold tracking-[-0.03em] text-ink">
            The business with the most reviews wins the call.
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

      {/* ---------------------------------------------------------------- */}
      {/* How it works (3 steps)                                           */}
      {/* ---------------------------------------------------------------- */}
      <section className="relative mx-auto max-w-[1280px] px-6 py-16 md:px-10">
        <Reveal className="mb-12 text-center">
          <Eyebrow>How it works</Eyebrow>
          <h2 className="mx-auto mt-4 max-w-[620px] text-balance font-display text-[34px] font-extrabold tracking-[-0.03em] text-ink">
            More 5-star reviews in three steps.
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
          <SecondaryCta href="/how-it-works">See the full walkthrough</SecondaryCta>
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* Features grid                                                    */}
      {/* ---------------------------------------------------------------- */}
      <section className="relative mx-auto max-w-[1280px] px-6 py-16 md:px-10">
        <Reveal className="mb-12 max-w-[620px]">
          <Eyebrow>Everything it does</Eyebrow>
          <h2 className="mt-4 text-balance font-display text-[34px] font-extrabold tracking-[-0.03em] text-ink">
            A review machine that runs itself.
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
            Built for local pros who live or die by the map.
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
      {/* Pricing teaser (one plan)                                        */}
      {/* ---------------------------------------------------------------- */}
      <section className="relative mx-auto max-w-[1280px] px-6 py-16 md:px-10">
        <Reveal className="mb-12 text-center">
          <Eyebrow>Simple pricing</Eyebrow>
          <h2 className="mx-auto mt-4 max-w-[620px] text-balance font-display text-[34px] font-extrabold tracking-[-0.03em] text-ink">
            One plan. One price. Cancel anytime.
          </h2>
          <p className="mx-auto mt-4 max-w-[520px] text-[17px] leading-[1.6] text-body">
            No setup fee, no contract, no per-message charges. One recovered job
            pays for years.
          </p>
        </Reveal>

        <Reveal className="mx-auto max-w-[440px]">
          <div className="relative flex flex-col rounded-[22px] border-[1.5px] border-ink bg-ink p-8 shadow-[0_28px_64px_rgba(15,27,45,0.28)]">
            <div className="font-display text-[21px] font-bold tracking-[-0.02em] text-white">
              {PLAN.name}
            </div>
            <div className="flex items-baseline gap-2 pt-4">
              <span className="font-display text-[52px] font-extrabold tracking-[-0.03em] text-white">
                {PLAN.price}
              </span>
              <span className="text-[15px] font-semibold text-white/65">
                {PLAN.cadence}
              </span>
            </div>
            <div className="mt-2 font-mono text-[12px] font-semibold tracking-[0.06em] text-white/60">
              {PLAN.valueLine}
            </div>
            <ul className="mt-6 flex flex-1 flex-col gap-3">
              {PLAN.features.slice(0, 5).map((feat) => (
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
        <div className="mt-8 text-center">
          <Link
            href="/pricing"
            className="inline-flex items-center gap-2 font-semibold text-acc-dim hover:text-acc"
          >
            See what is included <ArrowRight size={16} strokeWidth={2.4} />
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
        title="Ready to be the top of the map?"
        subtitle="Book a short demo and we will show you your review gap against the top shop in your area."
      />
    </>
  );
}
