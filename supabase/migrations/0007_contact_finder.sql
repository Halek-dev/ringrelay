-- ============================================================================
-- Ring Relay contact finder ("Find a way in")
-- ============================================================================
-- Run AFTER 0006. Stores the ranked contact channels a crawl found for a lead,
-- so a business is never re-crawled and the best way in shows on the list.
--
-- Reality note (see also the crawler): this finds a viable channel for maybe
-- half of small trades businesses. Many genuinely do not publish an email, and
-- the fallback is Facebook or a contact form. That is a normal outcome.
-- Safe to re-run.

-- `email` already exists on leads; the crawler only fills it when it is empty.
alter table public.leads add column if not exists contact_form_url text;
alter table public.leads add column if not exists facebook_url text;
alter table public.leads add column if not exists linkedin_url text;
alter table public.leads add column if not exists owner_name text;
-- The full ranked result (every channel, how it was found, size signals).
alter table public.leads add column if not exists contact_channels jsonb;
alter table public.leads add column if not exists contact_found_at timestamptz;
