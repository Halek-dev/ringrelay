/**
 * Row + enum types for the Supabase schema (see supabase/migrations).
 * Hand-authored to mirror the SQL; used to type query results and inserts.
 */

export type UserRole = "owner" | "member";

export type LeadIndustry =
  | "hvac"
  | "plumbing"
  | "restoration"
  | "roofing"
  | "electrical"
  | "other";

export type LeadStatus =
  | "new"
  | "contacted"
  | "replied"
  | "demo_booked"
  | "won"
  | "lost";

export type ClientPlan = "starter" | "pro" | "multi";
export type SetupStatus = "onboarding" | "live";
export type OnboardingStepKey =
  | "discovery"
  | "agent_build"
  | "number_setup"
  | "testing"
  | "go_live";
export type TemplateCategory =
  | "first_touch"
  | "follow_up_1"
  | "follow_up_2"
  | "demo_confirmation";
export type ContactStatus = "new" | "reviewed" | "converted";

export type Profile = {
  id: string;
  full_name: string | null;
  email: string | null;
  role: UserRole;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
};

export type Lead = {
  id: string;
  business_name: string;
  contact_name: string | null;
  email: string | null;
  phone: string | null;
  industry: LeadIndustry;
  city: string | null;
  state: string | null;
  status: LeadStatus;
  source: string | null;
  last_touch_at: string | null;
  next_action: string | null;
  notes: string | null;
  owner_id: string | null;
  created_at: string;
  updated_at: string;
};

export type Client = {
  id: string;
  business_name: string;
  contact_name: string | null;
  email: string | null;
  phone: string | null;
  industry: LeadIndustry;
  plan: ClientPlan;
  mrr: number;
  setup_status: SetupStatus;
  go_live_date: string | null;
  lead_id: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type OnboardingStep = {
  id: string;
  client_id: string;
  step_key: OnboardingStepKey;
  label: string;
  is_complete: boolean;
  completed_at: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type DailyTask = {
  id: string;
  title: string;
  target_count: number;
  day_of_week: number | null; // 0 (Sun) - 6 (Sat); null = every day
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type DailyTaskProgress = {
  id: string;
  task_id: string;
  profile_id: string;
  date: string; // YYYY-MM-DD
  completed_count: number;
  is_done: boolean;
  created_at: string;
  updated_at: string;
};

export type OutreachTemplate = {
  id: string;
  name: string;
  category: TemplateCategory;
  body: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type ContactSubmission = {
  id: string;
  name: string;
  business_name: string | null;
  phone: string | null;
  email: string;
  industry: string | null;
  message: string | null;
  status: ContactStatus;
  created_at: string;
  updated_at: string;
};

/* ---- UI label maps (keep enum values DB-friendly, labels human-friendly) ---- */

export const LEAD_STATUS_LABEL: Record<LeadStatus, string> = {
  new: "New",
  contacted: "Contacted",
  replied: "Replied",
  demo_booked: "Demo Booked",
  won: "Won",
  lost: "Lost",
};

export const LEAD_STATUS_ORDER: LeadStatus[] = [
  "new",
  "contacted",
  "replied",
  "demo_booked",
  "won",
  "lost",
];

export const INDUSTRY_LABEL: Record<LeadIndustry, string> = {
  hvac: "HVAC",
  plumbing: "Plumbing",
  restoration: "Restoration",
  roofing: "Roofing",
  electrical: "Electrical",
  other: "Other",
};

export const INDUSTRY_ORDER: LeadIndustry[] = [
  "hvac",
  "plumbing",
  "restoration",
  "roofing",
  "electrical",
  "other",
];

export const PLAN_LABEL: Record<ClientPlan, string> = {
  starter: "Starter",
  pro: "Pro",
  multi: "Multi-location",
};

export const TEMPLATE_CATEGORY_LABEL: Record<TemplateCategory, string> = {
  first_touch: "First-touch",
  follow_up_1: "Follow-up 1",
  follow_up_2: "Follow-up 2",
  demo_confirmation: "Demo confirmation",
};

export const ONBOARDING_STEP_LABEL: Record<OnboardingStepKey, string> = {
  discovery: "Discovery call",
  agent_build: "Agent build",
  number_setup: "Number setup",
  testing: "Testing",
  go_live: "Go live + monitoring",
};
