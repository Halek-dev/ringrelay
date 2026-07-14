import { Building2, CalendarCheck, DollarSign, Users } from "lucide-react";
import { Panel, PanelHeader } from "@/components/admin/ui";
import { TodaysTasks } from "@/components/admin/todays-tasks";
import { Icon } from "@/components/icon";
import { requireProfile } from "@/lib/auth";
import { getKpis, getActivity } from "@/lib/data/dashboard";
import { getStreak, getTodayPlan } from "@/lib/data/daily-plan";

export const dynamic = "force-dynamic";

function money(n: number) {
  return n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
}

export default async function AdminDashboard() {
  const profile = await requireProfile();
  const [kpis, activity, today, streak] = await Promise.all([
    getKpis(),
    getActivity(),
    getTodayPlan(profile.id),
    getStreak(profile.id),
  ]);

  const firstName = (profile.full_name || profile.email || "there").split(
    /[\s@]/,
  )[0];

  const kpiCards = [
    { label: "Leads this week", value: `${kpis.leadsThisWeek}`, icon: Users },
    { label: "Demos booked", value: `${kpis.demosBooked}`, icon: CalendarCheck },
    { label: "Clients", value: `${kpis.clients}`, icon: Building2 },
    { label: "MRR", value: money(kpis.mrr), icon: DollarSign },
  ];

  return (
    <div>
      <header className="mb-7 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-[26px] font-extrabold tracking-[-0.02em] text-ink">
            Morning, {firstName}.
          </h1>
          <p className="mt-1 text-[14.5px] text-body">
            Here&apos;s where the pipeline stands and what to run today.
          </p>
        </div>
        <div className="inline-flex items-center gap-2 rounded-full border border-acc/30 bg-acc/10 px-4 py-2">
          <span className="text-[15px]">🔥</span>
          <span className="font-mono text-[12.5px] font-semibold tracking-[0.06em] text-acc-dim">
            {streak}-DAY STREAK
          </span>
        </div>
      </header>

      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {kpiCards.map((kpi) => (
          <div
            key={kpi.label}
            className="rounded-[16px] border border-line2 bg-card p-5 shadow-soft"
          >
            <span className="grid h-9 w-9 place-items-center rounded-[10px] border border-ai-line bg-ai-bg2 text-acc">
              <kpi.icon size={17} strokeWidth={2.2} />
            </span>
            <div className="mt-4 font-display text-[28px] font-extrabold tracking-[-0.02em] text-ink">
              {kpi.value}
            </div>
            <div className="mt-[2px] text-[13px] font-medium text-mute">
              {kpi.label}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.4fr_1fr]">
        <Panel>
          <PanelHeader
            title={`Today's tasks · ${today.label}`}
            subtitle="Your daily outreach playbook — check them off as you go."
          />
          <TodaysTasks tasks={today.tasks} dateISO={today.dateISO} />
        </Panel>

        <Panel>
          <PanelHeader title="Activity" subtitle="Latest across the pipeline" />
          {activity.length === 0 ? (
            <p className="px-5 py-8 text-center text-[14px] text-mute">
              No activity yet. Add your first lead to get going.
            </p>
          ) : (
            <ul className="flex flex-col">
              {activity.map((a) => (
                <li
                  key={a.id}
                  className="flex items-start gap-3 border-b border-line px-5 py-[14px] last:border-b-0"
                >
                  <span className="mt-[1px] grid h-[30px] w-[30px] shrink-0 place-items-center rounded-full border border-line2 bg-panel text-mute">
                    <Icon name={a.icon} size={15} strokeWidth={2.2} />
                  </span>
                  <div className="min-w-0">
                    <p className="text-[13.5px] leading-snug text-ink">{a.text}</p>
                    <span className="text-[12px] text-mute">{a.time}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>
    </div>
  );
}
