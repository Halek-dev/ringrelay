import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage, LegalSection, LegalList } from "@/components/site/legal-page";
import { CookiePreferencesLink } from "@/components/consent/consent-provider";

export const metadata: Metadata = {
  title: "Cookie Policy",
  description:
    "The cookies this site sets, what they do, how long they last, and how to change your consent.",
};

// This page must always match what the consent banner actually controls. If a
// category or cookie is added, update both this page and lib/consent/config.ts
// and bump CONSENT_VERSION so visitors are asked again.

export default function CookiesPage() {
  return (
    <LegalPage eyebrow="Legal" title="Cookie Policy" updated="July 2026">
      <LegalSection title="How consent works here">
        <p>
          On your first visit a banner offers three equal choices: accept all,
          reject all, or customize by category. Nothing optional is set before
          you opt in. Your choice is stored on your device with a timestamp and
          a version number, and if this policy changes meaningfully we ask
          again. You can change or withdraw consent at any time:{" "}
          <CookiePreferencesLink className="font-bold text-acc-dim underline hover:text-acc" />
          .
        </p>
      </LegalSection>

      <LegalSection title="Strictly necessary">
        <p>
          These make the site work and cannot be switched off. What we actually
          set today:
        </p>
        <LegalList
          items={[
            <span key="1">
              <strong className="text-ink">Supabase auth cookies</strong>{" "}
              (names starting with sb-): keep team members signed in to the
              internal admin console. Set only when someone signs in. Lifetime:
              session to a few days.
            </span>,
            <span key="2">
              <strong className="text-ink">rr-cookie-consent</strong> (browser
              localStorage, not a cookie): stores your consent choice, its
              timestamp, and the policy version. Lifetime: 12 months, then we
              ask again.
            </span>,
          ]}
        />
      </LegalSection>

      <LegalSection title="Analytics">
        <p>
          Off by default. If you opt in, we load{" "}
          <strong className="text-ink">Vercel Web Analytics</strong>: aggregated
          page view statistics (pages visited, referrer, country, device type).
          It sets <strong className="text-ink">no cookies</strong> and does not
          identify or track you across sites; visits are counted with a
          privacy preserving hash that is discarded daily. The script does not
          load at all until you opt in, and withdrawing consent stops it
          loading again. Data lives with Vercel for up to 24 months in
          aggregate form.
        </p>
      </LegalSection>

      <LegalSection title="Marketing">
        <p>
          Off by default. We set no marketing or advertising cookies today.
          Same rule: if that ever changes, the cookies will be listed here
          first and blocked until you opt in.
        </p>
      </LegalSection>

      <LegalSection title="More">
        <p>
          How we handle personal data generally, including the browser demo,
          is covered in the{" "}
          <Link href="/privacy" className="font-bold text-acc-dim underline">
            privacy policy
          </Link>
          .
        </p>
      </LegalSection>
    </LegalPage>
  );
}
