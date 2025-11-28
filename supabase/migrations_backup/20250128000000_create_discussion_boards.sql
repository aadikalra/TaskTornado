-- Create discussion boards tables for public Q&A and resource sharing

-- Discussion boards table (public forums that anyone can join)
CREATE TABLE IF NOT EXISTS discussion_boards (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  member_count INTEGER DEFAULT 0,
  thread_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Board members table (tracks who has joined which boards)
CREATE TABLE IF NOT EXISTS discussion_board_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  board_id UUID NOT NULL REFERENCES discussion_boards(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(board_id, user_id)
);

-- Discussion threads table
CREATE TABLE IF NOT EXISTS discussion_threads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  board_id UUID NOT NULL REFERENCES discussion_boards(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  is_pinned BOOLEAN DEFAULT false,
  is_resolved BOOLEAN DEFAULT false,
  tags TEXT[] DEFAULT '{}',
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Discussion posts/replies table
CREATE TABLE IF NOT EXISTS discussion_posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  thread_id UUID NOT NULL REFERENCES discussion_threads(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_answer BOOLEAN DEFAULT false,
  upvotes INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Discussion resources table (shared files, links, etc.)
CREATE TABLE IF NOT EXISTS discussion_resources (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  board_id UUID NOT NULL REFERENCES discussion_boards(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  resource_type TEXT CHECK (resource_type IN ('link', 'file', 'video', 'document', 'other')) DEFAULT 'link',
  url TEXT,
  file_path TEXT,
  tags TEXT[] DEFAULT '{}',
  upvotes INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Post upvotes tracking table
CREATE TABLE IF NOT EXISTS discussion_post_upvotes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES discussion_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(post_id, user_id)
);

-- Resource upvotes tracking table
CREATE TABLE IF NOT EXISTS discussion_resource_upvotes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  resource_id UUID NOT NULL REFERENCES discussion_resources(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(resource_id, user_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_discussion_boards_created_by ON discussion_boards(created_by);
CREATE INDEX IF NOT EXISTS idx_discussion_boards_created_at ON discussion_boards(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_discussion_board_members_board_id ON discussion_board_members(board_id);
CREATE INDEX IF NOT EXISTS idx_discussion_board_members_user_id ON discussion_board_members(user_id);
CREATE INDEX IF NOT EXISTS idx_discussion_threads_board_id ON discussion_threads(board_id);
CREATE INDEX IF NOT EXISTS idx_discussion_threads_user_id ON discussion_threads(user_id);
CREATE INDEX IF NOT EXISTS idx_discussion_threads_created_at ON discussion_threads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_discussion_posts_thread_id ON discussion_posts(thread_id);
CREATE INDEX IF NOT EXISTS idx_discussion_posts_user_id ON discussion_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_discussion_resources_board_id ON discussion_resources(board_id);
CREATE INDEX IF NOT EXISTS idx_discussion_resources_user_id ON discussion_resources(user_id);
CREATE INDEX IF NOT EXISTS idx_discussion_post_upvotes_post_id ON discussion_post_upvotes(post_id);
CREATE INDEX IF NOT EXISTS idx_discussion_post_upvotes_user_id ON discussion_post_upvotes(user_id);
CREATE INDEX IF NOT EXISTS idx_discussion_resource_upvotes_resource_id ON discussion_resource_upvotes(resource_id);
CREATE INDEX IF NOT EXISTS idx_discussion_resource_upvotes_user_id ON discussion_resource_upvotes(user_id);

-- Enable Row Level Security (RLS)
ALTER TABLE discussion_boards ENABLE ROW LEVEL SECURITY;
ALTER TABLE discussion_board_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE discussion_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE discussion_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE discussion_resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE discussion_post_upvotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE discussion_resource_upvotes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for discussion_boards (everyone can view all boards)
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

-- RLS Policies for discussion_board_members
CREATE POLICY "Anyone can view board members"
  ON discussion_board_members FOR SELECT
  USING (true);

CREATE POLICY "Users can join boards"
  ON discussion_board_members FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can leave boards"
  ON discussion_board_members FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for discussion_threads (anyone can view, members can post)
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

-- RLS Policies for discussion_posts (anyone can view, members can post)
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

-- RLS Policies for discussion_resources (anyone can view, members can share)
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

-- RLS Policies for upvotes
CREATE POLICY "Users can view all upvotes"
  ON discussion_post_upvotes FOR SELECT
  USING (true);

CREATE POLICY "Users can create their own upvotes"
  ON discussion_post_upvotes FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete their own upvotes"
  ON discussion_post_upvotes FOR DELETE
  USING (user_id = auth.uid());

CREATE POLICY "Users can view all resource upvotes"
  ON discussion_resource_upvotes FOR SELECT
  USING (true);

CREATE POLICY "Users can create their own resource upvotes"
  ON discussion_resource_upvotes FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete their own resource upvotes"
  ON discussion_resource_upvotes FOR DELETE
  USING (user_id = auth.uid());

-- Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_discussion_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers
CREATE TRIGGER update_discussion_boards_updated_at 
  BEFORE UPDATE ON discussion_boards 
  FOR EACH ROW EXECUTE FUNCTION update_discussion_updated_at();

CREATE TRIGGER update_discussion_threads_updated_at 
  BEFORE UPDATE ON discussion_threads 
  FOR EACH ROW EXECUTE FUNCTION update_discussion_updated_at();

CREATE TRIGGER update_discussion_posts_updated_at 
  BEFORE UPDATE ON discussion_posts 
  FOR EACH ROW EXECUTE FUNCTION update_discussion_updated_at();

CREATE TRIGGER update_discussion_resources_updated_at 
  BEFORE UPDATE ON discussion_resources 
  FOR EACH ROW EXECUTE FUNCTION update_discussion_updated_at();
