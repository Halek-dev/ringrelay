import type { LeadTier } from "@/lib/db-types";

/**
 * Lead grading. Leads now arrive already graded in the CSV (a "tier" column of
 * A / A-form / B / C), so there is no funnel to run: we just map the CSV grade
 * onto the internal tier enum and a sort rank. A and A-form are the same top
 * grade. Anything unrecognized returns null so the importer can flag it.
 *
 *   CSV grade   internal tier   badge   rank
 *   A, A-form   hot             A        3
 *   B           warm            B        2
 *   C           cool            C        1
 */
export function parseCsvTier(raw: string | null | undefined): LeadTier | null {
  const s = (raw ?? "").trim().toLowerCase().replace(/[\s_]+/g, "-");
  if (!s) return null;
  if (s === "a" || s === "a-form" || s.startsWith("a-")) return "hot";
  if (s === "b") return "warm";
  if (s === "c") return "cool";
  return null;
}

/** Sort rank, highest grade first. Unknown/absent sorts last. */
export const TIER_RANK: Record<LeadTier, number> = {
  hot: 3,
  warm: 2,
  cool: 1,
  skip: 0,
};

/** What to do with a lead of each grade, shown on the lead detail. */
export type GradePlan = { headline: string; action: string };

export const GRADE_PLAN: Record<LeadTier, GradePlan> = {
  hot: {
    headline: "Grade A: reach out now",
    action:
      "Best fit in the list. Send the personalized outreach first, follow up within a few days.",
  },
  warm: {
    headline: "Grade B: good fit",
    action: "Solid lead. Send the outreach this week.",
  },
  cool: {
    headline: "Grade C: lower priority",
    action: "Weaker fit. Batch these or hold for when the A and B leads are worked.",
  },
  skip: {
    headline: "Ungraded",
    action: "No grade came through on import. Check the CSV tier column.",
  },
};
