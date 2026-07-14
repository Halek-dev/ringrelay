import { TeamView } from "@/components/admin/team-view";
import { requireOwner } from "@/lib/auth";
import { listProfiles } from "@/lib/data/team";

export const dynamic = "force-dynamic";

export default async function TeamPage() {
  const owner = await requireOwner(); // redirects non-owners
  const members = await listProfiles();
  return <TeamView members={members} currentUserId={owner.id} />;
}
