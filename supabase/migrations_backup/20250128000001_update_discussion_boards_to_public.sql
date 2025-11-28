-- Migration to convert discussion boards from class-specific to public forums

-- Step 1: Drop ALL existing policies
-- Discussion boards policies
DROP POLICY IF EXISTS "Users can view discussion boards for their classes" ON discussion_boards;
DROP POLICY IF EXISTS "Users can create discussion boards for their classes" ON discussion_boards;
DROP POLICY IF EXISTS "Anyone can view all discussion boards" ON discussion_boards;
DROP POLICY IF EXISTS "Authenticated users can create discussion boards" ON discussion_boards;
DROP POLICY IF EXISTS "Board creators can update their boards" ON discussion_boards;
DROP POLICY IF EXISTS "Board creators can delete their boards" ON discussion_boards;

-- Discussion threads policies
DROP POLICY IF EXISTS "Users can view threads in their class boards" ON discussion_threads;
DROP POLICY IF EXISTS "Users can create threads in their class boards" ON discussion_threads;
DROP POLICY IF EXISTS "Anyone can view all threads" ON discussion_threads;
DROP POLICY IF EXISTS "Board members can create threads" ON discussion_threads;
DROP POLICY IF EXISTS "Users can update their own threads" ON discussion_threads;
DROP POLICY IF EXISTS "Users can delete their own threads" ON discussion_threads;

-- Discussion posts policies
DROP POLICY IF EXISTS "Users can view posts in their class threads" ON discussion_posts;
DROP POLICY IF EXISTS "Users can create posts in their class threads" ON discussion_posts;
DROP POLICY IF EXISTS "Anyone can view all posts" ON discussion_posts;
DROP POLICY IF EXISTS "Board members can create posts" ON discussion_posts;
DROP POLICY IF EXISTS "Users can update their own posts" ON discussion_posts;
DROP POLICY IF EXISTS "Users can delete their own posts" ON discussion_posts;

-- Discussion resources policies
DROP POLICY IF EXISTS "Users can view resources in their class boards" ON discussion_resources;
DROP POLICY IF EXISTS "Users can create resources in their class boards" ON discussion_resources;
DROP POLICY IF EXISTS "Anyone can view all resources" ON discussion_resources;
DROP POLICY IF EXISTS "Board members can create resources" ON discussion_resources;
DROP POLICY IF EXISTS "Users can update their own resources" ON discussion_resources;
DROP POLICY IF EXISTS "Users can delete their own resources" ON discussion_resources;

-- Upvote policies
DROP POLICY IF EXISTS "Users can view all upvotes" ON discussion_post_upvotes;
DROP POLICY IF EXISTS "Users can create their own upvotes" ON discussion_post_upvotes;
DROP POLICY IF EXISTS "Users can delete their own upvotes" ON discussion_post_upvotes;
DROP POLICY IF EXISTS "Users can view all resource upvotes" ON discussion_resource_upvotes;
DROP POLICY IF EXISTS "Users can create their own resource upvotes" ON discussion_resource_upvotes;
DROP POLICY IF EXISTS "Users can delete their own resource upvotes" ON discussion_resource_upvotes;

-- Step 2: Drop the unique constraint on class_id
ALTER TABLE discussion_boards DROP CONSTRAINT IF EXISTS discussion_boards_class_id_key;

-- Step 3: Drop the index on class_id
DROP INDEX IF EXISTS idx_discussion_boards_class_id;

-- Step 4: Add new columns to discussion_boards
ALTER TABLE discussion_boards 
  ADD COLUMN IF NOT EXISTS name TEXT,
  ADD COLUMN IF NOT EXISTS description TEXT,
  ADD COLUMN IF NOT EXISTS created_by UUID,
  ADD COLUMN IF NOT EXISTS member_count INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS thread_count INTEGER DEFAULT 0;

-- Step 5: Migrate existing data (set name from class name, created_by from class owner)
UPDATE discussion_boards db
SET 
  name = COALESCE(c.name, 'Untitled Board'),
  created_by = c.user_id,
  member_count = 1,
  thread_count = (SELECT COUNT(*) FROM discussion_threads WHERE board_id = db.id)
