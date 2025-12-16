// Visual Routes

import { Router } from 'express';
import { visualController } from '../controllers';

const router = Router();

// POST /api/v1/visual/generate - Generate base visual
router.post('/generate', visualController.generateVisual);

// POST /api/v1/visual/update - Generate reframed visual
router.post('/update', visualController.updateVisual);

// GET /api/v1/visual/:id - Get visual details
router.get('/:id', visualController.getVisual);

export default router;

