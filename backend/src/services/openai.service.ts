// OpenAI Service - Emotion Analysis

import OpenAI from "openai";
import { EmotionData } from "../types";

const apiKey = process.env.OPENAI_API_KEY || "";

if (!apiKey) {
  console.error("⚠️  WARNING: OPENAI_API_KEY is not set in environment variables!");
} else {
  console.log(`✅ OpenAI API Key loaded (${apiKey.substring(0, 8)}...)`);
}

const openai = new OpenAI({ apiKey });

const ANALYSIS_PROMPT = `Analyze the emotional content of the following journal text.
Return a JSON object with these exact fields:
- primary_emotion: One of [joy, sadness, anger, fear, anxiety, peace, hope, love, loneliness, grief, frustration, confusion, determination, gratitude, calm]
- secondary_emotion: One of [elation, contentment, relief, nostalgia, overwhelm, betrayal, envy, pride, uncertainty, resilience, clarity, annoyance, excitement]
- intensity: A number from 0.0 to 1.0
- confidence: A number from 0.0 to 1.0
- scene_metaphor: A short visual description of a scene matching the emotion (e.g. "a stormy ocean at night" or "a sunlit peaceful meadow")

Return ONLY valid JSON, no markdown or extra text.`;

// Helper to delay execution
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function analyzeEmotion(text: string): Promise<EmotionData> {
  const maxRetries = 3;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`[OpenAI Emotion] Attempt ${attempt}/${maxRetries}`);

      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: ANALYSIS_PROMPT },
          { role: "user", content: `Text: "${text}"` }
        ],
        response_format: { type: "json_object" },
        temperature: 0.7,
        max_tokens: 200
      });

      const content = response.choices[0]?.message?.content;
      if (!content) throw new Error("No response content");

      const data = JSON.parse(content) as EmotionData;
      console.log(`[OpenAI Emotion] Analysis complete: ${data.primary_emotion}`);
      return data;

    } catch (error: any) {
      console.error(`[OpenAI Emotion] Error (attempt ${attempt}):`, error.message);

      const isRateLimit = error.status === 429 ||
        error.message?.includes("rate") ||
        error.message?.includes("quota");

      if (isRateLimit && attempt < maxRetries) {
        const waitTime = attempt * 2000;
        console.log(`[OpenAI Emotion] Rate limited. Waiting ${waitTime}ms...`);
        await delay(waitTime);
        continue;
      }

      if (!isRateLimit) break;
    }
  }

  // Return neutral fallback
  console.log("[OpenAI Emotion] Falling back to neutral emotion");
  return {
    primary_emotion: "calm",
    secondary_emotion: "clarity",
    intensity: 0.1,
    confidence: 0.5,
    scene_metaphor: "A quiet, fog-covered lake"
  };
}

const METAPHOR_PROMPT = `Given the user's primary emotion and text, generate a JSON object with:
- scene_metaphor: A vivid visual description of a landscape reflecting this emotion
- secondary_emotion: A nuanced secondary emotion derived from the text
- confidence: A number between 0.8 to 1.0

Return ONLY valid JSON, no markdown or extra text.`;

export async function generateVisualMetadata(primaryEmotion: string, text: string): Promise<Partial<EmotionData>> {
  const maxRetries = 2;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: METAPHOR_PROMPT },
          { role: "user", content: `Primary emotion: ${primaryEmotion}\nText: "${text}"` }
        ],
        response_format: { type: "json_object" },
        temperature: 0.8,
        max_tokens: 150
      });

      const content = response.choices[0]?.message?.content;
      if (!content) throw new Error("No response content");

      return JSON.parse(content) as Partial<EmotionData>;

    } catch (error: any) {
      console.error(`[OpenAI Metaphor] Error (attempt ${attempt}):`, error.message);

      const isRateLimit = error.status === 429;
      if (isRateLimit && attempt < maxRetries) {
        await delay(attempt * 1500);
        continue;
      }
      break;
    }
  }

  return {
    scene_metaphor: `A landscape representing ${primaryEmotion}`,
    secondary_emotion: "uncertainty",
    confidence: 0.5
  };
}
