import express from 'express';
import { endSession, getHistory } from '../controllers/sessionController.js';
import { optionalAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/end', optionalAuth, endSession);
router.get('/history/:userId', getHistory);

export default router;
