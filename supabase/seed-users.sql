-- ============================================================================
-- 67 Hub - User Profiles & Artists Seed
-- ============================================================================
--
-- ISTRUZIONI:
-- 1. Prima esegui questa query per vedere gli UUID:
--
--    SELECT id, email FROM auth.users ORDER BY email;
--
-- 2. Copia gli UUID e incollali nelle variabili qui sotto
-- 3. Poi esegui TUTTO questo script
-- ============================================================================

-- STEP 1: Imposta le variabili con gli UUID REALI
-- Sostituisci questi valori con quelli dalla query SELECT sopra!

DO $$
DECLARE
  admin_uuid UUID := '00000000-0000-0000-0000-000000000000';    -- SOSTITUISCI con UUID di admin@67hub.test
  manager_uuid UUID := '00000000-0000-0000-0000-000000000000';  -- SOSTITUISCI con UUID di manager@67hub.test
  artist1_uuid UUID := '00000000-0000-0000-0000-000000000000';  -- SOSTITUISCI con UUID di artist1@67hub.test
  artist2_uuid UUID := '00000000-0000-0000-0000-000000000000';  -- SOSTITUISCI con UUID di artist2@67hub.test
BEGIN
  -- Insert users profiles
  INSERT INTO users (id, email, display_name, role, created_at, updated_at) VALUES
    (admin_uuid, 'admin@67hub.test', 'Test Admin', 'admin', NOW(), NOW()),
    (manager_uuid, 'manager@67hub.test', 'Test Manager', 'manager', NOW(), NOW()),
    (artist1_uuid, 'artist1@67hub.test', 'Test Artist 1', 'artist', NOW(), NOW()),
    (artist2_uuid, 'artist2@67hub.test', 'Test Artist 2', 'artist', NOW(), NOW());

  -- Insert artists
  INSERT INTO artists (id, user_id, name, bio, color, instagram_url, spotify_url, is_label, created_at, updated_at) VALUES
    ('11111111-1111-1111-1111-111111111111', artist1_uuid, 'MC Test', 'Test rapper', '#FF5500',
     'https://instagram.com/mctest', 'https://open.spotify.com/artist/123', false, NOW(), NOW()),
    ('22222222-2222-2222-2222-222222222222', artist2_uuid, 'DJ Sample', 'Test DJ', '#00AAFF',
     'https://instagram.com/djsample', 'https://open.spotify.com/artist/456', false, NOW(), NOW()),
    ('67676767-6767-6767-6767-676767676767', NULL, '67 Label', 'The label', '#FFD700',
     'https://instagram.com/67label', 'https://open.spotify.com/user/67label', true, NOW(), NOW());

  -- Insert conversations for artists (not for label)
  INSERT INTO conversations (id, artist_id, created_at, updated_at) VALUES
    ('cccccccc-cccc-cccc-cccc-cccccccccccc', '11111111-1111-1111-1111-111111111111', NOW(), NOW()),
    (gen_random_uuid(), '22222222-2222-2222-2222-222222222222', NOW(), NOW());

  RAISE NOTICE 'Setup completato! Profili utente, artisti e conversazioni creati.';
END $$;

-- STEP 2: Verifica che tutto sia stato creato correttamente
SELECT
  u.email,
  u.display_name,
  u.role,
  a.name as artist_name,
  a.color
FROM users u
LEFT JOIN artists a ON a.user_id = u.id
ORDER BY u.email;