FROM classes c
WHERE db.class_id = c.id
AND db.name IS NULL;

-- Step 6: Add foreign key constraint and make columns NOT NULL after migration
ALTER TABLE discussion_boards 
  ALTER COLUMN name SET NOT NULL,
  ALTER COLUMN created_by SET NOT NULL;

ALTER TABLE discussion_boards
  ADD CONSTRAINT discussion_boards_created_by_fkey 
  FOREIGN KEY (created_by) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Step 7: Create the board members table
CREATE TABLE IF NOT EXISTS discussion_board_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  board_id UUID NOT NULL REFERENCES discussion_boards(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(board_id, user_id)
);

-- Step 8: Migrate existing users to board members (class owners auto-join their boards)
INSERT INTO discussion_board_members (board_id, user_id)
SELECT db.id, c.user_id
FROM discussion_boards db
JOIN classes c ON db.class_id = c.id
ON CONFLICT (board_id, user_id) DO NOTHING;

-- Step 9: Drop the old class_id column (optional - comment out if you want to keep it for reference)
-- ALTER TABLE discussion_boards DROP COLUMN IF EXISTS class_id;

-- Step 10: Create new indexes
CREATE INDEX IF NOT EXISTS idx_discussion_boards_created_by ON discussion_boards(created_by);
CREATE INDEX IF NOT EXISTS idx_discussion_boards_created_at ON discussion_boards(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_discussion_board_members_board_id ON discussion_board_members(board_id);
CREATE INDEX IF NOT EXISTS idx_discussion_board_members_user_id ON discussion_board_members(user_id);

-- Step 11: Enable RLS on new table
ALTER TABLE discussion_board_members ENABLE ROW LEVEL SECURITY;

-- Step 12: Create new RLS policies for discussion_boards
CREATE POLICY "Anyone can view all discussion boards"
  ON discussion_boards FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create discussion boards"
  ON discussion_boards FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL AND created_by = auth.uid());

CREATE POLICY "Board creators can update their boards"
  ON discussion_boards FOR UPDATE
  USING (created_by = auth.uid())
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "Board creators can delete their boards"
  ON discussion_boards FOR DELETE
  USING (created_by = auth.uid());

-- Step 13: Create RLS policies for discussion_board_members
CREATE POLICY "Anyone can view board members"
  ON discussion_board_members FOR SELECT
  USING (true);

CREATE POLICY "Users can join boards"
  ON discussion_board_members FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can leave boards"
  ON discussion_board_members FOR DELETE
  USING (auth.uid() = user_id);

-- Step 14: Create new RLS policies for discussion_threads
CREATE POLICY "Anyone can view all threads"
  ON discussion_threads FOR SELECT
  USING (true);

CREATE POLICY "Board members can create threads"
  ON discussion_threads FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM discussion_board_members
      WHERE board_id = discussion_threads.board_id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own threads"
  ON discussion_threads FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete their own threads"
  ON discussion_threads FOR DELETE
  USING (user_id = auth.uid());

-- Step 15: Create new RLS policies for discussion_posts
CREATE POLICY "Anyone can view all posts"
  ON discussion_posts FOR SELECT
  USING (true);

CREATE POLICY "Board members can create posts"
  ON discussion_posts FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM discussion_board_members dbm
      JOIN discussion_threads dt ON dt.board_id = dbm.board_id
      WHERE dt.id = discussion_posts.thread_id
      AND dbm.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own posts"
  ON discussion_posts FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete their own posts"
  ON discussion_posts FOR DELETE
  USING (user_id = auth.uid());

-- Step 16: Create new RLS policies for discussion_resources
CREATE POLICY "Anyone can view all resources"
  ON discussion_resources FOR SELECT
  USING (true);

CREATE POLICY "Board members can create resources"
  ON discussion_resources FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM discussion_board_members
      WHERE board_id = discussion_resources.board_id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own resources"
  ON discussion_resources FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete their own resources"
  ON discussion_resources FOR DELETE
  USING (user_id = auth.uid());
