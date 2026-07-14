"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { assertProfile, assertOwner } from "@/lib/auth";
import { ok, fail, type ActionResult } from "@/lib/action-result";
import type { Lead, LeadIndustry, LeadStatus } from "@/lib/db-types";

export type NewLeadInput = {
  business_name: string;
  contact_name?: string;
  email?: string;
  phone?: string;
  industry: LeadIndustry;
  city?: string;
  state?: string;
  status: LeadStatus;
  next_action?: string;
};

export async function createLead(
  input: NewLeadInput,
): Promise<ActionResult<Lead>> {
  const profile = await assertProfile();
  if (!input.business_name?.trim()) return fail("Business name is required.");

  const supabase = createClient();
  const { data, error } = await supabase
    .from("leads")
    .insert({
      business_name: input.business_name.trim(),
      contact_name: input.contact_name?.trim() || null,
      email: input.email?.trim() || null,
      phone: input.phone?.trim() || null,
      industry: input.industry,
      city: input.city?.trim() || null,
      state: input.state?.trim() || null,
      status: input.status,
      next_action: input.next_action?.trim() || null,
      owner_id: profile.id,
      last_touch_at: input.status === "new" ? null : new Date().toISOString(),
    })
    .select("*")
    .single();

  if (error) return fail(error.message);
  revalidatePath("/admin/leads");
  revalidatePath("/admin");
  return ok(data as Lead);
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
