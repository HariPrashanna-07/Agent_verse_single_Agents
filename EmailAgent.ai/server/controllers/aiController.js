import mongoose from 'mongoose';
import { generateCustomReplyWithGemini } from '../services/gemini/generateReply.js';
import { Email } from '../models/Email.js';
import { AIAnalysis } from '../models/AIAnalysis.js';
import { MOCK_EMAILS, MOCK_ANALYSES } from '../utils/demoData.js';

export async function generateReplyDraft(req, res) {
  try {
    const { emailId, tone = 'professional', customInstructions = '' } = req.body;

    let email = null;
    if (emailId && mongoose.Types.ObjectId.isValid(emailId)) {
      email = await Email.findById(emailId);
    }

    if (!email) {
      email = MOCK_EMAILS.find((e) => e._id === emailId || e.gmailMessageId === emailId) || {
        _id: emailId || 'email_default',
        subject: 'General Request',
        sender: { name: 'Recipient', email: 'recipient@example.com' },
        snippet: customInstructions || 'General message',
        body: customInstructions || 'General message content',
      };
    }

    const reply = await generateCustomReplyWithGemini(email, tone, customInstructions);

    res.json({
      success: true,
      emailId: email._id,
      ...reply,
    });
  } catch (error) {
    console.error('[GenerateReplyDraft] Error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function getAnalysisHistory(req, res) {
  try {
    let analyses = await AIAnalysis.find({ userId: req.user._id })
      .populate('emailId')
      .sort({ createdAt: -1 });

    if (analyses.length === 0) {
      analyses = Object.values(MOCK_ANALYSES).map((a) => ({
        ...a,
        email: MOCK_EMAILS.find((e) => e._id === a.emailId),
      }));
    }

    res.json({
      success: true,
      count: analyses.length,
      history: analyses,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function deleteAnalysisHistory(req, res) {
  try {
    const { id } = req.params;
    if (mongoose.Types.ObjectId.isValid(id)) {
      await AIAnalysis.findByIdAndDelete(id);
    }
    res.json({ success: true, message: 'Analysis history deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}
