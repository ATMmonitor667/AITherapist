// Visual Controller - Handle visual generation API requests

import { Request, Response, NextFunction } from 'express';
import { sessionService, visualService, analyticsService } from '../services';
import { AppError } from '../middleware/errorHandler';

export const visualController = {
  /**
   * POST /api/v1/visual/generate
   * Generate base visual for a session
   */
  async generateVisual(req: Request, res: Response, next: NextFunction) {
    try {
      const { session_id, style } = req.body;

      if (!session_id) {
        throw new AppError('session_id is required', 400, 'VALIDATION_ERROR');
      }

      // Get session
      const session = await sessionService.getSession(session_id);
      if (!session) {
        throw new AppError('Session not found', 404, 'NOT_FOUND');
      }

      // Get emotion vector (from session or calculate from messages)
      let emotionVector = (session as any).emotion_vector || session.emotion_data;
      if (!emotionVector) {
        const messages = await sessionService.getMessages(session_id);
        const emotionSnapshots = messages
          .filter((m: any) => m.role === 'user' && m.emotion_snapshot)
          .map((m: any) => m.emotion_snapshot!);
        emotionVector = analyticsService.aggregateEmotions(emotionSnapshots);
      }

      // Get metaphor
      const metaphor = session.metaphor || 'A moment of reflection and self-discovery';

      // Map emotions to visual params
      const visualParams = visualService.emotionsToVisualParams(emotionVector);

      // Build FIBO JSON
      const fiboJson = visualService.buildFiboJson(visualParams, metaphor);

      // Generate image
      const imageUrl = await visualService.generateImage(fiboJson);

      // Save visual
      const visual = await sessionService.saveVisual(
        session_id,
        imageUrl,
        'base',
        visualParams,
        fiboJson
      );

      res.status(201).json({
        success: true,
        data: {
          visual_id: visual.id,
          session_id,
          image_url: imageUrl,
          image_type: 'base',
          visual_params: visualParams,
          fibo_json: fiboJson,
          generated_at: visual.generated_at
        },
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * POST /api/v1/visual/update
   * Generate reframed visual with parameter adjustments
   */
  async updateVisual(req: Request, res: Response, next: NextFunction) {
    try {
      const { session_id, base_visual_id, parameter_deltas, variant_name } = req.body;

      if (!session_id) {
        throw new AppError('session_id is required', 400, 'VALIDATION_ERROR');
      }

      if (!parameter_deltas || Object.keys(parameter_deltas).length === 0) {
        throw new AppError('parameter_deltas is required', 400, 'VALIDATION_ERROR');
      }

      // Get session
      const session = await sessionService.getSession(session_id);
      if (!session) {
        throw new AppError('Session not found', 404, 'NOT_FOUND');
      }

      // Get base visual (latest if not specified)
      const visuals = await sessionService.getVisuals(session_id);
      let baseVisual = visuals.find((v: any) => v.id === base_visual_id);
      if (!baseVisual) {
        baseVisual = visuals.find((v: any) => v.image_type === 'base');
      }
      if (!baseVisual) {
        throw new AppError('No base visual found. Generate one first.', 400, 'INVALID_STATE');
      }

      // Apply deltas to get new params
      const newVisualParams = visualService.applyReframeDeltas(
        baseVisual.visual_params,
        parameter_deltas
      );

      // Get metaphor with hopeful adjustment
      let metaphor = session.metaphor || 'A moment of reflection';
      if (parameter_deltas.light_level > 0 || parameter_deltas.warmth > 0) {
        metaphor += ' with a sense of hope emerging';
      }
      if (parameter_deltas.openness > 0) {
        metaphor += ', expanding into possibility';
      }

      // Build new FIBO JSON
      const newFiboJson = visualService.buildFiboJson(newVisualParams, metaphor);

      // Generate new image
      const imageUrl = await visualService.generateImage(newFiboJson);

      // Save reframed visual
      const visual = await sessionService.saveVisual(
        session_id,
        imageUrl,
        'reframed',
        newVisualParams,
        newFiboJson,
        variant_name
      );

      res.status(201).json({
        success: true,
        data: {
          visual_id: visual.id,
          session_id,
          image_url: imageUrl,
          image_type: 'reframed',
          variant_name,
          visual_params: newVisualParams,
          parameter_deltas,
          generated_at: visual.generated_at
        },
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/v1/visual/:id
   * Get visual by ID
   */
  async getVisual(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      // For now, get all visuals and find the one
      // In production, would have a direct query
      const allVisuals = await sessionService.getVisuals(id);
      
      res.json({
        success: true,
        data: allVisuals,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/v1/session/:id/visuals
   * Get all visuals for a session
   */
  async getSessionVisuals(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      const visuals = await sessionService.getVisuals(id);

      res.json({
        success: true,
        data: {
          visuals,
          total: visuals.length
        },
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      next(error);
    }
  }
};

