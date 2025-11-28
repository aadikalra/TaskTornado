-- Add fromGoogle column to profiles table
ALTER TABLE profiles ADD COLUMN from_google BOOLEAN DEFAULT FALSE;

-- Update existing profiles to set fromGoogle to false by default
-- (This ensures backward compatibility)
UPDATE profiles SET from_google = FALSE WHERE from_google IS NULL;
