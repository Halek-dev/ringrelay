import { requireProfile } from "@/lib/auth";
import { TierBadge } from "@/components/admin/ui";
import { FUNNEL_STEPS, TIER_PLAN, INPUT_STEPS, MAX_SCORE } from "@/lib/qualification";
import { TIER_LABEL, type LeadTier } from "@/lib/db-types";

export const dynamic = "force-dynamic";

const TIERS: { tier: LeadTier; range: string; icp: string }[] = [
  { tier: "hot", range: "8 and up", icp: "Tier A" },
  { tier: "warm", range: "5 to 7", icp: "Tier B" },
  { tier: "cool", range: "under 5", icp: "Tier C" },
];

export default async function PlaybookPage() {
  await requireProfile();

  return (
    <div className="max-w-[760px]">
      <header className="mb-8">
        <h1 className="font-display text-[26px] font-extrabold tracking-[-0.02em] text-ink">
          Playbook
        </h1>
        <p className="mt-1 text-[14.5px] leading-[1.55] text-body">
          How we qualify, score, and reach out. The {INPUT_STEPS}-step funnel and
          the point values below are the same ones the app uses to score every
          lead, so this page and your leads never drift apart. We sell one thing:
          an automated Google review system for local trades, at $97 a month.
        </p>
      </header>

      {/* Who we sell to */}
      <section className="mb-10">
        <h2 className="mb-1 font-display text-[18px] font-extrabold text-ink">
          Who we are looking for
        </h2>
        <p className="mb-4 text-[13.5px] leading-[1.55] text-body">
          Owner-run HVAC and roofing shops (and near neighbors like plumbing and
          electrical) that already pay for calls but have too few or too old
          Google reviews to win the map. They have a website, an active profile,
          and no review tool yet. If someone else already automates their
          reviews, they are not our customer.
        </p>
      </section>

      {/* Funnel */}
      <section className="mb-10">
        <h2 className="mb-1 font-display text-[18px] font-extrabold text-ink">
          The {INPUT_STEPS}-step funnel
        </h2>
        <p className="mb-4 text-[13.5px] text-body">
          Run the steps in order. The first four are gates: a kill outcome stops
          the lead cold. The last five are the scoring signals. Killing leads
          early is the system working. Most leads should not pass.
        </p>
        <div className="flex flex-col gap-3">
          {FUNNEL_STEPS.map((step) => (
            <div
              key={step.key}
              className="rounded-[14px] border border-line2 bg-card p-4 shadow-soft"
            >
              <div className="flex items-center gap-2">
                <span className="grid h-6 w-6 place-items-center rounded-full bg-ink font-mono text-[12px] font-bold text-bg">
                  {step.step}
                </span>
                <h3 className="text-[14.5px] font-bold text-ink">{step.title}</h3>
              </div>
              <p className="mt-2 text-[13px] leading-[1.5] text-body">
                {step.instruction}
              </p>
              <div className="mt-3 flex flex-col gap-1">
                {step.outcomes.map((o) => (
                  <div
                    key={o.value}
                    className="flex items-center justify-between rounded-[9px] border border-line bg-panel px-3 py-[7px] text-[13px]"
                  >
                    <span className={o.kill ? "font-semibold text-mute" : "text-ink"}>
                      {o.label}
                    </span>
                    <span className="font-mono text-[12px] font-semibold text-mute">
                      {o.kill ? "stop" : o.points > 0 ? `+${o.points}` : "0"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Tiers */}
      <section className="mb-10">
        <h2 className="mb-1 font-display text-[18px] font-extrabold text-ink">
          Tiers and what to do
        </h2>
        <p className="mb-4 text-[13.5px] text-body">
          The scoring signals add up to {MAX_SCORE} at most. The total sorts every
          lead that clears the gates into a tier, and the tier decides how hard
          you push.
        </p>
        <div className="flex flex-col gap-3">
          {TIERS.map(({ tier, range, icp }) => {
            const plan = TIER_PLAN[tier];
            return (
              <div
                key={tier}
                className="rounded-[14px] border border-line2 bg-card p-4 shadow-soft"
              >
                <div className="flex flex-wrap items-center gap-3">
                  <TierBadge tier={tier} />
                  <span className="text-[14px] font-bold text-ink">
                    {icp} · {TIER_LABEL[tier]}
                  </span>
                  <span className="font-mono text-[12px] text-mute">
                    Score {range}
                  </span>
                </div>
                <p className="mt-2 text-[13.5px] font-semibold text-ink">
                  {plan.headline}
                </p>
                <p className="mt-[2px] text-[13px] leading-[1.5] text-body">
                  {plan.action}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Cadence */}
      <section>
        <h2 className="mb-1 font-display text-[18px] font-extrabold text-ink">
          Cadence
        </h2>
        <p className="mb-4 text-[13.5px] text-body">
          Log every message you send from the lead&apos;s detail view. Your daily
          plan counts real touches, not intentions.
        </p>
        <ol className="flex flex-col gap-2 text-[13.5px] leading-[1.5] text-body">
          <li className="rounded-[10px] border border-line bg-panel px-3 py-2">
            <span className="font-bold text-ink">First touch.</span> Lead with
            their review gap against the top local competitor: how many reviews
            they have versus the shop ranking above them. Make the ad money they
            already spend the reason to reply.
          </li>
          <li className="rounded-[10px] border border-line bg-panel px-3 py-2">
            <span className="font-bold text-ink">Follow-up 1.</span> Two or three
            days later. Add one new proof point. Keep it short.
          </li>
          <li className="rounded-[10px] border border-line bg-panel px-3 py-2">
            <span className="font-bold text-ink">Follow-up 2.</span> A week out. One
            last useful nudge, then let it rest.
          </li>
        </ol>
      </section>
    </div>
  );
}
