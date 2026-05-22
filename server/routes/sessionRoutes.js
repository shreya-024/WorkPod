import express from 'express';
import { endSession, getHistory } from '../controllers/sessionController.js';
import { optionalAuth, requireAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/end', optionalAuth, endSession);
router.get('/history', requireAuth, getHistory);

export default router;
