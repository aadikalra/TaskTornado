create table if not exists public.google_oauth_connections (
  user_id uuid not null references auth.users(id) on delete cascade,
  service text not null,
  encrypted_tokens text not null,
  google_account_id text,
  google_email text,
  google_name text,
  google_picture text,
  scopes text[],
  token_expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, service),
  constraint google_oauth_connections_service_check
    check (service in ('gmail', 'classroom'))
);

alter table public.google_oauth_connections enable row level security;

-- OAuth credentials are available only to trusted server code through the
-- service role. Browser clients cannot read or write this table.
revoke all on public.google_oauth_connections from anon, authenticated;

