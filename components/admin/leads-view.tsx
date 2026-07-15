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
  Check,
  Phone,
  Mail,
  Copy,
  Send,
  Lock,
  Pencil,
  Skull,
  Bot,
} from "lucide-react";
import { LeadBadge, TierBadge, ProgressBar } from "@/components/admin/ui";
import { useToast } from "@/components/ui/toaster";
import {
  createLead,
  deleteLead,
  saveQualification,
  logTouch,
  setCompetitorInfo,
} from "@/app/admin/(protected)/leads/actions";
import {
  INDUSTRY_LABEL,
  INDUSTRY_ORDER,
  LEAD_STATUS_LABEL,
  LEAD_STATUS_ORDER,
  TIER_LABEL,
  TOUCH_TYPE_LABEL,
  OUTREACH_CHANNEL_LABEL,
  type Lead,
  type LeadIndustry,
  type LeadStatus,
  type LeadTier,
  type OutreachChannel,
  type OutreachLog,
  type OutreachTemplate,
  type QualificationAnswers,
  type TouchType,
} from "@/lib/db-types";
import {
  FUNNEL_STEPS,
  TOTAL_STEPS,
  computeScore,
  computeTier,
  deriveStatus,
  killInfo,
  scoreBreakdown,
  answeredCount,
  isComplete,
  isAiReceptionist,
  switchingPlan,
  TIER_PLAN,
} from "@/lib/qualification";
import { cn } from "@/lib/utils";

type View = "table" | "board";
type Filter = LeadStatus | "all";
type TierFilter = LeadTier | "all";
type SortKey =
  | "business_name"
  | "contact_name"
  | "industry"
  | "city"
  | "score"
  | "tier"
  | "status";
type SortState = { key: SortKey; dir: "asc" | "desc" };

const TIER_RANK: Record<string, number> = { hot: 4, warm: 3, cool: 2, skip: 1 };
const TIERS: LeadTier[] = ["hot", "warm", "cool", "skip"];

/** A lead whose call test found a competitor AI receptionist (switching pipeline). */
function isCompetitorLead(l: Lead): boolean {
  return l.qualification?.call_test === "ai_receptionist";
}

