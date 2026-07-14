-- ============================================================================
-- Promote a user to `owner`
-- ============================================================================
-- After you create your first account (via /admin/login → but signup is
-- disabled, so create it in the Supabase dashboard: Authentication → Users →
-- "Add user" → set email + password), run this to make yourself the owner.
-- Replace the email below.

update public.profiles
set role = 'owner'
where email = 'you@example.com';

-- Verify:
-- select id, email, role from public.profiles order by created_at;
