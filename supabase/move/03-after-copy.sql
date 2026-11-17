-- =============================================================================
-- MOVE, STEP 3 of 3: run in the NEW project's SQL editor after
-- scripts/move-database.mts has copied the rows (and again after its final
-- re-run). Safe to run any number of times.
--
-- The copy keeps every car's id, so the id counter has to be moved past them,
-- or the next car added in the admin would collide with a copied one.
-- =============================================================================
select setval(
  'public.used_cars_id_seq',
  greatest(100000, (select coalesce(max(id), 0) from public.used_cars)),
  true
);

-- Checks. Expect: the same counts the script printed, and 0 orphans.
select 'used_cars' as t, count(*) from public.used_cars
union all select 'leads', count(*) from public.leads
union all select 'lead_activities', count(*) from public.lead_activities
union all select 'orphan activities', count(*) from public.lead_activities a
  where not exists (select 1 from public.leads l where l.id = a.lead_id);
