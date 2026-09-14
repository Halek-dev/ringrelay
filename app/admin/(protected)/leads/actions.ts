"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { assertProfile, assertOwner } from "@/lib/auth";
import { ok, fail, type ActionResult } from "@/lib/action-result";
import type {
  Lead,
  LeadIndustry,
  LeadStatus,
  LeadTier,
  OutreachChannel,
  QualificationAnswers,
  TouchType,
} from "@/lib/db-types";
import { parseCsvTier, TIER_RANK } from "@/lib/qualification";
import { parseCsv } from "@/lib/csv";
import { sendEmailBatch } from "@/lib/email/send";
import {
  substituteVars,
  OUTREACH_CTA,
  type EmailCta,
  type EmailVars,
} from "@/lib/email/layout";

// Add captures the basics only. New leads always start as "new".
export type NewLeadInput = {
  business_name: string;
  contact_name?: string;
  email?: string;
  phone: string;
  industry: LeadIndustry;
  city?: string;
  source?: string;
  notes?: string;
};

export async function createLead(
  input: NewLeadInput,
): Promise<ActionResult<Lead>> {
  const profile = await assertProfile();
  if (!input.business_name?.trim()) return fail("Business name is required.");
  if (!input.phone?.trim()) return fail("A phone number is required.");

  const supabase = createClient();
  const { data, error } = await supabase
    .from("leads")
    .insert({
      business_name: input.business_name.trim(),
      contact_name: input.contact_name?.trim() || null,
      email: input.email?.trim() || null,
      phone: input.phone.trim(),
      industry: input.industry,
      city: input.city?.trim() || null,
      source: input.source?.trim() || null,
      notes: input.notes?.trim() || null,
      status: "new",
      owner_id: profile.id,
    })
    .select("*")
    .single();

  if (error) return fail(error.message);
  revalidatePath("/admin/leads");
  revalidatePath("/admin");
  return ok(data as Lead);
}

/**
 * Log a real touch against a lead. This is the ONLY thing that moves the daily
 * plan's outreach counters (they are derived from these rows, never typed in).
 * A first touch also nudges the lead into the "contacted" pipeline stage.
 */
export async function logTouch(input: {
  leadId: string;
  touchType: TouchType;
  channel: OutreachChannel;
}): Promise<ActionResult> {
  const profile = await assertProfile();
  const supabase = createClient();

  const { error } = await supabase.from("outreach_log").insert({
    lead_id: input.leadId,
    profile_id: profile.id,
    touch_type: input.touchType,
    channel: input.channel,
  });
  if (error) return fail(error.message);

  // First touch on a qualified lead moves it into the pipeline.
  if (input.touchType === "first_touch") {
    await supabase
      .from("leads")
      .update({ status: "contacted", last_touch_at: new Date().toISOString() })
      .eq("id", input.leadId)
      .eq("status", "qualified");
  } else {
    await supabase
      .from("leads")
      .update({ last_touch_at: new Date().toISOString() })
      .eq("id", input.leadId);
  }

  revalidatePath("/admin/leads");
  revalidatePath("/admin");
  return ok();
}

/** Mark a logged touch as replied. Feeds the Replies KPI + reply-rate metric. */
export async function markTouchReplied(
  touchId: string,
  replied: boolean,
): Promise<ActionResult> {
  await assertProfile();
  const supabase = createClient();
  const { error } = await supabase
    .from("outreach_log")
    .update({ replied, replied_at: replied ? new Date().toISOString() : null })
    .eq("id", touchId);
  if (error) return fail(error.message);
  revalidatePath("/admin/leads");
  revalidatePath("/admin");
  return ok();
}

export async function updateLeadStatus(
  id: string,
  status: LeadStatus,
): Promise<ActionResult> {
  await assertProfile();
  const supabase = createClient();
  const { error } = await supabase
    .from("leads")
    .update({ status, last_touch_at: new Date().toISOString() })
    .eq("id", id);
  if (error) return fail(error.message);
  revalidatePath("/admin/leads");
  revalidatePath("/admin");
  return ok();
}

export async function deleteLead(id: string): Promise<ActionResult> {
  // RLS also enforces this, but check here for a clean error + early exit.
  await assertOwner();
  const supabase = createClient();
  const { error } = await supabase.from("leads").delete().eq("id", id);
  if (error) return fail(error.message);
  revalidatePath("/admin/leads");
  revalidatePath("/admin");
  return ok();
}

/* --------------------------- CSV import --------------------------- */

