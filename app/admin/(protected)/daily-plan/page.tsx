import { DailyPlan } from "@/components/admin/daily-plan";
import { requireProfile } from "@/lib/auth";
import {
  getWeekPlan,
  getTodayPlan,
  getWeekTotals,
  getStreak,
} from "@/lib/data/daily-plan";

export const dynamic = "force-dynamic";

export default async function DailyPlanPage() {
  await requireProfile();
  const [week, today, totals, streak] = await Promise.all([
    getWeekPlan(),
    getTodayPlan(),
    getWeekTotals(),
    getStreak(),
  ]);

  return <DailyPlan week={week} today={today} totals={totals} streak={streak} />;
}
