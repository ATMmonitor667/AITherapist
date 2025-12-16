// ML Service - Interface to Python Microservice

import axios from 'axios';
import { EmotionData } from '../types';

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:8000';

interface MLResponse {
    primary_emotion: string;
    secondary_emotion: string;
    intensity: number;
    all_scores: Array<{ label: string, score: number }>;
}

export async function analyzeWithML(text: string): Promise<Partial<EmotionData> | null> {
    try {
        const response = await axios.post<MLResponse>(`${ML_SERVICE_URL}/analyze`, {
            text
        });

        const data = response.data;

        return {
            primary_emotion: data.primary_emotion as any,
            secondary_emotion: data.secondary_emotion as any,
            intensity: data.intensity,
            // confidence: data.all_scores[0].score // Map if needed
        };
    } catch (error) {
        console.warn("ML Service unavailable or error:", error);
        return null; // Fallback to Gemini if ML service fails
    }
}
