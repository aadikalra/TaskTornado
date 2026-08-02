create or replace function public.is_launch_eligible(
  requested_user_id uuid default auth.uid()
)
returns boolean
language sql
stable
security definer
set search_path = pg_catalog, public
as $$
  select exists (
    select 1
    from public.profiles
    where id = requested_user_id
      and country_code = 'US'
      and date_of_birth is not null
      and date_of_birth <= current_date - interval '13 years'
      and (
        date_of_birth <= current_date - interval '18 years'
        or parental_consent_status = 'approved'
      )
  );
$$;

revoke all on function public.is_launch_eligible(uuid) from public;
grant execute on function public.is_launch_eligible(uuid) to authenticated;

do $$
declare
  table_record record;
begin
  for table_record in
    select schemaname, tablename
    from pg_catalog.pg_tables
    where schemaname = 'public'
  loop
    execute format(
      'alter table %I.%I enable row level security',
      table_record.schemaname,
      table_record.tablename
    );
    execute format(
      'drop policy if exists launch_eligibility_required on %I.%I',
      table_record.schemaname,
      table_record.tablename
    );
    execute format(
      'create policy launch_eligibility_required on %I.%I as restrictive for all to authenticated using (public.is_launch_eligible(auth.uid())) with check (public.is_launch_eligible(auth.uid()))',
      table_record.schemaname,
      table_record.tablename
    );
  end loop;
end
$$;

comment on function public.is_launch_eligible(uuid) is
  'Fail-closed launch eligibility check used by restrictive RLS policies.';
