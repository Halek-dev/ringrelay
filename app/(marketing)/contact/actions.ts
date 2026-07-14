"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { ok, fail, type ActionResult } from "@/lib/action-result";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const RATE_LIMIT_MS = 60_000;

export type ContactInput = {
  name: string;
  business: string;
  phone: string;
  email: string;
  industry: string;
  message: string;
};

/**
 * Public demo-request form. Anonymous visitors may INSERT (RLS allows it) but
 * never read submissions. A light rate-limit rejects the same email twice
 * inside 60s to blunt accidental double-submits and basic spam.
 */
export async function submitContact(
  input: ContactInput,
): Promise<ActionResult> {
  const name = input.name?.trim();
  const email = input.email?.trim().toLowerCase();

  if (!name) return fail("Please enter your name.");
  if (!input.business?.trim()) return fail("Please enter your business name.");
  if (input.phone.replace(/\D/g, "").length < 10)
    return fail("Please enter a valid phone number.");
  if (!EMAIL_RE.test(email ?? "")) return fail("Please enter a valid email.");
  if (!input.message?.trim())
    return fail("A sentence on your call problem helps us prep.");

  // Rate-limit by email (uses service role to read; anon can't read this table).
  try {
    const admin = createAdminClient();
    const { data: recent } = await admin
      .from("contact_submissions")
      .select("created_at")
      .eq("email", email)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (
      recent?.created_at &&
      Date.now() - new Date(recent.created_at).getTime() < RATE_LIMIT_MS
    ) {
      return fail("You just submitted a request — give it a minute before retrying.");
    }
  } catch {
    // If the service role isn't configured, skip the rate-limit rather than
    // blocking a real prospect from reaching us.
  }

  const supabase = createClient();
  const { error } = await supabase.from("contact_submissions").insert({
    name,
    business_name: input.business.trim(),
    phone: input.phone.trim(),
    email: email!,
    industry: input.industry,
    message: input.message.trim(),
  });

  if (error) return fail("Something went wrong. Please try again.");
  return ok();
}
