import Link from "next/link";
import { Mic } from "lucide-react";
import { Logo } from "@/components/site/logo";
import { PrimaryCta } from "@/components/site/buttons";

export default function NotFound() {
  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-bg">
      <div className="hazard-stripe relative z-[60] h-1" />
      <div className="blueprint-grid pointer-events-none absolute inset-0" />

      <header className="relative mx-auto flex w-full max-w-[1280px] items-center px-6 py-4 md:px-10">
        <Logo href="/" />
      </header>

      <main
        id="main"
        className="relative flex flex-1 flex-col items-center justify-center px-6 py-24 text-center"
      >
        <span className="font-mono text-[13px] font-semibold uppercase tracking-[0.16em] text-acc-dim">
          Error 404
        </span>
        <h1 className="mt-5 max-w-[620px] text-balance font-display text-[40px] font-extrabold leading-[1.04] tracking-[-0.035em] text-ink sm:text-[56px]">
          This line went{" "}
          <span className="headline-em">straight to voicemail.</span>
        </h1>
        <p className="mt-5 max-w-[440px] text-[17px] leading-[1.6] text-body">
          The page you were after doesn&apos;t exist or moved. Unlike a missed
          call, this one&apos;s easy to fix.
        </p>

        <div className="mt-9 flex flex-col items-center gap-4 sm:flex-row">
          <PrimaryCta href="/">Back to home</PrimaryCta>
          <Link
            href="/demo"
            className="inline-flex items-center gap-2 text-[15px] font-bold text-acc-dim hover:text-acc"
          >
            <Mic size={16} strokeWidth={2.2} />
            Or try the live demo
          </Link>
        </div>
      </main>
    </div>
  );
}
