import { GoogleGenerativeAI } from '@google/generative-ai';
import { config } from '../../config/env.js';
import { PromptBuilder } from './promptBuilder.js';
import { ResponseParser } from './responseParser.js';

export async function generateCustomReplyWithGemini(email, tone = 'professional', customInstructions = '') {
  const senderName = email.sender?.name || email.sender?.email || 'there';
  const subject = email.subject || 'your email';

  const toneResponses = {
    professional: `Hi ${senderName},\n\nThank you for your email regarding "${subject}". I have reviewed the details and will follow up shortly.\n\nBest regards,`,
    friendly: `Hey ${senderName}!\n\nThanks for reaching out about "${subject}". Excited to connect!\n\nCheers,`,
    formal: `Dear ${senderName},\n\nI acknowledge receipt of your email regarding "${subject}". The details are currently under review.\n\nSincerely,`,
    short: `Hi ${senderName}, got your email regarding "${subject}". Thanks!`,
    detailed: `Hi ${senderName},\n\nThank you for reaching out regarding "${subject}". I have noted all your key points and action items. I am reviewing the deliverables now and will send a complete update shortly.\n\nBest regards,`,
  };

  if (!config.gemini.apiKey) {
    return {
      replyDraft: toneResponses[tone] || toneResponses.professional,
      tone,
      customInstructions,
    };
  }

  try {
    const genAI = new GoogleGenerativeAI(config.gemini.apiKey);
    const model = genAI.getGenerativeModel({ model: config.gemini.model || 'gemini-1.5-flash' });
    const prompt = PromptBuilder.buildReplyPrompt(email, tone, customInstructions);

    const response = await model.generateContent(prompt);
    const parsed = ResponseParser.parseAndCleanJSON(response.response.text());

    return {
      replyDraft: parsed.replyDraft || toneResponses[tone] || toneResponses.professional,
      tone,
      customInstructions,
    };
  } catch (error) {
    console.error('[GenerateReply] Error generating reply:', error.message);
    return {
      replyDraft: toneResponses[tone] || toneResponses.professional,
      tone,
      customInstructions,
    };
  }
}
