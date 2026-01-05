-- ============================================================================
-- 67 Hub - E2E Test Seed Data
-- ============================================================================

-- Clean existing test data
DELETE FROM post_media WHERE post_id IN (
  'dddddddd-dddd-dddd-dddd-dddddddddddd',
  'rrrrrrrr-rrrr-rrrr-rrrr-rrrrrrrrrrrr',
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee',
  'pppppppp-pppp-pppp-pppp-pppppppppppp'
);
DELETE FROM post_comments WHERE post_id IN (
  'dddddddd-dddd-dddd-dddd-dddddddddddd',
  'rrrrrrrr-rrrr-rrrr-rrrr-rrrrrrrrrrrr',
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee',
  'pppppppp-pppp-pppp-pppp-pppppppppppp'
);
DELETE FROM post_history WHERE post_id IN (
  'dddddddd-dddd-dddd-dddd-dddddddddddd',
  'rrrrrrrr-rrrr-rrrr-rrrr-rrrrrrrrrrrr',
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee',
  'pppppppp-pppp-pppp-pppp-pppppppppppp'
);
DELETE FROM posts WHERE id IN (
  'dddddddd-dddd-dddd-dddd-dddddddddddd',
  'rrrrrrrr-rrrr-rrrr-rrrr-rrrrrrrrrrrr',
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee',
  'pppppppp-pppp-pppp-pppp-pppppppppppp'
);
DELETE FROM chat_messages WHERE conversation_id = 'cccccccc-cccc-cccc-cccc-cccccccccccc';
DELETE FROM conversations WHERE id = 'cccccccc-cccc-cccc-cccc-cccccccccccc';
DELETE FROM notifications WHERE user_id IN (
  '00000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000002',
  '00000000-0000-0000-0000-000000000003',
  '00000000-0000-0000-0000-000000000004'
);
DELETE FROM artists WHERE id IN (
  '11111111-1111-1111-1111-111111111111',
  '22222222-2222-2222-2222-222222222222',
  '67676767-6767-6767-6767-676767676767'
);
DELETE FROM users WHERE id IN (
  '00000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000002',
  '00000000-0000-0000-0000-000000000003',
  '00000000-0000-0000-0000-000000000004'
);

-- USERS (Staff)
INSERT INTO users (id, email, display_name, role, created_at) VALUES
  ('00000000-0000-0000-0000-000000000001', 'admin@67hub.test', 'Test Admin', 'admin', NOW()),
  ('00000000-0000-0000-0000-000000000002', 'manager@67hub.test', 'Test Manager', 'manager', NOW());

-- Artist 1 user + artist record
INSERT INTO users (id, email, display_name, role, created_at) VALUES
  ('00000000-0000-0000-0000-000000000003', 'artist1@67hub.test', 'Test Artist 1', 'artist', NOW());
INSERT INTO artists (id, user_id, name, bio, color, instagram_url, spotify_url, is_label, created_at) VALUES
  ('11111111-1111-1111-1111-111111111111', '00000000-0000-0000-0000-000000000003', 'MC Test', 
   'Test artist for E2E tests.', '#FF5500', 'https://instagram.com/mctest', 
   'https://open.spotify.com/artist/123', false, NOW());

-- Artist 2 user + artist record
INSERT INTO users (id, email, display_name, role, created_at) VALUES
  ('00000000-0000-0000-0000-000000000004', 'artist2@67hub.test', 'Test Artist 2', 'artist', NOW());
INSERT INTO artists (id, user_id, name, bio, color, instagram_url, spotify_url, is_label, created_at) VALUES
  ('22222222-2222-2222-2222-222222222222', '00000000-0000-0000-0000-000000000004', 'DJ Sample',
   'Second test artist.', '#00AAFF', 'https://instagram.com/djsample',
   'https://open.spotify.com/artist/456', false, NOW());

-- Label 67
INSERT INTO artists (id, user_id, name, bio, color, instagram_url, spotify_url, is_label, created_at) VALUES
  ('67676767-6767-6767-6767-676767676767', NULL, '67 Label',
   'Independent record label.', '#FFD700', 'https://instagram.com/67label',
   'https://open.spotify.com/user/67label', true, NOW());

-- POSTS
INSERT INTO posts (id, title, caption, hashtags, platform, status, artist_id, created_by, scheduled_at, created_at, updated_at) VALUES
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', 'Draft Post', 'Draft caption.', '#test #draft',
   'instagram_feed', 'draft', '11111111-1111-1111-1111-111111111111',
   '00000000-0000-0000-0000-000000000001', NOW() + INTERVAL '3 days', NOW(), NOW());

INSERT INTO posts (id, title, caption, hashtags, platform, status, artist_id, created_by, scheduled_at, created_at, updated_at) VALUES
  ('rrrrrrrr-rrrr-rrrr-rrrr-rrrrrrrrrrrr', 'Post In Review', 'Review caption.', '#review',
   'instagram_reel', 'in_review', '11111111-1111-1111-1111-111111111111',
   '00000000-0000-0000-0000-000000000001', NOW() + INTERVAL '2 days', NOW() - INTERVAL '1 day', NOW());

INSERT INTO posts (id, title, caption, hashtags, platform, status, artist_id, created_by, scheduled_at, created_at, updated_at) VALUES
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Approved Post', 'Approved caption.', '#approved',
   'instagram_story', 'approved', '11111111-1111-1111-1111-111111111111',
   '00000000-0000-0000-0000-000000000001', NOW() + INTERVAL '1 day', NOW() - INTERVAL '2 days', NOW());

