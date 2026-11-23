alter table public.language_plans drop constraint if exists language_plans_user_id_child_name_language_calendar_week_key;
drop index if exists public.language_plans_user_id_child_name_language_calendar_week_key;

create policy journal_child_insert on public.journal_entries as restrictive for insert to authenticated
  with check (child_id in (select id from public.children where user_id = auth.uid()));
create policy journal_child_update on public.journal_entries as restrictive for update to authenticated
  with check (child_id in (select id from public.children where user_id = auth.uid()));
create policy language_child_insert on public.language_plans as restrictive for insert to authenticated
  with check (child_id in (select id from public.children where user_id = auth.uid()));
create policy language_child_update on public.language_plans as restrictive for update to authenticated
  with check (child_id in (select id from public.children where user_id = auth.uid()));

-- Reads and family-data deletion remain available under the existing ownership policies.
do $policies$
declare target text;
begin
  foreach target in array array['children','child_progress','journal_entries','language_plans','practice_sessions','little_readers_progress']
  loop
    execute format('create policy learning_access_insert on public.%I as restrictive for insert to authenticated with check ((select public.waypoint_has_learning_access()))', target);
    execute format('create policy learning_access_update on public.%I as restrictive for update to authenticated using ((select public.waypoint_has_learning_access())) with check ((select public.waypoint_has_learning_access()))', target);
  end loop;
end
$policies$;
