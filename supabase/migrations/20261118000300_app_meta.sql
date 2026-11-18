-- Applied 2026-11-18. Server-only key/value store; holds the curriculum
-- version so the app can sync supabase/curriculum/*.json into the database.
create table if not exists public.app_meta (
  key text primary key,
  value text not null,
  updated_at timestamptz not null default now()
);
alter table public.app_meta enable row level security;
revoke all on public.app_meta from anon, authenticated;
insert into public.subjects (slug, name, sort) values
  ('mathematics','Maths',1),('english','English',2),('science','Science',3),('geography','Geography & Culture',4)
on conflict (slug) do update set name = excluded.name, sort = excluded.sort;
