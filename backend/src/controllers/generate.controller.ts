// Generate Controller - Logic for image generation & reframing

import { Request, Response } from 'express';
import { generateImage, reframeImage } from '../services/fibo.service';
import { updateSession } from '../services/session.service';
import { mapEmotionToVisualParams } from '../services/emotion.service';
import { ApiResponse, Session } from '../types';

/**
 * POST /api/generate
 * Generate base image from visual params
 */
export async function generateBaseImage(req: Request, res: Response): Promise<void> {
    try {
        const { session_id, visual_params, scene_metaphor } = req.body;

        if (!session_id || !visual_params) {
            res.status(400).json({
                success: false,
                error: "Session ID and visual params are required"
            } as ApiResponse<null>);
            return;
        }

        const imageUrl = await generateImage(visual_params);

        // Update session
        const session = await updateSession(session_id, {
            original_image_url: imageUrl
            // We might want to store the params used too if they differ
        });

        res.json({
            success: true,
            data: session
        } as ApiResponse<Session>);

    } catch (error) {
        console.error("Generate image error:", error);
        res.status(500).json({
            success: false,
            error: "Failed to generate image"
        } as ApiResponse<null>);
    }
}

/**
 * POST /api/reframe
 * Reframe image based on slider inputs
 */
export async function reframeSession(req: Request, res: Response): Promise<void> {
    try {
        const { session_id, hope_level, intensity_level, original_image_url } = req.body;

        if (!session_id || !original_image_url) {
            res.status(400).json({
                success: false,
                error: "Session ID and original URL are required"
            } as ApiResponse<null>);
            return;
        }

        const reframedUrl = await reframeImage(original_image_url, {
            hope_level,
            intensity_level
        });

        const session = await updateSession(session_id, {
            reframed_image_url: reframedUrl,
            reframe_params: { hope_level, intensity_level }
        });

        res.json({
            success: true,
            data: session
        } as ApiResponse<Session>);

    } catch (error) {
        console.error("Reframe error:", error);
        res.status(500).json({
            success: false,
            error: "Failed to reframe session"
        } as ApiResponse<null>);
    }
}
