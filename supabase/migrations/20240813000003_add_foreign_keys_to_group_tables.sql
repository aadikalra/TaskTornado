-- Add foreign key from group_messages to profiles
ALTER TABLE public.group_messages
ADD CONSTRAINT fk_group_messages_user_id
FOREIGN KEY (user_id) REFERENCES public.profiles(id)
ON DELETE CASCADE;

-- Add foreign key from group_links to profiles
ALTER TABLE public.group_links
ADD CONSTRAINT fk_group_links_added_by
FOREIGN KEY (added_by) REFERENCES public.profiles(id)
ON DELETE SET NULL;

-- Add foreign key from group_links to study_groups
ALTER TABLE public.group_links
ADD CONSTRAINT fk_group_links_group_id
FOREIGN KEY (group_id) REFERENCES public.study_groups(id)
ON DELETE CASCADE;

-- Add foreign key from group_messages to study_groups
ALTER TABLE public.group_messages
ADD CONSTRAINT fk_group_messages_group_id
FOREIGN KEY (group_id) REFERENCES public.study_groups(id)
ON DELETE CASCADE;
