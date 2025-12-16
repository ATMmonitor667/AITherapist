// Gemini Service - Emotion Analysis

import { GoogleGenerativeAI } from "@google/generative-ai";
import { EmotionData } from "../types";

const apiKey = process.env.GEMINI_API_KEY || "";

if (apiKey) {
  console.log(`✅ Gemini API Key loaded (${apiKey.substring(0, 8)}...)`);
}

const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
  generationConfig: { responseMimeType: "application/json" }
});

const ANALYSIS_PROMPT = `
Analyze the emotional content of the following journal text.
Return a JSON object with:
- primary_emotion: One of [joy, sadness, anger, fear, anxiety, peace, hope, love, loneliness, grief, frustration, confusion, determination, gratitude, calm]
- secondary_emotion: One of [elation, contentment, relief, nostalgia, overwhelm, betrayal, envy, pride, uncertainty, resilience, clarity, annoyance, excitement]
- intensity: 0.0 to 1.0
- confidence: 0.0 to 1.0
- scene_metaphor: A short visual description of a scene matching the emotion (e.g. "a stormy ocean at night" or "a sunlit peaceful meadow")
`;

// Helper to delay execution
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function analyzeEmotionGemini(text: string): Promise<EmotionData> {
  const maxRetries = 3;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`[Gemini Emotion] Attempt ${attempt}/${maxRetries}`);

      const result = await model.generateContent([
        ANALYSIS_PROMPT,
        `Text: "${text}"`
      ]);

      const response = result.response.text();
      const data = JSON.parse(response) as EmotionData;

      console.log(`[Gemini Emotion] Analysis complete: ${data.primary_emotion}`);
      return data;

    } catch (error: any) {
      console.error(`[Gemini Emotion] Error (attempt ${attempt}):`, error.message);

      const isRateLimit = error.message?.includes("quota") ||
        error.message?.includes("rate") ||
        error.message?.includes("429") ||
        error.message?.includes("Resource has been exhausted");

      if (isRateLimit && attempt < maxRetries) {
        const waitTime = attempt * 2000;
        console.log(`[Gemini Emotion] Rate limited. Waiting ${waitTime}ms...`);
        await delay(waitTime);
        continue;
      }

      if (!isRateLimit) break;
    }
  }

  // Return neutral fallback
  console.log("[Gemini Emotion] Falling back to neutral emotion");
  return {
    primary_emotion: "calm",
    secondary_emotion: "clarity",
    intensity: 0.1,
    confidence: 0.5,
    scene_metaphor: "A quiet, fog-covered lake"
  };
}

const METAPHOR_PROMPT = `
Given the user is feeling "{emotion}" about the text: "{text}".
Generate a JSON object with:
- scene_metaphor: A vivid visual description of a landscape reflecting this emotion.
- secondary_emotion: A nuanced secondary emotion derived from the text.
- confidence: 0.8 to 1.0 (since we detected the primary emotion via ML)
`;

export async function generateVisualMetadataGemini(primaryEmotion: string, text: string): Promise<Partial<EmotionData>> {
  const maxRetries = 2;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const result = await model.generateContent([
        METAPHOR_PROMPT.replace("{emotion}", primaryEmotion).replace("{text}", text)
      ]);

      const response = result.response.text();
      return JSON.parse(response) as Partial<EmotionData>;

    } catch (error: any) {
      console.error(`[Gemini Metaphor] Error (attempt ${attempt}):`, error.message);

      const isRateLimit = error.message?.includes("quota") ||
        error.message?.includes("rate") ||
        error.message?.includes("429");

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

// Chat response generation with Gemini
const chatModel = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

const SYSTEM_PROMPT = `You are an empathetic, reflective journaling companion named Echo. 
Your goal is to help the user explore their thoughts and feelings through conversation.

GUIDELINES:
- Listen attentively and mirror the user's emotions.
- Ask open-ended, reflective questions to deepen the user's understanding.
- Validate their feelings (e.g., "It makes sense that you feel that way").
- Avoid giving advice, fixing problems, or acting as a medical professional.
- Use warm, non-clinical language.
- Keep responses concise (2-4 sentences usually).
- If the user seems overwhelmed, suggest breaking things down.

IMPORTANT:
- You are NOT a licensed therapist. Do not diagnose or prescribe.
- If the user expresses self-harm or severe crisis, gently urge them to seek professional help.`;

export async function generateChatResponseGemini(conversationHistory: string, userMessage: string): Promise<string> {
  const maxRetries = 3;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`[Gemini Chat] Attempt ${attempt}/${maxRetries}`);

      const prompt = SYSTEM_PROMPT + "\n\n--- CONVERSATION ---\n" + conversationHistory +
        `User: ${userMessage}\n\nEcho (respond with 2-4 empathetic sentences):`;

      const result = await chatModel.generateContent(prompt);
      let response = result.response.text().trim();

      // Clean up response
      if (response.startsWith("Echo:")) {
        response = response.substring(5).trim();
      }

      console.log(`[Gemini Chat] Response received (${response.length} chars)`);
      return response;

    } catch (error: any) {
      console.error(`[Gemini Chat] Error (attempt ${attempt}):`, error.message);

      const isRateLimit = error.message?.includes("quota") ||
        error.message?.includes("rate") ||
        error.message?.includes("429");

      if (isRateLimit && attempt < maxRetries) {
        await delay(attempt * 2000);
        continue;
      }

      if (!isRateLimit) break;
    }
  }

  return "I'm listening, but I'm having a little trouble thinking of a response right now. Could you tell me more?";
}
