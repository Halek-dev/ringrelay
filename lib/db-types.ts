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
  | "in_progress"
  | "qualified"
  | "killed"
  | "contacted"
  | "replied"
  | "demo_booked"
  | "won"
  | "lost";

// Funnel outputs
export type LeadTier = "hot" | "warm" | "cool" | "skip";
// Each key is a funnel step; the value is the chosen outcome id for that step.
export type QualificationAnswers = Partial<Record<string, string>>;

// Outreach log
export type TouchType = "first_touch" | "follow_up_1" | "follow_up_2";
export type OutreachChannel = "email" | "sms" | "dm" | "loom";
export type OutreachLog = {
  id: string;
  lead_id: string;
  profile_id: string;
  touch_type: TouchType;
  channel: OutreachChannel;
  sent_at: string;
  replied: boolean;
  replied_at: string | null;
  created_at: string;
};

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
  | "demo_confirmation"
  | "switching_pitch_after_hours"
  | "switching_pitch_quality";
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
  score: number | null;
  tier: LeadTier | null;
  qualification: QualificationAnswers;
  killed_at_step: number | null;
  kill_reason: string | null;
  competitor_after_hours_only: boolean;
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
  in_progress: "In Progress",
  qualified: "Qualified",
  killed: "Killed",
  contacted: "Contacted",
  replied: "Replied",
  demo_booked: "Demo Booked",
  won: "Won",
  lost: "Lost",
};

export const LEAD_STATUS_ORDER: LeadStatus[] = [
  "new",
  "in_progress",
  "qualified",
  "contacted",
  "replied",
  "demo_booked",
  "won",
  "lost",
  "killed",
];

export const TIER_LABEL: Record<LeadTier, string> = {
  hot: "Hot",
  warm: "Warm",
  cool: "Cool",
  skip: "Skip",
};

export const TOUCH_TYPE_LABEL: Record<TouchType, string> = {
  first_touch: "First touch",
  follow_up_1: "Follow-up 1",
  follow_up_2: "Follow-up 2",
};

export const OUTREACH_CHANNEL_LABEL: Record<OutreachChannel, string> = {
  email: "Email",
  sms: "SMS",
  dm: "DM",
  loom: "Loom",
};

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
  switching_pitch_after_hours: "Switching pitch (after hours)",
  switching_pitch_quality: "Switching pitch (quality)",
};

export const ONBOARDING_STEP_LABEL: Record<OnboardingStepKey, string> = {
  discovery: "Discovery call",
  agent_build: "Agent build",
  number_setup: "Number setup",
  testing: "Testing",
  go_live: "Go live + monitoring",
};
