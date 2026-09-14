import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Logo } from "@/components/site/logo";
import { ReviewDemo } from "@/components/demo/review-demo";
import { CookiePreferencesLink } from "@/components/consent/consent-provider";

export const metadata: Metadata = {
  title: "See it work",
  description:
    "Watch a finished job turn into a fresh 5-star Google review and a higher map ranking. An interactive demo of how Ring Relay works.",
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
            Interactive demo
          </span>
          <h1 className="mx-auto mt-4 max-w-[620px] text-balance font-display text-[36px] font-extrabold leading-[1.05] tracking-[-0.035em] text-ink sm:text-[46px]">
            Watch a review turn into{" "}
            <span className="headline-em">a higher ranking.</span>
          </h1>
          <p className="mx-auto mt-4 max-w-[560px] text-pretty text-[17px] leading-[1.6] text-body">
            Put in your business name and hit run. This is exactly what happens
            after every job, on its own.
          </p>
        </div>

        <ReviewDemo />

        <div className="mt-10 text-center">
          <Link
            href="/contact"
            className="inline-flex items-center gap-3 whitespace-nowrap rounded-full bg-ink py-[10px] pl-[24px] pr-[10px] text-[15px] font-bold text-bg transition-all hover:-translate-y-px hover:bg-acc hover:text-white"
          >
            Book a demo for your shop
            <span className="grid h-[30px] w-[30px] place-items-center rounded-full bg-acc">
              <ArrowRight size={14} strokeWidth={2.6} color="#fff" />
            </span>
          </Link>
        </div>
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
