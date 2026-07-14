"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { assertOwner } from "@/lib/auth";
import { ok, fail, type ActionResult } from "@/lib/action-result";
import type { UserRole } from "@/lib/db-types";

/**
 * Create a team member. Owner-only. Uses the service-role client to create the
 * auth user; the handle_new_user trigger then creates their profile row with
 * the role we pass in user_metadata.
 */
export async function createMember(input: {
  email: string;
  password: string;
  full_name: string;
  role: UserRole;
}): Promise<ActionResult> {
  await assertOwner();

  const email = input.email.trim().toLowerCase();
  if (!email) return fail("Email is required.");
  if (input.password.length < 8)
    return fail("Password must be at least 8 characters.");

  const admin = createAdminClient();
  const { error } = await admin.auth.admin.createUser({
    email,
    password: input.password,
    email_confirm: true,
    user_metadata: {
      full_name: input.full_name.trim(),
      role: input.role,
    },
  });

  if (error) {
    return fail(
      /already been registered/i.test(error.message)
        ? "That email already has an account."
        : error.message,
    );
  }

  revalidatePath("/admin/team");
  return ok();
}

export async function updateMemberRole(
  profileId: string,
  role: UserRole,
): Promise<ActionResult> {
  const owner = await assertOwner();
  if (profileId === owner.id)
    return fail("You can't change your own role.");

  const supabase = createClient();
  const { error } = await supabase
    .from("profiles")
    .update({ role })
    .eq("id", profileId);
  if (error) return fail(error.message);
  revalidatePath("/admin/team");
  return ok();
}

export async function removeMember(profileId: string): Promise<ActionResult> {
  const owner = await assertOwner();
  if (profileId === owner.id) return fail("You can't remove yourself.");

  // Deleting the auth user cascades to their profile row.
  const admin = createAdminClient();
  const { error } = await admin.auth.admin.deleteUser(profileId);
  if (error) return fail(error.message);
  revalidatePath("/admin/team");
  return ok();
}
