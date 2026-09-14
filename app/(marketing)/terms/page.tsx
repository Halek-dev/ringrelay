import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage, LegalSection, LegalList } from "@/components/site/legal-page";

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "The terms that govern Ring Relay's automated review request service: the monthly fee, what we do and do not promise, and how we handle reviews honestly.",
};

// Entity and governing-law details are filled in; keep them current if the
// entity or jurisdiction ever changes.

export default function TermsPage() {
  return (
    <LegalPage eyebrow="Legal" title="Terms of Service" updated="July 2026">
      <LegalSection title="1. Who these terms are for">
        <p>
          These terms govern the services provided by Ringrelay
          (&quot;Ring Relay&quot;, &quot;we&quot;) to business customers
          (&quot;you&quot;). Our service is sold to businesses, not consumers.
          By signing up, you confirm you are acting for a business.
        </p>
      </LegalSection>

      <LegalSection title="2. The service">
        <p>
          Ring Relay sets up and operates an automated review request system for
          your business. After a completed job, it sends your customer a request
          to leave a Google review by text and email, with a follow-up, so you
          collect more recent reviews. We configure, test, and monitor it, and
          you approve how the messages sound before any go out.
        </p>
      </LegalSection>

      <LegalSection title="3. Fees">
        <LegalList
          items={[
            "A flat monthly fee, or an annual fee, as published on the pricing page or agreed in writing. A one-time setup fee may apply, and is waived for founding customers. No per-message charges.",
            "An initial minimum term of three months, then month to month. You may cancel anytime after the minimum term, with effect from the next billing cycle, and no cancellation fee.",
            "Fees are invoiced in advance and payable within 14 days. We may suspend the service for accounts more than 14 days overdue, after notice.",
            "Any founding-customer or promotional pricing, and any refund under a published guarantee, applies only on the terms stated when you sign up.",
          ]}
        />
      </LegalSection>

      <LegalSection title="4. What we do not promise">
        <p>
          Ring Relay sends review requests to the customers you provide. It is
          an automated system, and no automated system is perfect. We do not
          guarantee that every message will be delivered, that any customer will
          leave a review, that your ranking will improve, or that any particular
          business outcome (reviews, rankings, calls, revenue) will be achieved.
          We never write, fake, buy, or filter reviews, and we do not offer
          incentives in exchange for reviews.
        </p>
      </LegalSection>

      <LegalSection title="5. Your responsibilities">
        <LegalList
          items={[
            "Provide accurate business and customer information and keep it current.",
            "Only add customers who actually did business with you, and who you have a lawful basis to contact by text and email.",
            "Use the service lawfully, including any messaging and consent rules that apply to your business and region.",
            "Not use the service to solicit fake or incentivized reviews, or to contact people who did not do business with you.",
          ]}
        />
      </LegalSection>

      <LegalSection title="6. Intellectual property">
        <p>
          We own the Ring Relay platform, configurations, and tooling. You own
          your business data: your customer details and review activity, and we
          process them only to provide the service. On termination we will, on
          request, export your business data and then delete it within 60 days,
          except where the law requires longer retention.
        </p>
      </LegalSection>

      <LegalSection title="7. Liability">
        <p>
          To the fullest extent the law allows: our total liability under these
          terms in any 12 month period is capped at the fees you paid us in
          that period. We are not liable for indirect or consequential losses,
          including lost profits, lost reviews, or lost business
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
          These terms are governed by the laws of the State of Arkansas,
          United States, and the state and federal courts located in Arkansas
          have exclusive jurisdiction. If any clause is found unenforceable,
          the rest stand. We may update these
          terms with reasonable notice; continued use after the notice period
          is acceptance.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
