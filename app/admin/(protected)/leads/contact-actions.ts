"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { assertProfile } from "@/lib/auth";
import { ok, fail, type ActionResult } from "@/lib/action-result";
import type { ContactChannel, ContactResult } from "@/lib/db-types";
import { rankChannels } from "@/lib/contact/shared";
import {
  CONTACT_PAGE_KEYWORDS,
  classifyEmail,
  extractEmails,
  findOwnerName,
  findSocials,
  guessedEmails,
  pageHasContactForm,
  scanSizeSignals,
} from "@/lib/contact/extract";

/**
 * Realistic expectations: this finds a viable channel for maybe half of small
 * trades businesses. Many genuinely do not publish an email, and when it finds
 * nothing the fallback is Facebook or a contact form. That is a normal outcome,
 * not a failure. This saves a few minutes of manual Ctrl+F per lead. It does
 * not conjure contact details that were never published.
 */

const MAX_PAGES = 5;
const PAGE_TIMEOUT_MS = 7000;
const CRAWL_DELAY_MS = 400;
const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

function normalizeUrl(raw: string): string | null {
  let u = raw.trim();
  if (!u) return null;
  if (!/^https?:\/\//i.test(u)) u = `https://${u}`;
  try {
    return new URL(u).toString();
  } catch {
    return null;
  }
}

async function fetchPage(
  url: string,
): Promise<{ ok: boolean; html: string; status: number }> {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), PAGE_TIMEOUT_MS);
    const res = await fetch(url, {
      signal: controller.signal,
      redirect: "follow",
      headers: { "user-agent": USER_AGENT, accept: "text/html" },
      cache: "no-store",
    });
    clearTimeout(timer);
    if (!res.ok) return { ok: false, html: "", status: res.status };
    const ct = res.headers.get("content-type") ?? "";
    if (!ct.includes("html")) return { ok: false, html: "", status: res.status };
    const html = (await res.text()).slice(0, 500_000);
    return { ok: true, html, status: res.status };
  } catch {
    return { ok: false, html: "", status: 0 };
  }
}

/** Minimal robots.txt read: does the `*` group disallow the site root? */
async function rootDisallowed(origin: string): Promise<boolean> {
  const r = await fetchPage(`${origin}/robots.txt`);
  if (!r.ok) return false; // fail open: no robots, or unreadable, means allowed
  let inStar = false;
  for (const lineRaw of r.html.split("\n")) {
    const line = lineRaw.trim().toLowerCase();
    if (line.startsWith("user-agent:")) {
      inStar = line.slice("user-agent:".length).trim() === "*";
    } else if (inStar && line.startsWith("disallow:")) {
      const path = line.slice("disallow:".length).trim();
      if (path === "/") return true;
    }
  }
  return false;
}

