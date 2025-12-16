// Session types for EchoScape

import { EmotionData, VisualParams, ReframeParams } from "./emotions.types";

export interface User {
  id: string;
  email: string;
  created_at: string;
}

export type SessionStatus = 'active' | 'completed' | 'abandoned';

export interface Session {
  id: string;
  user_id?: string;
  created_at: string;
  updated_at: string;
  ended_at?: string;

  // Content
  journal_text?: string; // Legacy/Fallback
  summary?: string;
  themes?: string[];
  metaphor?: string;
  primary_emotion?: string;

  // Data
  emotion_data?: EmotionData | Record<string, number>;
  visual_params?: VisualParams | Record<string, any>;

  // Images
  original_image_url?: string;
  reframed_image_url?: string;
  reframe_params?: ReframeParams;

  // Safety
  crisis_detected?: boolean;
}

export type Role = 'user' | 'assistant' | 'system' | 'model';

export interface Message {
  id: string;
  session_id: string;
  role: Role;
  content: string;
  emotion_snapshot?: EmotionData;
  patterns_detected?: string[];
  created_at: string;
}

export interface CrisisLog {
  id: string;
  session_id: string;
  trigger_text: string;
  risk_score: number;
  detected_keywords: string[];
  resources_shown: boolean;
  created_at: string;
}

// Requests
export interface CreateSessionRequest {
  journal_text: string;
  emotion_data: EmotionData;
  visual_params: VisualParams;
  original_image_url: string;
  crisis_detected: boolean;
}

export interface UpdateSessionRequest {
  original_image_url?: string;
  reframed_image_url?: string;
  reframe_params?: ReframeParams;
  visual_params?: VisualParams | Record<string, any>;
  ended_at?: string;
  summary?: string;
  themes?: string[];
  primary_emotion?: string;
  emotion_data?: EmotionData | Record<string, number>;
  metaphor?: string;
  crisis_detected?: boolean;
}

export interface CreateCrisisLogRequest {
  session_id: string;
  trigger_text: string;
  risk_score: number;
  detected_keywords: string[];
}
