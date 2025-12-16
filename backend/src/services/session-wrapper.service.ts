// Session Service Wrapper - Object-based API for controllers
// Compatible with supabase_setup.sql schema

import supabase from "../config/db";
import { Session, Message, EmotionData } from "../types";

export interface CreateSessionData {
    user_id?: string;
}

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

export const sessionService = {
    /**
     * Create a new session
     */
    async createSession(userId?: string): Promise<Session> {
        const { data, error } = await supabase
            .from("sessions")
            .insert({
                user_id: userId || null
                // Note: no 'status' column in actual schema
            })
            .select()
            .single();

        if (error) {
            console.error("Create session error:", error);
            throw new Error("Failed to create session");
        }

        return data;
    },

    /**
     * Get session by ID
     */
    async getSession(id: string): Promise<Session | null> {
        const { data, error } = await supabase
            .from("sessions")
            .select("*")
            .eq("id", id)
            .single();

        if (error) {
            console.error("Get session error:", error);
            return null;
        }

        return data;
    },

    /**
     * Get all sessions (paginated)
     */
    async getSessions(limit: number = 50, offset: number = 0): Promise<Session[]> {
        const { data, error } = await supabase
            .from("sessions")
            .select("*")
            .order("created_at", { ascending: false })
            .range(offset, offset + limit - 1);

        if (error) {
            console.error("Get sessions error:", error);
            return [];
        }

        return data || [];
    },

    /**
     * Add a message to session
     * Note: schema uses 'content' not 'text', no sequence_number
     */
    async addMessage(
        sessionId: string,
        role: 'user' | 'assistant',
        text: string,
        emotionSnapshot?: any,
        patternsDetected?: string[]
    ): Promise<Message> {
        const { data, error } = await supabase
            .from("messages")
            .insert({
                session_id: sessionId,
                role,
                content: text,  // schema uses 'content' not 'text'
                emotion_snapshot: emotionSnapshot,
                patterns_detected: patternsDetected
            })
            .select()
            .single();

        if (error) {
            console.error("Add message error:", error);
            throw new Error("Failed to add message");
        }

        return data;
    },

    /**
     * Get messages for session
     */
    async getMessages(sessionId: string, limit: number = 100, offset: number = 0): Promise<Message[]> {
        const { data, error } = await supabase
            .from("messages")
            .select("*")
            .eq("session_id", sessionId)
            .order("created_at", { ascending: true })  // order by created_at instead of sequence_number
            .range(offset, offset + limit - 1);

        if (error) {
            console.error("Get messages error:", error);
            return [];
        }

        return data || [];
    },

    /**
     * Complete session with summary and emotions
     */
    async completeSession(
        id: string,
        summary: any,
        emotionVector: Record<string, number>
    ): Promise<Session> {
        // Get primary emotion
        let primaryEmotion = 'calm';
        let maxScore = 0;
        for (const [emotion, score] of Object.entries(emotionVector)) {
            if (score > maxScore) {
                maxScore = score;
                primaryEmotion = emotion;
            }
        }

        const { data, error } = await supabase
            .from("sessions")
            .update({
                ended_at: new Date().toISOString(),
                summary: summary.summary || summary,
                themes: summary.themes || [],
                primary_emotion: primaryEmotion,
                emotion_data: emotionVector,  // schema uses 'emotion_data' not 'emotion_vector'
                metaphor: summary.metaphor || null
            })
            .eq("id", id)
            .select()
            .single();

        if (error) {
            console.error("Complete session error:", error);
            throw new Error("Failed to complete session");
        }

        return data;
    },

    /**
     * Save a visual to session
     * Note: 'visuals' table may not exist in supabase_setup.sql
     * Storing directly in sessions table instead
     */
    async saveVisual(
        sessionId: string,
        imageUrl: string,
        imageType: 'base' | 'reframed' | 'variant',
        visualParams: any,
        fiboJson: any,
        variantName?: string
    ): Promise<any> {
        // Update session with image URL directly
        const updates: any = {
            visual_params: visualParams
        };
        
        if (imageType === 'base') {
            updates.original_image_url = imageUrl;
        } else {
            updates.reframed_image_url = imageUrl;
            updates.reframe_params = fiboJson;
        }

        const { data, error } = await supabase
            .from("sessions")
            .update(updates)
            .eq("id", sessionId)
            .select()
            .single();

        if (error) {
            console.error("Save visual error:", error);
            throw new Error("Failed to save visual");
        }

        return {
            id: data.id,
            session_id: sessionId,
            image_url: imageUrl,
            image_type: imageType,
            visual_params: visualParams,
            fibo_json: fiboJson
        };
    },

    /**
     * Get visuals for session (from session record)
     */
    async getVisuals(sessionId: string): Promise<Visual[]> {
        const session = await this.getSession(sessionId);
        if (!session) return [];

        const visuals: Visual[] = [];
        
        if (session.original_image_url) {
            visuals.push({
                id: `${sessionId}-base`,
                session_id: sessionId,
                image_url: session.original_image_url,
                image_type: 'base',
                visual_params: session.visual_params || {},
                fibo_json: {},
                generated_at: session.created_at
            });
        }

        if (session.reframed_image_url) {
            visuals.push({
                id: `${sessionId}-reframed`,
                session_id: sessionId,
                image_url: session.reframed_image_url,
                image_type: 'reframed',
                visual_params: session.reframe_params || {},
                fibo_json: session.reframe_params || {},
                generated_at: session.updated_at
            });
        }

        return visuals;
    },

    /**
     * Update session with image URLs
     */
    async updateSessionImages(
        sessionId: string,
        originalUrl?: string,
        reframedUrl?: string
    ): Promise<void> {
        const updates: any = {};
        if (originalUrl) updates.original_image_url = originalUrl;
        if (reframedUrl) updates.reframed_image_url = reframedUrl;

        await supabase
            .from("sessions")
            .update(updates)
            .eq("id", sessionId);
    },

    /**
     * Update session with new image and visual params
     */
    async updateSessionImage(
        sessionId: string,
        imageUrl: string,
        visualParams?: any
    ): Promise<void> {
        const updates: any = {
            original_image_url: imageUrl
        };
        
        if (visualParams) {
            updates.visual_params = visualParams;
        }

        const { error } = await supabase
            .from("sessions")
            .update(updates)
            .eq("id", sessionId);

        if (error) {
            console.error("Update session image error:", error);
            throw new Error("Failed to update session image");
        }
    },

    /**
     * Update session emotion data
     */
    async updateEmotionData(
        sessionId: string,
        emotionData: Record<string, number>,
        primaryEmotion?: string
    ): Promise<void> {
        const updates: any = {
            emotion_data: emotionData
        };
        
        if (primaryEmotion) {
            updates.primary_emotion = primaryEmotion;
        }

        await supabase
            .from("sessions")
            .update(updates)
            .eq("id", sessionId);
    },

    /**
     * Set crisis detected flag
     */
    async setCrisisDetected(sessionId: string, detected: boolean): Promise<void> {
        await supabase
            .from("sessions")
            .update({ crisis_detected: detected })
            .eq("id", sessionId);
    }
};
