-- Enable RLS and set up policies for study groups

-- Enable RLS on study_groups
ALTER TABLE public.study_groups ENABLE ROW LEVEL SECURITY;

-- Enable RLS on study_group_members
ALTER TABLE public.study_group_members ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their study groups" ON public.study_groups;
DROP POLICY IF EXISTS "Users can insert their study groups" ON public.study_groups;
DROP POLICY IF EXISTS "Users can update their study groups" ON public.study_groups;
DROP POLICY IF EXISTS "Users can delete their study groups" ON public.study_groups;

-- Create policies for study_groups
-- Users can view study groups they created or are members of
CREATE POLICY "Users can view their study groups" 
ON public.study_groups
FOR SELECT 
USING (
  auth.uid() = created_by OR 
  EXISTS (
    SELECT 1 FROM public.study_group_members 
    WHERE study_group_members.group_id = study_groups.id 
    AND study_group_members.user_id = auth.uid()
  )
);

-- Users can create study groups
CREATE POLICY "Users can insert their study groups"
ON public.study_groups
FOR INSERT 
WITH CHECK (auth.uid() = created_by);

-- Users can update study groups they created
CREATE POLICY "Users can update their study groups"
ON public.study_groups
FOR UPDATE 
USING (auth.uid() = created_by);

-- Users can delete study groups they created
CREATE POLICY "Users can delete their study groups"
ON public.study_groups
FOR DELETE 
USING (auth.uid() = created_by);

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their memberships" ON public.study_group_members;
DROP POLICY IF EXISTS "Users can insert memberships" ON public.study_group_members;
DROP POLICY IF EXISTS "Users can update their memberships" ON public.study_group_members;
DROP POLICY IF EXISTS "Users can delete their memberships" ON public.study_group_members;

-- Create policies for study_group_members
-- Users can view their own memberships and members of groups they created
CREATE POLICY "Users can view their memberships"
ON public.study_group_members
FOR SELECT 
USING (
  auth.uid() = user_id OR
  EXISTS (
    SELECT 1 FROM public.study_groups 
    WHERE study_groups.id = study_group_members.group_id 
    AND study_groups.created_by = auth.uid()
  )
);

-- Group creators can add members to their groups
CREATE POLICY "Users can insert memberships"
ON public.study_group_members
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.study_groups 
    WHERE study_groups.id = study_group_members.group_id 
    AND study_groups.created_by = auth.uid()
  )
);

-- Users can update their own memberships, group creators can update any membership in their groups
CREATE POLICY "Users can update their memberships"
ON public.study_group_members
FOR UPDATE
USING (
  auth.uid() = user_id OR
  EXISTS (
    SELECT 1 FROM public.study_groups 
    WHERE study_groups.id = study_group_members.group_id 
    AND study_groups.created_by = auth.uid()
  )
);

-- Users can leave groups, group creators can remove members from their groups
CREATE POLICY "Users can delete their memberships"
ON public.study_group_members
FOR DELETE
USING (
  auth.uid() = user_id OR
  EXISTS (
    SELECT 1 FROM public.study_groups 
    WHERE study_groups.id = study_group_members.group_id 
    AND study_groups.created_by = auth.uid()
  )
);
