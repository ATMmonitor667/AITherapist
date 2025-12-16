// Conversation Service - Chat Logic

import supabase from "../config/db";
import { Message, Role, Session, EmotionData } from "../types";
import OpenAI from "openai";
import { analyzeEmotion, generateVisualMetadata } from "./openai.service";
import { detectCrisis } from "./crisis.service";
import { analyzeWithML } from "./ml.service";
import { visualService } from "./visual.service";


// Check API key
const apiKey = process.env.OPENAI_API_KEY || "";
if (!apiKey) {
  console.error("⚠️  WARNING: OPENAI_API_KEY is not set in environment variables!");
} else {
  console.log(`✅ OpenAI API Key loaded for chat (${apiKey.substring(0, 8)}...)`);
}

const openai = new OpenAI({ apiKey });

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

/**
 * Add a message to the conversation history.
 */
export async function addMessage(
  sessionId: string,
  role: Role,
  content: string,
  emotionSnapshot?: EmotionData,
  patternsDetected?: string[]
): Promise<Message | null> {
  try {
    const { data: message, error } = await supabase
      .from("messages")
      .insert({
        session_id: sessionId,
        role,
        content,
        emotion_snapshot: emotionSnapshot,
        patterns_detected: patternsDetected
      })
      .select()
      .single();

    if (error) {
      console.error("Error adding message:", error);
      return null;
    }

    return message;
  } catch (error) {
    console.error("Message creation error:", error);
    return null;
  }
}

/**
 * Get conversation history for a session.
 */
export async function getConversationHistory(sessionId: string): Promise<Message[]> {
  try {
    const { data: messages, error } = await supabase
      .from("messages")
      .select("*")
      .eq("session_id", sessionId)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error fetching history:", error);
      return [];
    }

    return messages || [];
  } catch (error) {
    console.error("History fetch error:", error);
    return [];
  }
}

/**
 * Helper to delay execution
 */
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Generate an AI response based on conversation history with retry logic.
 */
export async function generateAIResponse(sessionId: string, userMessage: string): Promise<string> {
  // Check if API key is available
  if (!apiKey) {
    console.error("❌ Cannot generate AI response: OPENAI_API_KEY is not set");
    return "I apologize, but I'm not properly configured at the moment. Please check the server configuration.";
  }

  const maxRetries = 3;
  let lastError: any = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`[OpenAI Chat] Attempt ${attempt}/${maxRetries} - Generating response for session: ${sessionId}`);

      // 1. Get history
      const history = await getConversationHistory(sessionId);
      console.log(`[OpenAI Chat] Context size: ${history.length} messages`);

      // 2. Build messages array for OpenAI
      const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
        { role: "system", content: SYSTEM_PROMPT }
      ];

      // Add recent history (last 20 messages)
      const recentHistory = history.slice(-20);
      for (const msg of recentHistory) {
        messages.push({
          role: msg.role === 'user' ? 'user' : 'assistant',
          content: msg.content
        });
      }

      // Add current message
      messages.push({ role: "user", content: userMessage });

      console.log(`[OpenAI Chat] Sending request to API...`);

      // 3. Generate response
      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages,
        temperature: 0.8,
        max_tokens: 300,
        presence_penalty: 0.1,
        frequency_penalty: 0.1
      });

      const content = response.choices[0]?.message?.content;
      if (!content) throw new Error("No response content");

      console.log(`[OpenAI Chat] Response received (${content.length} chars)`);

      return content.trim();

    } catch (error: any) {
      lastError = error;
      console.error(`❌ AI response generation error (attempt ${attempt}):`, error.message);

      // Check if it's a rate limit error - wait and retry
      const isRateLimit = error.status === 429 ||
        error.message?.includes("rate") ||
        error.message?.includes("quota");

      if (isRateLimit && attempt < maxRetries) {
        const waitTime = attempt * 2000; // 2s, 4s, 6s
        console.log(`[OpenAI Chat] Rate limited. Waiting ${waitTime}ms before retry...`);
        await delay(waitTime);
        continue;
      }

      // Don't retry non-rate-limit errors
      if (!isRateLimit) {
        break;
      }
    }
  }

  // All retries failed - return appropriate error message
  console.error("❌ All OpenAI attempts failed:", {
    message: lastError?.message,
    status: lastError?.status
  });

  // More specific error messages
  if (lastError?.status === 401 || lastError?.message?.includes("API key")) {
    return "I'm having trouble connecting. Please check that the API key is valid.";
  }
  if (lastError?.status === 429 || lastError?.message?.includes("rate")) {
    return "I'm a bit overwhelmed right now. The service is experiencing high demand - please try again in a minute.";
  }
  if (lastError?.message?.includes("content_policy") || lastError?.message?.includes("safety")) {
    return "I want to make sure I respond thoughtfully. Could you rephrase what's on your mind?";
  }

  return "I'm listening, but I'm having a little trouble thinking of a response right now. Could you tell me more?";
}

