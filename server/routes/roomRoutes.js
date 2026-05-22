import express from 'express';
import { getRoomCount } from '../controllers/roomController.js';

const router = express.Router();

router.get('/count/:role', getRoomCount);

export default router;
