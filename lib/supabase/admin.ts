import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { getServiceRoleKey, getSupabaseUrl } from "@/lib/supabase/env";

/**
 * Service-role client — bypasses RLS. SERVER-ONLY. Only use inside server
 * actions after verifying the caller is an owner. Never import into a client
 * component (the `server-only` guard will error the build if you do).
 */
export function createAdminClient() {
  return createSupabaseClient(getSupabaseUrl(), getServiceRoleKey(), {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
