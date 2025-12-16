-- EchoScape Database Seed Data
-- Compatible with supabase_setup.sql schema
-- Run this in Supabase SQL Editor after creating tables

-- Clear existing data (uncomment if needed)
-- TRUNCATE users, sessions, messages, crisis_logs, session_analytics RESTART IDENTITY CASCADE;

-- ============================================
-- USERS (id, email, created_at only)
-- ============================================
INSERT INTO users (id, email) VALUES 
  ('11111111-1111-1111-1111-111111111111', 'demo@echoscape.app'),
  ('22222222-2222-2222-2222-222222222222', 'test@echoscape.app')
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- SESSIONS
-- ============================================
INSERT INTO sessions (
  id, user_id, summary, themes, primary_emotion, emotion_data, metaphor, 
  original_image_url, reframed_image_url, crisis_detected, ended_at
) VALUES 
-- Session 1: Work Anxiety
(
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  '11111111-1111-1111-1111-111111111111',
  'User expressed overwhelming anxiety about work deadlines. Through reflection, they identified perfectionism as the root cause.',
  ARRAY['work stress', 'perfectionism', 'deadlines'],
  'anxiety',
  '{"anxiety": 0.75, "fear": 0.45, "overwhelm": 0.6, "hope": 0.25}'::jsonb,
  'A narrow tunnel with walls pressing in, but a soft light glimmers at the far end',
  'https://images.unsplash.com/photo-1516912481808-3406841bd33c?w=800',
  NULL,
  FALSE,
  NOW() - INTERVAL '2 days'
),
-- Session 2: Healing from Breakup
(
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
  '11111111-1111-1111-1111-111111111111',
  'User shared progress recovering from a difficult breakup. They noticed moments of genuine happiness returning.',
  ARRAY['relationships', 'healing', 'self-growth'],
  'hope',
  '{"hope": 0.7, "sadness": 0.3, "gratitude": 0.5, "calm": 0.4}'::jsonb,
  'A sunrise breaking through storm clouds over a calm lake',
  'https://images.unsplash.com/photo-1495616811223-4d98c6e9c869?w=800',
  'https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?w=800',
  FALSE,
  NOW() - INTERVAL '1 day'
),
-- Session 3: Grief
(
  'cccccccc-cccc-cccc-cccc-cccccccccccc',
  '22222222-2222-2222-2222-222222222222',
  'User processed grief over losing a family member. They explored memories and allowed themselves to feel the loss.',
  ARRAY['grief', 'loss', 'family', 'memories'],
  'sadness',
  '{"sadness": 0.8, "love": 0.6, "grief": 0.7, "peace": 0.2}'::jsonb,
  'A misty forest path in autumn, leaves falling gently',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800',
  NULL,
  FALSE,
  NOW() - INTERVAL '3 days'
),
-- Session 4: Peaceful Check-in
(
  'dddddddd-dddd-dddd-dddd-dddddddddddd',
  '11111111-1111-1111-1111-111111111111',
  'A peaceful check-in session. User reflected on positive changes and expressed gratitude.',
  ARRAY['gratitude', 'peace', 'mindfulness'],
  'calm',
  '{"calm": 0.8, "gratitude": 0.7, "joy": 0.5, "peace": 0.75}'::jsonb,
  'A serene mountain lake at dawn, perfectly still',
  'https://images.unsplash.com/photo-1439066615861-d1af74d74000?w=800',
  NULL,
  FALSE,
  NOW() - INTERVAL '12 hours'
),
-- Session 5: Active Session
(
  'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee',
  '11111111-1111-1111-1111-111111111111',
  NULL,
  NULL,
  'confusion',
  '{"confusion": 0.5, "anxiety": 0.3}'::jsonb,
  NULL,
  NULL,
  NULL,
  FALSE,
  NULL
)
ON CONFLICT (id) DO UPDATE SET
  summary = EXCLUDED.summary,
  themes = EXCLUDED.themes,
  primary_emotion = EXCLUDED.primary_emotion,
  emotion_data = EXCLUDED.emotion_data;

