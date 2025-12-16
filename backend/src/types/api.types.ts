// API types for EchoScape

import { Session, Message } from './sessions.types';
import { VisualParams } from './emotions.types';

// Re-export compatible types
export type EmotionVector = Record<string, number>;

export interface Visual {
  id: string;
  session_id: string;
  image_url: string;
  image_type: 'base' | 'reframed' | 'variant';
  variant_name?: string;
  visual_params: any;
  fibo_json: any;
  generated_at: string;
}

export interface SessionSummary {
  summary: string;
  themes: string[];
  metaphor?: string;
  cognitive_patterns?: string[];
}

export interface CrisisDetectionResult {
  isCrisis: boolean;
  riskScore: number;
  detectedKeywords: string[];
}

// Generic API response - timestamp is optional
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ApiError | string;
  message?: string;
  timestamp?: string;
}

export interface ApiError {
  code: string;
  message: string;
  details?: unknown;
}

// Session endpoints
export interface StartSessionResponse {
  session_id: string;
  started_at: string;
  status: string;
}

export interface SendMessageRequest {
  text: string;
}

export interface SendMessageResponse {
  user_message: Message;
  assistant_message: Message;
  emotion_snapshot?: EmotionVector;
  crisis_check?: CrisisDetectionResult;
}

export interface EndSessionResponse {
  session_id: string;
  status: string;
  summary: SessionSummary;
  ended_at: string;
}

export interface GetMessagesResponse {
  messages: Message[];
  total: number;
  limit: number;
  offset: number;
}

// Analytics endpoints
export interface AnalyticsResponse {
  session_id: string;
  emotion_vector: EmotionVector;
  cognitive_patterns: string[];
  analyzed_at: string;
}

// Visual endpoints
export interface GenerateVisualRequest {
  session_id: string;
  style?: string;
}

export interface GenerateVisualResponse {
  visual_id: string;
  session_id: string;
  image_url: string;
  image_type: string;
  visual_params: VisualParams;
  generated_at: string;
}

export interface UpdateVisualRequest {
  session_id: string;
  base_visual_id?: string;
  parameter_deltas: Partial<VisualParams>;
  variant_name?: string;
}

export interface UpdateVisualResponse extends GenerateVisualResponse {
  variant_name?: string;
  parameter_deltas: Partial<VisualParams>;
}

// History endpoints
export interface HistoryResponse {
  sessions: SessionHistoryItem[];
  total: number;
  limit: number;
  offset: number;
}

export interface SessionHistoryItem {
  id: string;
  started_at: string;
  ended_at?: string;
  summary?: string;
  primary_emotion?: string;
  emotion_vector?: EmotionVector;
  thumbnail_url?: string;
  message_count: number;
}

export interface HistoryStatsResponse {
  total_sessions: number;
  total_messages: number;
  emotion_distribution: EmotionVector;
  most_common_themes: string[];
  average_session_duration_seconds: number;
}

// Crisis endpoints
export interface CrisisCheckRequest {
  text: string;
}

export interface CrisisCheckResponse extends CrisisDetectionResult {
  resources?: CrisisResources;
}

export interface CrisisResources {
  lifeline: string;
  crisis_text: string;
  urls: string[];
}
