-- Remove class_id NOT NULL constraint or drop the column entirely

-- Option 1: Make class_id nullable (keeps the data for reference)
ALTER TABLE discussion_boards ALTER COLUMN class_id DROP NOT NULL;

-- Option 2: Drop the column entirely (uncomment if you want to remove it completely)
-- ALTER TABLE discussion_boards DROP COLUMN IF EXISTS class_id;
