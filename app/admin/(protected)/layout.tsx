import type { Metadata } from "next";
import { AdminShell, type ShellUser } from "@/components/admin/admin-shell";
import { requireProfile } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Ring Relay — Ops Console",
  robots: { index: false, follow: false },
};

// Admin data is per-user and auth-gated, so never statically cache it.
export const dynamic = "force-dynamic";

function initialsFrom(name: string | null, email: string | null): string {
  const base = (name || email || "?").trim();
  const parts = base.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return base.slice(0, 2).toUpperCase();
}

export default async function ProtectedAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Middleware already redirects unauthenticated users; this is defense-in-depth
  // and gives us the profile for the shell.
  const profile = await requireProfile();

  const user: ShellUser = {
    name: profile.full_name || profile.email || "Team member",
    role: profile.role,
    initials: initialsFrom(profile.full_name, profile.email),
  };

  return <AdminShell user={user}>{children}</AdminShell>;
}