/**
 * Process a user message: Save it, Analyze it, Get AI response, Save AI response.
 */
export async function processUserMessage(sessionId: string, content: string): Promise<{
  userMessage: Message;
  aiMessage: Message;
  emotionData: EmotionData;
  crisisDetected: boolean;
} | null> {
  try {
    console.log(`[Process] Starting message processing for session: ${sessionId}`);

    // 1. Check Crisis (Fastest check)
    const crisisResult = detectCrisis(content);
    console.log(`[Process] Crisis check: ${crisisResult.isCrisis ? 'DETECTED' : 'OK'}`);

    // 2. Hybrid Emotion Analysis
    let emotionData: EmotionData;

    try {
      // Try Advanced ML Service first
      console.log(`[Process] Attempting ML emotion analysis...`);
      const mlResult = await analyzeWithML(content);

      if (mlResult && mlResult.primary_emotion) {
        console.log(`[Process] ML detected: ${mlResult.primary_emotion}`);
        // If ML works, use OpenAI to just generate the visual metaphor context
        const metaphorData = await generateVisualMetadata(mlResult.primary_emotion, content);

        emotionData = {
          primary_emotion: mlResult.primary_emotion,
          secondary_emotion: mlResult.secondary_emotion || metaphorData.secondary_emotion || "neutral",
          intensity: mlResult.intensity || 0.5,
          confidence: 0.9,
          scene_metaphor: metaphorData.scene_metaphor || `A representation of ${mlResult.primary_emotion}`
        };
      } else {
        // Fallback to OpenAI All-in-One
        console.log(`[Process] ML failed, falling back to OpenAI analysis...`);
        emotionData = await analyzeEmotion(content);
      }
    } catch (err) {
      console.warn("[Process] Analysis failed, using OpenAI fallback:", err);
      emotionData = await analyzeEmotion(content);
    }

    // NEW CODE
    console.log(`[Process] Emotion analysis complete: ${emotionData.primary_emotion}`);

    console.log(`[Process] Generating visual for emotion: ${emotionData.primary_emotion}`);
    // Convert EmotionData to emotion vector format
    const emotionVector: Record<string, number> = {
      [emotionData.primary_emotion]: emotionData.intensity,
      [emotionData.secondary_emotion]: emotionData.intensity * 0.5
    };
    const visualParams = visualService.emotionsToVisualParams(emotionVector);

    // Use the scene metaphor from emotionData if available
    const metaphor = emotionData.scene_metaphor || `A representation of ${emotionData.primary_emotion}`;
    const fiboJson = visualService.buildFiboJson(visualParams, metaphor);

    // Generate the image URL
    const imageUrl = await visualService.generateImage(fiboJson);
    console.log(`[Process] Visual generated: ${imageUrl}`);

    // 2. Update Session in Database
    const { error: sessionUpdateError } = await supabase
      .from("sessions")
      .update({
        original_image_url: imageUrl,
        visual_params: visualParams
      })
      .eq("id", sessionId);
    if (sessionUpdateError) {
      console.error("Failed to update session with visual:", sessionUpdateError);
    } else {
      console.log(`[Process] Session updated with new visual`);
    }

    //

    // 3. Save User Message
    const userMsg = await addMessage(
      sessionId,
      'user',
      content,
      emotionData,
      crisisResult.detectedKeywords
    );

    if (!userMsg) throw new Error("Failed to save user message");
    console.log(`[Process] User message saved`);

    // 4. Generate Response
    let responseContent = "";

    if (crisisResult.isCrisis) {
      responseContent = "I hear how much pain you're in, and I want you to be safe. Please reach out to a professional or a crisis support line right away. You don't have to carry this alone.";
    } else {
      responseContent = await generateAIResponse(sessionId, content);
    }

    // 5. Save AI Message
    const aiMsg = await addMessage(sessionId, 'assistant', responseContent);

    if (!aiMsg) throw new Error("Failed to save AI message");
    console.log(`[Process] AI message saved`);

    return {
      userMessage: userMsg,
      aiMessage: aiMsg,
      emotionData,
      crisisDetected: crisisResult.isCrisis
    };

  } catch (error) {
    console.error("❌ Process message error:", error);
    return null;
  }
}
