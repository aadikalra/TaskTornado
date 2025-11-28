-- Add full_name column to group_messages
alter table public.group_messages
  add column if not exists full_name text;

-- Update existing rows with data from profiles table
update public.group_messages gm
set full_name = p.raw_user_meta_data->>'full_name'
from auth.users u
join public.profiles p on p.id = u.id
where gm.user_id = u.id;

-- Make the column not null after backfilling
alter table public.group_messages
  alter column full_name set not null;
