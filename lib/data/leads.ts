import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { Lead } from "@/lib/db-types";

export async function getLeads(): Promise<Lead[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("leads")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []) as Lead[];
}
