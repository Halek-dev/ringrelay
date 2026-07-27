"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { assertOwner } from "@/lib/auth";
import { ok, fail, type ActionResult } from "@/lib/action-result";
import {
  sendTemplate,
  sendEmailBatch,
  getActiveTemplate,
  applicantVars,
} from "@/lib/email/send";
import { substituteVars } from "@/lib/email/layout";
import type {
  ApplicationStatus,
  EmploymentType,
  JobPosting,
  JobStatus,
} from "@/lib/db-types";

export type PostingInput = {
  id?: string;
  title: string;
  slug?: string;
  employment_type: EmploymentType;
  location: string;
  pay_range: string;
  hours_per_week: string;
  timezone_requirement: string;
  summary: string;
  description: string;
  responsibilities: string; // one per line in the form
  requirements: string;
  nice_to_haves: string;
  status: JobStatus;
  sort_order: number;
};

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

function lines(s: string): string[] {
  return s
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
}

export async function savePosting(
  input: PostingInput,
): Promise<ActionResult<JobPosting>> {
  await assertOwner();
  if (!input.title?.trim()) return fail("A title is required.");
  if (!input.summary?.trim()) return fail("A short summary is required.");
  if (!input.description?.trim()) return fail("A description is required.");

  const supabase = createClient();
  const row = {
    title: input.title.trim(),
    slug: slugify(input.slug?.trim() || input.title),
    employment_type: input.employment_type,
    location: input.location.trim() || "Remote",
    pay_range: input.pay_range.trim() || null,
    hours_per_week: input.hours_per_week.trim() || null,
    timezone_requirement: input.timezone_requirement.trim() || null,
    summary: input.summary.trim(),
    description: input.description.trim(),
    responsibilities: lines(input.responsibilities),
    requirements: lines(input.requirements),
    nice_to_haves: lines(input.nice_to_haves),
    status: input.status,
    sort_order: input.sort_order,
  };

  const query = input.id
    ? supabase.from("job_postings").update(row).eq("id", input.id)
    : supabase.from("job_postings").insert(row);
  const { data, error } = await query.select("*").single();
  if (error) {
    if (error.code === "23505") return fail("That slug is already in use.");
    return fail(error.message);
  }

  revalidatePath("/admin/careers");
  revalidatePath("/careers");
  return ok(data as JobPosting);
}

export async function setPostingStatus(
  id: string,
  status: JobStatus,
): Promise<ActionResult> {
  await assertOwner();
  const supabase = createClient();
  const { error } = await supabase
    .from("job_postings")
    .update({ status })
    .eq("id", id);
  if (error) return fail(error.message);
  revalidatePath("/admin/careers");
  revalidatePath("/careers");
  return ok();
}

export async function deletePosting(id: string): Promise<ActionResult> {
  await assertOwner();
  const supabase = createClient();
  const { error } = await supabase.from("job_postings").delete().eq("id", id);
  if (error) return fail(error.message);
  revalidatePath("/admin/careers");
  revalidatePath("/careers");
  return ok();
}

export async function movePosting(
  id: string,
  direction: "up" | "down",
): Promise<ActionResult> {
  await assertOwner();
  const supabase = createClient();
  const { data: all, error } = await supabase
    .from("job_postings")
    .select("id, sort_order")
    .order("sort_order", { ascending: true });
  if (error) return fail(error.message);

  const list = (all ?? []) as { id: string; sort_order: number }[];
  const idx = list.findIndex((p) => p.id === id);
  const swap = direction === "up" ? idx - 1 : idx + 1;
  if (idx < 0 || swap < 0 || swap >= list.length) return ok();

  await supabase
    .from("job_postings")
    .update({ sort_order: list[swap].sort_order })
    .eq("id", list[idx].id);
  await supabase
    .from("job_postings")
    .update({ sort_order: list[idx].sort_order })
    .eq("id", list[swap].id);

  revalidatePath("/admin/careers");
  revalidatePath("/careers");
  return ok();
}

export async function setApplicationStatus(
  id: string,
  status: ApplicationStatus,
): Promise<ActionResult> {
  await assertOwner();
  const supabase = createClient();
  const { error } = await supabase
    .from("job_applications")
    .update({ status })
    .eq("id", id);
  if (error) return fail(error.message);
  revalidatePath("/admin/careers/applications");
  return ok();
}

export async function saveApplicationNotes(
  id: string,
  notes: string,
): Promise<ActionResult> {
  await assertOwner();
  const supabase = createClient();
  const { error } = await supabase
    .from("job_applications")
    .update({ notes: notes.trim() || null })
    .eq("id", id);
  if (error) return fail(error.message);
  revalidatePath("/admin/careers/applications");
  return ok();
}

