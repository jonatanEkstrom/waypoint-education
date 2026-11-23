alter table public.language_plans
  add column if not exists quiz_answers jsonb;
