import { requireProfile } from "@/lib/auth";
import { TierBadge } from "@/components/admin/ui";
import { GRADE_PLAN } from "@/lib/qualification";
import { TIER_LABEL, type LeadTier } from "@/lib/db-types";

export const dynamic = "force-dynamic";

const GRADES: LeadTier[] = ["hot", "warm", "cool"];

export default async function PlaybookPage() {
  await requireProfile();

  return (
    <div className="max-w-[760px]">
      <header className="mb-8">
        <h1 className="font-display text-[26px] font-extrabold tracking-[-0.02em] text-ink">
          Playbook
        </h1>
        <p className="mt-1 text-[14.5px] leading-[1.55] text-body">
          How we work the list. Leads arrive already graded in the CSV, so there
          is no qualifying to do here: import the list, work the A grades first,
          and send each lead the personalized message it came in with. We sell
          one thing, an automated Google review system for local trades, at $97 a
          month.
        </p>
      </header>

      <section className="mb-10">
        <h2 className="mb-1 font-display text-[18px] font-extrabold text-ink">
          Grades and what to do
        </h2>
        <p className="mb-4 text-[13.5px] text-body">
          The grade comes straight from the CSV tier column (A and A-form are the
          same top grade, then B, then C). It decides how hard you push.
        </p>
        <div className="flex flex-col gap-3">
          {GRADES.map((tier) => {
            const plan = GRADE_PLAN[tier];
            return (
              <div
                key={tier}
                className="rounded-[14px] border border-line2 bg-card p-4 shadow-soft"
              >
                <div className="flex flex-wrap items-center gap-3">
                  <TierBadge tier={tier} />
                  <span className="text-[14px] font-bold text-ink">
                    Grade {TIER_LABEL[tier]}
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

      <section>
        <h2 className="mb-1 font-display text-[18px] font-extrabold text-ink">
          Cadence
        </h2>
        <p className="mb-4 text-[13.5px] text-body">
          Every message you send is logged automatically and moves your daily
          plan. Send from the Leads page.
        </p>
        <ol className="flex flex-col gap-2 text-[13.5px] leading-[1.5] text-body">
          <li className="rounded-[10px] border border-line bg-panel px-3 py-2">
            <span className="font-bold text-ink">Outreach.</span> Send each lead
            its own personalized message. Tick the leads, hit Send outreach.
          </li>
          <li className="rounded-[10px] border border-line bg-panel px-3 py-2">
            <span className="font-bold text-ink">Follow-up.</span> Two or three
            days later, a short bump to everyone who has not replied.
          </li>
          <li className="rounded-[10px] border border-line bg-panel px-3 py-2">
            <span className="font-bold text-ink">Custom.</span> A one-off note
            when a lead needs something specific, then let it rest.
          </li>
        </ol>
      </section>
    </div>
  );
}
