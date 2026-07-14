"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { assertProfile, assertOwner } from "@/lib/auth";
import { ok, fail, type ActionResult } from "@/lib/action-result";
import type { Client, ClientPlan, LeadIndustry } from "@/lib/db-types";

export async function toggleOnboardingStep(
  stepId: string,
  clientId: string,
  isComplete: boolean,
): Promise<ActionResult<{ setupStatus: "onboarding" | "live" }>> {
  await assertProfile();
  const supabase = createClient();

  const { error: stepErr } = await supabase
    .from("onboarding_steps")
    .update({
      is_complete: isComplete,
      completed_at: isComplete ? new Date().toISOString() : null,
    })
    .eq("id", stepId);
  if (stepErr) return fail(stepErr.message);

  // Flip the client to "live" once every step is done (and back if reopened).
  const { data: steps, error: stepsErr } = await supabase
    .from("onboarding_steps")
    .select("is_complete")
    .eq("client_id", clientId);
  if (stepsErr) return fail(stepsErr.message);

  const allDone =
    (steps?.length ?? 0) > 0 &&
    (steps as { is_complete: boolean }[]).every((s) => s.is_complete);
  const setupStatus = allDone ? "live" : "onboarding";

  const { error: clientErr } = await supabase
    .from("clients")
    .update({
      setup_status: setupStatus,
      go_live_date: allDone
        ? new Date().toISOString().slice(0, 10)
        : null,
    })
    .eq("id", clientId);
  if (clientErr) return fail(clientErr.message);

  revalidatePath("/admin/clients");
  revalidatePath("/admin");
  return ok({ setupStatus });
}

export type NewClientInput = {
  business_name: string;
  contact_name?: string;
  email?: string;
  phone?: string;
  industry: LeadIndustry;
  plan: ClientPlan;
  mrr: number;
  lead_id?: string;
};

export async function createClientRecord(
  input: NewClientInput,
): Promise<ActionResult<Client>> {
  await assertProfile();
  if (!input.business_name?.trim()) return fail("Business name is required.");

  const supabase = createClient();
  // The DB trigger auto-seeds the 5 onboarding steps for this client.
  const { data, error } = await supabase
    .from("clients")
    .insert({
      business_name: input.business_name.trim(),
      contact_name: input.contact_name?.trim() || null,
      email: input.email?.trim() || null,
      phone: input.phone?.trim() || null,
      industry: input.industry,
      plan: input.plan,
      mrr: input.mrr,
      lead_id: input.lead_id || null,
    })
    .select("*")
    .single();

  if (error) return fail(error.message);
  revalidatePath("/admin/clients");
  revalidatePath("/admin");
  return ok(data as Client);
}

export async function deleteClientRecord(id: string): Promise<ActionResult> {
  await assertOwner();
  const supabase = createClient();
  const { error } = await supabase.from("clients").delete().eq("id", id);
  if (error) return fail(error.message);
  revalidatePath("/admin/clients");
  revalidatePath("/admin");
  return ok();
}
