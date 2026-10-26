-- Keys are encrypted by the application; only server-side service_role access is allowed.
create table if not exists public.ai_provider_settings (
  user_id uuid primary key references auth.users(id) on delete cascade,
  provider text not null check (provider in ('openrouter', 'together', 'fireworks', 'groq')),
  model text not null check (char_length(model) between 1 and 200),
  encrypted_key text not null,
  key_hint text not null,
  enabled boolean not null default false,
  updated_at timestamptz not null default now()
);
alter table public.ai_provider_settings enable row level security;
revoke all on public.ai_provider_settings from anon, authenticated;
grant select, insert, update, delete on public.ai_provider_settings to service_role;
