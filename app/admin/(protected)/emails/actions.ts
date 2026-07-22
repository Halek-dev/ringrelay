"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { assertOwner } from "@/lib/auth";
import { ok, fail, type ActionResult } from "@/lib/action-result";
import { sendEmail } from "@/lib/email/send";
import { substituteVars } from "@/lib/email/layout";

const SAMPLE_VARS = {
  name: "Jane Doe",
  first_name: "Jane",
  role: "Customer Representative",
};

export async function saveEmailTemplate(input: {
  id: string;
  subject: string;
  body: string;
  is_active: boolean;
}): Promise<ActionResult> {
  await assertOwner();
  if (!input.subject?.trim()) return fail("A subject is required.");
  if (!input.body?.trim()) return fail("A body is required.");

  const supabase = createClient();
  const { error } = await supabase
    .from("email_templates")
    .update({
      subject: input.subject.trim(),
      body: input.body.trim(),
      is_active: input.is_active,
    })
    .eq("id", input.id);
  if (error) return fail(error.message);

  revalidatePath("/admin/emails");
  return ok();
}

/** Send the current (saved) template to the owner's own inbox with sample data. */
export async function sendTestEmail(templateId: string): Promise<ActionResult> {
  const profile = await assertOwner();
  if (!profile.email) return fail("Your account has no email address.");

  const supabase = createClient();
  const { data: template, error } = await supabase
    .from("email_templates")
    .select("subject, body")
    .eq("id", templateId)
    .single();
  if (error || !template) return fail("Template not found.");

  const sent = await sendEmail({
    to: profile.email,
    subject: `[Test] ${substituteVars(template.subject as string, SAMPLE_VARS)}`,
    bodyText: substituteVars(template.body as string, SAMPLE_VARS),
  });
  if (!sent.ok) return fail(sent.error);
  return ok();
}
