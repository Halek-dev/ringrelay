import { LeadsView } from "@/components/admin/leads-view";
import { requireProfile } from "@/lib/auth";
import { getLeads } from "@/lib/data/leads";

export const dynamic = "force-dynamic";

export default async function LeadsPage() {
  const profile = await requireProfile();
  const leads = await getLeads();
  return <LeadsView leads={leads} isOwner={profile.role === "owner"} />;
}
