import express from 'express';
import {
  getGoogleAuthUrl,
  googleCallback,
  demoLogin,
  getCurrentUser,
  updateUserSettings,
  logout,
} from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/google', getGoogleAuthUrl);
router.get('/google/callback', googleCallback);
router.post('/demo-login', demoLogin);
router.get('/me', protect, getCurrentUser);
router.put('/settings', protect, updateUserSettings);
router.post('/logout', logout);

export default router;
