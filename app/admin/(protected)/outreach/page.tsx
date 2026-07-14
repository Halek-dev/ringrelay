import { OutreachView } from "@/components/admin/outreach-view";
import { requireProfile } from "@/lib/auth";
import { getTemplates } from "@/lib/data/templates";

export const dynamic = "force-dynamic";

export default async function OutreachPage() {
  const profile = await requireProfile();
  const templates = await getTemplates();
  return (
    <OutreachView templates={templates} isOwner={profile.role === "owner"} />
  );
}
