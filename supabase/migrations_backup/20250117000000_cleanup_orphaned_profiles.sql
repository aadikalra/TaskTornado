-- Clean up orphaned profile records that don't have corresponding auth users
-- This fixes the "Database error saving new user" issue during signup

-- Delete profile records where the corresponding auth user doesn't exist
DELETE FROM profiles
WHERE id NOT IN (
    SELECT id FROM auth.users WHERE id = profiles.id
);

-- Add a comment explaining the cleanup
COMMENT ON TABLE profiles IS 'User profiles table - automatically cleaned orphaned records';
