alter table public.google_oauth_connections
  drop constraint if exists google_oauth_connections_service_check;

alter table public.google_oauth_connections
  add constraint google_oauth_connections_service_check
  check (service in ('gmail', 'classroom', 'calendar'));
