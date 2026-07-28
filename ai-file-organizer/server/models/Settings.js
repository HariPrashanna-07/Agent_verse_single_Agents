const mongoose = require('mongoose');

const SettingsSchema = new mongoose.Schema({
  ignoredExtensions: [{ type: String, default: ['.tmp', '.log', '.ds_store', '.sys'] }],
  aiStrictness: { type: String, enum: ['flexible', 'balanced', 'strict'], default: 'balanced' },
  duplicateDetectionMode: { type: String, enum: ['hash-only', 'hash-and-ai'], default: 'hash-and-ai' },
  theme: { type: String, enum: ['dark', 'light'], default: 'dark' }
}, { timestamps: true });

module.exports = mongoose.model('Settings', SettingsSchema);
