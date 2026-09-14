import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Star } from "lucide-react";
import { Logo } from "@/components/site/logo";
import { BookCallForm } from "@/components/site/book-call-form";
import { CookiePreferencesLink } from "@/components/consent/consent-provider";

export const metadata: Metadata = {
  title: "Book a call",
  description:
    "Book a 15-minute call. See exactly how Ring Relay gets your shop more Google reviews from the jobs you already run.",
  robots: { index: false, follow: false },
};

export default function BookPage() {
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
        className="relative z-10 mx-auto max-w-[620px] px-6 pb-24 pt-8 md:px-10"
      >
        <div className="mb-8 text-center">
          <span className="font-mono text-[12px] font-semibold uppercase tracking-[0.16em] text-acc-dim">
            15-minute call
          </span>
          <h1 className="mx-auto mt-4 max-w-[520px] text-balance font-display text-[34px] font-extrabold leading-[1.05] tracking-[-0.035em] text-ink sm:text-[42px]">
            Pick a time that{" "}
            <span className="headline-em">works for you.</span>
          </h1>
          <p className="mx-auto mt-4 max-w-[500px] text-pretty text-[17px] leading-[1.6] text-body">
            We will show you exactly how Ring Relay turns your finished jobs into
            fresh 5-star Google reviews, on the ad spend you already have. No
            slides, no pressure.
          </p>
        </div>

        <BookCallForm />

        <div className="mt-8 flex items-center justify-center gap-2 text-[13.5px] text-mute">
          <span className="inline-flex text-acc" aria-hidden="true">
            <Star size={14} fill="currentColor" strokeWidth={0} />
            <Star size={14} fill="currentColor" strokeWidth={0} />
            <Star size={14} fill="currentColor" strokeWidth={0} />
            <Star size={14} fill="currentColor" strokeWidth={0} />
            <Star size={14} fill="currentColor" strokeWidth={0} />
          </span>
          Prefer to look first?{" "}
          <Link href="/demo" className="font-bold text-acc-dim hover:text-acc">
            See it work
          </Link>
        </div>
      </main>

      <footer className="relative z-10 mx-auto flex max-w-[620px] flex-wrap items-center justify-center gap-x-6 gap-y-2 px-6 pb-10 text-[13px] font-semibold text-mute md:px-10">
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
