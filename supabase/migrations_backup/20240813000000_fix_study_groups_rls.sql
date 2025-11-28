-- Fix RLS policies for study_groups and study_group_members to prevent infinite recursion

-- First, drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own group chats" ON public.study_groups;
DROP POLICY IF EXISTS "Users can insert their own group chats" ON public.study_groups;
DROP POLICY IF EXISTS "Users can update their own group chats" ON public.study_groups;
DROP POLICY IF EXISTS "Users can delete their own group chats" ON public.study_groups;

DROP POLICY IF EXISTS "Users can view their own group chat memberships" ON public.study_group_members;
DROP POLICY IF EXISTS "Users can insert their own group chat memberships" ON public.study_group_members;
DROP POLICY IF EXISTS "Users can update their own group chat memberships" ON public.study_group_members;
DROP POLICY IF EXISTS "Users can delete their own group chat memberships" ON public.study_group_members;

-- Group Chats RLS Policies
-- Users can view group chats they are a member of or groups they created
CREATE POLICY "Users can view their own group chats" 
ON public.study_groups
FOR SELECT USING (
  auth.uid() = created_by OR 
  EXISTS (
    SELECT 1 FROM public.study_group_members 
    WHERE study_group_members.group_id = study_groups.id 
    AND study_group_members.user_id = auth.uid()
  )
);

-- Only group creators can insert new group chats
CREATE POLICY "Users can insert their own group chats"
ON public.study_groups
FOR INSERT WITH CHECK (auth.uid() = created_by);

-- Only group creators can update group chats
CREATE POLICY "Users can update their own group chats"
ON public.study_groups
FOR UPDATE USING (auth.uid() = created_by);

-- Only group creators can delete group chats
CREATE POLICY "Users can delete their own group chats"
ON public.study_groups
FOR DELETE USING (auth.uid() = created_by);

-- Study Group Members RLS Policies
-- Users can view their own memberships and members of groups they created
CREATE POLICY "Users can view their own group chat memberships"
ON public.study_group_members
FOR SELECT USING (
  auth.uid() = user_id OR
  EXISTS (
    SELECT 1 FROM public.study_groups 
    WHERE study_groups.id = study_group_members.group_id 
    AND study_groups.created_by = auth.uid()
  )
);

-- Users can be added to groups by group creators
CREATE POLICY "Users can be added to groups by creators"
ON public.study_group_members
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.study_groups 
    WHERE study_groups.id = study_group_members.group_id 
    AND study_groups.created_by = auth.uid()
  )
);

-- Group creators can update member roles
CREATE POLICY "Users can update their own group chat memberships"
ON public.study_group_members
FOR UPDATE USING (
  auth.uid() = user_id OR
  EXISTS (
    SELECT 1 FROM public.study_groups 
    WHERE study_groups.id = study_group_members.group_id 
    AND study_groups.created_by = auth.uid()
  )
);

-- Users can leave groups, group creators can remove members
CREATE POLICY "Users can delete their own group chat memberships"
ON public.study_group_members
FOR DELETE USING (
  auth.uid() = user_id OR
  EXISTS (
    SELECT 1 FROM public.study_groups 
    WHERE study_groups.id = study_group_members.group_id 
    AND study_groups.created_by = auth.uid()
  )
);

-- Enable RLS on group_messages and group_links tables
ALTER TABLE public.group_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_links ENABLE ROW LEVEL SECURITY;

-- Group Messages RLS Policies
-- Users can view messages in groups they are members of
CREATE POLICY "Users can view group messages"
ON public.group_messages
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.study_group_members
    WHERE study_group_members.group_id = group_messages.group_id
    AND study_group_members.user_id = auth.uid()
  )
);

-- Users can insert messages in groups they are members of
CREATE POLICY "Users can insert group messages"
ON public.group_messages
FOR INSERT WITH CHECK (
  auth.uid() = user_id AND
  EXISTS (
    SELECT 1 FROM public.study_group_members
    WHERE study_group_members.group_id = group_messages.group_id
    AND study_group_members.user_id = auth.uid()
  )
);

-- Group Links RLS Policies
-- Users can view links in groups they are members of
CREATE POLICY "Users can view group links"
ON public.group_links
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.study_group_members
    WHERE study_group_members.group_id = group_links.group_id
    AND study_group_members.user_id = auth.uid()
  )
);

-- Users can insert links in groups they are members of
CREATE POLICY "Users can insert group links"
ON public.group_links
FOR INSERT WITH CHECK (
  auth.uid() = user_id AND
  EXISTS (
    SELECT 1 FROM public.study_group_members
    WHERE study_group_members.group_id = group_links.group_id
    AND study_group_members.user_id = auth.uid()
  )
);
