import type {
  LeadIndustry,
  LeadStatus,
  LeadTier,
  QualificationAnswers,
} from "@/lib/db-types";

/**
 * The 7-step lead qualification funnel. This is the SINGLE source of truth for
 * both the client (which renders the outcome buttons) and the server (which
 * computes the score), so the two can never drift apart.
 *
 * Steps 1 to 6 are choices. Step 7 is the computed score the user confirms.
 * A `kill` outcome stops the funnel and marks the lead killed.
 */
export type StepOutcome = {
  value: string;
  label: string;
  points: number;
  kill?: boolean;
};

export type FunnelStep = {
  key: string;
  step: number; // 1-based, for "Step N of 7"
  title: string;
  instruction: string;
  outcomes: StepOutcome[];
};

export const FUNNEL_STEPS: FunnelStep[] = [
  {
    key: "type_check",
    step: 1,
    title: "Type check",
    instruction:
      "Is this an independent HVAC, plumbing, or restoration business? Not a franchise, directory, or wrong trade.",
    outcomes: [
      { value: "pass", label: "Pass", points: 0 },
      { value: "kill_wrong_type", label: "Kill: wrong type", points: 0, kill: true },
    ],
  },
  {
    key: "size_check",
    step: 2,
    title: "Size check",
    instruction:
      "Owner-operator or small shop? Look for an owner's name in the business name or a small local team.",
    outcomes: [
      { value: "small", label: "Pass (owner-run or small)", points: 20 },
      { value: "medium", label: "Medium (6 to 15)", points: 10 },
      { value: "kill_big", label: "Kill: too big (has receptionist)", points: 0, kill: true },
    ],
  },
  {
    key: "inbound_gap",
    step: 3,
    title: "Inbound-gap check",
    instruction:
      "Look at their web presence. No website or a thin one-page site is a good sign. It means they are not handling calls well.",
    outcomes: [
      { value: "no_thin", label: "Strong: no or thin site", points: 15 },
      { value: "slick", label: "Weak: slick site with booking", points: 3 },
    ],
  },
  {
    key: "demand",
    step: 4,
    title: "Demand check",
    instruction:
      "Check their Google reviews. A healthy review count means real call volume, which means real calls to miss.",
    outcomes: [
      { value: "has_reviews", label: "Strong: has reviews", points: 12 },
      { value: "few", label: "Weak: few or no reviews", points: 4 },
    ],
  },
  {
    key: "call_test",
    step: 5,
    title: "Call test",
    instruction:
      "Call the number once during business hours from a blocked line. Do not leave a message. What happened?",
    outcomes: [
      { value: "voicemail", label: "Voicemail (hottest)", points: 30 },
      { value: "answering_service", label: "Answering service", points: 15 },
      { value: "answered_live", label: "Answered live fast", points: 0 },
    ],
  },
  {
    key: "reachability",
    step: 6,
    title: "Reachability",
    instruction:
      "Can you find the owner's name plus a public email, contact form, or LinkedIn?",
    outcomes: [
      { value: "found", label: "Yes: found a way in", points: 10 },
      { value: "gatekept", label: "No: gatekept", points: 2 },
    ],
  },
];

export const RESULT_STEP = 7; // "Score and sort"
export const TOTAL_STEPS = 7;
export const INPUT_STEPS = FUNNEL_STEPS.length; // 6

// Industry bonus is added when the type check passes.
const INDUSTRY_BONUS: Record<LeadIndustry, number> = {
  restoration: 13,
  hvac: 12,
  plumbing: 11,
  roofing: 0,
  electrical: 0,
  other: 0,
};

export function industryBonus(industry: LeadIndustry): number {
  return INDUSTRY_BONUS[industry] ?? 0;
}

function outcomeFor(step: FunnelStep, value: string | undefined): StepOutcome | undefined {
  return step.outcomes.find((o) => o.value === value);
}

export function answeredCount(a: QualificationAnswers): number {
  return FUNNEL_STEPS.filter((s) => outcomeFor(s, a[s.key])).length;
}

export function isComplete(a: QualificationAnswers): boolean {
  return answeredCount(a) === INPUT_STEPS;
}

/** The first gate (in order) answered with a kill outcome, if any. */
export function killInfo(
  a: QualificationAnswers,
): { step: number; reason: string } | null {
  for (const step of FUNNEL_STEPS) {
    const oc = outcomeFor(step, a[step.key]);
    if (oc?.kill) return { step: step.step, reason: oc.label };
  }
  return null;
}

/** Per-step point contributions, for the transparent breakdown. */
export function scoreBreakdown(
  a: QualificationAnswers,
  industry: LeadIndustry,
): { label: string; points: number }[] {
  const rows: { label: string; points: number }[] = [];
  for (const step of FUNNEL_STEPS) {
    const oc = outcomeFor(step, a[step.key]);
    if (!oc) continue;
    if (step.key === "type_check" && oc.value === "pass") {
      rows.push({ label: `Industry (${industry})`, points: industryBonus(industry) });
    } else if (oc.points > 0) {
      rows.push({ label: `${step.title}: ${oc.label}`, points: oc.points });
    }
  }
  return rows;
}

export function computeScore(a: QualificationAnswers, industry: LeadIndustry): number {
  let score = 0;
  for (const step of FUNNEL_STEPS) {
    const oc = outcomeFor(step, a[step.key]);
    if (oc) score += oc.points;
  }
  if (a["type_check"] === "pass") score += industryBonus(industry);
  return score;
}

export function computeTier(score: number): LeadTier {
  if (score >= 75) return "hot";
  if (score >= 50) return "warm";
  if (score >= 30) return "cool";
  return "skip";
}

export function deriveStatus(a: QualificationAnswers): LeadStatus {
  if (killInfo(a)) return "killed";
  const answered = answeredCount(a);
  if (answered === 0) return "new";
  if (isComplete(a)) return "qualified";
  return "in_progress";
}

/* --- funnel → outreach recommendation (Fix 2f) --- */

export type TierPlan = {
  headline: string;
  action: string;
  templateHint: string | null; // matched against outreach_templates.name
};

export const TIER_PLAN: Record<LeadTier, TierPlan> = {
  hot: {
    headline: "Hot lead",
    action: "Send a Loom-led first touch today.",
    templateHint: "loom",
  },
  warm: {
    headline: "Warm lead",
    action: "Send the proof-led email or SMS this week.",
    templateHint: "proof",
  },
  cool: {
    headline: "Cool lead",
    action: "Single batch touch only. Do not chase.",
    templateHint: "batch",
  },
  skip: {
    headline: "Skip",
    action: "Do not contact. Score is below the bar.",
    templateHint: null,
  },
};
