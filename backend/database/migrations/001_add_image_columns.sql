-- Migration: Add image URL columns to sessions table
-- Run this if you already have the sessions table created

-- Add original_image_url column
ALTER TABLE sessions 
ADD COLUMN IF NOT EXISTS original_image_url TEXT;

-- Add reframed_image_url column
ALTER TABLE sessions 
ADD COLUMN IF NOT EXISTS reframed_image_url TEXT;

-- Add crisis_detected column
ALTER TABLE sessions 
ADD COLUMN IF NOT EXISTS crisis_detected BOOLEAN DEFAULT FALSE;

-- Update existing sessions to have default values
UPDATE sessions 
SET crisis_detected = FALSE 
WHERE crisis_detected IS NULL;
