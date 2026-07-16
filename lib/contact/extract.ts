import "server-only";
import type { ContactChannel, ContactChannelKind } from "@/lib/db-types";

/**
 * Pure extraction rules for the contact crawler. No fetching happens here, just
 * parsing HTML that the crawler already pulled. Kept separate so the rules are
 * easy to reason about and test.
 */

/** Role inboxes that reach a desk, not a person. */
const ROLE_PREFIXES = new Set([
  "info", "office", "service", "services", "contact", "admin", "sales",
  "support", "hello", "team", "dispatch", "scheduling", "schedule", "billing",
  "accounts", "help", "mail", "inquiries", "enquiries", "estimate", "estimates",
  "customerservice", "care",
]);

/** Emails at these domains are platform or analytics noise, never a real lead. */
const JUNK_DOMAINS = [
  "sentry.io", "sentry-next.wixpress.com", "wixpress.com", "wix.com",
  "godaddy.com", "secureserver.net", "squarespace.com", "example.com",
  "example.org", "domain.com", "yourdomain.com", "email.com", "sentry.wixpress.com",
  "cloudflare.com", "googleapis.com", "schema.org", "w3.org", "adobe.com",
];

const PLACEHOLDER_LOCALS = ["you", "your", "name", "email", "user", "username", "firstname", "lastname", "example"];

const EMAIL_RE = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;

export function isJunkEmail(raw: string): boolean {
  const e = raw.toLowerCase().trim();
  const at = e.indexOf("@");
  if (at < 1) return true;
  const local = e.slice(0, at);
  const domain = e.slice(at + 1);
  if (!domain.includes(".")) return true;
  if (JUNK_DOMAINS.some((d) => domain === d || domain.endsWith("." + d))) return true;
  // Image filenames that happen to contain @ (e.g. logo@2x.png).
  if (/\.(png|jpe?g|gif|webp|svg|ico|css|js)$/i.test(e)) return true;
  // Long hex ids from CMS/analytics.
  if (/^[0-9a-f]{16,}$/.test(local)) return true;
  if (PLACEHOLDER_LOCALS.includes(local)) return true;
  if (domain.includes("example")) return true;
  return false;
}

function htmlToText(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/\s+/g, " ")
    .trim();
}

/** Reconstruct obfuscated addresses: info [at] domain [dot] com, info(at)x.com. */
function extractObfuscated(text: string): string[] {
  const out: string[] = [];
  const re =
    /([a-z0-9._%+-]+)\s*(?:\[\s*at\s*\]|\(\s*at\s*\)|\s+at\s+|@)\s*([a-z0-9.-]+?)\s*(?:\[\s*dot\s*\]|\(\s*dot\s*\)|\s+dot\s+|\.)\s*([a-z]{2,})/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    out.push(`${m[1]}@${m[2]}.${m[3]}`.toLowerCase());
  }
  return out;
}

