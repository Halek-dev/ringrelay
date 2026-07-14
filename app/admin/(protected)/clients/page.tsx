import { ClientsView } from "@/components/admin/clients-view";
import { requireProfile } from "@/lib/auth";
import { getClients, getStepsByClient } from "@/lib/data/clients";

export const dynamic = "force-dynamic";

export default async function ClientsPage() {
  const profile = await requireProfile();
  const [clients, stepsByClient] = await Promise.all([
    getClients(),
    getStepsByClient(),
  ]);

  return (
    <ClientsView
      clients={clients}
      stepsByClient={stepsByClient}
      isOwner={profile.role === "owner"}
    />
  );
}
