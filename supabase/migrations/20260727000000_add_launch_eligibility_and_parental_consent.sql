alter table public.profiles
  add column if not exists date_of_birth date,
  add column if not exists country_code text,
  add column if not exists age_group text,
  add column if not exists parental_consent_status text not null default 'not_required',
  add column if not exists guardian_email text;

alter table public.profiles
  drop constraint if exists profiles_country_code_check,
  add constraint profiles_country_code_check
    check (country_code is null or country_code = 'US'),
  drop constraint if exists profiles_age_group_check,
  add constraint profiles_age_group_check
    check (age_group is null or age_group in ('under_13', 'minor', 'adult')),
  drop constraint if exists profiles_parental_consent_status_check,
  add constraint profiles_parental_consent_status_check
    check (parental_consent_status in ('not_required', 'pending', 'approved', 'revoked'));

create table if not exists public.parental_consent_requests (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references auth.users(id) on delete cascade,
  student_email text not null,
  guardian_email text not null,
  token_hash text not null unique,
  consent_version text not null,
  expires_at timestamptz not null,
  approved_at timestamptz,
  revoked_at timestamptz,
  guardian_name text,
  approval_ip text,
  approval_user_agent text,
  created_at timestamptz not null default now()
);

create index if not exists parental_consent_requests_student_id_idx
  on public.parental_consent_requests(student_id);

alter table public.parental_consent_requests enable row level security;

-- Consent records are server-only. The service role bypasses RLS.
revoke all on public.parental_consent_requests from anon, authenticated;

