"use client";

import { Analytics } from "@vercel/analytics/react";
import { useConsent } from "@/components/consent/consent-provider";

/**
 * Vercel Web Analytics, gated at the SOURCE by the consent context. The
 * component (and therefore its script) is not mounted at all until the
 * visitor opts in to the analytics category, so nothing loads, runs, or
 * phones home before explicit consent. Withdrawing consent unmounts it on
 * the next render.
 *
 * Vercel Web Analytics is cookieless (no cookies, no cross site tracking,
 * aggregated stats only). We still keep it behind the opt in because that is
 * what the consent banner promises, and promises should be boring and true.
 */
export function AnalyticsLoader() {
  const { hasConsent } = useConsent();
  if (!hasConsent("analytics")) return null;
  return <Analytics />;
}
