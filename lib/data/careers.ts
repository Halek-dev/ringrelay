import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { JobApplication, JobPosting, TeamMember } from "@/lib/db-types";

/** Open postings for the public /careers page. RLS already limits anon to open. */
export async function getOpenPostings(): Promise<JobPosting[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("job_postings")
    .select("*")
    .eq("status", "open")
    .order("sort_order", { ascending: true });
  if (error) return [];
  return (data ?? []) as JobPosting[];
}

/** One open posting by slug, for /careers/[slug]. */
export async function getOpenPostingBySlug(
  slug: string,
): Promise<JobPosting | null> {
  const supabase = createClient();
  const { data } = await supabase
    .from("job_postings")
    .select("*")
    .eq("slug", slug)
    .eq("status", "open")
    .maybeSingle();
  return (data as JobPosting | null) ?? null;
}

/** Every posting, all statuses, for the owner admin. RLS enforces owner. */
export async function getAllPostings(): Promise<JobPosting[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("job_postings")
    .select("*")
    .order("sort_order", { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? []) as JobPosting[];
}

/** All applications with their posting title, for the owner inbox. */
export async function getApplications(): Promise<
  (JobApplication & { posting_title: string })[]
> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("job_applications")
    .select("*, job_postings(title)")
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []).map((row) => {
    const { job_postings: p, ...rest } = row as JobApplication & {
      job_postings: { title: string } | null;
    };
    return { ...rest, posting_title: p?.title ?? "Unknown role" };
  });
}

/** Published team members for the public site. Empty array hides the section. */
export async function getPublishedTeamMembers(): Promise<TeamMember[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("team_members")
    .select("*")
    .eq("is_published", true)
    .order("sort_order", { ascending: true });
  if (error) return [];
  return (data ?? []) as TeamMember[];
}

/** Every team member for the owner admin. */
export async function getAllTeamMembers(): Promise<TeamMember[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("team_members")
    .select("*")
    .order("sort_order", { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? []) as TeamMember[];
}
