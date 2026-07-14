"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import * as Dialog from "@radix-ui/react-dialog";
import {
  Plus,
  Table2,
  KanbanSquare,
  X,
  Search,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  Trash2,
} from "lucide-react";
import { LeadBadge } from "@/components/admin/ui";
import { useToast } from "@/components/ui/toaster";
import {
  createLead,
  updateLeadStatus,
  deleteLead,
} from "@/app/admin/(protected)/leads/actions";
import {
  INDUSTRY_LABEL,
  INDUSTRY_ORDER,
  LEAD_STATUS_LABEL,
  LEAD_STATUS_ORDER,
  type Lead,
  type LeadIndustry,
  type LeadStatus,
} from "@/lib/db-types";
import { cn } from "@/lib/utils";

type View = "table" | "board";
type Filter = LeadStatus | "all";
type SortKey = "business_name" | "contact_name" | "industry" | "city" | "status";
type SortState = { key: SortKey; dir: "asc" | "desc" };

export function LeadsView({
  leads,
  isOwner,
}: {
  leads: Lead[];
  isOwner: boolean;
}) {
  const [filter, setFilter] = useState<Filter>("all");
  const [view, setView] = useState<View>("table");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortState | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let rows = leads.filter((l) => {
      const matchesStatus = filter === "all" || l.status === filter;
      const matchesQuery =
        !q ||
        [l.business_name, l.contact_name, l.city, INDUSTRY_LABEL[l.industry]]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(q);
      return matchesStatus && matchesQuery;
    });
    if (sort) {
      const order = sort.dir === "asc" ? 1 : -1;
      rows = [...rows].sort(
        (a, b) => (a[sort.key] ?? "").localeCompare(b[sort.key] ?? "") * order,
      );
    }
    return rows;
  }, [leads, filter, query, sort]);

  const counts = useMemo(() => {
    const map: Record<string, number> = { all: leads.length };
    LEAD_STATUS_ORDER.forEach(
      (s) => (map[s] = leads.filter((l) => l.status === s).length),
    );
    return map;
  }, [leads]);

  function toggleSort(key: SortKey) {
    setSort((prev) =>
      prev?.key === key
        ? prev.dir === "asc"
          ? { key, dir: "desc" }
          : null
        : { key, dir: "asc" },
    );
  }

  return (
    <div>
      <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-[26px] font-extrabold tracking-[-0.02em] text-ink">
            Leads
          </h1>
          <p className="mt-1 text-[14.5px] text-body">
            {leads.length} prospects in the pipeline.
          </p>
        </div>
        <AddLeadDialog />
      </header>

      <div className="mb-4 flex items-center gap-2 rounded-full border border-line2 bg-card px-4 py-[9px] sm:max-w-[340px]">
        <Search size={16} className="text-mute" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search business, contact, or city…"
          className="w-full border-0 bg-transparent p-0 text-[14px] text-ink placeholder:text-mute focus:outline-none"
          style={{ boxShadow: "none" }}
        />
      </div>

      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {(["all", ...LEAD_STATUS_ORDER] as Filter[]).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setFilter(s)}
              className={cn(
                "inline-flex items-center gap-2 rounded-full border px-[13px] py-[6px] text-[13px] font-semibold transition-colors",
                filter === s
                  ? "border-ink bg-ink text-bg"
                  : "border-line2 bg-card text-body hover:border-acc/40",
              )}
            >
              {s === "all" ? "All" : LEAD_STATUS_LABEL[s]}
              <span
                className={cn(
                  "font-mono text-[11px]",
                  filter === s ? "text-bg/70" : "text-mute",
                )}
              >
                {counts[s] ?? 0}
              </span>
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1 rounded-full border border-line2 bg-card p-1">
          <ToggleBtn active={view === "table"} onClick={() => setView("table")}>
            <Table2 size={15} /> Table
          </ToggleBtn>
          <ToggleBtn active={view === "board"} onClick={() => setView("board")}>
            <KanbanSquare size={15} /> Board
          </ToggleBtn>
        </div>
      </div>

      {view === "table" ? (
        <LeadTable
          leads={filtered}
          sort={sort}
          onSort={toggleSort}
          isOwner={isOwner}
        />
      ) : (
        <LeadBoard leads={leads} filter={filter} />
      )}
    </div>
  );
}

const COLUMNS: { label: string; key?: SortKey }[] = [
  { label: "Business", key: "business_name" },
  { label: "Contact", key: "contact_name" },
  { label: "Industry", key: "industry" },
  { label: "City", key: "city" },
  { label: "Status", key: "status" },
  { label: "Next action" },
];