// Header aliases so a graded prospect list imports without the user renaming
// columns first. Matched case-insensitively. The list of fields is exactly what
// we pull out of a wide CSV: identity, contact, grade, and the personalized
// email. Everything else in the file is ignored.
const COLUMN_ALIASES: Record<string, string[]> = {
  business: ["company", "business", "business name", "business_name", "company name", "name", "org", "organization"],
  contact: ["owner_name", "owner name", "owner", "contact", "contact name", "contact_name", "full name", "person"],
  email: ["email", "email address", "e-mail", "emails", "work email"],
  phone: ["phone", "phone number", "telephone", "tel", "mobile", "cell"],
  city: ["city_region", "city region", "city", "town", "region"],
  industry: ["trade", "industry", "category", "type"],
  source: ["channel", "source", "lead source", "list"],
  tier: ["tier", "grade", "rating", "score"],
  country: ["country"],
  website: ["website", "url", "site", "web", "domain", "homepage"],
  subject: ["subject", "email subject", "subject line"],
  message: [
    "message",
    "outreach",
    "outreach message",
    "personalized message",
    "personalised message",
    "pitch",
    "email body",
    "body",
  ],
  external_id: ["lead_id", "lead id", "id", "external_id"],
};

function normEmail(v: string): string {
  return v.trim().toLowerCase();
}

/** Reduce a phone to its digits so "(555) 010-1234" and "5550101234" dedupe. */
function normPhone(v: string): string {
  return v.replace(/\D/g, "");
}

/** Map a free-text trade cell onto the LeadIndustry enum; default "other". */
function normIndustry(v: string): LeadIndustry {
  const s = v.trim().toLowerCase();
  if (!s) return "other";
  if (/(hvac|heat|cool|air|furnace|ac\b)/.test(s)) return "hvac";
  if (/roof/.test(s)) return "roofing";
  if (/plumb/.test(s)) return "plumbing";
  if (/electric/.test(s)) return "electrical";
  if (/(restor|water damage|mold|fire damage)/.test(s)) return "restoration";
  if (["hvac", "roofing", "plumbing", "electrical", "restoration", "other"].includes(s))
    return s as LeadIndustry;
  return "other";
}

export type ImportResult = {
  imported: number;
  skipped: number; // duplicates of a lead we already have
  failed: number; // rows with no company, or no email and no phone
  ungraded: number; // imported, but the tier cell was blank or unrecognized
  errors: string[]; // first few human-readable reasons, for the toast
};

/**
 * Import a graded prospect list from raw CSV text. It pulls exactly the fields
 * the lead needs (company, owner, email, website, country, grade, subject,
 * message) and ignores the rest of a wide export. The grade comes from the CSV
 * "tier" column (A / A-form -> A, B, C); there is no funnel. Rows that duplicate
 * an existing lead (by CSV lead_id, then email, then phone) are skipped, so
 * re-importing an updated list is safe.
 */
