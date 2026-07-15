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
| Leads | table/kanban sorted hottest-first, add modal (basics only), detail drawer with the 7-step qualification funnel, owner delete |
| Clients | table → drawer with live `onboarding_steps`; flips to `live` when all done |
| Templates | owner CRUD, copy-to-clipboard for all |
| Team | owner-only; add member via service-role action, role toggle, remove |

Server queries live in [`lib/data/`](lib/data); server actions live next to their
pages (`app/admin/(protected)/<section>/actions.ts`).

### Lead qualification funnel

Workflow: **Add lead (basics only) → open it → run the 7-step funnel → get
score/tier → send the matching message.** The add form captures only the basics
(business, contact, **phone required**, email, city, industry, source, notes) —
status is **not** set there. Each new lead starts as `new`.

The funnel lives on the lead detail drawer ([`components/admin/leads-view.tsx`](components/admin/leads-view.tsx),
logic in [`lib/qualification.ts`](lib/qualification.ts)): type check → size check →
inbound gap → demand → call test → reachability, each weighted, producing a
**score (0–100)** and **tier (hot ≥70 / warm ≥45 / cold)**. Score/tier/status are
recomputed **server-side** (`saveQualification`) and written to the lead, so the
list sorts hottest-first. The funnel drives status: `new → in_progress →
qualified | lost` (a "gate" step answered No — wrong trade or no missed calls —
disqualifies). Edit weights/thresholds/questions in `lib/qualification.ts`.

## Still frontend-only (by design)

- **Marketing copy, pricing, FAQs, onboarding steps** — static content in
  [`lib/mock-data.ts`](lib/mock-data.ts). Change the `AGENCY` constant to rebrand.
- **Landing-page testimonials** — still stored in `localStorage`
  ([`lib/testimonials-store.ts`](lib/testimonials-store.ts)); managed at
  `/admin/testimonials`. Promote to a Supabase `testimonials` table when you want
  them shared across devices.

## Browser voice demo (`/demo`)

A live, in-browser voice demo of the AI receptionist — a prospect clicks **Talk**,
speaks through their mic, and hears the AI answer out loud, qualify the call, and
book an appointment. No phone call, no telephony — everything runs in the browser
plus two API routes that keep keys server-side.

**Pipeline:** mic → browser Speech Recognition (free, client-side) → Claude
(`app/api/demo/chat`) → ElevenLabs TTS (`app/api/demo/speak`) → audio plays →
listen again. Bookings save to Supabase (`demo_bookings`).

### Setup

1. Add three keys to `.env.local` (all **server-side only**, never exposed to the
   browser):
   ```
   ANTHROPIC_API_KEY=sk-ant-...
   ELEVENLABS_API_KEY=...
   ELEVENLABS_VOICE_ID=...        # ElevenLabs → Voices → copy a voice ID
   ```
   (Supabase vars are already needed for the admin console; the demo reuses the
   service-role key to save bookings.)
2. Create the bookings table — Supabase → SQL Editor → run
   [`supabase/migrations/0002_demo_bookings.sql`](supabase/migrations/0002_demo_bookings.sql).
3. Run the app and open **http://localhost:3000/demo** in **Google Chrome**.

### How to test (Windows)

```cmd
npm run dev
```

- Open `http://localhost:3000/demo` in **Chrome** (the Web Speech API has the best
  support there). Click **Talk**, allow the mic, and say
  *"My water heater is leaking, can someone come out?"* — the receptionist replies
  out loud. Give it your name, a number, and a time and it books you in; the
  **Appointment booked ✓** card shows the captured details and the row lands in
  `demo_bookings`.
- **No mic / not Chrome?** The page detects it and shows a "use Chrome" note plus a
  **Type instead** button — the same conversation works by typing.
- **Mic blocked?** The page explains how to re-enable it from the address bar.
- Without the keys set, the demo loads and the mic works, but the AI turn returns a
  clear "not configured" error — add the two keys to fix.

### What's where

- Persona + system prompt + booking tool: [`lib/demo/config.ts`](lib/demo/config.ts)
  (edit the `RECEPTIONIST` object to change the sample company).
- Brain (Claude `claude-opus-4-8`, tool use, saves booking):
  [`app/api/demo/chat/route.ts`](app/api/demo/chat/route.ts).
- Voice (ElevenLabs TTS, streamed): [`app/api/demo/speak/route.ts`](app/api/demo/speak/route.ts).
- UI (mic states, transcript, booking card, fallbacks):
  [`components/demo/voice-demo.tsx`](components/demo/voice-demo.tsx).

### Latency design (why it feels instant)

The pipeline overlaps its slow steps and hides the thinking time so there's no
silent gap after the caller stops talking:

- **Sentence streaming (the real fix)** — `/api/demo/chat` streams Claude's
  reply as NDJSON, emitting the **first speakable clause** the moment it lands
  (breaking at the first comma / dash / period) and then each sentence after
  that. The browser sends each chunk to ElevenLabs and plays them in order, so
  TTS overlaps Claude instead of waiting for the whole reply. On a normal
  connection the receptionist starts talking within a few hundred ms of Claude's
  first token — usually fast enough that no filler is needed.
- **Fillers only on genuinely slow turns** — no filler plays up front. After the
  caller stops, if Claude *still* hasn't started after `FILLER_THRESHOLD_MS`
  (700ms, in `voice-demo.tsx`), one very short acknowledgment plays
  (*"Mm-hm," "Got it," "Okay," "Sure"* — see `FILLERS` in `lib/demo/config.ts`).
  The same one never plays twice in a row. Most turns use no filler at all.
- **Pre-generated audio** — the greeting + those short acknowledgments are
  generated by ElevenLabs once and cached (client blob + server in-memory), so
  when a filler *is* needed it plays with zero delay.
- **Fast models** — Claude `claude-haiku-4-5` + ElevenLabs `eleven_flash_v2_5`
  (their lowest-latency voice), replies capped to one or two short sentences.

**How to verify the streaming (Chrome DevTools → Console):** the demo logs two
numbers each turn:

```
[demo] first sentence from Claude in 520ms
[demo] first real audio playing in 840ms (no filler)
```

- **first sentence** = time from you finishing speaking to Claude's first chunk
  arriving. This is the real latency lever — it's Claude's time-to-first-token.
- **first real audio** = when the receptionist actually starts talking, and
  whether a filler was needed. `(no filler)` on most turns is the goal.

If "first sentence" is consistently under ~1s you'll rarely see a filler. If it's
high, that's Claude's TTFT / your network, not the pipeline — the DevTools
**Network** tab confirms the `chat` request streams (its response body grows over
time rather than arriving all at once). The server console also logs
`[demo] first chunk emitted in Xms` (Claude's contribution only, excluding TTS).

**Phone check:** during a booking, give a deliberately broken number like
*"+234 911 091 1561 0713"* — the receptionist will notice it's too long and ask
you to repeat it instead of booking (both a prompt-level check and a code-level
digit-count backstop in `lib/demo/config.ts` → `validatePhone`).

To trade speed for quality, edit `CHAT_MODEL` / `TTS_MODEL` in
`lib/demo/config.ts` (e.g. `claude-opus-4-8`, `eleven_turbo_v2_5`).

## SEO

Per-page metadata, OpenGraph/Twitter cards, `robots.txt` (disallows `/admin`),
`sitemap.xml`, SVG favicon (`app/icon.svg`), and JSON-LD (`ProfessionalService`
+ `FAQPage`). Drop a 1200×630 `app/opengraph-image.png` to add a share graphic.
