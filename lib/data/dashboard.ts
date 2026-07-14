import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { Client, Lead } from "@/lib/db-types";
import { LEAD_STATUS_LABEL } from "@/lib/db-types";
import { relativeTime, startOfWeekMonday, toISODate } from "@/lib/date";

export type Kpis = {
  leadsThisWeek: number;
  demosBooked: number;
  clients: number;
  mrr: number;
};

export async function getKpis(): Promise<Kpis> {
  const supabase = createClient();
  const weekStart = toISODate(startOfWeekMonday());

  const [leadsThisWeek, demosBooked, clientsCount, mrrRows] = await Promise.all([
    supabase
      .from("leads")
      .select("id", { count: "exact", head: true })
      .gte("created_at", weekStart),
    supabase
      .from("leads")
      .select("id", { count: "exact", head: true })
      .eq("status", "demo_booked"),
    supabase.from("clients").select("id", { count: "exact", head: true }),
    supabase.from("clients").select("mrr"),
  ]);

  const err =
    leadsThisWeek.error ||
    demosBooked.error ||
    clientsCount.error ||
    mrrRows.error;
  if (err) throw new Error(err.message);

  const mrr = ((mrrRows.data as { mrr: number }[] | null) ?? []).reduce(
    (sum, r) => sum + Number(r.mrr ?? 0),
    0,
  );

  return {
    leadsThisWeek: leadsThisWeek.count ?? 0,
    demosBooked: demosBooked.count ?? 0,
    clients: clientsCount.count ?? 0,
    mrr,
  };
}

export type ActivityItem = {
  id: string;
  icon: string;
  text: string;
  time: string;
};

/** Lightweight feed derived from the most recently touched leads + clients. */
export async function getActivity(): Promise<ActivityItem[]> {
  const supabase = createClient();

  const [leadsRes, clientsRes] = await Promise.all([
    supabase
      .from("leads")
      .select("*")
      .order("updated_at", { ascending: false })
      .limit(6),
    supabase
      .from("clients")
      .select("*")
      .order("updated_at", { ascending: false })
      .limit(3),
  ]);
  if (leadsRes.error) throw new Error(leadsRes.error.message);
  if (clientsRes.error) throw new Error(clientsRes.error.message);

  const iconFor: Record<string, string> = {
    new: "UserPlus",
    contacted: "Send",
    replied: "MessageSquare",
    demo_booked: "CalendarCheck",
    won: "Trophy",
    lost: "XCircle",
  };

  const leadItems: (ActivityItem & { _ts: number })[] = (
    (leadsRes.data as Lead[] | null) ?? []
  ).map((l) => ({
    id: `lead-${l.id}`,
    icon: iconFor[l.status] ?? "UserPlus",
    text: `${l.business_name} · ${LEAD_STATUS_LABEL[l.status]}`,
    time: relativeTime(l.updated_at),
    _ts: new Date(l.updated_at).getTime(),
  }));

  const clientItems: (ActivityItem & { _ts: number })[] = (
    (clientsRes.data as Client[] | null) ?? []
  ).map((c) => ({
    id: `client-${c.id}`,
    icon: "Trophy",
    text: `${c.business_name} signed the ${c.plan} plan`,
    time: relativeTime(c.updated_at),
    _ts: new Date(c.updated_at).getTime(),
  }));

  return [...leadItems, ...clientItems]
    .sort((a, b) => b._ts - a._ts)
    .slice(0, 6)
    .map((it) => ({ id: it.id, icon: it.icon, text: it.text, time: it.time }));
}
