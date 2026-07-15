import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { Lead, OutreachLog } from "@/lib/db-types";

export async function getLeads(): Promise<Lead[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("leads")
    .select("*")
    .order("score", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []) as Lead[];
}

/**
 * All logged touches grouped by lead_id, for the lead detail drawer. Resilient
 * to a missing table so the page still renders before migration 0004 is run.
 */
export async function getTouchesByLead(): Promise<Record<string, OutreachLog[]>> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("outreach_log")
    .select("*")
    .order("sent_at", { ascending: false });
  if (error) return {};

  const grouped: Record<string, OutreachLog[]> = {};
  for (const t of (data ?? []) as OutreachLog[]) {
    (grouped[t.lead_id] ??= []).push(t);
  }
  return grouped;
}
