alter table public.profiles add column if not exists billing_access_until timestamptz;

alter table public.journal_entries add column if not exists child_id uuid references public.children(id) on delete set null;
alter table public.language_plans add column if not exists child_id uuid references public.children(id) on delete set null;

-- Attach existing language plans only when there is a single possible profile.
update public.language_plans as plan
set child_id = child.id
from public.children as child
where plan.child_id is null and child.user_id = plan.user_id and child.name = plan.child_name
  and not exists (select 1 from public.children as sibling
    where sibling.user_id = child.user_id and sibling.name = child.name and sibling.id <> child.id);

create index if not exists journal_entries_child_idx on public.journal_entries (child_id);
create unique index if not exists language_plans_child_week_key on public.language_plans (child_id, language, calendar_week);
create table if not exists public.saved_lessons (
  child_id uuid not null references public.children(id) on delete cascade,
  concept_id uuid not null references public.curriculum_concepts(id) on delete cascade,
  variant text not null check (variant in ('lesson', 'review')),
  content jsonb not null,
  primary key (child_id, concept_id, variant)
);
alter table public.saved_lessons enable row level security;
revoke all on public.saved_lessons from anon, authenticated;
grant select, insert on public.saved_lessons to service_role;

create or replace function public.waypoint_has_learning_access()
returns boolean
language sql stable security invoker set search_path = ''
as $$
  select exists (select 1 from public.profiles
    where id = auth.uid()
      and ((subscription_status = 'active' and (billing_access_until is null or billing_access_until > now()))
        or (subscription_status = 'trial' and trial_end_date > now())))
$$;
revoke all on function public.waypoint_has_learning_access() from public;
grant execute on function public.waypoint_has_learning_access() to authenticated;

