-- Applied to production on 2026-11-18. Trial/status must only be set explicitly
-- by the server (ensureTrial, Stripe webhook), never by column defaults.
alter table public.profiles
  alter column subscription_status drop default,
  alter column trial_end_date drop default,
  alter column trial_started_at drop default,
  alter column trial_ends_at drop default,
  alter column plan drop default;
