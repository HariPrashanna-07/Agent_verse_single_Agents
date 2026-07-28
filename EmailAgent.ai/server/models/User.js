import mongoose from 'mongoose';
import { encrypt, decrypt } from '../utils/crypto.js';

const userSchema = new mongoose.Schema(
  {
    googleId: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, index: true },
    avatar: { type: String, default: '' },
    refreshToken: {
      type: String,
      set: (token) => (token ? encrypt(token) : token),
      get: (encrypted) => (encrypted ? decrypt(encrypted) : encrypted),
    },
    accessToken: { type: String },
    tokenExpiry: { type: Date },
    settings: {
      theme: { type: String, enum: ['dark', 'light'], default: 'dark' },
      defaultReplyTone: {
        type: String,
        enum: ['professional', 'friendly', 'formal', 'short', 'detailed'],
        default: 'professional',
      },
      autoSync: { type: Boolean, default: true },
    },
  },
  {
    timestamps: true,
    toJSON: { getters: true },
    toObject: { getters: true },
  }
);

export const User = mongoose.models.User || mongoose.model('User', userSchema);
