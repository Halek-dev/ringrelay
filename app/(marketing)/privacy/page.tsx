import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage, LegalSection, LegalList } from "@/components/site/legal-page";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How Ring Relay collects, uses, and protects personal data from contact forms, job applications, and website visitors.",
};

// GDPR requires a genuine, identifiable data controller and a real contact
// route. The controller details below are filled in; keep them current if the
// entity, email, or address ever changes. This page is the one place the
// controller's location legally belongs.

export default function PrivacyPage() {
  return (
    <LegalPage eyebrow="Legal" title="Privacy Policy" updated="July 2026">
      <LegalSection title="1. Who we are">
        <p>
          This website, ringrelay.com, is operated by Ringrelay
          (&quot;Ring Relay&quot;, &quot;we&quot;, &quot;us&quot;), the data
          controller for the personal data described in this policy. Registered
          address: Little Rock, Arkansas, USA. For anything related to your
          personal data, contact us at tryringrelay@gmail.com. We aim to answer
          within 30 days.
        </p>
      </LegalSection>

      <LegalSection title="2. What we collect and why">
        <p>We collect different data depending on how you use the site:</p>
        <LegalList
          items={[
            <span key="v">
              <strong className="text-ink">Website visitors.</strong> Strictly
              necessary cookies for security and session handling, and your
              cookie consent choice itself. With your opt in consent only, we
              also load cookieless, aggregated analytics (Vercel Web
              Analytics); see the cookie policy for exactly what that covers.
              We run no marketing trackers. Legal basis: legitimate interest in
              running a secure website, and consent for anything non essential.
            </span>,
            <span key="d">
              <strong className="text-ink">Demo users.</strong> The{" "}
              <Link href="/demo" className="font-bold text-acc-dim underline">
                /demo
              </Link>{" "}
              page is an interactive illustration that runs entirely in your
              browser. It uses no microphone and collects nothing. Anything you
              type there, such as a business name, is never sent to us or stored.
            </span>,
            <span key="c">
              <strong className="text-ink">Contact form.</strong> Name, business
              name, email, phone, trade, and your message, used to respond to
              your demo request. Legal basis: taking steps at your request
              before entering a contract.
            </span>,
            <span key="j">
              <strong className="text-ink">Job applicants.</strong> Name, email,
              phone, country and timezone, experience, availability, cover note,
              and your CV, used only for recruitment. Legal basis: consent
              (the checkbox on the application form) and taking steps at your
              request before entering a contract.
            </span>,
          ]}
        />
      </LegalSection>

      <LegalSection title="3. The interactive demo, in plain words">
        <p>
          The /demo page is a visual illustration of how Ring Relay works. It
          runs entirely in your browser, uses no microphone, and sends nothing
          to us. Any name you type is used only to personalize what you see on
          screen and is never transmitted or saved.
        </p>
      </LegalSection>

      <LegalSection title="4. How long we keep data">
        <LegalList
          items={[
            "Contact form submissions: up to 24 months after our last exchange.",
            "Job applications, including CVs: up to 12 months after the role closes, unless you are hired, in which case they move to your employment record. You can ask us to delete them sooner at any time.",
            "Cookie consent record: 12 months, after which we ask again.",
            "Client account and billing data: for the duration of the contract plus any legally required retention.",
          ]}
        />
      </LegalSection>

      <LegalSection title="5. Who we share data with">
        <p>
          We do not sell personal data. We share it only with the processors we
          need to run the service, under data processing agreements:
        </p>
        <LegalList
          items={[
            "Supabase (database, authentication, and file storage)",
            "Vercel (website hosting and cookieless analytics)",
            "Resend (sending transactional and recruitment emails)",
          ]}
        />
        <p>
          Some of these providers process data outside the EEA, mainly in the
          United States. Where that happens, transfers rely on appropriate
          safeguards such as EU Standard Contractual Clauses or an adequacy
          decision (including the EU-US Data Privacy Framework where the
          provider is certified).
        </p>
      </LegalSection>

      <LegalSection title="6. Your rights">
        <p>Under the GDPR you have the right to:</p>
        <LegalList
          items={[
            "Access the personal data we hold about you",
            "Have inaccurate data corrected",
            "Have your data erased",
            "Restrict how we process your data",
            "Receive your data in a portable format",
            "Object to processing based on legitimate interest",
            "Withdraw consent at any time, without affecting processing that already happened",
          ]}
        />
        <p>
          To exercise any of these, email tryringrelay@gmail.com. You also have
          the right to lodge a complaint with a data protection supervisory
          authority, either where you live or where you believe an infringement
          occurred.
        </p>
      </LegalSection>

      <LegalSection title="7. Cookies">
        <p>
          We use strictly necessary cookies and, only with your consent, the
          optional categories described in our{" "}
          <Link href="/cookies" className="font-bold text-acc-dim underline">
            cookie policy
          </Link>
          . You can change or withdraw your consent at any time via the
          &quot;Cookie preferences&quot; link in the footer.
        </p>
      </LegalSection>

      <LegalSection title="8. Changes to this policy">
        <p>
          If we change this policy in a way that matters, we will update the
          date at the top and, where the change affects consent, ask for your
          consent again.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
