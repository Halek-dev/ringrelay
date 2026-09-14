# Ring Relay

Marketing site + internal ops console for an agency selling **AI voice
receptionists to US & Canadian home-services businesses** (HVAC, plumbing,
restoration).

- **Public site** — static marketing pages (`/`, `/how-it-works`, `/pricing`,
  `/onboarding`, `/contact`).
- **Ops console** (`/admin/**`) — Supabase-backed, auth-gated internal tool:
  auth, leads pipeline, clients + onboarding, the daily outreach engine,
  message templates, and team management.

## Stack

- **Next.js 14** (App Router) · TypeScript **strict**
- **Tailwind CSS** · **lucide-react** · **@radix-ui/react-dialog**
- **Supabase** — Postgres, Auth, Row Level Security
- `@supabase/ssr` for App-Router cookie/session handling
- Data fetching in **server components**; all mutations via **server actions**
  with server-side auth + role checks

## Environment variables

Copy `.env.local.example` → `.env.local` and fill in from your Supabase project
(**Project Settings → API**):

| Var | Where it's used |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | client + server |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | client + server (RLS enforced) |
| `SUPABASE_SERVICE_ROLE_KEY` | **server only** — creating team members, contact-form rate-limit read. Never exposed to the browser. |

## Setup from zero → working login (Windows CMD)

```cmd
cd "C:\Users\user\Desktop\Project ON\tryringrelay"
npm install
```

1. **Create a Supabase project** at https://supabase.com (free tier is fine).

2. **Set env vars** — copy the example and paste your keys:
   ```cmd
   copy .env.local.example .env.local
   ```
   Edit `.env.local` with your URL, anon key, and service-role key.

3. **Run the migrations.** In the Supabase dashboard → **SQL Editor**, paste and
   **Run** each of these in order:
   - [`supabase/migrations/0001_init.sql`](supabase/migrations/0001_init.sql) — all tables, enums, RLS, triggers
   - [`supabase/migrations/0002_demo_bookings.sql`](supabase/migrations/0002_demo_bookings.sql) — the `/demo` bookings table (skip if not using the voice demo)
   - [`supabase/migrations/0003_lead_qualification.sql`](supabase/migrations/0003_lead_qualification.sql) — lead score/tier/qualification columns + funnel statuses
   - [`supabase/migrations/0004_funnel_and_outreach_log.sql`](supabase/migrations/0004_funnel_and_outreach_log.sql) — `killed` status + kill columns, and the `outreach_log` table that powers logged touches and the derived daily plan

   *(CLI alternative: `supabase db push` with the project linked.)*

4. **Seed the playbook + templates.** SQL Editor → paste
   [`supabase/seed.sql`](supabase/seed.sql) → **Run**.

5. **Create your account.** Public signup is disabled, so create the first user
   manually: dashboard → **Authentication → Users → Add user** → enter your
   email + a password → enable **Auto Confirm User**. A `profiles` row is created
   automatically by a trigger.

6. **Make yourself the owner.** SQL Editor → open
   [`supabase/promote_owner.sql`](supabase/promote_owner.sql), change the email
   to yours, and **Run**.

7. **Start the app and sign in:**
   ```cmd
   npm run dev
   ```
   Open http://localhost:3000/admin/login and sign in. Public site is at
   http://localhost:3000.

Other commands:

```cmd
npm run build   :: production build (type-checks + lints)
npm run start   :: serve the production build
npm run lint    :: eslint
```

## Auth & roles

- Email/password via Supabase Auth. **No public signup** — accounts are created
  by an owner on `/admin/team` or in the Supabase dashboard.
- `middleware.ts` refreshes the session and redirects unauthenticated visitors
  from `/admin/**` to `/admin/login`. The protected layout re-checks server-side.
- **`owner`** can do everything, including managing team members, deleting
  leads/clients, and editing templates. **`member`** can run the pipeline and
  daily plan but can't delete clients/leads, edit templates, or manage members.
  Enforced in **both** RLS policies and server actions (never trust the client).

## Data model (Supabase)

`profiles` · `leads` · `clients` · `onboarding_steps` · `outreach_log` ·
`outreach_templates` · `contact_submissions`.
RLS is enabled on every table. Highlights:

