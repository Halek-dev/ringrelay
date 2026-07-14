-- ============================================================================
-- Ring Relay — demo_bookings (browser voice demo at /demo)
-- ============================================================================
-- Bookings captured by the AI receptionist demo. Rows are written server-side
-- with the service-role key (bypasses RLS); RLS below locks down direct access.

create extension if not exists "pgcrypto";

create table if not exists public.demo_bookings (
  id uuid primary key default gen_random_uuid(),
  caller_name text not null,
  phone text not null,
  service text not null,
  preferred_time text not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_demo_bookings_created
  on public.demo_bookings(created_at desc);

alter table public.demo_bookings enable row level security;

-- No anon/authenticated access by default. Inserts happen via the service-role
-- key in the API route. Allow signed-in team members to read demo bookings.
drop policy if exists "demo_bookings_select_team" on public.demo_bookings;
create policy "demo_bookings_select_team" on public.demo_bookings
  for select to authenticated using (true);
