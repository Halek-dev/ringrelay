"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import * as Dialog from "@radix-ui/react-dialog";
import { Plus, X, Trash2, Shield, User } from "lucide-react";
import { useToast } from "@/components/ui/toaster";
import {
  createMember,
  updateMemberRole,
  removeMember,
} from "@/app/admin/(protected)/team/actions";
import type { Profile, UserRole } from "@/lib/db-types";
import { cn } from "@/lib/utils";

function initials(p: Profile) {
  const base = (p.full_name || p.email || "?").trim();
  const parts = base.split(/[\s@]+/).filter(Boolean);
  return (parts.length >= 2 ? parts[0][0] + parts[1][0] : base.slice(0, 2)).toUpperCase();
}

export function TeamView({
  members,
  currentUserId,
}: {
  members: Profile[];
  currentUserId: string;
}) {
  return (
    <div>
      <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-[26px] font-extrabold tracking-[-0.02em] text-ink">
            Team
          </h1>
          <p className="mt-1 text-[14.5px] text-body">
            {members.length} member{members.length === 1 ? "" : "s"}. Owners
            manage the pipeline, templates, and other members.
          </p>
        </div>
        <AddMemberDialog />
      </header>

      <div className="overflow-hidden rounded-[16px] border border-line2 bg-card shadow-soft">
        <table className="w-full min-w-[560px] border-collapse text-left">
          <thead>
            <tr className="border-b border-line2 bg-panel">
              {["Member", "Email", "Role", ""].map((h, i) => (
                <th
                  key={i}
                  className="px-5 py-[13px] font-mono text-[11px] font-semibold uppercase tracking-[0.1em] text-mute"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {members.map((m) => (
              <MemberRow
                key={m.id}
                member={m}
                isSelf={m.id === currentUserId}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function MemberRow({ member, isSelf }: { member: Profile; isSelf: boolean }) {
  const router = useRouter();
  const { toast } = useToast();
  const [pending, startTransition] = useTransition();

  function setRole(role: UserRole) {
    startTransition(async () => {
      const res = await updateMemberRole(member.id, role);
      if (!res.ok) toast({ variant: "info", title: "Update failed", description: res.error });
      else {
        toast({ title: "Role updated" });
        router.refresh();
      }
    });
  }

  function remove() {
    startTransition(async () => {
      const res = await removeMember(member.id);
      if (!res.ok) toast({ variant: "info", title: "Remove failed", description: res.error });
      else {
        toast({ title: "Member removed" });
        router.refresh();
      }
    });
  }

  return (
    <tr className="border-b border-line last:border-b-0 hover:bg-panel/60">
      <td className="px-5 py-[14px]">
        <div className="flex items-center gap-3">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-gradient-to-br from-acc-a to-acc-b text-[13px] font-bold text-white">
            {initials(member)}
          </span>
          <span className="text-[14px] font-bold text-ink">
            {member.full_name || "—"}
            {isSelf && <span className="ml-2 text-[12px] font-medium text-mute">(you)</span>}
          </span>
        </div>
      </td>
      <td className="px-5 py-[14px] text-[14px] text-body">{member.email}</td>
      <td className="px-5 py-[14px]">
        <span
          className={cn(
            "inline-flex items-center gap-[6px] rounded-full border px-[10px] py-[3px] text-[12px] font-semibold",
            member.role === "owner"
              ? "border-acc/40 bg-acc/10 text-acc-dim"
              : "border-line2 bg-panel text-body",
          )}
        >
          {member.role === "owner" ? <Shield size={12} /> : <User size={12} />}
          <span className="capitalize">{member.role}</span>
        </span>
      </td>
      <td className="px-5 py-[14px] text-right">
        {!isSelf && (
          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setRole(member.role === "owner" ? "member" : "owner")}
              disabled={pending}
              className="rounded-full border border-line2 px-3 py-[6px] text-[12.5px] font-semibold text-body transition-colors hover:border-acc hover:text-acc disabled:opacity-50"
            >
              {member.role === "owner" ? "Make member" : "Make owner"}
            </button>
            <button
              type="button"
              onClick={remove}
              disabled={pending}
              aria-label={`Remove ${member.full_name || member.email}`}
              className="grid h-8 w-8 place-items-center rounded-[8px] text-mute transition-colors hover:bg-panel hover:text-acc disabled:opacity-50"
            >
              <Trash2 size={15} />
            </button>
          </div>
        )}
      </td>
    </tr>
  );
}

function AddMemberDialog() {
  const router = useRouter();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    password: "",
    role: "member" as UserRole,
  });

  function submit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const res = await createMember(form);
      if (!res.ok) {
        toast({ variant: "info", title: "Couldn't add member", description: res.error });
        return;
      }
      toast({ title: "Member added", description: `${form.email} can now sign in.` });
      setForm({ full_name: "", email: "", password: "", role: "member" });
      setOpen(false);
      router.refresh();
    });
  }

  const inputCls =
    "rounded-[10px] border-[1.5px] border-line2 bg-card2 px-[13px] py-[11px] text-[14px] text-ink placeholder:text-mute";

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-full bg-acc px-5 py-[10px] text-[14px] font-bold text-white shadow-[0_10px_24px_rgba(234,88,12,0.3)] transition-all hover:-translate-y-0.5 hover:bg-acc-b"
        >
          <Plus size={16} strokeWidth={2.6} /> Add member
        </button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-ink/40 backdrop-blur-sm" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-[440px] -translate-x-1/2 -translate-y-1/2 rounded-[18px] border border-line2 bg-card p-6 shadow-card focus:outline-none">
          <div className="mb-5 flex items-center justify-between">
            <Dialog.Title className="font-display text-[19px] font-extrabold tracking-[-0.02em] text-ink">
              Add a team member
            </Dialog.Title>
            <Dialog.Close className="grid h-8 w-8 place-items-center rounded-full border border-line2 text-mute hover:text-ink">
              <X size={16} />
            </Dialog.Close>
          </div>
          <form onSubmit={submit} className="flex flex-col gap-4">
            <label className="flex flex-col gap-[6px]">
              <span className="text-[12.5px] font-bold text-ink">Full name</span>
              <input
                className={inputCls}
                placeholder="Jordan Lee"
                value={form.full_name}
                onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                required
              />
            </label>
            <label className="flex flex-col gap-[6px]">
              <span className="text-[12.5px] font-bold text-ink">Email</span>
              <input
                type="email"
                className={inputCls}
                placeholder="jordan@ringrelay.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
            </label>
            <label className="flex flex-col gap-[6px]">
              <span className="text-[12.5px] font-bold text-ink">
                Temporary password
              </span>
              <input
                type="text"
                className={inputCls}
                placeholder="At least 8 characters"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
              />
            </label>
            <label className="flex flex-col gap-[6px]">
              <span className="text-[12.5px] font-bold text-ink">Role</span>
              <select
                className={inputCls}
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value as UserRole })}
              >
                <option value="member">Member</option>
                <option value="owner">Owner</option>
              </select>
            </label>
            <div className="mt-1 flex justify-end gap-2">
              <Dialog.Close className="rounded-full border-[1.5px] border-line2 px-5 py-[10px] text-[14px] font-bold text-ink">
                Cancel
              </Dialog.Close>
              <button
                type="submit"
                disabled={pending}
                className="rounded-full bg-acc px-5 py-[10px] text-[14px] font-bold text-white hover:bg-acc-b disabled:opacity-70"
              >
                {pending ? "Adding…" : "Add member"}
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
