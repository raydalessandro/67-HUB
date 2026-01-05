-- ============================================================================
-- 67 Hub - Row Level Security (RLS) Policies
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE artists ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Get user role
CREATE OR REPLACE FUNCTION get_user_role() RETURNS user_role AS $$
  SELECT role FROM users WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Check if user is staff
CREATE OR REPLACE FUNCTION is_staff() RETURNS BOOLEAN AS $$
  SELECT get_user_role() IN ('admin', 'manager');
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Check if user is admin
CREATE OR REPLACE FUNCTION is_admin() RETURNS BOOLEAN AS $$
  SELECT get_user_role() = 'admin';
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Get user's artist ID
CREATE OR REPLACE FUNCTION get_user_artist_id() RETURNS UUID AS $$
  SELECT id FROM artists WHERE user_id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ============================================================================
-- USERS POLICIES
-- ============================================================================

-- Users can read their own profile
CREATE POLICY users_select_own ON users FOR SELECT
  USING (id = auth.uid());

-- Staff can read all users
CREATE POLICY users_select_staff ON users FOR SELECT
  USING (is_staff());

-- Users can update their own profile
CREATE POLICY users_update_own ON users FOR UPDATE
  USING (id = auth.uid());

-- ============================================================================
-- ARTISTS POLICIES
-- ============================================================================

-- Everyone authenticated can view artists
CREATE POLICY artists_select_all ON artists FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Staff can insert artists
CREATE POLICY artists_insert_staff ON artists FOR INSERT
  WITH CHECK (is_staff());

-- Staff can update artists
CREATE POLICY artists_update_staff ON artists FOR UPDATE
  USING (is_staff());

-- Only admin can delete artists
CREATE POLICY artists_delete_admin ON artists FOR DELETE
  USING (is_admin());

-- ============================================================================
-- POSTS POLICIES
-- ============================================================================

-- Staff can see all posts
CREATE POLICY posts_select_staff ON posts FOR SELECT
  USING (is_staff());

-- Artists can see their own posts (excluding drafts created by others)
CREATE POLICY posts_select_artist ON posts FOR SELECT
  USING (
    get_user_role() = 'artist'
    AND artist_id = get_user_artist_id()
    AND status != 'draft'
  );

-- Staff can insert posts
CREATE POLICY posts_insert_staff ON posts FOR INSERT
  WITH CHECK (is_staff());

-- Staff can update draft and rejected posts
CREATE POLICY posts_update_staff ON posts FOR UPDATE
  USING (
    is_staff() AND status IN ('draft', 'rejected')
  );

-- Artists can update their posts in review (status only for approve/reject)
CREATE POLICY posts_update_artist ON posts FOR UPDATE
  USING (
    get_user_role() = 'artist'
    AND artist_id = get_user_artist_id()
    AND status = 'in_review'
  );

-- Staff can delete draft posts
CREATE POLICY posts_delete_staff ON posts FOR DELETE
  USING (is_staff() AND status = 'draft');

-- ============================================================================
-- POST MEDIA POLICIES
-- ============================================================================

-- Can view media if can view the post
CREATE POLICY post_media_select ON post_media FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM posts
      WHERE posts.id = post_media.post_id
    )
  );

-- Staff can insert media
CREATE POLICY post_media_insert_staff ON post_media FOR INSERT
  WITH CHECK (
    is_staff() AND EXISTS (
      SELECT 1 FROM posts
      WHERE posts.id = post_media.post_id
      AND posts.status = 'draft'
    )
  );

-- Staff can delete media from draft posts
CREATE POLICY post_media_delete_staff ON post_media FOR DELETE
  USING (
    is_staff() AND EXISTS (
      SELECT 1 FROM posts
      WHERE posts.id = post_media.post_id
      AND posts.status = 'draft'
    )
  );

-- ============================================================================
-- POST HISTORY POLICIES
-- ============================================================================

-- Can view history if can view the post
CREATE POLICY post_history_select ON post_history FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM posts
      WHERE posts.id = post_history.post_id
    )
  );

-- Authenticated users can insert history
CREATE POLICY post_history_insert ON post_history FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- ============================================================================
-- POST COMMENTS POLICIES
-- ============================================================================

-- Can view comments if can view the post
CREATE POLICY post_comments_select ON post_comments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM posts
      WHERE posts.id = post_comments.post_id
    )
  );

-- Authenticated users can insert comments on posts they can see
CREATE POLICY post_comments_insert ON post_comments FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL AND EXISTS (
      SELECT 1 FROM posts
      WHERE posts.id = post_comments.post_id
    )
  );

-- ============================================================================
-- CONVERSATIONS POLICIES
-- ============================================================================

-- Staff can see all conversations
CREATE POLICY conversations_select_staff ON conversations FOR SELECT
  USING (is_staff());

-- Artists can see their own conversation
CREATE POLICY conversations_select_artist ON conversations FOR SELECT
  USING (
    artist_id = get_user_artist_id()
  );

-- Staff can create conversations
CREATE POLICY conversations_insert_staff ON conversations FOR INSERT
  WITH CHECK (is_staff());

-- Staff can update conversations
CREATE POLICY conversations_update_staff ON conversations FOR UPDATE
  USING (is_staff());

-- ============================================================================
-- CHAT MESSAGES POLICIES
-- ============================================================================

-- Staff can see all messages
CREATE POLICY chat_messages_select_staff ON chat_messages FOR SELECT
  USING (is_staff());

-- Artists can see messages in their conversation
CREATE POLICY chat_messages_select_artist ON chat_messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM conversations
      WHERE conversations.id = chat_messages.conversation_id
      AND conversations.artist_id = get_user_artist_id()
    )
  );

-- Authenticated users can insert messages in accessible conversations
CREATE POLICY chat_messages_insert ON chat_messages FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL AND (
      is_staff() OR EXISTS (
        SELECT 1 FROM conversations
        WHERE conversations.id = chat_messages.conversation_id
        AND conversations.artist_id = get_user_artist_id()
      )
    )
  );

-- Users can update their own messages (for read receipts)
CREATE POLICY chat_messages_update_own ON chat_messages FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM conversations
      WHERE conversations.id = chat_messages.conversation_id
      AND (
        is_staff() OR
        conversations.artist_id = get_user_artist_id()
      )
    )
  );

-- ============================================================================
-- NOTIFICATIONS POLICIES
-- ============================================================================

-- Users can only see their own notifications
CREATE POLICY notifications_select_own ON notifications FOR SELECT
  USING (user_id = auth.uid());

-- System can insert notifications (service role)
CREATE POLICY notifications_insert_system ON notifications FOR INSERT
  WITH CHECK (true);

-- Users can update their own notifications (mark as read)
CREATE POLICY notifications_update_own ON notifications FOR UPDATE
  USING (user_id = auth.uid());

-- Users can delete their own notifications
CREATE POLICY notifications_delete_own ON notifications FOR DELETE
  USING (user_id = auth.uid());
