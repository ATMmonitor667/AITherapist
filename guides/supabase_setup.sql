-- ECHOSCAPE DATABASE SCHEMA V1.0
-- Based on EchoScape Architecture Document Phase 1

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. USERS TABLE (Optional for MVP, but good practice)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. SESSIONS TABLE (Updated for EchoScape)
CREATE TABLE IF NOT EXISTS sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    ended_at TIMESTAMPTZ,
    
    -- Content (Summary of the chat)
    journal_text TEXT,  -- Retained for backward compatibility / fallback
    summary TEXT,
    themes TEXT[],
    metaphor TEXT,
    
    -- Emotion Data
    emotion_data JSONB DEFAULT '{}'::jsonb, -- Store the final/aggregated emotion vector
    primary_emotion TEXT,
    
    -- Visuals
    visual_params JSONB DEFAULT '{}'::jsonb,
    original_image_url TEXT,
    reframed_image_url TEXT,
    reframe_params JSONB,
    
    -- Safety
    crisis_detected BOOLEAN DEFAULT FALSE
);

-- 3. MESSAGES TABLE (New for Chat History)
CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
    content TEXT NOT NULL,
    emotion_snapshot JSONB, -- Emotion analysis of this specific message
    patterns_detected TEXT[], -- Cognitive patterns detected in this message
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. CRISIS LOGS (Retained from v0)
CREATE TABLE IF NOT EXISTS crisis_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES sessions(id) ON DELETE SET NULL,
    trigger_text TEXT NOT NULL,
    risk_score DECIMAL(3,2),
    detected_keywords TEXT[],
    resources_shown BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. SESSION ANALYTICS (New for ML insights)
CREATE TABLE IF NOT EXISTS session_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
    emotion_vector JSONB,
    cognitive_patterns TEXT[],
    visual_params_used JSONB,
    ml_model_version TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_created ON sessions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_session ON messages(session_id);
CREATE INDEX IF NOT EXISTS idx_crisis_session ON crisis_logs(session_id);

-- RLS Policies (Basic for now, can be tightened later)
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable all access for now" ON sessions FOR ALL USING (true);
CREATE POLICY "Enable all access for now messages" ON messages FOR ALL USING (true);

-- Functions and Triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_sessions_updated_at ON sessions;
CREATE TRIGGER update_sessions_updated_at
    BEFORE UPDATE ON sessions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
