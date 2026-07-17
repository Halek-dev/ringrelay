import { requireOwner } from "@/lib/auth";
import { getAllTeamMembers } from "@/lib/data/careers";
import { TeamMembersView } from "@/components/admin/team-members-view";

export const dynamic = "force-dynamic";

export default async function TeamMembersPage() {
  await requireOwner();
  const members = await getAllTeamMembers();
  return <TeamMembersView members={members} />;
}
