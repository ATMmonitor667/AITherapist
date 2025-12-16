// History Routes

import { Router } from 'express';
import { getHistory, getSession } from '../controllers/history.controller';
import { visualController } from '../controllers';

const router = Router();

// GET /api/history - Get session history
router.get('/', getHistory);

// GET /api/history/:id - Get single session
router.get('/:id', getSession);

// Note: getStats and getSessionAnalytics are not yet implemented
// Uncomment when implemented:
// router.get('/stats', getStats);
// router.get('/:id/analytics', getSessionAnalytics);

// GET /api/history/:id/visuals - Get session visuals
router.get('/:id/visuals', visualController.getSessionVisuals);

export default router;
