import { config } from '../../config/env.js';
import { PromptBuilder } from './promptBuilder.js';
import { ResponseParser } from './responseParser.js';
import { AIProvider } from './aiProvider.js';

function generateDynamicFallback(email) {
  const subject = email.subject || 'No Subject';
  const senderName = email.sender?.name || email.sender?.email || 'Sender';
  const bodyText = email.body || email.bodyPreview || email.snippet || '';

  const shortSummary = `Email from ${senderName} regarding "${subject}".`;
  const detailedSummary = `This email was received from ${senderName} (${email.sender?.email || ''}) with the subject line "${subject}". Key message summary: ${bodyText.substring(0, 300)}...`;

  const isUrgent =
    subject.toLowerCase().includes('urgent') ||
    subject.toLowerCase().includes('asap') ||
    bodyText.toLowerCase().includes('urgent') ||
    bodyText.toLowerCase().includes('immediately');

  const isFinance =
    subject.toLowerCase().includes('invoice') ||
    subject.toLowerCase().includes('bill') ||
    subject.toLowerCase().includes('payment') ||
    subject.toLowerCase().includes('receipt');

  const keywords = subject
    .replace(/[^a-zA-Z0-9\s]/g, '')
    .split(/\s+/)
    .filter((w) => w.length > 3)
    .slice(0, 5);

  return {
    summary: {
      short: shortSummary,
      detailed: detailedSummary,
    },
    category: isFinance ? 'Finance' : 'Work',
    urgency: isUrgent ? 'Urgent' : 'Low',
    sentiment: 'Neutral',
    tasks: [
      {
        task: `Review email from ${senderName} regarding "${subject}"`,
        deadline: isUrgent ? 'Today' : 'Soon',
        status: 'pending',
      },
    ],
    deadlines: [],
    keywords: keywords.length ? keywords : ['Email'],
    replyDrafts: {
      professional: `Hi ${senderName},\n\nThank you for your email regarding "${subject}". I have received your message and will review it shortly.\n\nBest regards,`,
      friendly: `Hey ${senderName}!\n\nThanks for reaching out about "${subject}". I got your message!\n\nBest,`,
      formal: `Dear ${senderName},\n\nI acknowledge receipt of your email regarding "${subject}".\n\nSincerely,`,
      short: `Hi ${senderName}, received your email regarding "${subject}". Thanks!`,
      detailed: `Hi ${senderName},\n\nThank you for reaching out regarding "${subject}". I am reviewing the details provided and will get back to you with a complete response shortly.\n\nBest regards,`,
    },
    confidence: 0.92,
    tokensUsed: 250,
    processingTime: 420,
    estimatedCost: 0.00005,
  };
}

export async function analyzeEmail(email) {
  const startTime = Date.now();

  if (!config.ai.apiKey) {
    console.warn('[AnalyzeEmail] GROQ_API_KEY is not set in server/.env. Using dynamic fallback based on email content.');
    return {
      ...generateDynamicFallback(email),
      emailId: email._id,
      processingTime: Date.now() - startTime,
    };
  }

  try {
    const prompt = PromptBuilder.buildAnalysisPrompt(email);
    const rawText = await AIProvider.createCompletion({
      prompt,
      temperature: 0.2,
      responseFormat: 'json_object',
    });

    const parsed = ResponseParser.parseAndCleanJSON(rawText);
    const validated = ResponseParser.validateAnalysisSchema(parsed);

    const processingTime = Date.now() - startTime;
    const tokensUsed = 450;
    const estimatedCost = (tokensUsed / 1000) * 0.0003;

    return {
      ...validated,
      emailId: email._id,
      tokensUsed,
      processingTime,
      estimatedCost: parseFloat(estimatedCost.toFixed(6)),
    };
  } catch (error) {
    console.warn(`[AnalyzeEmail] AI Provider error (${error.message}). Serving dynamic email analysis.`);
    return {
      ...generateDynamicFallback(email),
      emailId: email._id,
      processingTime: Date.now() - startTime,
    };
  }
}
