// Session Controller - Handle session-related API requests

import { Request, Response, NextFunction } from 'express';
import { sessionService, conversationService, analyticsService, visualService } from '../services';
import { AppError } from '../middleware/errorHandler';

export const sessionController = {
  /**
   * POST /api/v1/session/start
   * Create a new reflection session
   */
  async startSession(req: Request, res: Response, next: NextFunction) {
    try {
      // Get user ID from authenticated request (set by requireAuth middleware)
      const user = (req as any).user;
      const userId = user?.id;

      if (!userId) {
        throw new AppError('User not authenticated', 401, 'UNAUTHORIZED');
      }

      console.log('[Session Controller] Creating session for user:', user.email);

      const session = await sessionService.createSession(userId);

      if (!session) {
        throw new AppError('Failed to create session', 500, 'INTERNAL_ERROR');
      }

      console.log('[Session Controller] Session created:', session.id);

      res.status(201).json({
        success: true,
        data: session,  // Return entire session object
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('[Session Controller] Error:', error);
      next(error);
    }
  },

  /**
   * GET /api/v1/session/:id
   * Get session details
   */
  async getSession(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      const session = await sessionService.getSession(id);

      if (!session) {
        throw new AppError('Session not found', 404, 'NOT_FOUND');
      }

      res.json({
        success: true,
        data: session,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * POST /api/v1/session/:id/message
   * Send a message in the conversation
   */
  async sendMessage(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { text } = req.body;

      if (!text || text.trim().length === 0) {
        throw new AppError('Message text is required', 400, 'VALIDATION_ERROR');
      }

      // Check if session exists
      const session = await sessionService.getSession(id);
      if (!session) {
        throw new AppError('Session not found', 404, 'NOT_FOUND');
      }

      // Check for crisis content
      const crisisCheck = conversationService.checkCrisis(text);

      // Analyze emotions in user message
      const emotionSnapshot = analyticsService.analyzeEmotions(text);
      console.log(`[Session] Emotion detected: ${emotionSnapshot.primary_emotion} (intensity: ${emotionSnapshot.intensity})`);

      // Generate visual based on emotion
      let imageUrl = session.original_image_url;
      try {
        // Convert emotion snapshot to emotion vector format
        const emotionVector: Record<string, number> = {
          [emotionSnapshot.primary_emotion]: emotionSnapshot.intensity
        };
        if (emotionSnapshot.secondary_emotion) {
          emotionVector[emotionSnapshot.secondary_emotion] = emotionSnapshot.intensity * 0.5;
        }
        
        const visualParams = visualService.emotionsToVisualParams(emotionVector);
        const metaphor = `A moment of ${emotionSnapshot.primary_emotion}`;
        const fiboJson = visualService.buildFiboJson(visualParams, metaphor);
        
        console.log(`[Session] Generating visual for emotion: ${emotionSnapshot.primary_emotion}`);
        imageUrl = await visualService.generateImage(fiboJson, emotionSnapshot.primary_emotion);
        console.log(`[Session] Visual generated: ${imageUrl}`);
        
        // Update session with new image
        await sessionService.updateSessionImage(id, imageUrl, visualParams);
      } catch (visualError) {
        console.error('[Session] Visual generation failed:', visualError);
        // Continue without visual - don't fail the message
      }

      // Save user message
      const userMessage = await sessionService.addMessage(id, 'user', text, emotionSnapshot);

      // Generate AI response
      let aiResponseText: string;
      if (crisisCheck.isCrisis) {
        aiResponseText = conversationService.getCrisisResponse();
      } else {
        const messages = await sessionService.getMessages(id);
        aiResponseText = await conversationService.generateResponse(text, messages);
      }

      // Save AI message
      const assistantMessage = await sessionService.addMessage(id, 'assistant', aiResponseText);

      // Get updated session with image URL
      const updatedSession = await sessionService.getSession(id);

      res.status(201).json({
        success: true,
        data: {
          user_message: userMessage,
          assistant_message: assistantMessage,
          emotion_snapshot: emotionSnapshot,
          crisis_check: crisisCheck.isCrisis ? {
            is_crisis: true,
            keywords: crisisCheck.keywords
          } : null,
          session: updatedSession  // Include updated session with image URL
        },
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/v1/session/:id/messages
   * Get all messages for a session
   */
  async getMessages(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const limit = parseInt(req.query.limit as string) || 100;
      const offset = parseInt(req.query.offset as string) || 0;

      const messages = await sessionService.getMessages(id, limit, offset);

      res.json({
        success: true,
        data: {
          messages,
          total: messages.length,
          limit,
          offset
        },
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * POST /api/v1/session/:id/end
   * End session and generate summary
   */
  async endSession(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      const session = await sessionService.getSession(id);
      if (!session) {
        throw new AppError('Session not found', 404, 'NOT_FOUND');
      }

      // Check if session already has an ended_at timestamp
      if (session.ended_at) {
        throw new AppError('Session already completed', 400, 'INVALID_STATE');
      }

      // Get all messages
      const messages = await sessionService.getMessages(id);

      if (messages.length === 0) {
        throw new AppError('No messages in session', 400, 'INVALID_STATE');
      }

      // Generate summary
      const summary = await conversationService.generateSummary(messages);

      // Aggregate emotions
      const emotionSnapshots = messages
        .filter((m: any) => m.role === 'user' && m.emotion_snapshot)
        .map((m: any) => m.emotion_snapshot!);

      const aggregatedEmotions = analyticsService.aggregateEmotions(emotionSnapshots);

      // Update session
      const updatedSession = await sessionService.completeSession(id, summary, aggregatedEmotions);

      res.json({
        success: true,
        data: {
          session_id: id,
          status: 'completed',
          summary,
          emotion_vector: aggregatedEmotions,
          ended_at: new Date().toISOString()
        },
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      next(error);
    }
  }
};

