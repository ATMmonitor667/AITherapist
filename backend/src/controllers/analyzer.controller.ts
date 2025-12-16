// Analyzer Controller - Text Analysis Endpoints

import { Request, Response } from 'express';
import { analyzeEmotion } from '../services/openai.service';
import { detectCrisis } from '../services/crisis.service';
import { ApiResponse, EmotionData } from '../types';

/**
 * POST /api/analyze
 * Direct text analysis (useful for testing or non-session analysis)
 */
export async function analyzeJournal(req: Request, res: Response): Promise<void> {
    try {
        const { text } = req.body;

        if (!text) {
            res.status(400).json({
                success: false,
                error: "Text is required"
            } as ApiResponse<null>);
            return;
        }

        const emotionData = await analyzeEmotion(text);
        const crisisResult = detectCrisis(text);

        res.json({
            success: true,
            data: {
                emotion_data: emotionData,
                crisis_detected: crisisResult.isCrisis,
                crisis_details: crisisResult
            }
        } as ApiResponse<any>);

    } catch (error) {
        console.error("Analyze error:", error);
        res.status(500).json({
            success: false,
            error: "Failed to analyze text"
        } as ApiResponse<null>);
    }
}
