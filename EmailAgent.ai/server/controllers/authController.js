import jwt from 'jsonwebtoken';
import { config } from '../config/env.js';
import { User } from '../models/User.js';
import { GmailService } from '../services/gmail/gmailService.js';
import { DEMO_USER } from '../middleware/authMiddleware.js';

export async function getGoogleAuthUrl(req, res) {
  try {
    if (config.isDemoMode) {
      return res.json({ success: true, url: '/login?demo=true' });
    }
    const url = GmailService.getAuthUrl();
    res.json({ success: true, url });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function googleCallback(req, res) {
  try {
    const { code } = req.query;
    if (!code) {
      return res.redirect(`${config.clientUrl}/login?error=no_code`);
    }

    const tokens = await GmailService.getTokensFromCode(code);
    // In live mode, decode Google token or fetch profile
    const token = jwt.sign({ id: 'live-user-id' }, config.jwtSecret, { expiresIn: '7d' });

    res.cookie('token', token, {
      httpOnly: true,
      secure: config.nodeEnv === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.redirect(`${config.clientUrl}/dashboard`);
  } catch (error) {
    res.redirect(`${config.clientUrl}/login?error=oauth_failed`);
  }
}

export async function demoLogin(req, res) {
  try {
    const token = jwt.sign({ id: DEMO_USER._id }, config.jwtSecret, { expiresIn: '7d' });

    res.cookie('token', token, {
      httpOnly: true,
      secure: false,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.json({
      success: true,
      token,
      user: DEMO_USER,
      message: 'Demo session activated successfully!',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function getCurrentUser(req, res) {
  try {
    res.json({
      success: true,
      user: req.user || DEMO_USER,
      isDemoMode: config.isDemoMode,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function updateUserSettings(req, res) {
  try {
    const { settings } = req.body;
    if (req.user._id === DEMO_USER._id) {
      DEMO_USER.settings = { ...DEMO_USER.settings, ...settings };
      return res.json({ success: true, settings: DEMO_USER.settings });
    }

    const user = await User.findByIdAndUpdate(req.user._id, { settings }, { new: true });
    res.json({ success: true, settings: user.settings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function logout(req, res) {
  res.clearCookie('token');
  res.json({ success: true, message: 'Logged out successfully' });
}
