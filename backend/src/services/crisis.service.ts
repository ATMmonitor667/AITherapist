// Crisis Service - Safety Logic

import { CrisisLog, CreateCrisisLogRequest } from "../types";
import supabase from "../config/db";

const CRISIS_KEYWORDS = [
    "suicide", "kill myself", "end it all", "better off dead",
    "hurt myself", "cutting", "overdose", "die", "death"
];

export interface CrisisResult {
    isCrisis: boolean;
    riskScore: number;
    detectedKeywords: string[];
}

/**
 * Detect crisis pattern in text.
 */
export function detectCrisis(text: string): CrisisResult {
    const lowerText = text.toLowerCase();
    const detectedKeywords = CRISIS_KEYWORDS.filter(keyword => lowerText.includes(keyword));

    // Simple heuristic: if any strong keyword is present
    const isCrisis = detectedKeywords.length > 0;
    const riskScore = isCrisis ? 0.9 : 0.0;

    return {
        isCrisis,
        riskScore,
        detectedKeywords
    };
}

/**
 * Log a crisis event to the database.
 */
export async function logCrisis(data: CreateCrisisLogRequest): Promise<CrisisLog | null> {
    try {
        const { data: log, error } = await supabase
            .from("crisis_logs")
            .insert({
                ...data,
                resources_shown: true
            })
            .select()
            .single();

        if (error) {
            console.error("Error logging crisis:", error);
            return null;
        }

        return log;
    } catch (error) {
        console.error("Crisis logging error:", error);
        return null;
    }
}
