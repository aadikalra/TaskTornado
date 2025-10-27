-- Update tests table to include ALPHA and BETA test types
-- This migration updates the test_type constraint to include ALPHA and BETA

-- First, we need to drop the existing constraint and recreate it with the new values
ALTER TABLE tests DROP CONSTRAINT IF EXISTS tests_test_type_check;

-- Add the updated constraint with ALPHA and BETA included
ALTER TABLE tests ADD CONSTRAINT tests_test_type_check
  CHECK (test_type IN ('ALPHA', 'BETA', 'exam', 'quiz', 'midterm', 'final', 'project', 'presentation'));

-- Create index for the updated test_type values
DROP INDEX IF EXISTS idx_tests_test_type;
CREATE INDEX idx_tests_test_type ON tests(test_type);