export async function importLeads(
  csvText: string,
): Promise<ActionResult<ImportResult>> {
  const profile = await assertProfile();

  const rows = parseCsv(csvText);
  if (rows.length < 2)
    return fail("The file needs a header row and at least one lead below it.");

  const header = rows[0].map((h) => h.trim().toLowerCase());
  const colOf = (key: string) =>
    header.findIndex((h) => COLUMN_ALIASES[key].includes(h));
  const col = {
    business: colOf("business"),
    contact: colOf("contact"),
    email: colOf("email"),
    phone: colOf("phone"),
    city: colOf("city"),
    industry: colOf("industry"),
    source: colOf("source"),
    tier: colOf("tier"),
    country: colOf("country"),
    website: colOf("website"),
    subject: colOf("subject"),
    message: colOf("message"),
    external_id: colOf("external_id"),
  };
  if (col.business < 0)
    return fail(
      'No company column found. The header row needs a column like "company" or "business".',
    );

  const supabase = createClient();

  // Dedupe against what we already hold: by the CSV's own lead_id (stored in
  // qualification.external_id), then email, then phone.
  const { data: existing } = await supabase
    .from("leads")
    .select("email, phone, qualification");
  const seenEmail = new Set<string>();
  const seenPhone = new Set<string>();
  const seenExtId = new Set<string>();
  for (const e of (existing ?? []) as {
    email: string | null;
    phone: string | null;
    qualification: QualificationAnswers | null;
  }[]) {
    if (e.email) seenEmail.add(normEmail(e.email));
    if (e.phone) seenPhone.add(normPhone(e.phone));
    const extId = e.qualification?.external_id;
    if (extId) seenExtId.add(extId.trim().toLowerCase());
  }

  type InsertRow = {
    business_name: string;
    contact_name: string | null;
    owner_name: string | null;
    email: string | null;
    phone: string | null;
    city: string | null;
    industry: LeadIndustry;
    source: string;
    status: LeadStatus;
    tier: LeadTier | null;
    score: number | null;
    outreach_message: string | null;
    qualification: QualificationAnswers;
    owner_id: string;
  };

  const toInsert: InsertRow[] = [];
  let skipped = 0;
  let failed = 0;
  let ungraded = 0;
  const errors: string[] = [];
  const pushError = (msg: string) => {
    if (errors.length < 5) errors.push(msg);
  };

  for (let r = 1; r < rows.length; r++) {
    const cell = (c: number) => (c >= 0 ? (rows[r][c] ?? "").trim() : "");
    const business = cell(col.business);
    if (!business) {
      failed++;
      pushError(`Row ${r + 1}: no company name.`);
      continue;
    }

    let email = cell(col.email);
    if (email && !email.includes("@")) email = ""; // ignore junk in the email cell
    const phone = cell(col.phone);
    if (!email && !phone) {
      failed++;
      pushError(`Row ${r + 1}: ${business} has no email or phone.`);
      continue;
    }

    const extId = cell(col.external_id);
    const en = email ? normEmail(email) : "";
    const pn = phone ? normPhone(phone) : "";
    const xid = extId ? extId.toLowerCase() : "";
    if (
      (xid && seenExtId.has(xid)) ||
      (en && seenEmail.has(en)) ||
      (pn && seenPhone.has(pn))
    ) {
      skipped++;
      continue;
    }
    if (xid) seenExtId.add(xid);
    if (en) seenEmail.add(en);
    if (pn) seenPhone.add(pn);

    const tier = parseCsvTier(cell(col.tier));
    if (!tier) ungraded++;

    const owner = cell(col.contact);
    const extras: QualificationAnswers = {};
    if (extId) extras.external_id = extId;
    if (cell(col.country)) extras.country = cell(col.country);
    if (cell(col.website)) extras.website = cell(col.website);
    if (cell(col.subject)) extras.subject = cell(col.subject);
    if (cell(col.industry)) extras.trade = cell(col.industry);

    toInsert.push({
      business_name: business,
      contact_name: owner || null,
      owner_name: owner || null,
      email: email || null,
      phone: phone || null,
      city: cell(col.city) || null,
      industry: normIndustry(cell(col.industry)),
      source: cell(col.source) || "CSV import",
      status: "new",
      tier,
      score: tier ? TIER_RANK[tier] : null,
      outreach_message: cell(col.message) || null,
      qualification: extras,
      owner_id: profile.id,
    });
  }

  if (toInsert.length > 0) {
    // Insert in chunks so a very large paste does not hit a statement limit.
    for (let i = 0; i < toInsert.length; i += 500) {
      const chunk = toInsert.slice(i, i + 500);
      const { error } = await supabase.from("leads").insert(chunk);
      if (error) return fail(error.message);
    }
    revalidatePath("/admin/leads");
    revalidatePath("/admin");
  }

  return ok({ imported: toInsert.length, skipped, failed, ungraded, errors });
}

/* --------------------------- bulk outreach email --------------------------- */

type LeadEmailRow = {
  id: string;
  business_name: string;
  contact_name: string | null;
  email: string | null;
  city: string | null;
  state: string | null;
};

function leadVars(lead: LeadEmailRow, sender: string): EmailVars {
  const first = (lead.contact_name ?? "").trim().split(/\s+/)[0] || "there";
  return {
    business: lead.business_name ?? "",
    contact: lead.contact_name ?? "",
    first_name: first,
    city: lead.city ?? "",
    state: lead.state ?? "",
    sender,
    demo_url: "https://tryringrelay.com/demo",
  };
}

/**
 * Send a batch of already-built emails, then log a touch on each lead that
 * actually sent and move the pre-contact ones into the pipeline. Shared by both
 * the shared-message and personalized outreach actions so their bookkeeping
 * never drifts apart. Only successful sends are advanced, so a partial failure
 * is safe to retry.
 */
async function dispatchLeadEmails(
  supabase: ReturnType<typeof createClient>,
  profileId: string,
  items: {
    ref: string;
    to: string;
    subject: string;
    bodyText: string;
    cta?: EmailCta;
    plain?: boolean;
  }[],
  touchType: TouchType,
): Promise<{ sent: number; failed: number; error?: string }> {
  const { successRefs, failedRefs, error } = await sendEmailBatch(items);

  if (successRefs.length > 0) {
    const now = new Date().toISOString();
    await supabase.from("outreach_log").insert(
      successRefs.map((id) => ({
        lead_id: id,
        profile_id: profileId,
        touch_type: touchType,
        channel: "email" as const,
      })),
    );
    await supabase
      .from("leads")
      .update({ status: "contacted", last_touch_at: now })
      .in("id", successRefs)
      .in("status", ["new", "in_progress", "qualified"]);
    await supabase
      .from("leads")
      .update({ last_touch_at: now })
      .in("id", successRefs);
  }

  return { sent: successRefs.length, failed: failedRefs.length, error };
}

