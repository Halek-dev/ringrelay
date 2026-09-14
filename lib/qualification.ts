import type { LeadStatus, LeadTier, QualificationAnswers } from "@/lib/db-types";

/**
 * The lead qualification funnel for Ring Relay's review-request product. This
 * is the SINGLE source of truth for both the client (which renders the outcome
 * buttons) and the server (which computes the score), so the two never drift.
 *
 * It implements the ICP scoring model directly:
 *   Few Google reviews (< 50)      +3
 *   Stale reviews (90+ days)        +3
 *   Runs Google Ads / LSAs         +3
 *   Active on Facebook / Instagram +1
 *   In business 5+ years           +1
 *   Tiers: A 8+ · B 5 to 7 · C under 5
 *
 * Gate steps carry `kill` outcomes that remove the lead: franchise, wrong
 * trade, closed or unclaimed profile, no website, already on a review platform.
 */
export type StepOutcome = {
  value: string;
  label: string;
  points: number;
  kill?: boolean;
};

export type FunnelStep = {
  key: string;
  step: number; // 1-based, for "Step N of N"
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
      "Is this an independent home-services business (HVAC, roofing, or a related trade)? Not a franchise or national chain.",
    outcomes: [
      { value: "pass", label: "Independent trade business", points: 0 },
      { value: "kill_franchise", label: "Kill: franchise or national chain", points: 0, kill: true },
      { value: "kill_wrong", label: "Kill: wrong trade or not home services", points: 0, kill: true },
    ],
  },
  {
    key: "status_check",
    step: 2,
    title: "Profile check",
    instruction:
      "Look up their Google Business Profile. Is it claimed and the business open? Unclaimed or permanently closed is a kill.",
    outcomes: [
      { value: "active", label: "Claimed and open", points: 0 },
      { value: "kill_closed", label: "Kill: closed or unclaimed profile", points: 0, kill: true },
    ],
  },
  {
    key: "website",
    step: 3,
    title: "Website check",
    instruction:
      "Do they have a real website (not just a Facebook page)? A website shows they invest in marketing. No website is a kill.",
    outcomes: [
      { value: "has_site", label: "Has a website", points: 0 },
      { value: "kill_no_site", label: "Kill: no website", points: 0, kill: true },
    ],
  },
  {
    key: "platform_check",
    step: 4,
    title: "Review platform check",
    instruction:
      "Are they already using a review platform (Podium, Birdeye, NiceJob, Broadly, GatherUp, or similar)? If so, they are not our customer.",
    outcomes: [
      { value: "none", label: "Not on a review platform", points: 0 },
      { value: "kill_competitor", label: "Kill: already uses a review platform", points: 0, kill: true },
    ],
  },
  {
    key: "review_count",
    step: 5,
    title: "Review count",
    instruction:
      "How many Google reviews do they have? Fewer than 50 is the pain we solve and scores. 50 or more scores nothing on this axis.",
    outcomes: [
      { value: "few", label: "Under 50 reviews", points: 3 },
      { value: "many", label: "50 or more reviews", points: 0 },
    ],
  },
  {
    key: "freshness",
    step: 6,
    title: "Review freshness",
    instruction:
      "When was their most recent Google review? No new review in 90+ days looks stale and scores. Recent reviews score nothing here.",
    outcomes: [
      { value: "stale", label: "No review in 90+ days", points: 3 },
      { value: "recent", label: "Has recent reviews", points: 0 },
    ],
  },
  {
    key: "ads",
    step: 7,
    title: "Paid ads",
    instruction:
      "Are they running Google Ads or Local Services Ads? Paying for leads means more reviews raise their conversion, so this scores.",
    outcomes: [
      { value: "yes", label: "Runs Google Ads or LSAs", points: 3 },
      { value: "no", label: "No paid ads found", points: 0 },
    ],
  },
  {
    key: "social",
    step: 8,
    title: "Social presence",
    instruction:
      "Are they active on Facebook or Instagram? An active social presence is a small positive signal.",
    outcomes: [
      { value: "yes", label: "Active on Facebook or Instagram", points: 1 },
      { value: "no", label: "No active social", points: 0 },
    ],
  },
  {
    key: "tenure",
    step: 9,
    title: "Tenure",
    instruction:
      "How long have they been in business? Five or more years is a small positive signal. (Under two years usually is not a fit.)",
    outcomes: [
      { value: "5plus", label: "5+ years in business", points: 1 },
      { value: "under5", label: "Under 5 years", points: 0 },
    ],
  },
];

export const INPUT_STEPS = FUNNEL_STEPS.length; // 9
export const RESULT_STEP = INPUT_STEPS + 1; // "Score and tier"
export const TOTAL_STEPS = RESULT_STEP; // 10

/** The maximum possible score, for the transparent breakdown display. */
export const MAX_SCORE = FUNNEL_STEPS.reduce(
  (sum, step) => sum + Math.max(0, ...step.outcomes.map((o) => o.points)),
  0,
); // 11

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
): { label: string; points: number }[] {
  const rows: { label: string; points: number }[] = [];
  for (const step of FUNNEL_STEPS) {
    const oc = outcomeFor(step, a[step.key]);
    if (oc && oc.points > 0) {
      rows.push({ label: `${step.title}: ${oc.label}`, points: oc.points });
    }
  }
  return rows;
}

export function computeScore(a: QualificationAnswers): number {
  let score = 0;
  for (const step of FUNNEL_STEPS) {
    const oc = outcomeFor(step, a[step.key]);
    if (oc) score += oc.points;
  }
  return score;
}

/** ICP tiers: A 8+, B 5 to 7, C under 5. Mapped onto the tier enum. */
export function computeTier(score: number): LeadTier {
  if (score >= 8) return "hot"; // Tier A
  if (score >= 5) return "warm"; // Tier B
  return "cool"; // Tier C
}

export function deriveStatus(a: QualificationAnswers): LeadStatus {
  if (killInfo(a)) return "killed";
  const answered = answeredCount(a);
  if (answered === 0) return "new";
  if (isComplete(a)) return "qualified";
  return "in_progress";
}

/* --- funnel to outreach recommendation --- */

export type TierPlan = {
  headline: string;
  action: string;
  templateHint: string | null; // matched against outreach_templates.name
};

export const TIER_PLAN: Record<LeadTier, TierPlan> = {
  hot: {
    headline: "Tier A: reach out now",
    action:
      "Strong review pain and they pay for ads. Lead with their review gap against the top local competitor.",
    templateHint: "gap",
  },
  warm: {
    headline: "Tier B: good fit",
    action: "Solid signals. Send the value-led first touch this week.",
    templateHint: "value",
  },
  cool: {
    headline: "Tier C: low priority",
    action: "Weak pain signals. Single batch touch only, or hold for later.",
    templateHint: "batch",
  },
  skip: {
    headline: "Skip",
    action: "Not a fit. Do not contact.",
    templateHint: null,
  },
};
