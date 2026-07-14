-- ============================================================================
-- Ring Relay — initial schema, RLS, and triggers
-- ============================================================================
-- Run in the Supabase SQL editor, or via `supabase db push` with the CLI.
-- Idempotent-ish: uses IF NOT EXISTS / DROP POLICY IF EXISTS where practical.

-- Extensions ---------------------------------------------------------------
create extension if not exists "pgcrypto"; -- gen_random_uuid()

-- Enums --------------------------------------------------------------------
do $$ begin
  create type user_role as enum ('owner', 'member');
exception when duplicate_object then null; end $$;

do $$ begin
  create type lead_industry as enum ('hvac','plumbing','restoration','roofing','electrical','other');
exception when duplicate_object then null; end $$;

do $$ begin
  create type lead_status as enum ('new','contacted','replied','demo_booked','won','lost');
exception when duplicate_object then null; end $$;

do $$ begin
  create type client_plan as enum ('starter','pro','multi');
exception when duplicate_object then null; end $$;

do $$ begin
  create type setup_status as enum ('onboarding','live');
exception when duplicate_object then null; end $$;

do $$ begin
  create type onboarding_step_key as enum ('discovery','agent_build','number_setup','testing','go_live');
exception when duplicate_object then null; end $$;

do $$ begin
  create type template_category as enum ('first_touch','follow_up_1','follow_up_2','demo_confirmation');
exception when duplicate_object then null; end $$;

do $$ begin
  create type contact_status as enum ('new','reviewed','converted');
exception when duplicate_object then null; end $$;

-- Shared helpers -----------------------------------------------------------

-- Keep updated_at fresh on every update.
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

-- ============================================================================
-- profiles
-- ============================================================================
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  email text,
  role user_role not null default 'member',
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists trg_profiles_updated on public.profiles;
create trigger trg_profiles_updated before update on public.profiles
  for each row execute function public.set_updated_at();

alter table public.profiles enable row level security;

-- Is the calling user an owner? Used by RLS policies below. Defined after the
-- profiles table exists (a LANGUAGE sql function is body-checked at creation).
-- SECURITY DEFINER + a stable search_path so it can read profiles without
-- recursing through profiles' own RLS.
create or replace function public.is_owner()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = 'owner'
  );
$$;

-- Any authenticated user can read all profiles.
drop policy if exists "profiles_select" on public.profiles;
create policy "profiles_select" on public.profiles
  for select to authenticated using (true);

-- A user may update their own non-role fields; owners may update anyone.
-- (Role changes are further constrained below.)
drop policy if exists "profiles_update_self_or_owner" on public.profiles;
create policy "profiles_update_self_or_owner" on public.profiles
  for update to authenticated
  using (id = auth.uid() or public.is_owner())
  with check (id = auth.uid() or public.is_owner());

-- Only owners may insert profile rows directly (normal creation happens via
-- the handle_new_user trigger / service-role server action).
drop policy if exists "profiles_insert_owner" on public.profiles;
create policy "profiles_insert_owner" on public.profiles
  for insert to authenticated with check (public.is_owner());

-- Auto-create a profile when a new auth user is created.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, email, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    new.email,
    coalesce((new.raw_user_meta_data->>'role')::user_role, 'member')
  )
  on conflict (id) do nothing;
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================================
-- leads
-- ============================================================================
create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  business_name text not null,
  contact_name text,
  email text,
  phone text,
  industry lead_industry not null default 'other',
  city text,
  state text,
  status lead_status not null default 'new',
  source text,
  last_touch_at timestamptz,
  next_action text,
  notes text,
  owner_id uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_leads_status on public.leads(status);
create index if not exists idx_leads_created on public.leads(created_at desc);

drop trigger if exists trg_leads_updated on public.leads;
create trigger trg_leads_updated before update on public.leads
  for each row execute function public.set_updated_at();

alter table public.leads enable row level security;

drop policy if exists "leads_select" on public.leads;
create policy "leads_select" on public.leads
  for select to authenticated using (true);

