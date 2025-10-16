-- Add full_name column to group_links
alter table public.group_links
  add column if not exists full_name text;

-- Update existing rows with data from profiles table
update public.group_links gl
set full_name = p.raw_user_meta_data->>'full_name'
from auth.users u
join public.profiles p on p.id = u.id
where gl.user_id = u.id;

-- Make the column not null after backfilling
alter table public.group_links
  alter column full_name set not null;
