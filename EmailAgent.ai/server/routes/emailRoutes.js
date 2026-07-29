import express from 'express';
import {
  getEmails,
  getEmailById,
  syncInbox,
  analyzeEmailController as analyzeEmail,
  batchAnalyzeEmails,
  getQueueProgress,
  searchEmailsNaturalLanguage,
} from '../controllers/emailController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', protect, getEmails);
router.post('/sync', protect, syncInbox);
router.post('/batch-analyze', protect, batchAnalyzeEmails);
router.get('/queue-progress', protect, getQueueProgress);
router.post('/search-nl', protect, searchEmailsNaturalLanguage);
router.get('/:id', protect, getEmailById);
router.post('/:id/analyze', protect, analyzeEmail);

export default router;
