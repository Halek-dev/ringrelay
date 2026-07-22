# Ring Relay launch checklist

Work through this top to bottom before the site goes public. Items marked
BLOCKER are legally or functionally required; do not launch without them.

## 1. Legal identity (BLOCKER)

GDPR requires a genuine, identifiable data controller. Replace every
placeholder with real details:

- [x] `app/(marketing)/privacy/page.tsx`: controller filled in (Ringrelay,
      tryringrelay@gmail.com, Little Rock, Arkansas, USA)
- [x] `app/(marketing)/terms/page.tsx`: entity filled in; governing law set to
      the State of Arkansas, United States
- [ ] Confirm tryringrelay@gmail.com actually receives mail

## 2. Database (BLOCKER)

Run migrations in the Supabase SQL editor, in order, against the PRODUCTION
project (skip any already applied):

- [ ] `0001_init.sql`
- [ ] `0002_demo_bookings.sql`
- [ ] `0003_lead_qualification.sql`
- [ ] `0004_funnel_and_outreach_log.sql`
- [ ] `0005_drop_legacy_daily_tasks.sql`
- [ ] `0006_competitor_switching.sql`
- [ ] `0007_contact_finder.sql`
- [ ] `0008_careers_team.sql` (also creates the `cvs` and `team-photos`
      storage buckets and seeds the two job postings)
- [ ] `0009_email_templates.sql` (seeds the three editable email templates)
- [ ] Run `supabase/seed.sql` (outreach templates)
- [ ] Verify in Storage: `cvs` bucket is PRIVATE, `team-photos` is public
- [ ] Create the owner account and confirm `profiles.role = 'owner'`

## 3. Environment variables (BLOCKER)

Set in Vercel project settings (values from `.env.local.example`):

- [ ] `NEXT_PUBLIC_SUPABASE_URL`
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] `SUPABASE_SERVICE_ROLE_KEY` (server only, never exposed)
- [ ] `ANTHROPIC_API_KEY`
- [ ] `ELEVENLABS_API_KEY`
- [ ] `ELEVENLABS_VOICE_ID`
- [ ] `NEXT_PUBLIC_SITE_URL` set to the real domain
- [ ] `RESEND_API_KEY`, `EMAIL_FROM`, `EMAIL_REPLY_TO` (see section 3a)

## 3a. Email (Resend on tryringrelay.com)

Without this, sends are skipped silently and logged. The app still works.

- [ ] Create a resend.com account and add the domain `tryringrelay.com`
- [ ] Add the DNS records Resend shows you (SPF TXT + DKIM CNAMEs) at your
      domain registrar, wait for Verified status
- [ ] Set `EMAIL_FROM="Ring Relay <hello@tryringrelay.com>"` (any local part
      works once the domain is verified; no mailbox needs to exist)
- [ ] Set `EMAIL_REPLY_TO=tryringrelay@gmail.com` so applicant replies reach a
      real inbox you read
- [ ] In /admin/emails, read the three templates, adjust the wording, and use
      "Send me a test" on each to check they land in the inbox, not spam
- [ ] Submit a real test application on /careers and confirm the auto reply
      arrives

## 4. Content

- [ ] Fill in the pay range on both job postings (/admin/careers, edit each
      posting). They are intentionally blank.
- [ ] Read every page once as a stranger: /, /how-it-works, /pricing,
      /onboarding, /careers, /about, /contact, /demo, /privacy, /terms,
      /cookies
- [ ] Point `metadataBase` / `SITE_URL` in `app/layout.tsx` at the real domain

## 5. Deploy

- [ ] Push to GitHub, import the repo in Vercel, deploy
- [ ] Connect the custom domain and confirm HTTPS
- [ ] Enable Web Analytics in the Vercel project (Analytics tab). The site
      only loads it after a visitor opts in to the analytics category.

## 6. Post deploy smoke test (on the live domain)

- [ ] Cookie banner appears on first visit; Reject all and Accept all both
      work; the footer "Cookie preferences" link reopens the centre
- [ ] With analytics rejected: no request to `va.vercel-scripts.com` or
      `/_vercel/insights` in DevTools Network. With it accepted: the script
      loads
- [ ] /demo: microphone works over HTTPS, the receptionist answers and books,
      the booking appears in Supabase `demo_bookings`
- [ ] Contact form submits and the row appears in `contact_submissions`
- [ ] /careers shows both roles; submit a test application WITH a CV; it
      appears in /admin/careers/applications and the CV downloads via the
      signed link
- [ ] Sign in at /admin; a member account cannot see owner only pages
      (/admin/careers, /admin/team-members, /admin/team)
- [ ] Mobile pass at 360px and 390px on /, /pricing, /careers, /demo

## 7. Known gaps, deliberately not built yet

- Applicant emails exist (auto reply, interview invite, rejection), but there
  are still NO owner notifications and NO contact form auto reply: contact
  submissions and demo bookings land in the admin only. Check the admin
  daily, or build notifications before relying on it.
- No rate limiting on /api/demo/chat and /api/demo/speak beyond what the
  vendors enforce: these burn Anthropic and ElevenLabs credits per call.
  Watch usage after launch; add per IP limits before promoting the demo
  widely.
- No admin view for demo bookings; they live in the `demo_bookings` table.
