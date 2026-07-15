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
import {
  computeScore,
  computeTier,
  deriveStatus,
  killInfo,
} from "@/lib/qualification";

// Add captures the basics only. Status is NOT set here — new leads always
// start as "new" and the qualification funnel drives status from there.
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
      next_action: "Run qualification funnel",
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
 * Save the qualification-funnel answers for a lead. Recomputes score, tier, and
 * the funnel-driven status server-side (never trust client-computed values) and
 * writes them back so the list can sort hottest-first.
 */
export async function saveQualification(
  leadId: string,
  industry: LeadIndustry,
  answers: QualificationAnswers,
): Promise<ActionResult<{ score: number; tier: LeadTier; status: LeadStatus }>> {
  await assertProfile();
  const supabase = createClient();

  // Score and status are always recomputed server-side, never trusted from
  // the client, so a lead's tier is reproducible from its stored answers.
  const score = computeScore(answers, industry);
  const tier = computeTier(score);
  const status = deriveStatus(answers);
  const kill = killInfo(answers);

  const { error } = await supabase
    .from("leads")
    .update({
      qualification: answers,
      score,
      tier,
      status,
      killed_at_step: kill?.step ?? null,
      kill_reason: kill?.reason ?? null,
      last_touch_at: new Date().toISOString(),
    })
    .eq("id", leadId);

  if (error) return fail(error.message);
  revalidatePath("/admin/leads");
  revalidatePath("/admin");
  return ok({ score, tier, status });
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
