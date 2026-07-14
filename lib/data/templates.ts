import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { OutreachTemplate } from "@/lib/db-types";

export async function getTemplates(): Promise<OutreachTemplate[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("outreach_templates")
    .select("*")
    .order("category", { ascending: true })
    .order("created_at", { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? []) as OutreachTemplate[];
}
