"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { assertProfile } from "@/lib/auth";
import { ok, fail, type ActionResult } from "@/lib/action-result";

/**
 * Upsert the signed-in user's progress for one task on one date.
 * `is_done` is derived from completed_count >= target. RLS ensures a user can
 * only ever write their own rows.
 */
export async function setTaskProgress(input: {
  taskId: string;
  date: string; // YYYY-MM-DD
  completedCount: number;
  target: number;
}): Promise<ActionResult> {
  const profile = await assertProfile();
  const supabase = createClient();

  const count = Math.max(0, Math.min(input.target, Math.round(input.completedCount)));
  const isDone = count >= input.target;

  const { error } = await supabase.from("daily_task_progress").upsert(
    {
      task_id: input.taskId,
      profile_id: profile.id,
      date: input.date,
      completed_count: count,
      is_done: isDone,
    },
    { onConflict: "task_id,profile_id,date" },
  );

  if (error) return fail(error.message);
  revalidatePath("/admin/daily-plan");
  revalidatePath("/admin");
  return ok();
}
