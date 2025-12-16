// Analytics Service - Emotion aggregation and analysis

import { EmotionData } from "../types";

export interface EmotionSnapshot {
    primary_emotion: string;
    secondary_emotion?: string;
    intensity: number;
    confidence?: number;
}

export const analyticsService = {
    /**
     * Analyze emotions in text (simple version - uses patterns)
     */
    analyzeEmotions(text: string): EmotionSnapshot {
        const lowerText = text.toLowerCase();

        // Simple keyword-based analysis (fallback when ML service unavailable)
        const emotionKeywords: Record<string, string[]> = {
            joy: ['happy', 'excited', 'wonderful', 'great', 'amazing', 'love', 'fantastic'],
            sadness: ['sad', 'depressed', 'down', 'unhappy', 'miserable', 'crying', 'tears'],
            anxiety: ['anxious', 'worried', 'nervous', 'stressed', 'overwhelmed', 'panic'],
            anger: ['angry', 'frustrated', 'mad', 'furious', 'annoyed', 'irritated'],
            fear: ['scared', 'afraid', 'terrified', 'frightened', 'fearful'],
            hope: ['hopeful', 'optimistic', 'looking forward', 'better', 'improving'],
            calm: ['calm', 'peaceful', 'relaxed', 'serene', 'tranquil'],
            confusion: ['confused', 'lost', 'uncertain', 'unsure', "don't know"]
        };

        let detectedEmotion = 'calm';
        let maxScore = 0;

        for (const [emotion, keywords] of Object.entries(emotionKeywords)) {
            const score = keywords.filter(kw => lowerText.includes(kw)).length;
            if (score > maxScore) {
                maxScore = score;
                detectedEmotion = emotion;
            }
        }

        // Calculate intensity based on exclamation marks, caps, and repetition
        const exclamations = (text.match(/!/g) || []).length;
        const caps = (text.match(/[A-Z]{2,}/g) || []).length;
        const intensity = Math.min(1, 0.3 + (exclamations * 0.1) + (caps * 0.15) + (maxScore * 0.2));

        return {
            primary_emotion: detectedEmotion,
            intensity,
            confidence: maxScore > 0 ? 0.7 : 0.3
        };
    },

    /**
     * Aggregate multiple emotion snapshots into a single vector
     */
    aggregateEmotions(snapshots: EmotionSnapshot[]): Record<string, number> {
        if (!snapshots || snapshots.length === 0) {
            return { calm: 0.5 };
        }

        const emotionCounts: Record<string, number> = {};
        const emotionIntensities: Record<string, number[]> = {};

        for (const snapshot of snapshots) {
            const emotion = snapshot.primary_emotion;
            emotionCounts[emotion] = (emotionCounts[emotion] || 0) + 1;

            if (!emotionIntensities[emotion]) {
                emotionIntensities[emotion] = [];
            }
            emotionIntensities[emotion].push(snapshot.intensity);
        }

        // Calculate weighted average
        const total = snapshots.length;
        const result: Record<string, number> = {};

        for (const [emotion, count] of Object.entries(emotionCounts)) {
            const avgIntensity = emotionIntensities[emotion].reduce((a, b) => a + b, 0) / count;
            result[emotion] = (count / total) * avgIntensity;
        }

        return result;
    },

    /**
     * Get primary emotion from aggregated vector
     */
    getPrimaryEmotion(emotionVector: Record<string, number>): string {
        let primary = 'calm';
        let maxScore = 0;

        for (const [emotion, score] of Object.entries(emotionVector)) {
            if (score > maxScore) {
                maxScore = score;
                primary = emotion;
            }
        }

        return primary;
    }
};