export function LeadsView({
  leads,
  templates,
  touchesByLead,
  isOwner,
}: {
  leads: Lead[];
  templates: OutreachTemplate[];
  touchesByLead: Record<string, OutreachLog[]>;
  isOwner: boolean;
}) {
  const [filter, setFilter] = useState<Filter>("all");
  const [tierFilter, setTierFilter] = useState<TierFilter>("all");
  const [competitorOnly, setCompetitorOnly] = useState(false);
  const [view, setView] = useState<View>("table");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortState>({ key: "score", dir: "desc" });
  const [activeId, setActiveId] = useState<string | null>(null);

  const competitorCount = useMemo(
    () => leads.filter(isCompetitorLead).length,
    [leads],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const rows = leads.filter((l) => {
      const matchesStatus = filter === "all" || l.status === filter;
      const matchesTier = tierFilter === "all" || l.tier === tierFilter;
      const matchesCompetitor = !competitorOnly || isCompetitorLead(l);
      const matchesQuery =
        !q ||
        [l.business_name, l.contact_name, l.city, INDUSTRY_LABEL[l.industry]]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(q);
      return matchesStatus && matchesTier && matchesCompetitor && matchesQuery;
    });
    const dir = sort.dir === "asc" ? 1 : -1;
    return [...rows].sort((a, b) => {
      if (sort.key === "score") {
        if (a.score == null && b.score == null) return 0;
        if (a.score == null) return 1;
        if (b.score == null) return -1;
        return (a.score - b.score) * dir;
      }
      if (sort.key === "tier") {
        const av = a.tier ? TIER_RANK[a.tier] : 0;
        const bv = b.tier ? TIER_RANK[b.tier] : 0;
        return (av - bv) * dir;
      }
      return String(a[sort.key] ?? "").localeCompare(String(b[sort.key] ?? "")) * dir;
    });
  }, [leads, filter, tierFilter, competitorOnly, query, sort]);

  function toggleSort(key: SortKey) {
    setSort((prev) =>
      prev.key === key
        ? { key, dir: prev.dir === "asc" ? "desc" : "asc" }
        : { key, dir: key === "score" || key === "tier" ? "desc" : "asc" },
    );
  }

  const activeLead = activeId ? leads.find((l) => l.id === activeId) ?? null : null;

  return (
    <div>
      <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-[26px] font-extrabold tracking-[-0.02em] text-ink">
            Leads
          </h1>
          <p className="mt-1 text-[14.5px] text-body">
            {leads.length} prospects, sorted hottest first. Add a lead, then open
            it to run the 7-step funnel.
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
          placeholder="Search business, contact, or city"
          className="w-full border-0 bg-transparent p-0 text-[14px] text-ink placeholder:text-mute focus:outline-none"
          style={{ boxShadow: "none" }}
        />
      </div>

      {/* Tier filter */}
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <span className="font-mono text-[10.5px] font-semibold uppercase tracking-[0.12em] text-mute">
          Tier
        </span>
        {(["all", ...TIERS] as TierFilter[]).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTierFilter(t)}
            className={cn(
              "rounded-full border px-[12px] py-[5px] text-[12.5px] font-semibold transition-colors",
              tierFilter === t
                ? "border-acc bg-acc/10 text-acc-dim"
                : "border-line2 bg-card text-body hover:border-acc/40",
            )}
          >
            {t === "all" ? "All" : TIER_LABEL[t]}
          </button>
        ))}
        {competitorCount > 0 && (
          <button
            type="button"
            onClick={() => setCompetitorOnly((v) => !v)}
            className={cn(
              "inline-flex items-center gap-[6px] rounded-full border px-[12px] py-[5px] text-[12.5px] font-semibold transition-colors",
              competitorOnly
                ? "border-ai-line bg-ai-bg2 text-acc-dim"
                : "border-line2 bg-card text-body hover:border-acc/40",
            )}
          >
            <Bot size={13} /> Competitor switch ({competitorCount})
          </button>
        )}
      </div>

      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {(["all", ...LEAD_STATUS_ORDER] as Filter[]).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setFilter(s)}
              className={cn(
                "rounded-full border px-[13px] py-[6px] text-[13px] font-semibold transition-colors",
                filter === s
                  ? "border-ink bg-ink text-bg"
                  : "border-line2 bg-card text-body hover:border-acc/40",
              )}
            >
              {s === "all" ? "All" : LEAD_STATUS_LABEL[s]}
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
          onOpen={(l) => setActiveId(l.id)}
        />
      ) : (
        <LeadBoard leads={filtered} onOpen={(l) => setActiveId(l.id)} />
      )}

      <Dialog.Root open={!!activeLead} onOpenChange={(o) => !o && setActiveId(null)}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-ink/40 backdrop-blur-sm" />
          <Dialog.Content className="fixed inset-y-0 right-0 z-50 w-full max-w-[480px] overflow-y-auto border-l border-line2 bg-card shadow-card focus:outline-none">
            {activeLead && (
              <LeadDrawer
                lead={activeLead}
                templates={templates}
                touches={touchesByLead[activeLead.id] ?? []}
              />
            )}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}

/* ------------------------------ table ------------------------------ */

const COLUMNS: { label: string; key?: SortKey }[] = [
  { label: "Business", key: "business_name" },
  { label: "Contact", key: "contact_name" },
  { label: "Industry", key: "industry" },
  { label: "Score", key: "score" },
  { label: "Tier", key: "tier" },
  { label: "Status", key: "status" },
];

