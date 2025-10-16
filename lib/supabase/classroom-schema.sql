// lib/supabase/classroom-schema.sql

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Homework items table (main homework management)
CREATE TABLE IF NOT EXISTS homework_items (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  due_date DATE,
  priority TEXT CHECK (priority IN ('low', 'medium', 'high')) DEFAULT 'medium',
  status TEXT CHECK (status IN ('pending', 'in_progress', 'completed')) DEFAULT 'pending',
  subject TEXT,
  class_name TEXT,
  estimated_time INTEGER, -- in minutes
  actual_time INTEGER, -- in minutes (when completed)
  notes TEXT,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Classroom integration fields
  classroom_coursework_id UUID,
  google_classroom_id TEXT,
  last_classroom_sync TIMESTAMP WITH TIME ZONE
);

-- Classroom courses synced from Google Classroom
CREATE TABLE classroom_courses (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  google_course_id TEXT NOT NULL,
  name TEXT NOT NULL,
  section TEXT,
  description TEXT,
  room TEXT,
  owner_id TEXT NOT NULL,
  course_state TEXT NOT NULL DEFAULT 'ACTIVE',
  synced_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Ensure one course per user per Google course ID
  UNIQUE(user_id, google_course_id)
);

-- Classroom coursework/assignments synced from Google Classroom
CREATE TABLE classroom_coursework (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES classroom_courses(id) ON DELETE CASCADE,
  google_coursework_id TEXT NOT NULL,
  google_course_id TEXT NOT NULL,

  title TEXT NOT NULL,
  description TEXT,
  state TEXT NOT NULL DEFAULT 'PUBLISHED',
  work_type TEXT NOT NULL,
  max_points DECIMAL(5,2),

  -- Due date and time
  due_date DATE,
  due_time TIME,

  -- Sync tracking
  last_synced TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Ensure one coursework per user per Google coursework ID
  UNIQUE(user_id, google_coursework_id)
);

-- Student submissions for coursework
CREATE TABLE classroom_submissions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  coursework_id UUID NOT NULL REFERENCES classroom_coursework(id) ON DELETE CASCADE,
  google_submission_id TEXT,

  state TEXT NOT NULL DEFAULT 'CREATED',
  grade DECIMAL(5,2),
  assigned_grade DECIMAL(5,2),

  -- Submission timestamps
  creation_time TIMESTAMP WITH TIME ZONE,
  update_time TIMESTAMP WITH TIME ZONE,

  -- Sync tracking
  last_synced TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(user_id, coursework_id)
);

-- Sync preferences and settings per user
CREATE TABLE classroom_sync_settings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Sync preferences
  auto_sync_enabled BOOLEAN DEFAULT true,
  sync_frequency_minutes INTEGER DEFAULT 15,

  -- Course selection
  selected_course_ids TEXT[] DEFAULT '{}',

  -- Last sync tracking
  last_sync_at TIMESTAMP WITH TIME ZONE,
  last_sync_error TEXT,

  -- Google tokens (encrypted)
  access_token_encrypted TEXT,
  refresh_token_encrypted TEXT,
  token_expires_at TIMESTAMP WITH TIME ZONE,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(user_id)
);

-- Homework items enhanced with Classroom integration
ALTER TABLE homework_items ADD COLUMN IF NOT EXISTS classroom_coursework_id UUID REFERENCES classroom_coursework(id);
ALTER TABLE homework_items ADD COLUMN IF NOT EXISTS google_classroom_id TEXT;
ALTER TABLE homework_items ADD COLUMN IF NOT EXISTS last_classroom_sync TIMESTAMP WITH TIME ZONE;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_homework_items_user_id ON homework_items(user_id);
CREATE INDEX IF NOT EXISTS idx_homework_items_due_date ON homework_items(due_date);
CREATE INDEX IF NOT EXISTS idx_classroom_courses_user_id ON classroom_courses(user_id);
CREATE INDEX IF NOT EXISTS idx_classroom_coursework_user_id ON classroom_coursework(user_id);
CREATE INDEX IF NOT EXISTS idx_classroom_coursework_course_id ON classroom_coursework(course_id);
CREATE INDEX IF NOT EXISTS idx_classroom_submissions_user_id ON classroom_submissions(user_id);
CREATE INDEX IF NOT EXISTS idx_classroom_submissions_coursework_id ON classroom_submissions(coursework_id);
CREATE INDEX IF NOT EXISTS idx_homework_classroom_coursework_id ON homework_items(classroom_coursework_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers
CREATE TRIGGER update_homework_items_updated_at BEFORE UPDATE ON homework_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_classroom_courses_updated_at BEFORE UPDATE ON classroom_courses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_classroom_coursework_updated_at BEFORE UPDATE ON classroom_coursework FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_classroom_submissions_updated_at BEFORE UPDATE ON classroom_submissions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_classroom_sync_settings_updated_at BEFORE UPDATE ON classroom_sync_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
