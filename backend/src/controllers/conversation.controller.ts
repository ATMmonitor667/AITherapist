// Conversation Controller - Chat Endpoints

import { Request, Response } from "express";
import {
    processUserMessage,
    getConversationHistory
} from "../services/conversation.service";
import {
    createSession,
    getSessionById,
    updateSession,
    getSessions
} from "../services/session.service";
import { ApiResponse, Session, Message } from "../types";

/**
 * POST /api/session/start
 * Start a new chat session.
 */
export async function startSession(req: Request, res: Response): Promise<void> {
    try {
        // Extract user ID from authenticated request
        const userId = (req as any).user?.id;

        if (!userId) {
            res.status(401).json({
                success: false,
                error: {
                    code: 'UNAUTHORIZED',
                    message: "User not authenticated"
                }
            } as ApiResponse<null>);
            return;
        }

        // Create a new session in DB
        // Initialize with defaults for a new chat
        const session = await createSession({
            journal_text: "", // Will be filled as conversation progresses (optional)
            emotion_data: {
                primary_emotion: "calm",
                secondary_emotion: "clarity",
                intensity: 0.1,
                confidence: 0.0,
                scene_metaphor: "A blank canvas awaiting colors"
            },
            visual_params: {
                scene_type: "abstract",
                emotion: "calm",
                camera_angle: "medium",
                light_level: 0.5,
                color_palette: "neutral_gray",
                openness: 0.5,
                contrast: 0.5
            },
            original_image_url: "",
            crisis_detected: false
        }, userId);

        if (!session) {
            res.status(500).json({
                success: false,
                error: {
                    code: 'SESSION_CREATION_FAILED',
                    message: "Failed to create session"
                }
            } as ApiResponse<null>);
            return;
        }

        res.json({
            success: true,
            data: session,
            message: "Session started"
        } as ApiResponse<Session>);

    } catch (error) {
        console.error("Start session error:", error);
        res.status(500).json({
            success: false,
            error: {
                code: 'SESSION_START_ERROR',
                message: "Failed to start session"
            }
        } as ApiResponse<null>);
    }
}

/**
 * POST /api/session/:id/message
 * Send a message to the AI coach.
 */
export async function sendMessage(req: Request, res: Response): Promise<void> {
    try {
        const { id } = req.params;
        const { content } = req.body;

        if (!id || !content) {
            res.status(400).json({
                success: false,
                error: {
                    code: 'MISSING_PARAMETERS',
                    message: "Session ID and content are required"
                }
            } as ApiResponse<null>);
            return;
        }

        // Process message (Analyze -> Save -> AI Respond -> Save)
        console.log(`[Controller] Processing message for session ${id}: "${content.substring(0, 50)}..."`);

        let result;
        try {
            result = await processUserMessage(id, content);
        } catch (processError: any) {
            console.error(`[Controller] Error in processUserMessage:`, processError);
            // Even if processing fails, return a helpful error response
            res.status(500).json({
                success: false,
                error: {
                    code: 'MESSAGE_PROCESSING_ERROR',
                    message: processError?.message || "Failed to process message. Please try again.",
                    details: processError?.stack
                }
            } as ApiResponse<null>);
            return;
        }

        if (!result) {
            console.error(`[Controller] processUserMessage returned null for session ${id}`);
            res.status(500).json({
                success: false,
                error: {
                    code: 'MESSAGE_PROCESSING_FAILED',
                    message: "Failed to process message. The AI may be unavailable."
                }
            } as ApiResponse<null>);
            return;
        }

        // Validate that we have an AI message
        if (!result.aiMessage || !result.aiMessage.content) {
            console.error(`[Controller] AI message is missing or empty for session ${id}`);
            res.status(500).json({
                success: false,
                error: {
                    code: 'AI_RESPONSE_MISSING',
                    message: "The AI did not generate a response. Please try again."
                }
            } as ApiResponse<null>);
            return;
        }

        console.log(`[Controller] Message processed successfully. AI response: "${result.aiMessage.content.substring(0, 100)}..."`);

        // Fetch the latest session data to ensure frontend gets the new image URL
        const updatedSession = await getSessionById(id);
        res.json({
            success: true,
            data: {
                ...result,
                session: updatedSession // Include the full updated session object
            }
        } as ApiResponse<typeof result & { session: Session }>);



    } catch (error: any) {
        console.error("Send message error:", error);
        res.status(500).json({
            success: false,
            error: {
                code: 'SEND_MESSAGE_ERROR',
                message: error?.message || "Failed to send message"
            }
        } as ApiResponse<null>);
    }
}

/**
 * GET /api/session/:id/history
 * Get chat history for a session.
 */
export async function getHistory(req: Request, res: Response): Promise<void> {
    try {
        const { id } = req.params;

        if (!id) {
            res.status(400).json({
                success: false,
                error: "Session ID is required"
            } as ApiResponse<null>);
            return;
        }

        const messages = await getConversationHistory(id);

        res.json({
            success: true,
            data: messages
        } as ApiResponse<Message[]>);

    } catch (error) {
        console.error("Get history error:", error);
        res.status(500).json({
            success: false,
            error: "Failed to get history"
        } as ApiResponse<null>);
    }
}

/**
 * POST /api/session/:id/end
 * End a session and trigger summary generation.
 */
export async function endSession(req: Request, res: Response): Promise<void> {
    try {
        const { id } = req.params;

        if (!id) {
            res.status(400).json({
                success: false,
                error: "Session ID is required"
            } as ApiResponse<null>);
            return;
        }

        // Mark session as ended
        const updatedSession = await updateSession(id, {
            ended_at: new Date().toISOString()
            // TODO: Trigger summary generation logic here in future step
            // For now just marking ended
        });

        if (!updatedSession) {
            res.status(500).json({
                success: false,
                error: "Failed to end session"
            } as ApiResponse<null>);
            return;
        }

        res.json({
            success: true,
            data: updatedSession,
            message: "Session ended"
        } as ApiResponse<Session>);

    } catch (error) {
        console.error("End session error:", error);
        res.status(500).json({
            success: false,
            error: "Failed to end session"
        } as ApiResponse<null>);
    }
}


/**
 * GET /api/session
 * List all sessions (for history/galaxy view).
 */
export async function listSessions(req: Request, res: Response): Promise<void> {
    try {
        const userId = (req as any).user?.id;
        const limit = parseInt(req.query.limit as string) || 50;
        const offset = parseInt(req.query.offset as string) || 0;

        const sessions = await getSessions(limit, offset, userId);

        res.json({
            success: true,
            data: sessions
        } as ApiResponse<Session[]>);

    } catch (error) {
        console.error("List sessions error:", error);
        res.status(500).json({
            success: false,
            error: "Failed to list sessions"
        } as ApiResponse<null>);
    }
}
