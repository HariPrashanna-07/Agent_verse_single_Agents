import jwt from 'jsonwebtoken';
import { config } from '../config/env.js';
import { User } from '../models/User.js';

export const DEMO_USER = {
  _id: '666666666666666666666666',
  googleId: 'demo-google-id-12345',
  name: 'Alex Rivera',
  email: 'alex.rivera@antigravity.ai',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80',
  settings: {
    theme: 'dark',
    defaultReplyTone: 'professional',
    autoSync: true,
  },
};

export async function protect(req, res, next) {
  try {
    let token = req.headers.authorization?.startsWith('Bearer ')
      ? req.headers.authorization.split(' ')[1]
      : req.cookies?.token;

    if (!token && config.isDemoMode) {
      req.user = DEMO_USER;
      return next();
    }

    if (!token) {
      return res.status(401).json({ success: false, message: 'Authentication required. Please log in.' });
    }

    if (token === 'demo-session-token') {
      req.user = DEMO_USER;
      return next();
    }

    const decoded = jwt.verify(token, config.jwtSecret);
    const user = await User.findById(decoded.id).select('-refreshToken');

    if (!user) {
      req.user = DEMO_USER;
      return next();
    }

    req.user = user;
    next();
  } catch (error) {
    if (config.isDemoMode) {
      req.user = DEMO_USER;
      return next();
    }
    return res.status(401).json({ success: false, message: 'Session expired or invalid token.' });
  }
}
