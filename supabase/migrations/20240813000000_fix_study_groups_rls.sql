-- Fix RLS policies for study_groups and study_group_members to prevent infinite recursion

-- First, drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own study groups" ON public.study_groups;
DROP POLICY IF EXISTS "Users can insert their own study groups" ON public.study_groups;
DROP POLICY IF EXISTS "Users can update their own study groups" ON public.study_groups;
DROP POLICY IF EXISTS "Users can delete their own study groups" ON public.study_groups;

DROP POLICY IF EXISTS "Users can view their own study group memberships" ON public.study_group_members;
DROP POLICY IF EXISTS "Users can insert their own study group memberships" ON public.study_group_members;
DROP POLICY IF EXISTS "Users can update their own study group memberships" ON public.study_group_members;
DROP POLICY IF EXISTS "Users can delete their own study group memberships" ON public.study_group_members;

-- Study Groups RLS Policies
-- Users can view study groups they are a member of or groups they created
CREATE POLICY "Users can view their own study groups" 
ON public.study_groups
FOR SELECT USING (
  auth.uid() = created_by OR 
  EXISTS (
    SELECT 1 FROM public.study_group_members 
    WHERE study_group_members.group_id = study_groups.id 
    AND study_group_members.user_id = auth.uid()
  )
);

-- Only group creators can insert new study groups
CREATE POLICY "Users can insert their own study groups"
ON public.study_groups
FOR INSERT WITH CHECK (auth.uid() = created_by);

-- Only group creators can update study groups
CREATE POLICY "Users can update their own study groups"
ON public.study_groups
FOR UPDATE USING (auth.uid() = created_by);

-- Only group creators can delete study groups
CREATE POLICY "Users can delete their own study groups"
ON public.study_groups
FOR DELETE USING (auth.uid() = created_by);

-- Study Group Members RLS Policies
-- Users can view their own memberships and members of groups they created
CREATE POLICY "Users can view their own study group memberships"
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
CREATE POLICY "Users can update their own study group memberships"
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
CREATE POLICY "Users can delete their own study group memberships"
ON public.study_group_members
FOR DELETE USING (
  auth.uid() = user_id OR
  EXISTS (
    SELECT 1 FROM public.study_groups 
    WHERE study_groups.id = study_group_members.group_id 
    AND study_groups.created_by = auth.uid()
  )
);

-- Enable RLS on both tables
ALTER TABLE public.study_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_group_members ENABLE ROW LEVEL SECURITY;
