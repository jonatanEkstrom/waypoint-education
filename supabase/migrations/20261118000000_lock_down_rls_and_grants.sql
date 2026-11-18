-- Applied to production (waypoint-education) on 2026-11-18 via Supabase MCP.
-- Kept here as the record of the change.
revoke all on all tables in schema public from anon, authenticated;

grant select on public.age_groups, public.subjects, public.curriculum_concepts to authenticated;
grant select, insert, update, delete on public.children to authenticated;
grant select, insert, update on public.child_progress to authenticated;
grant select, insert, update, delete on public.journal_entries to authenticated;
grant select, insert, update, delete on public.little_readers_progress to authenticated;
grant select, insert, update, delete on public.public_profiles to authenticated;
grant select on public.profiles to authenticated;

drop policy if exists "Users can manage their own entries" on public.journal_entries;
create policy journal_entries_own on public.journal_entries
  for all to authenticated
  using (user_id = auth.uid()::text)
  with check (user_id = auth.uid()::text);

drop policy if exists "Users can insert own profile" on public.profiles;
drop policy if exists "Users can manage own profile" on public.profiles;
drop policy if exists "Users can read own profile" on public.profiles;
create policy profiles_select_own on public.profiles
  for select to authenticated using (id = auth.uid());

drop policy if exists "Service can manage subscriptions" on public.subscriptions;
drop policy if exists "Users can read own subscription" on public.subscriptions;

drop policy if exists child_progress_insert on public.child_progress;
drop policy if exists child_progress_select on public.child_progress;
drop policy if exists child_progress_update on public.child_progress;
create policy child_progress_select on public.child_progress for select to authenticated
  using (child_id in (select id from public.children where user_id = auth.uid()));
create policy child_progress_insert on public.child_progress for insert to authenticated
  with check (child_id in (select id from public.children where user_id = auth.uid()));
create policy child_progress_update on public.child_progress for update to authenticated
  using (child_id in (select id from public.children where user_id = auth.uid()))
  with check (child_id in (select id from public.children where user_id = auth.uid()));

drop policy if exists age_groups_read on public.age_groups;
drop policy if exists subjects_read on public.subjects;
drop policy if exists curriculum_concepts_read on public.curriculum_concepts;
create policy age_groups_read on public.age_groups for select to authenticated using (true);
create policy subjects_read on public.subjects for select to authenticated using (true);
create policy curriculum_concepts_read on public.curriculum_concepts for select to authenticated using (true);
