-- Add completed column to homework table
ALTER TABLE public.homework
ADD COLUMN completed BOOLEAN NOT NULL DEFAULT FALSE;

-- Update the RLS policy to include the new column
ALTER POLICY "Enable update for users based on user_id"
ON public.homework
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Update the type for the row level security
DROP POLICY IF EXISTS "Enable read access for all users" ON public.homework;
CREATE POLICY "Enable read access for all users"
ON public.homework
FOR SELECT
USING (true);

-- Update the insert policy to include the new column
ALTER POLICY "Enable insert for authenticated users only"
ON public.homework
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Update the delete policy to include the new column
ALTER POLICY "Enable delete for users based on user_id"
ON public.homework
FOR DELETE
USING (auth.uid() = user_id);
