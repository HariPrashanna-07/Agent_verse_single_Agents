import mongoose from 'mongoose';

const emailSchema = new mongoose.Schema(
  {
    gmailMessageId: { type: String, required: true, index: true },
    threadId: { type: String, required: true, index: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    subject: { type: String, default: '(No Subject)' },
    sender: {
      name: { type: String, default: '' },
      email: { type: String, required: true },
    },
    recipient: {
      name: { type: String, default: '' },
      email: { type: String, default: '' },
    },
    snippet: { type: String, default: '' },
    bodyPreview: { type: String, default: '' },
    bodyFetched: { type: Boolean, default: false },
    body: { type: String, default: '' },
    date: { type: Date, required: true, index: true },
    labels: [{ type: String }],
    attachments: [
      {
        filename: { type: String },
        mimeType: { type: String },
        size: { type: Number },
      },
    ],
    isRead: { type: Boolean, default: false },
    hasAttachments: { type: Boolean, default: false },
    aiStatus: {
      type: String,
      enum: ['NOT_ANALYZED', 'ANALYZING', 'ANALYZED', 'FAILED'],
      default: 'NOT_ANALYZED',
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

emailSchema.index({ userId: 1, gmailMessageId: 1 }, { unique: true });

export const Email = mongoose.models.Email || mongoose.model('Email', emailSchema);
