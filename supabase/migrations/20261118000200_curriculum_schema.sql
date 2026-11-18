-- Curriculum v2: age bands that match the child form, four subjects, three
-- lessons per concept, lesson history for LA reports, and the tables the app
-- already used but that did not exist (language_plans, practice_sessions).

-- ── Age bands ────────────────────────────────────────────────────────────────
alter table public.age_groups
  add column if not exists sort int,
  add column if not exists nc_stage text;

-- Old bands (5-6, 7-8, 9-10, 11-12) carried a 22-concept maths-only pilot.
-- Removing them cascades to those concepts and their progress rows.
delete from public.age_groups where label not in ('3-4', '5-6', '7-9', '10-12', '13+');

insert into public.age_groups (label, min_age, max_age, sort, nc_stage)
select v.label, v.min_age, v.max_age, v.sort, v.nc_stage
from (values
  ('3-4',   3,  4, 1, 'EYFS (Nursery–Reception)'),
  ('5-6',   5,  6, 2, 'Reception–Year 1 (KS1)'),
  ('7-9',   7,  9, 3, 'Years 2–4 (KS1–Lower KS2)'),
  ('10-12', 10, 12, 4, 'Years 5–7 (Upper KS2–KS3)'),
  ('13+',   13, 16, 5, 'Years 8–9 (KS3)')
) as v(label, min_age, max_age, sort, nc_stage)
where not exists (select 1 from public.age_groups a where a.label = v.label);

update public.age_groups a set
  min_age = v.min_age, max_age = v.max_age, sort = v.sort, nc_stage = v.nc_stage
from (values
  ('3-4',   3,  4, 1, 'EYFS (Nursery–Reception)'),
  ('5-6',   5,  6, 2, 'Reception–Year 1 (KS1)'),
  ('7-9',   7,  9, 3, 'Years 2–4 (KS1–Lower KS2)'),
  ('10-12', 10, 12, 4, 'Years 5–7 (Upper KS2–KS3)'),
  ('13+',   13, 16, 5, 'Years 8–9 (KS3)')
) as v(label, min_age, max_age, sort, nc_stage)
where a.label = v.label;

create unique index if not exists age_groups_label_key on public.age_groups (label);

-- ── Subjects ─────────────────────────────────────────────────────────────────
alter table public.subjects add column if not exists sort int;

-- ── Concepts ─────────────────────────────────────────────────────────────────
alter table public.curriculum_concepts
  add column if not exists nc_reference text,
  add column if not exists strand text;

-- ── Progress: three lessons per concept ─────────────────────────────────────
alter table public.child_progress
  add column if not exists lessons_completed int not null default 0,
  add column if not exists updated_at timestamptz not null default now();

update public.child_progress set lessons_completed = 3 where status = 'completed' and lessons_completed = 0;

delete from public.child_progress a using public.child_progress b
where a.child_id = b.child_id and a.concept_id = b.concept_id and a.ctid < b.ctid;

create unique index if not exists child_progress_child_concept_key
  on public.child_progress (child_id, concept_id);

-- ── Lesson history (feeds the LA report and portfolio) ──────────────────────
alter table public.lesson_history
  add column if not exists child_id uuid references public.children(id) on delete cascade,
  add column if not exists concept_id uuid references public.curriculum_concepts(id) on delete set null,
  add column if not exists stage int,
  add column if not exists nc_reference text,
  add column if not exists city text,
  add column if not exists country text;

create index if not exists lesson_history_child_idx on public.lesson_history (child_id, created_at);

drop policy if exists lesson_history_select_own on public.lesson_history;
create policy lesson_history_select_own on public.lesson_history
  for select to authenticated using (user_id = auth.uid());
grant select on public.lesson_history to authenticated;

-- ── Language plans (used by the language tab) ───────────────────────────────
create table if not exists public.language_plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  child_name text not null,
  language text not null,
  calendar_week int not null,
  language_week int not null,
  plan jsonb not null,
  created_at timestamptz not null default now(),
  unique (user_id, child_name, language, calendar_week)
);
alter table public.language_plans enable row level security;
drop policy if exists language_plans_own on public.language_plans;
create policy language_plans_own on public.language_plans
  for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
grant select, insert, update, delete on public.language_plans to authenticated;

-- ── Practice sessions (used by the practice page) ───────────────────────────
create table if not exists public.practice_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  child_id uuid not null references public.children(id) on delete cascade,
  subject text,
  track text,
  exercise jsonb,
  answer text,
  feedback jsonb,
  score numeric,
  created_at timestamptz not null default now()
);
create index if not exists practice_sessions_child_idx on public.practice_sessions (child_id, created_at);
alter table public.practice_sessions enable row level security;
drop policy if exists practice_sessions_own on public.practice_sessions;
create policy practice_sessions_own on public.practice_sessions
  for all to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid() and child_id in (select id from public.children where user_id = auth.uid()));
grant select, insert on public.practice_sessions to authenticated;
