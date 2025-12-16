// Session Routes

import { Router } from 'express';
import { sessionController } from '../controllers';
import { requireAuth } from '../middleware/auth.middleware';

const router = Router();

// POST /api/v1/session/start - Create new session
router.post('/start', requireAuth, sessionController.startSession);

// GET /api/v1/session/:id - Get session details
router.get('/:id', requireAuth, sessionController.getSession);

// POST /api/v1/session/:id/message - Send message
router.post('/:id/message', requireAuth, sessionController.sendMessage);

// GET /api/v1/session/:id/messages - Get messages
router.get('/:id/messages', requireAuth, sessionController.getMessages);

// POST /api/v1/session/:id/end - End session
router.post('/:id/end', requireAuth, sessionController.endSession);

export default router;

