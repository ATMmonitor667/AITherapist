// History Controller - Handle history requests

import { Request, Response } from 'express';
import { getSessions, getSessionById } from '../services/session.service';
import { getConversationHistory } from '../services/conversation.service';
import { ApiResponse, Session, Message } from '../types';

/**
 * GET /api/session
 * Get session history
 */
export async function getHistory(req: Request, res: Response): Promise<void> {
    try {
        const limit = parseInt(req.query.limit as string) || 20;
        const offset = parseInt(req.query.offset as string) || 0;

        const sessions = await getSessions(limit, offset);

        res.json({
            success: true,
            data: sessions
        } as ApiResponse<Session[]>);

    } catch (error) {
        console.error("Get history error:", error);
        res.status(500).json({
            success: false,
            error: {
                code: 'HISTORY_FETCH_ERROR',
                message: "Failed to get history"
            }
        } as ApiResponse<null>);
    }
}

/**
 * GET /api/session/:id
 * Get single session
 */
export async function getSession(req: Request, res: Response): Promise<void> {
    try {
        const { id } = req.params;

        if (!id) {
            res.status(400).json({
                success: false,
                error: {
                    code: 'MISSING_SESSION_ID',
                    message: "Session ID is required"
                }
            } as ApiResponse<null>);
            return;
        }

        const session = await getSessionById(id);

        if (!session) {
            res.status(404).json({
                success: false,
                error: {
                    code: 'SESSION_NOT_FOUND',
                    message: "Session not found"
                }
            } as ApiResponse<null>);
            return;
        }

        res.json({
            success: true,
            data: session
        } as ApiResponse<Session>);

    } catch (error) {
        console.error("Get session error:", error);
        res.status(500).json({
            success: false,
            error: {
                code: 'SESSION_FETCH_ERROR',
                message: "Failed to get session"
            }
        } as ApiResponse<null>);
    }
}
