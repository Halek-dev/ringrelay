"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X, ExternalLink, LogOut } from "lucide-react";
import { Logo } from "@/components/site/logo";
import { Icon } from "@/components/icon";
import { ToastProvider } from "@/components/ui/toaster";
import { ADMIN_NAV } from "@/lib/mock-data";
import { logoutAction } from "@/app/admin/login/actions";
import { cn } from "@/lib/utils";

export type ShellUser = {
  name: string;
  role: "owner" | "member";
  initials: string;
};

export function AdminShell({
  user,
  children,
}: {
  user: ShellUser;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <ToastProvider>
      <div className="min-h-screen bg-bg">
        {/* Mobile top bar */}
        <div className="sticky top-0 z-40 flex items-center justify-between border-b border-line bg-nav px-4 py-3 backdrop-blur-[18px] lg:hidden">
          <Logo href="/admin" size={32} />
          <button
            type="button"
            aria-label="Toggle navigation"
            onClick={() => setOpen((v) => !v)}
            className="grid h-9 w-9 place-items-center rounded-[10px] border border-line2 text-ink"
          >
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>

        <Sidebar
          user={user}
          className="fixed inset-y-0 left-0 z-50 hidden w-[248px] lg:flex"
        />
        {open && (
          <>
            <div
              className="fixed inset-0 z-40 bg-ink/40 lg:hidden"
              onClick={() => setOpen(false)}
            />
            <Sidebar
              user={user}
              onNavigate={() => setOpen(false)}
              className="fixed inset-y-0 left-0 z-50 flex w-[248px] lg:hidden"
            />
          </>
        )}

        <div className="lg:pl-[248px]">
          <main id="main" className="mx-auto max-w-[1180px] px-5 py-8 md:px-8">
            {children}
          </main>
        </div>
      </div>
    </ToastProvider>
  );
}

function Sidebar({
  user,
  className,
  onNavigate,
}: {
  user: ShellUser;
  className?: string;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const items = ADMIN_NAV.filter((i) => !i.ownerOnly || user.role === "owner");

  return (
    <aside className={cn("flex-col border-r border-line bg-card", className)}>
      <div className="hazard-stripe h-[3px]" />
      <div className="flex items-center gap-2 px-5 py-5">
        <Logo href="/admin" size={34} />
      </div>
      <div className="px-5">
        <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-mute">
          Ops Console
        </span>
      </div>

      <nav className="flex flex-1 flex-col gap-1 px-3 py-5">
        {items.map((item) => {
          const active =
            item.href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 rounded-[10px] px-3 py-[10px] text-[14.5px] font-semibold transition-colors",
                active
                  ? "bg-panel text-ink"
                  : "text-body hover:bg-panel hover:text-ink",
              )}
            >
              <Icon
                name={item.icon}
                size={18}
                strokeWidth={2.2}
                className={active ? "text-acc" : "text-mute"}
              />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-line p-3">
        <Link
          href="/"
          onClick={onNavigate}
          className="mb-2 flex items-center gap-2 rounded-[10px] px-3 py-2 text-[13px] font-semibold text-mute hover:bg-panel hover:text-ink"
        >
          <ExternalLink size={15} strokeWidth={2.2} />
          View public site
        </Link>
        <div className="flex items-center gap-3 rounded-[12px] border border-line bg-panel px-3 py-[10px]">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-gradient-to-br from-acc-a to-acc-b text-[13px] font-bold text-white">
            {user.initials}
          </span>
          <div className="min-w-0 flex-1">
            <div className="truncate text-[13.5px] font-bold text-ink">
              {user.name}
            </div>
            <div className="truncate text-[12px] capitalize text-mute">
              {user.role}
            </div>
          </div>
          <form action={logoutAction}>
            <button
              type="submit"
              aria-label="Sign out"
              className="grid h-8 w-8 place-items-center rounded-[8px] text-mute transition-colors hover:bg-card hover:text-acc"
            >
              <LogOut size={16} />
            </button>
          </form>
        </div>
      </div>
    </aside>
  );
}
