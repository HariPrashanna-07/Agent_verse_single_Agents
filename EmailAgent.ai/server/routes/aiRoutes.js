import express from 'express';
import { generateReplyDraft, getAnalysisHistory, deleteAnalysisHistory } from '../controllers/aiController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/generate-reply', protect, generateReplyDraft);
router.get('/history', protect, getAnalysisHistory);
router.delete('/history/:id', protect, deleteAnalysisHistory);

export default router;
