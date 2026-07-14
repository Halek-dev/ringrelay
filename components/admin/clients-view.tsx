"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import * as Dialog from "@radix-ui/react-dialog";
import {
  X,
  Check,
  Circle,
  Search,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  Trash2,
} from "lucide-react";
import { ClientBadge } from "@/components/admin/ui";
import { useToast } from "@/components/ui/toaster";
import {
  toggleOnboardingStep,
  deleteClientRecord,
} from "@/app/admin/(protected)/clients/actions";
import {
  PLAN_LABEL,
  type Client,
  type OnboardingStep,
} from "@/lib/db-types";
import { cn } from "@/lib/utils";

type SortKey = "business_name" | "plan" | "mrr" | "setup_status";
type SortState = { key: SortKey; dir: "asc" | "desc" };

const COLUMNS: { label: string; key?: SortKey }[] = [
  { label: "Business", key: "business_name" },
  { label: "Plan", key: "plan" },
  { label: "MRR", key: "mrr" },
  { label: "Setup status", key: "setup_status" },
  { label: "Go-live" },
  { label: "Onboarding" },
];

function money(n: number) {
  return n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
}

export function ClientsView({
  clients,
  stepsByClient,
  isOwner,
}: {
  clients: Client[];
  stepsByClient: Record<string, OnboardingStep[]>;
  isOwner: boolean;
}) {
  const [active, setActive] = useState<Client | null>(null);
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortState | null>(null);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = clients.filter(
      (c) =>
        !q ||
        [c.business_name, c.contact_name, PLAN_LABEL[c.plan]]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(q),
    );
    if (sort) {
      const order = sort.dir === "asc" ? 1 : -1;
      list = [...list].sort((a, b) => {
        if (sort.key === "mrr") return (a.mrr - b.mrr) * order;
        return String(a[sort.key]).localeCompare(String(b[sort.key])) * order;
      });
    }
    return list;
  }, [clients, query, sort]);

  function toggleSort(key: SortKey) {
    setSort((prev) =>
      prev?.key === key
        ? prev.dir === "asc"
          ? { key, dir: "desc" }
          : null
        : { key, dir: "asc" },
    );
  }

  const activeSteps = active ? (stepsByClient[active.id] ?? []) : [];

  return (
    <div>
      <header className="mb-6">
        <h1 className="font-display text-[26px] font-extrabold tracking-[-0.02em] text-ink">
          Clients
        </h1>
        <p className="mt-1 text-[14.5px] text-body">
          {clients.length} signed accounts. Click a row for onboarding progress.
        </p>
      </header>

      <div className="mb-4 flex items-center gap-2 rounded-full border border-line2 bg-card px-4 py-[9px] sm:max-w-[340px]">
        <Search size={16} className="text-mute" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search business, contact, or plan…"
          className="w-full border-0 bg-transparent p-0 text-[14px] text-ink placeholder:text-mute focus:outline-none"
          style={{ boxShadow: "none" }}
        />
      </div>

      <div className="overflow-x-auto rounded-[16px] border border-line2 bg-card shadow-soft">
        <table className="w-full min-w-[760px] border-collapse text-left">
          <thead>
            <tr className="border-b border-line2 bg-panel">
              {COLUMNS.map((col) => {
                const activeCol = col.key && sort?.key === col.key;
                return (
                  <th
                    key={col.label}
                    className="px-5 py-[13px] font-mono text-[11px] font-semibold uppercase tracking-[0.1em] text-mute"
                  >
                    {col.key ? (
                      <button
                        type="button"
                        onClick={() => toggleSort(col.key!)}
                        className="inline-flex items-center gap-1 uppercase tracking-[0.1em] transition-colors hover:text-ink"
                      >
                        {col.label}
                        {activeCol ? (
                          sort!.dir === "asc" ? (
                            <ChevronUp size={13} className="text-acc" />
                          ) : (
                            <ChevronDown size={13} className="text-acc" />
                          )
                        ) : (
                          <ChevronsUpDown size={13} className="text-mute/50" />
                        )}
                      </button>
                    ) : (
                      col.label
                    )}
                  </th>
                );
              })}
              {isOwner && <th className="px-5 py-[13px]" />}
            </tr>
          </thead>
          <tbody>
            {rows.map((c) => {
              const steps = stepsByClient[c.id] ?? [];
              const done = steps.filter((s) => s.is_complete).length;
              return (
                <tr
                  key={c.id}
                  onClick={() => setActive(c)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setActive(c);
                    }
                  }}
                  tabIndex={0}
                  role="button"
                  aria-label={`View onboarding details for ${c.business_name}`}
                  className="cursor-pointer border-b border-line last:border-b-0 hover:bg-panel/60 focus-visible:bg-panel/60"
                >
                  <td className="px-5 py-[14px]">
                    <div className="text-[14px] font-bold text-ink">
                      {c.business_name}
                    </div>
                    <div className="text-[12.5px] text-mute">
                      {c.contact_name ?? "—"}
                    </div>
                  </td>
                  <td className="px-5 py-[14px] text-[14px] font-semibold text-body">
                    {PLAN_LABEL[c.plan]}
                  </td>
                  <td className="px-5 py-[14px] text-[14px] font-bold text-ink">
                    {money(c.mrr)}
                  </td>
                  <td className="px-5 py-[14px]">
                    <ClientBadge status={c.setup_status} />
                  </td>
                  <td className="px-5 py-[14px] text-[13.5px] text-body">
                    {c.go_live_date ?? "TBD"}
                  </td>
                  <td className="px-5 py-[14px]">
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1">
                        {steps.map((s) => (
                          <span
                            key={s.id}
                            className={cn(
                              "h-[6px] w-[16px] rounded-full",
                              s.is_complete ? "bg-ok" : "bg-panel",
                            )}
                          />
                        ))}
                      </div>
                      <span className="font-mono text-[12px] text-mute">
                        {done}/{steps.length || 5}
                      </span>
                    </div>
                  </td>
                  {isOwner && (
                    <td
                      className="px-5 py-[14px] text-right"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <DeleteClientButton
                        id={c.id}
                        name={c.business_name}
                      />
                    </td>
                  )}
                </tr>
              );
            })}
            {rows.length === 0 && (
              <tr>
                <td
                  colSpan={isOwner ? COLUMNS.length + 1 : COLUMNS.length}
                  className="px-5 py-10 text-center text-[14px] text-mute"
                >
                  {query ? `No clients match “${query}”.` : "No clients yet."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Detail drawer */}
      <Dialog.Root open={!!active} onOpenChange={(o) => !o && setActive(null)}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-ink/40 backdrop-blur-sm" />
          <Dialog.Content className="fixed inset-y-0 right-0 z-50 w-full max-w-[420px] overflow-y-auto border-l border-line2 bg-card shadow-card focus:outline-none">
            {active && (
              <div>
                <div className="hazard-stripe h-[3px]" />
                <div className="flex items-start justify-between gap-3 border-b border-line px-6 py-5">
                  <div>
                    <Dialog.Title className="font-display text-[20px] font-extrabold tracking-[-0.02em] text-ink">
                      {active.business_name}
                    </Dialog.Title>
                    <p className="mt-[2px] text-[13.5px] text-body">
                      {active.contact_name ?? "—"}
                    </p>
                  </div>
                  <Dialog.Close className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-line2 text-mute hover:text-ink">
                    <X size={16} />
                  </Dialog.Close>
                </div>

                <div className="grid grid-cols-3 gap-3 px-6 py-5">
                  <MetaCell label="Plan" value={PLAN_LABEL[active.plan]} />
                  <MetaCell label="MRR" value={money(active.mrr)} />
                  <MetaCell label="Go-live" value={active.go_live_date ?? "TBD"} />
                </div>

                <div className="px-6 pb-6">
                  <div className="mb-3 flex items-center justify-between">
                    <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-mute">
                      Onboarding progress
                    </span>
                    <ClientBadge status={active.setup_status} />
                  </div>
                  <OnboardingChecklist clientId={active.id} steps={activeSteps} />
                </div>
              </div>
            )}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}

function OnboardingChecklist({
  clientId,
  steps,
}: {
  clientId: string;
  steps: OnboardingStep[];
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [pending, startTransition] = useTransition();

  function toggle(step: OnboardingStep) {
    startTransition(async () => {
      const res = await toggleOnboardingStep(
        step.id,
        clientId,
        !step.is_complete,
      );
      if (!res.ok) {
        toast({ variant: "info", title: "Couldn't update", description: res.error });
        return;
      }
      if (res.data.setupStatus === "live")
        toast({ title: "Client is live", description: "All onboarding steps done." });
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col">
      {steps.map((step, i) => {
        const last = i === steps.length - 1;
        return (
          <div key={step.id} className="grid grid-cols-[32px_1fr] gap-x-3">
            <div className="flex flex-col items-center">
              <button
                type="button"
                disabled={pending}
                onClick={() => toggle(step)}
                aria-label={
                  step.is_complete ? "Mark step incomplete" : "Mark step complete"
                }
                className={cn(
                  "grid h-8 w-8 shrink-0 place-items-center rounded-[10px] border-[1.5px] transition-colors disabled:opacity-60",
                  step.is_complete
                    ? "border-ok bg-ok text-white"
                    : "border-line2 bg-card text-mute hover:border-acc",
                )}
              >
                {step.is_complete ? (
                  <Check size={15} strokeWidth={3} />
                ) : (
                  <Circle size={8} className="fill-current" />
                )}
              </button>
              {!last && (
                <span
                  className={cn(
                    "my-1 min-h-[22px] w-[2px] flex-1",
                    step.is_complete ? "bg-ok/40" : "bg-line",
                  )}
                />
              )}
            </div>
            <div className={cn("pb-4", last && "pb-0")}>
              <div className="text-[14.5px] font-bold text-ink">{step.label}</div>
              <p className="mt-1 text-[13px] leading-[1.5] text-body">
                {step.is_complete && step.completed_at
                  ? `Completed ${new Date(step.completed_at).toLocaleDateString()}`
                  : "Pending"}
              </p>
            </div>
          </div>
        );
      })}
      {steps.length === 0 && (
        <p className="text-[13px] text-mute">No onboarding steps found.</p>
      )}
    </div>
  );
}

function DeleteClientButton({ id, name }: { id: string; name: string }) {
  const router = useRouter();
  const { toast } = useToast();
  const [pending, startTransition] = useTransition();

  function remove() {
    startTransition(async () => {
      const res = await deleteClientRecord(id);
      if (!res.ok) toast({ variant: "info", title: "Delete failed", description: res.error });
      else {
        toast({ title: "Client deleted" });
        router.refresh();
      }
    });
  }

  return (
    <button
      type="button"
      onClick={remove}
      disabled={pending}
      aria-label={`Delete ${name}`}
      className="grid h-8 w-8 place-items-center rounded-[8px] text-mute transition-colors hover:bg-panel hover:text-acc disabled:opacity-50"
    >
      <Trash2 size={15} />
    </button>
  );
}

function MetaCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[12px] border border-line bg-panel px-3 py-[10px]">
      <div className="text-[11px] font-semibold uppercase tracking-[0.06em] text-mute">
        {label}
      </div>
      <div className="mt-[2px] text-[14px] font-bold text-ink">{value}</div>
    </div>
  );
}
