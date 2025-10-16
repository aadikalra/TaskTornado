-- Add recurring homework fields to homework table
ALTER TABLE homework
ADD COLUMN recurring_id TEXT,
ADD COLUMN recurring_frequency TEXT,
ADD COLUMN recurring_end_date TIMESTAMPTZ,
ADD COLUMN recurring_max_occurrences INTEGER,
ADD COLUMN parent_recurring_id TEXT,
ADD COLUMN is_recurring_instance BOOLEAN DEFAULT FALSE;

-- Add index for better performance on recurring queries
CREATE INDEX idx_homework_recurring_id ON homework(recurring_id);
CREATE INDEX idx_homework_parent_recurring_id ON homework(parent_recurring_id);
CREATE INDEX idx_homework_is_recurring_instance ON homework(is_recurring_instance);
