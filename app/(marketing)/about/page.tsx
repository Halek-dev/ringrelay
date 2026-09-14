import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Search, Star, Handshake } from "lucide-react";
import { Eyebrow } from "@/components/site/section";
import { Reveal } from "@/components/site/reveal";
import { TeamSection } from "@/components/site/team-section";
import { CtaBand } from "@/components/site/cta-band";

export const metadata: Metadata = {
  title: "About",
  description:
    "Ring Relay helps HVAC and roofing owners win the Google reviews that win the call, automatically after every job.",
};

export const dynamic = "force-dynamic";

// Honesty rule: no invented history, headcount, client counts, or milestones.
// The story below claims only what is true of an early-stage company.
export default function AboutPage() {
  return (
    <>
      <section className="relative mx-auto max-w-[880px] px-6 pb-14 pt-[88px] text-center md:px-10">
        <div className="fade-1">
          <Eyebrow>About</Eyebrow>
        </div>
        <h1 className="fade-2 mt-[26px] text-balance font-display text-[42px] font-extrabold leading-[1.02] tracking-[-0.035em] text-ink sm:text-[54px]">
          We win the reviews that{" "}
          <span className="headline-em">win the call.</span>
        </h1>
        <p className="fade-3 mx-auto mt-[22px] max-w-[620px] text-pretty text-[18px] leading-[1.65] text-body">
          Ring Relay is an early-stage company founded in 2026. We build one
          thing well: an automatic system that turns your happy customers into
          fresh 5-star Google reviews, so HVAC and roofing owners rank higher on
          the map and get more calls from the marketing they already pay for.
        </p>
      </section>

      <section className="relative mx-auto max-w-[1080px] px-6 pb-[72px] md:px-10">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {[
            {
              icon: Search,
              title: "The problem",
              body: "When a homeowner searches, they call one of the top three shops on the map. That spot goes to whoever has more recent 5-star reviews. Few or stale reviews and you lose the click you already paid for.",
            },
            {
              icon: Star,
              title: "What we do",
              body: "We ask every one of your customers for a Google review right after the job, by text and email, with a friendly follow-up. Happy customers leave reviews, you climb the rankings, and more people call.",
            },
            {
              icon: Handshake,
              title: "How we work",
              body: "We are a small, remote team. We set every account up ourselves, work with whatever software you have or none at all, and we never fake or buy reviews. We ask your real customers, the honest way.",
            },
          ].map((c, i) => (
            <Reveal key={c.title} delay={i * 80}>
              <div className="h-full rounded-[18px] border border-line2 bg-card p-7 shadow-soft">
                <span className="grid h-11 w-11 place-items-center rounded-[12px] border border-ai-line bg-ai-bg2 text-acc">
                  <c.icon size={20} strokeWidth={2.2} />
                </span>
                <h2 className="mt-4 font-display text-[19px] font-bold tracking-[-0.01em] text-ink">
                  {c.title}
                </h2>
                <p className="mt-2 text-[15px] leading-[1.65] text-body">{c.body}</p>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal className="mt-10 rounded-[18px] border border-line2 bg-card p-8 shadow-soft">
          <h2 className="font-display text-[22px] font-extrabold tracking-[-0.02em] text-ink">
            Where we are
          </h2>
          <p className="mt-3 max-w-[720px] text-[15.5px] leading-[1.7] text-body">
            We are early. We will not pretend otherwise with invented client
            counts or a wall of logos. What we have is a product that does one
            job well, a clear focus on one kind of customer, and the intention
            to grow by doing careful work for a small number of shops at a time.
            If that sounds like the kind of company you want in your corner, we
            would like to talk.
          </p>
          <Link
            href="/contact"
            className="mt-5 inline-flex items-center gap-2 font-bold text-acc-dim hover:text-acc"
          >
            Book a demo <ArrowRight size={15} strokeWidth={2.4} />
          </Link>
        </Reveal>
      </section>

      {/* Renders only when real, published team members exist. */}
      <TeamSection />

      <CtaBand
        title="Ready to be the top of the map?"
        subtitle="Book a short demo and we will show you your review gap against the top shop in your area."
      />
    </>
  );
}
