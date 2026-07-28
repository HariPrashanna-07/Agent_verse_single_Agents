import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  mongoUri: process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/ai_email_agent',
  jwtSecret: process.env.JWT_SECRET || 'super_secret_jwt_key_ai_email_agent_2026',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID || '',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    redirectUri: process.env.GOOGLE_REDIRECT_URI || 'http://localhost:5000/api/auth/google/callback',
  },
  gemini: {
    apiKey: process.env.GEMINI_API_KEY || '',
    model: process.env.GEMINI_MODEL || 'gemini-1.5-flash',
  },
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  isDemoMode: process.env.DEMO_MODE === 'true' || !process.env.GOOGLE_CLIENT_ID || !process.env.GEMINI_API_KEY,
};
