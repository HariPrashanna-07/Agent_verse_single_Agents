import { google } from 'googleapis';
import jwt from 'jsonwebtoken';
import { config } from '../config/env.js';
import { User } from '../models/User.js';
import { GmailService } from '../services/gmail/gmailService.js';
import { DEMO_USER } from '../middleware/authMiddleware.js';

export async function getGoogleAuthUrl(req, res) {
  try {
    if (config.isDemoMode) {
      const url = `${config.clientUrl}/login?demo=true`;
      if (req.headers.accept?.includes('text/html') || req.query.redirect === 'true') {
        return res.redirect(url);
      }
      return res.json({ success: true, url });
    }
    const url = GmailService.getAuthUrl();
    if (req.headers.accept?.includes('text/html') || req.query.redirect === 'true') {
      return res.redirect(url);
    }
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
    const oauth2Client = GmailService.getOAuthClient();
    oauth2Client.setCredentials(tokens);

    const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
    const { data: profile } = await oauth2.userinfo.get();

    let user;
    try {
      user = await User.findOne({ googleId: profile.id });
      if (!user) {
        user = await User.create({
          googleId: profile.id,
          name: profile.name || 'Gmail User',
          email: profile.email,
          avatar: profile.picture || '',
          refreshToken: tokens.refresh_token,
          accessToken: tokens.access_token,
          tokenExpiry: tokens.expiry_date ? new Date(tokens.expiry_date) : new Date(Date.now() + 3600 * 1000),
        });
      } else {
        user.accessToken = tokens.access_token;
        if (tokens.refresh_token) user.refreshToken = tokens.refresh_token;
        if (tokens.expiry_date) user.tokenExpiry = new Date(tokens.expiry_date);
        await user.save();
      }
    } catch (dbErr) {
      console.warn('[GoogleCallback] DB warning, using live user object:', dbErr.message);
      user = {
        _id: '666666666666666666666666',
        googleId: profile.id,
        name: profile.name || 'Gmail User',
        email: profile.email,
        avatar: profile.picture || '',
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
      };
    }

    const userIdStr = user._id ? user._id.toString() : '666666666666666666666666';
    const token = jwt.sign({ id: userIdStr }, config.jwtSecret, { expiresIn: '7d' });

    res.cookie('token', token, {
      httpOnly: true,
      secure: config.nodeEnv === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.redirect(`${config.clientUrl}/dashboard?token=${token}`);
  } catch (error) {
    console.error('[GoogleCallback] OAuth login error:', error.message);
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
