-- ============================================================================
-- 0011_lead_outreach_message
-- ============================================================================
-- Adds a per-lead personalized outreach message. A prospect list often ships
-- with a "message" column written for each business individually; the CSV
-- importer stores it here, and the one-click "Send outreach" action sends each
-- lead its own message. Nullable: leads added by hand or without the column
-- simply have none, and fall back to a typed message.
alter table public.leads
  add column if not exists outreach_message text;
