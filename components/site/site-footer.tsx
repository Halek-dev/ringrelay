import Link from "next/link";
import { Phone } from "lucide-react";
import { Logo } from "@/components/site/logo";
import { AGENCY, NAV_LINKS } from "@/lib/mock-data";

export function SiteFooter() {
  return (
    <footer className="relative z-10 border-t border-line bg-card/40">
      <div className="mx-auto max-w-[1280px] px-6 py-14 md:px-10">
        <div className="flex flex-col justify-between gap-10 md:flex-row">
          <div className="max-w-[320px]">
            <Logo href="/" />
            <p className="mt-4 text-[15px] leading-relaxed text-body">
              {AGENCY.tagline}
            </p>
            <a
              href={AGENCY.demoPhoneHref}
              className="mt-4 inline-flex items-center gap-2 text-[14.5px] font-bold text-acc-dim"
            >
              <Phone size={15} strokeWidth={2.2} className="text-acc" />
              {AGENCY.demoPhone}
            </a>
          </div>

          <div className="flex gap-16">
            <div>
              <div className="mb-4 font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-mute">
                Product
              </div>
              <ul className="flex flex-col gap-3">
                {NAV_LINKS.map((l) => (
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
                <li>
                  <a href={`mailto:${AGENCY.email}`} className="hover:text-ink">
                    Contact
                  </a>
                </li>
                <li className="text-mute">Privacy</li>
                <li className="text-mute">Terms</li>
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
