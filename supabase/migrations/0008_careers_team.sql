-- ============================================================================
-- Ring Relay careers system + team CMS
-- ============================================================================
-- Run AFTER 0007. Adds job postings, job applications, team members, and the
-- two storage buckets (private CVs, public team photos).
--
-- Honesty rule: nothing here seeds fake people. The team_members table starts
-- empty and the public team section renders nothing until a real hire is
-- added. The two seeded postings are real roles being hired for, with the pay
-- range left blank for the owner to fill in.
-- Safe to re-run.

-- ---------------------------------------------------------------- enums ----
do $$ begin
  create type job_status as enum ('draft','open','closed');
exception when duplicate_object then null; end $$;

do $$ begin
  create type employment_type as enum ('hourly','part_time','full_time','contract');
exception when duplicate_object then null; end $$;

do $$ begin
  create type application_status as enum ('new','reviewing','interview','rejected','hired');
exception when duplicate_object then null; end $$;

-- --------------------------------------------------------- job_postings ----
create table if not exists public.job_postings (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  employment_type employment_type not null default 'hourly',
  location text not null default 'Remote',
  pay_range text,                 -- left blank on purpose; owner fills it in
  hours_per_week text,
  timezone_requirement text,
  summary text not null,
  description text not null,
  responsibilities text[] not null default '{}',
  requirements text[] not null default '{}',
  nice_to_haves text[] not null default '{}',
  status job_status not null default 'draft',
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists trg_job_postings_updated on public.job_postings;
create trigger trg_job_postings_updated before update on public.job_postings
  for each row execute function public.set_updated_at();

alter table public.job_postings enable row level security;

-- Anyone (including anon) may read OPEN postings; owners see everything.
drop policy if exists "job_postings_select_open" on public.job_postings;
create policy "job_postings_select_open" on public.job_postings
  for select using (status = 'open');

drop policy if exists "job_postings_select_owner" on public.job_postings;
create policy "job_postings_select_owner" on public.job_postings
  for select to authenticated using (public.is_owner());

drop policy if exists "job_postings_write_owner" on public.job_postings;
create policy "job_postings_write_owner" on public.job_postings
  for all to authenticated
  using (public.is_owner()) with check (public.is_owner());

-- ------------------------------------------------------ job_applications ----
create table if not exists public.job_applications (
  id uuid primary key default gen_random_uuid(),
  posting_id uuid not null references public.job_postings(id) on delete cascade,
  full_name text not null,
  email text not null,
  phone text not null,
  country_timezone text not null,
  years_experience text,
  hours_per_week text,
  earliest_start text,
  cover_note text,
  cv_path text,                    -- object path inside the private cvs bucket
  consent_given boolean not null default false,
  consent_at timestamptz,
  status application_status not null default 'new',
  notes text,                      -- private owner notes
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_job_applications_posting
  on public.job_applications (posting_id, created_at desc);

drop trigger if exists trg_job_applications_updated on public.job_applications;
create trigger trg_job_applications_updated before update on public.job_applications
  for each row execute function public.set_updated_at();

alter table public.job_applications enable row level security;

-- Applicants (anon) may submit; only owners can ever read or change them.
drop policy if exists "job_applications_insert_any" on public.job_applications;
create policy "job_applications_insert_any" on public.job_applications
  for insert with check (true);

drop policy if exists "job_applications_owner" on public.job_applications;
create policy "job_applications_owner" on public.job_applications
  for select to authenticated using (public.is_owner());

drop policy if exists "job_applications_update_owner" on public.job_applications;
create policy "job_applications_update_owner" on public.job_applications
  for update to authenticated
  using (public.is_owner()) with check (public.is_owner());

drop policy if exists "job_applications_delete_owner" on public.job_applications;
create policy "job_applications_delete_owner" on public.job_applications
  for delete to authenticated using (public.is_owner());

-- ---------------------------------------------------------- team_members ----
-- Starts EMPTY. No seeded people, ever. The public section renders only
-- published rows and disappears entirely when there are none.
create table if not exists public.team_members (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  role_title text not null,
  photo_url text,
  bio text,
  sort_order int not null default 0,
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists trg_team_members_updated on public.team_members;
create trigger trg_team_members_updated before update on public.team_members
  for each row execute function public.set_updated_at();

alter table public.team_members enable row level security;

drop policy if exists "team_members_select_published" on public.team_members;
create policy "team_members_select_published" on public.team_members
  for select using (is_published = true);

drop policy if exists "team_members_select_owner" on public.team_members;
create policy "team_members_select_owner" on public.team_members
  for select to authenticated using (public.is_owner());

drop policy if exists "team_members_write_owner" on public.team_members;
create policy "team_members_write_owner" on public.team_members
  for all to authenticated
  using (public.is_owner()) with check (public.is_owner());

-- -------------------------------------------------------- storage buckets ----
-- cvs: PRIVATE. Uploads and reads happen only through server actions using the
-- service role (owner-verified), and downloads are short-lived signed URLs.
insert into storage.buckets (id, name, public)
values ('cvs', 'cvs', false)
on conflict (id) do nothing;

-- team-photos: PUBLIC read (photos render on the site). Writes are service
-- role only (owner-verified server action), so no anon write policy exists.
insert into storage.buckets (id, name, public)
values ('team-photos', 'team-photos', true)
on conflict (id) do nothing;

-- Explicit owner-read policy for CVs as defense in depth (service role
-- bypasses RLS anyway, but this documents intent).
drop policy if exists "cvs_owner_read" on storage.objects;
create policy "cvs_owner_read" on storage.objects
  for select to authenticated
  using (bucket_id = 'cvs' and public.is_owner());

-- ------------------------------------------------------ seed: real roles ----
-- Two genuine openings. Honest early-stage descriptions, no invented pay.
insert into public.job_postings
  (slug, title, employment_type, location, hours_per_week, timezone_requirement,
   summary, description, responsibilities, requirements, nice_to_haves, status, sort_order)
select * from (values
  (
    'customer-representative',
    'Customer Representative',
    'hourly'::employment_type,
    'Remote',
    '15 to 25 hours per week to start',
    'Significant overlap with US business hours (Central Time)',
    'Support our clients, US home services business owners, once their AI receptionist is live. Monitor call quality and flag issues before the client notices them.',
    'Ring Relay is an early stage agency. We set up AI phone receptionists for US home services businesses (plumbing, HVAC, water damage restoration) so they stop losing jobs to missed calls. We are small, remote first, and hiring our first team members. This role is the face of Ring Relay after a client goes live. You will answer their questions in plain English, keep an eye on how their AI receptionist is performing, and make sure small problems get caught early. It is a real support role with real responsibility from day one, and the processes are still being written, often by you.',
    array[
      'Answer inbound questions from clients by email and chat, clearly and quickly',
      'Review call logs and transcripts for quality issues and flag anything off',
      'Walk new clients through small changes to their receptionist setup',
      'Escalate technical problems with enough detail that they can be fixed fast',
      'Document recurring questions so our answers get better over time'
    ],
    array[
      'Excellent written and spoken English',
      'Reliable availability overlapping US business hours',
      'Comfortable working independently in a small remote team',
      'A calm, helpful tone with non technical business owners',
      'Stable internet and a computer you can work on daily'
    ],
    array[
      'Experience supporting US customers',
      'Familiarity with the home services trades',
      'Experience with support tooling or shared inboxes'
    ],
    'open'::job_status,
    1
  ),
  (
    'appointment-setter',
    'Appointment Setter',
    'hourly'::employment_type,
    'Remote',
    '15 to 25 hours per week to start',
    'Able to make calls during US business hours (Central Time)',
    'Outbound outreach to US home services businesses. Research prospects, contact them in writing and by phone, and book discovery calls.',
    'Ring Relay is an early stage agency selling AI phone receptionists to US home services businesses (plumbing, HVAC, water damage restoration). We are small, remote first, and hiring our first team members. This role fills the top of our pipeline. You will research small trades businesses, reach out in writing and by phone, and book discovery calls for the founder. Most people you contact will say no or say nothing. That is the nature of outbound. What matters is a clear, confident phone manner, honest logging of every touch, and steady daily volume. We will give you the tools, the scripts, and the target list. You bring the diligence.',
    array[
      'Research US home services businesses that fit our customer profile',
      'Reach out by email, social message, and phone, following our playbook',
      'Book qualified discovery calls onto the calendar',
      'Log every touch and outcome accurately in our CRM, no exceptions',
      'Report what is working and what is not so the playbook improves'
    ],
    array[
      'Clear, confident spoken English suited to US small business owners',
      'Comfort with rejection and the discipline to keep dialing',
      'Diligent record keeping. If it is not logged, it did not happen',
      'Availability during US business hours for calls',
      'Stable internet, a quiet space to call from, and a working headset'
    ],
    array[
      'Outbound sales or appointment setting experience',
      'Familiarity with US home services trades',
      'Experience with CRMs or outreach tools'
    ],
    'open'::job_status,
    2
  )
) as v(slug, title, employment_type, location, hours_per_week, timezone_requirement,
       summary, description, responsibilities, requirements, nice_to_haves, status, sort_order)
where not exists (
  select 1 from public.job_postings p where p.slug = v.slug
);
