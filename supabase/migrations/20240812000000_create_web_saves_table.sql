-- Create web_saves table
CREATE TABLE IF NOT EXISTS public.web_saves (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  title TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Ensure URLs are valid
  CONSTRAINT valid_url CHECK (url ~* '^https?://[^\s/$.?#].[^\s]*$')
);

-- Add row level security
ALTER TABLE public.web_saves ENABLE ROW LEVEL SECURITY;

-- Create policies for RLS
CREATE POLICY "Users can view their own web saves" 
  ON public.web_saves 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own web saves" 
  ON public.web_saves 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own web saves" 
  ON public.web_saves 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own web saves" 
  ON public.web_saves 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Create an index for faster lookups by user_id
CREATE INDEX IF NOT EXISTS idx_web_saves_user_id ON public.web_saves(user_id);

-- Create a trigger to update the updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_web_saves_updated_at
BEFORE UPDATE ON public.web_saves
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Add a comment to the table
COMMENT ON TABLE public.web_saves IS 'Stores web links saved by users with their favicons';

-- Add comments to columns
COMMENT ON COLUMN public.web_saves.id IS 'Primary key';
COMMENT ON COLUMN public.web_saves.user_id IS 'Reference to the user who saved this link';
COMMENT ON COLUMN public.web_saves.url IS 'The URL that was saved';
COMMENT ON COLUMN public.web_saves.title IS 'Optional title for the saved link';
COMMENT ON COLUMN public.web_saves.created_at IS 'When the link was saved';
COMMENT ON COLUMN public.web_saves.updated_at IS 'When the link was last updated';
