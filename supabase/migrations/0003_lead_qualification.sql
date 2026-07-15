-- ============================================================================
-- Ring Relay — lead qualification funnel
-- ============================================================================
-- Adds the 7-step qualification funnel outputs to leads: a stored answer set,
-- a computed score + tier, and two funnel-driven statuses. Run in the Supabase
-- SQL editor (or `supabase db push`). Safe to re-run.

-- New funnel-driven statuses. The lifecycle the funnel drives is:
--   new  →  in_progress  →  qualified | lost(killed)
-- (The existing contacted/replied/demo_booked/won values remain for pipeline
-- tracking after a lead qualifies.)
alter type lead_status add value if not exists 'in_progress';
alter type lead_status add value if not exists 'qualified';

-- Qualification outputs on the lead.
alter table public.leads add column if not exists score int;
alter table public.leads add column if not exists tier text;  -- 'hot' | 'warm' | 'cold'
alter table public.leads
  add column if not exists qualification jsonb not null default '{}'::jsonb;

-- Sort hottest-first efficiently (nulls — unscored leads — sort last).
create index if not exists idx_leads_score on public.leads (score desc nulls last);
