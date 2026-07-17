import Link from "next/link";
import { Mic } from "lucide-react";
import { Logo } from "@/components/site/logo";
import { AGENCY, NAV_LINKS } from "@/lib/mock-data";
import { CookiePreferencesLink } from "@/components/consent/consent-provider";

const COMPANY_LINKS = [
  { label: "About", href: "/about" },
  { label: "Careers", href: "/careers" },
];

const LEGAL_LINKS = [
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Terms of Service", href: "/terms" },
  { label: "Cookie Policy", href: "/cookies" },
];

export function SiteFooter() {
  return (
    <footer className="relative z-10 border-t border-line bg-card/40">
      <div className="mx-auto max-w-[1280px] px-6 py-14 md:px-10">
        <div className="flex flex-col justify-between gap-10 lg:flex-row">
          <div className="max-w-[320px]">
            <Logo href="/" />
            <p className="mt-4 text-[15px] leading-relaxed text-body">
              {AGENCY.tagline}
            </p>
            <Link
              href="/demo"
              className="mt-4 inline-flex items-center gap-2 text-[14.5px] font-bold text-acc-dim hover:text-acc"
            >
              <Mic size={15} strokeWidth={2.2} className="text-acc" />
              Try the live demo
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-10 sm:grid-cols-3 sm:gap-16">
            <div>
              <div className="mb-4 font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-mute">
                Product
              </div>
              <ul className="flex flex-col gap-3">
                <li>
                  <Link
                    href="/demo"
                    className="text-[15px] font-semibold text-acc-dim hover:text-acc"
                  >
                    Try the Demo
                  </Link>
                </li>
                {NAV_LINKS.filter((l) => l.href !== "/careers").map((l) => (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      className="text-[15px] font-semibold text-body hover:text-ink"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
                <li>
                  <Link
                    href="/contact"
                    className="text-[15px] font-semibold text-body hover:text-ink"
                  >
                    Book a Demo
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <div className="mb-4 font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-mute">
                Company
              </div>
              <ul className="flex flex-col gap-3 text-[15px] font-semibold text-body">
                {COMPANY_LINKS.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className="hover:text-ink">
                      {l.label}
                    </Link>
                  </li>
                ))}
                <li>
                  <a href={`mailto:${AGENCY.email}`} className="hover:text-ink">
                    Contact
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <div className="mb-4 font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-mute">
                Legal
              </div>
              <ul className="flex flex-col gap-3 text-[15px] font-semibold text-body">
                {LEGAL_LINKS.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className="hover:text-ink">
                      {l.label}
                    </Link>
                  </li>
                ))}
                <li>
                  <CookiePreferencesLink />
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col justify-between gap-3 border-t border-line pt-6 text-[13px] text-mute md:flex-row">
          <span>
            © {new Date().getFullYear()} {AGENCY.name}. Built for HVAC, Plumbing
            &amp; Restoration.
          </span>
          <span>Serving trades across the US &amp; Canada.</span>
        </div>
      </div>
    </footer>
  );
}
