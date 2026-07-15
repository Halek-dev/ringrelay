import type { Metadata } from "next";
import Link from "next/link";
import { Clock, Mic, ArrowRight } from "lucide-react";
import { Eyebrow } from "@/components/site/section";
import { DemoForm } from "@/components/site/demo-form";

export const metadata: Metadata = {
  title: "Book a Demo",
  description:
    "Hear it answer your calls. Fifteen minutes, no slides. We call the agent live and you throw your hardest customer scenarios at it.",
};

export default function ContactPage() {
  return (
    <section className="relative mx-auto grid max-w-[1160px] grid-cols-1 items-start gap-14 px-6 pb-24 pt-[88px] md:px-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-[72px]">
      {/* Left: pitch */}
      <div className="fade-1">
        <Eyebrow>04 · Book a demo</Eyebrow>
        <h1 className="mt-[26px] text-balance font-display text-[40px] font-extrabold leading-[1.04] tracking-[-0.035em] text-ink sm:text-[52px]">
          Hear it answer <span className="headline-em">your calls.</span>
        </h1>
        <p className="mt-[22px] max-w-[420px] text-pretty text-[18px] leading-[1.65] text-body">
          Fifteen minutes, no slides. We call the agent live, you throw your
          hardest customer scenarios at it.
        </p>

        <div className="mt-9 flex flex-col gap-[18px] border-t border-line pt-7">
          <div className="flex items-start gap-[13px]">
            <span className="grid h-[30px] w-[30px] shrink-0 place-items-center rounded-[9px] border border-ai-line bg-ai-bg2">
              <Clock size={15} strokeWidth={2.2} className="text-acc" />
            </span>
            <div>
              <div className="text-[15px] font-bold text-ink">
                We reply same business day
              </div>
              <div className="mt-[2px] text-[14px] text-body">
                Usually within the hour during work hours.
              </div>
            </div>
          </div>
          <div className="flex items-start gap-[13px]">
            <span className="grid h-[30px] w-[30px] shrink-0 place-items-center rounded-[9px] border border-ai-line bg-ai-bg2">
              <Mic size={15} strokeWidth={2.2} className="text-acc" />
            </span>
            <div>
              <div className="text-[15px] font-bold text-ink">
                Prefer to try it now?
              </div>
              <div className="mt-[2px] text-[14px] text-body">
                <Link
                  href="/demo"
                  className="inline-flex items-center gap-1 font-bold text-acc-dim hover:text-acc"
                >
                  Talk to the AI in your browser
                  <ArrowRight size={14} strokeWidth={2.4} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right: form */}
      <div className="fade-2">
        <DemoForm />
      </div>
    </section>
  );
}
