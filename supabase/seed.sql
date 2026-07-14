-- ============================================================================
-- Ring Relay — seed data
-- ============================================================================
-- Seeds the default daily outreach playbook and outreach templates.
-- Safe to re-run: each row is inserted only if a matching one isn't present.

-- Daily playbook (day_of_week NULL = runs every day) -----------------------
insert into public.daily_tasks (title, target_count, day_of_week, sort_order, is_active)
select v.title, v.target_count, v.day_of_week, v.sort_order, true
from (values
  ('Add new leads',                         20, null::int, 1),
  ('Send first-touch messages',             15, null::int, 2),
  ('Follow up with non-responders',         10, null::int, 3),
  ('Confirm / book demos',                   3, null::int, 4),
  ('Log outcomes in the pipeline',           1, null::int, 5)
) as v(title, target_count, day_of_week, sort_order)
where not exists (
  select 1 from public.daily_tasks t where t.title = v.title
);

-- Outreach templates -------------------------------------------------------
insert into public.outreach_templates (name, category, body, is_active)
select v.name, v.category::template_category, v.body, true
from (values
  (
    'First-touch — missed calls angle', 'first_touch',
    'Hi {{first_name}}, this is {{sender}} with Ring Relay. Quick one — how many calls does {{business}} miss when the crew''s on a job? We build AI receptionists for HVAC/plumbing shops that answer 24/7 and book the appointment. Worth a 15-min look?'
  ),
  (
    'First-touch — after-hours angle', 'first_touch',
    'Hey {{first_name}} — saw {{business}} covers emergency work. Those after-hours calls that hit voicemail are usually the next company''s job. Ring Relay answers every one, filters spam, and texts you the booked details. Open to a quick demo this week?'
  ),
  (
    'Follow-up #1 — bump', 'follow_up_1',
    'Hi {{first_name}}, following up on my note about answering {{business}}''s missed calls. No pressure — happy to just call our AI live so you can hear it handle a real booking. Want me to send a couple times?'
  ),
  (
    'Follow-up #2 — breakup', 'follow_up_2',
    '{{first_name}}, I''ll stop here so I''m not cluttering your inbox. If missed calls ever start costing you jobs, we''re a text away and setup takes about 5 days. Either way, best of luck this season. — {{sender}}, Ring Relay'
  ),
  (
    'Demo confirmation + call-in number', 'demo_confirmation',
    'You''re set, {{first_name}} — demo confirmed for {{demo_time}}. Want a preview? Call our AI now at 1 (800) 333-3333 and throw your hardest customer scenario at it. Talk soon. — {{sender}}'
  )
) as v(name, category, body)
where not exists (
  select 1 from public.outreach_templates t where t.name = v.name
);
