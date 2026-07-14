import { AGENCY, type Faq } from "@/lib/mock-data";

// TODO(phase 2): use the real production domain.
const SITE_URL = "https://ringrelay.com";

/**
 * Structured data for search engines. LocalBusiness improves how the agency
 * appears in results; FAQPage can surface the FAQ as rich snippets.
 */
export function JsonLd({ faqs }: { faqs: Faq[] }) {
  const data = [
    {
      "@context": "https://schema.org",
      "@type": "ProfessionalService",
      name: AGENCY.name,
      description:
        "AI voice receptionist that answers calls 24/7, books appointments, and texts summaries for HVAC, plumbing, and water-damage restoration businesses.",
      url: SITE_URL,
      telephone: AGENCY.demoPhone,
      email: AGENCY.email,
      areaServed: ["US", "CA"],
      slogan: AGENCY.tagline,
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faqs.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    },
  ];

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
