create table if not exists public.ai_usage_daily (
  user_id uuid not null references auth.users(id) on delete cascade,
  usage_date date not null default current_date,
  combined_actions integer not null default 0 check (combined_actions >= 0),
  action_counts jsonb not null default '{}'::jsonb,
  provider_requests integer not null default 0 check (provider_requests >= 0),
  prompt_tokens bigint not null default 0 check (prompt_tokens >= 0),
  completion_tokens bigint not null default 0 check (completion_tokens >= 0),
  model_counts jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, usage_date)
);

alter table public.ai_usage_daily enable row level security;

drop policy if exists "Users can view their own AI usage" on public.ai_usage_daily;
create policy "Users can view their own AI usage"
  on public.ai_usage_daily
  for select
  using (auth.uid() = user_id);

revoke all on public.ai_usage_daily from anon;
revoke insert, update, delete on public.ai_usage_daily from authenticated;
grant select on public.ai_usage_daily to authenticated;

create table if not exists public.ai_request_windows (
  user_id uuid not null references auth.users(id) on delete cascade,
  window_start timestamptz not null,
  request_count integer not null default 0 check (request_count >= 0),
  primary key (user_id, window_start)
);

alter table public.ai_request_windows enable row level security;
revoke all on public.ai_request_windows from anon, authenticated;

create or replace function public.reserve_ai_burst()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_window timestamptz := date_trunc('minute', now());
  v_count integer;
begin
  if v_user_id is null then
    raise exception 'Authentication required';
  end if;

  insert into public.ai_request_windows as current_window
    (user_id, window_start, request_count)
  values (v_user_id, v_window, 1)
  on conflict (user_id, window_start)
  do update
    set request_count = current_window.request_count + 1
    where current_window.request_count < 4
  returning request_count into v_count;

  if v_count is null then
    return jsonb_build_object(
      'allowed', false,
      'remaining', 0,
      'reason', 'Four AI requests per minute are allowed. Try again shortly.'
    );
  end if;

  delete from public.ai_request_windows
  where user_id = v_user_id
    and window_start < now() - interval '2 days';

  return jsonb_build_object(
    'allowed', true,
    'remaining', 4 - v_count
  );
end;
$$;

revoke all on function public.reserve_ai_burst() from public;
grant execute on function public.reserve_ai_burst() to authenticated;

create or replace function public.reserve_ai_quota(
  p_action text,
  p_action_limit integer,
  p_combined_limit integer
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_row public.ai_usage_daily%rowtype;
  v_action_count integer;
begin
  if v_user_id is null then
    raise exception 'Authentication required';
  end if;

  if p_action not in (
    'quick',
    'tutor',
    'bulk_generation',
    'guardian',
    'translation',
    'grader',
    'copilot'
  ) then
    raise exception 'Unsupported AI action';
  end if;

  if p_action_limit < 0 or p_combined_limit < 1 then
    raise exception 'Invalid quota';
  end if;

  insert into public.ai_usage_daily (user_id, usage_date)
  values (v_user_id, current_date)
  on conflict (user_id, usage_date) do nothing;

  select *
  into v_row
  from public.ai_usage_daily
  where user_id = v_user_id and usage_date = current_date
  for update;

  v_action_count := coalesce((v_row.action_counts ->> p_action)::integer, 0);

  if v_action_count >= p_action_limit then
    return jsonb_build_object(
      'allowed', false,
      'remaining', 0,
      'reason', 'The daily limit for this AI feature has been reached.'
    );
  end if;

  if v_row.combined_actions >= p_combined_limit then
    return jsonb_build_object(
      'allowed', false,
      'remaining', 0,
      'reason', 'The combined daily AI limit has been reached.'
    );
  end if;

  update public.ai_usage_daily
  set
    combined_actions = combined_actions + 1,
    action_counts = jsonb_set(
      action_counts,
      array[p_action],
      to_jsonb(v_action_count + 1),
      true
    ),
    updated_at = now()
  where user_id = v_user_id and usage_date = current_date;

  return jsonb_build_object(
    'allowed', true,
    'remaining', least(
      p_action_limit - v_action_count - 1,
      p_combined_limit - v_row.combined_actions - 1
    )
  );
end;
$$;

create or replace function public.record_ai_usage(
  p_action text,
  p_model text,
  p_prompt_tokens integer,
  p_completion_tokens integer
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_model_count integer;
begin
  if v_user_id is null then
    raise exception 'Authentication required';
  end if;

  insert into public.ai_usage_daily (user_id, usage_date)
  values (v_user_id, current_date)
  on conflict (user_id, usage_date) do nothing;

  select coalesce((model_counts ->> p_model)::integer, 0)
  into v_model_count
  from public.ai_usage_daily
  where user_id = v_user_id and usage_date = current_date;

  update public.ai_usage_daily
  set
    provider_requests = provider_requests + 1,
    prompt_tokens = prompt_tokens + greatest(p_prompt_tokens, 0),
    completion_tokens = completion_tokens + greatest(p_completion_tokens, 0),
    model_counts = jsonb_set(
      model_counts,
      array[p_model],
      to_jsonb(v_model_count + 1),
      true
    ),
    updated_at = now()
  where user_id = v_user_id and usage_date = current_date;
end;
$$;

revoke all on function public.reserve_ai_quota(text, integer, integer) from public;
revoke all on function public.record_ai_usage(text, text, integer, integer) from public;
grant execute on function public.reserve_ai_quota(text, integer, integer) to authenticated;
grant execute on function public.record_ai_usage(text, text, integer, integer) to authenticated;

-- Aurora is a material change to the consent presented on 2026-07-27.
-- Require renewed approval only when there is no durable approval record for
-- the current AI consent version. This keeps the migration safe to rerun after
-- a guardian has already approved the updated terms.
update public.profiles as profile
set parental_consent_status = 'pending'
where profile.age_group = 'minor'
  and profile.parental_consent_status = 'approved'
  and not exists (
    select 1
    from public.parental_consent_requests as consent
    where consent.student_id = profile.id
      and consent.consent_version = '2026-07-28-ai'
      and consent.approved_at is not null
      and consent.revoked_at is null
  );