/**
 * Send a status email (interview invite or rejection) to an applicant, using
 * the editable template from /admin/emails. On success the application's
 * status flips to match and the send is recorded in the private notes, so the
 * inbox always shows what was already sent.
 */
export async function sendApplicantEmail(
  applicationId: string,
  kind: "interview" | "rejected",
): Promise<ActionResult> {
  await assertOwner();
  const supabase = createClient();

  const { data: app, error } = await supabase
    .from("job_applications")
    .select("id, full_name, email, notes, job_postings(title)")
    .eq("id", applicationId)
    .single();
  if (error || !app) return fail("Application not found.");

  const rel = (
    app as unknown as {
      job_postings: { title: string } | { title: string }[] | null;
    }
  ).job_postings;
  const role = Array.isArray(rel)
    ? rel[0]?.title ?? "the role"
    : rel?.title ?? "the role";
  const templateKey =
    kind === "interview" ? "interview_invite" : "application_rejected";

  const sent = await sendTemplate(
    templateKey,
    app.email as string,
    applicantVars(app.full_name as string, role),
  );
  if (!sent.ok) return fail(sent.error);

  const stamp = new Date().toISOString().slice(0, 10);
  const noteLine =
    kind === "interview"
      ? `[Email] Interview invite sent ${stamp}`
      : `[Email] Rejection sent ${stamp}`;
  const notes = [(app.notes as string | null) ?? "", noteLine]
    .filter(Boolean)
    .join("\n");

  const { error: upErr } = await supabase
    .from("job_applications")
    .update({
      status: kind === "interview" ? "interview" : "rejected",
      notes,
    })
    .eq("id", applicationId);
  if (upErr) return fail(upErr.message);

  revalidatePath("/admin/careers/applications");
  return ok();
}

type AppRel = { title: string } | { title: string }[] | null;
function roleFrom(rel: AppRel): string {
  if (Array.isArray(rel)) return rel[0]?.title ?? "the role";
  return rel?.title ?? "the role";
}

/**
 * Send the same status email (interview invite or rejection) to MANY applicants
 * at once via the Resend batch endpoint. Only the applicants whose email
 * actually sent are advanced to the new status and stamped in their notes, so
 * a partial failure is safe to retry. Returns how many sent and failed.
 */
export async function sendBulkApplicantEmail(
  ids: string[],
  kind: "interview" | "rejected",
): Promise<ActionResult<{ sent: number; failed: number }>> {
  await assertOwner();
  if (ids.length === 0) return fail("No applications selected.");

  const supabase = createClient();
  const { data: apps, error } = await supabase
    .from("job_applications")
    .select("id, full_name, email, notes, job_postings(title)")
    .in("id", ids);
  if (error) return fail(error.message);
  if (!apps || apps.length === 0) return fail("No applications found.");

  const templateKey =
    kind === "interview" ? "interview_invite" : "application_rejected";
  const template = await getActiveTemplate(templateKey);
  if (!template)
    return fail("That email template is switched off. Turn it on under Emails.");

  const notesById = new Map<string, string | null>();
  const items = apps.map((a) => {
    notesById.set(a.id as string, (a.notes as string | null) ?? null);
    const role = roleFrom((a as { job_postings: AppRel }).job_postings);
    const vars = applicantVars(a.full_name as string, role);
    return {
      ref: a.id as string,
      to: a.email as string,
      subject: substituteVars(template.subject, vars),
      bodyText: substituteVars(template.body, vars),
    };
  });

  const { successRefs, failedRefs } = await sendEmailBatch(items);

  // Advance only the applicants who actually received the email.
  if (successRefs.length > 0) {
    const status = kind === "interview" ? "interview" : "rejected";
    const stamp = new Date().toISOString().slice(0, 10);
    const noteLine =
      kind === "interview"
        ? `[Email] Interview invite sent ${stamp}`
        : `[Email] Rejection sent ${stamp}`;

    await Promise.all(
      successRefs.map((id) => {
        const prev = notesById.get(id) ?? "";
        const notes = [prev, noteLine].filter(Boolean).join("\n");
        return supabase
          .from("job_applications")
          .update({ status, notes })
          .eq("id", id);
      }),
    );
  }

  revalidatePath("/admin/careers/applications");
  return ok({ sent: successRefs.length, failed: failedRefs.length });
}

/**
 * Short-lived signed URL for a CV in the PRIVATE bucket. Owner only, never a
 * public link. The URL expires after 10 minutes.
 */
export async function getCvDownloadUrl(
  cvPath: string,
): Promise<ActionResult<{ url: string }>> {
  await assertOwner();
  const admin = createAdminClient();
  const { data, error } = await admin.storage
    .from("cvs")
    .createSignedUrl(cvPath, 600);
  if (error || !data?.signedUrl) return fail("Could not create a download link.");
  return ok({ url: data.signedUrl });
}
