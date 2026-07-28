import mongoose from 'mongoose';
import { config } from '../config/env.js';
import { Email } from '../models/Email.js';
import { AIAnalysis } from '../models/AIAnalysis.js';
import { MOCK_EMAILS, MOCK_ANALYSES } from '../utils/demoData.js';
import { SyncService } from '../services/sync/syncService.js';
import { analyzeEmailWithGemini } from '../services/gemini/analyzeEmail.js';
import { parseSearchIntentWithGemini } from '../services/gemini/searchIntent.js';
import { analysisQueue } from '../services/queue/analysisQueue.js';

export async function getEmails(req, res) {
  try {
    const { category, urgency, status, search, page = 1, limit = 20 } = req.query;

    let emails = await Email.find({ userId: req.user._id }).sort({ date: -1 });

    if (emails.length === 0 && config.isDemoMode) {
      emails = MOCK_EMAILS;
    }

    // Apply Client/Query filters
    if (status) {
      emails = emails.filter((e) => e.aiStatus === status);
    }
    if (search) {
      const q = search.toLowerCase();
      emails = emails.filter(
        (e) =>
          e.subject.toLowerCase().includes(q) ||
          e.sender.name.toLowerCase().includes(q) ||
          e.sender.email.toLowerCase().includes(q) ||
          e.snippet.toLowerCase().includes(q)
      );
    }

    res.json({
      success: true,
      count: emails.length,
      page: Number(page),
      emails,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function getEmailById(req, res) {
  try {
    const { id } = req.params;

    let email = null;
    if (id && mongoose.Types.ObjectId.isValid(id)) {
      email = await Email.findById(id);
    }
    if (!email) {
      email = MOCK_EMAILS.find((e) => e._id === id || e.gmailMessageId === id);
    }

    if (!email) {
      return res.status(404).json({ success: false, message: 'Email not found' });
    }

    let analyses = [];
    if (mongoose.Types.ObjectId.isValid(email._id)) {
      analyses = await AIAnalysis.find({ emailId: email._id, userId: req.user._id }).sort({ createdAt: -1 });
    }

    if (analyses.length === 0 && MOCK_ANALYSES[email._id]) {
      analyses = [MOCK_ANALYSES[email._id]];
    }

    res.json({
      success: true,
      email,
      analysis: analyses[0] || null,
      history: analyses,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function syncInbox(req, res) {
  try {
    const result = await SyncService.syncUserInbox(req.user);
    res.json({ success: true, ...result, syncState: SyncService.getSyncState() });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function analyzeEmail(req, res) {
  try {
    const { id } = req.params;
    let email = null;
    if (id && mongoose.Types.ObjectId.isValid(id)) {
      email = await Email.findById(id);
    }

    if (!email) {
      email = MOCK_EMAILS.find((e) => e._id === id || e.gmailMessageId === id) || {
        _id: id,
        subject: 'Email Message',
        sender: { name: 'Sender', email: 'sender@example.com' },
        snippet: '',
        body: '',
      };
    }

    if (mongoose.Types.ObjectId.isValid(email._id)) {
      await Email.findByIdAndUpdate(email._id, { aiStatus: 'ANALYZING' });
    }

    const analysisResult = await analyzeEmailWithGemini(email);

    let savedAnalysis;
    try {
      if (mongoose.Types.ObjectId.isValid(email._id) && mongoose.Types.ObjectId.isValid(req.user._id)) {
        savedAnalysis = await AIAnalysis.create({
          ...analysisResult,
          emailId: email._id,
          userId: req.user._id,
        });
        await Email.findByIdAndUpdate(email._id, { aiStatus: 'ANALYZED' });
      } else {
        savedAnalysis = { ...analysisResult, _id: `analysis_sim_${Date.now()}` };
      }
    } catch (dbErr) {
      savedAnalysis = { ...analysisResult, _id: `analysis_sim_${Date.now()}` };
    }

    res.json({
      success: true,
      analysis: savedAnalysis,
      message: 'Email successfully analyzed by Gemini AI',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function batchAnalyzeEmails(req, res) {
  try {
    const { emailIds } = req.body;
    if (!Array.isArray(emailIds) || emailIds.length === 0) {
      return res.status(400).json({ success: false, message: 'Please provide an array of email IDs to analyze.' });
    }

    const result = await analysisQueue.enqueueBatch(emailIds, req.user._id);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function getQueueProgress(req, res) {
  res.json({ success: true, progress: analysisQueue.getProgress() });
}

export async function searchEmailsNaturalLanguage(req, res) {
  try {
    const { query } = req.body;
    if (!query) {
      return res.status(400).json({ success: false, message: 'Query string is required' });
    }

    const intent = await parseSearchIntentWithGemini(query);

    let emails = MOCK_EMAILS;
    if (intent.category && intent.category !== 'All') {
      emails = emails.filter((e) => MOCK_ANALYSES[e._id]?.category === intent.category);
    }
    if (intent.urgency && intent.urgency !== 'All') {
      emails = emails.filter((e) => MOCK_ANALYSES[e._id]?.urgency === intent.urgency);
    }

    res.json({
      success: true,
      query,
      intent,
      results: emails.map((e) => ({
        ...e,
        analysis: MOCK_ANALYSES[e._id] || null,
      })),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}
