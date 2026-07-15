import { LeadsView } from "@/components/admin/leads-view";
import { requireProfile } from "@/lib/auth";
import { getLeads, getTouchesByLead } from "@/lib/data/leads";
import { getTemplates } from "@/lib/data/templates";

export const dynamic = "force-dynamic";

export default async function LeadsPage() {
  const profile = await requireProfile();
  const [leads, templates, touchesByLead] = await Promise.all([
    getLeads(),
    getTemplates(),
    getTouchesByLead(),
  ]);
  return (
    <LeadsView
      leads={leads}
      templates={templates}
      touchesByLead={touchesByLead}
      isOwner={profile.role === "owner"}
    />
  );
}
