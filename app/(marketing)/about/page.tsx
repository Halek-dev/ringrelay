import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, PhoneMissed, Bot, Handshake } from "lucide-react";
import { Eyebrow } from "@/components/site/section";
import { Reveal } from "@/components/site/reveal";
import { TeamSection } from "@/components/site/team-section";
import { CtaBand } from "@/components/site/cta-band";

export const metadata: Metadata = {
  title: "About",
  description:
    "Ring Relay sets up AI phone receptionists for US home services businesses so missed calls stop turning into missed jobs.",
};

export const dynamic = "force-dynamic";

// Honesty rule: no invented history, headcount, client counts, or milestones.
// The story below claims only what is true of an early stage agency.
export default function AboutPage() {
  return (
    <>
      <section className="relative mx-auto max-w-[880px] px-6 pb-14 pt-[88px] text-center md:px-10">
        <div className="fade-1">
          <Eyebrow>About</Eyebrow>
        </div>
        <h1 className="fade-2 mt-[26px] text-balance font-display text-[42px] font-extrabold leading-[1.02] tracking-[-0.035em] text-ink sm:text-[54px]">
          Missed calls are <span className="headline-em">missed jobs.</span>
        </h1>
        <p className="fade-3 mx-auto mt-[22px] max-w-[620px] text-pretty text-[18px] leading-[1.65] text-body">
          Ring Relay is an agency founded in 2026. We set up AI phone
          receptionists for US home services businesses: plumbers, HVAC shops,
          and water damage restoration companies whose crews are on jobs when
          the phone rings.
        </p>
      </section>

      <section className="relative mx-auto max-w-[1080px] px-6 pb-[72px] md:px-10">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {[
            {
              icon: PhoneMissed,
              title: "The problem",
              body: "A tradesperson on a roof or under a sink cannot answer the phone. The caller does not leave a voicemail. They call the next company on the list, and that job is gone.",
            },
            {
              icon: Bot,
              title: "What we do",
              body: "We build and run an AI receptionist for each client. It answers every call, speaks naturally, filters spam, books real appointments into their calendar, and texts them a summary.",
            },
            {
              icon: Handshake,
              title: "How we work",
              body: "We are a small, remote first team, and we set every agent up by hand around the client's services, pricing, and schedule. Nothing goes live until the owner has heard it and signed off.",
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
            counts or a wall of logos. What we have is a working product you can{" "}
            <Link href="/demo" className="font-bold text-acc-dim underline hover:text-acc">
              try in your browser right now
            </Link>
            , a clear focus on one kind of customer, and the intention to grow
            by doing careful work for a small number of clients at a time. If
            that sounds like the kind of company you want answering your phone,
            we would like to talk.
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
        title="Want to hear it answer?"
        subtitle="Try the live demo in your browser. No signup, no phone call."
      />
    </>
  );
}