/** All non-junk emails from one page, tagged with how they were found. */
export function extractEmails(
  html: string,
): { value: string; found: string }[] {
  const seen = new Set<string>();
  const results: { value: string; found: string }[] = [];

  const push = (value: string, found: string) => {
    const v = value.toLowerCase().trim();
    if (isJunkEmail(v) || seen.has(v)) return;
    seen.add(v);
    results.push({ value: v, found });
  };

  // mailto: links first, they are the most reliable.
  const mailtoRe = /mailto:([^"'?>\s]+)/gi;
  let mm: RegExpExecArray | null;
  while ((mm = mailtoRe.exec(html)) !== null) {
    push(decodeURIComponent(mm[1]), "mailto link");
  }

  const text = htmlToText(html);
  for (const e of text.match(EMAIL_RE) ?? []) push(e, "page text");
  for (const e of extractObfuscated(text)) push(e, "obfuscated");

  return results;
}

export function classifyEmail(
  email: string,
  ownerName: string | null,
): ContactChannelKind {
  const local = email.slice(0, email.indexOf("@")).toLowerCase();
  const base = local.replace(/[._-].*$/, ""); // first token before . _ -
  if (ROLE_PREFIXES.has(local) || ROLE_PREFIXES.has(base)) return "email_role";
  if (ownerName) {
    const first = ownerName.split(/\s+/)[0]?.toLowerCase();
    if (first && local.includes(first)) return "email_owner";
  }
  return "email_owner";
}

/** Guessed role inboxes when nothing was found. Clearly unverified. */
export function guessedEmails(domain: string): ContactChannel[] {
  return ["info", "office", "service"].map((p) => ({
    kind: "email_guessed" as const,
    value: `${p}@${domain}`,
    found: "guessed",
    verified: false,
  }));
}

/** Does this page contain a real contact form (email or message field)? */
export function pageHasContactForm(html: string): boolean {
  const forms = html.match(/<form[\s\S]*?<\/form>/gi) ?? [];
  return forms.some(
    (f) =>
      /type=["']?email/i.test(f) ||
      /<textarea/i.test(f) ||
      /name=["'](email|message|comments?|your-message|your-email)["']/i.test(f),
  );
}

function cleanUrl(u: string): string {
  return u.replace(/[?#].*$/, "").replace(/\/$/, "");
}

/** First Facebook / LinkedIn / Instagram profile link on the page. */
export function findSocials(html: string): {
  facebook: string | null;
  linkedin: string | null;
  instagram: string | null;
} {
  const hrefs = [...html.matchAll(/href=["']([^"']+)["']/gi)].map((m) => m[1]);
  const pick = (host: RegExp, bad: RegExp) => {
    const hit = hrefs.find((h) => host.test(h) && !bad.test(h));
    return hit ? cleanUrl(hit.startsWith("http") ? hit : `https://${hit}`) : null;
  };
  return {
    facebook: pick(/facebook\.com\//i, /sharer|\/plugins|\/tr\?|facebook\.com\/(events|groups)\//i),
    linkedin: pick(/linkedin\.com\/(company|in|pub)\//i, /\/shareArticle|\/sharing/i),
    instagram: pick(/instagram\.com\//i, /\/p\/|\/explore\//i),
  };
}

const TITLE_RE =
  /\b(owner|founder|co-founder|president|ceo|proprietor)\b/i;

/** Try to name a person: a title near a name, then a personal business name. */
export function findOwnerName(
  html: string,
  businessName: string,
): string | null {
  const text = htmlToText(html);

  // "Owner: Mike Hansen" or "Mike Hansen, Owner"
  const after = text.match(
    /\b(?:owner|founder|co-founder|president|ceo|proprietor)\b[\s:,-]+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/,
  );
  if (after && !TITLE_RE.test(after[1])) return after[1];

  const before = text.match(
    /([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)[\s,-]+(?:owner|founder|president|ceo|proprietor)\b/,
  );
  if (before) return before[1];

  return ownerFromBusinessName(businessName);
}

/** A personal name embedded in the business name, e.g. "Mike's Plumbing". */
export function ownerFromBusinessName(name: string): string | null {
  const poss = name.match(/^([A-Z][a-z]+)['’]s\b/);
  if (poss) return poss[1];
  const family = name.match(/^([A-Z][a-z]+)\s+Family\b/i);
  if (family) return family[1];
  const sons = name.match(/^([A-Z][a-z]+)\s+(?:&|and)\s+Sons\b/i);
  if (sons) return sons[1];
  return null;
}

const SIZE_SIGNALS: { label: string; patterns: string[] }[] = [
  { label: "Team or careers page", patterns: ["our team", "meet the team", "meet our team", "careers", "we're hiring", "we are hiring", "now hiring", "join our team"] },
  { label: "Runs ops software", patterns: ["servicetitan", "housecall pro", "housecallpro", "jobber"] },
  { label: "Online booking widget", patterns: ["book online", "schedule online", "book now", "request service online", "schedule service online"] },
  { label: "Live chat widget", patterns: ["live chat", "chat with us", "tawk.to", "intercom", "drift.com", "podium"] },
];

/** Size and sophistication tells found across the crawled pages. */
export function scanSizeSignals(html: string): string[] {
  const text = htmlToText(html).toLowerCase();
  const found: string[] = [];
  for (const s of SIZE_SIGNALS) {
    if (s.patterns.some((p) => text.includes(p))) found.push(s.label);
  }
  return found;
}

/** The obvious contact/about pages worth following from a homepage. */
export const CONTACT_PAGE_KEYWORDS = [
  "contact", "about", "about-us", "aboutus", "team", "meet-the-team",
  "meet-our-team", "staff", "our-team", "get-in-touch", "estimate", "quote",
];
