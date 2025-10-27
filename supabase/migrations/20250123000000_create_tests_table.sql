-- Create tests table for managing test/exam schedules
CREATE TABLE IF NOT EXISTS tests (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  test_date DATE NOT NULL,
  test_time TIME,
  test_type TEXT CHECK (test_type IN ('ALPHA', 'BETA', 'exam', 'quiz', 'midterm', 'final', 'project', 'presentation')) DEFAULT 'exam',
  weight DECIMAL(5,2), -- percentage weight towards final grade (0-100)
  location TEXT, -- classroom, online, etc.
  duration INTEGER, -- in minutes
  priority TEXT CHECK (priority IN ('low', 'medium', 'high')) DEFAULT 'medium',
  status TEXT CHECK (status IN ('upcoming', 'completed', 'missed')) DEFAULT 'upcoming',
  score DECIMAL(5,2), -- actual score achieved (0-100 or points)
  max_score DECIMAL(5,2), -- maximum possible score
  grade TEXT, -- letter grade (A, B+, etc.)
  study_materials TEXT[], -- array of study topics/materials
  notes TEXT,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_tests_user_id ON tests(user_id);
CREATE INDEX IF NOT EXISTS idx_tests_class_id ON tests(class_id);
CREATE INDEX IF NOT EXISTS idx_tests_test_date ON tests(test_date);
CREATE INDEX IF NOT EXISTS idx_tests_status ON tests(status);
CREATE INDEX IF NOT EXISTS idx_tests_test_type ON tests(test_type);

-- Add updated_at trigger for tests table
CREATE TRIGGER update_tests_updated_at BEFORE UPDATE ON tests FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Update RLS policies for tests table
ALTER TABLE tests ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only access their own tests
CREATE POLICY "Users can view own tests" ON tests
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own tests" ON tests
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own tests" ON tests
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own tests" ON tests
  FOR DELETE USING (auth.uid() = user_id);
