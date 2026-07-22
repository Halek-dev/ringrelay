"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { ok, fail, type ActionResult } from "@/lib/action-result";
import { sendTemplate, applicantVars } from "@/lib/email/send";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_CV_BYTES = 5 * 1024 * 1024; // 5MB
const RATE_LIMIT_MS = 60 * 60 * 1000; // one application per role per email per hour
const CV_TYPES = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);
const CV_EXTENSIONS = /\.(pdf|docx?)$/i;

/**
 * Public job application. Uses the service role throughout because the CV
 * lands in a PRIVATE bucket and anon clients cannot write there. Every field
 * is validated server side; the client form is just convenience.
 */
export async function submitApplication(
  formData: FormData,
): Promise<ActionResult> {
  const get = (k: string) => String(formData.get(k) ?? "").trim();

  // Honeypot: real users never see or fill this field. Bots do. Pretend
  // success so the bot moves on.
  if (get("website")) return ok();

  const postingId = get("postingId");
  const fullName = get("fullName");
  const email = get("email").toLowerCase();
  const phone = get("phone");
  const countryTimezone = get("countryTimezone");
  const yearsExperience = get("yearsExperience");
  const hoursPerWeek = get("hoursPerWeek");
  const earliestStart = get("earliestStart");
  const coverNote = get("coverNote");
  const consent = get("consent") === "yes";

  if (!postingId) return fail("Missing role. Reload the page and try again.");
  if (!fullName) return fail("Please enter your full name.");
  if (!EMAIL_RE.test(email)) return fail("Please enter a valid email.");
  if (phone.replace(/\D/g, "").length < 7)
    return fail("Please enter a valid phone number.");
  if (!countryTimezone)
    return fail("Please tell us your country and timezone.");
  if (!consent)
    return fail(
      "We need your consent to process your application data. Please tick the consent box.",
    );

  const admin = createAdminClient();

  // The posting must exist and actually be open.
  const { data: posting } = await admin
    .from("job_postings")
    .select("id, status, slug, title")
    .eq("id", postingId)
    .maybeSingle();
  if (!posting || posting.status !== "open")
    return fail("This role is no longer open.");

  // Rate limit: same email cannot apply to the same role more than once/hour.
  const { data: recent } = await admin
    .from("job_applications")
    .select("created_at")
    .eq("email", email)
    .eq("posting_id", postingId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (
    recent?.created_at &&
    Date.now() - new Date(recent.created_at).getTime() < RATE_LIMIT_MS
  ) {
    return fail(
      "You already applied to this role recently. We have your application.",
    );
  }

  // Optional CV upload into the PRIVATE cvs bucket.
  let cvPath: string | null = null;
  const cv = formData.get("cv");
  if (cv instanceof File && cv.size > 0) {
    if (cv.size > MAX_CV_BYTES) return fail("The CV file is over 5MB.");
    if (!CV_TYPES.has(cv.type) && !CV_EXTENSIONS.test(cv.name))
      return fail("Please upload a PDF or Word document.");

    const safeName = cv.name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(-80);
    cvPath = `${posting.slug}/${Date.now()}-${safeName}`;
    const buf = Buffer.from(await cv.arrayBuffer());
    const { error: upErr } = await admin.storage
      .from("cvs")
      .upload(cvPath, buf, {
        contentType: cv.type || "application/octet-stream",
        upsert: false,
      });
    if (upErr) {
      console.error("[careers] CV upload failed:", upErr.message);
      return fail("The CV upload failed. Try again, or apply without the file.");
    }
  }

  const { error } = await admin.from("job_applications").insert({
    posting_id: postingId,
    full_name: fullName,
    email,
    phone,
    country_timezone: countryTimezone,
    years_experience: yearsExperience || null,
    hours_per_week: hoursPerWeek || null,
    earliest_start: earliestStart || null,
    cover_note: coverNote || null,
    cv_path: cvPath,
    consent_given: true,
    consent_at: new Date().toISOString(),
  });
  if (error) {
    console.error("[careers] application insert failed:", error.message);
    return fail("Something went wrong saving your application. Please try again.");
  }

  console.log(`[careers] New application for ${posting.slug} from ${email}`);

  // Auto-reply to the applicant. Best effort: the application is already
  // saved, so an email problem must never surface as a form error.
  await sendTemplate(
    "application_received",
    email,
    applicantVars(fullName, posting.title as string),
  );

  return ok();
}
