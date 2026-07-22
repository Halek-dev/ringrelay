-- ============================================================================
-- Ring Relay email templates
-- ============================================================================
-- Run AFTER 0008. Editable transactional email templates: the owner writes the
-- subject and body in the admin (/admin/emails) and the app substitutes
-- variables and sends through Resend. Code never hardcodes email copy.
--
-- Keys are stable identifiers the code looks up. Adding a template here means
-- also adding a send site in the code, so keys are seeded, not user-created.
-- Safe to re-run.

create table if not exists public.email_templates (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,          -- stable code-facing id, e.g. application_received
  name text not null,                -- human label shown in the admin
  description text,                  -- when this email goes out
  subject text not null,
  body text not null,                -- plain text with {{variables}}, rendered into the branded wrapper
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists trg_email_templates_updated on public.email_templates;
create trigger trg_email_templates_updated before update on public.email_templates
  for each row execute function public.set_updated_at();

alter table public.email_templates enable row level security;

-- Owner reads and edits; sending happens server side with the service role.
drop policy if exists "email_templates_owner" on public.email_templates;
create policy "email_templates_owner" on public.email_templates
  for all to authenticated
  using (public.is_owner()) with check (public.is_owner());

-- ------------------------------------------------------------- seed copy ----
-- Default copy the owner can rewrite in the admin. Variables available:
-- {{name}} full name, {{first_name}}, {{role}} the job title.
insert into public.email_templates (key, name, description, subject, body)
select * from (values
  (
    'application_received',
    'Application received (auto reply)',
    'Sent automatically to an applicant right after they submit the form on the careers page.',
    'We received your application for {{role}}',
    E'Hi {{first_name}},\n\nThanks for applying for the {{role}} role at Ring Relay. Your application is in, and a real person will read it, usually within a week.\n\nIf it looks like a fit, we will email you to set up a short call. If not, we will let you know rather than leave you guessing.\n\nYou do not need to do anything else right now.\n\nRing Relay'
  ),
  (
    'interview_invite',
    'Interview invite',
    'Sent from the applications inbox when you move an applicant to Interview.',
    'Next step for your {{role}} application',
    E'Hi {{first_name}},\n\nGood news. We read your application for {{role}} and we would like to talk.\n\nReply to this email with a few times that work for you this week, including your timezone, and we will confirm a short call of about 20 to 30 minutes.\n\nTalk soon,\nRing Relay'
  ),
  (
    'application_rejected',
    'Application rejected',
    'Sent from the applications inbox when you reject an applicant. Polite and final.',
    'Your {{role}} application at Ring Relay',
    E'Hi {{first_name}},\n\nThank you for taking the time to apply for {{role}}. We read every application, and we will not be moving forward with yours this time.\n\nThis is usually about fit and timing rather than ability. We keep applications on file for 12 months, and you are welcome to apply again as we grow.\n\nWe wish you the best,\nRing Relay'
  )
) as v(key, name, description, subject, body)
where not exists (
  select 1 from public.email_templates t where t.key = v.key
);
