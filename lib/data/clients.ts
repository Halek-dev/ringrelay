import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { Client, OnboardingStep } from "@/lib/db-types";

export async function getClients(): Promise<Client[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("clients")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []) as Client[];
}

/** All onboarding steps, grouped by client_id — for the clients table view. */
export async function getStepsByClient(): Promise<
  Record<string, OnboardingStep[]>
> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("onboarding_steps")
    .select("*")
    .order("sort_order", { ascending: true });
  if (error) throw new Error(error.message);

  const grouped: Record<string, OnboardingStep[]> = {};
  for (const step of (data ?? []) as OnboardingStep[]) {
    (grouped[step.client_id] ??= []).push(step);
  }
  return grouped;
}

export async function getOnboardingSteps(
  clientId: string,
): Promise<OnboardingStep[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("onboarding_steps")
    .select("*")
    .eq("client_id", clientId)
    .order("sort_order", { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? []) as OnboardingStep[];
}
