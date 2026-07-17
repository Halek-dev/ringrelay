/**
 * Cookie consent configuration. Client-safe.
 *
 * Compliance rules this implements (do not weaken them):
 * - Nothing non essential loads before explicit opt in. Scripts are gated at
 *   the source through the consent context, not loaded and then "respected".
 * - Reject is exactly as easy and prominent as Accept.
 * - Consent is granular per category, freely given, and revocable any time
 *   via the footer "Cookie preferences" link.
 * - Nothing is pre ticked. Everything except strictly necessary defaults off.
 * - The stored choice records a timestamp and the consent text version. When
 *   CONSENT_VERSION changes, visitors are asked again.
 */

/** Bump this whenever the consent text or categories change meaningfully. */
// v2: the analytics category now actually contains a tool (Vercel Web
// Analytics, cookieless, loaded only after opt in), so earlier consent is
// stale and visitors are asked again.
export const CONSENT_VERSION = 2;

export const CONSENT_STORAGE_KEY = "rr-cookie-consent";

export type OptionalCategory = "analytics" | "marketing";

export type ConsentState = {
  version: number;
  timestamp: string; // ISO date of the choice
  categories: Record<OptionalCategory, boolean>;
};

export const CATEGORY_INFO: {
  key: OptionalCategory | "necessary";
  name: string;
  alwaysOn: boolean;
  description: string;
}[] = [
  {
    key: "necessary",
    name: "Strictly necessary",
    alwaysOn: true,
    description:
      "Required for the site to work: security, session handling for the admin console, and storing your consent choice itself. These cannot be switched off.",
  },
  {
    key: "analytics",
    name: "Analytics",
    alwaysOn: false,
    description:
      "If you allow it, we load Vercel Web Analytics to see aggregated page view stats (which pages are visited, from which country, on what device). It is cookieless and does not track you across sites. Nothing loads unless you opt in.",
  },
  {
    key: "marketing",
    name: "Marketing",
    alwaysOn: false,
    description:
      "Would be used for advertising measurement. We currently set no marketing cookies at all; this switch exists so that if we ever add them, they stay off until you opt in.",
  },
];

export const REJECTED_ALL: ConsentState["categories"] = {
  analytics: false,
  marketing: false,
};

export const ACCEPTED_ALL: ConsentState["categories"] = {
  analytics: true,
  marketing: true,
};
