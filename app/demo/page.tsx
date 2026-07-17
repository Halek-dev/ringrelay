import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Logo } from "@/components/site/logo";
import { VoiceDemo } from "@/components/demo/voice-demo";
import { CookiePreferencesLink } from "@/components/consent/consent-provider";
import { RECEPTIONIST } from "@/lib/demo/config";

export const metadata: Metadata = {
  title: "Talk to our AI receptionist",
  description:
    "Talk to a live AI receptionist right in your browser. It answers as a sample home-services company, qualifies the call, and books the appointment.",
  robots: { index: false, follow: false },
};

export default function DemoPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-bg">
      <div className="hazard-stripe relative z-[60] h-1" />
      <div className="blueprint-grid pointer-events-none absolute inset-0" />

      <header className="relative z-10 mx-auto flex max-w-[1000px] items-center justify-between px-6 py-4 md:px-10">
        <Logo href="/" />
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-[14px] font-semibold text-body hover:text-ink"
        >
          <ArrowLeft size={16} /> Back to site
        </Link>
      </header>

      <main
        id="main"
        className="relative z-10 mx-auto max-w-[880px] px-6 pb-24 pt-8 md:px-10"
      >
        <div className="mb-8 text-center">
          <span className="font-mono text-[12px] font-semibold uppercase tracking-[0.16em] text-acc-dim">
            Live browser demo
          </span>
          <h1 className="mx-auto mt-4 max-w-[620px] text-balance font-display text-[36px] font-extrabold leading-[1.05] tracking-[-0.035em] text-ink sm:text-[46px]">
            Talk to our <span className="headline-em">AI receptionist.</span>
          </h1>
          <p className="mx-auto mt-4 max-w-[560px] text-pretty text-[17px] leading-[1.6] text-body">
            It answers as <strong className="text-ink">{RECEPTIONIST.business}</strong>,
            a sample home-services company. Talk to it like a real customer.
            Describe a problem and let it book you in.
          </p>
        </div>

        <VoiceDemo />
      </main>

      <footer className="relative z-10 mx-auto flex max-w-[880px] flex-wrap items-center justify-center gap-x-6 gap-y-2 px-6 pb-10 text-[13px] font-semibold text-mute md:px-10">
        <Link href="/privacy" className="hover:text-ink">
          Privacy Policy
        </Link>
        <Link href="/terms" className="hover:text-ink">
          Terms of Service
        </Link>
        <Link href="/cookies" className="hover:text-ink">
          Cookie Policy
        </Link>
        <CookiePreferencesLink className="font-semibold text-mute" />
      </footer>
    </div>
  );
}
