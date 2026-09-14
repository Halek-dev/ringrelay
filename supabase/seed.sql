-- ============================================================================
-- Ring Relay seed data
-- ============================================================================
-- Seeds the outreach templates. The daily plan is derived from real activity,
-- so there is no playbook to seed.
-- Safe to re-run: each row is inserted only if a matching one isn't present.

-- Outreach templates -------------------------------------------------------
-- The name carries a tier hint (gap/value/batch). The qualification funnel
-- reads that hint to recommend the matching first touch: gap for hot leads,
-- value for warm, batch for cool. Placeholders like {{competitor}} and
-- {{review_count}} are filled in by hand from what the rep looked up. No em
-- dashes, no phone number (the demo is a browser experience). We never promise
-- a ranking, invent numbers, or claim we hide bad reviews.
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
  ),
  (
    'First touch: single batch (cool leads)', 'first_touch',
    'Hi {{first_name}}, {{sender}} with Ring Relay. We set up automatic Google review requests for HVAC and roofing shops so more happy customers actually leave the 5-star review instead of forgetting. If getting more reviews for {{business}} is ever on your list, reply here and I will send a 2 minute demo.'
  ),
  (
    'Follow-up 1: bump', 'follow_up_1',
    'Hi {{first_name}}, circling back on getting {{business}} more Google reviews on autopilot. No pressure. I can send a 2 minute demo of exactly how the request goes out after a job, if that is easier than reading about it. Want me to?'
  ),
  (
    'Follow-up 2: breakup', 'follow_up_2',
    '{{first_name}}, I will stop here so I am not cluttering your inbox. If more reviews and a higher spot on the map ever move up your list, we are one reply away and setup takes minutes. Either way, best of luck this season. {{sender}}, Ring Relay'
  ),
  (
    'Demo confirmation', 'demo_confirmation',
    'You are set, {{first_name}}. Call confirmed for {{demo_time}}. Want a preview first? You can watch how the review request and the ranking bump work right in your browser at {{demo_url}}. Talk soon. {{sender}}'
  )
) as v(name, category, body)
where not exists (
  select 1 from public.outreach_templates t where t.name = v.name
);
