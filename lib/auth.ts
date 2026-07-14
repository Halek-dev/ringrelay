import "server-only";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/lib/db-types";

/**
 * Returns the signed-in user's profile, or null. Uses getUser() (which
 * revalidates the token) rather than trusting a cached session.
 */
export async function getCurrentProfile(): Promise<Profile | null> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return (data as Profile) ?? null;
}

/** Require a signed-in user; redirect to login otherwise. */
export async function requireProfile(): Promise<Profile> {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/admin/login");
  return profile;
}

/** Require an owner; redirect non-owners to the dashboard. */
export async function requireOwner(): Promise<Profile> {
  const profile = await requireProfile();
  if (profile.role !== "owner") redirect("/admin");
  return profile;
}

/** Throwing variants for use inside server actions (no redirect). */
export async function assertProfile(): Promise<Profile> {
  const profile = await getCurrentProfile();
  if (!profile) throw new Error("Not authenticated.");
  return profile;
}

export async function assertOwner(): Promise<Profile> {
  const profile = await assertProfile();
  if (profile.role !== "owner") throw new Error("Owner access required.");
  return profile;
}
