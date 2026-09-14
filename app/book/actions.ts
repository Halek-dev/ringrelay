"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { ok, fail, type ActionResult } from "@/lib/action-result";
import { sendEmail } from "@/lib/email/send";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type BookInput = {
  email: string;
  business: string;
  name?: string;
  dateLabel: string; // e.g. "Tue, Oct 14"
  timeLabel: string; // e.g. "10:00 AM"
  tz: string; // e.g. "America/Denver"
};

/**
 * Public book-a-call form (linked from the outreach email). A booking is a hot
 * inbound lead, so it lands in the leads pipeline as `demo_booked`, which is
 * exactly what the dashboard's Demos KPI and activity feed already count. If a
 * lead with this email already exists (we emailed them), we advance that lead
 * instead of creating a duplicate. Anonymous, so it writes with the service
 * role. A confirmation to the prospect and a heads-up to the owner are
 * best-effort: a booking must never fail because email is not configured.
 */
export async function bookCall(input: BookInput): Promise<ActionResult> {
  const email = input.email?.trim().toLowerCase();
  const business = input.business?.trim();
  const name = input.name?.trim();

  if (!EMAIL_RE.test(email ?? "")) return fail("Please enter a valid email.");
  if (!business) return fail("Please add your business name.");
  if (!input.dateLabel || !input.timeLabel) return fail("Pick a day and a time.");

  const whenLine = `Requested call: ${input.dateLabel} at ${input.timeLabel} (${input.tz})`;
  const admin = createAdminClient();

  try {
    const { data: existing } = await admin
      .from("leads")
      .select("id, notes")
      .ilike("email", email!)
      .limit(1)
      .maybeSingle();

    if (existing) {
      const notes = [existing.notes as string | null, whenLine]
        .filter(Boolean)
        .join("\n");
      const { error } = await admin
        .from("leads")
        .update({
          status: "demo_booked",
          notes,
          next_action: "Confirm the call",
          last_touch_at: new Date().toISOString(),
        })
        .eq("id", existing.id);
      if (error) return fail("Something went wrong. Please try again.");
    } else {
      const { error } = await admin.from("leads").insert({
        business_name: business,
        contact_name: name || null,
        email,
        industry: "other",
        status: "demo_booked",
        tier: "hot",
        score: 3,
        source: "Booked a call",
        notes: whenLine,
        next_action: "Confirm the call",
      });
      if (error) return fail("Something went wrong. Please try again.");
    }
  } catch {
    return fail("Something went wrong. Please try again.");
  }

  // Best-effort confirmation to the prospect.
  const hi = name ? `Hi ${name.split(/\s+/)[0]},` : "Hi there,";
  await sendEmail({
    to: email!,
    subject: "Your Ring Relay call",
    bodyText: `${hi}

Thanks for booking. You asked to talk on ${input.dateLabel} at ${input.timeLabel} (${input.tz}). We will send a short calendar invite to confirm shortly. If that time stops working, just reply to this email and we will move it.

On the call we will show you exactly how Ring Relay gets ${business} more Google reviews from the jobs you already run. Fifteen minutes, no slides.

Talk soon,
Alex, Ring Relay`,
  }).catch(() => {});

  // Best-effort heads-up to the owner inbox.
  const ownerInbox = process.env.EMAIL_REPLY_TO;
  if (ownerInbox) {
    await sendEmail({
      to: ownerInbox,
      subject: `New call booked: ${business}`,
      bodyText: `${business} booked a call.

Email: ${email}
${name ? `Name: ${name}\n` : ""}When: ${input.dateLabel} at ${input.timeLabel} (${input.tz})

It is in Leads as Demo Booked. Send them a calendar invite to confirm.`,
    }).catch(() => {});
  }

  revalidatePath("/admin");
  revalidatePath("/admin/leads");
  return ok();
}
