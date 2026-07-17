"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import * as Dialog from "@radix-ui/react-dialog";
import { Plus, Pencil, Trash2, X, Upload, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/toaster";
import {
  saveTeamMember,
  uploadTeamPhoto,
  deleteTeamMember,
  type TeamMemberInput,
} from "@/app/admin/(protected)/team-members/actions";
import type { TeamMember } from "@/lib/db-types";
import { cn } from "@/lib/utils";

/**
 * Resize an image on the client to a 512px square-ish JPEG before upload, so
 * the public bucket only ever holds small display-ready files.
 */
async function resizeImage(file: File, max = 512): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, max / Math.max(bitmap.width, bitmap.height));
  const w = Math.round(bitmap.width * scale);
  const h = Math.round(bitmap.height * scale);
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, w, h);
  return new Promise((resolve) =>
    canvas.toBlob((b) => resolve(b ?? file), "image/jpeg", 0.85),
  );
}

const emptyForm = (nextOrder: number): TeamMemberInput => ({
  name: "",
  role_title: "",
  bio: "",
  sort_order: nextOrder,
  is_published: false,
});

export function TeamMembersView({ members }: { members: TeamMember[] }) {
  const router = useRouter();
  const { toast } = useToast();
  const [pending, startTransition] = useTransition();
  const [editing, setEditing] = useState<TeamMemberInput | null>(null);

  function remove(m: TeamMember) {
    if (!confirm(`Remove ${m.name}?`)) return;
    startTransition(async () => {
      const res = await deleteTeamMember(m.id);
      if (!res.ok) toast({ variant: "info", title: "Failed", description: res.error });
      else {
        toast({ title: "Member removed" });
        router.refresh();
      }
    });
  }

  return (
    <div>
      <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-[26px] font-extrabold tracking-[-0.02em] text-ink">
            Team
          </h1>
          <p className="mt-1 max-w-[540px] text-[14.5px] leading-[1.5] text-body">
            Real people only. The public team section on the about page stays
            completely hidden until at least one member here is published.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setEditing(emptyForm(members.length + 1))}
          className="inline-flex items-center gap-2 whitespace-nowrap rounded-full bg-acc px-5 py-[10px] text-[14px] font-bold text-white hover:bg-acc-b"
        >
          <Plus size={16} strokeWidth={2.6} /> Add member
        </button>
      </header>

      {members.length === 0 ? (
        <p className="rounded-[14px] border border-dashed border-line2 px-5 py-10 text-center text-[14px] text-mute">
          No team members yet. The public section is hidden.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {members.map((m) => (
            <div
              key={m.id}
              className="rounded-[16px] border border-line2 bg-card p-4 shadow-soft"
            >
              <div className="flex items-center gap-3">
                {m.photo_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={m.photo_url}
                    alt={m.name}
                    className="h-14 w-14 rounded-full border border-line2 object-cover"
                  />
                ) : (
                  <div className="grid h-14 w-14 place-items-center rounded-full border border-line2 bg-panel font-display text-[18px] font-bold text-mute">
                    {m.name.charAt(0)}
                  </div>
                )}
                <div className="min-w-0">
                  <div className="truncate text-[15px] font-bold text-ink">
                    {m.name}
                  </div>
                  <div className="truncate text-[13px] text-body">{m.role_title}</div>
                  <span
                    className={cn(
                      "mt-1 inline-block rounded-full border px-2 py-[1px] text-[10.5px] font-bold uppercase tracking-[0.05em]",
                      m.is_published
                        ? "border-ok/35 bg-ok/[0.08] text-ok"
                        : "border-line2 bg-panel text-mute",
                    )}
                  >
                    {m.is_published ? "Published" : "Hidden"}
                  </span>
                </div>
              </div>
              {m.bio && (
                <p className="mt-3 line-clamp-3 text-[13px] leading-[1.5] text-body">
                  {m.bio}
                </p>
              )}
              <div className="mt-3 flex items-center justify-end gap-1">
                <button
                  type="button"
                  onClick={() =>
                    setEditing({
                      id: m.id,
                      name: m.name,
                      role_title: m.role_title,
                      bio: m.bio ?? "",
                      sort_order: m.sort_order,
                      is_published: m.is_published,
                    })
                  }
                  className="grid h-8 w-8 place-items-center rounded-[8px] text-mute hover:bg-panel hover:text-ink"
                  aria-label={`Edit ${m.name}`}
                >
                  <Pencil size={14} />
                </button>
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => remove(m)}
                  className="grid h-8 w-8 place-items-center rounded-[8px] text-mute hover:bg-panel hover:text-acc"
                  aria-label={`Delete ${m.name}`}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog.Root open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-ink/40 backdrop-blur-sm" />
          <Dialog.Content className="fixed left-1/2 top-1/2 z-50 max-h-[92vh] w-[calc(100%-1.5rem)] max-w-[460px] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-[18px] border border-line2 bg-card p-6 shadow-card focus:outline-none">
            {editing && (
              <MemberForm
                initial={editing}
                onClose={() => setEditing(null)}
                onSaved={() => {
                  setEditing(null);
                  router.refresh();
                }}
              />
            )}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}

const inputCls =
  "w-full rounded-[10px] border-[1.5px] border-line2 bg-card2 px-[13px] py-[10px] text-[14px] text-ink placeholder:text-mute";

function MemberForm({
  initial,
  onClose,
  onSaved,
}: {
  initial: TeamMemberInput;
  onClose: () => void;
  onSaved: () => void;
}) {
  const { toast } = useToast();
  const [pending, startTransition] = useTransition();
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState<TeamMemberInput>(initial);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const res = await saveTeamMember(form);
      if (!res.ok) {
        toast({ variant: "info", title: "Couldn't save", description: res.error });
        return;
      }
      toast({ title: form.id ? "Member updated" : "Member added" });
      onSaved();
    });
  }

  async function onPhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !form.id) return;
    setUploading(true);
    try {
      const resized = await resizeImage(file);
      const fd = new FormData();
      fd.set("memberId", form.id);
      fd.set("photo", new File([resized], "photo.jpg", { type: "image/jpeg" }));
      const res = await uploadTeamPhoto(fd);
      if (!res.ok) toast({ variant: "info", title: "Upload failed", description: res.error });
      else toast({ title: "Photo uploaded" });
    } finally {
      setUploading(false);
    }
  }

  return (
    <>
      <div className="mb-4 flex items-center justify-between">
        <Dialog.Title className="font-display text-[19px] font-extrabold tracking-[-0.02em] text-ink">
          {form.id ? "Edit member" : "Add member"}
        </Dialog.Title>
        <Dialog.Close className="grid h-8 w-8 place-items-center rounded-full border border-line2 text-mute hover:text-ink">
          <X size={16} />
        </Dialog.Close>
      </div>

      <form onSubmit={submit} className="flex flex-col gap-4">
        <label className="flex flex-col gap-[6px]">
          <span className="text-[12.5px] font-bold text-ink">
            Name <span className="text-acc">*</span>
          </span>
          <input
            className={inputCls}
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
        </label>
        <label className="flex flex-col gap-[6px]">
          <span className="text-[12.5px] font-bold text-ink">
            Role / title <span className="text-acc">*</span>
          </span>
          <input
            className={inputCls}
            value={form.role_title}
            onChange={(e) => setForm({ ...form, role_title: e.target.value })}
            required
          />
        </label>
        <label className="flex flex-col gap-[6px]">
          <span className="text-[12.5px] font-bold text-ink">Short bio</span>
          <textarea
            className={cn(inputCls, "resize-y leading-[1.5]")}
            rows={3}
            value={form.bio}
            onChange={(e) => setForm({ ...form, bio: e.target.value })}
          />
        </label>
        <div className="grid grid-cols-2 gap-4">
          <label className="flex flex-col gap-[6px]">
            <span className="text-[12.5px] font-bold text-ink">Display order</span>
            <input
              type="number"
              className={inputCls}
              value={form.sort_order}
              onChange={(e) =>
                setForm({ ...form, sort_order: Number(e.target.value) || 0 })
              }
            />
          </label>
          <label className="flex items-center gap-2 self-end pb-[10px] text-[13.5px] font-bold text-ink">
            <input
              type="checkbox"
              checked={form.is_published}
              onChange={(e) => setForm({ ...form, is_published: e.target.checked })}
              className="h-4 w-4 rounded border-line2 text-acc focus:ring-acc"
            />
            Published
          </label>
        </div>

        {form.id ? (
          <label className="flex cursor-pointer items-center gap-3 rounded-[10px] border-[1.5px] border-dashed border-line2 px-4 py-3 text-[13.5px] font-semibold text-body hover:border-acc/50">
            {uploading ? (
              <Loader2 size={15} className="animate-spin text-acc" />
            ) : (
              <Upload size={15} className="text-acc" />
            )}
            {uploading ? "Uploading photo" : "Upload photo (resized to 512px)"}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={onPhoto}
              disabled={uploading}
            />
          </label>
        ) : (
          <p className="text-[12.5px] text-mute">
            Save the member first, then upload their photo.
          </p>
        )}

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="whitespace-nowrap rounded-full border-[1.5px] border-line2 px-5 py-[10px] text-[14px] font-bold text-ink"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={pending}
            className="whitespace-nowrap rounded-full bg-acc px-5 py-[10px] text-[14px] font-bold text-white hover:bg-acc-b disabled:opacity-60"
          >
            {pending ? "Saving" : "Save member"}
          </button>
        </div>
      </form>
    </>
  );
}
