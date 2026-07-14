"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Copy, Check, Save, Trash2, Plus, X } from "lucide-react";
import * as Dialog from "@radix-ui/react-dialog";
import { useToast } from "@/components/ui/toaster";
import {
  updateTemplate,
  createTemplate,
  deleteTemplate,
} from "@/app/admin/(protected)/outreach/actions";
import {
  TEMPLATE_CATEGORY_LABEL,
  type OutreachTemplate,
  type TemplateCategory,
} from "@/lib/db-types";
import { cn } from "@/lib/utils";

const CATEGORY_ORDER: TemplateCategory[] = [
  "first_touch",
  "follow_up_1",
  "follow_up_2",
  "demo_confirmation",
];

export function OutreachView({
  templates,
  isOwner,
}: {
  templates: OutreachTemplate[];
  isOwner: boolean;
}) {
  return (
    <div>
      <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-[26px] font-extrabold tracking-[-0.02em] text-ink">
            Outreach templates
          </h1>
          <p className="mt-1 text-[14.5px] text-body">
            Grab, tweak, and reuse. Batched outreach is the workflow.
          </p>
        </div>
        {isOwner && <NewTemplateDialog />}
      </header>

      {templates.length === 0 ? (
        <p className="rounded-[16px] border border-dashed border-line2 px-5 py-12 text-center text-[14px] text-mute">
          No templates yet.
          {isOwner ? " Add one to get started." : ""}
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          {templates.map((t) => (
            <TemplateCard key={t.id} template={t} isOwner={isOwner} />
          ))}
        </div>
      )}
    </div>
  );
}

function TemplateCard({
  template,
  isOwner,
}: {
  template: OutreachTemplate;
  isOwner: boolean;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [body, setBody] = useState(template.body);
  const [copied, setCopied] = useState(false);
  const [pending, startTransition] = useTransition();
  const dirty = body !== template.body;

  async function copy() {
    try {
      await navigator.clipboard.writeText(body);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard unavailable */
    }
  }

  function save() {
    startTransition(async () => {
      const res = await updateTemplate(template.id, body);
      if (!res.ok) toast({ variant: "info", title: "Save failed", description: res.error });
      else {
        toast({ title: "Template saved" });
        router.refresh();
      }
    });
  }

  function remove() {
    startTransition(async () => {
      const res = await deleteTemplate(template.id);
      if (!res.ok) toast({ variant: "info", title: "Delete failed", description: res.error });
      else {
        toast({ title: "Template deleted" });
        router.refresh();
      }
    });
  }

  return (
    <div className="flex flex-col rounded-[16px] border border-line2 bg-card p-5 shadow-soft">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <span className="font-mono text-[10.5px] font-semibold uppercase tracking-[0.14em] text-acc-dim">
            {TEMPLATE_CATEGORY_LABEL[template.category]}
          </span>
          <h3 className="mt-2 font-display text-[16px] font-bold tracking-[-0.01em] text-ink">
            {template.name}
          </h3>
        </div>
        <div className="flex items-center gap-2">
          {isOwner && (
            <button
              type="button"
              onClick={remove}
              disabled={pending}
              aria-label="Delete template"
              className="grid h-8 w-8 place-items-center rounded-full border border-line2 text-mute transition-colors hover:border-acc hover:text-acc disabled:opacity-50"
            >
              <Trash2 size={14} />
            </button>
          )}
          <button
            type="button"
            onClick={copy}
            className={cn(
              "inline-flex shrink-0 items-center gap-[6px] rounded-full border px-3 py-[6px] text-[12.5px] font-bold transition-colors",
              copied
                ? "border-ok/40 bg-ok/[0.08] text-ok"
                : "border-line2 bg-card text-body hover:border-acc hover:text-acc",
            )}
          >
            {copied ? <Check size={14} strokeWidth={2.6} /> : <Copy size={14} strokeWidth={2.2} />}
            {copied ? "Copied" : "Copy"}
          </button>
        </div>
      </div>

      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        readOnly={!isOwner}
        rows={5}
        className={cn(
          "w-full resize-y rounded-[12px] border-[1.5px] border-line2 bg-card2 px-[14px] py-3 text-[14px] leading-[1.6] text-bubble-ink",
          !isOwner && "cursor-default",
        )}
      />

      <div className="mt-2 flex items-center justify-between">
        <p className="text-[12px] text-mute">
          Tokens like{" "}
          <code className="rounded bg-panel px-1 py-[1px] font-mono text-acc-dim">
            {"{{first_name}}"}
          </code>{" "}
          fill per lead.
        </p>
        {isOwner && dirty && (
          <button
            type="button"
            onClick={save}
            disabled={pending}
            className="inline-flex items-center gap-1 rounded-full bg-acc px-4 py-[7px] text-[13px] font-bold text-white hover:bg-acc-b disabled:opacity-70"
          >
            <Save size={14} /> Save
          </button>
        )}
      </div>
    </div>
  );
}

function NewTemplateDialog() {
  const router = useRouter();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [form, setForm] = useState({
    name: "",
    category: "first_touch" as TemplateCategory,
    body: "",
  });

  function submit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const res = await createTemplate(form);
      if (!res.ok) {
        toast({ variant: "info", title: "Couldn't add", description: res.error });
        return;
      }
      toast({ title: "Template added" });
      setForm({ name: "", category: "first_touch", body: "" });
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
          <Plus size={16} strokeWidth={2.6} /> New template
        </button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-ink/40 backdrop-blur-sm" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-[18px] border border-line2 bg-card p-6 shadow-card focus:outline-none">
          <div className="mb-5 flex items-center justify-between">
            <Dialog.Title className="font-display text-[19px] font-extrabold tracking-[-0.02em] text-ink">
              New template
            </Dialog.Title>
            <Dialog.Close className="grid h-8 w-8 place-items-center rounded-full border border-line2 text-mute hover:text-ink">
              <X size={16} />
            </Dialog.Close>
          </div>
          <form onSubmit={submit} className="flex flex-col gap-4">
            <label className="flex flex-col gap-[6px]">
              <span className="text-[12.5px] font-bold text-ink">Name</span>
              <input
                className={inputCls}
                placeholder="First-touch — referral angle"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </label>
            <label className="flex flex-col gap-[6px]">
              <span className="text-[12.5px] font-bold text-ink">Category</span>
              <select
                className={inputCls}
                value={form.category}
                onChange={(e) =>
                  setForm({ ...form, category: e.target.value as TemplateCategory })
                }
              >
                {CATEGORY_ORDER.map((c) => (
                  <option key={c} value={c}>
                    {TEMPLATE_CATEGORY_LABEL[c]}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-[6px]">
              <span className="text-[12.5px] font-bold text-ink">Body</span>
              <textarea
                rows={5}
                className={cn(inputCls, "resize-y leading-[1.5]")}
                placeholder="Hi {{first_name}}, ..."
                value={form.body}
                onChange={(e) => setForm({ ...form, body: e.target.value })}
                required
              />
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
                {pending ? "Adding…" : "Add template"}
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
