import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage, LegalSection, LegalList } from "@/components/site/legal-page";

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "The terms that govern Ring Relay's AI receptionist service: setup, monthly retainer, the 90 day minimum, and what we do and do not promise.",
};

// Placeholders [LEGAL ENTITY NAME] and [GOVERNING LAW / JURISDICTION] must be
// filled with real details before launch.

export default function TermsPage() {
  return (
    <LegalPage eyebrow="Legal" title="Terms of Service" updated="July 2026">
      <LegalSection title="1. Who these terms are for">
        <p>
          These terms govern the services provided by [LEGAL ENTITY NAME]
          (&quot;Ring Relay&quot;, &quot;we&quot;) to business customers
          (&quot;you&quot;). Our service is sold to businesses, not consumers.
          By signing up, you confirm you are acting for a business.
        </p>
      </LegalSection>

      <LegalSection title="2. The service">
        <p>
          Ring Relay sets up and operates an AI powered phone receptionist for
          your business. It answers calls, holds natural conversations, filters
          spam, collects caller details, and books appointments according to the
          rules agreed with you during onboarding. We configure, test, and
          monitor the agent; you approve how it sounds before it answers a real
          customer.
        </p>
      </LegalSection>

      <LegalSection title="3. Fees and the 90 day minimum">
        <LegalList
          items={[
            "A one time setup fee, payable before onboarding begins, covering configuration, calendar and CRM connection, number setup, and live testing.",
            "A flat monthly retainer for your chosen tier, as published on the pricing page or agreed in writing. No per minute charges and no overage bills.",
            "A 90 day minimum term from go live. After 90 days you may cancel with effect from the next billing cycle, no cancellation fee.",
            "Fees are invoiced in advance and payable within 14 days. We may suspend the service for accounts more than 14 days overdue, after notice.",
            "Tier changes take effect the next billing cycle. No new setup fee unless locations are added.",
          ]}
        />
      </LegalSection>

      <LegalSection title="4. What we do not promise">
        <p>
          The receptionist is an automated system. It is good, and we monitor
          it, but no automated system is perfect. We do not guarantee that
          every call will be answered, transcribed, or handled correctly, that
          the service will be uninterrupted, or that any particular business
          outcome (bookings, revenue, answer rates) will be achieved. The agent
          never quotes prices or makes commitments on your behalf beyond the
          booking rules you approve.
        </p>
      </LegalSection>

      <LegalSection title="5. Your responsibilities">
        <LegalList
          items={[
            "Provide accurate business information (services, hours, service area, booking rules) and keep it current.",
            "Use the service lawfully, including any call recording and telemarketing rules that apply to your business and region.",
            "Not use the service to deceive callers, send spam, or handle categories of data we have not agreed to (for example medical or payment card data).",
            "Tell your callers about call handling and recording where the law requires it.",
          ]}
        />
      </LegalSection>

      <LegalSection title="6. Intellectual property">
        <p>
          We own the Ring Relay platform, configurations, prompts, and tooling.
          You own your business data: your customer details, bookings, call
          summaries, and transcripts, and we process them only to provide the
          service. On termination we will, on request, export your business
          data and then delete it within 60 days, except where the law requires
          longer retention.
        </p>
      </LegalSection>

      <LegalSection title="7. Liability">
        <p>
          To the fullest extent the law allows: our total liability under these
          terms in any 12 month period is capped at the fees you paid us in
          that period. We are not liable for indirect or consequential losses,
          including lost profits, lost bookings, or lost business
          opportunities. Nothing in these terms excludes liability that cannot
          legally be excluded.
        </p>
      </LegalSection>

      <LegalSection title="8. Termination">
        <p>
          Either party may terminate for material breach that is not fixed
          within 14 days of written notice. You may cancel any time after the
          90 day minimum, effective the next billing cycle. We may terminate or
          suspend immediately for unlawful use or non payment as described
          above.
        </p>
      </LegalSection>

      <LegalSection title="9. Data protection">
        <p>
          We process personal data as described in our{" "}
          <Link href="/privacy" className="font-bold text-acc-dim underline">
            privacy policy
          </Link>
          . Where we process personal data on your behalf as part of the
          service, a data processing agreement is available on request.
        </p>
      </LegalSection>

      <LegalSection title="10. General">
        <p>
          These terms are governed by the laws of [GOVERNING LAW /
          JURISDICTION], and its courts have exclusive jurisdiction. If any
          clause is found unenforceable, the rest stand. We may update these
          terms with reasonable notice; continued use after the notice period
          is acceptance.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
