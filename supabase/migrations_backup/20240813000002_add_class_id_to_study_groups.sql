-- Add class_id column to study_groups table
ALTER TABLE public.study_groups 
ADD COLUMN IF NOT EXISTS class_id UUID REFERENCES public.classes(id) ON DELETE SET NULL;
