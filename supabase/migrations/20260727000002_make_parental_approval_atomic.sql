create or replace function public.approve_parental_consent(
  p_token_hash text,
  p_guardian_name text,
  p_approval_ip text,
  p_approval_user_agent text
)
returns table(student_id uuid, consent_version text)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  request_row public.parental_consent_requests%rowtype;
begin
  select *
    into request_row
    from public.parental_consent_requests
   where token_hash = p_token_hash
     and approved_at is null
     and revoked_at is null
   for update;

  if not found or request_row.expires_at <= now() then
    raise exception 'invalid_or_expired_consent_token';
  end if;

  update public.profiles
     set parental_consent_status = 'approved'
   where id = request_row.student_id;

  if not found then
    raise exception 'student_profile_not_found';
  end if;

  update public.parental_consent_requests
     set approved_at = now(),
         guardian_name = p_guardian_name,
         approval_ip = p_approval_ip,
         approval_user_agent = p_approval_user_agent
   where id = request_row.id;

  return query
  select request_row.student_id, request_row.consent_version;
end;
$$;

revoke all on function public.approve_parental_consent(text, text, text, text)
  from public, anon, authenticated;
grant execute on function public.approve_parental_consent(text, text, text, text)
  to service_role;

