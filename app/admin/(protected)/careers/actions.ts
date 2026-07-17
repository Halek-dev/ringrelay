"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { assertOwner } from "@/lib/auth";
import { ok, fail, type ActionResult } from "@/lib/action-result";
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