- **`contact_submissions`** — anyone (anon) may **insert** (the public form) but
  **only authenticated team members can read** — reads are locked down.
- **`outreach_log`** — any team member can read; a user inserts/updates rows
  under **their own** `profile_id`; owner-only delete.
- Owner-only writes on `outreach_templates`; owner-only deletes on
  `leads` / `clients`.
- Creating a client auto-seeds its 5 onboarding steps (trigger). Creating an
  auth user auto-creates its profile (trigger).

## How each surface is wired

| Surface | Source |
| --- | --- |
| Contact form | server action → `contact_submissions` (validation + 60s rate-limit) |
| Dashboard KPIs / activity | computed from `leads` + `clients` |
| Today's goals | derived from real rows: leads created, touches in `outreach_log`, and leads whose status moved forward today |
| Daily plan + streak | `lib/data/daily-plan.ts` — every counter is derived from actual activity (no manual check-offs); streak = consecutive days all three goals were met |
| Leads | table/kanban sorted hottest-first, add modal (basics only), detail drawer with the 9-step qualification funnel, owner delete |
| Clients | table → drawer with live `onboarding_steps`; flips to `live` when all done |
| Templates | owner CRUD, copy-to-clipboard for all |
| Team | owner-only; add member via service-role action, role toggle, remove |

Server queries live in [`lib/data/`](lib/data); server actions live next to their
pages (`app/admin/(protected)/<section>/actions.ts`).

### Lead qualification funnel

Workflow: **Add lead (basics only) → open it → run the 9-step funnel → get
score/tier → send the matching message.** The add form captures only the basics
(business, contact, **phone required**, email, city, industry, source, notes);
status is **not** set there. Each new lead starts as `new`.

The funnel lives on the lead detail drawer ([`components/admin/leads-view.tsx`](components/admin/leads-view.tsx),
logic in [`lib/qualification.ts`](lib/qualification.ts)). The first four steps are
gates (type check, profile check, website check, review-platform check); a kill
outcome stops the lead. The last five are the ICP scoring signals: review count
under 50 (+3), no review in 90+ days (+3), runs Google Ads/LSAs (+3), active on
Facebook or Instagram (+1), and 5+ years in business (+1), producing a **score
(0 to 11)** and **tier (A hot >=8 / B warm >=5 / C cool)**. Score/tier/status are
recomputed **server-side** (`saveQualification`) and written to the lead, so the
list sorts hottest-first. The funnel drives status: `new → in_progress →
qualified | killed` (a gate step disqualifies). Edit weights/thresholds/questions
in `lib/qualification.ts`.

## Still frontend-only (by design)

- **Marketing copy, pricing, FAQs, onboarding steps** — static content in
  [`lib/mock-data.ts`](lib/mock-data.ts). Change the `AGENCY` constant to rebrand.
- **Landing-page testimonials** — still stored in `localStorage`
  ([`lib/testimonials-store.ts`](lib/testimonials-store.ts)); managed at
  `/admin/testimonials`. Promote to a Supabase `testimonials` table when you want
  them shared across devices.

## Interactive review demo (`/demo`)

A self-contained, in-browser illustration of how Ring Relay works: a prospect
types their business name, hits **Run**, and watches the review request go out,
a 5-star review land, and the business climb the Google Maps 3-pack as the
review count ticks up. No API keys, no telephony, no data leaves the browser.

- Everything is client-side in
  [`components/demo/review-demo.tsx`](components/demo/review-demo.tsx): a small
  step machine drives the animation on timers; nothing is sent or stored.
- The page shell (hazard stripe, back link, book-a-demo CTA, legal footer) is in
  [`app/demo/page.tsx`](app/demo/page.tsx).
- Because it needs no keys, it always works in every browser. Test it with
  `npm run dev` and open `http://localhost:3000/demo`.

## SEO

Per-page metadata, OpenGraph/Twitter cards, `robots.txt` (disallows `/admin`),
`sitemap.xml`, SVG favicon (`app/icon.svg`), and JSON-LD (`ProfessionalService`
+ `FAQPage`). Drop a 1200×630 `app/opengraph-image.png` to add a share graphic.
