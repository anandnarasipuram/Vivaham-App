-- Optional. Run only if a Helper (Events = Hidden) sees "Add an event first" on Requirements.
-- Requirements, Shopping, Food and To-do need the event list (id, name, date) to group and label rows,
-- even for people who may not open the Events module itself.
-- Check first how your existing helper is called, for example:
--   select proname, pg_get_function_arguments(oid) from pg_proc where proname = 'is_member';
-- and adjust the call below if its arguments differ.

create policy "members can read event names"
  on public.events
  for select
  using (public.is_member(wedding_id));
