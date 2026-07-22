"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, ChevronRight, Eye, Loader2, Save, Send } from "lucide-react";
import { useToast } from "@/components/ui/toaster";
import {
  saveEmailTemplate,
  sendTestEmail,
} from "@/app/admin/(protected)/emails/actions";
import { renderEmailHtml, substituteVars } from "@/lib/email/layout";
import type { EmailTemplate } from "@/lib/db-types";
import { cn } from "@/lib/utils";

const SAMPLE_VARS = {
  name: "Jane Doe",
  first_name: "Jane",
  role: "Customer Representative",
};

export function EmailTemplatesView({ templates }: { templates: EmailTemplate[] }) {
  return (
    <div className="max-w-[860px]">
      <header className="mb-6">
        <h1 className="font-display text-[26px] font-extrabold tracking-[-0.02em] text-ink">
          Emails
        </h1>
        <p className="mt-1 max-w-[600px] text-[14.5px] leading-[1.55] text-body">
          The emails the site sends, in your words. Edit the subject and body
          here; the design around them is fixed. Variables you can use:{" "}
          <Code>{"{{name}}"}</Code> <Code>{"{{first_name}}"}</Code>{" "}
          <Code>{"{{role}}"}</Code>
        </p>
      </header>

      {templates.length === 0 ? (
        <p className="rounded-[14px] border border-dashed border-line2 px-5 py-10 text-center text-[14px] text-mute">
          No templates found. Run migration 0009 in Supabase to seed them.
        </p>
      ) : (
        <div className="flex flex-col gap-4">
          {templates.map((t) => (
            <TemplateCard key={t.id} template={t} />
          ))}
        </div>
      )}
    </div>
  );
}

function Code({ children }: { children: React.ReactNode }) {
  return (
    <code className="rounded-[6px] border border-line2 bg-panel px-[6px] py-[1px] font-mono text-[12px] text-ink">
      {children}
    </code>
  );
}

function TemplateCard({ template }: { template: EmailTemplate }) {
  const router = useRouter();
  const { toast } = useToast();
  const [pending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [subject, setSubject] = useState(template.subject);
  const [body, setBody] = useState(template.body);
  const [active, setActive] = useState(template.is_active);

  const dirty =
    subject !== template.subject ||
    body !== template.body ||
    active !== template.is_active;

  function save() {
    startTransition(async () => {
      const res = await saveEmailTemplate({
        id: template.id,
        subject,
        body,
        is_active: active,
      });
      if (!res.ok) toast({ variant: "info", title: "Couldn't save", description: res.error });
      else {
        toast({ title: "Template saved" });
        router.refresh();
      }
    });
  }

  function sendTest() {
    startTransition(async () => {
      const res = await sendTestEmail(template.id);
      if (!res.ok)
        toast({ variant: "info", title: "Test not sent", description: res.error });
      else toast({ title: "Test sent", description: "Check your inbox." });
    });
  }

  const inputCls =
    "w-full rounded-[10px] border-[1.5px] border-line2 bg-card2 px-[13px] py-[10px] text-[14px] text-ink placeholder:text-mute";

  return (
    <div className="rounded-[16px] border border-line2 bg-card shadow-soft">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-3 px-5 py-4 text-left"
      >
        {open ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[15px] font-bold text-ink">{template.name}</span>
            <span
              className={cn(
                "rounded-full border px-2 py-[1px] text-[10.5px] font-bold uppercase tracking-[0.05em]",
                active
                  ? "border-ok/35 bg-ok/[0.08] text-ok"
                  : "border-line2 bg-panel text-mute",
              )}
            >
              {active ? "On" : "Off"}
            </span>
          </div>
          {template.description && (
            <p className="mt-[2px] text-[12.5px] text-mute">{template.description}</p>
          )}
        </div>
      </button>

      {open && (
        <div className="border-t border-line px-5 py-4">
          <label className="flex flex-col gap-[6px]">
            <span className="text-[12.5px] font-bold text-ink">Subject</span>
            <input
              className={inputCls}
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
          </label>
          <label className="mt-4 flex flex-col gap-[6px]">
            <span className="text-[12.5px] font-bold text-ink">Body</span>
            <textarea
              rows={9}
              className={cn(inputCls, "resize-y leading-[1.6]")}
              value={body}
              onChange={(e) => setBody(e.target.value)}
            />
          </label>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <button
              type="button"
              disabled={pending || !dirty}
              onClick={save}
              className="inline-flex items-center gap-2 whitespace-nowrap rounded-full bg-acc px-4 py-[9px] text-[13px] font-bold text-white hover:bg-acc-b disabled:opacity-50"
            >
              {pending ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
              Save
            </button>
            <button
              type="button"
              onClick={() => setShowPreview((v) => !v)}
              className="inline-flex items-center gap-2 whitespace-nowrap rounded-full border-[1.5px] border-line2 px-4 py-[9px] text-[13px] font-bold text-ink transition-colors hover:border-acc hover:text-acc"
            >
              <Eye size={13} /> {showPreview ? "Hide preview" : "Preview"}
            </button>
            <button
              type="button"
              disabled={pending}
              onClick={sendTest}
              className="inline-flex items-center gap-2 whitespace-nowrap rounded-full border-[1.5px] border-line2 px-4 py-[9px] text-[13px] font-bold text-ink transition-colors hover:border-acc hover:text-acc disabled:opacity-60"
            >
              <Send size={13} /> Send me a test
            </button>
            <label className="ml-auto flex items-center gap-2 text-[13px] font-bold text-ink">
              <input
                type="checkbox"
                checked={active}
                onChange={(e) => setActive(e.target.checked)}
                className="h-4 w-4 rounded border-line2 text-acc focus:ring-acc"
              />
              Active
            </label>
          </div>
          {dirty && (
            <p className="mt-2 text-[12px] font-semibold text-acc-dim">
              Unsaved changes. Tests send the saved version.
            </p>
          )}

          {showPreview && (
            <div className="mt-4 overflow-hidden rounded-[12px] border border-line2">
              <div className="border-b border-line bg-panel px-4 py-2 text-[12.5px]">
                <span className="font-semibold text-mute">Subject: </span>
                <span className="font-bold text-ink">
                  {substituteVars(subject, SAMPLE_VARS)}
                </span>
              </div>
              <iframe
                title={`Preview of ${template.name}`}
                srcDoc={renderEmailHtml(substituteVars(body, SAMPLE_VARS))}
                className="h-[420px] w-full border-0 bg-white"
                sandbox=""
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
