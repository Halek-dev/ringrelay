import { requireOwner } from "@/lib/auth";
import { getAllPostings } from "@/lib/data/careers";
import { CareersAdminView } from "@/components/admin/careers-admin-view";

export const dynamic = "force-dynamic";

export default async function AdminCareersPage() {
  await requireOwner();
  const postings = await getAllPostings();
  return <CareersAdminView postings={postings} />;
}
