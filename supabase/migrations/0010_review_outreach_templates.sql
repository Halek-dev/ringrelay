-- ============================================================================
-- 0010_review_outreach_templates
-- ============================================================================
-- The pivot to the review-request product rewrote the outreach templates
-- (supabase/seed.sql), but a database seeded before the pivot still holds the
-- old receptionist copy. seed.sql only inserts names that are missing, so it
-- cannot replace a template whose name stayed the same, nor remove one that was
-- dropped. This migration fixes an existing database to match the new seed.
--
-- Idempotent: safe to run on a fresh database (deletes match nothing, updates
-- match nothing new, inserts fill the gaps) and safe to re-run.

-- 1. Remove the templates that no longer exist in the new set: the two renamed
--    first-touch openers and the two competitor-switching pitches.
delete from public.outreach_templates
where name in (
  'First touch: Loom-led (hot leads)',
  'First touch: proof-led (warm leads)',
  'Switching pitch: after-hours gap (competitor)',
  'Switching pitch: quality (competitor)'
);

-- 2. Rewrite the bodies of the templates whose names carried over from the old
--    seed, so they no longer describe a phone receptionist.
update public.outreach_templates
set body = 'Hi {{first_name}}, {{sender}} with Ring Relay. We set up automatic Google review requests for HVAC and roofing shops so more happy customers actually leave the 5-star review instead of forgetting. If getting more reviews for {{business}} is ever on your list, reply here and I will send a 2 minute demo.'
where name = 'First touch: single batch (cool leads)';

update public.outreach_templates
set body = 'Hi {{first_name}}, circling back on getting {{business}} more Google reviews on autopilot. No pressure. I can send a 2 minute demo of exactly how the request goes out after a job, if that is easier than reading about it. Want me to?'
where name = 'Follow-up 1: bump';

update public.outreach_templates
set body = '{{first_name}}, I will stop here so I am not cluttering your inbox. If more reviews and a higher spot on the map ever move up your list, we are one reply away and setup takes minutes. Either way, best of luck this season. {{sender}}, Ring Relay'
where name = 'Follow-up 2: breakup';

update public.outreach_templates
set body = 'You are set, {{first_name}}. Call confirmed for {{demo_time}}. Want a preview first? You can watch how the review request and the ranking bump work right in your browser at {{demo_url}}. Talk soon. {{sender}}'
where name = 'Demo confirmation';

-- 3. Add the two renamed first-touch openers if they are not already present.
insert into public.outreach_templates (name, category, body, is_active)
select v.name, v.category::template_category, v.body, true
from (values
  (
    'First touch: review gap (hot leads)', 'first_touch',
    'Hi {{first_name}}, {{sender}} here with Ring Relay. I looked up {{business}} on Google Maps: you are showing {{review_count}} reviews while {{competitor}} sits above you with {{competitor_reviews}}. On the ads you already run, that gap is often the difference between a click and a call. We ask every happy customer for a Google review automatically after the job, so the count climbs without anyone remembering to ask. Worth a quick reply?'
  ),
  (
    'First touch: value led (warm leads)', 'first_touch',
    'Hey {{first_name}}, quick one for {{business}}. More recent 5-star Google reviews is what lifts you in the map and gets the phone ringing, but asking for them by hand never happens when the crew is out on jobs. Ring Relay sends the request for you after every visit, so the reviews come in on their own. $97 a month, no setup, cancel anytime. Open to a 10 minute look this week?'
  )
) as v(name, category, body)
where not exists (
  select 1 from public.outreach_templates t where t.name = v.name
);
