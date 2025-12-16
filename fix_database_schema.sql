-- Fix Database Schema Mismatch
-- Run this in your Supabase SQL Editor to add missing columns

-- First, verify current schema
-- Run this query to see what columns exist:
-- SELECT column_name, data_type, is_nullable 
-- FROM information_schema.columns 
-- WHERE table_name = 'sessions' 
-- ORDER BY ordinal_position;

-- Add missing columns to sessions table
-- These columns are expected by the code but don't exist in your database

ALTER TABLE sessions 
ADD COLUMN IF NOT EXISTS summary TEXT,
ADD COLUMN IF NOT EXISTS themes TEXT[],
ADD COLUMN IF NOT EXISTS metaphor TEXT,
ADD COLUMN IF NOT EXISTS primary_emotion TEXT,
ADD COLUMN IF NOT EXISTS visual_params JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS original_image_url TEXT,
ADD COLUMN IF NOT EXISTS reframed_image_url TEXT,
ADD COLUMN IF NOT EXISTS reframe_params JSONB,
ADD COLUMN IF NOT EXISTS crisis_detected BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS ended_at TIMESTAMP WITH TIME ZONE;

-- Verify the changes
-- Run this query after to confirm all columns were added:
-- SELECT column_name, data_type, is_nullable 
-- FROM information_schema.columns 
-- WHERE table_name = 'sessions' 
-- ORDER BY ordinal_position;

-- Expected final schema:
-- id (uuid, NOT NULL)
-- created_at (timestamp with time zone, nullable)
-- user_id (uuid, NOT NULL)
-- updated_at (timestamp with time zone, nullable)
-- journal_text (text, nullable) - already exists
-- emotion_data (jsonb, NOT NULL) - already exists
-- summary (text, nullable) - NEW
-- themes (text[], nullable) - NEW
-- metaphor (text, nullable) - NEW
-- primary_emotion (text, nullable) - NEW
-- visual_params (jsonb, nullable) - NEW
-- original_image_url (text, nullable) - NEW
-- reframed_image_url (text, nullable) - NEW
-- reframe_params (jsonb, nullable) - NEW
-- crisis_detected (boolean, default false) - NEW
-- ended_at (timestamp with time zone, nullable) - NEW
