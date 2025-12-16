// Routes Index - Aggregate all API routes

import { Router, Request, Response } from 'express';
import sessionRoutes from './session.routes';
import visualRoutes from './visual.routes';
import { visualService, sessionService } from '../services';

const router = Router();

// Health check for API
router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// EchoScape Routes
router.use('/session', sessionRoutes);
router.use('/visual', visualRoutes);

// Reframe endpoint (used by frontend)
router.post('/reframe', async (req: Request, res: Response) => {
  try {
    const { session_id, hope_level, intensity_level, original_image_url } = req.body;

    if (!session_id) {
      res.status(400).json({ success: false, error: "session_id is required" });
      return;
    }

    // Get session
    const session = await sessionService.getSession(session_id);
    if (!session) {
      res.status(404).json({ success: false, error: "Session not found" });
      return;
    }

    // Get base visual params or create defaults
    const visuals = await sessionService.getVisuals(session_id);
    let baseVisual = visuals.find(v => v.image_type === 'base');

    const baseParams = baseVisual?.visual_params || {
      scene_type: 'abstract_landscape',
      emotion: session.primary_emotion || 'calm',
      camera_angle: 'medium',
      light_level: 0.5,
      color_palette: 'neutral',
      openness: 0.5,
      contrast: 0.5,
      warmth: 0.5
    };

    // Calculate deltas from slider values (0-1 scale)
    const deltas = {
      hope: hope_level - 0.5, // Convert 0-1 to -0.5 to +0.5 delta
      intensity: intensity_level - 0.5
    };

    // Apply reframe
    const newParams = visualService.applyReframeDeltas(baseParams, deltas);

    // Build FIBO JSON
    const metaphor = session.metaphor || 'A reframed perspective';
    const fiboJson = visualService.buildFiboJson(newParams, metaphor);

    // Generate new image
    const newImageUrl = await visualService.generateImage(fiboJson);

    // Save reframed visual
    await sessionService.saveVisual(
      session_id,
      newImageUrl,
      'reframed',
      newParams,
      fiboJson,
      `hope-${Math.round(hope_level * 100)}-intensity-${Math.round(intensity_level * 100)}`
    );

    // Return updated session
    const updatedSession = await sessionService.getSession(session_id);

    res.json({
      success: true,
      data: {
        ...updatedSession,
        reframed_image_url: newImageUrl
      }
    });

  } catch (error) {
    console.error("Reframe error:", error);
    res.status(500).json({ success: false, error: "Failed to reframe" });
  }
});

// History endpoint for galaxy view
router.get('/history', async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = parseInt(req.query.offset as string) || 0;

    const sessions = await sessionService.getSessions(limit, offset);

    res.json({
      success: true,
      data: sessions
    });
  } catch (error) {
    console.error("History error:", error);
    res.status(500).json({ success: false, error: "Failed to get history" });
  }
});

export default router;
