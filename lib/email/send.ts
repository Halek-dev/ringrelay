import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import type { EmailTemplate, EmailTemplateKey } from "@/lib/db-types";
import {
  renderEmailHtml,
  substituteVars,
  type EmailVars,
} from "@/lib/email/layout";

/**
 * Transactional email via the Resend API. Server-only.
 *
 * Configuration (all in .env.local):
 * - RESEND_API_KEY: from resend.com. If missing, sends become no-ops that log,
 *   so the app never breaks because email is not set up yet.
 * - EMAIL_FROM: verified sender, e.g. "Ring Relay <hello@tryringrelay.com>".
 * - EMAIL_REPLY_TO: optional inbox that receives replies.
 */

const RESEND_URL = "https://api.resend.com/emails";

export type SendResult = { ok: true } | { ok: false; error: string };

export async function sendEmail(input: {
  to: string;
  subject: string;
  bodyText: string;
}): Promise<SendResult> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;
  if (!apiKey || !from) {
    console.log(
      `[email] Not configured (RESEND_API_KEY/EMAIL_FROM). Would send to ${input.to}: ${input.subject}`,
    );
    return { ok: false, error: "Email is not configured on the server yet." };
  }

  try {
    const res = await fetch(RESEND_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [input.to],
        subject: input.subject,
        html: renderEmailHtml(input.bodyText),
        text: input.bodyText,
        ...(process.env.EMAIL_REPLY_TO
          ? { reply_to: process.env.EMAIL_REPLY_TO }
          : {}),
      }),
    });
    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      console.error("[email] Resend error:", res.status, detail.slice(0, 300));
      return { ok: false, error: `The email service refused the send (HTTP ${res.status}).` };
    }
    return { ok: true };
  } catch (err) {
    console.error("[email] send failed:", err);
    return { ok: false, error: "Could not reach the email service." };
  }
}

/** Load an active template by key. Null when missing or switched off. */
export async function getActiveTemplate(
  key: EmailTemplateKey,
): Promise<EmailTemplate | null> {
  const admin = createAdminClient();
  const { data } = await admin
    .from("email_templates")
    .select("*")
    .eq("key", key)
    .eq("is_active", true)
    .maybeSingle();
  return (data as EmailTemplate | null) ?? null;
}

/**
 * Render and send one templated email. Returns ok:false (never throws) when
 * the template is off, missing, or the provider fails, so callers can treat
 * email as best-effort: an application must never fail because a mail did.
 */
export async function sendTemplate(
  key: EmailTemplateKey,
  to: string,
  vars: EmailVars,
): Promise<SendResult> {
  const template = await getActiveTemplate(key);
  if (!template) {
    console.log(`[email] Template ${key} inactive or missing; skipping send.`);
    return { ok: false, error: "This template is switched off." };
  }
  return sendEmail({
    to,
    subject: substituteVars(template.subject, vars),
    bodyText: substituteVars(template.body, vars),
  });
}

/** Standard variables for an applicant-facing email. */
export function applicantVars(fullName: string, role: string): EmailVars {
  return {
    name: fullName,
    first_name: fullName.trim().split(/\s+/)[0] ?? fullName,
    role,
  };
}
