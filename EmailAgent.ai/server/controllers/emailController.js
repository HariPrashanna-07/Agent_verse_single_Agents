import mongoose from 'mongoose';
import { config } from '../config/env.js';
import { Email } from '../models/Email.js';
import { AIAnalysis } from '../models/AIAnalysis.js';
import { MOCK_EMAILS, MOCK_ANALYSES } from '../utils/demoData.js';
import { SyncService } from '../services/sync/syncService.js';
import { analyzeEmail } from '../services/ai/analyzeEmail.js';
import { parseSearchIntent } from '../services/ai/searchIntent.js';
import { analysisQueue } from '../services/queue/analysisQueue.js';

export async function getEmails(req, res) {
  try {
    const { category, urgency, status, search, page = 1, limit = 20 } = req.query;

    let emails = await Email.find({ userId: req.user._id }).sort({ date: -1 });

    if (emails.length === 0 && config.isDemoMode) {
      emails = MOCK_EMAILS;
    }

    const analyses = await AIAnalysis.find({ userId: req.user._id });
    const analysisMap = new Map();
    analyses.forEach((a) => {
      if (a.emailId) analysisMap.set(a.emailId.toString(), a);
    });

    let emailsWithAnalysis = emails.map((e) => {
      const obj = e.toObject ? e.toObject() : e;
      const analysis = analysisMap.get(obj._id.toString()) || MOCK_ANALYSES[obj._id] || null;
      const isAnalyzed = !!analysis || obj.aiStatus === 'ANALYZED';

      return {
        ...obj,
        aiStatus: isAnalyzed ? 'ANALYZED' : (obj.aiStatus || 'NOT_ANALYZED'),
        analysis: analysis ? {
          category: analysis.category,
          urgency: analysis.urgency,
          sentiment: analysis.sentiment,
          summaryShort: analysis.summary?.short,
        } : null,
      };
    });

    // Apply Client/Query filters
    if (status && status !== 'All') {
      emailsWithAnalysis = emailsWithAnalysis.filter((e) => e.aiStatus === status);
    }
    if (category && category !== 'All') {
      emailsWithAnalysis = emailsWithAnalysis.filter((e) => e.analysis?.category === category);
    }
    if (urgency && urgency !== 'All') {
      emailsWithAnalysis = emailsWithAnalysis.filter((e) => e.analysis?.urgency === urgency);
    }
    if (search) {
      const q = search.toLowerCase();
      emailsWithAnalysis = emailsWithAnalysis.filter(
        (e) =>
          e.subject.toLowerCase().includes(q) ||
          e.sender.name.toLowerCase().includes(q) ||
          e.sender.email.toLowerCase().includes(q) ||
          e.snippet.toLowerCase().includes(q)
      );
    }

    res.json({
      success: true,
      count: emailsWithAnalysis.length,
      page: Number(page),
      emails: emailsWithAnalysis,
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

    // Automatically mark email as read in MongoDB when viewed
    if (!email.isRead && mongoose.Types.ObjectId.isValid(email._id)) {
      await Email.findByIdAndUpdate(email._id, { isRead: true });
      email.isRead = true;
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

export async function analyzeEmailController(req, res) {
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

    const analysisResult = await analyzeEmail(email);

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
      message: 'Email successfully analyzed by AI Service',
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
    if (!query || !query.trim()) {
      return res.status(400).json({ success: false, message: 'Query string is required' });
    }

    const intent = await parseSearchIntent(query);

    let userEmails = await Email.find({ userId: req.user._id }).sort({ date: -1 });

    if (userEmails.length === 0 && config.isDemoMode) {
      userEmails = MOCK_EMAILS;
    }

    const analyses = await AIAnalysis.find({ userId: req.user._id });
    const analysisMap = new Map();
    analyses.forEach((a) => {
      if (a.emailId) analysisMap.set(a.emailId.toString(), a);
    });

    const keywords = intent.keywords?.length ? intent.keywords : query.toLowerCase().split(/\s+/).filter((w) => w.length > 2);

    const scoredResults = userEmails.map((email) => {
      const emailAnalysis = analysisMap.get(email._id.toString()) || MOCK_ANALYSES[email._id] || null;
      let score = 0;

      const subject = (email.subject || '').toLowerCase();
      const senderName = (email.sender?.name || '').toLowerCase();
      const senderEmail = (email.sender?.email || '').toLowerCase();
      const snippet = (email.snippet || email.bodyPreview || '').toLowerCase();
      const body = (email.body || '').toLowerCase();
      const category = (emailAnalysis?.category || '').toLowerCase();
      const urgency = (emailAnalysis?.urgency || '').toLowerCase();
      const summaryShort = (emailAnalysis?.summary?.short || '').toLowerCase();
      const aiKeywords = (emailAnalysis?.keywords || []).map((k) => k.toLowerCase()).join(' ');

      // 1. Keyword Matching Across All Fields
      keywords.forEach((term) => {
        const t = term.toLowerCase();
        if (subject.includes(t)) score += 15;
        if (senderName.includes(t)) score += 12;
        if (senderEmail.includes(t)) score += 12;
        if (snippet.includes(t)) score += 8;
        if (body.includes(t)) score += 5;
        if (summaryShort.includes(t)) score += 6;
        if (aiKeywords.includes(t)) score += 6;
      });

      // 2. Intent Category Soft Boost
      if (intent.category && intent.category !== 'All') {
        if (category === intent.category.toLowerCase()) {
          score += 10;
        }
      }

      // 3. Intent Urgency Soft Boost
      if (intent.urgency && intent.urgency !== 'All') {
        if (urgency === intent.urgency.toLowerCase()) {
          score += 8;
        }
      }

      // 4. Attachments Match
      if (intent.hasAttachments && email.hasAttachments) {
        score += 5;
      }

      return {
        email,
        analysis: emailAnalysis,
        score,
      };
    });

    let finalResults = scoredResults.filter((item) => item.score > 0).sort((a, b) => b.score - a.score);

    if (finalResults.length === 0) {
      const qLower = query.toLowerCase();
      finalResults = userEmails
        .map((email) => {
          const text = `${email.subject} ${email.sender?.name || ''} ${email.sender?.email || ''} ${email.snippet || ''}`.toLowerCase();
          const match = text.includes(qLower) || keywords.some((k) => text.includes(k));
          return { email, analysis: analysisMap.get(email._id.toString()) || null, score: match ? 1 : 0 };
        })
        .filter((item) => item.score > 0);
    }

    res.json({
      success: true,
      query,
      intent,
      results: finalResults.map((item) => ({
        ...(item.email.toObject ? item.email.toObject() : item.email),
        analysis: item.analysis,
        relevanceScore: item.score,
      })),
    });
  } catch (error) {
    console.error('[SearchNL] Error performing search:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
}