-- ============================================
-- MESSAGES (uses 'content' not 'text', no sequence_number)
-- ============================================
INSERT INTO messages (session_id, role, content, emotion_snapshot) VALUES 
-- Session 1 messages
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'assistant', 'Hi, I''m Echo. I''m here to listen and help you reflect. How are you feeling right now?', NULL),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'user', 'I''m really stressed about work. I have this huge deadline coming up and I feel like I''m going to fail.', '{"anxiety": 0.8, "fear": 0.6}'::jsonb),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'assistant', 'That sounds really overwhelming. The pressure of deadlines can feel crushing. What specifically about this deadline is making you feel like you might fail?', NULL),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'user', 'I guess I feel like nothing I do is ever good enough. Even when I work hard, I find flaws in everything.', '{"anxiety": 0.7, "sadness": 0.4}'::jsonb),

-- Session 2 messages
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'assistant', 'Hi, I''m Echo. I''m here to listen and help you reflect. How are you feeling right now?', NULL),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'user', 'Actually, I''m feeling pretty good today. For the first time in a while, I woke up and didn''t feel that heaviness.', '{"hope": 0.6, "joy": 0.4}'::jsonb),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'assistant', 'That''s wonderful to hear. Those moments of lightness can be so precious. What do you think contributed to this feeling?', NULL),

-- Session 3 messages
('cccccccc-cccc-cccc-cccc-cccccccccccc', 'assistant', 'Hi, I''m Echo. I''m here to listen and help you reflect. How are you feeling right now?', NULL),
('cccccccc-cccc-cccc-cccc-cccccccccccc', 'user', 'My grandmother passed away last month. I thought I was handling it okay, but today I found her old recipe book and I just broke down.', '{"sadness": 0.9, "grief": 0.8, "love": 0.7}'::jsonb),
('cccccccc-cccc-cccc-cccc-cccccccccccc', 'assistant', 'I''m so sorry for your loss. Grief has a way of finding us in unexpected moments, especially through objects that hold memories.', NULL),

-- Session 4 messages
('dddddddd-dddd-dddd-dddd-dddddddddddd', 'assistant', 'Hi, I''m Echo. I''m here to listen and help you reflect. How are you feeling right now?', NULL),
('dddddddd-dddd-dddd-dddd-dddddddddddd', 'user', 'Honestly? Pretty peaceful. I just wanted to check in and reflect on how far I''ve come.', '{"calm": 0.8, "gratitude": 0.7}'::jsonb),

-- Session 5 messages (active)
('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'assistant', 'Hi, I''m Echo. I''m here to listen and help you reflect. How are you feeling right now?', NULL),
('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'user', 'I''m not sure how I feel today. Kind of all over the place.', '{"confusion": 0.6, "anxiety": 0.3}'::jsonb);

-- ============================================
-- SESSION ANALYTICS
-- ============================================
INSERT INTO session_analytics (session_id, emotion_vector, cognitive_patterns) VALUES 
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '{"anxiety": 0.75, "fear": 0.45, "overwhelm": 0.6}'::jsonb, ARRAY['catastrophizing', 'all-or-nothing thinking']),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '{"hope": 0.7, "sadness": 0.3, "gratitude": 0.5}'::jsonb, NULL),
('cccccccc-cccc-cccc-cccc-cccccccccccc', '{"sadness": 0.8, "love": 0.6, "grief": 0.7}'::jsonb, NULL),
('dddddddd-dddd-dddd-dddd-dddddddddddd', '{"calm": 0.8, "gratitude": 0.7, "joy": 0.5}'::jsonb, NULL);

-- ============================================
-- VERIFY
-- ============================================
SELECT 'Users' as table_name, COUNT(*) as count FROM users
UNION ALL
SELECT 'Sessions', COUNT(*) FROM sessions
UNION ALL
SELECT 'Messages', COUNT(*) FROM messages
UNION ALL
SELECT 'Analytics', COUNT(*) FROM session_analytics;
