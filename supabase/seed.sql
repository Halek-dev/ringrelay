-- ============================================================================
-- Ring Relay — seed data
-- ============================================================================
-- Seeds the outreach templates. The daily plan is derived from real activity,
-- so there is no playbook to seed.
-- Safe to re-run: each row is inserted only if a matching one isn't present.

-- Outreach templates -------------------------------------------------------
-- Names carry a tier hint in parentheses (hot/warm/cool). The qualification
-- funnel reads that hint to recommend the matching first touch. No em dashes,
-- no phone number (the demo is a browser experience).
insert into public.outreach_templates (name, category, body, is_active)
select v.name, v.category::template_category, v.body, true
from (values
  (
    'First touch: Loom-led (hot leads)', 'first_touch',
    'Hi {{first_name}}, {{sender}} here with Ring Relay. I recorded you a 60 second Loom showing how {{business}} could stop losing after-hours calls. You called your own line? It went to voicemail. Here is the video: {{loom_url}}. Worth a quick reply if it lands.'
  ),
  (
    'First touch: proof-led (warm leads)', 'first_touch',
    'Hey {{first_name}}, quick one for {{business}}. Shops your size usually miss a handful of calls a week when the crew is out, and each one is the next company''s job. Ring Relay answers every call 24/7, filters spam, and texts you the booked details. Open to a 15 minute look this week?'
  ),
  (
    'First touch: single batch (cool leads)', 'first_touch',
    'Hi {{first_name}}, {{sender}} with Ring Relay. We set up AI receptionists for HVAC, plumbing, and restoration shops so missed calls turn into booked jobs. If that is ever a headache for {{business}}, reply here and I will send a short demo.'
  ),
  (
    'Follow-up 1: bump', 'follow_up_1',
    'Hi {{first_name}}, circling back on my note about answering {{business}}''s missed calls. No pressure. I can send a short recording of our AI handling a real booking so you can hear it. Want me to?'
  ),
  (
    'Follow-up 2: breakup', 'follow_up_2',
    '{{first_name}}, I will stop here so I am not cluttering your inbox. If missed calls ever start costing you jobs, we are a reply away and setup takes about 5 days. Either way, best of luck this season. {{sender}}, Ring Relay'
  ),
  (
    'Demo confirmation', 'demo_confirmation',
    'You are set, {{first_name}}. Demo confirmed for {{demo_time}}. Want a preview first? Try our AI receptionist right in your browser at {{demo_url}} and throw your hardest customer scenario at it. Talk soon. {{sender}}'
  )
) as v(name, category, body)
where not exists (
  select 1 from public.outreach_templates t where t.name = v.name
);
