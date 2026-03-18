import express from 'express';
import { getAiRecommendation, getAiLogs } from '../controllers/aiController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/chat', getAiRecommendation);
router.get('/logs', protect, getAiLogs);

export default router;
