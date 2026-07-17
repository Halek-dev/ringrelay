import { requireOwner } from "@/lib/auth";
import { getApplications, getAllPostings } from "@/lib/data/careers";
import { ApplicationsView } from "@/components/admin/applications-view";

export const dynamic = "force-dynamic";

export default async function ApplicationsPage() {
  await requireOwner();
  const [applications, postings] = await Promise.all([
    getApplications(),
    getAllPostings(),
  ]);
  return <ApplicationsView applications={applications} postings={postings} />;
}