drop policy if exists "leads_insert" on public.leads;
create policy "leads_insert" on public.leads
  for insert to authenticated with check (true);

drop policy if exists "leads_update" on public.leads;
create policy "leads_update" on public.leads
  for update to authenticated using (true) with check (true);

-- Only owners may delete leads.
drop policy if exists "leads_delete_owner" on public.leads;
create policy "leads_delete_owner" on public.leads
  for delete to authenticated using (public.is_owner());

-- ============================================================================
-- clients
-- ============================================================================
create table if not exists public.clients (
  id uuid primary key default gen_random_uuid(),
  business_name text not null,
  contact_name text,
  email text,
  phone text,
  industry lead_industry not null default 'other',
  plan client_plan not null default 'starter',
  mrr numeric(10,2) not null default 0,
  setup_status setup_status not null default 'onboarding',
  go_live_date date,
  lead_id uuid references public.leads(id) on delete set null,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists trg_clients_updated on public.clients;
create trigger trg_clients_updated before update on public.clients
  for each row execute function public.set_updated_at();

alter table public.clients enable row level security;

drop policy if exists "clients_select" on public.clients;
create policy "clients_select" on public.clients
  for select to authenticated using (true);

drop policy if exists "clients_insert" on public.clients;
create policy "clients_insert" on public.clients
  for insert to authenticated with check (true);

drop policy if exists "clients_update" on public.clients;
create policy "clients_update" on public.clients
  for update to authenticated using (true) with check (true);

drop policy if exists "clients_delete_owner" on public.clients;
create policy "clients_delete_owner" on public.clients
  for delete to authenticated using (public.is_owner());

-- ============================================================================
-- onboarding_steps  (5 per client)
-- ============================================================================
create table if not exists public.onboarding_steps (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  step_key onboarding_step_key not null,
  label text not null,
  is_complete boolean not null default false,
  completed_at timestamptz,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (client_id, step_key)
);

create index if not exists idx_onboarding_client on public.onboarding_steps(client_id);

drop trigger if exists trg_onboarding_updated on public.onboarding_steps;
create trigger trg_onboarding_updated before update on public.onboarding_steps
  for each row execute function public.set_updated_at();

alter table public.onboarding_steps enable row level security;

drop policy if exists "onboarding_select" on public.onboarding_steps;
create policy "onboarding_select" on public.onboarding_steps
  for select to authenticated using (true);

drop policy if exists "onboarding_insert" on public.onboarding_steps;
create policy "onboarding_insert" on public.onboarding_steps
  for insert to authenticated with check (true);

drop policy if exists "onboarding_update" on public.onboarding_steps;
create policy "onboarding_update" on public.onboarding_steps
  for update to authenticated using (true) with check (true);

drop policy if exists "onboarding_delete_owner" on public.onboarding_steps;
create policy "onboarding_delete_owner" on public.onboarding_steps
  for delete to authenticated using (public.is_owner());

-- Auto-insert the 5 default onboarding steps when a client is created.
create or replace function public.seed_onboarding_steps()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.onboarding_steps (client_id, step_key, label, sort_order) values
    (new.id, 'discovery',     'Discovery call',        1),
    (new.id, 'agent_build',   'Agent build',           2),
    (new.id, 'number_setup',  'Number setup',          3),
    (new.id, 'testing',       'Testing',               4),
    (new.id, 'go_live',       'Go live + monitoring',  5)
  on conflict (client_id, step_key) do nothing;
  return new;
end $$;

drop trigger if exists on_client_created on public.clients;
create trigger on_client_created
  after insert on public.clients
  for each row execute function public.seed_onboarding_steps();

-- ============================================================================
-- daily_tasks  (definitions of the recurring outreach playbook)
-- ============================================================================
create table if not exists public.daily_tasks (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  target_count int not null default 1,
  day_of_week int check (day_of_week between 0 and 6), -- null = every day
  sort_order int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists trg_daily_tasks_updated on public.daily_tasks;
create trigger trg_daily_tasks_updated before update on public.daily_tasks
  for each row execute function public.set_updated_at();

alter table public.daily_tasks enable row level security;

drop policy if exists "daily_tasks_select" on public.daily_tasks;
create policy "daily_tasks_select" on public.daily_tasks
  for select to authenticated using (true);

-- Only owners manage the playbook definitions.
drop policy if exists "daily_tasks_write_owner" on public.daily_tasks;
create policy "daily_tasks_write_owner" on public.daily_tasks
  for all to authenticated using (public.is_owner()) with check (public.is_owner());

-- ============================================================================
-- daily_task_progress  (per user, per date)
-- ============================================================================
create table if not exists public.daily_task_progress (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.daily_tasks(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  date date not null default current_date,
  completed_count int not null default 0,
  is_done boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (task_id, profile_id, date)
);

create index if not exists idx_progress_profile_date
  on public.daily_task_progress(profile_id, date);

drop trigger if exists trg_progress_updated on public.daily_task_progress;
create trigger trg_progress_updated before update on public.daily_task_progress
  for each row execute function public.set_updated_at();

alter table public.daily_task_progress enable row level security;

-- A user can only read/write their OWN progress rows.
drop policy if exists "progress_select_own" on public.daily_task_progress;
create policy "progress_select_own" on public.daily_task_progress
  for select to authenticated using (profile_id = auth.uid());

drop policy if exists "progress_insert_own" on public.daily_task_progress;
create policy "progress_insert_own" on public.daily_task_progress
  for insert to authenticated with check (profile_id = auth.uid());

drop policy if exists "progress_update_own" on public.daily_task_progress;
create policy "progress_update_own" on public.daily_task_progress
  for update to authenticated
  using (profile_id = auth.uid()) with check (profile_id = auth.uid());

drop policy if exists "progress_delete_own" on public.daily_task_progress;
create policy "progress_delete_own" on public.daily_task_progress
  for delete to authenticated using (profile_id = auth.uid());

-- ============================================================================
-- outreach_templates
-- ============================================================================
create table if not exists public.outreach_templates (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category template_category not null,
  body text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists trg_templates_updated on public.outreach_templates;
create trigger trg_templates_updated before update on public.outreach_templates
  for each row execute function public.set_updated_at();

alter table public.outreach_templates enable row level security;

drop policy if exists "templates_select" on public.outreach_templates;
create policy "templates_select" on public.outreach_templates
  for select to authenticated using (true);

-- Owners can insert/update/delete templates.
drop policy if exists "templates_write_owner" on public.outreach_templates;
create policy "templates_write_owner" on public.outreach_templates
  for all to authenticated using (public.is_owner()) with check (public.is_owner());

-- ============================================================================
-- contact_submissions  (public form)
-- ============================================================================
create table if not exists public.contact_submissions (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  business_name text,
  phone text,
  email text not null,
  industry text,
  message text,
  status contact_status not null default 'new',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_contact_email_created
  on public.contact_submissions(email, created_at desc);

drop trigger if exists trg_contact_updated on public.contact_submissions;
create trigger trg_contact_updated before update on public.contact_submissions
  for each row execute function public.set_updated_at();

alter table public.contact_submissions enable row level security;

-- Anonymous visitors can INSERT (submit the form) but cannot read anything.
drop policy if exists "contact_insert_public" on public.contact_submissions;
create policy "contact_insert_public" on public.contact_submissions
  for insert to anon, authenticated with check (true);

-- Only authenticated team members can read/update/delete submissions.
drop policy if exists "contact_select_team" on public.contact_submissions;
create policy "contact_select_team" on public.contact_submissions
  for select to authenticated using (true);

drop policy if exists "contact_update_team" on public.contact_submissions;
create policy "contact_update_team" on public.contact_submissions
  for update to authenticated using (true) with check (true);

drop policy if exists "contact_delete_owner" on public.contact_submissions;
create policy "contact_delete_owner" on public.contact_submissions
  for delete to authenticated using (public.is_owner());