/**
 * Send ONE shared message to many leads at once (used for follow-ups and custom
 * one-off sends). Each lead's {{business}}, {{first_name}}, {{city}} and
 * {{sender}} tokens are filled per recipient; tokens we cannot know for a batch
 * (a competitor name, a review count) are left blank, so those openers are meant
 * to be sent one at a time. Leads with no email address are skipped.
 */
export async function sendBulkLeadEmail(input: {
  leadIds: string[];
  subject: string;
  body: string;
  touchType: TouchType;
}): Promise<ActionResult<{ sent: number; failed: number; skipped: number }>> {
  const profile = await assertProfile();
  if (input.leadIds.length === 0) return fail("No leads selected.");
  if (!input.subject.trim()) return fail("Add a subject line.");
  if (!input.body.trim()) return fail("The message is empty.");

  const supabase = createClient();
  const { data: leads, error } = await supabase
    .from("leads")
    .select("id, business_name, contact_name, email, city, state")
    .in("id", input.leadIds);
  if (error) return fail(error.message);
  if (!leads || leads.length === 0) return fail("No leads found.");

  const withEmail = (leads as LeadEmailRow[]).filter((l) => l.email?.trim());
  const skipped = leads.length - withEmail.length;
  if (withEmail.length === 0)
    return fail("None of the selected leads have an email address.");

  const sender = profile.full_name?.trim() || "the Ring Relay team";
  const items = withEmail.map((l) => {
    const vars = leadVars(l, sender);
    return {
      ref: l.id,
      to: l.email as string,
      subject: substituteVars(input.subject, vars),
      bodyText: substituteVars(input.body, vars),
      cta: OUTREACH_CTA,
      plain: true,
    };
  });

  const { sent, failed, error: sendError } = await dispatchLeadEmails(
    supabase,
    profile.id,
    items,
    input.touchType,
  );
  if (sent === 0 && sendError) return fail(sendError);

  revalidatePath("/admin/leads");
  revalidatePath("/admin");
  return ok({ sent, failed, skipped });
}

/**
 * The one-click outreach send: each lead gets its OWN personalized message,
 * the one imported from the CSV "message" column and stored on the lead. A
 * shared subject line is filled per lead. Leads with no message, or no email,
 * are reported back rather than sent, so nothing goes out half-blank. Logged as
 * a first touch.
 */
export async function sendPersonalizedOutreach(input: {
  leadIds: string[];
  subject: string;
}): Promise<
  ActionResult<{
    sent: number;
    failed: number;
    skippedNoEmail: number;
    skippedNoMessage: number;
  }>
> {
  const profile = await assertProfile();
  if (input.leadIds.length === 0) return fail("No leads selected.");
  if (!input.subject.trim()) return fail("Add a subject line.");

  const supabase = createClient();
  const { data: leads, error } = await supabase
    .from("leads")
    .select(
      "id, business_name, contact_name, email, city, state, outreach_message, qualification",
    )
    .in("id", input.leadIds);
  if (error) return fail(error.message);
  if (!leads || leads.length === 0) return fail("No leads found.");

  const sender = profile.full_name?.trim() || "the Ring Relay team";
  let skippedNoEmail = 0;
  let skippedNoMessage = 0;
  const items: {
    ref: string;
    to: string;
    subject: string;
    bodyText: string;
    cta?: EmailCta;
    plain?: boolean;
  }[] = [];

  for (const l of leads as (LeadEmailRow & {
    outreach_message: string | null;
    qualification: QualificationAnswers | null;
  })[]) {
    const message = l.outreach_message?.trim();
    if (!l.email?.trim()) {
      skippedNoEmail++;
      continue;
    }
    if (!message) {
      skippedNoMessage++;
      continue;
    }
    // Prefer the lead's own subject from the CSV; the dialog's subject is the
    // fallback for any lead that did not carry one.
    const perLeadSubject = l.qualification?.subject?.trim();
    const vars = leadVars(l, sender);
    items.push({
      ref: l.id,
      to: l.email,
      subject: substituteVars(perLeadSubject || input.subject, vars),
      bodyText: substituteVars(message, vars),
      cta: OUTREACH_CTA,
      plain: true,
    });
  }

  if (items.length === 0)
    return fail(
      "Nothing to send: the selected leads have no personalized message, or no email.",
    );

  const { sent, failed, error: sendError } = await dispatchLeadEmails(
    supabase,
    profile.id,
    items,
    "first_touch",
  );
  if (sent === 0 && sendError) return fail(sendError);

  revalidatePath("/admin/leads");
  revalidatePath("/admin");
  return ok({ sent, failed, skippedNoEmail, skippedNoMessage });
}
