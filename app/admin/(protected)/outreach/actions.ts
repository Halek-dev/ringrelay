"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { assertOwner } from "@/lib/auth";
import { ok, fail, type ActionResult } from "@/lib/action-result";
import type { OutreachTemplate, TemplateCategory } from "@/lib/db-types";

// Editing templates is owner-gated (RLS enforces it too).
export async function updateTemplate(
  id: string,
  body: string,
): Promise<ActionResult> {
  await assertOwner();
  const supabase = createClient();
  const { error } = await supabase
    .from("outreach_templates")
    .update({ body })
    .eq("id", id);
  if (error) return fail(error.message);
  revalidatePath("/admin/outreach");
  return ok();
}

export async function createTemplate(input: {
  name: string;
  category: TemplateCategory;
  body: string;
}): Promise<ActionResult<OutreachTemplate>> {
  await assertOwner();
  if (!input.name.trim() || !input.body.trim())
    return fail("Name and body are required.");
  const supabase = createClient();
  const { data, error } = await supabase
    .from("outreach_templates")
    .insert({
      name: input.name.trim(),
      category: input.category,
      body: input.body,
    })
    .select("*")
    .single();
  if (error) return fail(error.message);
  revalidatePath("/admin/outreach");
  return ok(data as OutreachTemplate);
}

export async function deleteTemplate(id: string): Promise<ActionResult> {
  await assertOwner();
  const supabase = createClient();
  const { error } = await supabase
    .from("outreach_templates")
    .delete()
    .eq("id", id);
  if (error) return fail(error.message);
  revalidatePath("/admin/outreach");
  return ok();
}
