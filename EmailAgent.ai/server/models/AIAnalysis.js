import mongoose from 'mongoose';

const aiAnalysisSchema = new mongoose.Schema(
  {
    emailId: { type: mongoose.Schema.Types.ObjectId, ref: 'Email', required: true, index: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    analysisVersion: { type: Number, default: 1 },
    summary: {
      short: { type: String, required: true },
      detailed: { type: String, required: true },
    },
    category: {
      type: String,
      enum: ['Work', 'Finance', 'Education', 'Personal', 'Shopping', 'Travel', 'Health', 'Social', 'Promotions', 'Other'],
      default: 'Work',
    },
    urgency: {
      type: String,
      enum: ['Urgent', 'Medium', 'Low'],
      default: 'Low',
    },
    sentiment: {
      type: String,
      enum: ['Positive', 'Neutral', 'Negative', 'Mixed'],
      default: 'Neutral',
    },
    tasks: [
      {
        task: { type: String, required: true },
        deadline: { type: String, default: 'None' },
        status: { type: String, enum: ['pending', 'completed'], default: 'pending' },
      },
    ],
    deadlines: [
      {
        description: { type: String, required: true },
        date: { type: String, required: true },
        time: { type: String, default: '11:59 PM' },
      },
    ],
    replyDrafts: {
      professional: { type: String, default: '' },
      friendly: { type: String, default: '' },
      formal: { type: String, default: '' },
      short: { type: String, default: '' },
      detailed: { type: String, default: '' },
    },
    keywords: [{ type: String }],
    confidence: { type: Number, default: 0.92 },
    tokensUsed: { type: Number, default: 0 },
    processingTime: { type: Number, default: 0 }, // in milliseconds
    estimatedCost: { type: Number, default: 0.0001 }, // in USD
  },
  {
    timestamps: true,
  }
);

export const AIAnalysis = mongoose.models.AIAnalysis || mongoose.model('AIAnalysis', aiAnalysisSchema);
