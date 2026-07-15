"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ArrowRight, Menu, X, Mic } from "lucide-react";
import { Logo } from "@/components/site/logo";
import { NAV_LINKS } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-nav backdrop-blur-[18px] backdrop-saturate-[1.4]">
      <div className="mx-auto flex max-w-[1280px] items-center justify-between px-6 py-4 md:px-10">
        <Logo href="/" />

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "inline-flex items-baseline gap-[7px] rounded-full px-[15px] py-[9px] text-[15px] font-semibold transition-all duration-150 hover:bg-panel hover:text-ink",
                  active ? "bg-panel text-ink" : "text-body",
                )}
              >
                <span className="font-mono text-[10px] text-acc">
                  {link.index}
                </span>
                {link.label}
              </Link>
            );
          })}
          <Link
            href="/demo"
            className={cn(
              "ml-[10px] inline-flex items-center gap-2 whitespace-nowrap rounded-full border-[1.5px] border-acc/50 px-[15px] py-[8px] text-[15px] font-bold text-acc-dim transition-all duration-150 hover:border-acc hover:bg-ai-bg2",
              pathname === "/demo" && "bg-ai-bg2",
            )}
          >
            <Mic size={15} strokeWidth={2.3} />
            Try the Demo
          </Link>
          <Link
            href="/contact"
            className="ml-[10px] inline-flex items-center gap-3 whitespace-nowrap rounded-full bg-ink py-2 pl-[22px] pr-2 text-[15px] font-bold text-bg transition-all duration-200 hover:-translate-y-px hover:bg-acc hover:text-white"
          >
            Book a Demo
            <span className="grid h-[30px] w-[30px] place-items-center rounded-full bg-acc">
              <ArrowRight size={14} strokeWidth={2.6} color="#fff" />
            </span>
          </Link>
        </nav>

        {/* Mobile toggle */}
        <button
          type="button"
          aria-label="Toggle menu"
          onClick={() => setOpen((v) => !v)}
          className="grid h-10 w-10 place-items-center rounded-full border border-line2 text-ink md:hidden"
        >
          {open ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <nav className="flex flex-col gap-1 border-t border-line bg-nav px-6 pb-5 pt-2 md:hidden">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className={cn(
                "inline-flex items-baseline gap-[7px] rounded-full px-4 py-3 text-[15px] font-semibold",
                pathname === link.href ? "bg-panel text-ink" : "text-body",
              )}
            >
              <span className="font-mono text-[10px] text-acc">
                {link.index}
              </span>
              {link.label}
            </Link>
          ))}
          <Link
            href="/demo"
            onClick={() => setOpen(false)}
            className="mt-2 inline-flex w-full items-center justify-center gap-2 whitespace-nowrap rounded-full border-[1.5px] border-acc/50 px-6 py-3 text-[15px] font-bold text-acc-dim"
          >
            <Mic size={16} strokeWidth={2.3} />
            Try the Demo
          </Link>
          <Link
            href="/contact"
            onClick={() => setOpen(false)}
            className="mt-2 inline-flex w-full items-center justify-center gap-3 whitespace-nowrap rounded-full bg-ink px-6 py-3 text-[15px] font-bold text-bg"
          >
            Book a Demo
            <ArrowRight size={16} strokeWidth={2.6} />
          </Link>
        </nav>
      )}
    </header>
  );
}
