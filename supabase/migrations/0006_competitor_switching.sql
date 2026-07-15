-- ============================================================================
-- Ring Relay — competitor (AI receptionist) tracking + switching-pitch templates
-- ============================================================================
-- Run AFTER 0005. Some prospects already run an AI receptionist. That is not a
-- kill: it is a switching sale. This adds a flag for the common "after hours
-- only" competitor deployment, plus two new outreach template categories for
-- the switching pitch.
-- Safe to re-run.

-- Two switching-pitch categories for the recommended action panel.
alter type template_category add value if not exists 'switching_pitch_after_hours';
alter type template_category add value if not exists 'switching_pitch_quality';

-- When a prospect's AI only covers after hours, their daytime calls still go
-- unanswered. That is the gap we sell into, so we store it on the lead.
alter table public.leads
  add column if not exists competitor_after_hours_only boolean not null default false;
