-- Comprehensive NULL constraint fix for sessions table
-- Run this in Supabase SQL Editor

-- Based on application logic, these columns should be nullable:
-- Sessions are created empty and populated during conversation

ALTER TABLE sessions 
  -- Core fields that should be nullable (populated later)
  ALTER COLUMN emotion_data DROP NOT NULL,
  ALTER COLUMN visual_params DROP NOT NULL,
  
  -- Optional fields that may never be filled
  ALTER COLUMN journal_text DROP NOT NULL,
  ALTER COLUMN summary DROP NOT NULL,
  ALTER COLUMN themes DROP NOT NULL,
  ALTER COLUMN metaphor DROP NOT NULL,
  ALTER COLUMN primary_emotion DROP NOT NULL,
  ALTER COLUMN original_image_url DROP NOT NULL,
  ALTER COLUMN reframed_image_url DROP NOT NULL,
  ALTER COLUMN reframe_params DROP NOT NULL,
  ALTER COLUMN crisis_detected DROP NOT NULL,
  ALTER COLUMN ended_at DROP NOT NULL;

-- Verify the changes
SELECT column_name, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'sessions' 
ORDER BY ordinal_position;

-- Expected result: Only id and user_id should have is_nullable = NO
-- All other columns should have is_nullable = YES
