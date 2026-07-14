import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/lib/db-types";

export async function listProfiles(): Promise<Profile[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? []) as Profile[];
}
