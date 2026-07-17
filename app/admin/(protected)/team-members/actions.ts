"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { assertOwner } from "@/lib/auth";
import { ok, fail, type ActionResult } from "@/lib/action-result";
import type { TeamMember } from "@/lib/db-types";

const MAX_PHOTO_BYTES = 4 * 1024 * 1024;

export type TeamMemberInput = {
  id?: string;
  name: string;
  role_title: string;
  bio: string;
  sort_order: number;
  is_published: boolean;
};

/**
 * Save a REAL team member. This table is never seeded: it starts empty and the
 * public team section stays hidden until a real person is added here.
 */
export async function saveTeamMember(
  input: TeamMemberInput,
): Promise<ActionResult<TeamMember>> {
  await assertOwner();
  if (!input.name?.trim()) return fail("A name is required.");
  if (!input.role_title?.trim()) return fail("A role or title is required.");

  const supabase = createClient();
  const row = {
    name: input.name.trim(),
    role_title: input.role_title.trim(),
    bio: input.bio.trim() || null,
    sort_order: input.sort_order,
    is_published: input.is_published,
  };

  const query = input.id
    ? supabase.from("team_members").update(row).eq("id", input.id)
    : supabase.from("team_members").insert(row);
  const { data, error } = await query.select("*").single();
  if (error) return fail(error.message);

  revalidatePath("/admin/team-members");
  revalidatePath("/about");
  return ok(data as TeamMember);
}

/**
 * Upload a member photo to the PUBLIC team-photos bucket and store its URL.
 * The client resizes the image to a small square before sending, so what
 * arrives here is already display-sized.
 */
export async function uploadTeamPhoto(
  formData: FormData,
): Promise<ActionResult<{ url: string }>> {
  await assertOwner();
  const memberId = String(formData.get("memberId") ?? "");
  const photo = formData.get("photo");
  if (!memberId) return fail("Missing member id.");
  if (!(photo instanceof File) || photo.size === 0)
    return fail("Choose an image file.");
  if (photo.size > MAX_PHOTO_BYTES) return fail("The image is over 4MB.");
  if (!photo.type.startsWith("image/")) return fail("That is not an image.");

  const admin = createAdminClient();
  const ext = photo.type === "image/png" ? "png" : "jpg";
  const path = `${memberId}.${ext}`;
  const buf = Buffer.from(await photo.arrayBuffer());

  const { error: upErr } = await admin.storage
    .from("team-photos")
    .upload(path, buf, { contentType: photo.type, upsert: true });
  if (upErr) return fail(upErr.message);

  const { data: pub } = admin.storage.from("team-photos").getPublicUrl(path);
  // Cache-bust so a replaced photo shows immediately.
  const url = `${pub.publicUrl}?v=${Date.now()}`;

  const supabase = createClient();
  const { error } = await supabase
    .from("team_members")
    .update({ photo_url: url })
    .eq("id", memberId);
  if (error) return fail(error.message);

  revalidatePath("/admin/team-members");
  revalidatePath("/about");
  return ok({ url });
}

export async function deleteTeamMember(id: string): Promise<ActionResult> {
  await assertOwner();
  const supabase = createClient();
  const { error } = await supabase.from("team_members").delete().eq("id", id);
  if (error) return fail(error.message);
  revalidatePath("/admin/team-members");
  revalidatePath("/about");
  return ok();
}