/** Same-origin contact/about links worth following from the homepage. */
function contactLinks(html: string, base: string): string[] {
  const baseHost = new URL(base).host;
  const out = new Set<string>();
  for (const m of html.matchAll(/href=["']([^"']+)["']/gi)) {
    const href = m[1];
    if (href.startsWith("mailto:") || href.startsWith("tel:")) continue;
    let abs: URL;
    try {
      abs = new URL(href, base);
    } catch {
      continue;
    }
    if (abs.host !== baseHost) continue;
    const probe = (abs.pathname + " " + href).toLowerCase();
    if (CONTACT_PAGE_KEYWORDS.some((k) => probe.includes(k))) {
      out.add(abs.toString().replace(/#.*$/, ""));
    }
  }
  return [...out];
}

export async function findContact(input: {
  leadId: string;
  url: string;
}): Promise<ActionResult<ContactResult>> {
  await assertProfile();
  const supabase = createClient();

  const start = normalizeUrl(input.url);
  if (!start) return fail("Enter a valid website URL.");

  const { data: lead, error: leadErr } = await supabase
    .from("leads")
    .select("business_name, contact_name, email")
    .eq("id", input.leadId)
    .single();
  if (leadErr || !lead) return fail("Lead not found.");

  const origin = new URL(start).origin;
  const domain = new URL(start).host.replace(/^www\./, "");

  const failedPages: string[] = [];
  let combinedHtml = "";
  let crawledPages = 0;
  const emailMap = new Map<string, string>(); // email -> how found
  let contactFormUrl: string | null = null;
  let socials = { facebook: null as string | null, linkedin: null as string | null, instagram: null as string | null };

  const blockedByRobots = await rootDisallowed(origin);

  if (!blockedByRobots) {
    // Homepage first, then its obvious contact pages.
    const home = await fetchPage(start);
    const queue: string[] = [start];
    if (home.ok) {
      for (const link of contactLinks(home.html, start)) {
        if (queue.length >= MAX_PAGES) break;
        if (!queue.includes(link)) queue.push(link);
      }
    } else {
      failedPages.push(start);
    }

    for (const pageUrl of queue.slice(0, MAX_PAGES)) {
      const page = pageUrl === start && home.ok ? home : await fetchPage(pageUrl);
      if (!page.ok) {
        if (pageUrl !== start) failedPages.push(pageUrl);
        continue;
      }
      crawledPages += 1;
      combinedHtml += "\n" + page.html;

      for (const e of extractEmails(page.html)) {
        if (!emailMap.has(e.value)) emailMap.set(e.value, e.found);
      }
      if (!contactFormUrl && pageHasContactForm(page.html)) contactFormUrl = pageUrl;

      const s = findSocials(page.html);
      socials = {
        facebook: socials.facebook ?? s.facebook,
        linkedin: socials.linkedin ?? s.linkedin,
        instagram: socials.instagram ?? s.instagram,
      };

      if (pageUrl !== start) await sleep(CRAWL_DELAY_MS);
    }
  }

  const ownerName =
    findOwnerName(combinedHtml, lead.business_name as string) ??
    ((lead.contact_name as string | null) || null);

  // Build ranked channels.
  const channels: ContactChannel[] = [];
  for (const [value, found] of emailMap) {
    channels.push({ kind: classifyEmail(value, ownerName), value, found, verified: true });
  }
  if (contactFormUrl) {
    channels.push({ kind: "contact_form", value: contactFormUrl, found: "page with a form", verified: true });
  }
  if (socials.facebook) channels.push({ kind: "facebook", value: socials.facebook, found: "page link", verified: true });
  if (socials.linkedin) channels.push({ kind: "linkedin", value: socials.linkedin, found: "page link", verified: true });
  if (socials.instagram) channels.push({ kind: "instagram", value: socials.instagram, found: "page link", verified: true });

  // Guessed role emails only when we found no real email at all.
  const foundRealEmail = channels.some(
    (c) => c.kind === "email_owner" || c.kind === "email_role",
  );
  if (!foundRealEmail) channels.push(...guessedEmails(domain));

  const ranked = rankChannels(channels);
  const sizeSignals = scanSizeSignals(combinedHtml);

  const result: ContactResult = {
    channels: ranked,
    ownerName,
    sizeWarning: sizeSignals.length >= 3,
    sizeSignals,
    crawledPages,
    failedPages,
    blockedByRobots,
    startUrl: start,
    ranAt: new Date().toISOString(),
  };

  // Save to the lead so it is never re-crawled by accident. Only fill `email`
  // when empty, with the best verified owner or role address.
  const bestEmail = ranked.find(
    (c) => c.kind === "email_owner" || c.kind === "email_role",
  )?.value;

  const update: Record<string, unknown> = {
    contact_form_url: contactFormUrl,
    facebook_url: socials.facebook,
    linkedin_url: socials.linkedin,
    owner_name: ownerName,
    contact_channels: result,
    contact_found_at: result.ranAt,
  };
  if (bestEmail && !lead.email) update.email = bestEmail;

  const { error: saveErr } = await supabase
    .from("leads")
    .update(update)
    .eq("id", input.leadId);
  if (saveErr) return fail(saveErr.message);

  revalidatePath("/admin/leads");
  return ok(result);
}
