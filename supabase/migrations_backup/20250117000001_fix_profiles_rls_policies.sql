-- Enable RLS on profiles table and create proper policies for user signup
-- This fixes the "Database error saving new user" issue

-- Enable Row Level Security on profiles table
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Allow users to view their own profile
CREATE POLICY "Users can view own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Policy: Allow users to update their own profile
CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Policy: Allow users to insert their own profile (for manual creation)
CREATE POLICY "Users can insert own profile"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Policy: Allow service role to insert profiles during signup (CRITICAL for auth)
-- This allows the automatic profile creation trigger to work
CREATE POLICY "Service role can insert profiles"
  ON profiles
  FOR INSERT
  TO service_role
  WITH CHECK (true);

-- Policy: Allow service role to update profiles (for auth metadata updates)
CREATE POLICY "Service role can update profiles"
  ON profiles
  FOR UPDATE
  TO service_role
  USING (true);
