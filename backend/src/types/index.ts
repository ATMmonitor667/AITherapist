// Re-export all types
export * from './emotions.types';
export * from './sessions.types';
export * from './api.types';

// Additional types for compatibility
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
