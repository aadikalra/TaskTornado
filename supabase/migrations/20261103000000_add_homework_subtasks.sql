begin;

-- Kept on the homework row so creation, edits and deletion stay atomic and use
-- the existing owner and launch-eligibility RLS policies unchanged.
create or replace function public.valid_homework_subtasks(items jsonb)
returns boolean language plpgsql immutable
set search_path = pg_catalog
as $$
declare
  item jsonb;
  seen_ids text[] := array[]::text[];
begin
  if items is null or jsonb_typeof(items) <> 'array' then return false; end if;
  if jsonb_array_length(items) > 100 then return false; end if;
  for item in select value from jsonb_array_elements(items) loop
    if jsonb_typeof(item) <> 'object'
       or jsonb_typeof(item->'id') is distinct from 'string'
       or length(item->>'id') not between 1 and 64
       or jsonb_typeof(item->'title') is distinct from 'string'
       or length(btrim(item->>'title')) not between 1 and 200
       or jsonb_typeof(item->'completed') is distinct from 'boolean'
       or (item->>'id') = any(seen_ids) then return false;
    end if;
    seen_ids := array_append(seen_ids, item->>'id');
  end loop;
  return true;
end;
$$;

alter table public.homework
  add column if not exists subtasks jsonb not null default '[]'::jsonb;

do $$
begin
  if not exists (
    select 1 from pg_catalog.pg_constraint
    where conname = 'homework_subtasks_valid' and conrelid = 'public.homework'::regclass
  ) then
    alter table public.homework
      add constraint homework_subtasks_valid check (public.valid_homework_subtasks(subtasks));
  end if;
end;
$$;

comment on column public.homework.subtasks is
  'Ordered task checklist. Parent completion is independent. Existing tasks default to an empty checklist.';

notify pgrst, 'reload schema';
commit;