INSERT INTO posts (id, title, caption, hashtags, platform, status, artist_id, created_by, rejection_reason, scheduled_at, created_at, updated_at) VALUES
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'Rejected Post', 'Rejected caption.', '#rejected',
   'tiktok', 'rejected', '11111111-1111-1111-1111-111111111111',
   '00000000-0000-0000-0000-000000000001', 'Image quality too low.',
   NOW() + INTERVAL '4 days', NOW() - INTERVAL '3 days', NOW());

INSERT INTO posts (id, title, caption, hashtags, platform, status, artist_id, created_by, scheduled_at, published_at, created_at, updated_at) VALUES
  ('pppppppp-pppp-pppp-pppp-pppppppppppp', 'Published Post', 'Published caption.', '#published',
   'instagram_feed', 'published', '11111111-1111-1111-1111-111111111111',
   '00000000-0000-0000-0000-000000000001', NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day',
   NOW() - INTERVAL '5 days', NOW());

-- POST HISTORY
INSERT INTO post_history (id, post_id, action, user_id, details, created_at) VALUES
  (gen_random_uuid(), 'rrrrrrrr-rrrr-rrrr-rrrr-rrrrrrrrrrrr', 'created', '00000000-0000-0000-0000-000000000001', '{}', NOW() - INTERVAL '1 day'),
  (gen_random_uuid(), 'rrrrrrrr-rrrr-rrrr-rrrr-rrrrrrrrrrrr', 'sent_for_review', '00000000-0000-0000-0000-000000000001', '{}', NOW() - INTERVAL '1 day'),
  (gen_random_uuid(), 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'created', '00000000-0000-0000-0000-000000000001', '{}', NOW() - INTERVAL '2 days'),
  (gen_random_uuid(), 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'sent_for_review', '00000000-0000-0000-0000-000000000001', '{}', NOW() - INTERVAL '2 days'),
  (gen_random_uuid(), 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'approved', '00000000-0000-0000-0000-000000000003', '{}', NOW() - INTERVAL '1 day'),
  (gen_random_uuid(), 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'created', '00000000-0000-0000-0000-000000000001', '{}', NOW() - INTERVAL '3 days'),
  (gen_random_uuid(), 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'sent_for_review', '00000000-0000-0000-0000-000000000001', '{}', NOW() - INTERVAL '3 days'),
  (gen_random_uuid(), 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'rejected', '00000000-0000-0000-0000-000000000003', '{"reason":"Image quality too low."}', NOW() - INTERVAL '2 days'),
  (gen_random_uuid(), 'pppppppp-pppp-pppp-pppp-pppppppppppp', 'created', '00000000-0000-0000-0000-000000000001', '{}', NOW() - INTERVAL '5 days'),
  (gen_random_uuid(), 'pppppppp-pppp-pppp-pppp-pppppppppppp', 'sent_for_review', '00000000-0000-0000-0000-000000000001', '{}', NOW() - INTERVAL '4 days'),
  (gen_random_uuid(), 'pppppppp-pppp-pppp-pppp-pppppppppppp', 'approved', '00000000-0000-0000-0000-000000000003', '{}', NOW() - INTERVAL '3 days'),
  (gen_random_uuid(), 'pppppppp-pppp-pppp-pppp-pppppppppppp', 'published', '00000000-0000-0000-0000-000000000001', '{}', NOW() - INTERVAL '1 day');

-- POST COMMENTS
INSERT INTO post_comments (id, post_id, user_id, content, is_system, created_at) VALUES
  (gen_random_uuid(), 'rrrrrrrr-rrrr-rrrr-rrrr-rrrrrrrrrrrr', '00000000-0000-0000-0000-000000000001', 'Please review this post.', false, NOW() - INTERVAL '1 day'),
  (gen_random_uuid(), 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', '00000000-0000-0000-0000-000000000003', 'Post rejected: Image quality too low.', true, NOW() - INTERVAL '2 days'),
  (gen_random_uuid(), 'pppppppp-pppp-pppp-pppp-pppppppppppp', '00000000-0000-0000-0000-000000000003', 'Looks great!', false, NOW() - INTERVAL '3 days');

-- CONVERSATIONS
INSERT INTO conversations (id, artist_id, created_at, updated_at) VALUES
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', '11111111-1111-1111-1111-111111111111', NOW() - INTERVAL '7 days', NOW());

-- CHAT MESSAGES
INSERT INTO chat_messages (id, conversation_id, sender_id, content, created_at) VALUES
  (gen_random_uuid(), 'cccccccc-cccc-cccc-cccc-cccccccccccc', '00000000-0000-0000-0000-000000000001', 'Hey! Welcome to 67 Hub.', NOW() - INTERVAL '7 days'),
  (gen_random_uuid(), 'cccccccc-cccc-cccc-cccc-cccccccccccc', '00000000-0000-0000-0000-000000000003', 'Thanks! Excited to be here.', NOW() - INTERVAL '7 days' + INTERVAL '1 hour'),
  (gen_random_uuid(), 'cccccccc-cccc-cccc-cccc-cccccccccccc', '00000000-0000-0000-0000-000000000001', 'I have prepared some posts for you to review.', NOW() - INTERVAL '1 day');

-- NOTIFICATIONS
INSERT INTO notifications (id, user_id, type, title, body, data, read, created_at) VALUES
  (gen_random_uuid(), '00000000-0000-0000-0000-000000000003', 'post_review', 'New post to review', 'A new post is waiting for your approval.', '{"post_id":"rrrrrrrr-rrrr-rrrr-rrrr-rrrrrrrrrrrr"}', false, NOW() - INTERVAL '1 day'),
  (gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'post_approved', 'Post approved', 'MC Test approved your post.', '{"post_id":"aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa"}', true, NOW() - INTERVAL '1 day'),
  (gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'post_rejected', 'Post rejected', 'MC Test rejected your post.', '{"post_id":"eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee"}', false, NOW() - INTERVAL '2 days');
