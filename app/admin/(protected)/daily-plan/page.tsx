import { DailyPlan } from "@/components/admin/daily-plan";
import { requireProfile } from "@/lib/auth";
import {
  getWeekPlan,
  getStreak,
  getWeekPipelineStats,
} from "@/lib/data/daily-plan";

export const dynamic = "force-dynamic";

export default async function DailyPlanPage() {
  const profile = await requireProfile();
  const [week, streak, pipeline] = await Promise.all([
    getWeekPlan(profile.id),
    getStreak(profile.id),
    getWeekPipelineStats(),
  ]);

  return <DailyPlan week={week} streak={streak} pipeline={pipeline} />;
}