function LeadTable({
  leads,
  sort,
  onSort,
  isOwner,
  onOpen,
}: {
  leads: Lead[];
  sort: SortState;
  onSort: (key: SortKey) => void;
  isOwner: boolean;
  onOpen: (l: Lead) => void;
}) {
  return (
    <div className="overflow-x-auto rounded-[16px] border border-line2 bg-card shadow-soft">
      <table className="w-full min-w-[820px] border-collapse text-left">
        <thead>
          <tr className="border-b border-line2 bg-panel">
            {COLUMNS.map((col) => {
              const activeCol = col.key && sort.key === col.key;
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
                      {activeCol ? (
                        sort.dir === "asc" ? (
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
            <LeadRow key={l.id} lead={l} isOwner={isOwner} onOpen={onOpen} />
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

function LeadRow({
  lead,
  isOwner,
  onOpen,
}: {
  lead: Lead;
  isOwner: boolean;
  onOpen: (l: Lead) => void;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [pending, startTransition] = useTransition();

  function remove(e: React.MouseEvent) {
    e.stopPropagation();
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
    <tr
      onClick={() => onOpen(lead)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onOpen(lead);
        }
      }}
      tabIndex={0}
      role="button"
      aria-label={`Open ${lead.business_name}`}
      className="cursor-pointer border-b border-line last:border-b-0 hover:bg-panel/60 focus-visible:bg-panel/60"
    >
      <td className="px-5 py-[14px] text-[14px] font-bold text-ink">
        <span className="inline-flex items-center gap-2">
          {lead.business_name}
          {isCompetitorLead(lead) && <CompetitorTag />}
        </span>
      </td>
      <td className="px-5 py-[14px] text-[14px] text-body">
        {lead.contact_name ?? "-"}
      </td>
      <td className="px-5 py-[14px] text-[14px] text-body">
        {INDUSTRY_LABEL[lead.industry]}
      </td>
      <td className="px-5 py-[14px]">
        {lead.score == null ? (
          <span className="text-[13.5px] text-mute">-</span>
        ) : (
          <span className="font-mono text-[14px] font-bold text-ink">{lead.score}</span>
        )}
      </td>
      <td className="px-5 py-[14px]">
        {lead.tier ? <TierBadge tier={lead.tier} /> : <span className="text-mute">-</span>}
      </td>
      <td className="px-5 py-[14px]">
        <LeadBadge status={lead.status} />
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

/* ------------------------------ board ------------------------------ */

function LeadBoard({ leads, onOpen }: { leads: Lead[]; onOpen: (l: Lead) => void }) {
  return (
    <div className="flex gap-4 overflow-x-auto pb-2">
      {LEAD_STATUS_ORDER.map((status) => {
        const items = leads
          .filter((l) => l.status === status)
          .sort((a, b) => (b.score ?? -1) - (a.score ?? -1));
        return (
          <div key={status} className="w-[250px] shrink-0">
            <div className="mb-3 flex items-center justify-between px-1">
              <LeadBadge status={status} />
              <span className="font-mono text-[12px] font-semibold text-mute">
                {items.length}
              </span>
            </div>
            <div className="flex flex-col gap-3">
              {items.map((l) => (
                <button
                  key={l.id}
                  type="button"
                  onClick={() => onOpen(l)}
                  className="w-full rounded-[12px] border border-line2 bg-card p-3 text-left shadow-soft transition-colors hover:border-acc/40"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 text-[14px] font-bold text-ink">
                      {l.business_name}
                      {isCompetitorLead(l) && <CompetitorTag />}
                    </div>
                    {l.tier && <TierBadge tier={l.tier} />}
                  </div>
                  <div className="mt-2 flex items-center justify-between text-[12px] text-mute">
                    <span>{INDUSTRY_LABEL[l.industry]}</span>
                    <span>{l.score != null ? `Score ${l.score}` : (l.city ?? "")}</span>
                  </div>
                </button>
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

/* ------------------------- lead detail drawer ------------------------- */

function LeadDrawer({
  lead,
  templates,
  touches,
}: {
  lead: Lead;
  templates: OutreachTemplate[];
  touches: OutreachLog[];
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [pending, startTransition] = useTransition();
  const [answers, setAnswers] = useState<QualificationAnswers>(lead.qualification ?? {});
  const [editing, setEditing] = useState<number | null>(null);

  const kill = killInfo(answers);
  const score = computeScore(answers, lead.industry);
  const tier = computeTier(score);
  const status = deriveStatus(answers);
  const answered = answeredCount(answers);
  const complete = isComplete(answers);
  const firstUnanswered = FUNNEL_STEPS.findIndex((s) => !answers[s.key]);
  const expanded = editing !== null ? editing : kill ? -1 : firstUnanswered;

  function choose(stepKey: string, value: string) {
    const next: QualificationAnswers = { ...answers, [stepKey]: value };
    setAnswers(next);
    setEditing(null);
    startTransition(async () => {
      const res = await saveQualification(lead.id, lead.industry, next);
      if (!res.ok) {
        setAnswers(answers);
        toast({ variant: "info", title: "Couldn't save", description: res.error });
        return;
      }
      router.refresh();
    });
  }

  const progressStep = complete || kill ? TOTAL_STEPS : Math.min(answered + 1, TOTAL_STEPS);

  return (
    <div>
      <div className="hazard-stripe h-[3px]" />
      <div className="flex items-start justify-between gap-3 border-b border-line px-6 py-5">
        <div>
          <Dialog.Title className="font-display text-[20px] font-extrabold tracking-[-0.02em] text-ink">
            {lead.business_name}
          </Dialog.Title>
          <p className="mt-[2px] text-[13.5px] text-body">
            {lead.contact_name ?? "-"} · {INDUSTRY_LABEL[lead.industry]}
          </p>
        </div>
        <Dialog.Close className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-line2 text-mute hover:text-ink">
          <X size={16} />
        </Dialog.Close>
      </div>

      {/* Contact */}
      <div className="flex flex-col gap-2 border-b border-line px-6 py-4">
        <a
          href={`tel:${lead.phone ?? ""}`}
          className="inline-flex items-center gap-2 text-[14.5px] font-bold text-acc-dim hover:text-acc"
        >
          <Phone size={15} strokeWidth={2.2} /> {lead.phone ?? "No number"}
        </a>
        {lead.email && (
          <a
            href={`mailto:${lead.email}`}
            className="inline-flex items-center gap-2 text-[13.5px] text-body hover:text-ink"
          >
            <Mail size={14} /> {lead.email}
          </a>
        )}
        <div className="flex flex-wrap gap-x-5 gap-y-1 text-[13px] text-mute">
          {lead.city && <span>{lead.city}</span>}
          {lead.source && <span>Source: {lead.source}</span>}
        </div>
        {lead.notes && (
          <p className="mt-1 rounded-[10px] border border-line bg-panel px-3 py-2 text-[13px] leading-[1.5] text-body">
            {lead.notes}
          </p>
        )}
      </div>

      {/* Funnel */}
      <div className="border-b border-line px-6 py-5">
        <div className="mb-3 flex items-center justify-between">
          <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-mute">
            Qualification
          </span>
          <span className="font-mono text-[12px] text-mute">
            Step {progressStep} of {TOTAL_STEPS}
          </span>
        </div>

        <div className="flex flex-col gap-2">
          {FUNNEL_STEPS.map((step, i) => {
            const value = answers[step.key];
            const chosen = step.outcomes.find((o) => o.value === value);
            const isKilledHere = kill && kill.step === step.step;
            const blocked = kill ? step.step > kill.step : false;
            const isExpanded = expanded === i;

            if (blocked) {
              return (
                <div
                  key={step.key}
                  className="flex items-center gap-2 rounded-[12px] border border-line bg-panel/50 px-3 py-2 text-[13px] text-mute"
                >
                  <Lock size={13} /> {step.step}. {step.title}
                  <span className="ml-auto text-[11px]">skipped</span>
                </div>
              );
            }

            if (chosen && !isExpanded) {
              return (
                <button
                  key={step.key}
                  type="button"
                  onClick={() => setEditing(i)}
                  className="flex items-center gap-2 rounded-[12px] border border-line2 bg-card2 px-3 py-2 text-left"
                >
                  <span
                    className={cn(
                      "grid h-5 w-5 shrink-0 place-items-center rounded-full",
                      isKilledHere ? "bg-ink text-bg" : "bg-ok text-white",
                    )}
                  >
                    {isKilledHere ? <Skull size={12} /> : <Check size={12} strokeWidth={3} />}
                  </span>
                  <span className="text-[13.5px] font-bold text-ink">
                    {step.step}. {step.title}
                  </span>
                  <span className="ml-auto flex items-center gap-2 text-[12.5px] text-body">
                    {chosen.label}
                    <Pencil size={12} className="text-mute" />
                  </span>
                </button>
              );
            }

            if (isExpanded) {
              return (
                <div
                  key={step.key}
                  className="rounded-[12px] border-[1.5px] border-acc/50 bg-card p-3"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[11px] font-semibold text-acc">
                      Step {step.step}
                    </span>
                    <span className="text-[13.5px] font-bold text-ink">{step.title}</span>
                  </div>
                  <p className="mt-1 text-[13px] leading-[1.45] text-body">
                    {step.instruction}
                  </p>
                  <div className="mt-3 flex flex-col gap-2">
                    {step.outcomes.map((o) => (
                      <button
                        key={o.value}
                        type="button"
                        disabled={pending}
                        onClick={() => choose(step.key, o.value)}
                        className={cn(
                          "flex items-center justify-between gap-2 rounded-[10px] border px-3 py-[9px] text-left text-[13px] font-semibold transition-colors disabled:opacity-60",
                          o.kill
                            ? "border-line2 text-mute hover:border-ink hover:text-ink"
                            : "border-line2 text-ink hover:border-acc/50 hover:bg-ai-bg2",
                          value === o.value && !o.kill && "border-ok bg-ok/[0.08]",
                          value === o.value && o.kill && "border-ink bg-panel",
                        )}
                      >
                        <span className="flex items-center gap-2">
                          {o.kill && <Skull size={14} className="text-mute" />}
                          {o.label}
                        </span>
                        {o.points > 0 && (
                          <span className="font-mono text-[11px] text-mute">+{o.points}</span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              );
            }

            // future, dimmed
            return (
              <div
                key={step.key}
                className="flex items-center gap-2 rounded-[12px] border border-line bg-card px-3 py-2 text-[13px] text-mute"
              >
                <span className="grid h-5 w-5 place-items-center rounded-full border border-line2 font-mono text-[10px]">
                  {step.step}
                </span>
                {step.title}
              </div>
            );
          })}
        </div>

        {isAiReceptionist(answers) && <CompetitorCapture lead={lead} />}

        {kill && (
          <div className="mt-3 rounded-[12px] border border-line2 bg-panel px-3 py-3">
            <div className="flex items-center gap-2 text-[13.5px] font-bold text-ink">
              <Skull size={15} /> Killed at step {kill.step}: {killReasonShort(kill.reason)}
            </div>
            <p className="mt-1 text-[12.5px] leading-[1.5] text-body">
              Killing leads early is the system working. Most leads should not
              pass. Tap the step above to change your answer if this was a
              mistake.
            </p>
          </div>
        )}
      </div>

      {/* Result: score + recommendation */}
      {complete && !kill && (
        <ResultPanel
          lead={lead}
          answers={answers}
          score={score}
          tier={tier}
          status={status}
          templates={templates}
        />
      )}

      {/* Log touch + history */}
      <LogTouchPanel leadId={lead.id} touches={touches} disabled={status === "killed"} />
    </div>
  );
}

function ResultPanel({
  lead,
  answers,
  score,
  tier,
  status,
  templates,
}: {
  lead: Lead;
  answers: QualificationAnswers;
  score: number;
  tier: LeadTier;
  status: LeadStatus;
  templates: OutreachTemplate[];
}) {
  const breakdown = scoreBreakdown(answers, lead.industry);
  const plan = TIER_PLAN[tier];
  const isAi = isAiReceptionist(answers);
  const sPlan = isAi ? switchingPlan(lead.competitor_after_hours_only) : null;
  const rec = sPlan
    ? templates.find((t) => t.category === sPlan.templateCategory)
    : plan.templateHint
      ? templates.find((t) => t.name.toLowerCase().includes(plan.templateHint!))
      : undefined;
  const voicemail = answers["call_test"] === "voicemail";

  return (
    <div className="border-b border-line px-6 py-5">
      <div className="mb-2 flex items-center justify-between">
        <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-mute">
          Score
        </span>
        <LeadBadge status={status} />
      </div>
      <div className="flex items-baseline gap-3">
        <span className="font-display text-[34px] font-extrabold leading-none tracking-[-0.02em] text-ink">
          {score}
          <span className="text-[16px] font-bold text-mute">/100</span>
        </span>
        <TierBadge tier={tier} />
      </div>

      {/* transparent breakdown */}
      <div className="mt-3 flex flex-col gap-1 rounded-[10px] border border-line bg-panel px-3 py-2">
        {breakdown.map((b, i) => (
          <div key={i} className="flex items-center justify-between text-[12.5px]">
            <span className="text-body">{b.label}</span>
            <span className="font-mono font-semibold text-ink">+{b.points}</span>
          </div>
        ))}
        <div className="mt-1 flex items-center justify-between border-t border-line pt-1 text-[12.5px] font-bold">
          <span className="text-ink">Total</span>
          <span className="font-mono text-ink">{score}</span>
        </div>
      </div>

      {/* recommendation */}
      <div className="mt-4 rounded-[12px] border border-acc/30 bg-acc/[0.06] px-3 py-3">
        {sPlan ? (
          <>
            <div className="flex items-center gap-2 text-[13.5px] font-bold text-acc-dim">
              <Bot size={15} /> {sPlan.headline}
            </div>
            <p className="mt-[2px] text-[13px] text-body">{sPlan.action}</p>
            <p className="mt-2 rounded-[8px] bg-card px-2 py-[6px] text-[12.5px] font-medium italic leading-[1.5] text-ink">
              Suggested opener: {sPlan.opener}
            </p>
          </>
        ) : (
          <>
            <div className="text-[13.5px] font-bold text-acc-dim">{plan.headline}</div>
            <p className="mt-[2px] text-[13px] text-body">{plan.action}</p>
            {voicemail && (
              <p className="mt-2 rounded-[8px] bg-card px-2 py-1 text-[12.5px] font-semibold text-ink">
                You called and got voicemail. Open with that. It is your
                strongest proof.
              </p>
            )}
          </>
        )}
      </div>

      {rec && <RecommendedTemplate template={rec} />}
    </div>
  );
}

function RecommendedTemplate({ template }: { template: OutreachTemplate }) {
  const [copied, setCopied] = useState(false);
  async function copy() {
    try {
      await navigator.clipboard.writeText(template.body);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard unavailable */
    }
  }
  return (
    <div className="mt-3 rounded-[12px] border border-line2 bg-card2 p-3">
      <div className="mb-2 flex items-center justify-between gap-2">
        <span className="text-[12.5px] font-bold text-ink">{template.name}</span>
        <button
          type="button"
          onClick={copy}
          className={cn(
            "inline-flex items-center gap-[5px] rounded-full border px-3 py-[5px] text-[12px] font-bold transition-colors",
            copied
              ? "border-ok/40 bg-ok/[0.08] text-ok"
              : "border-line2 text-body hover:border-acc hover:text-acc",
          )}
        >
          {copied ? <Check size={13} strokeWidth={2.6} /> : <Copy size={13} />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <p className="whitespace-pre-wrap text-[12.5px] leading-[1.55] text-bubble-ink">
        {template.body}
      </p>
    </div>
  );
}

function LogTouchPanel({
  leadId,
  touches,
  disabled,
}: {
  leadId: string;
  touches: OutreachLog[];
  disabled: boolean;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [pending, startTransition] = useTransition();
  const [touchType, setTouchType] = useState<TouchType>("first_touch");
  const [channel, setChannel] = useState<OutreachChannel>("email");

  function submit() {
    startTransition(async () => {
      const res = await logTouch({ leadId, touchType, channel });
      if (!res.ok) toast({ variant: "info", title: "Couldn't log", description: res.error });
      else {
        toast({ title: "Touch logged" });
        router.refresh();
      }
    });
  }

  const selectCls =
    "rounded-[9px] border-[1.5px] border-line2 bg-card2 px-2 py-[8px] text-[13px] font-semibold text-ink";

  return (
    <div className="px-6 py-5">
      <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-mute">
        Log touch
      </span>
      <p className="mt-1 text-[12.5px] text-body">
        Log the message you actually sent. This is what moves your daily plan.
      </p>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <select
          value={touchType}
          onChange={(e) => setTouchType(e.target.value as TouchType)}
          className={selectCls}
          disabled={disabled}
        >
          {(Object.keys(TOUCH_TYPE_LABEL) as TouchType[]).map((t) => (
            <option key={t} value={t}>
              {TOUCH_TYPE_LABEL[t]}
            </option>
          ))}
        </select>
        <select
          value={channel}
          onChange={(e) => setChannel(e.target.value as OutreachChannel)}
          className={selectCls}
          disabled={disabled}
        >
          {(Object.keys(OUTREACH_CHANNEL_LABEL) as OutreachChannel[]).map((c) => (
            <option key={c} value={c}>
              {OUTREACH_CHANNEL_LABEL[c]}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={submit}
          disabled={pending || disabled}
          className="inline-flex items-center gap-2 rounded-full bg-acc px-4 py-[8px] text-[13px] font-bold text-white hover:bg-acc-b disabled:opacity-50"
        >
          <Send size={14} /> Log
        </button>
      </div>

      {touches.length > 0 && (
        <div className="mt-4 flex flex-col gap-2">
          {touches.map((t) => (
            <div
              key={t.id}
              className="flex items-center gap-2 rounded-[10px] border border-line bg-panel px-3 py-2 text-[12.5px]"
            >
              <span className="font-semibold text-ink">
                {TOUCH_TYPE_LABEL[t.touch_type]}
              </span>
              <span className="text-mute">via {OUTREACH_CHANNEL_LABEL[t.channel]}</span>
              <span className="ml-auto text-mute">
                {new Date(t.sent_at).toLocaleDateString()}
              </span>
              {t.replied && (
                <span className="rounded-full border border-ok/35 bg-ok/[0.08] px-2 py-[1px] text-[11px] font-bold text-ok">
                  replied
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function killReasonShort(reason: string): string {
  return reason.replace(/^Kill:\s*/, "");
}

const COMPETITOR_NOTE_MARK = "[Competitor AI]";

/** Pull the saved competitor greeting back out of the lead's notes. */
function extractCompetitorNote(notes: string | null): string {
  if (!notes) return "";
  const line = notes.split("\n").find((l) => l.startsWith(COMPETITOR_NOTE_MARK));
  return line ? line.slice(COMPETITOR_NOTE_MARK.length).trim() : "";
}

/**
 * Shown on the call-test step when a prospect already runs an AI receptionist.
 * Captures what it said (kept on the lead's notes) and whether it only covers
 * after hours (the flag that decides which switching pitch we recommend).
 */
function CompetitorCapture({ lead }: { lead: Lead }) {
  const router = useRouter();
  const { toast } = useToast();
  const [pending, startTransition] = useTransition();
  const [afterHoursOnly, setAfterHoursOnly] = useState(
    lead.competitor_after_hours_only,
  );
  const [greeting, setGreeting] = useState(() => extractCompetitorNote(lead.notes));

  function save() {
    startTransition(async () => {
      const res = await setCompetitorInfo({
        leadId: lead.id,
        afterHoursOnly,
        greeting,
      });
      if (!res.ok)
        toast({ variant: "info", title: "Couldn't save", description: res.error });
      else {
        toast({ title: "Competitor detail saved" });
        router.refresh();
      }
    });
  }

  return (
    <div className="mt-3 rounded-[12px] border border-ai-line bg-ai-bg2/60 p-3">
      <div className="flex items-center gap-2 text-[13px] font-bold text-acc-dim">
        <Bot size={15} /> Competitor detail
      </div>
      <p className="mt-1 text-[12.5px] leading-[1.45] text-body">
        They already run an AI receptionist, so this is a switching sale. Capture
        what it said. If it only covers after hours, their daytime calls are
        still going unanswered.
      </p>

      <label className="mt-3 block text-[12px] font-semibold text-ink">
        What did it say? (paste the greeting if you can)
      </label>
      <textarea
        rows={2}
        value={greeting}
        onChange={(e) => setGreeting(e.target.value)}
        placeholder="My name is Ruby, an AI representative with ..."
        className="mt-1 w-full resize-y rounded-[9px] border-[1.5px] border-line2 bg-card px-2 py-[8px] text-[13px] leading-[1.45] text-ink placeholder:text-mute"
      />

      <label className="mt-3 flex items-center gap-2 text-[13px] font-semibold text-ink">
        <input
          type="checkbox"
          checked={afterHoursOnly}
          onChange={(e) => setAfterHoursOnly(e.target.checked)}
          className="h-4 w-4 rounded border-line2 text-acc focus:ring-acc"
        />
        It said it only covers after-hours
      </label>

      <button
        type="button"
        onClick={save}
        disabled={pending}
        className="mt-3 inline-flex items-center gap-2 rounded-full bg-acc px-4 py-[7px] text-[13px] font-bold text-white hover:bg-acc-b disabled:opacity-60"
      >
        <Send size={13} /> Save detail
      </button>
    </div>
  );
}

/* ------------------------------ add modal ------------------------------ */

function AddLeadDialog() {
  const router = useRouter();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [form, setForm] = useState({
    business_name: "",
    contact_name: "",
    phone: "",
    email: "",
    city: "",
    industry: "hvac" as LeadIndustry,
    source: "",
    notes: "",
  });

  function reset() {
    setForm({
      business_name: "",
      contact_name: "",
      phone: "",
      email: "",
      city: "",
      industry: "hvac",
      source: "",
      notes: "",
    });
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const res = await createLead({
        business_name: form.business_name,
        contact_name: form.contact_name,
        phone: form.phone,
        email: form.email,
        city: form.city,
        industry: form.industry,
        source: form.source,
        notes: form.notes,
      });
      if (!res.ok) {
        toast({ variant: "info", title: "Couldn't add lead", description: res.error });
        return;
      }
      toast({
        title: "Lead added",
        description: `${res.data.business_name}. Open it to run the funnel.`,
      });
      reset();
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
          className="inline-flex items-center gap-2 whitespace-nowrap rounded-full bg-acc px-5 py-[10px] text-[14px] font-bold text-white shadow-[0_10px_24px_rgba(234,88,12,0.3)] transition-all hover:-translate-y-0.5 hover:bg-acc-b"
        >
          <Plus size={16} strokeWidth={2.6} /> Add lead
        </button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-ink/40 backdrop-blur-sm" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 max-h-[90vh] w-[calc(100%-1.5rem)] max-w-[480px] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-[18px] border border-line2 bg-card p-6 shadow-card focus:outline-none">
          <div className="mb-1 flex items-center justify-between">
            <Dialog.Title className="font-display text-[19px] font-extrabold tracking-[-0.02em] text-ink">
              Add a lead
            </Dialog.Title>
            <Dialog.Close className="grid h-8 w-8 place-items-center rounded-full border border-line2 text-mute hover:text-ink">
              <X size={16} />
            </Dialog.Close>
          </div>
          <p className="mb-5 text-[13px] text-body">
            Just the basics. You&apos;ll qualify and score it from the lead&apos;s
            detail view.
          </p>
          <form onSubmit={submit} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Business" required className="sm:col-span-2">
              <input
                className={inputCls}
                placeholder="Summit Plumbing"
                value={form.business_name}
                onChange={(e) => setForm({ ...form, business_name: e.target.value })}
                required
              />
            </Field>
            <Field label="Contact">
              <input
                className={inputCls}
                placeholder="Dave K."
                value={form.contact_name}
                onChange={(e) => setForm({ ...form, contact_name: e.target.value })}
              />
            </Field>
            <Field label="Phone" required>
              <input
                type="tel"
                className={inputCls}
                placeholder="(555) 000-0000"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                required
              />
            </Field>
            <Field label="Email">
              <input
                type="email"
                className={inputCls}
                placeholder="dave@shop.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </Field>
            <Field label="City">
              <input
                className={inputCls}
                placeholder="Denver, CO"
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
              />
            </Field>
            <Field label="Industry" required>
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
            </Field>
            <Field label="Source">
              <input
                className={inputCls}
                placeholder="Google Maps, referral"
                value={form.source}
                onChange={(e) => setForm({ ...form, source: e.target.value })}
              />
            </Field>
            <Field label="Notes" className="sm:col-span-2">
              <textarea
                rows={3}
                className={cn(inputCls, "resize-y leading-[1.5]")}
                placeholder="Anything useful: call windows, who to ask for, why they'd be a fit"
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
              />
            </Field>
            <div className="mt-1 flex justify-end gap-2 sm:col-span-2">
              <Dialog.Close className="whitespace-nowrap rounded-full border-[1.5px] border-line2 px-5 py-[10px] text-[14px] font-bold text-ink">
                Cancel
              </Dialog.Close>
              <button
                type="submit"
                disabled={pending}
                className="whitespace-nowrap rounded-full bg-acc px-5 py-[10px] text-[14px] font-bold text-white hover:bg-acc-b disabled:opacity-70"
              >
                {pending ? "Adding" : "Add lead"}
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function Field({
  label,
  required,
  className,
  children,
}: {
  label: string;
  required?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <label className={cn("flex flex-col gap-[6px]", className)}>
      <span className="text-[12.5px] font-bold text-ink">
        {label}
        {required && <span className="text-acc"> *</span>}
      </span>
      {children}
    </label>
  );
}

/** Subtle marker for leads already running a competitor AI receptionist. */
function CompetitorTag() {
  return (
    <span
      title="Already runs an AI receptionist (switching pipeline)"
      className="inline-flex items-center gap-[3px] rounded-full border border-ai-line bg-ai-bg2 px-[7px] py-[1px] font-mono text-[9.5px] font-semibold uppercase tracking-[0.08em] text-acc-dim"
    >
      <Bot size={11} /> AI
    </span>
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
        "inline-flex items-center gap-[6px] whitespace-nowrap rounded-full px-[14px] py-[7px] text-[13px] font-bold transition-colors",
        active ? "bg-ink text-bg" : "text-body hover:text-ink",
      )}
    >
      {children}
    </button>
  );
}
