import { requireOwner } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import type { EmailTemplate } from "@/lib/db-types";
import { EmailTemplatesView } from "@/components/admin/email-templates-view";

export const dynamic = "force-dynamic";

export default async function EmailsPage() {
  await requireOwner();
  const supabase = createClient();
  const { data } = await supabase
    .from("email_templates")
    .select("*")
    .order("created_at", { ascending: true });
  return <EmailTemplatesView templates={(data ?? []) as EmailTemplate[]} />;
}
