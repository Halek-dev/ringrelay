-- ============================================================================
-- Ring Relay — full qualification funnel + outreach log
-- ============================================================================
-- Run AFTER 0003. Adds the "killed" lead status with kill metadata, and the
-- outreach_log table that makes the daily plan derivable from real work.
-- Safe to re-run.

-- A lead can be killed at any funnel gate (wrong type, too big, etc.).
alter type lead_status add value if not exists 'killed';

alter table public.leads add column if not exists killed_at_step int;
alter table public.leads add column if not exists kill_reason text;

-- ============================================================================
-- outreach_log — one row per touch actually sent to a lead
-- ============================================================================
-- This is the source of truth for the daily plan's "first-touch" and
-- "follow-up" counters. No manual counters: you log a real touch against a
-- real lead, and the count moves.
create table if not exists public.outreach_log (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.leads(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  touch_type text not null check (touch_type in ('first_touch','follow_up_1','follow_up_2')),
  channel text not null check (channel in ('email','sms','dm','loom')),
  sent_at timestamptz not null default now(),
  replied boolean not null default false,
  replied_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists idx_outreach_log_profile_sent
  on public.outreach_log (profile_id, sent_at desc);
create index if not exists idx_outreach_log_lead
  on public.outreach_log (lead_id);

alter table public.outreach_log enable row level security;

-- A user logs their own touches; the whole team can read (for KPIs).
drop policy if exists "outreach_log_select" on public.outreach_log;
create policy "outreach_log_select" on public.outreach_log
  for select to authenticated using (true);

drop policy if exists "outreach_log_insert_own" on public.outreach_log;
create policy "outreach_log_insert_own" on public.outreach_log
  for insert to authenticated with check (profile_id = auth.uid());

drop policy if exists "outreach_log_update_own" on public.outreach_log;
create policy "outreach_log_update_own" on public.outreach_log
  for update to authenticated
  using (profile_id = auth.uid()) with check (profile_id = auth.uid());

drop policy if exists "outreach_log_delete_owner" on public.outreach_log;
create policy "outreach_log_delete_owner" on public.outreach_log
  for delete to authenticated using (public.is_owner());
