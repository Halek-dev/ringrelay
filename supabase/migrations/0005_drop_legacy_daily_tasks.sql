-- ============================================================================
-- Ring Relay — drop the legacy daily-plan tables
-- ============================================================================
-- The daily plan is now DERIVED from real activity (leads created, touches in
-- outreach_log, and status changes), so the hand-tracked task tables from
-- 0001_init.sql are no longer read or written anywhere in the app.
--
-- Run this AFTER 0004. Dropping the tables also removes their policies,
-- triggers, and the daily_task_progress -> daily_tasks foreign key.

drop table if exists public.daily_task_progress;
drop table if exists public.daily_tasks;