function LeadTable({
  leads,
  sort,
  onSort,
  isOwner,
}: {
  leads: Lead[];
  sort: SortState | null;
  onSort: (key: SortKey) => void;
  isOwner: boolean;
}) {
  return (
    <div className="overflow-x-auto rounded-[16px] border border-line2 bg-card shadow-soft">
      <table className="w-full min-w-[860px] border-collapse text-left">
        <thead>
          <tr className="border-b border-line2 bg-panel">
            {COLUMNS.map((col) => {
              const active = col.key && sort?.key === col.key;
              return (
                <th
                  key={col.label}
                  className="px-5 py-[13px] font-mono text-[11px] font-semibold uppercase tracking-[0.1em] text-mute"
                >
                  {col.key ? (
                    <button
                      type="button"
                      onClick={() => onSort(col.key!)}
                      className="inline-flex items-center gap-1 uppercase tracking-[0.1em] transition-colors hover:text-ink"
                    >
                      {col.label}
                      {active ? (
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
          {leads.map((l) => (
            <LeadRow key={l.id} lead={l} isOwner={isOwner} />
          ))}
          {leads.length === 0 && (
            <tr>
              <td
                colSpan={isOwner ? COLUMNS.length + 1 : COLUMNS.length}
                className="px-5 py-10 text-center text-[14px] text-mute"
              >
                No leads here yet.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function LeadRow({ lead, isOwner }: { lead: Lead; isOwner: boolean }) {
  const router = useRouter();
  const { toast } = useToast();
  const [pending, startTransition] = useTransition();

  function changeStatus(status: LeadStatus) {
    startTransition(async () => {
      const res = await updateLeadStatus(lead.id, status);
      if (!res.ok) toast({ variant: "info", title: "Update failed", description: res.error });
      else router.refresh();
    });
  }

  function remove() {
    startTransition(async () => {
      const res = await deleteLead(lead.id);
      if (!res.ok) toast({ variant: "info", title: "Delete failed", description: res.error });
      else {
        toast({ title: "Lead deleted" });
        router.refresh();
      }
    });
  }

  return (
    <tr className="border-b border-line last:border-b-0 hover:bg-panel/60">
      <td className="px-5 py-[14px] text-[14px] font-bold text-ink">
        {lead.business_name}
      </td>
      <td className="px-5 py-[14px] text-[14px] text-body">
        {lead.contact_name ?? "—"}
      </td>
      <td className="px-5 py-[14px] text-[14px] text-body">
        {INDUSTRY_LABEL[lead.industry]}
      </td>
      <td className="px-5 py-[14px] text-[14px] text-body">
        {lead.city ?? "—"}
      </td>
      <td className="px-5 py-[14px]">
        <select
          aria-label={`Status for ${lead.business_name}`}
          value={lead.status}
          disabled={pending}
          onChange={(e) => changeStatus(e.target.value as LeadStatus)}
          className="cursor-pointer rounded-full border border-line2 bg-card px-2 py-1 text-[12.5px] font-semibold text-ink"
          style={{ boxShadow: "none" }}
        >
          {LEAD_STATUS_ORDER.map((s) => (
            <option key={s} value={s}>
              {LEAD_STATUS_LABEL[s]}
            </option>
          ))}
        </select>
      </td>
      <td className="px-5 py-[14px] text-[13.5px] font-semibold text-acc-dim">
        {lead.next_action ?? "—"}
      </td>
      {isOwner && (
        <td className="px-5 py-[14px] text-right">
          <button
            type="button"
            onClick={remove}
            disabled={pending}
            aria-label={`Delete ${lead.business_name}`}
            className="grid h-8 w-8 place-items-center rounded-[8px] text-mute transition-colors hover:bg-panel hover:text-acc disabled:opacity-50"
          >
            <Trash2 size={15} />
          </button>
        </td>
      )}
    </tr>
  );
}

function LeadBoard({ leads, filter }: { leads: Lead[]; filter: Filter }) {
  const cols = filter === "all" ? LEAD_STATUS_ORDER : [filter as LeadStatus];
  return (
    <div className="flex gap-4 overflow-x-auto pb-2">
      {cols.map((status) => {
        const items = leads.filter((l) => l.status === status);
        return (
          <div key={status} className="w-[260px] shrink-0">
            <div className="mb-3 flex items-center justify-between px-1">
              <LeadBadge status={status} />
              <span className="font-mono text-[12px] font-semibold text-mute">
                {items.length}
              </span>
            </div>
            <div className="flex flex-col gap-3">
              {items.map((l) => (
                <div
                  key={l.id}
                  className="rounded-[12px] border border-line2 bg-card p-3 shadow-soft"
                >
                  <div className="text-[14px] font-bold text-ink">
                    {l.business_name}
                  </div>
                  <div className="mt-[2px] text-[13px] text-body">
                    {l.contact_name ?? "—"}
                  </div>
                  <div className="mt-2 flex items-center justify-between text-[12px] text-mute">
                    <span>{INDUSTRY_LABEL[l.industry]}</span>
                    <span>{l.city ?? ""}</span>
                  </div>
                  {l.next_action && (
                    <div className="mt-2 border-t border-line pt-2 text-[12.5px] font-semibold text-acc-dim">
                      {l.next_action}
                    </div>
                  )}
                </div>
              ))}
              {items.length === 0 && (
                <div className="rounded-[12px] border border-dashed border-line2 px-3 py-6 text-center text-[12.5px] text-mute">
                  Empty
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function AddLeadDialog() {
  const router = useRouter();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [form, setForm] = useState({
    business_name: "",
    contact_name: "",
    industry: "hvac" as LeadIndustry,
    city: "",
    status: "new" as LeadStatus,
  });

  function submit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const res = await createLead({
        business_name: form.business_name,
        contact_name: form.contact_name,
        industry: form.industry,
        city: form.city,
        status: form.status,
        next_action: form.status === "new" ? "First touch" : "Follow up",
      });
      if (!res.ok) {
        toast({ variant: "info", title: "Couldn't add lead", description: res.error });
        return;
      }
      toast({ title: "Lead added", description: `${res.data.business_name} is in the pipeline.` });
      setForm({ business_name: "", contact_name: "", industry: "hvac", city: "", status: "new" });
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
          <Plus size={16} strokeWidth={2.6} /> Add lead
        </button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-ink/40 backdrop-blur-sm" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-[460px] -translate-x-1/2 -translate-y-1/2 rounded-[18px] border border-line2 bg-card p-6 shadow-card focus:outline-none">
          <div className="mb-5 flex items-center justify-between">
            <Dialog.Title className="font-display text-[19px] font-extrabold tracking-[-0.02em] text-ink">
              Add a lead
            </Dialog.Title>
            <Dialog.Close className="grid h-8 w-8 place-items-center rounded-full border border-line2 text-mute hover:text-ink">
              <X size={16} />
            </Dialog.Close>
          </div>
          <form onSubmit={submit} className="grid grid-cols-2 gap-4">
            <label className="col-span-2 flex flex-col gap-[6px]">
              <span className="text-[12.5px] font-bold text-ink">Business</span>
              <input
                className={inputCls}
                placeholder="Summit Plumbing"
                value={form.business_name}
                onChange={(e) => setForm({ ...form, business_name: e.target.value })}
                required
              />
            </label>
            <label className="flex flex-col gap-[6px]">
              <span className="text-[12.5px] font-bold text-ink">Contact</span>
              <input
                className={inputCls}
                placeholder="Dave K."
                value={form.contact_name}
                onChange={(e) => setForm({ ...form, contact_name: e.target.value })}
              />
            </label>
            <label className="flex flex-col gap-[6px]">
              <span className="text-[12.5px] font-bold text-ink">City</span>
              <input
                className={inputCls}
                placeholder="Denver, CO"
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
              />
            </label>
            <label className="flex flex-col gap-[6px]">
              <span className="text-[12.5px] font-bold text-ink">Industry</span>
              <select
                className={inputCls}
                value={form.industry}
                onChange={(e) =>
                  setForm({ ...form, industry: e.target.value as LeadIndustry })
                }
              >
                {INDUSTRY_ORDER.map((i) => (
                  <option key={i} value={i}>
                    {INDUSTRY_LABEL[i]}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-[6px]">
              <span className="text-[12.5px] font-bold text-ink">Status</span>
              <select
                className={inputCls}
                value={form.status}
                onChange={(e) =>
                  setForm({ ...form, status: e.target.value as LeadStatus })
                }
              >
                {LEAD_STATUS_ORDER.map((s) => (
                  <option key={s} value={s}>
                    {LEAD_STATUS_LABEL[s]}
                  </option>
                ))}
              </select>
            </label>
            <div className="col-span-2 mt-2 flex justify-end gap-2">
              <Dialog.Close className="rounded-full border-[1.5px] border-line2 px-5 py-[10px] text-[14px] font-bold text-ink">
                Cancel
              </Dialog.Close>
              <button
                type="submit"
                disabled={pending}
                className="rounded-full bg-acc px-5 py-[10px] text-[14px] font-bold text-white hover:bg-acc-b disabled:opacity-70"
              >
                {pending ? "Adding…" : "Add lead"}
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function ToggleBtn({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-[6px] rounded-full px-[14px] py-[7px] text-[13px] font-bold transition-colors",
        active ? "bg-ink text-bg" : "text-body hover:text-ink",
      )}
    >
      {children}
    </button>
  );
}
