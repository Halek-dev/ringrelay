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

// Contact finder ("Find a way in")
export type ContactChannelKind =
  | "email_owner"
  | "email_role"
  | "email_guessed"
  | "contact_form"
  | "facebook"
  | "linkedin"
  | "instagram";

export type ContactChannel = {
  kind: ContactChannelKind;
  value: string; // email address or URL
  found: string; // how it was found, e.g. "mailto link", "obfuscated", "guessed"
  verified: boolean; // false for guessed role emails
};

export type ContactResult = {
  channels: ContactChannel[]; // already ranked, best first
  ownerName: string | null;
  sizeWarning: boolean;
  sizeSignals: string[];
  crawledPages: number;
  failedPages: string[];
  blockedByRobots: boolean;
  startUrl: string;
  ranAt: string;
};

// Careers
export type JobStatus = "draft" | "open" | "closed";
export type EmploymentType = "hourly" | "part_time" | "full_time" | "contract";
export type ApplicationStatus =
  | "new"
  | "reviewing"
  | "interview"
  | "rejected"
  | "hired";

export type JobPosting = {
  id: string;
  slug: string;
  title: string;
  employment_type: EmploymentType;
  location: string;
  pay_range: string | null;
  hours_per_week: string | null;
  timezone_requirement: string | null;
  summary: string;
  description: string;
  responsibilities: string[];
  requirements: string[];
  nice_to_haves: string[];
  status: JobStatus;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type JobApplication = {
  id: string;
  posting_id: string;
  full_name: string;
  email: string;
  phone: string;
  country_timezone: string;
  years_experience: string | null;
  hours_per_week: string | null;
  earliest_start: string | null;
  cover_note: string | null;
  cv_path: string | null;
  consent_given: boolean;
  consent_at: string | null;
  status: ApplicationStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

// Transactional email templates (edited in /admin/emails, sent via Resend)
export type EmailTemplateKey =
  | "application_received"
  | "interview_invite"
  | "application_rejected";

export type EmailTemplate = {
  id: string;
  key: EmailTemplateKey;
  name: string;
  description: string | null;
  subject: string;
  body: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type TeamMember = {
  id: string;
  name: string;
  role_title: string;
  photo_url: string | null;
  bio: string | null;
  sort_order: number;
  is_published: boolean;
  created_at: string;
  updated_at: string;
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
  contact_form_url: string | null;
  facebook_url: string | null;
  linkedin_url: string | null;
  owner_name: string | null;
  contact_channels: ContactResult | null;
  contact_found_at: string | null;
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

export const JOB_STATUS_LABEL: Record<JobStatus, string> = {
  draft: "Draft",
  open: "Open",
  closed: "Closed",
};

export const EMPLOYMENT_TYPE_LABEL: Record<EmploymentType, string> = {
  hourly: "Hourly",
  part_time: "Part time",
  full_time: "Full time",
  contract: "Contract",
};

export const APPLICATION_STATUS_LABEL: Record<ApplicationStatus, string> = {
  new: "New",
  reviewing: "Reviewing",
  interview: "Interview",
  rejected: "Rejected",
  hired: "Hired",
};

export const APPLICATION_STATUS_ORDER: ApplicationStatus[] = [
  "new",
  "reviewing",
  "interview",
  "rejected",
  "hired",
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
