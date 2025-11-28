-- Add email column to profiles table
ALTER TABLE profiles ADD COLUMN email TEXT;

-- Update existing profiles with email from auth.users table
UPDATE profiles
SET email = auth.users.email
FROM auth.users
WHERE profiles.id = auth.users.id;

-- Make email column NOT NULL after populating existing data
ALTER TABLE profiles ALTER COLUMN email SET NOT NULL;

-- Add unique constraint on email (but only if it doesn't already exist)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'profiles_email_unique') THEN
        ALTER TABLE profiles ADD CONSTRAINT profiles_email_unique UNIQUE (email);
    END IF;
END $$;
